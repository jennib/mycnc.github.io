
import { MachineSettings, Tool, GeneratorSettings, SurfacingParams, DrillingParams, BoreParams, PocketParams, ProfileParams, SlotParams, TextParams, ThreadMillingParams } from "@mycnc/shared";
import { FONTS, CharacterStroke, CharacterOutline } from '../services/cncFonts';

// Define PreviewPath interface locally or import if available
interface PreviewPath {
    d?: string;
    cx?: number;
    cy?: number;
    r?: number;
    stroke: string;
    fill?: string;
    strokeWidth?: string;
    strokeDasharray?: string;
}

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface WorkerMessage {
    type: 'surfacing' | 'drilling' | 'bore' | 'pocket' | 'profile' | 'slot' | 'text' | 'thread';
    params: any;
    toolLibrary: Tool[];
    settings: MachineSettings;
    unit: 'mm' | 'in';
    arraySettings: any;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, params, toolLibrary, settings, unit, arraySettings } = e.data;

    try {
        let result: { code: string[]; paths: PreviewPath[]; bounds: Bounds; error: string | null } = { code: [], paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 }, error: "Unknown operation" };

        switch (type) {
            case 'surfacing':
                result = generateSurfacingCode(settings, params as SurfacingParams, toolLibrary, unit);
                break;
            case 'drilling':
                result = generateDrillingCode(settings, params as DrillingParams, toolLibrary, unit);
                break;
            case 'bore':
                result = generateBoreCode(settings, params as BoreParams, toolLibrary, unit);
                break;
            case 'pocket':
                result = generatePocketCode(settings, params as PocketParams, toolLibrary, unit);
                break;
            case 'profile':
                result = generateProfileCode(settings, params as ProfileParams, toolLibrary, unit);
                break;
            case 'slot':
                result = generateSlotCode(settings, params as SlotParams, toolLibrary, unit);
                break;
            case 'text':
                result = generateTextCode(settings, params as TextParams, toolLibrary, unit);
                break;
            case 'thread':
                result = generateThreadMillingCode(settings, params as ThreadMillingParams, toolLibrary, unit);
                break;
        }

        if (result.error) {
            self.postMessage({ type: 'error', error: result.error });
            return;
        }

        if (arraySettings && arraySettings.isEnabled && result.code.length > 0) {
            result = applyArrayPattern(result, arraySettings);
        }

        self.postMessage({ type: 'success', ...result });

    } catch (err: any) {
        self.postMessage({ type: 'error', error: err.message || "Worker error" });
    }
};

// --- Generator Functions (Pasted and Adapted) ---

const generateDrillingCode = (machineSettings: MachineSettings, drillParams: DrillingParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === drillParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };

    const { depth, peck, retract, feed, spindle, safeZ } = drillParams;

    const numericDepth = parseFloat(String(depth));
    const numericPeck = parseFloat(String(peck));
    const numericRetract = parseFloat(String(retract));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    const originOffsetX = 0;
    const originOffsetY = 0;

    const code = [
        `(--- Drilling Operation: ${drillParams.drillType} ---)`,
        `(Tool: ${selectedTool.name} - Ø${(selectedTool.diameter === '' ? 0 : selectedTool.diameter)}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`
    ];
    const paths: PreviewPath[] = [];
    const bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x: number, y: number) => {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxY = Math.max(bounds.maxY, y);
    };

    const points = [];
    if (drillParams.drillType === 'single') {
        const numericSingleX = parseFloat(String(drillParams.singleX));
        const numericSingleY = parseFloat(String(drillParams.singleY));
        if (isNaN(numericSingleX) || isNaN(numericSingleY)) {
            return { error: 'Fill required single drill fields', code: [], paths: [], bounds: {} as Bounds };
        }
        points.push({ x: numericSingleX + originOffsetX, y: numericSingleY + originOffsetY });
    } else if (drillParams.drillType === 'rect') {
        const numericRectCols = parseFloat(String(drillParams.rectCols));
        const numericRectRows = parseFloat(String(drillParams.rectRows));
        const numericRectSpacingX = parseFloat(String(drillParams.rectSpacingX));
        const numericRectSpacingY = parseFloat(String(drillParams.rectSpacingY));
        const numericRectStartX = parseFloat(String(drillParams.rectStartX));
        const numericRectStartY = parseFloat(String(drillParams.rectStartY));

        if ([numericRectCols, numericRectRows, numericRectSpacingX, numericRectSpacingY, numericRectStartX, numericRectStartY].some(isNaN)) {
            return { error: 'Fill required rect drill fields', code: [], paths: [], bounds: {} as Bounds };
        }

        for (let row = 0; row < numericRectRows; row++) {
            for (let col = 0; col < numericRectCols; col++) {
                points.push({
                    x: numericRectStartX + col * numericRectSpacingX + originOffsetX,
                    y: numericRectStartY + row * numericRectSpacingY + originOffsetY
                });
            }
        }
    } else { // circ
        const numericCircHoles = parseFloat(String(drillParams.circHoles));
        const numericCircRadius = parseFloat(String(drillParams.circRadius));
        const numericCircCenterX = parseFloat(String(drillParams.circCenterX));
        const numericCircCenterY = parseFloat(String(drillParams.circCenterY));
        const numericCircStartAngle = parseFloat(String(drillParams.circStartAngle));

        if ([numericCircHoles, numericCircRadius, numericCircCenterX, numericCircCenterY, numericCircStartAngle].some(isNaN)) {
            return { error: 'Fill required circ drill fields', code: [], paths: [], bounds: {} as Bounds };
        }

        const angleStep = numericCircHoles > 0 ? 360 / numericCircHoles : 0;
        for (let i = 0; i < numericCircHoles; i++) {
            const angle = (numericCircStartAngle + i * angleStep) * (Math.PI / 180);
            points.push({
                x: numericCircCenterX + numericCircRadius * Math.cos(angle) + originOffsetX,
                y: numericCircCenterY + numericCircRadius * Math.sin(angle) + originOffsetY
            });
        }
    }

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);

    points.forEach(p => {
        code.push(`(Hole at X${p.x.toFixed(3)} Y${p.y.toFixed(3)})`);
        code.push(`G0 X${p.x.toFixed(3)} Y${p.y.toFixed(3)}`);
        code.push(`G0 Z${numericRetract.toFixed(3)}`);

        let currentZ = 0;
        const targetZ = numericDepth;
        const peckStep = numericPeck;

        if (peckStep <= 0) {
            code.push(`G1 Z${targetZ.toFixed(3)} F${numericFeed.toFixed(3)}`);
            code.push(`G0 Z${numericRetract.toFixed(3)}`);
        } else {
            while (currentZ > targetZ) {
                currentZ -= peckStep;
                if (currentZ < targetZ) currentZ = targetZ;

                code.push(`G1 Z${currentZ.toFixed(3)} F${numericFeed.toFixed(3)}`);
                code.push(`G0 Z${numericRetract.toFixed(3)}`);

                if (currentZ > targetZ) {
                    code.push(`G0 Z${(currentZ + 0.5).toFixed(3)}`);
                }
            }
        }

        paths.push({ cx: p.x, cy: p.y, r: (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter) / 2, stroke: 'var(--color-accent-yellow)', fill: 'var(--color-accent-yellow-transparent)' });
        updateBounds(p.x, p.y);
    });

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push('M5');

    return { code, paths, bounds, error: null };
};

const generateProfileCode = (machineSettings: MachineSettings, profileParams: ProfileParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === profileParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const toolRadius = toolDiameter / 2;

    const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, cutSide, feed, spindle, safeZ } = profileParams;

    const numericWidth = parseFloat(String(width));
    const numericLength = parseFloat(String(length));
    const numericCornerRadius = parseFloat(String(cornerRadius));
    const numericDiameter = parseFloat(String(diameter));
    const numericDepth = parseFloat(String(depth));
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericDepth, numericDepthPerPass, numericFeed, numericSpindle, numericSafeZ].some(isNaN) || (shape === 'rect' && ([numericWidth, numericLength].some(isNaN))) || (shape === 'circ' && isNaN(numericDiameter))) {
        return { error: 'Fill required fields', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass <= 0) {
        return { error: 'Depth per pass must be positive', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass > Math.abs(numericDepth)) {
        return { error: 'Depth per pass larger than total depth', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0;
    const code = [
        `(--- Profile Operation: ${shape} ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`
    ];
    const paths: PreviewPath[] = [];

    let offset = 0;
    if (cutSide === 'outside') offset = toolRadius;
    if (cutSide === 'inside') offset = -toolRadius;

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);

    let currentDepth = 0;
    while (currentDepth > numericDepth) {
        currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
        code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

        if (shape === 'rect') {
            let effCornerRadius = numericCornerRadius;
            if (cutSide === 'outside') effCornerRadius += toolRadius;
            if (cutSide === 'inside') effCornerRadius -= toolRadius;
            if (effCornerRadius < 0) effCornerRadius = 0;

            const minX = -offset;
            const maxX = numericWidth + offset;
            const minY = -offset;
            const maxY = numericLength + offset;

            const startX = minX + effCornerRadius;
            const startY = minY;

            code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`);

            code.push(`G1 X${(maxX - effCornerRadius + originOffsetX).toFixed(3)} Y${(minY + originOffsetY).toFixed(3)} F${numericFeed}`);

            if (effCornerRadius > 0) {
                code.push(`G3 X${(maxX + originOffsetX).toFixed(3)} Y${(minY + effCornerRadius + originOffsetY).toFixed(3)} I0 J${effCornerRadius.toFixed(3)}`);
            }

            code.push(`G1 X${(maxX + originOffsetX).toFixed(3)} Y${(maxY - effCornerRadius + originOffsetY).toFixed(3)}`);

            if (effCornerRadius > 0) {
                code.push(`G3 X${(maxX - effCornerRadius + originOffsetX).toFixed(3)} Y${(maxY + originOffsetY).toFixed(3)} I${(-effCornerRadius).toFixed(3)} J0`);
            }

            code.push(`G1 X${(minX + effCornerRadius + originOffsetX).toFixed(3)} Y${(maxY + originOffsetY).toFixed(3)}`);

            if (effCornerRadius > 0) {
                code.push(`G3 X${(minX + originOffsetX).toFixed(3)} Y${(maxY - effCornerRadius + originOffsetY).toFixed(3)} I0 J${(-effCornerRadius).toFixed(3)}`);
            }

            code.push(`G1 X${(minX + originOffsetX).toFixed(3)} Y${(minY + effCornerRadius + originOffsetY).toFixed(3)}`);

            if (effCornerRadius > 0) {
                code.push(`G3 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)} I${effCornerRadius.toFixed(3)} J0`);
            }

            if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                let d = `M ${(startX + originOffsetX)} ${(startY + originOffsetY)}`;
                d += ` L ${(maxX - effCornerRadius + originOffsetX)} ${(minY + originOffsetY)}`;
                if (effCornerRadius > 0) d += ` A ${effCornerRadius} ${effCornerRadius} 0 0 1 ${(maxX + originOffsetX)} ${(minY + effCornerRadius + originOffsetY)}`;
                d += ` L ${(maxX + originOffsetX)} ${(maxY - effCornerRadius + originOffsetY)}`;
                if (effCornerRadius > 0) d += ` A ${effCornerRadius} ${effCornerRadius} 0 0 1 ${(maxX - effCornerRadius + originOffsetX)} ${(maxY + originOffsetY)}`;
                d += ` L ${(minX + effCornerRadius + originOffsetX)} ${(maxY + originOffsetY)}`;
                if (effCornerRadius > 0) d += ` A ${effCornerRadius} ${effCornerRadius} 0 0 1 ${(minX + originOffsetX)} ${(maxY - effCornerRadius + originOffsetY)}`;
                d += ` L ${(minX + originOffsetX)} ${(minY + effCornerRadius + originOffsetY)}`;
                if (effCornerRadius > 0) d += ` A ${effCornerRadius} ${effCornerRadius} 0 0 1 ${(startX + originOffsetX)} ${(startY + originOffsetY)}`;

                paths.push({ d, stroke: 'var(--color-accent-yellow)' });
            }

        } else {
            const centerX = numericDiameter / 2;
            const centerY = numericDiameter / 2;
            const pathRadius = (numericDiameter / 2) + offset;

            if (pathRadius <= 0) {
                continue;
            }

            const startX = centerX + pathRadius;
            const startY = centerY;

            code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`);

            code.push(`G3 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)} I${(-pathRadius).toFixed(3)} J0 F${numericFeed}`);

            if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: pathRadius, stroke: 'var(--color-accent-yellow)' });
            }
        }
    }

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);
    code.push(`G0 X0 Y0`);

    const bounds = shape === 'rect' ? {
        minX: -offset + originOffsetX,
        minY: -offset + originOffsetY,
        maxX: numericWidth + offset + originOffsetX,
        maxY: numericLength + offset + originOffsetY
    } : {
        minX: -(numericDiameter / 2 + offset) + originOffsetX + (numericDiameter / 2),
        minY: -(numericDiameter / 2 + offset) + originOffsetY + (numericDiameter / 2),
        maxX: (numericDiameter / 2 + offset) + originOffsetX + (numericDiameter / 2),
        maxY: (numericDiameter / 2 + offset) + originOffsetY + (numericDiameter / 2)
    };

    return { code, paths, bounds, error: null };
};

const generateSurfacingCode = (machineSettings: MachineSettings, surfaceParams: SurfacingParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === surfaceParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };

    const { width, length, depth, stepover, feed, spindle, safeZ, direction } = surfaceParams;

    const numericWidth = parseFloat(String(width));
    const numericLength = parseFloat(String(length));
    const numericDepth = parseFloat(String(depth));
    const numericStepover = parseFloat(String(stepover));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericWidth, numericLength, numericDepth, numericStepover, numericFeed, numericSpindle, numericSafeZ].some(isNaN)) {
        return { error: 'Fill required surfacing fields', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [
        `(--- Surfacing Operation ---)`,
        `(Tool: ${selectedTool.name} - Ø${(typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter)}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`
    ];
    const paths: PreviewPath[] = [];
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const toolRadius = toolDiameter / 2;
    const stepoverDist = toolDiameter * (numericStepover / 100);

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);

    if (direction === 'horizontal') {
        let y = toolRadius;
        let xDirection = 1;
        while (y <= numericLength + toolRadius) {
            const startX = (xDirection === 1) ? -toolRadius : numericWidth + toolRadius;
            const endX = (xDirection === 1) ? numericWidth + toolRadius : -toolRadius;
            code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(y + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);
            code.push(`G1 X${(endX + originOffsetX).toFixed(3)} F${numericFeed}`);
            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
            paths.push({ d: `M ${(startX + originOffsetX)} ${(y + originOffsetY)} L ${(endX + originOffsetX)} ${(y + originOffsetY)}`, stroke: 'var(--color-accent-yellow)' });
            y += stepoverDist;
            xDirection *= -1;
        }
    } else {
        let x = toolRadius;
        let yDirection = 1;
        while (x <= numericWidth + toolRadius) {
            const startY = (yDirection === 1) ? -toolRadius : numericLength + toolRadius;
            const endY = (yDirection === 1) ? numericLength + toolRadius : -toolRadius;
            code.push(`G0 X${(x + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);
            code.push(`G1 Y${(endY + originOffsetY).toFixed(3)} F${numericFeed}`);
            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
            paths.push({ d: `M ${(x + originOffsetX).toFixed(3)} ${(startY + originOffsetY).toFixed(3)} L ${(x + originOffsetX).toFixed(3)} ${(endY + originOffsetY).toFixed(3)}`, stroke: 'var(--color-accent-yellow)' });
            x += stepoverDist;
            yDirection *= -1;
        }
    }

    code.push(`M5`);
    const bounds = {
        minX: originOffsetX,
        minY: originOffsetY,
        maxX: numericWidth + originOffsetX,
        maxY: numericLength + originOffsetY
    };
    return { code, paths, bounds, error: null };
};

const generatePocketCode = (machineSettings: MachineSettings, pocketParams: PocketParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === pocketParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };

    const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ } = pocketParams;

    const numericWidth = parseFloat(String(width));
    const numericLength = parseFloat(String(length));
    const numericDiameter = parseFloat(String(diameter));
    const numericDepth = parseFloat(String(depth));
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericStepover = parseFloat(String(stepover));
    const numericFeed = parseFloat(String(feed));
    const numericPlungeFeed = parseFloat(String(plungeFeed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericDepth, numericDepthPerPass, numericStepover, numericFeed, numericPlungeFeed, numericSpindle, numericSafeZ].some(isNaN) || (shape === 'rect' && ([numericWidth, numericLength].some(isNaN))) || (shape === 'circ' && isNaN(numericDiameter))) {
        return { error: 'Fill required pocket fields', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass <= 0) {
        return { error: 'Depth per pass must be positive', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass > Math.abs(numericDepth)) {
        return { error: 'Depth per pass larger than total depth', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [
        `(--- Pocket Operation: ${shape} ---)`,
        `(Tool: ${selectedTool.name} - Ø${(typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter)}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`, `G0 Z${numericSafeZ}`
    ];
    const paths: PreviewPath[] = [];
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const toolRadius = toolDiameter / 2;
    const stepoverDist = toolDiameter * (numericStepover / 100);

    let currentDepth = 0;
    while (currentDepth > numericDepth) {
        currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
        code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

        if (shape === 'rect') {
            const centerX = numericWidth / 2;
            const centerY = numericLength / 2;
            code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);

            let y = toolRadius;
            while (y <= numericLength - toolRadius) {
                code.push(`G1 X${(numericWidth - toolRadius + originOffsetX).toFixed(3)} Y${(y + originOffsetY).toFixed(3)} F${numericFeed}`);
                paths.push({ d: `M${(toolRadius + originOffsetX)} ${(y + originOffsetY)} L${(numericWidth - toolRadius + originOffsetX)} ${(y + originOffsetY)}`, stroke: 'var(--color-accent-yellow)' });
                y += stepoverDist;
                if (y <= numericLength - toolRadius) {
                    code.push(`G1 X${(toolRadius + originOffsetX).toFixed(3)} Y${(y + originOffsetY).toFixed(3)} F${numericFeed}`);
                    paths.push({ d: `M${(numericWidth - toolRadius + originOffsetX)} ${(y - stepoverDist + originOffsetY)} L${(numericWidth - toolRadius + originOffsetX)} ${(y + originOffsetY)}`, stroke: 'var(--color-text-secondary)' });
                }
            }
        } else {
            const centerX = numericDiameter / 2;
            const centerY = numericDiameter / 2;
            code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
            code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);
        }
    }

    code.push(`G0 Z${numericSafeZ}`, `M5`, `G0 X0 Y0`);
    const bounds = shape === 'rect' ? {
        minX: originOffsetX,
        minY: originOffsetY,
        maxX: numericWidth + originOffsetX,
        maxY: numericLength + originOffsetY
    } : {
        minX: originOffsetX,
        minY: originOffsetY,
        maxX: numericDiameter + originOffsetX,
        maxY: numericDiameter + originOffsetY
    };
    return { code, paths, bounds, error: null };
};

const generateBoreCode = (machineSettings: MachineSettings, boreParams: BoreParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === boreParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };

    const { centerX, centerY, holeDiameter, holeDepth, counterboreEnabled, cbDiameter, cbDepth, depthPerPass, feed, plungeFeed, spindle, safeZ } = boreParams;

    const numericCenterX = parseFloat(String(centerX));
    const numericCenterY = parseFloat(String(centerY));
    const numericHoleDiameter = parseFloat(String(holeDiameter));
    const numericHoleDepth = parseFloat(String(holeDepth));
    const numericCbDiameter = parseFloat(String(cbDiameter));
    const numericCbDepth = parseFloat(String(cbDepth));
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericFeed = parseFloat(String(feed));
    const numericPlungeFeed = parseFloat(String(plungeFeed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericCenterX, numericCenterY, numericHoleDiameter, numericHoleDepth, numericDepthPerPass, numericFeed, numericPlungeFeed, numericSpindle, numericSafeZ].some(isNaN) || (counterboreEnabled && ([numericCbDiameter, numericCbDepth].some(isNaN)))) {
        return { error: 'Fill required bore fields', code: [], paths: [], bounds: {} as Bounds };
    }

    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);

    if (numericHoleDiameter <= toolDiameter) {
        return { error: 'Tool too large for hole', code: [], paths: [], bounds: {} as Bounds };
    }
    if (counterboreEnabled && numericCbDiameter <= toolDiameter) {
        return { error: 'Tool too large for cb', code: [], paths: [], bounds: {} as Bounds };
    }
    if (counterboreEnabled && numericCbDiameter <= numericHoleDiameter) {
        return { error: 'CB smaller than hole', code: [], paths: [], bounds: {} as Bounds };
    }

    if (numericDepthPerPass <= 0) {
        return { error: 'Depth positive', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass > Math.abs(numericHoleDepth)) {
        return { error: 'Depth too large', code: [], paths: [], bounds: {} as Bounds };
    }
    if (counterboreEnabled && numericDepthPerPass > Math.abs(numericCbDepth)) {
        return { error: 'Depth too large cb', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [
        `(--- Bore Operation ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`
    ];
    const paths: PreviewPath[] = [];
    const bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x: number, y: number, r: number) => {
        bounds.minX = Math.min(bounds.minX, x - r);
        bounds.maxX = Math.max(bounds.maxX, x + r);
        bounds.minY = Math.min(bounds.minY, y - r);
        bounds.maxY = Math.max(bounds.maxY, y + r);
    };

    const doHelicalBore = (targetDiameter: number, targetDepth: number, startZ: number = 0) => {
        const finalPathRadius = (targetDiameter - toolDiameter) / 2;
        if (finalPathRadius <= 0) return;

        const currentCenterX = numericCenterX + originOffsetX;
        const currentCenterY = numericCenterY + originOffsetY;

        const stepoverVal = parseFloat(String(boreParams.stepover)) || 40;
        const stepoverAmount = toolDiameter * (stepoverVal / 100);

        const passes = [];
        let r = stepoverAmount;
        if (r > finalPathRadius) r = finalPathRadius;

        while (r <= finalPathRadius) {
            passes.push(r);
            if (r >= finalPathRadius) break;
            r += stepoverAmount;
            if (r > finalPathRadius) r = finalPathRadius;
        }

        if (passes.length === 0) passes.push(finalPathRadius);

        code.push(`(Boring to Ø${targetDiameter} at Z=${targetDepth})`);
        paths.push({ cx: currentCenterX, cy: currentCenterY, r: targetDiameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '0.5%' });
        updateBounds(currentCenterX, currentCenterY, targetDiameter / 2);

        code.push(`G0 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)} Z${numericSafeZ.toFixed(3)}`);

        for (const passRadius of passes) {
            code.push(`(Pass at radius ${passRadius.toFixed(3)})`);
            code.push(`G0 Z${(startZ + 1).toFixed(3)}`);
            code.push(`G0 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)}`);
            code.push(`G1 Z${startZ.toFixed(3)} F${numericPlungeFeed}`);

            let currentDepth = startZ;
            while (currentDepth > targetDepth) {
                currentDepth = Math.max(targetDepth, currentDepth - numericDepthPerPass);
                code.push(`G2 X${(currentCenterX + passRadius).toFixed(3)} Y${currentCenterY.toFixed(3)} I${passRadius / 2} J0 Z${currentDepth.toFixed(3)} F${numericFeed}`);
                code.push(`G2 X${(currentCenterX + passRadius).toFixed(3)} Y${currentCenterY.toFixed(3)} I${-passRadius.toFixed(3)} J0`);
                code.push(`G2 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)} I${-passRadius / 2} J0`);
            }

            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        }
    };

    if (counterboreEnabled) {
        if (numericCbDepth > numericHoleDepth) {
            doHelicalBore(numericCbDiameter, numericCbDepth);
            doHelicalBore(numericHoleDiameter, numericHoleDepth, numericCbDepth);
        } else {
            doHelicalBore(numericHoleDiameter, numericHoleDepth);
            doHelicalBore(numericCbDiameter, numericCbDepth);
        }
    } else {
        doHelicalBore(numericHoleDiameter, numericHoleDepth);
    }

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);
    code.push(`G0 X0 Y0`);

    return { code, paths, bounds, error: null };
};

const generateSlotCode = (machineSettings: MachineSettings, slotParams: SlotParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === slotParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);

    const { type, slotWidth, depth, depthPerPass, feed, spindle, safeZ, startX, startY, endX, endY, centerX, centerY, radius, startAngle, endAngle } = slotParams;

    const numericSlotWidth = parseFloat(String(slotWidth));
    const numericDepth = parseFloat(String(depth));
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));
    const numericStartX = parseFloat(String(startX));
    const numericStartY = parseFloat(String(startY));
    const numericEndX = parseFloat(String(endX));
    const numericEndY = parseFloat(String(endY));
    const numericCenterX = parseFloat(String(centerX));
    const numericCenterY = parseFloat(String(centerY));
    const numericRadius = parseFloat(String(radius));
    const numericStartAngle = parseFloat(String(startAngle));
    const numericEndAngle = parseFloat(String(endAngle));

    if ([numericSlotWidth, numericDepth, numericDepthPerPass, numericFeed, numericSpindle, numericSafeZ].some(isNaN) || (type === 'straight' && [numericStartX, numericStartY, numericEndX, numericEndY].some(isNaN)) || (type === 'arc' && [numericCenterX, numericCenterY, numericRadius, numericStartAngle, numericEndAngle].some(isNaN))) {
        return { error: 'Fill required slot fields', code: [], paths: [], bounds: {} as Bounds };
    }

    if (numericDepthPerPass <= 0) {
        return { error: 'Depth positive', code: [], paths: [], bounds: {} as Bounds };
    }
    if (numericDepthPerPass > Math.abs(numericDepth)) {
        return { error: 'Depth too large', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [
        `(--- Slot Operation: ${type} ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `G21 G90`, `M3 S${numericSpindle}`
    ];
    const paths: PreviewPath[] = [];
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x: number, y: number) => {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxY = Math.max(bounds.maxY, y);
    };

    const offsets = [];
    if (numericSlotWidth <= toolDiameter) {
        offsets.push(0);
    } else {
        const wallOffset = (numericSlotWidth - toolDiameter) / 2;
        offsets.push(-wallOffset, wallOffset);
        if (numericSlotWidth > toolDiameter * 2) {
            offsets.push(0);
        }
    }
    offsets.sort((a, b) => a - b);


    let currentDepth = 0;
    while (currentDepth > numericDepth) {
        currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
        code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

        for (const offset of offsets) {
            if (type === 'straight') {
                const angle = Math.atan2(numericEndY - numericStartY, numericEndX - numericStartX);
                const perpAngle = angle + Math.PI / 2;

                const dx = Math.cos(perpAngle) * offset;
                const dy = Math.sin(perpAngle) * offset;

                const passStartX = numericStartX + dx;
                const passStartY = numericStartY + dy;
                const passEndX = numericEndX + dx;
                const passEndY = numericEndY + dy;

                code.push(`G0 Z${numericSafeZ}`);
                code.push(`G0 X${(passStartX + originOffsetX).toFixed(3)} Y${(passStartY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`);
                code.push(`G1 X${(passEndX + originOffsetX).toFixed(3)} Y${(passEndY + originOffsetY).toFixed(3)} F${numericFeed}`);

                if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                    paths.push({ d: `M${(passStartX + originOffsetX)} ${(passStartY + originOffsetY)} L${(passEndX + originOffsetX)} ${(passEndY + originOffsetY)}`, stroke: 'var(--color-accent-yellow)', strokeWidth: `${toolDiameter}%` });
                    updateBounds(passStartX + originOffsetX, passStartY + originOffsetY);
                    updateBounds(passEndX + originOffsetX, passEndY + originOffsetY);
                }
            } else {
                const passRadius = numericRadius + offset;
                if (passRadius <= 0) continue;

                const startRad = numericStartAngle * (Math.PI / 180);
                const endRad = numericEndAngle * (Math.PI / 180);

                const passStartX = numericCenterX + passRadius * Math.cos(startRad);
                const passStartY = numericCenterY + passRadius * Math.sin(startRad);
                const passEndX = numericCenterX + passRadius * Math.cos(endRad);
                const passEndY = numericCenterY + passRadius * Math.sin(endRad);

                const gCodeArc = (numericEndAngle > numericStartAngle) ? 'G3' : 'G2';
                const sweepFlag = (numericEndAngle > numericStartAngle) ? 1 : 0;

                const I = numericCenterX - passStartX;
                const J = numericCenterY - passStartY;

                code.push(`G0 Z${numericSafeZ}`);
                code.push(`G0 X${(passStartX + originOffsetX).toFixed(3)} Y${(passStartY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`);
                code.push(`${gCodeArc} X${(passEndX + originOffsetX).toFixed(3)} Y${(passEndY + originOffsetY).toFixed(3)} I${I.toFixed(3)} J${J.toFixed(3)} F${numericFeed}`);

                if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                    const largeArcFlag = Math.abs(numericEndAngle - numericStartAngle) > 180 ? 1 : 0;
                    paths.push({ d: `M ${(passStartX + originOffsetX)} ${(passStartY + originOffsetY)} A ${passRadius} ${passRadius} 0 ${largeArcFlag} ${sweepFlag} ${(passEndX + originOffsetX)} ${(passEndY + originOffsetY)}`, stroke: 'var(--color-accent-yellow)', fill: 'none', strokeWidth: `${toolDiameter}%` });
                    updateBounds(numericCenterX - passRadius + originOffsetX, numericCenterY - passRadius + originOffsetY);
                    updateBounds(numericCenterX + passRadius + originOffsetX, numericCenterY + passRadius + originOffsetY);
                }
            }
        }
    }

    code.push(`G0 Z${numericSafeZ}`, `M5`);
    bounds.minX += originOffsetX;
    bounds.maxX += originOffsetX;
    bounds.minY += originOffsetY;
    bounds.maxY += originOffsetY;

    return { code, paths, bounds, error: null };
};

const generateTextCode = (machineSettings: MachineSettings, textParams: TextParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === textParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };

    const { text, font, height, spacing, startX, startY, alignment, depth, feed, spindle, safeZ } = textParams;

    const numericHeight = parseFloat(String(height));
    const numericSpacing = parseFloat(String(spacing));
    const numericStartX = parseFloat(String(startX));
    const numericStartY = parseFloat(String(startY));
    const numericDepth = parseFloat(String(depth));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericHeight, numericSpacing, numericStartX, numericStartY, numericDepth, numericFeed, numericSpindle, numericSafeZ].some(isNaN) || !text) {
        return { error: 'Fill required text fields', code: [], paths: [], bounds: {} as Bounds };
    }

    const fontData = FONTS[font as keyof typeof FONTS];
    if (!fontData) {
        return { error: 'Invalid font', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [];
    const paths: PreviewPath[] = [];
    const FONT_BASE_HEIGHT = 7;
    const FONT_BASE_WIDTH = 5;

    const scale = numericHeight / FONT_BASE_HEIGHT;
    const charWidth = FONT_BASE_WIDTH * scale;
    const totalTextWidth = (text.length * charWidth) + Math.max(0, (text.length - 1) * numericSpacing);

    let currentX = numericStartX;
    if (alignment === 'center') {
        currentX -= totalTextWidth / 2;
    } else if (alignment === 'right') {
        currentX -= totalTextWidth;
    }

    const startOffsetX = currentX;

    code.push(`(--- Text Engraving ---)`);
    code.push(`(Tool: ${selectedTool.name})`);
    code.push(`(Text: ${text}, Font: ${font})`);
    code.push(`G21 G90`);
    code.push(`M3 S${numericSpindle}`);

    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        const charData = fontData.characters[char];

        if (charData) {
            if (fontData.type === 'stroke') {
                const strokeData = charData as CharacterStroke;
                for (const stroke of strokeData) {
                    const p1 = {
                        x: startOffsetX + i * (charWidth + numericSpacing) + stroke.p1.x * scale,
                        y: numericStartY + stroke.p1.y * scale
                    };
                    const p2 = {
                        x: startOffsetX + i * (charWidth + numericSpacing) + stroke.p2.x * scale,
                        y: numericStartY + stroke.p2.y * scale
                    };

                    code.push(`G0 Z${numericSafeZ}`);
                    code.push(`G0 X${(p1.x + originOffsetX).toFixed(3)} Y${(p1.y + originOffsetY).toFixed(3)}`);
                    code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);
                    code.push(`G1 X${(p2.x + originOffsetX).toFixed(3)} Y${(p2.y + originOffsetY).toFixed(3)} F${numericFeed}`);
                    code.push(`G0 Z${numericSafeZ}`);

                    paths.push({ d: `M${(p1.x + originOffsetX)} ${(p1.y + originOffsetY)} L${(p2.x + originOffsetX)} ${(p2.y + originOffsetY)}`, stroke: 'var(--color-accent-yellow)' });
                }
            } else if (fontData.type === 'outline') {
                const outlineData = charData as CharacterOutline;
                for (const path of outlineData) {
                    if (path.length === 0) continue;

                    const scaledPath = path.map((p: { x: number, y: number }) => ({
                        x: startOffsetX + i * (charWidth + numericSpacing) + p.x * scale,
                        y: numericStartY + p.y * scale
                    }));

                    code.push(`G0 Z${numericSafeZ}`);
                    code.push(`G0 X${(scaledPath[0].x + originOffsetX).toFixed(3)} Y${(scaledPath[0].y + originOffsetY).toFixed(3)}`);
                    code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);

                    for (let j = 1; j < scaledPath.length; j++) {
                        code.push(`G1 X${(scaledPath[j].x + originOffsetX).toFixed(3)} Y${(scaledPath[j].y + originOffsetY).toFixed(3)} F${numericFeed}`);
                    }

                    if (scaledPath[0].x !== scaledPath[scaledPath.length - 1].x || scaledPath[0].y !== scaledPath[scaledPath.length - 1].y) {
                        code.push(`G1 X${(scaledPath[0].x + originOffsetX).toFixed(3)} Y${(scaledPath[0].y + originOffsetY).toFixed(3)} F${numericFeed}`);
                    }
                    code.push(`G0 Z${numericSafeZ}`);

                    const pathString = "M" + scaledPath.map((p: { x: number, y: number }) => `${(p.x + originOffsetX)} ${(p.y + originOffsetY)}`).join(" L ") + " Z";
                    paths.push({ d: pathString, stroke: 'var(--color-accent-yellow)', 'strokeWidth': '2%', fill: 'none' });
                }
            }
        }
    }

    code.push('M5');
    code.push(`G0 X${(numericStartX + originOffsetX).toFixed(3)} Y${(numericStartY + originOffsetY).toFixed(3)}`);

    const bounds = {
        minX: startOffsetX + originOffsetX,
        maxX: startOffsetX + totalTextWidth + originOffsetX,
        minY: numericStartY + originOffsetY,
        maxY: numericStartY + numericHeight + originOffsetY
    };

    return { code, paths, bounds, error: null };
};

const generateThreadMillingCode = (machineSettings: MachineSettings, threadParams: ThreadMillingParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === threadParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);

    const { type, hand, feed, spindle, safeZ } = threadParams;
    const numericDiameter = parseFloat(String(threadParams.diameter));
    const numericPitch = parseFloat(String(threadParams.pitch));
    const numericDepth = parseFloat(String(threadParams.depth));
    const numericFeed = parseFloat(String(feed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericDiameter, numericPitch, numericDepth, numericFeed, numericSpindle, numericSafeZ].some(isNaN) || [numericDiameter, numericPitch, numericDepth, numericFeed, numericSpindle, numericSafeZ].some(p => p <= 0)) {
        return { error: 'Fill required thread fields', code: [], paths: [], bounds: {} as Bounds };
    }
    if (toolDiameter >= numericDiameter && type === 'internal') {
        return { error: 'Tool too large', code: [], paths: [], bounds: {} as Bounds };
    }

    const originOffsetX = 0;
    const originOffsetY = 0; const code = [
        `(--- Thread Milling Operation ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `(Type: ${type}, Hand: ${hand})`,
        `(Diameter: ${numericDiameter}, Pitch: ${numericPitch}, Depth: ${numericDepth})`,
        `(Feed: ${numericFeed}, Spindle: ${numericSpindle})`,
        `G21 G90`,
        `M3 S${numericSpindle}`,
        `G0 Z${numericSafeZ}`,
    ];
    const paths: PreviewPath[] = [];

    const centerX = 0;
    const centerY = 0;

    let pathRadius, helicalDirection;

    if (type === 'internal') {
        pathRadius = (numericDiameter - toolDiameter) / 2;
        helicalDirection = (hand === 'right') ? 'G3' : 'G2';
    } else {
        pathRadius = (numericDiameter + toolDiameter) / 2;
        helicalDirection = (hand === 'right') ? 'G2' : 'G3';
    }

    if (pathRadius <= 0) return { error: 'Pitch too large', code: [], paths: [], bounds: {} as Bounds };

    paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: numericDiameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '2%', fill: 'none' });
    paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: pathRadius, stroke: 'var(--color-accent-yellow)', strokeWidth: '3%', fill: 'none' });

    if (type === 'internal') {
        const preDrillRadius = numericDiameter - numericPitch;
        paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: preDrillRadius / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '2 2', strokeWidth: '2%', fill: 'none' });
    }

    const startX = centerX + pathRadius;

    code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
    code.push(`G1 Z${(-numericDepth).toFixed(3)} F${numericFeed / 2}`);
    code.push(`G1 X${(startX + originOffsetX).toFixed(3)} F${numericFeed}`);

    let currentZ = -numericDepth;
    while (currentZ < 0) {
        currentZ = Math.min(0, currentZ + numericPitch);
        code.push(`${helicalDirection} X${(startX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)} I${-pathRadius.toFixed(3)} J0 Z${currentZ.toFixed(3)} F${numericFeed}`);
    }

    code.push(`G1 X${(centerX + originOffsetX).toFixed(3)} F${numericFeed}`);
    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);
    code.push(`G0 X0 Y0`);

    const boundsRadius = type === 'internal' ? numericDiameter / 2 : pathRadius;
    const bounds = {
        minX: centerX - boundsRadius + originOffsetX,
        maxX: centerX + boundsRadius + originOffsetX,
        minY: centerY - boundsRadius + originOffsetY,
        maxY: centerY + boundsRadius + originOffsetY
    };

    return { code, paths, bounds, error: null };
};

const applyArrayPattern = (singleOpResult: { code: string[]; paths: PreviewPath[]; bounds: Bounds }, arraySettings: any) => {
    const { code: singleCode, paths: singlePaths, bounds: singleBounds } = singleOpResult;
    const { pattern, rectCols, rectRows, rectSpacingX, rectSpacingY, circCopies, circRadius, circCenterX, circCenterY, circStartAngle } = arraySettings;

    const numericRectCols = Number(rectCols);
    const numericRectRows = Number(rectRows);
    const numericRectSpacingX = Number(rectSpacingX);
    const numericRectSpacingY = Number(rectSpacingY);
    const numericCircCopies = Number(circCopies);
    const numericCircRadius = Number(circRadius);
    const numericCircCenterX = Number(circCenterX);
    const numericCircCenterY = Number(circCenterY);
    const numericCircStartAngle = Number(circStartAngle);

    const inputLines = singleCode;

    const transformLine = (line: string, offset: { x: number; y: number }) => {
        const upperLine = line.toUpperCase();
        if (!/G[0-3]\s/.test(upperLine) || (!upperLine.includes('X') && !upperLine.includes('Y'))) {
            return line;
        }

        let transformed = line;
        transformed = transformed.replace(/X\s*([-+]?\d*\.?\d+)/i, (match, val) => `X${(parseFloat(val) + offset.x).toFixed(3)}`);
        transformed = transformed.replace(/Y\s*([-+]?\d*\.?\d+)/i, (match, val) => `Y${(parseFloat(val) + offset.y).toFixed(3)}`);

        return transformed;
    };

    const offsets: { x: number, y: number }[] = [];
    if (pattern === 'rect') {
        if ([numericRectCols, numericRectRows, numericRectSpacingX, numericRectSpacingY].some(isNaN)) {
            return { code: [], paths: [], bounds: {} as Bounds, error: "Invalid array pattern parameters." };
        }
        for (let row = 0; row < numericRectRows; row++) {
            for (let col = 0; col < numericRectCols; col++) {
                offsets.push({ x: col * numericRectSpacingX, y: row * numericRectSpacingY });
            }
        }
    } else {
        if ([numericCircCopies, numericCircRadius, numericCircCenterX, numericCircCenterY, numericCircStartAngle].some(isNaN)) {
            return { code: [], paths: [], bounds: {} as Bounds, error: "Invalid array pattern parameters." };
        }
        const angleStep = numericCircCopies > 0 ? 360 / numericCircCopies : 0;
        for (let i = 0; i < numericCircCopies; i++) {
            const angle = (numericCircStartAngle + i * angleStep) * (Math.PI / 180);
            offsets.push({
                x: numericCircCenterX + numericCircRadius * Math.cos(angle),
                y: numericCircCenterY + numericCircRadius * Math.sin(angle),
            });
        }
    }

    const finalCode: string[] = [];
    const finalPaths: PreviewPath[] = [];
    const finalBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };

    offsets.forEach(offset => {
        finalCode.push(`(--- Repetition at X${offset.x.toFixed(3)} Y${offset.y.toFixed(3)} ---)`);
        inputLines.forEach((line: string) => {
            if (line.startsWith('(') || /T\d+\s*M6/.test(line)) {
                if (!finalCode.includes(line)) finalCode.unshift(line);
            } else {
                finalCode.push(transformLine(line, offset));
            }
        });

        singlePaths.forEach((p: PreviewPath) => {
            let newPath = { ...p };
            if (p.d) {
                newPath.d = p.d.replace(/([ML])(\s*[\d\.-]+)(\s*,?\s*)([\d\.-]+)/g, (match: string, cmd: string, x: string, sep: string, y: string) => {
                    return `${cmd} ${(parseFloat(x) + offset.x).toFixed(3)} ${sep} ${(parseFloat(y) + offset.y).toFixed(3)}`;
                });
            }
            if (p.cx !== undefined && p.cy !== undefined) {
                newPath.cx = p.cx + offset.x;
                newPath.cy = p.cy + offset.y;
            }
            finalPaths.push(newPath);
        });

        finalBounds.minX = Math.min(finalBounds.minX, singleBounds.minX + offset.x);
        finalBounds.maxX = Math.max(finalBounds.maxX, singleBounds.maxX + offset.x);
        finalBounds.minY = Math.min(finalBounds.minY, singleBounds.minY + offset.y);
        finalBounds.maxY = Math.max(finalBounds.maxY, singleBounds.maxY + offset.y);
    });

    return { code: finalCode, paths: finalPaths, bounds: finalBounds, error: null };
};
