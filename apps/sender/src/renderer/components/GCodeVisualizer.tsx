import React, { useRef, useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { MachineSettings } from '@mycnc/shared';
import { ToolpathSegmentMetadata, BoundingBox } from '../workers/gcodeVisualizerWorker';
import { GCodePoint } from '@mycnc/shared';
import GCodeVisualizerWorker from '../workers/gcodeVisualizerWorker?worker';

// --- Color Constants ---
const RAPID_COLOR = [0.4, 0.4, 0.4, 1.0]; // Light gray
const CUTTING_COLOR = [1.0, 0.84, 0.0, 1.0]; // Bright yellow
const PLUNGE_COLOR = [1.0, 0.65, 0.0, 1.0]; // Orange
const EXECUTED_COLOR = [0.2, 0.2, 0.2, 1.0]; // Dark gray
const HIGHLIGHT_COLOR = [1.0, 0.0, 1.0, 1.0]; // Magenta

// --- WebGL Helper Functions ---
const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};

const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
};

const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
`;

const fragmentShaderSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
`;

// --- Matrix Math (gl-matrix simplified) ---
const mat4 = {
    create: () => new Float32Array(16),
    identity: (out: Float32Array) => { out.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return out; },
    multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    },
    translate: (out: Float32Array, a: Float32Array, v: number[]) => {
        let x = v[0], y = v[1], z = v[2];
        out.set(a);
        out[12] = a[12] + a[0] * x + a[4] * y + a[8] * z;
        out[13] = a[13] + a[1] * x + a[5] * y + a[9] * z;
        out[14] = a[14] + a[2] * x + a[6] * y + a[10] * z;
        return out;
    },
    perspective: (out: Float32Array, fovy: number, aspect: number, near: number, far: number) => {
        const f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[11] = -1; out[12] = 0; out[13] = 0; out[15] = 0;
        if (far != null && far !== Infinity) {
            const nf = 1 / (near - far);
            out[10] = (far + near) * nf;
            out[14] = 2 * far * near * nf;
        } else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    },
    lookAt: (out: Float32Array, eye: number[], center: number[], up: number[]) => {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        let eyeX = eye[0], eyeY = eye[1], eyeZ = eye[2];
        let upX = up[0], upY = up[1], upZ = up[2];
        let centerX = center[0], centerY = center[1], centerZ = center[2];

        z0 = eyeX - centerX;
        z1 = eyeY - centerY;
        z2 = eyeZ - centerZ;
        len = Math.hypot(z0, z1, z2);
        if (len > 0) {
            len = 1 / len;
            z0 *= len; z1 *= len; z2 *= len;
        }

        x0 = upY * z2 - upZ * z1;
        x1 = upZ * z0 - upX * z2;
        x2 = upX * z1 - upY * z0;
        len = Math.hypot(x0, x1, x2);
        if (len > 0) {
            len = 1 / len;
            x0 *= len; x1 *= len; x2 *= len;
        } else {
            x0 = 0; x1 = 0; x2 = 0;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
        out[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
        out[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
        out[15] = 1;
        return out;
    }
};

// --- Frustum Culling Utilities ---
// A plane is represented as [a, b, c, d] for the equation ax + by + cz + d = 0
type Plane = [number, number, number, number];
type Frustum = Plane[];

const createFrustum = (projectionMatrix: Float32Array, modelViewMatrix: Float32Array): Frustum => {
    const m = mat4.create();
    mat4.multiply(m, projectionMatrix, modelViewMatrix);

    const frustum: Frustum = [];
    // Right plane
    frustum.push([m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]]);
    // Left plane
    frustum.push([m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]]);
    // Bottom plane
    frustum.push([m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]]);
    // Top plane
    frustum.push([m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]]);
    // Far plane
    frustum.push([m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]);
    // Near plane
    frustum.push([m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]]);

    // Normalize planes
    for (let i = 0; i < 6; i++) {
        const plane = frustum[i];
        const length = Math.hypot(plane[0], plane[1], plane[2]);
        plane[0] /= length;
        plane[1] /= length;
        plane[2] /= length;
        plane[3] /= length;
    }
    return frustum;
};

// Test if an Axis-Aligned Bounding Box (AABB) intersects the frustum
const intersectAABBFrustum = (frustum: Frustum, bbox: BoundingBox): boolean => {
    for (let i = 0; i < 6; i++) {
        const plane = frustum[i];

        // This is a simplified check for point vs plane. A more robust AABB vs Frustum would test all 8 corners.
        // For simplicity and initial implementation, we'll check the two most extreme points.
        const p_vertex = [bbox.minX, bbox.minY, bbox.minZ];
        const n_vertex = [bbox.maxX, bbox.maxY, bbox.maxZ];

        // Adjust for plane normal to get the "positive" and "negative" points
        if (plane[0] >= 0) { p_vertex[0] = bbox.maxX; n_vertex[0] = bbox.minX; }
        if (plane[1] >= 0) { p_vertex[1] = bbox.maxY; n_vertex[1] = bbox.minY; }
        if (plane[2] >= 0) { p_vertex[2] = bbox.maxZ; n_vertex[2] = bbox.minZ; }

        if (plane[0] * n_vertex[0] + plane[1] * n_vertex[1] + plane[2] * n_vertex[2] + plane[3] < 0) {
            // The negative-most point is behind the plane, so the entire AABB is behind this plane.
            return false;
        }
    }
    return true; // If not clipped by any plane, it's inside or intersects
};

interface GCodeVisualizerProps {
    gcodeLines: string[];
    currentLine: number;
    hoveredLineIndex: number | null;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
}

export interface GCodeVisualizerHandle {
    fitView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
}

const GCodeVisualizer = React.forwardRef<GCodeVisualizerHandle, GCodeVisualizerProps>(({ gcodeLines, currentLine, hoveredLineIndex, machineSettings, unit }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programInfoRef = useRef<any>(null);
    const buffersRef = useRef<any>(null);

    // This ref will hold all dynamic data for the render loop to access without re-triggering effects.
    const renderDataRef = useRef<{ camera: { target: number[], distance: number, rotation: number[] }, toolCurrentPosition: GCodePoint | null }>({
        camera: { target: [0, 0, 0], distance: 0, rotation: [0, 0] },
        toolCurrentPosition: null
    });

    const [parsedGCode, setParsedGCode] = useState<any>(null);
    const [camera, setCamera] = useState({
        target: [0, 0, 0],
        distance: 100,
        rotation: [0, Math.PI / 2] // Default to top-down view (Z-up system)
    });
    const mouseState = useRef({ isDown: false, lastPos: { x: 0, y: 0 }, button: 0 });
    const workerRef = useRef<Worker | null>(null);
    const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

    const [workerData, setWorkerData] = useState<{
        toolpathVertices: Float32Array | null;
        toolpathColors: Float32Array | null;
        toolpathSegmentMetadata: ToolpathSegmentMetadata[] | null;
        toolModelInitialVertices: Float32Array | null;
        toolModelInitialColors: Float32Array | null;
        toolCurrentPosition: GCodePoint | null;
        workAreaGridVertices: Float32Array | null;
        workAreaGridColors: Float32Array | null;
        workAreaBoundsVertices: Float32Array | null;
        workAreaBoundsColors: Float32Array | null;
        workAreaAxisVertices: Float32Array | null;
        workAreaAxisColors: Float32Array | null;
        workAreaPlaneVertices: Float32Array | null; // New
        workAreaPlaneColors: Float32Array | null;   // New
    } | null>(null);

    const fitView = useCallback((bounds: any, newRotation: number[] | null = null) => {
        if (!bounds || bounds.minX === Infinity) {
            setCamera(prev => ({
                ...prev,
                target: [machineSettings.workArea.x / 2, machineSettings.workArea.y / 2, 0],
                distance: Math.max(machineSettings.workArea.x, machineSettings.workArea.y) * 1.5,
                rotation: newRotation ?? prev.rotation
            }));
            return;
        }

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const centerZ = (bounds.minZ + bounds.maxZ) / 2;

        const sizeX = bounds.maxX - bounds.minX;
        const sizeY = bounds.maxY - bounds.minY;
        const sizeZ = bounds.maxZ - bounds.minZ;
        const maxDim = Math.max(sizeX, sizeY, sizeZ);

        const distance = maxDim * 1.5;

        setCamera(prev => ({
            ...prev,
            target: [centerX, centerY, centerZ],
            distance: Math.max(distance, 20),
            rotation: newRotation ?? prev.rotation
        }));
    }, [machineSettings]);

    useImperativeHandle(ref, () => ({
        fitView: () => fitView(parsedGCode?.bounds),
        zoomIn: () => setCamera(c => ({ ...c, distance: c.distance / 1.5 })),
        zoomOut: () => setCamera(c => ({ ...c, distance: c.distance * 1.5 })),
        resetView: () => fitView(parsedGCode?.bounds, [0, Math.PI / 2]),
    }));

    useEffect(() => {
        workerRef.current = new GCodeVisualizerWorker();

        workerRef.current.onmessage = (event) => {
            const {
                type, parsedGCode, toolpathVertices, toolpathColors, toolpathSegmentMetadata,
                toolModelInitialVertices, toolModelInitialColors, toolCurrentPosition,
                workAreaGridVertices, workAreaGridColors, workAreaBoundsVertices, workAreaBoundsColors, workAreaAxisVertices, workAreaAxisColors,
                workAreaPlaneVertices, workAreaPlaneColors // New fields
            } = event.data;
            const gl = glRef.current;
            const programInfo = programInfoRef.current;

            if (type === 'progress') {
                setLoadingProgress(event.data.value);
            } else if (type === 'processedGCode') {
                setLoadingProgress(null);
                setParsedGCode(parsedGCode);
                setWorkerData({
                    toolpathVertices, toolpathColors, toolpathSegmentMetadata,
                    toolModelInitialVertices, toolModelInitialColors, toolCurrentPosition,
                    workAreaGridVertices, workAreaGridColors, workAreaBoundsVertices, workAreaBoundsColors, workAreaAxisVertices, workAreaAxisColors,
                    workAreaPlaneVertices, workAreaPlaneColors // New fields
                });
                fitView(parsedGCode.bounds, [0, Math.PI / 2]);
            } else if (type === 'updatedColors' && gl && buffersRef.current) {
                const { toolpathColorUpdates, toolCurrentPosition: newToolCurrentPosition } = event.data; // Only toolCurrentPosition is sent
                // Apply partial color updates
                if (buffersRef.current.color && toolpathColorUpdates && toolpathColorUpdates.length > 0) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.color);
                    toolpathColorUpdates.forEach((update: { offset: number, data: Float32Array }) => {
                        gl.bufferSubData(gl.ARRAY_BUFFER, update.offset, update.data);
                    });
                }
                // Update tool's current position for the render loop
                renderDataRef.current.toolCurrentPosition = newToolCurrentPosition;
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Effect for initial G-code processing (debounced)
    useEffect(() => {
        if (!workerRef.current || gcodeLines.length === 0) {
            setWorkerData(null); // Clear old data if no gcode or worker not ready
            setParsedGCode(null);
            setLoadingProgress(null);
            return;
        }

        const handler = setTimeout(() => {
            console.log('Visualizer: Sending G-code to worker', gcodeLines.length);
            setLoadingProgress(0);
            workerRef.current?.postMessage({
                type: 'processGCode',
                gcodeLines,
                machineSettings,
                // currentLine, // These will be sent via updateColors effect
                // hoveredLineIndex
            });
        }, 150); // Debounce by 150ms

        return () => {
            clearTimeout(handler);
        };
    }, [gcodeLines, machineSettings]); // Only trigger on gcodeLines or machineSettings change

    // Effect for dynamic color and tool position updates (not debounced)
    useEffect(() => {
        if (!workerRef.current || gcodeLines.length === 0 || !buffersRef.current?.color) {
            return;
        }
        workerRef.current.postMessage({
            type: 'updateColors',
            currentLine,
            hoveredLineIndex
        });
    }, [currentLine, hoveredLineIndex, gcodeLines.length]); // gcodeLines.length to ensure this runs after initial processGCode

    // Effect to regenerate buffers when their data sources change.
    useEffect(() => {
        const gl = glRef.current;
        if (!gl || !workerData) return;

        // --- Create Work Area Buffers ---
        const workAreaBuffers: any = {};
        workAreaBuffers.gridPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridPosition);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaGridVertices, gl.STATIC_DRAW);
        workAreaBuffers.gridColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridColor);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaGridColors, gl.STATIC_DRAW);
        workAreaBuffers.gridVertexCount = workerData.workAreaGridVertices ? workerData.workAreaGridVertices.length / 3 : 0;

        workAreaBuffers.boundsPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsPosition);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaBoundsVertices, gl.STATIC_DRAW);
        workAreaBuffers.boundsColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsColor);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaBoundsColors, gl.STATIC_DRAW);
        workAreaBuffers.boundsVertexCount = workerData.workAreaBoundsVertices ? workerData.workAreaBoundsVertices.length / 3 : 0;

        // --- Create Plane Buffers ---
        if (workerData.workAreaPlaneVertices) {
            workAreaBuffers.planePosition = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.planePosition);
            gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaPlaneVertices, gl.STATIC_DRAW);
            workAreaBuffers.planeColor = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.planeColor);
            gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaPlaneColors, gl.STATIC_DRAW);
            workAreaBuffers.planeVertexCount = workerData.workAreaPlaneVertices.length / 3;
        }

        // --- Create Axis Indicator Buffers ---
        workAreaBuffers.axisPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisPosition);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaAxisVertices, gl.STATIC_DRAW);
        workAreaBuffers.axisColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisColor);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.workAreaAxisColors, gl.STATIC_DRAW);
        workAreaBuffers.axisVertexCount = workerData.workAreaAxisVertices ? workerData.workAreaAxisVertices.length / 3 : 0;

        // --- Create Toolpath Buffers ---
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.toolpathVertices, gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, workerData.toolpathColors, gl.STATIC_DRAW);

        let toolPositionBuffer = null, toolColorBuffer = null;
        if (workerData.toolModelInitialVertices) { // Use new field
            toolPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, toolPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, workerData.toolModelInitialVertices, gl.STATIC_DRAW); // Use new field

            toolColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, toolColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, workerData.toolModelInitialColors, gl.STATIC_DRAW); // Use new field
        }

        if (buffersRef.current) {
            gl.deleteBuffer(buffersRef.current.position);
            gl.deleteBuffer(buffersRef.current.color);
            // Delete previous tool model buffers if they exist
            if (buffersRef.current.toolPosition) gl.deleteBuffer(buffersRef.current.toolPosition);
            if (buffersRef.current.toolColor) gl.deleteBuffer(buffersRef.current.toolColor);

            if (buffersRef.current.workArea) {
                gl.deleteBuffer(buffersRef.current.workArea.gridPosition);
                gl.deleteBuffer(buffersRef.current.workArea.gridColor);
                gl.deleteBuffer(buffersRef.current.workArea.boundsPosition);
                gl.deleteBuffer(buffersRef.current.workArea.boundsColor);
                gl.deleteBuffer(buffersRef.current.workArea.axisPosition);
                gl.deleteBuffer(buffersRef.current.workArea.axisColor);
                if (buffersRef.current.workArea.planePosition) gl.deleteBuffer(buffersRef.current.workArea.planePosition);
                if (buffersRef.current.workArea.planeColor) gl.deleteBuffer(buffersRef.current.workArea.planeColor);
            }
        }

        buffersRef.current = {
            position: positionBuffer,
            color: colorBuffer,
            vertexCount: workerData.toolpathVertices ? workerData.toolpathVertices.length / 3 : 0,
            toolpathSegmentMetadata: workerData.toolpathSegmentMetadata,
            toolPosition: toolPositionBuffer,
            toolColor: toolColorBuffer,
            toolVertexCount: workerData.toolModelInitialVertices ? workerData.toolModelInitialVertices.length / 3 : 0, // Use new field
            workArea: workAreaBuffers,
        };

    }, [workerData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: true });
        if (!gl) { console.error("WebGL not supported"); return; }
        glRef.current = gl;

        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vs || !fs) return;
        const program = createProgram(gl, vs, fs);
        if (!program) return;

        programInfoRef.current = {
            program: program,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
            },
        };
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let animationFrameId: number;

        const renderLoop = () => {
            animationFrameId = requestAnimationFrame(renderLoop);

            const { camera } = renderDataRef.current;
            const buffers = buffersRef.current;
            const programInfo = programInfoRef.current;

            if (!gl || !programInfo) return;

            const canvasElement = gl.canvas;
            if (canvasElement instanceof HTMLCanvasElement) {
                if (canvasElement.width !== canvasElement.clientWidth || canvasElement.height !== canvasElement.clientHeight) {
                    canvasElement.width = canvasElement.clientWidth;
                    canvasElement.height = canvasElement.clientHeight;
                }
            }

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.117, 0.16, 0.23, 1.0); // background color
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (!buffers || !camera) return;

            const projectionMatrix = mat4.create();
            const aspect = gl.canvas.width / gl.canvas.height;
            mat4.perspective(projectionMatrix, 45 * Math.PI / 180, aspect, 0.1, 10000);

            const viewMatrix = mat4.create();

            const eye = [
                camera.target[0] + camera.distance * Math.cos(camera.rotation[0]) * Math.cos(camera.rotation[1]),
                camera.target[1] + camera.distance * Math.sin(camera.rotation[0]) * Math.cos(camera.rotation[1]),
                camera.target[2] + camera.distance * Math.sin(camera.rotation[1])
            ];

            let up = [0, 0, 1];
            if (Math.abs(Math.sin(camera.rotation[1])) > 0.99999) {
                up = [0, 1, 0];
            }
            mat4.lookAt(viewMatrix, eye, camera.target, up);

            gl.useProgram(programInfo.program);
            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, viewMatrix);

            // --- Frustum Culling Setup ---
            const frustum = createFrustum(projectionMatrix, viewMatrix);

            if (buffers.workArea) {
                const wa = buffers.workArea;
                gl.lineWidth(1.0);

                gl.bindBuffer(gl.ARRAY_BUFFER, wa.gridPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.gridColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
                gl.drawArrays(gl.LINES, 0, wa.gridVertexCount);

                gl.bindBuffer(gl.ARRAY_BUFFER, wa.boundsPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.boundsColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINES, 0, wa.boundsVertexCount);

                gl.lineWidth(2.0);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINES, 0, wa.axisVertexCount);
                gl.lineWidth(1.0);
            }

            if (buffers.position && buffers.toolpathSegmentMetadata && buffers.toolpathSegmentMetadata.length > 0) {
                gl.lineWidth(3.0);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

                gl.drawArrays(gl.LINES, 0, buffers.vertexCount);
            }

            if (buffers.toolPosition && buffers.toolVertexCount > 0 && renderDataRef.current.toolCurrentPosition) {
                const toolPosition = renderDataRef.current.toolCurrentPosition;
                const toolModelViewMatrix = mat4.create();
                mat4.identity(toolModelViewMatrix); // Start with an identity matrix
                mat4.multiply(toolModelViewMatrix, viewMatrix, toolModelViewMatrix); // Apply camera view transformation
                mat4.translate(toolModelViewMatrix, toolModelViewMatrix, [toolPosition.x, toolPosition.y, toolPosition.z]); // Apply translation based on tool's current position

                gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, toolModelViewMatrix); // Use the tool's specific modelViewMatrix

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

                gl.drawArrays(gl.TRIANGLES, 0, buffers.toolVertexCount);

                // Revert to the original modelViewMatrix for other elements if needed, though in this case
                // the next draws (work area, toolpath) will set their own uniform.
                gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, viewMatrix);
            }

            // Draw Plane (Transparent) - Draw last for blending
            if (buffers.workArea && buffers.workArea.planePosition) {
                const wa = buffers.workArea;
                gl.depthMask(false); // Disable depth write for transparent objects

                gl.bindBuffer(gl.ARRAY_BUFFER, wa.planePosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.planeColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
                gl.drawArrays(gl.TRIANGLES, 0, wa.planeVertexCount);

                gl.depthMask(true);
            }
        };

        renderLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        if (renderDataRef.current) {
            renderDataRef.current.camera = camera;
        }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e: MouseEvent) => {
            mouseState.current = { isDown: true, lastPos: { x: e.clientX, y: e.clientY }, button: e.button };
        };
        const handleMouseUp = () => {
            mouseState.current.isDown = false;
        };
        const handleMouseMove = (e: MouseEvent) => {
            if (!mouseState.current.isDown) return;
            const dx = e.clientX - mouseState.current.lastPos.x;
            const dy = e.clientY - mouseState.current.lastPos.y;

            if (mouseState.current.button === 0) { // Left-click: Rotate
                setCamera(c => {
                    const newRotation = [...c.rotation];
                    newRotation[0] -= dx * 0.01;
                    newRotation[1] += dy * 0.01;
                    newRotation[1] = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, newRotation[1]));
                    return { ...c, rotation: newRotation };
                });
            } else if (mouseState.current.button === 2) { // Right-click: Pan
                setCamera(c => {
                    const factor = 0.1 * (c.distance / 100);
                    const newTarget = [...c.target];

                    const sYaw = Math.sin(c.rotation[0]);
                    const cYaw = Math.cos(c.rotation[0]);
                    const sPitch = Math.sin(c.rotation[1]);
                    const cPitch = Math.cos(c.rotation[1]);

                    const rightX = -sYaw;
                    const rightY = cYaw;

                    const upX = -cYaw * sPitch;
                    const upY = -sYaw * sPitch;
                    const upZ = cPitch;

                    newTarget[0] -= (dx * rightX - dy * upX) * factor;
                    newTarget[1] -= (dx * rightY - dy * upY) * factor;
                    newTarget[2] -= (-dy * upZ) * factor;

                    return { ...c, target: newTarget };
                });
            }

            mouseState.current.lastPos = { x: e.clientX, y: e.clientY };
        };
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const scale = e.deltaY < 0 ? 0.8 : 1.2;
            setCamera(c => ({ ...c, distance: Math.max(1, c.distance * scale) }));
        };
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="w-full h-full bg-background rounded cursor-grab active:cursor-grabbing relative group">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Overlay Info */}
            <div className="absolute bottom-2 left-2 pointer-events-none bg-black/20 p-1 rounded text-[10px] text-white/60 backdrop-blur-[1px] select-none transition-opacity opacity-10 group-hover:opacity-100">
                <div className="font-mono">Grid: 10 {unit}</div>
            </div>

            {/* Loading Overlay */}
            {loadingProgress !== null && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-lg font-bold text-primary">Processing G-Code...</div>
                    <div className="text-sm text-text-secondary font-mono mt-2">{loadingProgress}%</div>
                </div>
            )}
        </div>
    );
});

export { GCodeVisualizer };
