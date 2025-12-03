// src/services/gcodeVisualizerWorker.ts

import { parseGCode, GCodeSegment, GCodePoint } from '../services/gcodeParser';

// --- Type Definitions ---
export interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export interface ToolpathSegmentMetadata {
    startVertexIndex: number;
    vertexCount: number;
    boundingBox: BoundingBox;
    gcodeSegmentIndex: number;
}

interface ColorUpdate {
    offset: number;
    data: Float32Array;
}

// --- Color Constants (from GCodeVisualizer.tsx) ---
const RAPID_COLOR = [0.0, 1.0, 1.0, 1.0]; // Cyan, opaque
const CUTTING_COLOR = [1.0, 0.84, 0.0, 1.0]; // Bright yellow
const PLUNGE_COLOR = [1.0, 0.5, 0.0, 1.0]; // Orange
const EXECUTED_COLOR = [0.5, 0.5, 0.5, 0.5]; // Mid gray, transparent
const HIGHLIGHT_COLOR = [1.0, 0.0, 1.0, 1.0]; // Magenta
const BELOW_ZERO_COLOR = [1.0, 0.2, 0.2, 1.0]; // Red for cutting below Z=0

// --- Global Worker State ---
let _segments: GCodeSegment[] = [];
let _bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
let _toolpathSegmentMetadata: ToolpathSegmentMetadata[] = [];
let _previousToolpathColors: Float32Array | null = null;
let _gcodeLines: string[] = []; // Store raw lines for potential future use (though not currently used for coloring)
let _machineSettings: any = {};


// Helper function to generate toolpath colors and identify changes
const generateToolpathColors = (
    segments: GCodeSegment[],
    toolpathSegmentMetadata: ToolpathSegmentMetadata[],
    currentLine: number,
    hoveredLineIndex: number | null,
    previousColors: Float32Array | null
): { newColors: Float32Array, updates: ColorUpdate[] } => {
    const newColorsArray: number[] = [];
    const updates: ColorUpdate[] = [];

    segments.forEach((seg, i) => {
        let color: number[];
        const isHovered = seg.line === hoveredLineIndex;
        const isPlunge = Math.abs(seg.start.x - seg.end.x) < 1e-6 && Math.abs(seg.start.y - seg.end.y) < 1e-6 && seg.end.z < seg.start.z;
        const isBelowZero = seg.end.z < -0.001 || seg.start.z < -0.001; // Check if segment goes below zero

        if (isHovered) {
            color = HIGHLIGHT_COLOR;
        } else if (seg.line < currentLine) {
            color = EXECUTED_COLOR;
        } else if (seg.type === 'G0') {
            color = RAPID_COLOR;
        } else if (isBelowZero) {
            color = BELOW_ZERO_COLOR;
        } else if (isPlunge) {
            color = PLUNGE_COLOR;
        } else {
            color = CUTTING_COLOR;
        }

        // Each segment contributes `vertexCount` vertices, and each vertex has 4 color components
        const metadata = toolpathSegmentMetadata[i];
        if (!metadata) { // This should not happen if segments and metadata arrays are in sync
            console.warn(`No metadata found for segment ${i}`);
            return;
        }

        const segmentColorData: number[] = [];
        for (let j = 0; j < metadata.vertexCount; j++) {
            segmentColorData.push(...color);
        }

        const segmentColorFloat32 = new Float32Array(segmentColorData);

        // Check if color has changed compared to previousColors
        const offset = metadata.startVertexIndex * 4; // 4 color components per vertex
        let changed = false;
        if (previousColors) {
            // We only need to check the first vertex's color because the whole segment has the same color
            // But to be safe and simple, let's just check if the buffer content is different.
            // Actually, checking every float might be slow.
            // Optimization: Just check the first 4 floats (first vertex)
            if (previousColors[offset] !== segmentColorFloat32[0] ||
                previousColors[offset + 1] !== segmentColorFloat32[1] ||
                previousColors[offset + 2] !== segmentColorFloat32[2] ||
                previousColors[offset + 3] !== segmentColorFloat32[3]) {
                changed = true;
            }
        } else {
            // If there are no previous colors, it's always a change (initial load)
            changed = true;
        }

        if (changed) {
            updates.push({ offset: offset * Float32Array.BYTES_PER_ELEMENT, data: segmentColorFloat32 });
        }

        newColorsArray.push(...segmentColorData);
    });

    return { newColors: new Float32Array(newColorsArray), updates };
};

// --- createToolModel function (from GCodeVisualizer.tsx) ---
const createToolModel = (position: GCodePoint) => {
    // Tool geometry is now generated around (0,0,0).
    // The actual position will be applied via a modelViewMatrix translation in the main thread.
    const toolHeight = 40;
    const toolRadius = 3; // More realistic radius (e.g., 6mm diameter)
    const holderHeight = 15;
    const holderRadius = 6;
    const vertices: number[] = [];
    const colors: number[] = [];

    const addQuad = (p1: number[], p2: number[], p3: number[], p4: number[], color: number[]) => {
        vertices.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
        for (let k = 0; k < 6; k++) colors.push(...color);
    };

    const toolColor = [0.8, 0.8, 0.8, 1.0]; // Silver
    const holderColor = [0.2, 0.2, 0.2, 1.0]; // Dark Grey

    // Body (Cylinder)
    const sides = 16;
    for (let i = 0; i < sides; i++) {
        const a1 = (i / sides) * 2 * Math.PI;
        const a2 = ((i + 1) / sides) * 2 * Math.PI;

        const x1 = Math.cos(a1) * toolRadius;
        const z1 = Math.sin(a1) * toolRadius;
        const x2 = Math.cos(a2) * toolRadius;
        const z2 = Math.sin(a2) * toolRadius;

        // Tool Shaft
        addQuad(
            [x1, z1, 0],
            [x2, z2, 0],
            [x2, z2, toolHeight],
            [x1, z1, toolHeight],
            toolColor
        );

        // Tool Tip (Cone-ish) - Optional, for now just flat bottom
        addQuad(
            [0, 0, 0],
            [x1, z1, 0],
            [x2, z2, 0],
            [0, 0, 0], // degenerate quad for triangle fan
            toolColor
        );

        // Holder
        const hx1 = Math.cos(a1) * holderRadius;
        const hz1 = Math.sin(a1) * holderRadius;
        const hx2 = Math.cos(a2) * holderRadius;
        const hz2 = Math.sin(a2) * holderRadius;

        addQuad(
            [hx1, hz1, toolHeight],
            [hx2, hz2, toolHeight],
            [hx2, hz2, toolHeight + holderHeight],
            [hx1, hz1, toolHeight + holderHeight],
            holderColor
        );

        // Connector (Tool to Holder)
        addQuad(
            [x1, z1, toolHeight],
            [x2, z2, toolHeight],
            [hx2, hz2, toolHeight],
            [hx1, hz1, toolHeight],
            holderColor
        );
    }

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors)
    };
};

// --- Main Worker Logic ---
self.onmessage = (event) => {
    const { type, gcodeLines, machineSettings, currentLine, hoveredLineIndex } = event.data;

    if (type === 'processGCode') {
        _gcodeLines = gcodeLines;
        _machineSettings = machineSettings;
        const parsedGCode = parseGCode(gcodeLines);
        _segments = parsedGCode.segments;
        _bounds = parsedGCode.bounds;

        const toolpathVertices: number[] = [];
        _toolpathSegmentMetadata = []; // Clear and re-populate global metadata

        _segments.forEach((seg, i) => {
            // Report progress every 2000 segments
            if (i % 2000 === 0) {
                self.postMessage({ type: 'progress', value: Math.round((i / _segments.length) * 100) });
            }

            const startVertexIndex = toolpathVertices.length / 3;
            let currentSegmentMinX = Infinity, currentSegmentMaxX = -Infinity;
            let currentSegmentMinY = Infinity, currentSegmentMaxY = -Infinity;
            let currentSegmentMinZ = Infinity, currentSegmentMaxZ = -Infinity;

            const updateCurrentSegmentBounds = (p: GCodePoint) => {
                currentSegmentMinX = Math.min(currentSegmentMinX, p.x);
                currentSegmentMaxX = Math.max(currentSegmentMaxX, p.x);
                currentSegmentMinY = Math.min(currentSegmentMinY, p.y);
                currentSegmentMaxY = Math.max(currentSegmentMaxY, p.y);
                currentSegmentMinZ = Math.min(currentSegmentMinZ, p.z);
                currentSegmentMaxZ = Math.max(currentSegmentMaxZ, p.z);
            };

            updateCurrentSegmentBounds(seg.start);
            updateCurrentSegmentBounds(seg.end);

            if ((seg.type === 'G2' || seg.type === 'G3') && seg.center) {
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

                // Adaptive arc approximation
                const arcLength = Math.abs(angleDiff) * radius;
                const maxSegmentLength = 1.0; // mm or inches
                const minArcPoints = 5;
                const maxArcPoints = 100;
                let arcPoints = Math.ceil(arcLength / maxSegmentLength);
                arcPoints = Math.max(minArcPoints, Math.min(maxArcPoints, arcPoints));

                for (let j = 0; j < arcPoints; j++) {
                    const p1_angle = startAngle + (j / arcPoints) * angleDiff;
                    const p2_angle = startAngle + ((j + 1) / arcPoints) * angleDiff;
                    const p1_z = seg.start.z + (seg.end.z - seg.start.z) * (j / arcPoints);
                    const p2_z = seg.start.z + (seg.end.z - seg.start.z) * ((j + 1) / arcPoints);

                    const p1_x = seg.center.x + Math.cos(p1_angle) * radius;
                    const p1_y = seg.center.y + Math.sin(p1_angle) * radius;
                    const p2_x = seg.center.x + Math.cos(p2_angle) * radius;
                    const p2_y = seg.center.y + Math.sin(p2_angle) * radius;

                    toolpathVertices.push(p1_x, p1_y, p1_z, p2_x, p2_y, p2_z);
                    updateCurrentSegmentBounds({ x: p1_x, y: p1_y, z: p1_z });
                    updateCurrentSegmentBounds({ x: p2_x, y: p2_y, z: p2_z });
                }
            } else { // G0, G1
                toolpathVertices.push(
                    seg.start.x, seg.start.y, seg.start.z,
                    seg.end.x, seg.end.y, seg.end.z
                );
            }

            const vertexCount = (toolpathVertices.length / 3) - startVertexIndex;
            _toolpathSegmentMetadata.push({
                startVertexIndex: startVertexIndex,
                vertexCount: vertexCount,
                boundingBox: {
                    minX: currentSegmentMinX, maxX: currentSegmentMaxX,
                    minY: currentSegmentMinY, maxY: currentSegmentMaxY,
                    minZ: currentSegmentMinZ, maxZ: currentSegmentMaxZ,
                },
                gcodeSegmentIndex: i,
            });
        });

        const { newColors: initialToolpathColors } = generateToolpathColors(
            _segments,
            _toolpathSegmentMetadata,
            currentLine,
            hoveredLineIndex,
            null // Pass null for initial calculation, as there are no previous colors
        );
        _previousToolpathColors = new Float32Array(initialToolpathColors); // Store a copy of the generated colors

        let toolModelInitialVertices: Float32Array | null = null;
        let toolModelInitialColors: Float32Array | null = null;
        let toolCurrentPosition: GCodePoint | null = null;

        if (currentLine > 0 && currentLine <= _segments.length) {
            // Generate tool model at origin (0,0,0)
            const toolModelAtOrigin = createToolModel({ x: 0, y: 0, z: 0 });
            toolModelInitialVertices = toolModelAtOrigin.vertices;
            toolModelInitialColors = toolModelAtOrigin.colors;
            // Capture the actual end position for translation later
            toolCurrentPosition = _segments[currentLine - 1].end;
        }

        // --- Create Work Area Buffers ---
        const workArea = _machineSettings.workArea;
        const gridVertices: number[] = [];
        const boundsVertices: number[] = [];
        const gridColor = [0.2, 0.25, 0.35, 1.0];
        const boundsColor = [0.4, 0.45, 0.55, 1.0];
        const gridSpacing = 10; // mm;

        for (let i = 0; i <= workArea.x; i += gridSpacing) {
            gridVertices.push(i, 0, 0, i, workArea.y, 0);
        }
        for (let i = 0; i <= workArea.y; i += gridSpacing) {
            gridVertices.push(0, i, 0, workArea.x, i, 0);
        }


        const wx = workArea.x, wy = workArea.y, wz = workArea.z;
        boundsVertices.push(
            0, 0, 0, wx, 0, 0, wx, 0, 0, wx, wy, 0, wx, wy, 0, 0, wy, 0, 0, wy, 0, 0, 0, 0, // bottom
            0, 0, wz, wx, 0, wz, wx, 0, wz, wx, wy, wz, wx, wy, wz, 0, wy, wz, 0, wy, wz, 0, 0, wz, // top
            0, 0, 0, 0, 0, wz, wx, 0, 0, wx, 0, wz, wx, wy, 0, wx, wy, wz, 0, wy, 0, 0, wy, wz // sides
        );

        // --- Create Zero Plane Buffer ---
        const planeVertices: number[] = [
            0, 0, 0,
            wx, 0, 0,
            wx, wy, 0,
            0, 0, 0,
            wx, wy, 0,
            0, wy, 0
        ];
        const planeColor = [0.2, 0.3, 0.4, 0.2]; // Semi-transparent blue-ish
        const planeColors: number[] = Array(6).fill(planeColor).flat();


        // --- Create Axis Indicator Buffers ---
        const axisLength = Math.max(25, Math.hypot(workArea.x, workArea.y) * 0.1);
        const labelSize = axisLength * 0.1; // Half-size of the letter labels
        const axisLabelOffset = axisLength + labelSize * 2; // Position for the labels to be clearly visible past the axis line

        const axisVertices: number[] = [
            // X-axis line
            0, 0, 0, axisLength, 0, 0,
            // Y-axis line
            0, 0, 0, 0, axisLength, 0,
            // Z-axis line
            0, 0, 0, 0, 0, axisLength
        ];
        const red = [1.0, 0.3, 0.3, 1.0];
        const green = [0.3, 1.0, 0.3, 1.0];
        const blue = [0.3, 0.3, 1.0, 1.0];
        const axisColors = [...red, ...red, ...green, ...green, ...blue, ...blue];

        // 'X' Label vertices
        const xLabel = [
            axisLabelOffset - labelSize, -labelSize, 0, axisLabelOffset + labelSize, labelSize, 0,
            axisLabelOffset - labelSize, labelSize, 0, axisLabelOffset + labelSize, -labelSize, 0,
        ];
        axisVertices.push(...xLabel);
        axisColors.push(...Array(4).fill(red).flat());

        // 'Y' Label vertices
        const yLabel = [
            -labelSize, axisLabelOffset + labelSize, 0, 0, axisLabelOffset, 0,
            labelSize, axisLabelOffset + labelSize, 0, 0, axisLabelOffset, 0,
            0, axisLabelOffset, 0, 0, axisLabelOffset - labelSize, 0,
        ];
        axisVertices.push(...yLabel);
        axisColors.push(...Array(6).fill(green).flat());

        // 'Z' Label vertices
        const zLabel = [
            -labelSize, 0, axisLabelOffset + labelSize, labelSize, 0, axisLabelOffset + labelSize,
            labelSize, 0, axisLabelOffset + labelSize, -labelSize, 0, axisLabelOffset - labelSize,
            -labelSize, 0, axisLabelOffset - labelSize, labelSize, 0, axisLabelOffset - labelSize,
        ];
        axisVertices.push(...zLabel);
        axisColors.push(...Array(6).fill(blue).flat());

        (self as any).postMessage({
            type: 'processedGCode',
            parsedGCode: parsedGCode,
            toolpathVertices: new Float32Array(toolpathVertices),
            toolpathColors: initialToolpathColors,
            toolpathSegmentMetadata: _toolpathSegmentMetadata,
            toolModelInitialVertices: toolModelInitialVertices, // New field for initial geometry
            toolModelInitialColors: toolModelInitialColors,     // New field for initial geometry
            toolCurrentPosition: toolCurrentPosition,           // New field for current position
            workAreaGridVertices: new Float32Array(gridVertices),
            workAreaGridColors: new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()),
            workAreaBoundsVertices: new Float32Array(boundsVertices),
            workAreaBoundsColors: new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()),
            workAreaAxisVertices: new Float32Array(axisVertices),
            workAreaAxisColors: new Float32Array(axisColors),
            workAreaPlaneVertices: new Float32Array(planeVertices),
            workAreaPlaneColors: new Float32Array(planeColors),
        }, [
            new Float32Array(toolpathVertices).buffer,
            initialToolpathColors.buffer,
            toolModelInitialVertices ? toolModelInitialVertices.buffer : null, // Transfer initial geometry
            toolModelInitialColors ? toolModelInitialColors.buffer : null,     // Transfer initial geometry
            new Float32Array(gridVertices).buffer,
            new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()).buffer,
            new Float32Array(boundsVertices).buffer,
            new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()).buffer,
            new Float32Array(axisVertices).buffer,
            new Float32Array(axisColors).buffer,
            new Float32Array(planeVertices).buffer,
            new Float32Array(planeColors).buffer
        ].filter(Boolean) as Transferable[]); // Filter out nulls for toolModel buffers
    } else if (type === 'updateColors') {
        if (!_segments || _segments.length === 0 || !_toolpathSegmentMetadata || _toolpathSegmentMetadata.length === 0) return;

        const { newColors: updatedColors, updates } = generateToolpathColors(
            _segments,
            _toolpathSegmentMetadata,
            currentLine,
            hoveredLineIndex,
            _previousToolpathColors
        );
        _previousToolpathColors = updatedColors;

        let toolCurrentPosition: GCodePoint | null = null;
        if (currentLine > 0 && currentLine <= _segments.length) {
            toolCurrentPosition = _segments[currentLine - 1].end;

            const transferableObjects: Transferable[] = [];
            updates.forEach(update => transferableObjects.push(update.data.buffer));

            (self as any).postMessage({
                type: 'updatedColors',
                toolpathColorUpdates: updates,
                toolCurrentPosition: toolCurrentPosition, // Send only the current tool position
            }, transferableObjects);
        }
    }
};
