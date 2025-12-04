import type { ReliefParams, Tool } from '@mycnc/shared';

// Define message types
export interface ReliefWorkerMessage {
    type: 'generate';
    params: ReliefParams;
    toolLibrary: Tool[];
    imageBitmap?: ImageBitmap;
}

// Gaussian Blur Implementation
const gaussianBlur = (pixels: Uint8ClampedArray, width: number, height: number, radius: number) => {
    if (radius < 1) return pixels;

    const size = width * height;
    const channelCount = 4;
    const target = new Uint8ClampedArray(pixels.length);

    // Simple box blur approximation for performance, or true gaussian if needed.
    // Let's do a separable 1D convolution for true Gaussian.

    const sigma = radius;
    const kSize = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = new Float32Array(kSize);
    const half = Math.floor(kSize / 2);
    let sum = 0;

    for (let i = 0; i < kSize; i++) {
        const x = i - half;
        const val = Math.exp(-(x * x) / (2 * sigma * sigma));
        kernel[i] = val;
        sum += val;
    }
    for (let i = 0; i < kSize; i++) kernel[i] /= sum;

    // Horizontal Pass
    const temp = new Float32Array(pixels.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            for (let k = 0; k < kSize; k++) {
                const offset = k - half;
                const px = Math.min(width - 1, Math.max(0, x + offset));
                const idx = (y * width + px) * 4;
                const weight = kernel[k];
                r += pixels[idx] * weight;
                g += pixels[idx + 1] * weight;
                b += pixels[idx + 2] * weight;
            }
            const idx = (y * width + x) * 4;
            temp[idx] = r;
            temp[idx + 1] = g;
            temp[idx + 2] = b;
            temp[idx + 3] = pixels[idx + 3]; // Alpha copy
        }
    }

    // Vertical Pass
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let r = 0, g = 0, b = 0;
            for (let k = 0; k < kSize; k++) {
                const offset = k - half;
                const py = Math.min(height - 1, Math.max(0, y + offset));
                const idx = (py * width + x) * 4;
                const weight = kernel[k];
                r += temp[idx] * weight;
                g += temp[idx + 1] * weight;
                b += temp[idx + 2] * weight;
            }
            const idx = (y * width + x) * 4;
            target[idx] = r;
            target[idx + 1] = g;
            target[idx + 2] = b;
            target[idx + 3] = temp[idx + 3];
        }
    }

    return target;
};

self.onmessage = async (e: MessageEvent<ReliefWorkerMessage>) => {
    const { params, toolLibrary, imageBitmap } = e.data;

    if (e.data.type !== 'generate') return;

    try {
        console.log('Worker: Starting generation', { params });

        let bitmap: ImageBitmap;

        if (imageBitmap) {
            console.log('Worker: Using passed ImageBitmap');
            bitmap = imageBitmap;
        } else if (params.imageDataUrl) {
            // Fallback for older calls (though we updated the caller)
            console.log('Worker: Fetching image (legacy)...');
            const response = await fetch(params.imageDataUrl);
            const blob = await response.blob();
            bitmap = await createImageBitmap(blob);
        } else {
            self.postMessage({ type: 'error', error: 'No image data provided' });
            return;
        }

        console.log('Worker: Image loaded', bitmap.width, bitmap.height);

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!ctx) throw new Error('Failed to create offscreen context');

        // Limit resolution for performance (max 500px dimension)
        const MAX_RES = 500;
        let w = bitmap.width;
        let h = bitmap.height;
        if (w > MAX_RES || h > MAX_RES) {
            const ratio = w / h;
            if (w > h) { w = MAX_RES; h = MAX_RES / ratio; }
            else { h = MAX_RES; w = MAX_RES * ratio; }
        }
        canvas.width = Math.floor(w);
        canvas.height = Math.floor(h);

        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixels = imgData.data;

        // Apply Smoothing
        if (params.smoothing && params.smoothing > 0) {
            console.log('Worker: Applying smoothing', params.smoothing);
            pixels = gaussianBlur(pixels as any, canvas.width, canvas.height, params.smoothing);
        }

        const pixelWidth = canvas.width;
        const pixelHeight = canvas.height;
        const numericMaxDepth = parseFloat(String(params.maxDepth));
        const numericWidth = parseFloat(String(params.width));
        const numericLength = parseFloat(String(params.length));
        const numericZSafe = parseFloat(String(params.zSafe));

        const getZAt = (xPct: number, yPct: number) => {
            const clampedXPct = Math.max(0, Math.min(1, xPct));
            const clampedYPct = Math.max(0, Math.min(1, yPct));
            const px = Math.min(pixelWidth - 1, Math.floor(clampedXPct * (pixelWidth - 1)));
            const py = Math.min(pixelHeight - 1, Math.floor(clampedYPct * (pixelHeight - 1)));
            const idx = (py * pixelWidth + px) * 4;

            // Grayscale
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            let normalized = brightness / 255;

            // Contrast
            if (params.contrast !== 1.0) {
                normalized = (normalized - 0.5) * params.contrast + 0.5;
                normalized = Math.max(0, Math.min(1, normalized));
            }

            // Gamma
            if (params.gamma !== 1.0) {
                normalized = Math.pow(normalized, params.gamma);
                normalized = Math.max(0, Math.min(1, normalized));
            }

            // Invert logic
            // If invert is TRUE: Dark (0) -> High (0), Light (1) -> Low (MaxDepth)
            //   z = normalized * MaxDepth (since MaxDepth is negative, 1 becomes deep)
            // If invert is FALSE: Light (1) -> High (0), Dark (0) -> Low (MaxDepth)
            //   z = (1 - normalized) * MaxDepth

            return params.invert ? (normalized * numericMaxDepth) : ((1 - normalized) * numericMaxDepth);
        };

        const code: string[] = [`(--- Relief Carving ---)`, `(Operation: ${params.operation})`, `G21 G90`];
        const paths: any[] = [];

        // --- Roughing ---
        if ((params.operation === 'both' || params.operation === 'roughing') && params.roughingEnabled) {
            const tool = toolLibrary.find(t => t.id === params.roughingToolId);
            if (tool) {
                const toolDia = parseFloat(String(tool.diameter || 0));
                if (toolDia <= 0) throw new Error('Roughing tool diameter must be greater than 0');

                const stepdown = parseFloat(String(params.roughingStepdown));
                const stepover = parseFloat(String(params.roughingStepover));
                const stock = parseFloat(String(params.roughingStockToLeave));
                const feed = parseFloat(String(params.roughingFeed));
                const spindle = parseFloat(String(params.roughingSpindle));

                code.push(`(--- Roughing ---)`, `(Tool: ${tool.name})`, `M3 S${spindle}`, `G0 Z${numericZSafe}`);

                const stepoverDist = toolDia * (stepover / 100);
                if (stepoverDist <= 0) throw new Error('Invalid roughing stepover');

                let currentZ = 0;

                while (currentZ > numericMaxDepth + stock) {
                    currentZ -= stepdown;
                    if (currentZ < numericMaxDepth + stock) currentZ = numericMaxDepth + stock;

                    code.push(`(Roughing Level Z=${currentZ.toFixed(3)})`);
                    let y = 0;
                    let direction = 1;

                    while (y <= numericLength) {
                        const yPct = 1 - (y / numericLength);
                        const startX = (direction === 1) ? 0 : numericWidth;

                        code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
                        code.push(`G1 Z${currentZ.toFixed(3)} F${feed}`);

                        const numSteps = Math.ceil(numericWidth / (toolDia / 2));
                        for (let i = 0; i <= numSteps; i++) {
                            const x = (direction === 1) ? (i / numSteps) * numericWidth : numericWidth - (i / numSteps) * numericWidth;
                            const xPct = x / numericWidth;
                            const modelZ = getZAt(xPct, yPct);
                            const cutZ = Math.max(currentZ, modelZ + stock);

                            if (i === 0) code.push(`G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${cutZ.toFixed(3)} F${feed}`);
                            else code.push(`G1 X${x.toFixed(3)} Z${cutZ.toFixed(3)}`);

                            if (i % 5 === 0) {
                                const prevX = (direction === 1) ? ((i - 5) / numSteps) * numericWidth : numericWidth - ((i - 5) / numSteps) * numericWidth;
                                paths.push({ d: `M ${prevX} ${y} L ${x} ${y}`, stroke: 'var(--color-primary)', strokeWidth: '0.5%' });
                            }
                        }
                        code.push(`G0 Z${numericZSafe}`);
                        y += stepoverDist;
                        direction *= -1;
                    }
                }
            }
        }

        // --- Finishing ---
        if ((params.operation === 'both' || params.operation === 'finishing') && params.finishingEnabled) {
            const tool = toolLibrary.find(t => t.id === params.finishingToolId);
            if (tool) {
                const toolDia = parseFloat(String(tool.diameter || 0));
                if (toolDia <= 0) throw new Error('Finishing tool diameter must be greater than 0');

                const stepover = parseFloat(String(params.finishingStepover));
                const angle = parseFloat(String(params.finishingAngle));
                const feed = parseFloat(String(params.finishingFeed));
                const spindle = parseFloat(String(params.finishingSpindle));

                code.push(`(--- Finishing ---)`, `(Tool: ${tool.name})`, `M3 S${spindle}`, `G0 Z${numericZSafe}`);

                const stepoverDist = toolDia * (stepover / 100);
                if (stepoverDist <= 0) throw new Error('Invalid finishing stepover');

                const isYScan = Math.abs(angle - 90) < 45;

                if (!isYScan) {
                    // Scan X
                    let y = 0;
                    let direction = 1;
                    while (y <= numericLength) {
                        const yPct = 1 - (y / numericLength);
                        const startX = (direction === 1) ? 0 : numericWidth;

                        code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
                        const startZ = getZAt((direction === 1 ? 0 : 1), yPct);
                        code.push(`G1 Z${startZ.toFixed(3)} F${feed}`);

                        const numSteps = Math.ceil(numericWidth / (toolDia / 4));
                        for (let i = 1; i <= numSteps; i++) {
                            const x = (direction === 1) ? (i / numSteps) * numericWidth : numericWidth - (i / numSteps) * numericWidth;
                            const xPct = x / numericWidth;
                            const z = getZAt(xPct, yPct);
                            code.push(`G1 X${x.toFixed(3)} Z${z.toFixed(3)}`);

                            if (i % 5 === 0) {
                                const prevX = (direction === 1) ? ((i - 5) / numSteps) * numericWidth : numericWidth - ((i - 5) / numSteps) * numericWidth;
                                paths.push({ d: `M ${prevX} ${y} L ${x} ${y}`, stroke: 'var(--color-accent-yellow)', strokeWidth: '0.5%' });
                            }
                        }
                        y += stepoverDist;
                        direction *= -1;
                    }
                } else {
                    // Scan Y
                    let x = 0;
                    let direction = 1;
                    while (x <= numericWidth) {
                        const xPct = x / numericWidth;
                        const startY = (direction === 1) ? 0 : numericLength;

                        code.push(`G0 X${x.toFixed(3)} Y${startY.toFixed(3)}`);
                        const startZ = getZAt(xPct, (direction === 1 ? 1 : 0));
                        code.push(`G1 Z${startZ.toFixed(3)} F${feed}`);

                        const numSteps = Math.ceil(numericLength / (toolDia / 4));
                        for (let i = 1; i <= numSteps; i++) {
                            const y = (direction === 1) ? (i / numSteps) * numericLength : numericLength - (i / numSteps) * numericLength;
                            const yPct = 1 - (y / numericLength);
                            const z = getZAt(xPct, yPct);
                            code.push(`G1 Y${y.toFixed(3)} Z${z.toFixed(3)}`);

                            if (i % 5 === 0) {
                                const prevY = (direction === 1) ? ((i - 5) / numSteps) * numericLength : numericLength - ((i - 5) / numSteps) * numericLength;
                                paths.push({ d: `M ${x} ${prevY} L ${x} ${y}`, stroke: 'var(--color-accent-yellow)', strokeWidth: '0.5%' });
                            }
                        }
                        x += stepoverDist;
                        direction *= -1;
                    }
                }
            }
        }

        code.push(`G0 Z${numericZSafe}`, `M5`, `G0 X0 Y0`);
        const bounds = { minX: 0, maxX: numericWidth, minY: 0, maxY: numericLength, minZ: numericMaxDepth, maxZ: numericZSafe };

        console.log('Worker: Generation complete', { codeLength: code.length, pathsLength: paths.length });
        self.postMessage({ type: 'success', code, paths, bounds });

    } catch (err: any) {
        console.error('Worker: Error', err);
        self.postMessage({ type: 'error', error: err.message });
    }
};
