import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Save, Zap, ZoomIn, ZoomOut, Maximize, AlertTriangle } from './Icons';
import { RadioGroup, Input, SpindleAndFeedControls, ArrayControls } from './SharedControls';
import { FONTS, CharacterStroke, CharacterOutline } from '@/services/cncFonts.js';
import { MachineSettings, Tool, GeneratorSettings, SurfacingParams, DrillingParams, BoreParams, PocketParams, ProfileParams, SlotParams, TextParams, ThreadMillingParams, ReliefParams } from '@/types';
import SlotGenerator from './SlotGenerator';
import SurfacingGenerator from './SurfacingGenerator';
import DrillingGenerator from './DrillingGenerator';
import BoreGenerator from './BoreGenerator';
import ProfileGenerator from './ProfileGenerator';
import PocketGenerator from './PocketGenerator';
import ThreadMillingGenerator from './ThreadMillingGenerator';
import TextGenerator from './TextGenerator';
import ReliefGenerator from './ReliefGenerator';

interface TabProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${isActive ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
    >
        {label}
    </button>
);

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

interface PreviewProps {
    paths: PreviewPath[];
    viewBox: string;
    machineSettings: MachineSettings;
}

const Preview: React.FC<PreviewProps> = ({ paths, viewBox, machineSettings }) => {
    const [vbMinX, vbMinY, vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);

    const gridElements = [];
    const labelElements = [];
    const majorDim = Math.max(vbWidth, vbHeight);
    const magnitudes = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const targetLines = 8;
    const roughSpacing = majorDim / targetLines;
    const spacing = magnitudes.find(m => m > roughSpacing) || magnitudes[magnitudes.length - 1];

    const gridLineStyle = { stroke: 'var(--color-secondary-focus)', opacity: 0.5, strokeWidth: '0.5%', vectorEffect: 'non-scaling-stroke' };
    const axisLineStyle = { stroke: 'var(--color-text-secondary)', opacity: 0.5, strokeWidth: '1%', vectorEffect: 'non-scaling-stroke' };
    const labelStyle: React.CSSProperties = { fontSize: '4%', fill: 'var(--color-text-secondary)', opacity: 0.6, vectorEffect: 'non-scaling-stroke' };

    if (spacing > 0 && isFinite(vbMinX) && isFinite(vbWidth)) {
        const startX = Math.floor(vbMinX / spacing) * spacing;
        for (let x = startX; x <= vbMinX + vbWidth; x += spacing) {
            gridElements.push(<line key={`v-${x}`} x1={x} y1={vbMinY} x2={x} y2={vbMinY + vbHeight} style={gridLineStyle as React.CSSProperties} />);
            // Add labels along the top edge
            labelElements.push(
                <text key={`lx-${x}`} x={x} y={vbMinY} transform="scale(1, -1)" style={{ ...labelStyle, textAnchor: 'middle', dominantBaseline: 'hanging' } as React.CSSProperties}>
                    {Number(x).toFixed(0)}
                </text>
            );
        }
    }
    if (spacing > 0 && isFinite(vbMinY) && isFinite(vbHeight)) {
        const startY = Math.floor(vbMinY / spacing) * spacing;
        for (let y = startY; y <= vbMinY + vbHeight; y += spacing) {
            gridElements.push(<line key={`h-${y}`} x1={vbMinX} y1={y} x2={vbMinX + vbWidth} y2={y} style={gridLineStyle as React.CSSProperties} />);
            const yFlipped = -y;
            // Add labels along the left edge
            labelElements.push(
                <text key={`ly-${y}`} x={vbMinX} y={y} transform="scale(1, -1)" style={{ ...labelStyle, textAnchor: 'start', dominantBaseline: 'middle' } as React.CSSProperties}>
                    {Number(yFlipped).toFixed(0)}
                </text>
            );
        }
    }

    // Y-Axis
    if (0 >= vbMinX && 0 <= vbMinX + vbWidth) {
        gridElements.push(<line key="axis-y" x1={0} y1={vbMinY} x2={0} y2={vbMinY + vbHeight} style={axisLineStyle as React.CSSProperties} />);
    }
    // X-Axis
    if (0 >= vbMinY && 0 <= vbMinY + vbHeight) {
        gridElements.push(<line key="axis-x" x1={vbMinX} y1={0} x2={vbMinX + vbWidth} y2={0} style={axisLineStyle as React.CSSProperties} />);
    }

    return (
        <div className="aspect-square w-full bg-secondary rounded">
            <svg viewBox={viewBox} className="w-full h-full">
                <g transform="scale(1, -1)">
                    {/* Work Area Rectangle */}
                    {machineSettings.workArea && (
                        <rect
                            x={0}
                            y={-machineSettings.workArea.y}
                            width={machineSettings.workArea.x}
                            height={machineSettings.workArea.y}
                            stroke='var(--color-primary)'
                            strokeWidth='1%'
                            fill='none'
                            strokeDasharray='5 5'
                            style={{ vectorEffect: 'non-scaling-stroke' }}
                        />
                    )}
                    <g key="grid-group">{gridElements}</g>
                    <g key="path-group">
                        {paths.map((p, i) => {
                            if (p.d) {
                                return <path key={i} d={p.d} stroke={p.stroke} fill={p.fill || 'none'} strokeWidth={p.strokeWidth || '2%'} strokeDasharray={p.strokeDasharray} style={{ vectorEffect: 'non-scaling-stroke' }} />;
                            }
                            if (p.cx !== undefined) {
                                return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill || 'none'} stroke={p.stroke} strokeWidth={p.strokeWidth || '2%'} strokeDasharray={p.strokeDasharray} style={{ vectorEffect: 'non-scaling-stroke' }} />;
                            }
                            return null;
                        })}
                    </g>
                </g>
                <g key="label-group">{labelElements}</g>
            </svg >
        </div>
    );
};

interface GCodeGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadGCode: (gcode: string, name: string) => void;
    unit: 'mm' | 'in';
    settings: MachineSettings;
    toolLibrary: Tool[];
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
    generatorSettings: GeneratorSettings;
    onSettingsChange: (settings: GeneratorSettings | ((prev: GeneratorSettings) => GeneratorSettings)) => void;
}

const GCodeGeneratorModal: React.FC<GCodeGeneratorModalProps> = ({ isOpen, onClose, onLoadGCode, unit, settings, toolLibrary, selectedToolId, onToolSelect, generatorSettings, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('generatorActiveTab') || 'surfacing');

    useEffect(() => {
        localStorage.setItem('generatorActiveTab', activeTab);
    }, [activeTab]);
    const [generatedGCode, setGeneratedGCode] = useState('');
    const [previewPaths, setPreviewPaths] = useState<{ paths: PreviewPath[]; bounds: Bounds }>({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } });
    const [viewBox, setViewBox] = useState('0 0 100 100');
    const [generationError, setGenerationError] = useState<string | null>(null);

    // --- Array State (now universal) ---
    const [arraySettings, setArraySettings] = useState({
        isEnabled: false,
        pattern: 'rect',
        rectCols: 3, rectRows: 2, rectSpacingX: 15, rectSpacingY: 15,
        circCopies: 6, circRadius: 40, circCenterX: 50, circCenterY: 50, circStartAngle: 0,
    });

    const calculateViewBox = useCallback((bounds: Bounds) => {
        if (!bounds || bounds.minX === Infinity) return '0 -100 100 100';
        const { minX = 0, minY = 0, maxX = 100, maxY = 100 } = bounds;
        const width = Math.abs(maxX - minX) || 100;
        const height = Math.abs(maxY - minY) || 100;
        const padding = Math.max(width, height) * 0.15;

        const vbMinX = minX - padding;
        const vbWidth = width + padding * 2;

        // Because of the scale(1, -1) transform, the Y coordinates are flipped.
        // The top of the viewbox needs to be the negated maximum Y coordinate.
        const vbMinY = -(maxY + padding);
        const vbHeight = height + padding * 2;

        return `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`;
    }, [previewPaths.bounds?.minX, previewPaths.bounds?.minY, previewPaths.bounds?.maxX, previewPaths.bounds?.maxY]);

    const fitView = useCallback(() => {
        setViewBox(calculateViewBox(previewPaths.bounds));
    }, [previewPaths.bounds, calculateViewBox]);

    // This effect automatically fits the view whenever the preview bounds change.
    useEffect(() => {
        if (previewPaths.bounds && previewPaths.bounds.minX !== Infinity)
            fitView();
    }, [fitView]);

    const generateDrillingCode = (machineSettings: MachineSettings) => {
        const drillParams = generatorSettings.drilling;
        const toolIndex = toolLibrary.findIndex(t => t.id === drillParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { depth, peck, retract, feed, spindle, safeZ } = drillParams;

        const numericDepth = parseFloat(String(depth));
        const numericPeck = parseFloat(String(peck));
        const numericRetract = parseFloat(String(retract));
        const numericFeed = parseFloat(String(feed));
        const numericSpindle = parseFloat(String(spindle));
        const numericSafeZ = parseFloat(String(safeZ));

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0;

        const code = [
            `(--- Drilling Operation: ${drillParams.drillType} ---)`,
            `(Tool: ${selectedTool.name} - Ø${(selectedTool.diameter === '' ? 0 : selectedTool.diameter)}${unit})`,
            `G21 G90`, `M3 S${numericSpindle}`
        ];
        const paths: PreviewPath[] = [];
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
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
                return { error: "Please fill all required fields with valid numbers for single drilling.", code: [], paths: [], bounds: {} };
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
                return { error: "Please fill all required fields with valid numbers for rectangular drilling.", code: [], paths: [], bounds: {} };
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
                return { error: "Please fill all required fields with valid numbers for circular drilling.", code: [], paths: [], bounds: {} };
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

        // GRBL does not support G83 (Peck Drilling Cycle), so we must expand it manually.
        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);

        points.forEach(p => {
            code.push(`(Hole at X${p.x.toFixed(3)} Y${p.y.toFixed(3)})`);
            code.push(`G0 X${p.x.toFixed(3)} Y${p.y.toFixed(3)}`);
            code.push(`G0 Z${numericRetract.toFixed(3)}`); // Move to R-plane

            let currentZ = 0;
            const targetZ = numericDepth;
            const peckStep = numericPeck;

            // If peck is 0 or invalid, do single pass
            if (peckStep <= 0) {
                code.push(`G1 Z${targetZ.toFixed(3)} F${numericFeed.toFixed(3)}`);
                code.push(`G0 Z${numericRetract.toFixed(3)}`);
            } else {
                while (currentZ > targetZ) {
                    currentZ -= peckStep;
                    if (currentZ < targetZ) currentZ = targetZ;

                    code.push(`G1 Z${currentZ.toFixed(3)} F${numericFeed.toFixed(3)}`);
                    code.push(`G0 Z${numericRetract.toFixed(3)}`); // Retract to R-plane to clear chips

                    // Rapid back down to just above previous cut if not done
                    if (currentZ > targetZ) {
                        code.push(`G0 Z${(currentZ + 0.5).toFixed(3)}`);
                    }
                }
            }

            paths.push({ cx: p.x, cy: p.y, r: (selectedTool.diameter === '' ? 0 : selectedTool.diameter) / 2, stroke: 'var(--color-accent-yellow)', fill: 'var(--color-accent-yellow-transparent)' });
            updateBounds(p.x, p.y);
        });

        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        code.push('M5');

        return { code, paths, bounds, error: null };
    };

    const generateProfileCode = (machineSettings: MachineSettings) => {
        const profileParams = generatorSettings.profile;
        const toolIndex = toolLibrary.findIndex(t => t.id === profileParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = (selectedTool.diameter === '' ? 0 : selectedTool.diameter);
        const toolRadius = toolDiameter / 2;

        const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, cutSide, tabsEnabled, numTabs, tabWidth, tabHeight, feed, spindle, safeZ } = profileParams;

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
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass <= 0) {
            return { error: "Depth per Pass must be a positive number.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass > Math.abs(numericDepth)) {
            return { error: "Depth per Pass cannot be greater than total Depth.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
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
                // Rectangle Logic
                let effCornerRadius = numericCornerRadius;
                if (cutSide === 'outside') effCornerRadius += toolRadius;
                if (cutSide === 'inside') effCornerRadius -= toolRadius;
                if (effCornerRadius < 0) effCornerRadius = 0;

                // Coordinates of the tool center path
                const minX = -offset;
                const maxX = numericWidth + offset;
                const minY = -offset;
                const maxY = numericLength + offset;

                // Start point: Bottom-Left, just after the corner
                const startX = minX + effCornerRadius;
                const startY = minY;

                code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`); // Plunge

                // Bottom Edge
                code.push(`G1 X${(maxX - effCornerRadius + originOffsetX).toFixed(3)} Y${(minY + originOffsetY).toFixed(3)} F${numericFeed}`);

                // Bottom-Right Corner
                if (effCornerRadius > 0) {
                    code.push(`G3 X${(maxX + originOffsetX).toFixed(3)} Y${(minY + effCornerRadius + originOffsetY).toFixed(3)} I0 J${effCornerRadius.toFixed(3)}`);
                }

                // Right Edge
                code.push(`G1 X${(maxX + originOffsetX).toFixed(3)} Y${(maxY - effCornerRadius + originOffsetY).toFixed(3)}`);

                // Top-Right Corner
                if (effCornerRadius > 0) {
                    code.push(`G3 X${(maxX - effCornerRadius + originOffsetX).toFixed(3)} Y${(maxY + originOffsetY).toFixed(3)} I${(-effCornerRadius).toFixed(3)} J0`);
                }

                // Top Edge
                code.push(`G1 X${(minX + effCornerRadius + originOffsetX).toFixed(3)} Y${(maxY + originOffsetY).toFixed(3)}`);

                // Top-Left Corner
                if (effCornerRadius > 0) {
                    code.push(`G3 X${(minX + originOffsetX).toFixed(3)} Y${(maxY - effCornerRadius + originOffsetY).toFixed(3)} I0 J${(-effCornerRadius).toFixed(3)}`);
                }

                // Left Edge
                code.push(`G1 X${(minX + originOffsetX).toFixed(3)} Y${(minY + effCornerRadius + originOffsetY).toFixed(3)}`);

                // Bottom-Left Corner
                if (effCornerRadius > 0) {
                    code.push(`G3 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)} I${effCornerRadius.toFixed(3)} J0`);
                }

                // Add to paths (simplified for preview)
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

            } else {
                // Circle Logic
                const centerX = numericDiameter / 2;
                const centerY = numericDiameter / 2;
                const pathRadius = (numericDiameter / 2) + offset;

                if (pathRadius <= 0) {
                    continue;
                }

                // Start at right side
                const startX = centerX + pathRadius;
                const startY = centerY;

                code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericFeed / 2}`); // Plunge

                // Full circle CCW
                code.push(`G3 X${(startX + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)} I${(-pathRadius).toFixed(3)} J0 F${numericFeed}`);

                paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: pathRadius, stroke: 'var(--color-accent-yellow)' });
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



    const generateSurfacingCode = (machineSettings: MachineSettings) => {
        const surfaceParams = generatorSettings.surfacing;
        const toolIndex = toolLibrary.findIndex(t => t.id === surfaceParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { width, length, depth, stepover, feed, spindle, safeZ, direction } = surfaceParams;

        const numericWidth = parseFloat(String(width));
        const numericLength = parseFloat(String(length));
        const numericDepth = parseFloat(String(depth));
        const numericStepover = parseFloat(String(stepover));
        const numericFeed = parseFloat(String(feed));
        const numericSpindle = parseFloat(String(spindle));
        const numericSafeZ = parseFloat(String(safeZ));

        if ([numericWidth, numericLength, numericDepth, numericStepover, numericFeed, numericSpindle, numericSafeZ].some(isNaN)) {
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0; const code = [
            `(--- Surfacing Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${(selectedTool.diameter === '' ? 0 : selectedTool.diameter)}${unit})`,
            `G21 G90`, `M3 S${numericSpindle}`
        ];
        const paths: PreviewPath[] = [];
        const toolRadius = (selectedTool.diameter === '' ? 0 : selectedTool.diameter) / 2;
        const stepoverDist = (selectedTool.diameter === '' ? 0 : selectedTool.diameter) * (numericStepover / 100);

        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);

        if (direction === 'horizontal') {
            let y = toolRadius;
            let xDirection = 1; // 1 for right, -1 for left
            while (y <= numericLength + toolRadius) {
                const startX = (xDirection === 1) ? -toolRadius : numericWidth + toolRadius;
                const endX = (xDirection === 1) ? numericWidth + toolRadius : -toolRadius;
                code.push(`G0 X${(startX + originOffsetX).toFixed(3)} Y${(y + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);
                code.push(`G1 X${(endX + originOffsetX).toFixed(3)} F${numericFeed}`);
                code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
                paths.push({ d: `M ${(startX + originOffsetX)} ${(y + originOffsetY)} L ${(endX + originOffsetX)} ${(y + originOffsetY)}`, stroke: 'var(--color-accent-yellow)' });
                y += stepoverDist;
                xDirection *= -1; // Reverse direction for next pass
            }
        } else { // vertical
            let x = toolRadius;
            let yDirection = 1; // 1 for up, -1 for down
            while (x <= numericWidth + toolRadius) {
                const startY = (yDirection === 1) ? -toolRadius : numericLength + toolRadius;
                const endY = (yDirection === 1) ? numericLength + toolRadius : -toolRadius;
                code.push(`G0 X${(x + originOffsetX).toFixed(3)} Y${(startY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${numericDepth.toFixed(3)} F${numericFeed / 2}`);
                code.push(`G1 Y${(endY + originOffsetY).toFixed(3)} F${numericFeed}`);
                code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
                paths.push({ d: `M ${(x + originOffsetX).toFixed(3)} ${(startY + originOffsetY).toFixed(3)} L ${(x + originOffsetX).toFixed(3)} ${(endY + originOffsetY).toFixed(3)}`, stroke: 'var(--color-accent-yellow)' });
                x += stepoverDist;
                yDirection *= -1; // Reverse direction for next pass
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

    const generatePocketCode = (machineSettings: MachineSettings) => {
        const pocketParams = generatorSettings.pocket;
        const toolIndex = toolLibrary.findIndex(t => t.id === pocketParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ } = pocketParams;

        const numericWidth = parseFloat(String(width));
        const numericLength = parseFloat(String(length));
        const numericCornerRadius = parseFloat(String(cornerRadius)); // Not directly used in current pocket code, but good to convert
        const numericDiameter = parseFloat(String(diameter));
        const numericDepth = parseFloat(String(depth));
        const numericDepthPerPass = parseFloat(String(depthPerPass));
        const numericStepover = parseFloat(String(stepover));
        const numericFeed = parseFloat(String(feed));
        const numericPlungeFeed = parseFloat(String(plungeFeed));
        const numericSpindle = parseFloat(String(spindle));
        const numericSafeZ = parseFloat(String(safeZ));

        if ([numericDepth, numericDepthPerPass, numericStepover, numericFeed, numericPlungeFeed, numericSpindle, numericSafeZ].some(isNaN) || (shape === 'rect' && ([numericWidth, numericLength].some(isNaN))) || (shape === 'circ' && isNaN(numericDiameter))) {
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass <= 0) {
            return { error: "Depth per Pass must be a positive number.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass > Math.abs(numericDepth)) {
            return { error: "Depth per Pass cannot be greater than total Depth.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0; const code = [
            `(--- Pocket Operation: ${shape} ---)`,
            `(Tool: ${selectedTool.name} - Ø${(selectedTool.diameter === '' ? 0 : selectedTool.diameter)}${unit})`,
            `G21 G90`, `M3 S${numericSpindle}`, `G0 Z${numericSafeZ}`
        ];
        const paths: PreviewPath[] = [];
        const toolRadius = (selectedTool.diameter === '' ? 0 : selectedTool.diameter) / 2;
        const stepoverDist = (selectedTool.diameter === '' ? 0 : selectedTool.diameter) * (numericStepover / 100);

        let currentDepth = 0;
        while (currentDepth > numericDepth) {
            currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
            code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

            if (shape === 'rect') {
                const centerX = numericWidth / 2;
                const centerY = numericLength / 2;
                code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);

                // Simplified raster clearing for now
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
            } else { // Circle
                const centerX = numericDiameter / 2;
                const centerY = numericDiameter / 2;
                const maxRadius = numericDiameter / 2 - toolRadius; // Used for pocketing, not for bounding box
                code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);
                // Simplified for now, would need helical interpolation
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
    const generateBoreCode = (machineSettings: MachineSettings) => {
        const boreParams = generatorSettings.bore;
        const toolIndex = toolLibrary.findIndex(t => t.id === boreParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

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
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }

        if (numericHoleDiameter <= (selectedTool.diameter === '' ? 0 : selectedTool.diameter)) {
            return { error: "Tool must be smaller than hole diameter.", code: [], paths: [], bounds: {} };
        }
        if (counterboreEnabled && numericCbDiameter <= (selectedTool.diameter === '' ? 0 : selectedTool.diameter)) {
            return { error: "Tool must be smaller than counterbore diameter.", code: [], paths: [], bounds: {} };
        }
        if (counterboreEnabled && numericCbDiameter <= numericHoleDiameter) {
            return { error: "Counterbore must be larger than hole diameter.", code: [], paths: [], bounds: {} };
        }

        if (numericDepthPerPass <= 0) {
            return { error: "Depth per Pass must be a positive number.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass > Math.abs(numericHoleDepth)) {
            return { error: "Depth per Pass cannot be greater than total Hole Depth.", code: [], paths: [], bounds: {} };
        }
        if (counterboreEnabled && numericDepthPerPass > Math.abs(numericCbDepth)) {
            return { error: "Depth per Pass cannot be greater than total Counterbore Depth.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0; const code = [
            `(--- Bore Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${(selectedTool.diameter === '' ? 0 : selectedTool.diameter)}${unit})`,
            `G21 G90`, `M3 S${numericSpindle}`
        ];
        const paths: PreviewPath[] = [];
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        const updateBounds = (x: number, y: number, r: number) => {
            bounds.minX = Math.min(bounds.minX, x - r);
            bounds.maxX = Math.max(bounds.maxX, x + r);
            bounds.minY = Math.min(bounds.minY, y - r);
            bounds.maxY = Math.max(bounds.maxY, y + r);
        };

        const doHelicalBore = (targetDiameter: number, targetDepth: number, startZ: number = 0) => {
            const toolDia = (selectedTool.diameter === '' ? 0 : selectedTool.diameter);
            const finalPathRadius = (targetDiameter - toolDia) / 2;
            if (finalPathRadius <= 0) return;

            const currentCenterX = numericCenterX + originOffsetX;
            const currentCenterY = numericCenterY + originOffsetY;

            const stepoverVal = parseFloat(String(boreParams.stepover)) || 40; // Default to 40% if not set
            const stepoverAmount = toolDia * (stepoverVal / 100);

            // Calculate passes
            const passes = [];

            let r = stepoverAmount;
            // If the hole is small, we might just do one pass at final radius
            if (r > finalPathRadius) r = finalPathRadius;

            // Generate passes from center out
            while (r <= finalPathRadius) {
                passes.push(r);
                if (r >= finalPathRadius) break;
                r += stepoverAmount;
                if (r > finalPathRadius) r = finalPathRadius;
            }

            // Ensure we have at least one pass if something went wrong or hole is tiny
            if (passes.length === 0) passes.push(finalPathRadius);

            code.push(`(Boring to Ø${targetDiameter} at Z=${targetDepth})`);
            paths.push({ cx: currentCenterX, cy: currentCenterY, r: targetDiameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '0.5%' });
            updateBounds(currentCenterX, currentCenterY, targetDiameter / 2);

            code.push(`G0 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)} Z${numericSafeZ.toFixed(3)}`);

            for (const passRadius of passes) {
                code.push(`(Pass at radius ${passRadius.toFixed(3)})`);
                code.push(`G0 Z${(startZ + 1).toFixed(3)}`); // Lift slightly
                code.push(`G0 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)}`);
                code.push(`G1 Z${startZ.toFixed(3)} F${numericPlungeFeed}`);

                let currentDepth = startZ;
                while (currentDepth > targetDepth) {
                    currentDepth = Math.max(targetDepth, currentDepth - numericDepthPerPass);
                    // Ramp in to the pass radius
                    code.push(`G2 X${(currentCenterX + passRadius).toFixed(3)} Y${currentCenterY.toFixed(3)} I${passRadius / 2} J0 Z${currentDepth.toFixed(3)} F${numericFeed}`);
                    // Full circle at depth
                    code.push(`G2 X${(currentCenterX + passRadius).toFixed(3)} Y${currentCenterY.toFixed(3)} I${-passRadius.toFixed(3)} J0`);
                    // Ramp out back to center
                    code.push(`G2 X${currentCenterX.toFixed(3)} Y${currentCenterY.toFixed(3)} I${-passRadius / 2} J0`);
                }

                code.push(`G0 Z${numericSafeZ.toFixed(3)}`); // Retract after each radial pass
            }
        };

        if (counterboreEnabled) {
            // Order depths from shallowest to deepest
            if (numericCbDepth > numericHoleDepth) {
                doHelicalBore(numericCbDiameter, numericCbDepth);
                doHelicalBore(numericHoleDiameter, numericHoleDepth, numericCbDepth);
            } else {
                // This case is less common but possible
                doHelicalBore(numericHoleDiameter, numericHoleDepth);
                doHelicalBore(numericCbDiameter, numericCbDepth); // This will just re-trace in air, but handles the logic simply
            }
        } else {
            doHelicalBore(numericHoleDiameter, numericHoleDepth);
        }

        code.push(`G0 Z${numericSafeZ.toFixed(3)}`);
        code.push(`M5`);
        code.push(`G0 X0 Y0`);

        return { code, paths, bounds, error: null };
    };

    const generateSlotCode = (machineSettings: MachineSettings) => {
        const slotParams = generatorSettings.slot;
        const toolIndex = toolLibrary.findIndex(t => t.id === slotParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = (selectedTool.diameter === '' ? 0 : selectedTool.diameter);

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
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }

        if (numericDepthPerPass <= 0) {
            return { error: "Depth per Pass must be a positive number.", code: [], paths: [], bounds: {} };
        }
        if (numericDepthPerPass > Math.abs(numericDepth)) {
            return { error: "Depth per Pass cannot be greater than total Depth.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0; const code = [
            `(--- Slot Operation: ${type} ---)`,
            `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
            // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
            `G21 G90`, `M3 S${numericSpindle}`
        ];
        const paths: PreviewPath[] = [];
        let bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
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
                offsets.push(0); // Add a center pass
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
                } else { // arc
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
                        // Simple bounding box for arc
                        updateBounds(numericCenterX - passRadius + originOffsetX, numericCenterY - passRadius + originOffsetY);
                        updateBounds(numericCenterX + passRadius + originOffsetX, numericCenterY + passRadius + originOffsetY);
                    }
                }
            }
        }

        code.push(`G0 Z${numericSafeZ}`, `M5`);
        // Final bounds adjustment
        bounds.minX += originOffsetX;
        bounds.maxX += originOffsetX;
        bounds.minY += originOffsetY;
        bounds.maxY += originOffsetY;

        return { code, paths, bounds, error: null };
    };

    const generateTextCode = (machineSettings: MachineSettings) => {
        const textParams = generatorSettings.text;
        const toolIndex = toolLibrary.findIndex(t => t.id === textParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex] as Tool | undefined;
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

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
            return { error: "Please fill all required fields with valid numbers.", code: [], paths: [], bounds: {} };
        }

        const fontData = FONTS[font as keyof typeof FONTS];
        if (!fontData) {
            return { error: `Font "${font}" not found.`, code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
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
        // code.push(`T${toolIndex + 1} M6`); // Tool change disabled for non-ATC setups
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

    const generateThreadMillingCode = (machineSettings: MachineSettings) => {
        const threadParams = generatorSettings.thread;
        const toolIndex = toolLibrary.findIndex(t => t.id === threadParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex] as Tool | undefined;
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = (selectedTool.diameter === '' ? 0 : selectedTool.diameter);

        const { type, hand, feed, spindle, safeZ } = threadParams;
        const numericDiameter = parseFloat(String(threadParams.diameter));
        const numericPitch = parseFloat(String(threadParams.pitch));
        const numericDepth = parseFloat(String(threadParams.depth));
        const numericFeed = parseFloat(String(feed));
        const numericSpindle = parseFloat(String(spindle));
        const numericSafeZ = parseFloat(String(safeZ));

        if ([numericDiameter, numericPitch, numericDepth, numericFeed, numericSpindle, numericSafeZ].some(isNaN) || [numericDiameter, numericPitch, numericDepth, numericFeed, numericSpindle, numericSafeZ].some(p => p <= 0)) {
            return { error: "Please fill all fields with positive values.", code: [], paths: [], bounds: {} };
        }
        if (toolDiameter >= numericDiameter && type === 'internal') {
            return { error: "Tool diameter must be smaller than thread diameter for internal threads.", code: [], paths: [], bounds: {} };
        }

        // Default to 0,0 offset for front_left_top
        const originOffsetX = 0;
        const originOffsetY = 0; const code = [
            `(--- Thread Milling Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
            `(Type: ${type}, Hand: ${hand})`,
            `(Diameter: ${numericDiameter}, Pitch: ${numericPitch}, Depth: ${numericDepth})`,
            `(Feed: ${numericFeed}, Spindle: ${numericSpindle})`,
            // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
            `G21 G90`,
            `M3 S${numericSpindle}`,
            `G0 Z${numericSafeZ}`,
        ];
        const paths: PreviewPath[] = [];

        const centerX = 0; // Assume centered at origin for simplicity
        const centerY = 0;

        let pathRadius, helicalDirection;

        // Climb milling logic
        if (type === 'internal') {
            pathRadius = (numericDiameter - toolDiameter) / 2;
            helicalDirection = (hand === 'right') ? 'G3' : 'G2'; // CCW for RH internal climb
        } else { // external
            pathRadius = (numericDiameter + toolDiameter) / 2;
            helicalDirection = (hand === 'right') ? 'G2' : 'G3'; // CW for RH external climb
        }

        if (pathRadius <= 0) return { error: "Invalid tool/thread diameter combination.", code: [], paths: [], bounds: {} };

        // Preview paths
        paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: numericDiameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '2%', fill: 'none' });
        paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: pathRadius, stroke: 'var(--color-accent-yellow)', strokeWidth: '3%', fill: 'none' });

        if (type === 'internal') {
            const preDrillRadius = numericDiameter - numericPitch; // Approximation for pre-drill size
            paths.push({ cx: centerX + originOffsetX, cy: centerY + originOffsetY, r: preDrillRadius / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '2 2', strokeWidth: '2%', fill: 'none' });
        }

        const startX = centerX + pathRadius;

        // Start sequence (move to bottom and lead-in)
        code.push(`G0 X${(centerX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)}`);
        code.push(`G1 Z${(-numericDepth).toFixed(3)} F${numericFeed / 2}`);
        code.push(`G1 X${(startX + originOffsetX).toFixed(3)} F${numericFeed}`); // Straight lead-in from center

        // Helical motion upwards (climb milling)
        let currentZ = -numericDepth;
        while (currentZ < 0) {
            currentZ = Math.min(0, currentZ + numericPitch);
            code.push(`${helicalDirection} X${(startX + originOffsetX).toFixed(3)} Y${(centerY + originOffsetY).toFixed(3)} I${-pathRadius.toFixed(3)} J0 Z${currentZ.toFixed(3)} F${numericFeed}`);
        }

        // Retract
        code.push(`G1 X${(centerX + originOffsetX).toFixed(3)} F${numericFeed}`); // Straight lead-out to center
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

    const generateReliefCode = async (machineSettings: MachineSettings) => {
        const reliefParams = generatorSettings.relief;
        if (!reliefParams.imageDataUrl) return { error: "Please upload an image.", code: [], paths: [], bounds: {} };

        const { width, length, maxDepth, zSafe, invert, roughingEnabled, roughingToolId, roughingStepdown, roughingStepover, roughingStockToLeave, roughingFeed, roughingSpindle, finishingEnabled, finishingToolId, finishingStepover, finishingAngle, finishingFeed, finishingSpindle, operation } = reliefParams;

        const numericWidth = parseFloat(String(width));
        const numericLength = parseFloat(String(length));
        const numericMaxDepth = parseFloat(String(maxDepth));
        const numericZSafe = parseFloat(String(zSafe));

        if ([numericWidth, numericLength, numericMaxDepth, numericZSafe].some(isNaN) || numericWidth <= 0 || numericLength <= 0) {
            return { error: "Please fill all dimensions with valid positive numbers.", code: [], paths: [], bounds: {} };
        }

        const doRoughing = (operation === 'both' || operation === 'roughing') && roughingEnabled;
        const doFinishing = (operation === 'both' || operation === 'finishing') && finishingEnabled;

        if (!doRoughing && !doFinishing) {
            return { error: "Please enable at least one pass for the selected operation.", code: [], paths: [], bounds: {} };
        }

        // Load Image
        const img = new Image();
        img.src = reliefParams.imageDataUrl;
        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load image"));
            });
        } catch (e) {
            return { error: "Failed to load image.", code: [], paths: [], bounds: {} };
        }

        const canvas = document.createElement('canvas');
        // Limit resolution for performance if needed, but for now use full res or max 500px
        const MAX_RES = 500;
        let w = img.width;
        let h = img.height;
        if (w > MAX_RES || h > MAX_RES) {
            const ratio = w / h;
            if (w > h) { w = MAX_RES; h = MAX_RES / ratio; }
            else { h = MAX_RES; w = MAX_RES * ratio; }
        }
        canvas.width = Math.floor(w);
        canvas.height = Math.floor(h);
        const ctx = canvas.getContext('2d');
        if (!ctx) return { error: "Canvas context error.", code: [], paths: [], bounds: {} };
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        const pixelWidth = imgData.width;
        const pixelHeight = imgData.height;

        const getZAt = (xPct: number, yPct: number) => {
            const clampedXPct = Math.max(0, Math.min(1, xPct));
            const clampedYPct = Math.max(0, Math.min(1, yPct));
            const px = Math.min(pixelWidth - 1, Math.floor(clampedXPct * (pixelWidth - 1)));
            const py = Math.min(pixelHeight - 1, Math.floor(clampedYPct * (pixelHeight - 1)));
            const idx = (py * pixelWidth + px) * 4;
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            if (isNaN(brightness)) {
                // This should effectively be impossible now with correct stride and clamping
                return 0;
            }
            const normalized = brightness / 255;
            // Invert: Dark(0) = High(0), Light(1) = Low(MaxDepth) -> z = normalized * MaxDepth
            // Normal: White(1) = High(0), Black(0) = Low(MaxDepth) -> z = (1 - normalized) * MaxDepth
            return invert ? (normalized * numericMaxDepth) : ((1 - normalized) * numericMaxDepth);
        };

        const code: string[] = [`(--- Relief Carving ---)`, `(Operation: ${operation})`, `G21 G90`];
        const paths: PreviewPath[] = [];

        // --- Roughing ---
        if (doRoughing) {
            const toolIndex = toolLibrary.findIndex(t => t.id === roughingToolId);
            if (toolIndex === -1) return { error: "Please select a roughing tool.", code: [], paths: [], bounds: {} };
            const tool = toolLibrary[toolIndex];
            const toolDia = parseFloat(String(tool.diameter || 0));
            if (isNaN(toolDia) || toolDia <= 0) return { error: "Roughing tool diameter must be a valid positive number.", code: [], paths: [], bounds: {} };

            const stepdown = parseFloat(String(roughingStepdown));
            const stepover = parseFloat(String(roughingStepover));
            const stock = parseFloat(String(roughingStockToLeave));
            const feed = parseFloat(String(roughingFeed));
            const spindle = parseFloat(String(roughingSpindle));

            if ([stepdown, stepover, stock, feed, spindle].some(isNaN)) return { error: "Invalid roughing parameters.", code: [], paths: [], bounds: {} };

            code.push(`(--- Roughing ---)`, `(Tool: ${tool.name})`, `M3 S${spindle}`, `G0 Z${numericZSafe}`);

            const stepoverDist = toolDia * (stepover / 100);
            let currentZ = 0;

            // Z-Level Roughing Loop
            while (currentZ > numericMaxDepth + stock) {
                currentZ -= stepdown;
                if (currentZ < numericMaxDepth + stock) currentZ = numericMaxDepth + stock;

                code.push(`(Roughing Level Z=${currentZ.toFixed(3)})`);

                // Raster X
                let y = 0;
                let direction = 1;
                while (y <= numericLength) {
                    const yPct = 1 - (y / numericLength); // Image Y is inverted relative to Machine Y usually (Top vs Bottom)
                    // Actually, let's map Image (0,0) Top-Left to Machine (0, Length) Top-Left.
                    // So Machine Y = Length corresponds to Image Y = 0.
                    // Machine Y = 0 corresponds to Image Y = Height.

                    const startX = (direction === 1) ? 0 : numericWidth;
                    const endX = (direction === 1) ? numericWidth : 0;

                    code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
                    code.push(`G1 Z${currentZ.toFixed(3)} F${feed}`); // Plunge to layer depth (simplified)

                    // Scan line
                    const numSteps = Math.ceil(numericWidth / (toolDia / 2)); // Resolution of check
                    for (let i = 0; i <= numSteps; i++) {
                        const x = (direction === 1) ? (i / numSteps) * numericWidth : numericWidth - (i / numSteps) * numericWidth;
                        const xPct = x / numericWidth;
                        const modelZ = getZAt(xPct, yPct);

                        // If model is higher than current layer + stock, we must cut at model height + stock (or retract)
                        // If model is lower, we cut at current layer
                        let cutZ = Math.max(currentZ, modelZ + stock);

                        if (isNaN(cutZ)) {
                            console.error('NaN cutZ detected', { currentZ, modelZ, stock, xPct, yPct, x, y });
                            return { error: "Calculation error: NaN detected.", code: [], paths: [], bounds: {} };
                        }

                        // Optimization: Don't emit every point, only changes
                        // For now, simple linear moves
                        if (i === 0) code.push(`G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${cutZ.toFixed(3)} F${feed}`);
                        else code.push(`G1 X${x.toFixed(3)} Z${cutZ.toFixed(3)}`);

                        // Preview path (sampled)
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

        // --- Finishing ---
        if (doFinishing) {
            const toolIndex = toolLibrary.findIndex(t => t.id === finishingToolId);
            if (toolIndex === -1) return { error: "Please select a finishing tool.", code: [], paths: [], bounds: {} };
            const tool = toolLibrary[toolIndex];
            const toolDia = (tool.diameter === '' ? 0 : tool.diameter);
            const stepover = parseFloat(String(finishingStepover));
            const angle = parseFloat(String(finishingAngle));
            const feed = parseFloat(String(finishingFeed));
            const spindle = parseFloat(String(finishingSpindle));

            if ([stepover, angle, feed, spindle].some(isNaN)) return { error: "Invalid finishing parameters.", code: [], paths: [], bounds: {} };

            code.push(`(--- Finishing ---)`, `(Tool: ${tool.name})`, `M3 S${spindle}`, `G0 Z${numericZSafe}`);

            const stepoverDist = toolDia * (stepover / 100);

            // Simple Raster X (ignoring angle for MVP, or implementing simple 0/90)
            // Implementing arbitrary angle is complex for raster. Let's stick to X (0) or Y (90).
            const isYScan = Math.abs(angle - 90) < 45;

            if (!isYScan) {
                // Scan X, Step Y
                let y = 0;
                let direction = 1;
                while (y <= numericLength) {
                    const yPct = 1 - (y / numericLength);
                    const startX = (direction === 1) ? 0 : numericWidth;

                    code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
                    // Plunge to first point Z
                    const startZ = getZAt((direction === 1 ? 0 : 1), yPct);
                    code.push(`G1 Z${startZ.toFixed(3)} F${feed}`);

                    const numSteps = Math.ceil(numericWidth / (toolDia / 4)); // Higher res for finish
                    for (let i = 1; i <= numSteps; i++) {
                        const x = (direction === 1) ? (i / numSteps) * numericWidth : numericWidth - (i / numSteps) * numericWidth;
                        const xPct = x / numericWidth;
                        const z = getZAt(xPct, yPct);
                        code.push(`G1 X${x.toFixed(3)} Z${z.toFixed(3)}`);

                        // Preview path (sampled)
                        if (i % 5 === 0) {
                            const prevX = (direction === 1) ? ((i - 5) / numSteps) * numericWidth : numericWidth - ((i - 5) / numSteps) * numericWidth;
                            paths.push({ d: `M ${prevX} ${y} L ${x} ${y}`, stroke: 'var(--color-accent-yellow)', strokeWidth: '0.5%' });
                        }
                    }
                    y += stepoverDist;
                    direction *= -1;
                }
            } else {
                // Scan Y, Step X
                let x = 0;
                let direction = 1;
                while (x <= numericWidth) {
                    const xPct = x / numericWidth;
                    const startY = (direction === 1) ? 0 : numericLength;

                    code.push(`G0 X${x.toFixed(3)} Y${startY.toFixed(3)}`);
                    const startZ = getZAt(xPct, (direction === 1 ? 1 : 0)); // y=0 is bottom (pct=1), y=Len is top (pct=0)
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

        code.push(`G0 Z${numericZSafe}`, `M5`, `G0 X0 Y0`);

        const bounds = { minX: 0, maxX: numericWidth, minY: 0, maxY: numericLength, minZ: numericMaxDepth, maxZ: numericZSafe };
        return { code, paths, bounds, error: null };
    };

    const applyArrayPattern = useCallback((singleOpResult: { code: string[]; paths: PreviewPath[]; bounds: Bounds }) => {
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

        const offsets = [];
        if (pattern === 'rect') {
            if ([numericRectCols, numericRectRows, numericRectSpacingX, numericRectSpacingY].some(isNaN)) {
                // If any is NaN, return empty. Error should ideally be caught higher up.
                return { code: [], paths: [], bounds: {}, error: "Invalid array pattern parameters." };
            }
            for (let row = 0; row < numericRectRows; row++) {
                for (let col = 0; col < numericRectCols; col++) {
                    offsets.push({ x: col * numericRectSpacingX, y: row * numericRectSpacingY });
                }
            }
        } else { // circ
            if ([numericCircCopies, numericCircRadius, numericCircCenterX, numericCircCenterY, numericCircStartAngle].some(isNaN)) {
                return { code: [], paths: [], bounds: {}, error: "Invalid array pattern parameters." };
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
                // Don't transform metadata or tool changes
                if (line.startsWith('(') || /T\d+\s*M6/.test(line)) {
                    // Only add tool change once
                    if (!finalCode.includes(line)) finalCode.unshift(line);
                } else {
                    finalCode.push(transformLine(line, offset));
                }
            });

            singlePaths.forEach((p: PreviewPath) => {
                let newPath = { ...p };
                if (p.d) { // path
                    newPath.d = p.d.replace(/([ML])(\s*[\d\.-]+)(\s*,?\s*)([\d\.-]+)/g, (match: string, cmd: string, x: string, sep: string, y: string) => {
                        return `${cmd} ${(parseFloat(x) + offset.x).toFixed(3)} ${sep} ${(parseFloat(y) + offset.y).toFixed(3)}`;
                    });
                }
                if (p.cx !== undefined && p.cy !== undefined) { // circle
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
    }, [arraySettings]);

    const handleGenerate = useCallback(async () => {
        setGenerationError(null);
        let result: { code: string[]; paths: any[]; bounds: any; error: string | null; } = { code: [], paths: [], bounds: {}, error: "Unknown operation" };

        if (activeTab === 'surfacing') result = generateSurfacingCode(settings);
        else if (activeTab === 'drilling') result = generateDrillingCode(settings);
        else if (activeTab === 'bore') result = generateBoreCode(settings);
        else if (activeTab === 'pocket') result = generatePocketCode(settings);
        else if (activeTab === 'profile') result = generateProfileCode(settings);
        else if (activeTab === 'slot') result = generateSlotCode(settings);
        else if (activeTab === 'text') result = generateTextCode(settings);
        else if (activeTab === 'thread') result = generateThreadMillingCode(settings);
        else if (activeTab === 'relief') result = await generateReliefCode(settings);

        if (result.error) {
            setGenerationError(result.error);
            setGeneratedGCode('');
            setPreviewPaths({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } }); // Reset preview on error
            return;
        }

        const showArray = !['surfacing', 'drilling', 'relief'].includes(activeTab); // Disable array for relief too
        if (showArray && arraySettings.isEnabled && result.code.length > 0) {
            result = applyArrayPattern(result);
        }

        setGeneratedGCode(result.code ? result.code.filter(line => line.trim() !== '').join('\n') : '');
        setPreviewPaths({ paths: result.paths, bounds: result.bounds });
    }, [activeTab, generatorSettings, toolLibrary, arraySettings, applyArrayPattern, generateSurfacingCode, generateDrillingCode, generateBoreCode, generatePocketCode, generateProfileCode, generateSlotCode, generateTextCode, generateThreadMillingCode, generateReliefCode]);

    const handleGenerateRef = React.useRef(handleGenerate);
    useEffect(() => {
        handleGenerateRef.current = handleGenerate;
    }, [handleGenerate]);

    const handleZoom = (factor: number) => {
        setViewBox(currentViewBox => {
            const parts = currentViewBox.split(' ').map(parseFloat);
            if (parts.length !== 4) return currentViewBox;
            let [x, y, w, h] = parts;
            const newW = w * factor;
            const newH = h * factor;
            const newX = x + (w - newW) / 2;
            const newY = y + (h - newH) / 2;
            return `${newX} ${newY} ${newW} ${newH}`;
        });
    };

    const handleParamChange = useCallback((field: string, value: any) => {
        const isNumberField = !['shape', 'cutSide', 'tabsEnabled', 'counterboreEnabled', 'type', 'font', 'text', 'alignment', 'hand', 'direction', 'drillType', 'imageDataUrl', 'invert', 'roughingEnabled', 'finishingEnabled', 'operation', 'keepAspectRatio'].includes(field);
        const parsedValue = isNumberField ? (value === '' || value === '-' ? value : parseFloat(value as string)) : value;
        if (isNumberField && value !== '' && value !== '-' && isNaN(parsedValue as number)) return;

        const tabKey = activeTab as keyof GeneratorSettings;
        onSettingsChange((prevSettings) => ({
            ...prevSettings,
            [tabKey]: { ...prevSettings[tabKey], [field]: parsedValue }
        }));
    }, [activeTab, onSettingsChange]);

    const handleToolChange = useCallback((toolId: number | null) => {
        // First, update the global selected tool ID in the App state
        onToolSelect(toolId);

        if (activeTab === 'relief') return;

        // Then, persist this change into the generator settings for the active tab
        const tabKey = activeTab as keyof GeneratorSettings;
        onSettingsChange((prevSettings) => ({
            ...prevSettings,
            [tabKey]: { ...prevSettings[tabKey], toolId: toolId }
        }));
    }, [activeTab, onSettingsChange, onToolSelect]);

    const currentParams = useMemo(() => {
        return generatorSettings[activeTab as keyof GeneratorSettings];
    }, [activeTab, generatorSettings]);

    // Effect to automatically trigger G-code generation when relevant parameters change
    useEffect(() => {
        if (isOpen) {
            // Use the ref to call the latest handleGenerate without creating an infinite loop
            handleGenerateRef.current();
        }
    }, [isOpen, generatorSettings, toolLibrary, arraySettings, activeTab]);

    // When the selected tool from outside changes (e.g. from auto-selection),
    // update the active tab's settings
    useEffect(() => {
        if (activeTab === 'relief') return;
        if (selectedToolId !== null && (currentParams as any)?.toolId !== selectedToolId) {
            handleToolChange(selectedToolId);
        }
    }, [selectedToolId, activeTab, currentParams, handleToolChange]);


    const isLoadDisabled = !generatedGCode || !!generationError || !currentParams || (activeTab !== 'relief' && (currentParams as any).toolId === null);

    const renderPreviewContent = () => {
        if (!currentParams || (activeTab !== 'relief' && (currentParams as any).toolId === null)) {
            return (
                <div className="aspect-square w-full bg-secondary rounded flex items-center justify-center p-4 text-center text-text-secondary" >
                    Please select a tool to generate a preview.
                </div>
            );
        }
        if (generationError) {
            return (
                <div className="aspect-square w-full bg-secondary rounded flex items-center justify-center p-4 text-center">
                    <div className="text-accent-yellow">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
                        <p className="font-bold">Generation Failed</p>
                        <p className="text-sm">{generationError}</p>
                    </div>
                </div>
            );
        }
        return <Preview paths={previewPaths.paths} viewBox={viewBox} machineSettings={settings} />;
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl border border-secondary transform transition-all max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">G-Code Generator</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-text-secondary hover:text-text-primary">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex border-b border-secondary flex-wrap">
                            <div className="w-full text-xs text-text-secondary uppercase tracking-wider">Milling</div>
                            <Tab label="Surfacing" isActive={activeTab === 'surfacing'} onClick={() => setActiveTab('surfacing')} />
                            <Tab label="Drilling" isActive={activeTab === 'drilling'} onClick={() => setActiveTab('drilling')} />
                            <Tab label="Bore" isActive={activeTab === 'bore'} onClick={() => setActiveTab('bore')} />
                            <Tab label="Pocket" isActive={activeTab === 'pocket'} onClick={() => setActiveTab('pocket')} />
                            <Tab label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                            <Tab label="Slot" isActive={activeTab === 'slot'} onClick={() => setActiveTab('slot')} />
                            <Tab label="Thread Milling" isActive={activeTab === 'thread'} onClick={() => setActiveTab('thread')} />
                            <Tab label="Relief" isActive={activeTab === 'relief'} onClick={() => setActiveTab('relief')} />
                            <div className="w-full text-xs text-text-secondary uppercase tracking-wider mt-2">Text & Engraving</div>
                            <Tab label="Text" isActive={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                        </div>
                        <div className="py-4">
                            {activeTab === 'surfacing' && (
                                <SurfacingGenerator
                                    params={generatorSettings.surfacing as SurfacingParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'drilling' && (
                                <DrillingGenerator
                                    params={generatorSettings.drilling as DrillingParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'bore' && (
                                <BoreGenerator
                                    params={generatorSettings.bore as BoreParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'pocket' && (
                                <PocketGenerator
                                    params={generatorSettings.pocket as PocketParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'profile' && (
                                <ProfileGenerator
                                    params={generatorSettings.profile as ProfileParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'slot' && (
                                <SlotGenerator
                                    params={generatorSettings.slot as SlotParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'text' && (
                                <TextGenerator
                                    params={generatorSettings.text as TextParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    fontOptions={Object.keys(FONTS)}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'thread' && (
                                <ThreadMillingGenerator
                                    params={generatorSettings.thread as ThreadMillingParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                            {activeTab === 'relief' && (
                                <ReliefGenerator
                                    params={generatorSettings.relief as ReliefParams}
                                    onParamsChange={handleParamChange}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                    selectedToolId={selectedToolId}
                                    onToolSelect={onToolSelect}
                                />
                            )}
                        </div>
                    </div>
                    <div className="bg-background p-4 rounded-md flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-secondary pb-2 mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold">2D Preview</h3>
                                <button
                                    onClick={handleGenerate}
                                    title="Regenerate G-Code and Preview"
                                    className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-focus disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <Zap className="w-4 h-4" />
                                    Generate
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => handleZoom(1.5)} title="Zoom Out" className="p-1.5 rounded-md hover:bg-secondary">
                                    <ZoomOut className="w-5 h-5 text-text-secondary" />
                                </button>
                                <button onClick={() => handleZoom(1 / 1.5)} title="Zoom In" className="p-1.5 rounded-md hover:bg-secondary">
                                    <ZoomIn className="w-5 h-5 text-text-secondary" />
                                </button>
                                <button onClick={fitView} title="Fit to View" className="p-1.5 rounded-md hover:bg-secondary">
                                    <Maximize className="w-5 h-5 text-text-secondary" />
                                </button>
                            </div>
                        </div>
                        {renderPreviewContent()}
                        <textarea
                            readOnly
                            value={generatedGCode}
                            className="w-full flex-grow bg-secondary font-mono text-sm p-2 rounded-md border border-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                            rows={8}
                        />
                    </div>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus">
                        Cancel
                    </button>
                    <button
                        onClick={() => onLoadGCode(generatedGCode, `${activeTab}_generated.gcode`)}
                        disabled={isLoadDisabled}
                        title={isLoadDisabled ? (generationError || 'Please select a tool') : 'Load G-Code'}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Load into Sender
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GCodeGeneratorModal;
