import { MachineSettings, Tool, GeneratorSettings, SurfacingParams, DrillingParams, BoreParams, PocketParams, ProfileParams, SlotParams, TextParams, ThreadMillingParams, DrawerParams, MortiseTenonParams, DadoRabbetParams, DecorativeJoineryParams, CabinetParams, BoxJointParams, HalfLapParams, LockMitreParams } from "@mycnc/shared";
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
    type: 'surfacing' | 'drilling' | 'bore' | 'pocket' | 'profile' | 'slot' | 'text' | 'thread' | 'drawer' | 'mortisetenon' | 'dadorabbet' | 'decorative' | 'cabinet' | 'boxjoint' | 'halfLap' | 'lockMitre';
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
            case 'drawer':
                result = generateDrawerCode(settings, params as DrawerParams, toolLibrary, unit);
                break;
            case 'mortisetenon':
                result = generateMortiseTenonCode(settings, params as MortiseTenonParams, toolLibrary, unit);
                break;
            case 'dadorabbet':
                result = generateDadoRabbetCode(settings, params as DadoRabbetParams, toolLibrary, unit);
                break;
            case 'decorative':
                result = generateDecorativeJoineryCode(settings, params as DecorativeJoineryParams, toolLibrary, unit);
                break;
            case 'cabinet':
                result = generateCabinetCode(settings, params as CabinetParams, toolLibrary, unit);
                break;
            case 'halfLap':
                result = generateHalfLapCode(settings, params as HalfLapParams, toolLibrary, unit);
                break;
            case 'boxjoint':
                result = generateBoxJointCode(settings, params as BoxJointParams, toolLibrary, unit);
                break;
            case 'lockMitre':
                result = generateLockMitreCode(settings, params as LockMitreParams, toolLibrary, unit);
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

const generateLockMitreCode = (machineSettings: MachineSettings, params: LockMitreParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    const toolDiameter = selectedTool ? (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter) : 0;
    const toolRadius = toolDiameter / 2;

    const { stockThickness, length, feedRate, stepover, stepdown, partToGenerate, bitAngle } = params;

    const numericThickness = parseFloat(String(stockThickness));
    const numericLength = parseFloat(String(length));
    const numericFeed = parseFloat(String(feedRate));
    const numericStepover = parseFloat(String(stepover)) || 0.5;
    const numericStepdown = parseFloat(String(stepdown)) || 0.5;
    const numericBitAngle = parseFloat(String(bitAngle)) || 45;
    const numericSafeZ = 5;

    if ([numericThickness, numericLength, numericFeed].some(isNaN)) {
        return { error: 'Fill required fields (Thickness, Length, Feed)', code: [], paths: [], bounds: {} as Bounds };
    }

    const code: string[] = [
        `(--- Flat-Milled Stepped Lock Mitre ---)`,
        `(Thickness: ${numericThickness}, Length: ${numericLength}, Feed: ${numericFeed})`,
        `(Stepover: ${numericStepover}, Stepdown: ${numericStepdown}, Angle: ${numericBitAngle})`,
        `G21 G90`, `M3 S10000`, `G0 Z${numericSafeZ.toFixed(3)}`
    ];

    const paths: PreviewPath[] = [];
    const bounds = { minX: 0, maxX: numericThickness * 2 + 50, minY: 0, maxY: numericLength };

    const hStepover = toolDiameter * numericStepover;
    const tanAngle = Math.tan(numericBitAngle * (Math.PI / 180));

    // Improved addCut that supports staying at depth
    let lastZ: number | null = null;
    let lastX: number | null = null;
    let lastY: number | null = null;

    const addCutLine = (x: number, y1: number, y2: number, z: number) => {
        // Move to start if not already there or if Z changed
        if (lastX === null || Math.abs(lastX - x) > 0.001 || lastZ === null || Math.abs(lastZ - z) > 0.001 || lastY === null || Math.abs(lastY - y1) > 0.001) {
            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
            code.push(`G0 X${x.toFixed(3)} Y${y1.toFixed(3)}`);
            code.push(`G1 Z${z.toFixed(3)} F${numericFeed / 2}`);
        }
        
        code.push(`G1 Y${y2.toFixed(3)} F${numericFeed}`);
        
        paths.push({ 
            d: `M ${x.toFixed(3)} ${y1.toFixed(3)} L ${x.toFixed(3)} ${y2.toFixed(3)}`, 
            stroke: 'var(--color-accent-blue)' 
        });

        lastX = x;
        lastY = y2;
        lastZ = z;
    };

    const generatePiece = (offsetX: number, isPieceA: boolean) => {
        const T = numericThickness;
        const P = T / 4; // Tongue/Groove depth
        
        for (let z = 0; z <= T; z += numericStepdown) {
            const currentZ = -Math.min(z, T);
            let targetX = Math.abs(currentZ) / tanAngle;
            
            if (isPieceA) {
                // Piece A: Tongue protrusion
                if (Math.abs(currentZ) >= T * 0.25 && Math.abs(currentZ) <= T * 0.75) {
                    targetX -= P;
                }
            } else {
                // Piece B: Groove recess
                if (Math.abs(currentZ) >= T * 0.25 && Math.abs(currentZ) <= T * 0.75) {
                    targetX += P;
                }
            }

            // We need to clear from the outer edge (X=0 approx) to the target slope X.
            // For Piece A: Edge is at X=targetX_at_bottom, Profiling towards X=0.
            // Actually, simplified: always clear from -toolRadius to targetX.
            const xPasses = [];
            const startX = -toolRadius;
            const endX = targetX;
            
            for (let x = startX; x <= endX; x += hStepover) {
                xPasses.push(x);
            }
            if (xPasses.length === 0 || Math.abs(xPasses[xPasses.length - 1] - endX) > 0.001) {
                xPasses.push(endX);
            }

            for (let i = 0; i < xPasses.length; i++) {
                const x = xPasses[i];
                const yStart = (i % 2 === 0) ? 0 : numericLength;
                const yEnd = (i % 2 === 0) ? numericLength : 0;
                
                if (lastZ !== null && Math.abs(lastZ - currentZ) < 0.001) {
                    code.push(`G1 X${(x + offsetX).toFixed(3)} F${numericFeed}`);
                    code.push(`G1 Y${yEnd.toFixed(3)} F${numericFeed}`);
                    
                    paths.push({ 
                        d: `M ${(x + offsetX).toFixed(3)} ${yStart.toFixed(3)} L ${(x + offsetX).toFixed(3)} ${yEnd.toFixed(3)}`, 
                        stroke: 'var(--color-accent-blue)' 
                    });
                    
                    lastX = x + offsetX;
                    lastY = yEnd;
                } else {
                    addCutLine(x + offsetX, yStart, yEnd, currentZ);
                }
            }
        }
        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        lastZ = null; lastX = null; lastY = null;
    };

    if (partToGenerate === 'A' || partToGenerate === 'both') {
        generatePiece(toolRadius, true);
    }
    if (partToGenerate === 'B' || partToGenerate === 'both') {
        const pieceBWidth = (numericThickness / tanAngle) + (numericThickness / 4);
        const offset = (partToGenerate === 'both') ? pieceBWidth + toolDiameter + 40 : toolRadius;
        generatePiece(offset, false);
    }

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);

    return { code, paths, bounds, error: null };
};

const generateBoxJointCode = (machineSettings: MachineSettings, params: BoxJointParams, toolLibrary: Tool[], unit: string) => {

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);

    const {
        width, length, depth, numberOfFingers, tolerance, fingerStickOut,
        depthPerPass, feed, plungeFeed, spindle, safeZ, partToGenerate = 'both', cornerClearance, jointOnly
    } = params;

    const numericWidth = parseFloat(String(width));
    const numericLength = parseFloat(String(length));
    const numericDepth = parseFloat(String(depth));
    const numericNumberOfFingers = parseFloat(String(numberOfFingers));
    const numericTolerance = parseFloat(String(tolerance)) || 0;
    const numericFingerStickOut = parseFloat(String(fingerStickOut)) || 0;
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericFeed = parseFloat(String(feed));
    const numericPlungeFeed = parseFloat(String(plungeFeed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));

    if ([numericWidth, numericLength, numericDepth, numericNumberOfFingers, numericDepthPerPass, numericFeed, numericSpindle, numericSafeZ].some(isNaN)) {
        return { error: 'Fill required fields', code: [], paths: [], bounds: {} as Bounds };
    }

    const code = [
        `(--- Box Joint Generator ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `(Length: ${numericLength}, Depth: ${numericDepth}, Fingers: ${numericNumberOfFingers})`,
        `(Part: ${partToGenerate})`,
        `G21 G90`, `M3 S${numericSpindle}`, `G0 Z${numericSafeZ.toFixed(3)}`
    ];

    const paths: PreviewPath[] = [];
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };

    const R = toolDiameter / 2;
    const WT = numericDepth;
    const feedRate = numericFeed;
    const plunge = numericPlungeFeed;

    const addPanel = (pW: number, pH: number, startWithPin: boolean, label: string, offsetX: number, offsetY: number) => {
        code.push(`(--- Cutting Board ${label} ---)`);

        const divisions = numericNumberOfFingers * 2 - 1;
        const fW = pH / divisions;

        const cutDepth = WT + numericFingerStickOut;

        const zPasses: number[] = [];
        let curZ = 0;
        const stepZBoundary = -Math.max(R, 3);
        while (curZ > -cutDepth) {
            let nextZ = curZ - numericDepthPerPass;
            if (cornerClearance === 'finger_cutout' && curZ > stepZBoundary && nextZ < stepZBoundary) {
                nextZ = stepZBoundary;
            }
            if (nextZ < -cutDepth) nextZ = -cutDepth;
            zPasses.push(nextZ);
            curZ = nextZ;
        }

        for (let pass = 0; pass < zPasses.length; pass++) {
            const currentZ = zPasses[pass];
            const isLastPass = pass === zPasses.length - 1;
            let pathD = "";
            let isFirstPoint = true;

            const addPt = (x: number, y: number, isRapid: boolean = false) => {
                const absX = x + offsetX;
                const absY = y + offsetY;
                code.push(`G${isRapid ? '0' : '1'} X${absX.toFixed(3)} Y${absY.toFixed(3)}${isRapid ? '' : ` F${feedRate}`}`);
                if (isFirstPoint) {
                    pathD += `M ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                    isFirstPoint = false;
                } else {
                    pathD += ` L ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                }
                bounds.minX = Math.min(bounds.minX, absX);
                bounds.maxX = Math.max(bounds.maxX, absX);
                bounds.minY = Math.min(bounds.minY, absY);
                bounds.maxY = Math.max(bounds.maxY, absY);
            };

            const getBoundaryY = (idx: number, isLeft: boolean) => {
                let y = isLeft ? (pH - idx * fW) : (idx * fW);
                if (idx > 0 && idx < divisions) {
                    const pinIsPrev = ((idx - 1) % 2 === 0) === startWithPin;
                    const tOffset = numericTolerance / 2;
                    if (isLeft) {
                        y += pinIsPrev ? tOffset : -tOffset;
                    } else {
                        y += pinIsPrev ? -tOffset : tOffset;
                    }
                }

                if (cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && idx > 0 && idx < divisions) {
                    const isPinAbove = idx > 0 && ((idx - 1) % 2 === 0) === startWithPin;
                    const isPinBelow = idx < divisions && (idx % 2 === 0) === startWithPin;
                    const step = Math.min(R, fW / 4);
                    if (isLeft) {
                        if (isPinAbove) y += step;
                        if (isPinBelow) y -= step;
                    } else {
                        if (isPinAbove) y -= step;
                        if (isPinBelow) y += step;
                    }
                }
                return y;
            };

            const applyCC = (x: number, y: number, vx: number, vy: number) => {
                if (cornerClearance === 'none') return;
                if (cornerClearance === 'finger_cutout' && currentZ < stepZBoundary) {
                     addPt(x + vx * R * 0.5, y + vy * R * 0.5);
                     addPt(x, y);
                     return;
                }
                if (cornerClearance === 'dogbone') {
                    addPt(x + vx * R, y + vy * R);
                    addPt(x, y);
                } else if (cornerClearance === 't_bone') {
                    addPt(x, y + vy * R);
                    addPt(x, y);
                }
            };

            addPt(-R, pH + R, true);
            addPt(-R, pH, true);
            code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);

            // Left Edge (fingers side)
            for (let i = 0; i < divisions; i++) {
                const isPin = startWithPin ? (i % 2 === 0) : (i % 2 !== 0);
                const yTop = getBoundaryY(i, true);
                const yBot = getBoundaryY(i + 1, true);

                if (isPin) {
                    addPt(-R, yBot);
                } else {
                    const stepActiveTop = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i > 0;
                    const stepActiveBot = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i < divisions - 1;
                    const baseDepthTop = stepActiveTop ? cutDepth - R * 0.75 : cutDepth - R;
                    const baseDepthBot = stepActiveBot ? cutDepth - R * 0.75 : cutDepth - R;

                    addPt(-R, yTop - R);
                    addPt(baseDepthTop, yTop - R);
                    applyCC(cutDepth - R, yTop - R, 1, 1);
                    
                    addPt(baseDepthBot, yBot + R);
                    applyCC(cutDepth - R, yBot + R, 1, -1);
                    
                    addPt(-R, yBot + R);
                    addPt(-R, yBot);
                }
            }

            // Outline around the rest of the board - skip if jointOnly is true
            if (!jointOnly) {
                addPt(-R, -R);
                addPt(pW + R, -R);
                addPt(pW + R, pH + R);
                addPt(-R, pH + R);
            }

            if (isLastPass) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
            }
        }
        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    };

    const spacing = toolDiameter * 4;
    if (partToGenerate === 'A' || partToGenerate === 'both') {
        addPanel(numericWidth, numericLength, true, "A", 0, 0);
    }
    if (partToGenerate === 'B' || partToGenerate === 'both') {
        const offset = (partToGenerate === 'both') ? (numericWidth + spacing) : 0;
        addPanel(numericWidth, numericLength, false, "B", offset, 0);
    }

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);

    if (bounds.minX === Infinity) {
        bounds.minX = 0;
        bounds.maxX = numericWidth;
        bounds.minY = 0;
        bounds.maxY = numericLength;
    }

    return { code, paths, bounds, error: null };
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

const generateDrawerCode = (machineSettings: MachineSettings, drawerParams: DrawerParams, toolLibrary: Tool[], unit: string) => {
    const toolIndex = toolLibrary.findIndex(t => t.id === drawerParams.toolId);
    if (toolIndex === -1) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: null, code: [], paths: [], bounds: {} as Bounds };
    const toolDiameter = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);

    const {
        width, height, depth, woodThickness, joineryType, cornerClearance, tolerance,
        depthPerPass, feed, plungeFeed, spindle, safeZ, partToGenerate = 'all'
    } = drawerParams;

    const numericWidth = parseFloat(String(width));
    const numericHeight = parseFloat(String(height));
    const numericDepth = parseFloat(String(depth));
    const numericWoodThickness = parseFloat(String(woodThickness));
    const numericDepthPerPass = parseFloat(String(depthPerPass));
    const numericFeed = parseFloat(String(feed));
    const numericPlungeFeed = parseFloat(String(plungeFeed));
    const numericSpindle = parseFloat(String(spindle));
    const numericSafeZ = parseFloat(String(safeZ));
    const numericTolerance = parseFloat(String(tolerance)) || 0;

    if ([numericWidth, numericHeight, numericDepth, numericWoodThickness, numericDepthPerPass, numericFeed, numericSpindle, numericSafeZ].some(isNaN)) {
        return { error: 'Fill required drawer fields', code: [], paths: [], bounds: {} as Bounds };
    }

    const code = [
        `(--- Drawer Generator ---)`,
        `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
        `(Width: ${numericWidth}, Height: ${numericHeight}, Depth: ${numericDepth})`,
        `(Joinery: ${joineryType}, Corner Clearance: ${cornerClearance})`,
        `(Part: ${partToGenerate})`,
        `G21 G90`, `M3 S${numericSpindle}`, `G0 Z${numericSafeZ.toFixed(3)}`
    ];

    const paths: PreviewPath[] = [];
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };

    const R = toolDiameter / 2;
    const WT = numericWoodThickness;
    const feedRate = numericFeed;
    const plunge = numericPlungeFeed;

    const addPanel = (pW: number, pH: number, startWithPin: boolean, label: string, offsetX: number, offsetY: number) => {
        code.push(`(--- Cutting ${label} Panel ---)`);

        if (joineryType === 'finger') {
            const fingerWidthParam = parseFloat(String(drawerParams.fingerWidth));
            const fingers = Math.max(1, Math.round(pH / fingerWidthParam));
            const fW = pH / fingers;

            const zPasses: number[] = [];
            let curZ = 0;
            const stepZBoundary = -Math.max(R, 3); // Step for the first 3-R mm
            while (curZ > -numericWoodThickness) {
                let nextZ = curZ - numericDepthPerPass;
                if (cornerClearance === 'finger_cutout' && curZ > stepZBoundary && nextZ < stepZBoundary) {
                    nextZ = stepZBoundary;
                }
                if (nextZ < -numericWoodThickness) nextZ = -numericWoodThickness;
                zPasses.push(nextZ);
                curZ = nextZ;
            }

            for (let pass = 0; pass < zPasses.length; pass++) {
                const currentZ = zPasses[pass];
                const isLastPass = pass === zPasses.length - 1;
                let pathD = "";
                let isFirstPoint = true;

                const addPt = (x: number, y: number, isRapid: boolean = false) => {
                    const absX = x + offsetX;
                    const absY = y + offsetY;
                    code.push(`G${isRapid ? '0' : '1'} X${absX.toFixed(3)} Y${absY.toFixed(3)}${isRapid ? '' : ` F${feedRate}`}`);
                    if (isFirstPoint) {
                        pathD += `M ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                        isFirstPoint = false;
                    } else {
                        pathD += ` L ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                    }
                    bounds.minX = Math.min(bounds.minX, absX);
                    bounds.maxX = Math.max(bounds.maxX, absX);
                    bounds.minY = Math.min(bounds.minY, absY);
                    bounds.maxY = Math.max(bounds.maxY, absY);
                };

                const getBoundaryY = (idx: number, isLeft: boolean) => {
                    let y = isLeft ? (pH - idx * fW) : (idx * fW);
                    
                    // Tolerance adjustment (idx 0 and fingers are fixed board edges)
                    if (idx > 0 && idx < fingers) {
                        const pinIsPrev = ((idx - 1) % 2 === 0) === startWithPin;
                        const tOffset = numericTolerance / 2;
                        if (isLeft) {
                            // y = pH - (idx*fW). To move y UP (towards prev pin), we must decrease idx*fW.
                            y += pinIsPrev ? tOffset : -tOffset;
                        } else {
                            // y = idx*fW. To move y DOWN (towards prev pin), we must decrease idx*fW.
                            y += pinIsPrev ? -tOffset : tOffset;
                        }
                    }

                    if (cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && idx > 0 && idx < fingers) {
                        const isPinAbove = idx > 0 && ((idx - 1) % 2 === 0) === startWithPin;
                        const isPinBelow = idx < fingers && (idx % 2 === 0) === startWithPin;
                        const step = Math.min(R, fW / 4);
                        if (isLeft) {
                            if (isPinAbove) y += step;
                            if (isPinBelow) y -= step;
                        } else {
                            if (isPinAbove) y -= step;
                            if (isPinBelow) y += step;
                        }
                    }
                    return y;
                };

                addPt(-R, pH + R, true);
                code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);

                // Left Edge (going down)
                for (let i = 0; i < fingers; i++) {
                    const isPin = startWithPin ? (i % 2 === 0) : (i % 2 !== 0);
                    const yTop = getBoundaryY(i, true);
                    const yBot = getBoundaryY(i + 1, true);

                    if (isPin) {
                        addPt(-R, yBot);
                    } else {
                        const stepActiveTop = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i > 0;
                        const stepActiveBot = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i < fingers - 1;
                        
                        // X depth adjustment for steps
                        const stepXDepth = WT - R;
                        const baseDepthTop = stepActiveTop ? WT - R * 0.75 : stepXDepth;
                        const baseDepthBot = stepActiveBot ? WT - R * 0.75 : stepXDepth;
                        
                        addPt(-R, yTop - R);
                        addPt(baseDepthTop, yTop - R);
                        
                        if (cornerClearance === 'dogbone') {
                            addPt(WT - R * 0.707, yTop - R * 0.707);
                            addPt(WT - R, yTop - R);
                        } else if (cornerClearance === 't_bone') {
                            addPt(WT - R, yTop);
                            addPt(WT - R, yTop - R);
                        } else if (cornerClearance === 'finger_cutout' && currentZ < stepZBoundary) {
                            addPt(WT - R * 0.5, yTop - R * 0.5);
                            addPt(WT - R, yTop - R);
                        }
                        
                        if (stepActiveTop && !stepActiveBot) {
                             addPt(baseDepthTop, yBot + R); // Connect to bot without stepping
                        } else if (!stepActiveTop && stepActiveBot) {
                             addPt(baseDepthBot, yTop - R); 
                             addPt(baseDepthBot, yBot + R);
                        } else {
                             addPt(baseDepthBot, yBot + R);
                        }
                        
                        if (cornerClearance === 'dogbone') {
                            addPt(WT - R * 0.707, yBot + R * 0.707);
                            addPt(WT - R, yBot + R);
                        } else if (cornerClearance === 't_bone') {
                            addPt(WT - R, yBot);
                            addPt(WT - R, yBot + R);
                        } else if (cornerClearance === 'finger_cutout' && currentZ < stepZBoundary) {
                            addPt(WT - R * 0.5, yBot + R * 0.5);
                            addPt(WT - R, yBot + R);
                        }
                        
                        addPt(-R, yBot + R);
                        addPt(-R, yBot);
                    }
                }

                // Corner: Bottom-Left
                addPt(-R, -R);
                // Bottom Edge
                addPt(pW + R, -R);

                // Right Edge (going up)
                for (let i = 0; i < fingers; i++) {
                    const isPin = startWithPin ? (i % 2 === 0) : (i % 2 !== 0);
                    const yBot = getBoundaryY(i, false);
                    const yTop = getBoundaryY(i + 1, false);

                    if (isPin) {
                        addPt(pW + R, yTop);
                    } else {
                        const stepActiveBot = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i > 0;
                        const stepActiveTop = cornerClearance === 'finger_cutout' && currentZ >= stepZBoundary && i < fingers - 1;

                        const stepXDepth = pW - WT + R;
                        const baseDepthBot = stepActiveBot ? pW - WT + R * 0.75 : stepXDepth;
                        const baseDepthTop = stepActiveTop ? pW - WT + R * 0.75 : stepXDepth;

                        addPt(pW + R, yBot + R);
                        addPt(baseDepthBot, yBot + R);
                        
                        if (cornerClearance === 'dogbone') {
                            addPt(pW - WT + R * 0.707, yBot + R * 0.707);
                            addPt(pW - WT + R, yBot + R);
                        } else if (cornerClearance === 't_bone') {
                            addPt(pW - WT + R, yBot);
                            addPt(pW - WT + R, yBot + R);
                        } else if (cornerClearance === 'finger_cutout' && currentZ < stepZBoundary) {
                            addPt(pW - WT + R * 0.5, yBot + R * 0.5);
                            addPt(pW - WT + R, yBot + R);
                        }
                        
                        if (stepActiveBot && !stepActiveTop) {
                            addPt(baseDepthBot, yTop - R);
                        } else if (!stepActiveBot && stepActiveTop) {
                            addPt(baseDepthTop, yBot + R);
                            addPt(baseDepthTop, yTop - R);
                        } else {
                            addPt(baseDepthTop, yTop - R);
                        }
                        
                        if (cornerClearance === 'dogbone') {
                            addPt(pW - WT + R * 0.707, yTop - R * 0.707);
                            addPt(pW - WT + R, yTop - R);
                        } else if (cornerClearance === 't_bone') {
                            addPt(pW - WT + R, yTop);
                            addPt(pW - WT + R, yTop - R);
                        } else if (cornerClearance === 'finger_cutout' && currentZ < stepZBoundary) {
                            addPt(pW - WT + R * 0.5, yTop - R * 0.5);
                            addPt(pW - WT + R, yTop - R);
                        }
                        
                        addPt(pW + R, yTop - R);
                        addPt(pW + R, yTop);
                    }
                }

                // Corner: Top-Right
                addPt(pW + R, pH + R);
                // Top Edge
                addPt(-R, pH + R);

                if (isLastPass) {
                    paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
                } else if (cornerClearance === 'finger_cutout' && Math.abs(currentZ - stepZBoundary) < 0.01) {
                    paths.push({ d: pathD, stroke: 'var(--color-accent-blue)', strokeDasharray: '4' });
                }
            }
            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        } else {
            // Butt joint placeholder
            const totalPasses = Math.ceil(WT / numericDepthPerPass);
            for (let pass = 1; pass <= totalPasses; pass++) {
                const cz = Math.max(-pass * numericDepthPerPass, -WT);
                let isFirstPoint = true;
                let pathD = "";
                const addPt = (x: number, y: number, isRapid: boolean = false) => {
                    const absX = x + offsetX;
                    const absY = y + offsetY;
                    code.push(`G${isRapid ? '0' : '1'} X${absX.toFixed(3)} Y${absY.toFixed(3)}${isRapid ? '' : ` F${feedRate}`}`);
                    if (isFirstPoint) {
                        pathD += `M ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                        isFirstPoint = false;
                    } else {
                        pathD += ` L ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                    }
                    bounds.minX = Math.min(bounds.minX, absX);
                    bounds.maxX = Math.max(bounds.maxX, absX);
                    bounds.minY = Math.min(bounds.minY, absY);
                    bounds.maxY = Math.max(bounds.maxY, absY);
                };

                addPt(-R, -R, true);
                code.push(`G1 Z${cz.toFixed(3)} F${plunge}`);
                addPt(pW + R, -R);
                addPt(pW + R, pH + R);
                addPt(-R, pH + R);
                addPt(-R, -R);
                if (pass === totalPasses) {
                    paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
                }
            }
            code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        }
    };

    const addBottomPanel = (offX: number, offY: number) => {
        code.push(`(--- Cutting Bottom Panel ---)`);
        const bW = numericWidth - WT;
        const bD = numericDepth - WT;
        const totalPasses = Math.ceil(WT / numericDepthPerPass);
        for (let pass = 1; pass <= totalPasses; pass++) {
            const cz = Math.max(-pass * numericDepthPerPass, -WT);
            let isFirstPoint = true;
            let pathD = "";
            const addPt = (x: number, y: number, isRapid: boolean = false) => {
                const absX = x + offX;
                const absY = y + offY;
                code.push(`G${isRapid ? '0' : '1'} X${absX.toFixed(3)} Y${absY.toFixed(3)}${isRapid ? '' : ` F${feedRate}`}`);
                if (isFirstPoint) {
                    pathD += `M ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                    isFirstPoint = false;
                } else {
                    pathD += ` L ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                }
                bounds.minX = Math.min(bounds.minX, absX);
                bounds.maxX = Math.max(bounds.maxX, absX);
                bounds.minY = Math.min(bounds.minY, absY);
                bounds.maxY = Math.max(bounds.maxY, absY);
            };

            addPt(-R, -R, true);
            code.push(`G1 Z${cz.toFixed(3)} F${plunge}`);
            addPt(bW + R, -R);
            addPt(bW + R, bD + R);
            addPt(-R, bD + R);
            addPt(-R, -R);
            if (pass === totalPasses) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
            }
        }
        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    }

    const spacing = toolDiameter * 3;
    if (partToGenerate === 'all' || partToGenerate === 'front') addPanel(numericWidth, numericHeight, false, "Front", 0, 0);
    if (partToGenerate === 'all' || partToGenerate === 'back') addPanel(numericWidth, numericHeight, false, "Back", (partToGenerate === 'all' ? numericWidth + spacing : 0), 0);
    if (partToGenerate === 'all' || partToGenerate === 'left') addPanel(numericDepth, numericHeight, true, "Left Side", 0, (partToGenerate === 'all' ? numericHeight + spacing : 0));
    if (partToGenerate === 'all' || partToGenerate === 'right') addPanel(numericDepth, numericHeight, true, "Right Side", (partToGenerate === 'all' ? numericWidth + spacing : 0), (partToGenerate === 'all' ? numericHeight + spacing : 0));
    if (partToGenerate === 'all' || partToGenerate === 'bottom') addBottomPanel(0, (partToGenerate === 'all' ? (numericHeight + spacing) * 2 : 0));

    code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
    code.push(`M5`);

    if (bounds.minX === Infinity) bounds.minX = 0;
    if (bounds.maxX === -Infinity) bounds.maxX = numericWidth;
    if (bounds.minY === Infinity) bounds.minY = 0;
    if (bounds.maxY === -Infinity) bounds.maxY = numericHeight;

    return { code, paths, bounds, error: null };
};

const generateMortiseTenonCode = (
    machineSettings: MachineSettings,
    params: MortiseTenonParams,
    toolLibrary: Tool[],
    unit: string
) => {
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const code: string[] = [];
    const paths: PreviewPath[] = [];

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: "No tool selected", code, paths, bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "No tool selected", code, paths, bounds };

    const W = parseFloat(String(params.width));
    const L = parseFloat(String(params.height));
    const D = parseFloat(String(params.depth));
    const M_TOL = parseFloat(String(params.tolerance || 0));

    const feed = parseFloat(String(params.feed));
    const plunge = parseFloat(String(params.plungeFeed));
    const spindle = parseFloat(String(params.spindle));
    const safeZ = parseFloat(String(params.safeZ));
    const dpp = parseFloat(String(params.depthPerPass));
    const toolDiam = parseFloat(String(selectedTool.diameter));
    const R = toolDiam / 2;

    if (isNaN(W) || isNaN(L) || isNaN(D) || W <= toolDiam || L <= toolDiam) {
        return { error: "Mortise width/height must be strictly greater than tool diameter.", code, paths, bounds };
    }

    code.push(`(--- Mortise & Tenon Generator ---)`);
    code.push(`(Tool: ${selectedTool.name} - Ø${toolDiam}mm)`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);

    const updateBounds = (x: number, y: number) => {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
    };

    const addMortise = (offsetX: number, offsetY: number) => {
        code.push(`(--- Cutting Mortise at X:${offsetX}, Y:${offsetY} ---)`);
        const stepover = toolDiam * 0.4;

        const mw = W + M_TOL;
        const ml = L + M_TOL;
        const totalPasses = Math.ceil(D / dpp);
        let currentZ = 0;

        for (let pass = 1; pass <= totalPasses; pass++) {
            currentZ = Math.max(currentZ - dpp, -D);
            const isLastPass = pass === totalPasses;

            const maxPx = mw / 2 - R;
            const maxPy = ml / 2 - R;

            if (maxPx < 0 || maxPy < 0) continue;

            const numSpirals = Math.ceil(Math.max(maxPx, maxPy) / stepover);

            let pathD = "";
            const addPt = (x: number, y: number) => {
                updateBounds(offsetX + x, offsetY + y);
                code.push(`G1 X${(offsetX + x).toFixed(3)} Y${(offsetY + y).toFixed(3)} F${feed}`);
                if (isLastPass) {
                    if (pathD === "") pathD += `M ${(offsetX + x).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
                    else pathD += `L ${(offsetX + x).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
                }
            };

            const addCornerRelief = (px: number, py: number) => {
                const jointType = params.jointType;
                if (!jointType || jointType === 'standard') return;

                const signX = px >= 0 ? 1 : -1;
                const signY = py >= 0 ? 1 : -1;

                if (jointType === 'dogbone') {
                    const angle = Math.atan2(signY, signX);
                    const dist = toolDiam * 0.7; // Clear corner diagonally
                    addPt(px + Math.cos(angle) * dist, py + Math.sin(angle) * dist);
                    addPt(px, py);
                } else if (jointType === 'tbone') {
                    // T-bone: extend the cut along the long axis to clear the short side corner
                    if (W >= L) {
                        addPt(px + signX * toolDiam * 0.6, py);
                        addPt(px, py);
                    } else {
                        addPt(px, py + signY * toolDiam * 0.6);
                        addPt(px, py);
                    }
                }
            };

            for (let step = 0; step <= numSpirals; step++) {
                const r = (numSpirals - step) * stepover;
                const px = Math.max(0, maxPx - r);
                const py = Math.max(0, maxPy - r);

                if (step === 0) {
                    code.push(`G0 X${(offsetX - px).toFixed(3)} Y${(offsetY - py).toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                }

                if (px <= 0.001 && py <= 0.001) {
                    addPt(0, 0);
                } else if (px <= 0.001) {
                    addPt(0, -py);
                    if (step === numSpirals) addCornerRelief(0, -py);
                    addPt(0, py);
                    if (step === numSpirals) addCornerRelief(0, py);
                } else if (py <= 0.001) {
                    addPt(-px, 0);
                    if (step === numSpirals) addCornerRelief(-px, 0);
                    addPt(px, 0);
                    if (step === numSpirals) addCornerRelief(px, 0);
                } else {
                    addPt(-px, -py);
                    if (step === numSpirals) addCornerRelief(-px, -py);
                    addPt(px, -py);
                    if (step === numSpirals) addCornerRelief(px, -py);
                    addPt(px, py);
                    if (step === numSpirals) addCornerRelief(px, py);
                    addPt(-px, py);
                    if (step === numSpirals) addCornerRelief(-px, py);
                    addPt(-px, -py); // close loop
                }
            }

            if (isLastPass && pathD) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-blue)' });
            }
        }
        code.push(`G0 Z${safeZ.toFixed(3)}`);
    };

    const addTenon = (offsetX: number, offsetY: number) => {
        code.push(`(--- Cutting Tenon at X:${offsetX}, Y:${offsetY} ---)`);
        const tw = W - M_TOL;
        const tl = L - M_TOL;

        const cx = tw / 2 - R;
        const cy = tl / 2 - R;

        const totalPasses = Math.ceil(D / dpp);
        let currentZ = 0;

        for (let pass = 1; pass <= totalPasses; pass++) {
            currentZ = Math.max(currentZ - dpp, -D);
            const isLastPass = pass === totalPasses;

            // --- Material Clearing Loop ---
            const clearingW = parseFloat(String(params.clearingWidth)) || 0;
            const clearingL = parseFloat(String(params.clearingLength)) || 0;

            if (clearingW > tw || clearingL > tl) {
                code.push(`(--- Material Clearing Pass at Z:${currentZ.toFixed(3)} ---)`);
                const stepover = toolDiam * 0.45;
                
                // Effective clearing bounds (center relative)
                const startCW = (tw / 2) + R;
                const startCL = (tl / 2) + R;
                const endCW = Math.max(startCW, clearingW / 2 - R);
                const endCL = Math.max(startCL, clearingL / 2 - R);

                const distW = endCW - startCW;
                const distL = endCL - startCL;
                const numClearingPasses = Math.max(1, Math.ceil(Math.max(distW, distL) / stepover) + 1);

                let clearingPathD = "";

                for (let cp = 0; cp < numClearingPasses; cp++) {
                    const r = cp * stepover;
                    const px = Math.min(endCW, startCW + r);
                    const py = Math.min(endCL, startCL + r);

                    code.push(`G0 X${(offsetX - px).toFixed(3)} Y${(offsetY - py).toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                    
                    if (isLastPass && cp === 0) clearingPathD += `M ${(offsetX - px).toFixed(3)} ${(offsetY - py).toFixed(3)} `;

                    const addCPPt = (cxp: number, cyp: number) => {
                        updateBounds(offsetX + cxp, offsetY + cyp);
                        code.push(`G1 X${(offsetX + cxp).toFixed(3)} Y${(offsetY + cyp).toFixed(3)} F${feed}`);
                        if (isLastPass) {
                            clearingPathD += `L ${(offsetX + cxp).toFixed(3)} ${(offsetY + cyp).toFixed(3)} `;
                        }
                    };

                    addCPPt(px, -py);
                    addCPPt(px, py);
                    addCPPt(-px, py);
                    addCPPt(-px, -py);
                    
                    if (isLastPass && cp < numClearingPasses - 1) {
                        // Move to next starting point in preview
                        const nextR = (cp + 1) * stepover;
                        const npx = Math.min(endCW, startCW + nextR);
                        const npy = Math.min(endCL, startCL + nextR);
                        clearingPathD += `M ${(offsetX - npx).toFixed(3)} ${(offsetY - npy).toFixed(3)} `;
                    }
                }
                
                if (isLastPass && clearingPathD) {
                    paths.push({ d: clearingPathD, stroke: 'var(--color-accent-blue)', strokeWidth: '0.5' });
                }
                code.push(`G0 Z${(currentZ + 2).toFixed(3)}`); // Small lift between clearing and tenon profile
            }

            // Retract & Plunge to start point for tenon profile
            code.push(`G0 X${(offsetX + 0).toFixed(3)} Y${(offsetY + cy + 2 * R).toFixed(3)}`);
            code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);

            let pathD = `M ${(offsetX + 0).toFixed(3)} ${(offsetY + cy + 2 * R).toFixed(3)} `;

            const addLine = (x: number, y: number) => {
                updateBounds(offsetX + x, offsetY + y);
                code.push(`G1 X${(offsetX + x).toFixed(3)} Y${(offsetY + y).toFixed(3)} F${feed}`);
                if (isLastPass) pathD += `L ${(offsetX + x).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
            };

            const addTenonRelief = (px: number, py: number) => {
                const jointType = params.jointType;
                if (!jointType || jointType === 'standard') return;

                const signX = px >= 0 ? 1 : -1;
                const signY = py >= 0 ? 1 : -1;

                if (jointType === 'dogbone') {
                    const angle = Math.atan2(signY, signX);
                    const dist = toolDiam * 0.7;
                    addLine(px + Math.cos(angle) * dist, py + Math.sin(angle) * dist);
                    addLine(px, py);
                } else if (jointType === 'tbone') {
                    if (W >= L) {
                        addLine(px + signX * toolDiam * 0.6, py);
                        addLine(px, py);
                    } else {
                        addLine(px, py + signY * toolDiam * 0.6);
                        addLine(px, py);
                    }
                }
            };

            addLine(cx, cy + 2 * R);
            addTenonRelief(cx, cy + 2 * R);

            code.push(`G2 X${(offsetX + cx + 2 * R).toFixed(3)} Y${(offsetY + cy).toFixed(3)} I0 J${(-2 * R).toFixed(3)} F${feed}`);
            if (isLastPass) pathD += `A ${2 * R} ${2 * R} 0 0 1 ${(offsetX + cx + 2 * R).toFixed(3)} ${(offsetY + cy).toFixed(3)} `;
            updateBounds(offsetX + cx + 2 * R, offsetY + cy);
            addTenonRelief(cx + 2 * R, cy);

            addLine(cx + 2 * R, -cy);
            addTenonRelief(cx + 2 * R, -cy);

            code.push(`G2 X${(offsetX + cx).toFixed(3)} Y${(offsetY - cy - 2 * R).toFixed(3)} I${(-2 * R).toFixed(3)} J0 F${feed}`);
            if (isLastPass) pathD += `A ${2 * R} ${2 * R} 0 0 1 ${(offsetX + cx).toFixed(3)} ${(offsetY - cy - 2 * R).toFixed(3)} `;
            updateBounds(offsetX + cx, offsetY - cy - 2 * R);
            addTenonRelief(cx, -cy - 2 * R);

            addLine(-cx, -cy - 2 * R);
            addTenonRelief(-cx, -cy - 2 * R);

            code.push(`G2 X${(offsetX - cx - 2 * R).toFixed(3)} Y${(offsetY - cy).toFixed(3)} I0 J${(2 * R).toFixed(3)} F${feed}`);
            if (isLastPass) pathD += `A ${2 * R} ${2 * R} 0 0 1 ${(offsetX - cx - 2 * R).toFixed(3)} ${(offsetY - cy).toFixed(3)} `;
            updateBounds(offsetX - cx - 2 * R, offsetY - cy);
            addTenonRelief(-cx - 2 * R, -cy);

            addLine(-cx - 2 * R, cy);
            addTenonRelief(-cx - 2 * R, cy);

            code.push(`G2 X${(offsetX - cx).toFixed(3)} Y${(offsetY + cy + 2 * R).toFixed(3)} I${(2 * R).toFixed(3)} J0 F${feed}`);
            if (isLastPass) pathD += `A ${2 * R} ${2 * R} 0 0 1 ${(offsetX - cx).toFixed(3)} ${(offsetY + cy + 2 * R).toFixed(3)} `;
            updateBounds(offsetX - cx, offsetY + cy + 2 * R);
            addTenonRelief(-cx, cy + 2 * R);

            addLine(0, cy + 2 * R);

            if (isLastPass && pathD) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
            }
        }
    };

    if (params.partToGenerate === 'both') {
        const spacing = Math.max(W / 2 + toolDiam * 2, L / 2 + toolDiam * 2);
        addMortise(-spacing, 0);
        addTenon(spacing, 0);
    } else if (params.partToGenerate === 'mortise') {
        addMortise(0, 0);
    } else if (params.partToGenerate === 'tenon') {
        addTenon(0, 0);
    }

    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`M5`);

    return { code, paths, bounds, error: null };
};

const generateHalfLapCode = (machineSettings: MachineSettings, params: HalfLapParams, toolLibrary: Tool[], unit: string) => {
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const code: string[] = [];
    const paths: PreviewPath[] = [];

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: "No tool selected", code, paths, bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "No tool selected", code, paths, bounds };

    const width = parseFloat(String(params.width));
    const thickness = parseFloat(String(params.thickness));
    let lapLength = parseFloat(String(params.lapLength));
    
    // For mitered joints, lapLength is redundant and should match width for a 45-degree miter.
    // If it's NaN or we just want to force it, we use width.
    if (params.jointType === 'mitered' && (isNaN(lapLength) || lapLength === 0)) {
        lapLength = width;
    }

    const jointType = params.jointType;
    const partToGenerate = params.partToGenerate || 'both';
    const feed = parseFloat(String(params.feed));
    const plunge = parseFloat(String(params.plungeFeed));
    const spindle = parseFloat(String(params.spindle));
    const safeZ = parseFloat(String(params.safeZ));
    const dpp = parseFloat(String(params.depthPerPass));
    const toolDiam = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const R = toolDiam / 2;

    if (isNaN(width) || isNaN(thickness) || isNaN(lapLength) || width <= 0 || thickness <= 0 || lapLength <= 0) {
        return { error: "Check all required half lap fields.", code, paths, bounds };
    }

    code.push(`(--- Half Lap Joinery Generator ---)`);
    code.push(`(Tool: ${selectedTool.name} - Ø${toolDiam}${unit})`);
    code.push(`(Joint: ${jointType})`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);

    const updateBounds = (x: number, y: number) => {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
    };

    const addLap = (label: string, isPartB: boolean, offsetX: number, offsetY: number) => {
        code.push(`(--- Cutting ${label} ---)`);
        const targetDepth = -thickness / 2;
        const totalPasses = Math.ceil(Math.abs(targetDepth) / dpp);
        const stepover = toolDiam * 0.45;

        for (let pass = 1; pass <= totalPasses; pass++) {
            const currentZ = Math.max(targetDepth, -pass * dpp);
            const isLastPass = pass === totalPasses;
            let pathD = "";

            code.push(`(Pass ${pass} at Z:${currentZ.toFixed(3)})`);

            if (jointType === 'standard') {
                let y = R;
                while (y <= width - R) {
                    const startX = 0;
                    const endX = lapLength - R;
                    
                    code.push(`G0 X${(offsetX + startX).toFixed(3)} Y${(offsetY + y).toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                    code.push(`G1 X${(offsetX + endX).toFixed(3)} F${feed}`);
                    updateBounds(offsetX + startX, offsetY + y);
                    updateBounds(offsetX + endX, offsetY + y);
                    
                    if (isLastPass) {
                        pathD += `M ${(offsetX + startX).toFixed(3)} ${(offsetY + y).toFixed(3)} L ${(offsetX + endX).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
                    }
                    
                    if (y === width - R) break;
                    y += stepover;
                    if (y > width - R) y = width - R;
                }
            } else { // mitered
                const miterSlope = lapLength / width;
                
                if (!isPartB) {
                    // Piece A (Under/Socket): Square board with a triangular pocket.
                    // This creates a "socket" that the mitered Piece B fits into.
                    let y = R;
                    while (y <= width - R) {
                        const startX = 0;
                        const endX = (y * miterSlope) - R;
                        
                        if (endX >= startX) {
                            // Point at Y=0 (width-y when y is small)
                            code.push(`G0 X${(offsetX + startX).toFixed(3)} Y${(offsetY + width - y).toFixed(3)}`);
                            code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                            code.push(`G1 X${(offsetX + endX).toFixed(3)} F${feed}`);
                            updateBounds(offsetX + startX, offsetY + width - y);
                            updateBounds(offsetX + endX, offsetY + width - y);
                            if (isLastPass) pathD += `M ${(offsetX + startX).toFixed(3)} ${(offsetY + width - y).toFixed(3)} L ${(offsetX + endX).toFixed(3)} ${(offsetY + width - y).toFixed(3)} `;
                        }
                        
                        if (y === width - R) break;
                        y += stepover;
                        if (y > width - R) y = width - R;
                    }
                } else {
                    // Piece B (Over/Tongue): Mitered board (full thickness cut) with a triangular lap tongue.
                    // Rotated 180 degrees: Y moves from (width-y) to y, and X is mirrored across lapLength.
                    let y = R;
                    while (y <= width - R) {
                        const miterX = y * miterSlope;
                        const startX = lapLength - miterX + R;
                        const endX = lapLength;

                        if (endX >= startX) {
                            code.push(`G0 X${(offsetX + startX).toFixed(3)} Y${(offsetY + y).toFixed(3)}`);
                            code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                            code.push(`G1 X${(offsetX + endX).toFixed(3)} F${feed}`);
                            updateBounds(offsetX + startX, offsetY + y);
                            updateBounds(offsetX + endX, offsetY + y);
                            if (isLastPass) pathD += `M ${(offsetX + startX).toFixed(3)} ${(offsetY + y).toFixed(3)} L ${(offsetX + endX).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
                        }

                        if (y === width - R) break;
                        y += stepover;
                        if (y > width - R) y = width - R;
                    }
                }
            }

            if (isLastPass && pathD) {
                paths.push({ d: pathD, stroke: isPartB ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)' });
            }
        }
        code.push(`G0 Z${safeZ.toFixed(3)}`);
    };

    const spacing = width + toolDiam * 2;
    
    const generateMiterCut = (offsetX: number, offsetY: number, isPartB: boolean) => {
        // Only Piece B needs a miter cut (full depth) to fit into the socket of Piece A.
        // Piece A stays square at full thickness everywhere except the triangular pocket.
        if (!isPartB) return;

        code.push(`(--- Removing Miter Corner Piece B ---)`);
        const miterSlope = lapLength / width;
        const targetDepth = -thickness;
        const totalPasses = Math.ceil(Math.abs(targetDepth) / dpp);
        const stepover = toolDiam * 0.45;

        for (let pass = 1; pass <= totalPasses; pass++) {
            const currentZ = Math.max(targetDepth, -pass * dpp);
            const isLastPass = pass === totalPasses;
            let pathD = "";
            
            code.push(`(Pass ${pass} at Z:${currentZ.toFixed(3)})`);
            
            let y = R;
            while (y <= width - R) {
                const miterX = y * miterSlope;
                const startX = 0;
                const endX = lapLength - miterX - R;
                
                if (endX >= startX) {
                    code.push(`G0 X${(offsetX + startX).toFixed(3)} Y${(offsetY + y).toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                    code.push(`G1 X${(offsetX + endX).toFixed(3)} F${feed}`);
                    updateBounds(offsetX + startX, offsetY + y);
                    updateBounds(offsetX + endX, offsetY + y);
                    if (isLastPass) pathD += `M ${(offsetX + startX).toFixed(3)} ${(offsetY + y).toFixed(3)} L ${(offsetX + endX).toFixed(3)} ${(offsetY + y).toFixed(3)} `;
                }
                
                if (y === width - R) break;
                y += stepover;
                if (y > width - R) y = width - R;
            }
            if (isLastPass && pathD) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-red)' });
            }
        }
        code.push(`G0 Z${safeZ.toFixed(3)}`);
    };

    if (partToGenerate === 'A' || partToGenerate === 'both') {
        addLap("Piece A", false, 0, 0);
        if (jointType === 'mitered') {
            generateMiterCut(0, 0, false);
        }
    }
    if (partToGenerate === 'B' || partToGenerate === 'both') {
        const xOffset = (partToGenerate === 'both') ? (lapLength + spacing) : 0;
        addLap("Piece B", true, xOffset, 0);
        if (jointType === 'mitered') {
            generateMiterCut(xOffset, 0, true);
        }
    }

    code.push(`M5`);

    if (bounds.minX === Infinity) {
        bounds = { minX: 0, maxX: lapLength, minY: 0, maxY: width };
    }

    return { code, paths, bounds, error: null };
};

const generateDadoRabbetCode = (machineSettings: MachineSettings, params: DadoRabbetParams, toolLibrary: Tool[], unit: string) => {
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const code: string[] = [];
    const paths: PreviewPath[] = [];

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: "No tool selected", code, paths, bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "No tool selected", code, paths, bounds };

    const width = parseFloat(String(params.width));
    const length = parseFloat(String(params.length));
    const depth = parseFloat(String(params.depth));
    const offsetX = parseFloat(String(params.offsetX || 0));
    const offsetY = parseFloat(String(params.offsetY || 0));
    const feed = parseFloat(String(params.feed));
    const plunge = parseFloat(String(params.plungeFeed));
    const spindle = parseFloat(String(params.spindle));
    const safeZ = parseFloat(String(params.safeZ));
    const dpp = parseFloat(String(params.depthPerPass));
    const toolDiam = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const R = toolDiam / 2;

    if (isNaN(width) || isNaN(length) || isNaN(depth) || width <= 0 || length <= 0) {
        return { error: "Width and Length must be positive numbers.", code, paths, bounds };
    }

    code.push(`(--- Dado & Rabbet Generator ---)`);
    code.push(`(Tool: ${selectedTool.name} - Ø${toolDiam}${unit})`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);

    const updateBounds = (x: number, y: number) => {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
    };

    const totalPasses = Math.ceil(depth / dpp);
    const stepover = toolDiam * 0.4; // 40% stepover

    for (let pass = 1; pass <= totalPasses; pass++) {
        const currentZ = Math.max(-pass * dpp, -depth);
        const isLastPass = pass === totalPasses;
        let pathD = "";

        // Calculate movements based on orientation
        // We pocket the width by doing multiple linear passes if toolDiam < width
        const numPockets = Math.max(1, Math.ceil((width - toolDiam) / stepover) + 1);
        const actualStepover = numPockets > 1 ? (width - toolDiam) / (numPockets - 1) : 0;

        for (let i = 0; i < numPockets; i++) {
            const wOffset = -width / 2 + R + i * actualStepover;
            
            let xStart, yStart, xEnd, yEnd;
            if (params.orientation === 'horizontal') {
                // Length is along X, Width is along Y
                xStart = offsetX;
                yStart = offsetY + wOffset;
                xEnd = offsetX + length;
                yEnd = offsetY + wOffset;
            } else {
                // Length is along Y, Width is along X
                xStart = offsetX + wOffset;
                yStart = offsetY;
                xEnd = offsetX + wOffset;
                yEnd = offsetY + length;
            }

            // Move to start of this pass (X, Y)
            if (i === 0) {
                code.push(`G0 X${xStart.toFixed(3)} Y${yStart.toFixed(3)}`);
                code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
            } else {
                // Zig-zag behavior
                if (i % 2 === 0) {
                    code.push(`G1 X${xStart.toFixed(3)} Y${yStart.toFixed(3)} F${feed}`);
                } else {
                    code.push(`G1 X${xEnd.toFixed(3)} Y${yEnd.toFixed(3)} F${feed}`);
                }
            }

            // Draw line
            if (i % 2 === 0) {
                code.push(`G1 X${xEnd.toFixed(3)} Y${yEnd.toFixed(3)} F${feed}`);
                updateBounds(xStart, yStart);
                updateBounds(xEnd, yEnd);
                if (isLastPass) {
                    if (pathD === "") pathD += `M ${xStart.toFixed(3)} ${yStart.toFixed(3)} `;
                    pathD += `L ${xEnd.toFixed(3)} ${yEnd.toFixed(3)} `;
                }
            } else {
                code.push(`G1 X${xStart.toFixed(3)} Y${yStart.toFixed(3)} F${feed}`);
                updateBounds(xEnd, yEnd);
                updateBounds(xStart, yStart);
                if (isLastPass) {
                    if (pathD === "") pathD += `M ${xEnd.toFixed(3)} ${yEnd.toFixed(3)} `;
                    pathD += `L ${xStart.toFixed(3)} ${yStart.toFixed(3)} `;
                }
            }
        }

        if (isLastPass && pathD) {
            paths.push({ d: pathD, stroke: 'var(--color-accent-blue)' });
        }
        
        // Retract slightly between depth passes
        if (pass < totalPasses) {
            code.push(`G0 Z${(currentZ + 1).toFixed(3)}`);
        }
    }

    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`M5`);

    if (bounds.minX === Infinity) bounds = { minX: 0, maxX: length, minY: 0, maxY: width };

    return { code, paths, bounds, error: null };
};

const generateDecorativeJoineryCode = (machineSettings: MachineSettings, params: DecorativeJoineryParams, toolLibrary: Tool[], unit: string) => {
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const code: string[] = [];
    const paths: PreviewPath[] = [];

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: "No tool selected", code, paths, bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "No tool selected", code, paths, bounds };

    const length = parseFloat(String(params.length));
    const patternWidth = parseFloat(String(params.width));
    const depth = parseFloat(String(params.depth));
    const repeatCount = parseInt(String(params.repeatCount));
    const pitch = parseFloat(String(params.pitch));
    const tolerance = parseFloat(String(params.tolerance || 0));
    const inset = parseFloat(String(params.inset || 0));
    const offsetX = parseFloat(String(params.offsetX || 0));
    const offsetY = parseFloat(String(params.offsetY || 0));
    
    const feed = parseFloat(String(params.feed));
    const plunge = parseFloat(String(params.plungeFeed));
    const spindle = parseFloat(String(params.spindle));
    const safeZ = parseFloat(String(params.safeZ));
    const dpp = parseFloat(String(params.depthPerPass));
    const toolDiam = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const R = toolDiam / 2;

    if (isNaN(length) || isNaN(patternWidth) || isNaN(depth) || length <= 0 || repeatCount <= 0) {
        return { error: "Invalid dimensions or repeat count.", code, paths, bounds };
    }

    code.push(`(--- Native Interlocking Joinery ---)`);
    code.push(`(Type: ${params.type}, Part: ${params.part})`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);

    const updateBounds = (x: number, y: number) => {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
    };

    // Helper to generate a single repeat of the pattern
    const getPatternProfile = (t: number): { x: number, y: number } => {
        // t goes from 0 to 1 for one full repeat
        let x = t * pitch;
        let y = 0;

        if (params.type === 'wave') {
            y = Math.sin(t * Math.PI * 2) * (patternWidth / 2);
        } else if (params.type === 'puzzle') {
            if (t < 0.25) {
                y = 0;
            } else if (t < 0.75) {
                const innerT = (t - 0.25) / 0.5;
                const angle = innerT * Math.PI;
                x = 0.25 * pitch + (0.5 * pitch) / 2 + Math.cos(angle - Math.PI) * (0.5 * pitch / 2);
                y = Math.sin(angle) * patternWidth;
            } else {
                y = 0;
            }
        } else if (params.type === 'dovetail_inlay') {
             if (t < 0.2) {
                 y = 0;
             } else if (t < 0.4) {
                 const innerT = (t - 0.2) / 0.2;
                 y = innerT * patternWidth;
             } else if (t < 0.6) {
                 y = patternWidth;
             } else if (t < 0.8) {
                 const innerT = (t - 0.6) / 0.2;
                 y = (1 - innerT) * patternWidth;
             } else {
                 y = 0;
             }
        } else if (params.type === 'blind_mortise') {
            // Rectangular pattern: 0.25 low, 0.5 high, 0.25 low
            if (t < 0.25 || t > 0.75) {
                y = 0;
            } else {
                y = patternWidth;
            }
        }
        return { x, y };
    };

    const generatePart = (partType: 'socket' | 'pin', partOffset: { x: number, y: number }) => {
        const totalPasses = Math.ceil(depth / dpp);
        const isSocket = partType === 'socket';
        
        // Offset for tool radius and tolerance
        const gap = isSocket ? (tolerance / 2) : (-tolerance / 2);
        
        if (params.type === 'blind_mortise' && isSocket) {
            // For blind mortises, we cut distinct rectangular pockets
            const mortiseLength = pitch * 0.5; // Half of pitch is the mortise
            
            for (let pass = 1; pass <= totalPasses; pass++) {
                const currentZ = Math.max(-pass * dpp, -depth);
                const isLastPass = pass === totalPasses;
                code.push(`(Pass ${pass})`);

                for (let r = 0; r < repeatCount; r++) {
                    const startX = offsetX + partOffset.x + r * pitch + pitch * 0.25 - gap;
                    const startY = offsetY + partOffset.y + inset - gap;
                    const endX = startX + mortiseLength + 2 * gap;
                    const endY = startY + patternWidth + 2 * gap;
                    
                    // Simple pocketing routine: spiral or concentric for the rectangle
                    const innerR = Math.max(0, (patternWidth + 2 * gap) / 2 - R);
                    const innerL = Math.max(0, (mortiseLength + 2 * gap) / 2 - R);
                    
                    // Center of mortise
                    const cx = startX + (mortiseLength + 2 * gap) / 2;
                    const cy = startY + (patternWidth + 2 * gap) / 2;

                    code.push(`G0 X${cx.toFixed(3)} Y${cy.toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);
                    
                    // If narrow, just do a line
                    if (innerR < 0.1 && innerL < 0.1) {
                        code.push(`G1 X${startX.toFixed(3)} Y${(startY + endY) / 2} F${feed}`);
                        code.push(`G1 X${endX.toFixed(3)} Y${(startY + endY) / 2}`);
                    } else {
                        // Standard box pocket (one pass for now as it's typically small)
                        code.push(`G1 X${(startX + R).toFixed(3)} Y${(startY + R).toFixed(3)} F${feed}`);
                        code.push(`G1 X${(endX - R).toFixed(3)}`);
                        code.push(`G1 Y${(endY - R).toFixed(3)}`);
                        code.push(`G1 X${(startX + R).toFixed(3)}`);
                        code.push(`G1 Y${(startY + R).toFixed(3)}`);
                    }
                    
                    if (isLastPass) {
                        paths.push({ 
                            d: `M ${startX.toFixed(3)} ${startY.toFixed(3)} L ${endX.toFixed(3)} ${startY.toFixed(3)} L ${endX.toFixed(3)} ${endY.toFixed(3)} L ${startX.toFixed(3)} ${endY.toFixed(3)} Z`,
                            stroke: 'var(--color-accent-red)',
                            fill: 'var(--color-accent-red-muted)'
                        });
                    }
                    updateBounds(startX, startY);
                    updateBounds(endX, endY);
                }
                code.push(`G0 Z${safeZ.toFixed(3)}`);
            }
            return;
        }

        // For Pin/Tenon or other shapes, we use a profile path
        const points: { x: number, y: number }[] = [];
        const segments = 50; 
        
        for (let r = 0; r < repeatCount; r++) {
            for (let s = 0; s < segments; s++) {
                const { x, y } = getPatternProfile(s / segments);
                points.push({ x: x + r * pitch, y: y + (isSocket ? inset : 0) });
            }
        }
        const last = getPatternProfile(1);
        points.push({ x: last.x + (repeatCount - 1) * pitch, y: last.y + (isSocket ? inset : 0) });

        const transformedPoints = points.map(p => {
            let tx, ty;
            if (params.orientation === 'horizontal') {
                tx = p.x + offsetX + partOffset.x;
                ty = p.y + offsetY + partOffset.y;
            } else {
                tx = p.y + offsetX + partOffset.x;
                ty = p.x + offsetY + partOffset.y;
            }
            return { x: tx, y: ty };
        });

        for (let pass = 1; pass <= totalPasses; pass++) {
            const currentZ = Math.max(-pass * dpp, -depth);
            const isLastPass = pass === totalPasses;
            let pathD = "";

            code.push(`G0 X${transformedPoints[0].x.toFixed(3)} Y${transformedPoints[0].y.toFixed(3)}`);
            code.push(`G1 Z${currentZ.toFixed(3)} F${plunge}`);

            transformedPoints.forEach((p, idx) => {
                code.push(`G1 X${p.x.toFixed(3)} Y${p.y.toFixed(3)} F${feed}`);
                updateBounds(p.x, p.y);
                if (isLastPass) {
                    if (idx === 0) pathD += `M ${p.x.toFixed(3)} ${p.y.toFixed(3)} `;
                    else pathD += `L ${p.x.toFixed(3)} ${p.y.toFixed(3)} `;
                }
            });

            if (isLastPass && pathD) {
                paths.push({ d: pathD, stroke: isSocket ? 'var(--color-accent-red)' : 'var(--color-accent-blue)' });
            }

            code.push(`G0 Z${safeZ.toFixed(3)}`);
        }
    };

    if (params.part === 'socket' || params.part === 'both') {
        generatePart('socket', { x: 0, y: 0 });
    }
    if (params.part === 'pin' || params.part === 'both') {
        // Offset pin part for "both" mode to avoid overlap
        const layoutOffset = params.part === 'both' ? (patternWidth * 2 + 10) : 0;
        generatePart('pin', { 
            x: params.orientation === 'horizontal' ? 0 : layoutOffset, 
            y: params.orientation === 'horizontal' ? layoutOffset : 0 
        });
    }

    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`M5`);

    if (bounds.minX === Infinity) bounds = { minX: 0, maxX: length, minY: 0, maxY: patternWidth };

    return { code, paths, bounds, error: null };
};

const generateCabinetCode = (machineSettings: MachineSettings, params: CabinetParams, toolLibrary: Tool[], unit: string) => {
    let bounds: Bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const code: string[] = [];
    const paths: PreviewPath[] = [];

    const toolIndex = toolLibrary.findIndex(t => t.id === params.toolId);
    if (toolIndex === -1) return { error: "No tool selected", code, paths, bounds };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "No tool selected", code, paths, bounds };

    // Numerical conversions
    const width = parseFloat(String(params.width));
    const height = parseFloat(String(params.height));
    const depth = parseFloat(String(params.depth));
    const woodThickness = parseFloat(String(params.woodThickness));
    const backThickness = parseFloat(String(params.backThickness));
    const feed = parseFloat(String(params.feed));
    const plunge = parseFloat(String(params.plungeFeed));
    const spindle = parseFloat(String(params.spindle));
    const safeZ = parseFloat(String(params.safeZ));
    const dpp = parseFloat(String(params.depthPerPass));
    const toolDiam = (typeof selectedTool.diameter === 'string' ? parseFloat(selectedTool.diameter) || 0 : selectedTool.diameter);
    const R = toolDiam / 2;

    if ([width, height, depth, woodThickness].some(isNaN)) {
        return { error: "Width, Height, Depth, and Wood Thickness are required.", code, paths, bounds };
    }

    code.push(`(--- Cabinet Generator ---)`);
    code.push(`(Dimensions: ${width}x${height}x${depth}, Joinery: ${params.joineryType})`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);

    const updateBounds = (x: number, y: number) => {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
    };

    const addPart = (pW: number, pH: number, label: string, offsetX: number, offsetY: number, options: { 
        notch?: { w: number, h: number },
        fingers?: { top?: boolean, bottom?: boolean, left?: boolean, right?: boolean, startWithPin?: boolean }
    } = {}) => {
        code.push(`(--- Cutting ${label} ---)`);
        const totalPasses = Math.ceil(woodThickness / dpp);
        const fWidth = parseFloat(String(params.fingerWidth)) || 50;
        const cornerType = params.cornerClearance || 'none';
        const stepZBoundary = -Math.max(R, 3);
        
        for (let pass = 1; pass <= totalPasses; pass++) {
            const cz = Math.max(-pass * dpp, -woodThickness);
            let isFirstPoint = true;
            let pathD = "";
            
            const addPt = (x: number, y: number, isRapid: boolean = false) => {
                const absX = x + offsetX;
                const absY = y + offsetY;
                code.push(`G${isRapid ? '0' : '1'} X${absX.toFixed(3)} Y${absY.toFixed(3)}${isRapid ? '' : ` F${feed}`}`);
                if (isFirstPoint) {
                    pathD += `M ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                    isFirstPoint = false;
                } else {
                    pathD += ` L ${absX.toFixed(3)} ${absY.toFixed(3)}`;
                }
                updateBounds(absX, absY);
            };

            const applyCC = (x: number, y: number, vx: number, vy: number) => {
                if (cornerType === 'none') return;
                if (cornerType === 'finger_cutout' && cz < stepZBoundary) return;

                if (cornerType === 'dogbone' || cornerType === 'finger_cutout') {
                    const angle = 45 * (Math.PI / 180);
                    const dx = vx * Math.cos(angle) - vy * Math.sin(angle);
                    const dy = vx * Math.sin(angle) + vy * Math.cos(angle);
                    addPt(x + dx * R * 0.5, y + dy * R * 0.5);
                    addPt(x, y);
                } else if (cornerType === 't_bone') {
                    addPt(x + vx * R, y + vy * R);
                    addPt(x, y);
                }
            };

            const getBoundary = (idx: number, total: number, fingersTotal: number, fW: number, isStartEdge: boolean, isVertical: boolean, isPin: boolean) => {
                let pos = idx * fW;

                // Tolerance adjustment (idx 0 and fingersTotal are board corners)
                if (idx > 0 && idx < fingersTotal) {
                    const tOffset = (parseFloat(String(params.tolerance)) || 0) / 2;
                    const pinIsPrev = ((idx - 1) % 2 === 0) === options.fingers?.startWithPin;
                    // pos = idx*fW. To move pos towards prev pin (closer to 0), we subtract tOffset.
                    pos += pinIsPrev ? -tOffset : tOffset;
                }

                if (cornerType === 'finger_cutout' && cz >= stepZBoundary) {
                    const step = Math.min(R, fW / 4);
                    const pinAbove = idx > 0 && (idx - 1) % 2 === (options.fingers?.startWithPin ? 0 : 1);
                    const pinBelow = idx < fingersTotal && idx % 2 === (options.fingers?.startWithPin ? 0 : 1);
                    
                    if (isStartEdge) {
                        if (pinAbove) pos += step;
                        if (pinBelow) pos -= step;
                    } else {
                        if (pinAbove) pos -= step;
                        if (pinBelow) pos += step;
                    }
                }
                return pos;
            };

            const cutEdge = (len: number, hasFingers: boolean, isVertical: boolean, isStartEdge: boolean) => {
                if (!hasFingers) {
                    if (isVertical) {
                        addPt(isStartEdge ? -R : pW + R, isStartEdge ? len + R : -R);
                    } else {
                        addPt(isStartEdge ? len + R : -R, isStartEdge ? -R : pH + R);
                    }
                    return;
                }

                const fingersCount = Math.max(1, Math.round(len / fWidth));
                const fW = len / fingersCount;
                const startPin = options.fingers?.startWithPin || false;

                for (let i = 0; i < fingersCount; i++) {
                    const isPin = startPin ? (i % 2 === 0) : (i % 2 !== 0);
                    const p1 = getBoundary(i, len, fingersCount, fW, isStartEdge, isVertical, isPin);
                    const p2 = getBoundary(i + 1, len, fingersCount, fW, isStartEdge, isVertical, isPin);

                    if (isVertical) {
                        const xBase = isStartEdge ? -R : pW + R;
                        const xDeep = isStartEdge ? woodThickness - R : pW - woodThickness + R;
                        const y1 = isStartEdge ? len - p1 : p1;
                        const y2 = isStartEdge ? len - p2 : p2;

                        if (isPin) {
                            addPt(xBase, y2);
                        } else {
                            addPt(xBase, y1 - (isStartEdge ? -R : R));
                            addPt(xDeep, y1 - (isStartEdge ? -R : R));
                            applyCC(xDeep, y1, isStartEdge ? -1 : 1, isStartEdge ? 1 : -1);
                            addPt(xDeep, y2 + (isStartEdge ? -R : R));
                            applyCC(xDeep, y2, isStartEdge ? -1 : 1, isStartEdge ? -1 : 1);
                            addPt(xBase, y2 + (isStartEdge ? -R : R));
                            addPt(xBase, y2);
                        }
                    } else {
                        const yBase = isStartEdge ? -R : pH + R;
                        const yDeep = isStartEdge ? woodThickness - R : pH - woodThickness + R;
                        const x1 = isStartEdge ? p1 : len - p1;
                        const x2 = isStartEdge ? p2 : len - p2;

                        if (isPin) {
                            addPt(x2, yBase);
                        } else {
                            addPt(x1 + (isStartEdge ? -R : R), yBase);
                            addPt(x1 + (isStartEdge ? -R : R), yDeep);
                            applyCC(x1, yDeep, isStartEdge ? 1 : -1, isStartEdge ? -1 : 1);
                            addPt(x2 - (isStartEdge ? -R : R), yDeep);
                            applyCC(x2, yDeep, isStartEdge ? -1 : 1, isStartEdge ? -1 : 1);
                            addPt(x2 - (isStartEdge ? -R : R), yBase);
                            addPt(x2, yBase);
                        }
                    }
                }
            };

            // Start point (bottom-left)
            addPt(-R, -R, true);
            code.push(`G1 Z${cz.toFixed(3)} F${plunge}`);

            if (options.notch) {
                // Simplified notch with fingers not supported for now to skip complexity
                addPt(options.notch.w - R, -R);
                applyCC(options.notch.w - R, options.notch.h - R, -1, 1);
                addPt(options.notch.w - R, options.notch.h - R);
                addPt(pW + R, options.notch.h - R);
                addPt(pW + R, pH + R);
                addPt(-R, pH + R);
                addPt(-R, -R);
            } else {
                cutEdge(pW, !!options.fingers?.bottom, false, true);  // Bottom
                cutEdge(pH, !!options.fingers?.right, true, false);  // Right
                cutEdge(pW, !!options.fingers?.top, false, false);   // Top
                cutEdge(pH, !!options.fingers?.left, true, true);    // Left
                addPt(-R, -R);
            }

            if (pass === totalPasses) {
                paths.push({ d: pathD, stroke: 'var(--color-accent-yellow)' });
            }
        }
        code.push(`G0 Z${safeZ.toFixed(3)}`);
    };

    const spacing = toolDiam * 3;
    let currentX = 0;
    let currentY = 0;

    const toeKickH = params.hasToeKick ? parseFloat(String(params.toeKickHeight)) || 0 : 0;
    const toeKickD = params.hasToeKick ? parseFloat(String(params.toeKickDepth)) || 0 : 0;
    const isJoinery = params.joineryType === 'joinery';

    // SIDES
    if (params.partToGenerate === 'all' || params.partToGenerate === 'sides') {
        const sideH = height;
        const sideD = depth;
        // Left Side
        addPart(sideD, sideH, "Left Side", currentX, currentY, {
            notch: params.hasToeKick ? { w: toeKickD, h: toeKickH } : undefined,
            fingers: isJoinery ? { top: true, bottom: !params.hasToeKick, right: true, startWithPin: true } : undefined
        });
        currentX += sideD + spacing;
        // Right Side
        addPart(sideD, sideH, "Right Side", currentX, currentY, {
            notch: params.hasToeKick ? { w: toeKickD, h: toeKickH } : undefined,
            fingers: isJoinery ? { top: true, bottom: !params.hasToeKick, right: true, startWithPin: true } : undefined
        });
        currentX += sideD + spacing;
    }

    // BOTTOM
    if (params.partToGenerate === 'all' || params.partToGenerate === 'bottom') {
        const bottomW = width - 2 * woodThickness;
        const bottomD = depth - (params.hasToeKick ? toeKickD : 0);
        addPart(bottomW, bottomD, "Bottom Panel", currentX, currentY, {
            fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
        });
        currentX += bottomW + spacing;
    }

    // TOP (Stretchers/Cleats)
    if (params.partToGenerate === 'all' || params.partToGenerate === 'top') {
        const stretcherW = width - 2 * woodThickness;
        const stretcherD = 100; // 100mm standard
        addPart(stretcherW, stretcherD, "Front Top Stretcher", currentX, currentY, {
            fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
        });
        currentY += stretcherD + spacing;
        addPart(stretcherW, stretcherD, "Rear Top Stretcher", currentX, currentY, {
            fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
        });
        currentY += stretcherD + spacing;
        
        // Additional stretchers for drawers
        if (params.configuration === 'drawers') {
            const numDrawers = parseInt(String(params.numDrawers)) || 1;
            for (let i = 0; i < numDrawers - 1; i++) {
                addPart(stretcherW, stretcherD, `Mid Stretcher ${i+1}`, currentX, currentY, {
                    fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
                });
                currentY += stretcherD + spacing;
            }
        }
        currentX += stretcherW + spacing;
        currentY = 0;
    }

    // BACK (Nailers/Rails)
    if (params.partToGenerate === 'all' || params.partToGenerate === 'back') {
        const nailerW = width - 2 * woodThickness;
        const nailerH = 100;
        addPart(nailerW, nailerH, "Top Back Nailer", currentX, currentY, {
            fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
        });
        currentY += nailerH + spacing;
        addPart(nailerW, nailerH, "Bottom Back Nailer", currentX, currentY, {
            fingers: isJoinery ? { left: true, right: true, startWithPin: false } : undefined
        });
        currentX += nailerW + spacing;
        currentY = 0;
    }

    // SHELVES
    if (params.partToGenerate === 'all' || params.partToGenerate === 'shelves') {
        // Show shelves for these configurations
        const showShelves = ['shelves', 'appliance', 'doors'].includes(params.configuration);
        if (showShelves) {
            const numShelves = Math.max(0, parseInt(String(params.numShelves)) || 0);
            const shelfW = width - 2 * woodThickness - 1; // 1mm clearance
            const shelfD = depth - backThickness - 10;
            
            for (let i = 0; i < numShelves; i++) {
                 addPart(shelfW, shelfD, `Shelf ${i+1}`, currentX, currentY);
                 currentY += shelfD + spacing;
                 // If height gets too large, move to next column
                 if (currentY + shelfD > height * 2) {
                     currentX += shelfW + spacing;
                     currentY = 0;
                 }
            }
            if (numShelves > 0) currentX += shelfW + spacing;
        }
    }

    // DOORS / DRAWER FRONTS
    if (params.partToGenerate === 'all' || params.partToGenerate === 'doors' || params.partToGenerate === 'drawers') {
        const gap = 3; // 3mm gap
        const availableH = height - toeKickH - gap;
        const availableW = width - 2 * gap;

        if (params.configuration === 'doors') {
            const numDoors = width > 450 ? 2 : 1;
            const doorW = (availableW - (numDoors === 2 ? gap : 0)) / numDoors;
            const doorH = availableH;
            
            for (let i = 0; i < numDoors; i++) {
                addPart(doorW, doorH, `Door ${i+1}`, currentX, currentY);
                currentY += doorH + spacing;
            }
            currentX += doorW + spacing;
            currentY = 0;
        }

        if (params.configuration === 'drawers') {
            const numDrawers = parseInt(String(params.numDrawers)) || 1;
            const drawerFrontH = (availableH - (numDrawers - 1) * gap) / numDrawers;
            const drawerFrontW = availableW;
            
            for (let i = 0; i < numDrawers; i++) {
                addPart(drawerFrontW, drawerFrontH, `Drawer Front ${i+1}`, currentX, currentY);
                currentY += drawerFrontH + spacing;
            }
            currentX += drawerFrontW + spacing;
            currentY = 0;
        }
    }

    code.push(`M5`);
    if (bounds.minX === Infinity) bounds = { minX: 0, maxX: width, minY: 0, maxY: height };
    
    return { code, paths, bounds, error: null };
};
