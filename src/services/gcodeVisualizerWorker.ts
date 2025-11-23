// src/services/gcodeVisualizerWorker.ts

// --- G-code Parsing Logic (from src/renderer/services/gcodeParser.js) ---
const getParam = (gcode, param) => {
    const regex = new RegExp(`${param}\s*([-+]?[0-9]*\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

const parseGCode = (gcodeLines) => {
    const segments = [];
    const bounds = {
        minX: Infinity, maxX: -Infinity, 
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity
    };

    let currentPos = { x: 0, y: 0, z: 0 };
    let motionMode = 'G0';

    const updateBounds = (p) => {
        bounds.minX = Math.min(bounds.minX, p.x);
        bounds.maxX = Math.max(bounds.maxX, p.x);
        bounds.minY = Math.min(bounds.minY, p.y);
        bounds.maxY = Math.max(bounds.maxY, p.y);
        bounds.minZ = Math.min(bounds.minZ, p.z);
        bounds.maxZ = Math.max(bounds.maxZ, p.z);
    };
    
    updateBounds(currentPos);

    gcodeLines.forEach((line, lineIndex) => {
        const cleanLine = line.toUpperCase().replace(/\(.*?\)/g, '').split(';')[0].trim();
        if (!cleanLine) {
            return;
        }

        const gCommand = cleanLine.match(/G(\d+(\.\d+)?)/);
        if (gCommand) {
            const gCode = parseInt(gCommand[1], 10);
            if ([0, 1, 2, 3].includes(gCode)) {
                motionMode = `G${gCode}`;
            }
        }

        if (cleanLine.includes('X') || cleanLine.includes('Y') || cleanLine.includes('Z') || cleanLine.includes('I') || cleanLine.includes('J')) {
            const start = { ...currentPos };
            const end = {
                x: getParam(cleanLine, 'X') ?? currentPos.x,
                y: getParam(cleanLine, 'Y') ?? currentPos.y,
                z: getParam(cleanLine, 'Z') ?? currentPos.z
            };
            
            if (motionMode === 'G0' || motionMode === 'G1') {
                segments.push({ type: motionMode, start, end, line: lineIndex });
            } else if (motionMode === 'G2' || motionMode === 'G3') {
                const i = getParam(cleanLine, 'I') ?? 0;
                const j = getParam(cleanLine, 'J') ?? 0;
                const center = { x: start.x + i, y: start.y + j, z: start.z };
                segments.push({ type: motionMode, start, end, center, clockwise: motionMode === 'G2', line: lineIndex });
            }

            currentPos = end;
            updateBounds(start);
            updateBounds(end);
        }
    });
    
    if (segments.length === 0) {
      return { segments, bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10, minZ: -2, maxZ: 2 }};
    }

    return { segments, bounds };
};

// --- Color Constants (from GCodeVisualizer.tsx) ---
const RAPID_COLOR = [0.4, 0.4, 0.4, 1.0]; // Light gray
const CUTTING_COLOR = [1.0, 0.84, 0.0, 1.0]; // Bright yellow
const PLUNGE_COLOR = [1.0, 0.65, 0.0, 1.0]; // Orange
const EXECUTED_COLOR = [0.2, 0.2, 0.2, 1.0]; // Dark gray
const HIGHLIGHT_COLOR = [1.0, 0.0, 1.0, 1.0]; // Magenta

// --- createToolModel function (from GCodeVisualizer.tsx) ---
const createToolModel = (position) => {
    const { x, y, z } = position;
    const toolHeight = 20;
    const toolRadius = 3;
    const holderHeight = 10;
    const holderRadius = 8;
    const vertices = [];

    const addQuad = (p1, p2, p3, p4) => vertices.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);

    // Tip
    vertices.push(x, y, z, x - toolRadius, y, z + toolHeight, x + toolRadius, y, z + toolHeight);

    // Body (simplified cylinder)
    const sides = 8;
    for (let i = 0; i < sides; i++) {
        const a1 = (i / sides) * 2 * Math.PI;
        const a2 = ((i + 1) / sides) * 2 * Math.PI;
        const x1 = Math.cos(a1) * toolRadius;
        const z1 = Math.sin(a1) * toolRadius;
        const x2 = Math.cos(a2) * toolRadius;
        const z2 = Math.sin(a2) * toolRadius;
        addQuad(
            [x + x1, y + z1, z + toolHeight],
            [x + x2, y + z2, z + toolHeight],
            [x + x2, y + z2, z + toolHeight + holderHeight],
            [x + x1, y + z1, z + toolHeight + holderHeight]
        );
    }

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(Array(vertices.length / 3).fill([1.0, 0.2, 0.2, 1.0]).flat()) // Red
    };
};

// --- Main Worker Logic ---
self.onmessage = (event) => {
    const { type, gcodeLines, machineSettings, currentLine, hoveredLineIndex } = event.data;

    if (type === 'processGCode') {
        const parsedGCode = parseGCode(gcodeLines);
        const segments = parsedGCode.segments;

        const toolpathVertices = [];
        const toolpathColors = [];

        segments.forEach((seg, i) => {
            let color;
            const isHovered = i === hoveredLineIndex;
            const isPlunge = Math.abs(seg.start.x - seg.end.x) < 1e-6 && Math.abs(seg.start.y - seg.end.y) < 1e-6 && seg.end.z < seg.start.z;

            if (isHovered) {
                color = HIGHLIGHT_COLOR;
            } else if (i < currentLine) {
                color = EXECUTED_COLOR;
            } else if (seg.type === 'G0') {
                color = RAPID_COLOR;
            } else if (isPlunge) {
                color = PLUNGE_COLOR;
            } else {
                color = CUTTING_COLOR;
            }

            if ((seg.type === 'G2' || seg.type === 'G3') && seg.center) {
                const arcPoints = 20;
                const radius = Math.hypot(seg.start.x - seg.center.x, seg.start.y - seg.center.y);
                let startAngle = Math.atan2(seg.start.y - seg.center.y, seg.start.x - seg.center.x);
                let endAngle = Math.atan2(seg.end.y - seg.center.y, seg.end.x - seg.center.x);
                
                let angleDiff = endAngle - startAngle;

                const isFullCircle = Math.abs(seg.start.x - seg.end.x) < 1e-6 &&
                                     Math.abs(seg.start.y - seg.end.y) < 1e-6 &&
                                     radius > 1e-6;

                if (isFullCircle) {
                    angleDiff = seg.clockwise ? -2 * Math.PI : 2 * Math.PI;
                } else {
                    if (seg.clockwise && angleDiff > 0) angleDiff -= 2 * Math.PI;
                    if (!seg.clockwise && angleDiff < 0) angleDiff += 2 * Math.PI;
                }

                for (let j = 0; j < arcPoints; j++) {
                    const p1_angle = startAngle + (j / arcPoints) * angleDiff;
                    const p2_angle = startAngle + ((j + 1) / arcPoints) * angleDiff;
                    const p1_z = seg.start.z + (seg.end.z - seg.start.z) * (j / arcPoints);
                    const p2_z = seg.start.z + (seg.end.z - seg.start.z) * ((j + 1) / arcPoints);

                    toolpathVertices.push(
                        seg.center.x + Math.cos(p1_angle) * radius, seg.center.y + Math.sin(p1_angle) * radius, p1_z,
                        seg.center.x + Math.cos(p2_angle) * radius, seg.center.y + Math.sin(p2_angle) * radius, p2_z
                    );
                    toolpathColors.push(...color, ...color);
                }
            } else { // G0, G1
                toolpathVertices.push(
                    seg.start.x, seg.start.y, seg.start.z,
                    seg.end.x, seg.end.y, seg.end.z
                );
                toolpathColors.push(...color, ...color);
            }
        });
        
        let toolModel = null;
        if(currentLine > 0 && currentLine <= segments.length){
            toolModel = createToolModel(segments[currentLine - 1].end);
        }

        // --- Create Work Area Buffers ---
        const workArea = machineSettings.workArea;
        const gridVertices = [];
        const boundsVertices = [];
        const gridColor = [0.2, 0.25, 0.35, 1.0];
        const boundsColor = [0.4, 0.45, 0.55, 1.0];
        const gridSpacing = 10; // mm

        for (let i = 0; i <= workArea.x; i += gridSpacing) {
            gridVertices.push(i, 0, 0, i, workArea.y, 0);
        }
        for (let i = 0; i <= workArea.y; i += gridSpacing) {
            gridVertices.push(0, i, 0, workArea.x, i, 0);
        }
        
        const wx = workArea.x, wy = workArea.y, wz = workArea.z;
        boundsVertices.push(
            0, 0, 0, wx, 0, 0,  wx, 0, 0, wx, wy, 0,  wx, wy, 0, 0, wy, 0,  0, wy, 0, 0, 0, 0, // bottom
            0, 0, wz, wx, 0, wz,  wx, 0, wz, wx, wy, wz,  wx, wy, wz, 0, wy, wz,  0, wy, wz, 0, 0, wz, // top
            0, 0, 0, 0, 0, wz,  wx, 0, 0, wx, 0, wz,  wx, wy, 0, wx, wy, wz,  0, wy, 0, 0, wy, wz // sides
        );

        // --- Create Axis Indicator Buffers ---
        const axisLength = Math.max(25, Math.hypot(workArea.x, workArea.y) * 0.1);
        const labelSize = axisLength * 0.1; // Half-size of the letter labels
        const axisLabelOffset = axisLength + labelSize * 2; // Position for the labels to be clearly visible past the axis line

        const axisVertices = [
            // X-axis line
            0, 0, 0,  axisLength, 0, 0,
            // Y-axis line
            0, 0, 0,  0, axisLength, 0,
            // Z-axis line
            0, 0, 0,  0, 0, axisLength
        ];
        const red = [1.0, 0.3, 0.3, 1.0];
        const green = [0.3, 1.0, 0.3, 1.0];
        const blue = [0.3, 0.3, 1.0, 1.0];
        const axisColors = [...red, ...red, ...green, ...green, ...blue, ...blue];

        // 'X' Label vertices
        const xLabel = [
            axisLabelOffset - labelSize, -labelSize, 0,   axisLabelOffset + labelSize,  labelSize, 0,
            axisLabelOffset - labelSize,  labelSize, 0,   axisLabelOffset + labelSize, -labelSize, 0,
        ];
        axisVertices.push(...xLabel);
        axisColors.push(...Array(4).fill(red).flat());

        // 'Y' Label vertices
        const yLabel = [
            -labelSize, axisLabelOffset + labelSize, 0,   0, axisLabelOffset, 0,
             labelSize, axisLabelOffset + labelSize, 0,   0, axisLabelOffset, 0,
             0, axisLabelOffset, 0,                     0, axisLabelOffset - labelSize, 0,
        ];
        axisVertices.push(...yLabel);
        axisColors.push(...Array(6).fill(green).flat());

        // 'Z' Label vertices
        const zLabel = [
            -labelSize, 0, axisLabelOffset + labelSize,    labelSize, 0, axisLabelOffset + labelSize,
             labelSize, 0, axisLabelOffset + labelSize,   -labelSize, 0, axisLabelOffset - labelSize,
            -labelSize, 0, axisLabelOffset - labelSize,    labelSize, 0, axisLabelOffset - labelSize,
        ];
        axisVertices.push(...zLabel);
        axisColors.push(...Array(6).fill(blue).flat());

        self.postMessage({
            type: 'processedGCode',
            parsedGCode: parsedGCode,
            toolpathVertices: new Float32Array(toolpathVertices),
            toolpathColors: new Float32Array(toolpathColors),
            toolModelVertices: toolModel ? toolModel.vertices : null,
            toolModelColors: toolModel ? toolModel.colors : null,
            workAreaGridVertices: new Float32Array(gridVertices),
            workAreaGridColors: new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()),
            workAreaBoundsVertices: new Float32Array(boundsVertices),
            workAreaBoundsColors: new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()),
            workAreaAxisVertices: new Float32Array(axisVertices),
            workAreaAxisColors: new Float32Array(axisColors),
        }, [
            new Float32Array(toolpathVertices).buffer,
            new Float32Array(toolpathColors).buffer,
            toolModel ? toolModel.vertices.buffer : null,
            toolModel ? toolModel.colors.buffer : null,
            new Float32Array(gridVertices).buffer,
            new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()).buffer,
            new Float32Array(boundsVertices).buffer,
            new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()).buffer,
            new Float32Array(axisVertices).buffer,
            new Float32Array(axisColors).buffer
        ].filter(Boolean)); // Filter out nulls for toolModel buffers
    }
};
