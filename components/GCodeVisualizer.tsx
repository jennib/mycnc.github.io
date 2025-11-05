import React, { useRef, useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { parseGCode } from '../services/gcodeParser';
import { MachineSettings } from '../types';

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
    identity: (out) => { out.set([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); return out; },
    multiply: (out, a, b) => {
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
    translate: (out, a, v) => {
        let x = v[0], y = v[1], z = v[2];
        out.set(a);
        out[12] = a[12] + a[0] * x + a[4] * y + a[8] * z;
        out[13] = a[13] + a[1] * x + a[5] * y + a[9] * z;
        out[14] = a[14] + a[2] * x + a[6] * y + a[10] * z;
        return out;
    },
    rotate: (out, a, rad, axis) => {
        let x = axis[0], y = axis[1], z = axis[2], len = Math.hypot(x,y,z);
        if (len < 1e-6) return null;
        len = 1 / len; x *= len; y *= len; z *= len;
        let s = Math.sin(rad), c = Math.cos(rad), t = 1 - c;
        let a00 = a[0], a01 = a[1], a02 = a[2];
        let a10 = a[4], a11 = a[5], a12 = a[6];
        let a20 = a[8], a21 = a[9], a22 = a[10];
        let b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
        let b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
        let b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        if (a !== out) {
            out[3] = a[3]; out[7] = a[7]; out[11] = a[11];
            out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        }
        return out;
    },
    perspective: (out, fovy, aspect, near, far) => {
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
    lookAt: (out, eye, center, up) => {
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

interface GCodeVisualizerProps {
    gcodeLines: string[];
    currentLine: number;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
    hoveredLineIndex: number | null;
}

export interface GCodeVisualizerHandle {
    fitView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
}

const GCodeVisualizer = React.forwardRef<GCodeVisualizerHandle, GCodeVisualizerProps>(({ gcodeLines, currentLine, machineSettings, unit, hoveredLineIndex }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programInfoRef = useRef<any>(null);
    const buffersRef = useRef<any>(null);
    
    // This ref will hold all dynamic data for the render loop to access without re-triggering effects.
    const renderDataRef = useRef<any>({});

    const [parsedGCode, setParsedGCode] = useState<any>(null);
    const [camera, setCamera] = useState({
        target: [0, 0, 0],
        distance: 100,
        rotation: [0, Math.PI / 2] // Default to top-down view (Z-up system)
    });
    const mouseState = useRef({ isDown: false, lastPos: { x: 0, y: 0 }, button: 0 });

    const createToolModel = (position: { x: number, y: number, z: number }) => {
        const { x, y, z } = position;
        const toolHeight = 20;
        const toolRadius = 3;
        const holderHeight = 10;
        const holderRadius = 8;
        const vertices = [];
    
        const addQuad = (p1: number[], p2: number[], p3: number[], p4: number[]) => vertices.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    
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
        zoomIn: () => setCamera(c => ({...c, distance: c.distance / 1.5})),
        zoomOut: () => setCamera(c => ({...c, distance: c.distance * 1.5})),
        resetView: () => fitView(parsedGCode?.bounds, [0, Math.PI / 2]),
    }));

    useEffect(() => {
        const parsed = parseGCode(gcodeLines);
        setParsedGCode(parsed);
        fitView(parsed.bounds, [0, Math.PI / 2]);
    }, [gcodeLines, fitView]);

    // Effect to regenerate buffers when their data sources change.
    useEffect(() => {
        const gl = glRef.current; 
        if (!gl) return;

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

        const workAreaBuffers: any = {};
        workAreaBuffers.gridPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);
        workAreaBuffers.gridColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridColor);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()), gl.STATIC_DRAW);
        workAreaBuffers.gridVertexCount = gridVertices.length / 3;

        workAreaBuffers.boundsPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boundsVertices), gl.STATIC_DRAW);
        workAreaBuffers.boundsColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsColor);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()), gl.STATIC_DRAW);
        workAreaBuffers.boundsVertexCount = boundsVertices.length / 3;
        
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


        workAreaBuffers.axisPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisVertices), gl.STATIC_DRAW);
        workAreaBuffers.axisColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisColor);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisColors), gl.STATIC_DRAW);
        workAreaBuffers.axisVertexCount = axisVertices.length / 3;

        // --- Create Toolpath Buffers ---
        const segments = parsedGCode ? parsedGCode.segments : [];
        const vertices = [];
        const colors = [];

        const colorRapid = [0.28, 0.33, 0.41, 1.0]; // secondary
        const colorCut = [0.58, 0.64, 0.72, 1.0];   // text-secondary
        const colorExecutedRapid = [0.05, 0.58, 0.53, 1.0]; // primary
        const colorExecutedCut = [0.06, 0.72, 0.51, 1.0];  // accent-green
        const colorHighlight = [1.0, 1.0, 0.0, 1.0]; // Yellow

        segments.forEach((seg, i) => {
            let color;
            const isHovered = i === hoveredLineIndex;

            if (isHovered) {
                color = colorHighlight;
            } else if (i < currentLine) {
                color = seg.type === 'G0' ? colorExecutedRapid : colorExecutedCut;
            } else {
                color = seg.type === 'G0' ? colorRapid : colorCut;
            }

            if (seg.type === 'G2' || seg.type === 'G3') {
                const arcPoints = 20;
                const radius = Math.hypot(seg.start.x - seg.center.x, seg.start.y - seg.center.y);
                let startAngle = Math.atan2(seg.start.y - seg.center.y, seg.start.x - seg.center.x);
                let endAngle = Math.atan2(seg.end.y - seg.center.y, seg.end.x - seg.center.x);
                
                let angleDiff = endAngle - startAngle;

                // If start and end points are the same and it's a valid arc, it's a full circle.
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

                    vertices.push(
                        seg.center.x + Math.cos(p1_angle) * radius, seg.center.y + Math.sin(p1_angle) * radius, p1_z,
                        seg.center.x + Math.cos(p2_angle) * radius, seg.center.y + Math.sin(p2_angle) * radius, p2_z
                    );
                    colors.push(...color, ...color);
                }
            } else { // G0, G1
                vertices.push(
                    seg.start.x, seg.start.y, seg.start.z,
                    seg.end.x, seg.end.y, seg.end.z
                );
                colors.push(...color, ...color);
            }
        });
        
        let toolModel = null;
        if(currentLine > 0 && currentLine <= segments.length){
            toolModel = createToolModel(segments[currentLine - 1].end);
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        let toolPositionBuffer = null, toolColorBuffer = null;
        if (toolModel) {
            toolPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, toolPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, toolModel.vertices, gl.STATIC_DRAW);
            
            toolColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, toolColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, toolModel.colors, gl.STATIC_DRAW);
        }
        
        // Clean up old buffers before assigning new ones
        if (buffersRef.current) {
            gl.deleteBuffer(buffersRef.current.position);
            gl.deleteBuffer(buffersRef.current.color);
            gl.deleteBuffer(buffersRef.current.toolPosition);
            gl.deleteBuffer(buffersRef.current.toolColor);
            if (buffersRef.current.workArea) {
                gl.deleteBuffer(buffersRef.current.workArea.gridPosition);
                gl.deleteBuffer(buffersRef.current.workArea.gridColor);
                gl.deleteBuffer(buffersRef.current.workArea.boundsPosition);
                gl.deleteBuffer(buffersRef.current.workArea.boundsColor);
                gl.deleteBuffer(buffersRef.current.workArea.axisPosition);
                gl.deleteBuffer(buffersRef.current.workArea.axisColor);
            }
        }

        buffersRef.current = { 
            position: positionBuffer, 
            color: colorBuffer, 
            vertexCount: vertices.length / 3,
            toolPosition: toolPositionBuffer,
            toolColor: toolColorBuffer,
            toolVertexCount: toolModel ? toolModel.vertices.length / 3 : 0,
            workArea: workAreaBuffers,
        };

    }, [parsedGCode, currentLine, machineSettings]);
    
    // The main setup and continuous render loop effect. Runs ONLY ONCE.
    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl', { antialias: true });
        if (!gl) { console.error("WebGL not supported"); return; }
        glRef.current = gl;

        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vs, fs);

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
        
        let animationFrameId;

        const renderLoop = () => {
            animationFrameId = requestAnimationFrame(renderLoop);

            const { camera } = renderDataRef.current;
            const buffers = buffersRef.current;
            const programInfo = programInfoRef.current;

            if (!gl || !programInfo) return;
            
            // Handle canvas resizing within the loop
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.117, 0.16, 0.23, 1.0); // background color
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // If buffers aren't ready yet, we're done for this frame.
            if (!buffers || !camera) return;

            const projectionMatrix = mat4.create();
            mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 10000);

            const viewMatrix = mat4.create();
            
            // Z-up camera position calculation
            const eye = [
                camera.target[0] + camera.distance * Math.cos(camera.rotation[0]) * Math.cos(camera.rotation[1]),
                camera.target[1] + camera.distance * Math.sin(camera.rotation[0]) * Math.cos(camera.rotation[1]),
                camera.target[2] + camera.distance * Math.sin(camera.rotation[1])
            ];

            // Z-up 'up' vector logic
            let up = [0, 0, 1]; // Z is the default 'up' axis for the scene
            if (Math.abs(Math.sin(camera.rotation[1])) > 0.99999) {
                up = [0, 1, 0];
            }
            mat4.lookAt(viewMatrix, eye, camera.target, up);

            gl.useProgram(programInfo.program);
            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, viewMatrix);
            
            // --- Draw Work Area & Axes ---
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

                gl.lineWidth(2.0); // Thicker lines for axes
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINES, 0, wa.axisVertexCount);
                gl.lineWidth(1.0);
            }

            // --- Draw Toolpath ---
            if (buffers.position && buffers.vertexCount > 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
                
                gl.drawArrays(gl.LINES, 0, buffers.vertexCount);
            }

            // --- Draw Tool ---
            if (buffers.toolPosition && buffers.toolVertexCount > 0) {
                 gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolPosition);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolColor);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

                gl.drawArrays(gl.TRIANGLES, 0, buffers.toolVertexCount);
            }
        };

        renderLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Empty dependency array ensures this runs only once.

    // Update the ref on every render with the latest camera state.
    useEffect(() => {
        renderDataRef.current = { camera };
    });
    
    // --- Mouse Controls ---
    useEffect(() => {
        const canvas = canvasRef.current!;
        const handleMouseDown = e => {
            mouseState.current = { isDown: true, lastPos: { x: e.clientX, y: e.clientY }, button: e.button };
        };
        const handleMouseUp = () => {
            mouseState.current.isDown = false;
        };
        const handleMouseMove = e => {
            if (!mouseState.current.isDown) return;
            const dx = e.clientX - mouseState.current.lastPos.x;
            const dy = e.clientY - mouseState.current.lastPos.y;

            if (mouseState.current.button === 0) { // Left-click: Rotate
                setCamera(c => {
                    const newRotation = [...c.rotation];
                    newRotation[0] -= dx * 0.01;
                    newRotation[1] -= dy * 0.01;
                    // Clamp pitch to prevent flipping over
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
                    
                    // Pan calculation for Z-up camera system
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
        const handleWheel = e => {
            e.preventDefault();
            const scale = e.deltaY < 0 ? 0.8 : 1.2;
            setCamera(c => ({ ...c, distance: Math.max(1, c.distance * scale) }));
        };
        const handleContextMenu = e => e.preventDefault();
        
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


    return <div className="w-full h-full bg-background rounded cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>;
});

export default GCodeVisualizer;