

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, Zap, ZoomIn, ZoomOut, Maximize, AlertTriangle } from './Icons';
import { RadioGroup, Input, SpindleAndFeedControls, ArrayControls } from './SharedControls';
import { FONTS } from '../services/cncFonts.js';
import { MachineSettings, Tool } from '../types';
import SlotGenerator from './SlotGenerator';
import SurfacingGenerator from './SurfacingGenerator';
import DrillingGenerator from './DrillingGenerator';
import BoreGenerator from './BoreGenerator';
import ProfileGenerator from './ProfileGenerator';
import PocketGenerator from './PocketGenerator';
import ThreadMillingGenerator from './ThreadMillingGenerator';
import TextGenerator from './TextGenerator';

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

interface PreviewProps {
    paths: any[];
    viewBox: string;
}

const Preview: React.FC<PreviewProps> = ({ paths, viewBox }) => {
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
                    {x.toFixed(0)}
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
                    {yFlipped.toFixed(0)}
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
}

const GCodeGeneratorModal: React.FC<GCodeGeneratorModalProps> = ({ isOpen, onClose, onLoadGCode, unit, settings, toolLibrary }) => {
    const [activeTab, setActiveTab] = useState('surfacing');
    const [generatedGCode, setGeneratedGCode] = useState('');
    const [previewPaths, setPreviewPaths] = useState({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } });
    const [viewBox, setViewBox] = useState('0 0 100 100'); 
    const [generationError, setGenerationError] = useState<string | null>(null);

    // --- Profile State ---
    const [profileParams, setProfileParams] = useState<{
        shape: string; width: number | ''; length: number | ''; cornerRadius: number | ''; diameter: number | '';
        depth: number | ''; depthPerPass: number | ''; cutSide: string; tabsEnabled: boolean; numTabs: number | '';
        tabWidth: number | ''; tabHeight: number | ''; feed: number | ''; spindle: number | ''; safeZ: number | ''; toolId: number | null;
    }>({
        shape: 'rect',
        width: 80, length: 50, cornerRadius: 10, diameter: 60,
        depth: -12, depthPerPass: 3, cutSide: 'outside',
        tabsEnabled: true, numTabs: 4, tabWidth: 6, tabHeight: 2,
        feed: 600, spindle: settings.spindle.max || 9000, safeZ: 5,
        toolId: null,
    });

    // --- Drilling State ---
    const [drillParams, setDrillParams] = useState<{
        drillType: string; depth: number | ''; peck: number | ''; retract: number | ''; feed: number | ''; spindle: number | ''; safeZ: number | '';
        singleX: number | ''; singleY: number | ''; rectCols: number | ''; rectRows: number | ''; rectSpacingX: number | '';
        rectSpacingY: number | ''; rectStartX: number | ''; rectStartY: number | ''; circCenterX: number | '';
        circCenterY: number | ''; circRadius: number | ''; circHoles: number | ''; circStartAngle: number | ''; toolId: number | null;
    }>({
        drillType: 'single',
        depth: -5,
        peck: 2,
        retract: 2,
        feed: 150,
        spindle: settings.spindle.max || 8000,
        safeZ: 5,
        singleX: 10,
        singleY: 10,
        rectCols: 4,
        rectRows: 3,
        rectSpacingX: 25,
        rectSpacingY: 20,
        rectStartX: 10,
        rectStartY: 10,
        circCenterX: 50,
        circCenterY: 50,
        circRadius: 40,
        circHoles: 6,
        circStartAngle: 0,
        toolId: null as number | null,
    });

    // --- Slot State ---
    const [slotParams, setSlotParams] = useState<{
        type: string; slotWidth: number | ''; depth: number | ''; depthPerPass: number | ''; feed: number | '';
        spindle: number | ''; safeZ: number | ''; startX: number | ''; startY: number | ''; endX: number | ''; endY: number | '';
        centerX: number | ''; centerY: number | ''; radius: number | ''; startAngle: number | ''; endAngle: number | ''; toolId: number | null;
    }>({
        type: 'straight',
        slotWidth: 6, depth: -5, depthPerPass: 2,
        feed: 400, spindle: settings.spindle.max || 8000, safeZ: 5,
        startX: 10, startY: 10, endX: 90, endY: 20,
        centerX: 50, centerY: 50, radius: 40, startAngle: 45, endAngle: 135,
        toolId: null,
    });

    // --- Surfacing State ---
    const [surfaceParams, setSurfaceParams] = useState<{
        width: number | ''; length: number | ''; depth: number | ''; stepover: number | ''; feed: number | '';
        spindle: number | ''; safeZ: number | ''; startX: number | ''; startY: number | ''; toolId: number | null; direction: string;
    }>({
        width: 100,
        length: 100,
        depth: -1,
        stepover: 40,
        feed: 800,
        spindle: settings.spindle.max || 8000,
        safeZ: 5,
        startX: 0,
        startY: 0,
        toolId: null as number | null,
        direction: 'horizontal',
    });

    // --- Bore State ---
    const [boreParams, setBoreParams] = useState<{
        centerX: number | ''; centerY: number | ''; holeDiameter: number | ''; holeDepth: number | '';
        counterboreEnabled: boolean; cbDiameter: number | ''; cbDepth: number | ''; depthPerPass: number | '';
        feed: number | ''; plungeFeed: number | ''; spindle: number | ''; safeZ: number | ''; toolId: number | null;
    }>({
        centerX: 50,
        centerY: 50,
        holeDiameter: 20,
        holeDepth: -15,
        counterboreEnabled: true,
        cbDiameter: 30,
        cbDepth: -5,
        depthPerPass: 2,
        feed: 400,
        plungeFeed: 150,
        spindle: settings.spindle.max || 8000,
        safeZ: 5,
        toolId: null as number | null,
    });

    // --- Pocket State ---
    const [pocketParams, setPocketParams] = useState<{
        shape: string; width: number | ''; length: number | ''; cornerRadius: number | ''; diameter: number | '';
        depth: number | ''; depthPerPass: number | ''; stepover: number | ''; feed: number | ''; plungeFeed: number | '';
        spindle: number | ''; safeZ: number | ''; toolId: number | null;
    }>({
        shape: 'rect',
        width: 80,
        length: 50,
        cornerRadius: 5,
        diameter: 60,
        depth: -10,
        depthPerPass: 2,
        stepover: 40,
        feed: 500,
        plungeFeed: 150,
        spindle: settings.spindle.max || 8000,
        safeZ: 5,
        toolId: null as number | null,
    });

    // --- Text State ---
    const [textParams, setTextParams] = useState<{
        text: string; font: string; height: number | ''; spacing: number | ''; startX: number | ''; startY: number | '';
        alignment: string; depth: number | ''; feed: number | ''; spindle: number | ''; safeZ: number | '';
        toolId: number | null;
    }>({
        text: 'HELLO',
        font: 'Sans-serif Stick',
        height: 10,
        spacing: 2,
        startX: 10,
        startY: 10,
        alignment: 'left',
        depth: -0.5,
        feed: 300,
        spindle: settings.spindle.max || 10000,
        safeZ: 5,
        toolId: null,
    });

    // --- Thread Milling State ---
    const [threadParams, setThreadParams] = useState<{
        type: string; hand: string; diameter: number | ''; pitch: number | ''; depth: number | '';
        feed: number | ''; spindle: number | ''; safeZ: number | ''; toolId: number | null;
    }>({
        type: 'internal',
        hand: 'right',
        diameter: 10,
        pitch: 1,
        depth: 10,
        feed: 200,
        spindle: settings.spindle.max || 10000,
        safeZ: 5,
        toolId: null,
    });
    
    // --- Array State (now universal) ---
    const [arraySettings, setArraySettings] = useState({
        isEnabled: false,
        pattern: 'rect',
        rectCols: 3, rectRows: 2, rectSpacingX: 15, rectSpacingY: 15,
        circCopies: 6, circRadius: 40, circCenterX: 50, circCenterY: 50, circStartAngle: 0,
    });
    
    const calculateViewBox = useCallback((bounds) => {
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
    }, []);

    const fitView = useCallback(() => {
        setViewBox(calculateViewBox(previewPaths.bounds));
    }, [previewPaths.bounds, calculateViewBox]);

    // This effect automatically fits the view whenever the preview bounds change.
    useEffect(() => {
        fitView();
    }, [fitView]);

    const generateDrillingCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === drillParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { depth, peck, retract, feed, spindle, safeZ } = drillParams;
        if ([depth, peck, feed, spindle, safeZ].some(p => p === '' || p === null || isNaN(Number(p)))) {
            return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
        }

        const code = [
            `(--- Drilling Operation: ${drillParams.drillType} ---)`,
            `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
            `G21 G90`, `M3 S${spindle}`
        ];
        const paths = [];
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        const updateBounds = (x, y) => {
            bounds.minX = Math.min(bounds.minX, x);
            bounds.maxX = Math.max(bounds.maxX, x);
            bounds.minY = Math.min(bounds.minY, y);
            bounds.maxY = Math.max(bounds.maxY, y);
        };

        const points = [];
        if (drillParams.drillType === 'single') {
            points.push({ x: drillParams.singleX, y: drillParams.singleY });
        } else if (drillParams.drillType === 'rect') {
            const { rectCols, rectRows, rectSpacingX, rectSpacingY, rectStartX, rectStartY } = drillParams;
            for (let row = 0; row < rectRows; row++) {
                for (let col = 0; col < rectCols; col++) {
                    points.push({
                        x: rectStartX + col * rectSpacingX,
                        y: rectStartY + row * rectSpacingY
                    });
                }
            }
        } else { // circ
            const { circHoles, circRadius, circCenterX, circCenterY, circStartAngle } = drillParams;
            const angleStep = circHoles > 0 ? 360 / circHoles : 0;
            for (let i = 0; i < circHoles; i++) {
                const angle = (circStartAngle + i * angleStep) * (Math.PI / 180);
                points.push({
                    x: circCenterX + circRadius * Math.cos(angle),
                    y: circCenterY + circRadius * Math.sin(angle)
                });
            }
        }

        // Use G83 Peck Drilling Cycle
        code.push(`G0 Z${safeZ.toFixed(3)}`);
        code.push(`G83 Z${depth.toFixed(3)} Q${peck.toFixed(3)} R${retract.toFixed(3)} F${feed.toFixed(3)}`);
        points.forEach(p => {
            code.push(`X${p.x.toFixed(3)} Y${p.y.toFixed(3)}`);
            paths.push({ cx: p.x, cy: p.y, r: selectedTool.diameter / 2, stroke: 'var(--color-accent-yellow)', fill: 'var(--color-accent-yellow-transparent)' });
            updateBounds(p.x, p.y);
        });
        code.push('G80'); // Cancel cycle
        code.push(`G0 Z${safeZ.toFixed(3)}`);
        code.push('M5');

        return { code, paths, bounds, error: null };
    };

    const generateProfileCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === profileParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = selectedTool.diameter;

        const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, cutSide, tabsEnabled, numTabs, tabWidth, tabHeight, feed, spindle, safeZ } = profileParams;

        const code = [
            `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
            // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
            `G21 G90`, `M3 S${spindle}`];
        const paths = [];
        const toolRadius = toolDiameter / 2;
        let offset = 0;
        if (cutSide === 'outside') offset = toolRadius;
        if (cutSide === 'inside') offset = -toolRadius;

        const bounds = shape === 'rect' ? { minX: -offset, minY: -offset, maxX: width + offset, maxY: length + offset } : { minX: -diameter / 2 - offset, minY: -diameter / 2 - offset, maxX: diameter / 2 + offset, maxY: diameter / 2 + offset };

        // Draw original shape for reference
        if (shape === 'rect') {
             paths.push({ d: `M 0 ${cornerRadius} L 0 ${length-cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${length} L ${width-cornerRadius} ${length} A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${length-cornerRadius} L ${width} ${cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 1 ${width-cornerRadius} 0 L ${cornerRadius} 0 A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${cornerRadius}`, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '0.5%' });
        } else {
            paths.push({ cx: diameter/2, cy: diameter/2, r: diameter/2, stroke: 'var(--color-text-secondary)', fill: 'none', strokeDasharray: '4 2', strokeWidth: '0.5%'});
        }

        const numericDepth = Number(depth);
        const numericDepthPerPass = Number(depthPerPass);
        let currentDepth = 0;
        while (currentDepth > numericDepth) {
            currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);

            if (shape === 'rect') {
                const r = Math.max(0, cornerRadius - offset);
                const w = width + offset * 2;
                const l = length + offset * 2;

                const p1 = { x: -offset + r, y: -offset };
                const p2 = { x: w - r, y: -offset };
                const p3 = { x: w, y: -offset + r };
                const p4 = { x: w, y: l - r };
                const p5 = { x: w - r, y: l };
                const p6 = { x: -offset + r, y: l };
                const p7 = { x: -offset, y: l - r };
                const p8 = { x: -offset, y: -offset + r };

                code.push(`G0 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} Z${safeZ}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${feed/2}`);

                code.push(`G1 X${p1.x.toFixed(3)} F${feed}`);
                if (r > 0) code.push(`G2 X${(-offset).toFixed(3)} Y${p8.y.toFixed(3)} I0 J${r.toFixed(3)}`);
                code.push(`G1 Y${p7.y.toFixed(3)}`);
                if (r > 0) code.push(`G2 X${p6.x.toFixed(3)} Y${l.toFixed(3)} I${r.toFixed(3)} J0`);
                code.push(`G1 X${p5.x.toFixed(3)}`);
                if (r > 0) code.push(`G2 X${w.toFixed(3)} Y${p4.y.toFixed(3)} I0 J${-r.toFixed(3)}`);
                code.push(`G1 Y${p3.y.toFixed(3)}`);
                if (r > 0) code.push(`G2 X${p2.x.toFixed(3)} Y${(-offset).toFixed(3)} I${-r.toFixed(3)} J0`);
                
                 paths.push({ d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r} ${r} 0 0 0 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r} ${r} 0 0 0 ${p5.x} ${p5.y} L ${p6.x} ${p6.y} A ${r} ${r} 0 0 0 ${p7.x} ${p7.y} L ${p8.x} ${p8.y} A ${r} ${r} 0 0 0 ${p1.x} ${p1.y}`, stroke: 'var(--color-accent-yellow)', fill: 'none', strokeWidth: '2%'});
            
            } else { // Circle
                const radius = diameter / 2 + offset;
                const centerX = diameter / 2;
                const centerY = diameter / 2;
                code.push(`G0 X${(centerX + radius).toFixed(3)} Y${centerY.toFixed(3)} Z${safeZ}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${feed/2}`);
                code.push(`G2 I${-radius.toFixed(3)} J0 F${Number(feed)}`);
                paths.push({ cx: centerX, cy: centerY, r: radius, stroke: 'var(--color-accent-yellow)', fill: 'none', strokeWidth: '2%'});
            }
        }
        
        // TODO: Implement tabs logic for final pass
        
        code.push(`G0 Z${safeZ}`, `M5`);
        return { code, paths, bounds, error: null };
    };

    const generateSurfacingCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === surfaceParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { width, length, depth, stepover, feed, spindle, safeZ, direction } = surfaceParams;
        if ([width, length, depth, stepover, feed, spindle, safeZ].some(p => p === '' || p === null || isNaN(Number(p)))) {
            return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
        }

        const code = [
            `(--- Surfacing Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
            `G21 G90`, `M3 S${spindle}`
        ];
        const paths = [];
        const toolRadius = selectedTool.diameter / 2;
        const stepoverDist = selectedTool.diameter * (stepover / 100);

        code.push(`G0 Z${safeZ.toFixed(3)}`);

        if (direction === 'horizontal') {
            let y = toolRadius;
            let xDirection = 1; // 1 for right, -1 for left
            while (y <= length + toolRadius) {
                const startX = (xDirection === 1) ? -toolRadius : width + toolRadius;
                const endX = (xDirection === 1) ? width + toolRadius : -toolRadius;
                code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
                code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
                code.push(`G1 X${endX.toFixed(3)} F${feed}`);
                code.push(`G0 Z${safeZ.toFixed(3)}`);
                paths.push({ d: `M ${startX} ${y} L ${endX} ${y}`, stroke: 'var(--color-accent-yellow)' });
                y += stepoverDist;
                xDirection *= -1; // Reverse direction for next pass
            }
        } else { // vertical
            let x = toolRadius;
            let yDirection = 1; // 1 for up, -1 for down
            while (x <= width + toolRadius) {
                const startY = (yDirection === 1) ? -toolRadius : length + toolRadius;
                const endY = (yDirection === 1) ? length + toolRadius : -toolRadius;
                code.push(`G0 X${x.toFixed(3)} Y${startY.toFixed(3)}`);
                code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
                code.push(`G1 Y${endY.toFixed(3)} F${feed}`);
                code.push(`G0 Z${safeZ.toFixed(3)}`);
                paths.push({ d: `M ${x.toFixed(3)} ${startY.toFixed(3)} L ${x.toFixed(3)} ${endY.toFixed(3)}`, stroke: 'var(--color-accent-yellow)' });
                x += stepoverDist;
                yDirection *= -1; // Reverse direction for next pass
            }
        }

        code.push(`M5`);
        const bounds = { minX: 0, minY: 0, maxX: width, maxY: length };
        return { code, paths, bounds, error: null };
    };

    const generatePocketCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === pocketParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ } = pocketParams;
        if ([depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ].some(p => p === '' || p === null || isNaN(Number(p)))) {
            return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
        }

        const code = [
            `(--- Pocket Operation: ${shape} ---)`,
            `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
            `G21 G90`, `M3 S${spindle}`, `G0 Z${safeZ}`
        ];
        const paths = [];
        const toolRadius = selectedTool.diameter / 2;
        const stepoverDist = selectedTool.diameter * (stepover / 100);

        const numericDepth = Number(depth);
        const numericPlungeFeed = Number(plungeFeed);
        let currentDepth = 0;
        while (currentDepth > numericDepth) {
            currentDepth = Math.max(numericDepth, currentDepth - (Number(depthPerPass)));
            code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

            if (shape === 'rect') {
                const centerX = width / 2;
                const centerY = length / 2;
                code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);

                // Simplified raster clearing for now
                let y = toolRadius;
                while (y <= length - toolRadius) {
                    code.push(`G1 X${(width - toolRadius).toFixed(3)} Y${y.toFixed(3)} F${feed}`);
                    paths.push({ d: `M${toolRadius} ${y} L${width - toolRadius} ${y}`, stroke: 'var(--color-accent-yellow)' });
                    y += stepoverDist;
                    if (y <= length - toolRadius) {
                        code.push(`G1 X${toolRadius.toFixed(3)} Y${y.toFixed(3)} F${feed}`);
                        paths.push({ d: `M${width - toolRadius} ${y - stepoverDist} L${width - toolRadius} ${y}`, stroke: 'var(--color-text-secondary)' });
                    }
                }
            } else { // Circle
                const centerX = diameter / 2;
                const centerY = diameter / 2;
                const maxRadius = diameter / 2 - toolRadius;
                code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
                code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);
            }
        }

        code.push(`G0 Z${safeZ}`, `M5`, `G0 X0 Y0`);
        const bounds = shape === 'rect' ? { minX: 0, minY: 0, maxX: width, maxY: length } : { minX: 0, minY: 0, maxX: diameter, maxY: diameter };
        return { code, paths, bounds, error: null };
    };

    const generateBoreCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === boreParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { centerX, centerY, holeDiameter, holeDepth, counterboreEnabled, cbDiameter, cbDepth, depthPerPass, feed, plungeFeed, spindle, safeZ } = boreParams;

        if (holeDiameter <= selectedTool.diameter) {
            return { error: "Tool must be smaller than hole diameter.", code: [], paths: [], bounds: {} };
        }
        if (counterboreEnabled && cbDiameter <= selectedTool.diameter) {
            return { error: "Tool must be smaller than counterbore diameter.", code: [], paths: [], bounds: {} };
        }
        if (counterboreEnabled && cbDiameter <= holeDiameter) {
            return { error: "Counterbore must be larger than hole diameter.", code: [], paths: [], bounds: {} };
        }

        const code = [
            `(--- Bore Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
            `G21 G90`, `M3 S${spindle}`
        ];
        const paths = [];
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        const updateBounds = (x, y, r) => {
            bounds.minX = Math.min(bounds.minX, x - r);
            bounds.maxX = Math.max(bounds.maxX, x + r);
            bounds.minY = Math.min(bounds.minY, y - r);
            bounds.maxY = Math.max(bounds.maxY, y + r);
        };

        const doHelicalBore = (targetDiameter, targetDepth, startZ = 0) => {
            const pathRadius = (targetDiameter - selectedTool.diameter) / 2;
            if (pathRadius <= 0) return;

            code.push(`(Boring to Ø${targetDiameter} at Z=${targetDepth})`);
            paths.push({ cx: centerX, cy: centerY, r: targetDiameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '0.5%' });
            updateBounds(centerX, centerY, targetDiameter / 2);

            const numericPlungeFeed = Number(plungeFeed);
            const numericDepthPerPass = Number(depthPerPass);
            code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)} Z${safeZ.toFixed(3)}`);
            code.push(`G1 Z${startZ.toFixed(3)} F${numericPlungeFeed}`);

            let currentDepth = startZ;
            while (currentDepth > targetDepth) {
                currentDepth = Math.max(targetDepth, currentDepth - numericDepthPerPass);
                // Ramp in
                code.push(`G2 X${(centerX + pathRadius).toFixed(3)} Y${centerY.toFixed(3)} I${pathRadius / 2} J0 Z${currentDepth.toFixed(3)} F${feed}`);
                // Full circle
                code.push(`G2 I${-pathRadius.toFixed(3)} J0`);
                // Ramp out
                code.push(`G2 X${centerX.toFixed(3)} Y${centerY.toFixed(3)} I${-pathRadius / 2} J0`);

                if (currentDepth === Math.max(targetDepth, startZ - numericDepthPerPass)) {
                    paths.push({ cx: centerX, cy: centerY, r: pathRadius, stroke: 'var(--color-accent-yellow)' });
                }
            }
        };

        if (counterboreEnabled) {
            // Order depths from shallowest to deepest
            const numericCbDepth = Number(cbDepth);
            const numericHoleDepth = Number(holeDepth);
            if (numericCbDepth > numericHoleDepth) {
                doHelicalBore(cbDiameter, cbDepth);
                doHelicalBore(holeDiameter, holeDepth, cbDepth);
            } else {
                // This case is less common but possible
                doHelicalBore(holeDiameter, holeDepth);
                doHelicalBore(cbDiameter, cbDepth); // This will just re-trace in air, but handles the logic simply
            }
        } else {
            doHelicalBore(holeDiameter, holeDepth);
        }

        code.push(`G0 Z${safeZ.toFixed(3)}`);
        code.push(`M5`);
        code.push(`G0 X0 Y0`);

        return { code, paths, bounds, error: null };
    };

    const generateSlotCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === slotParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex];
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = selectedTool.diameter;
        
        const { type, slotWidth, depth, depthPerPass, feed, spindle, safeZ, startX, startY, endX, endY, centerX, centerY, radius, startAngle, endAngle } = slotParams as {[key:string]: any};
        const paramsToCheck: (string | number | null)[] = [slotWidth, depth, depthPerPass, feed, spindle, safeZ];
        if (paramsToCheck.some(p => p === '' || p === null)) return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };

        const code = [
            `(--- Slot Operation: ${type} ---)`,
            `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
            // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
            `G21 G90`, `M3 S${spindle}`
        ];
        const paths = [];
        let bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        const updateBounds = (x, y) => {
            bounds.minX = Math.min(bounds.minX, x);
            bounds.maxX = Math.max(bounds.maxX, x);
            bounds.minY = Math.min(bounds.minY, y);
            bounds.maxY = Math.max(bounds.maxY, y);
        };
        
        const offsets = [];
        if (slotWidth <= toolDiameter) {
            offsets.push(0);
        } else {
            const wallOffset = (slotWidth - toolDiameter) / 2;
            offsets.push(-wallOffset, wallOffset);
            if (slotWidth > toolDiameter * 2) {
                 offsets.push(0); // Add a center pass
            }
        }
        offsets.sort((a,b) => a-b);


        const numericDepth = Number(depth);
        const numericDepthPerPass = Number(depthPerPass);
        let currentDepth = 0;
        while (currentDepth > numericDepth) {
            currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
            code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);

            for (const offset of offsets) {
                if (type === 'straight') {
                    const angle = Math.atan2(endY - startY, endX - startX);
                    const perpAngle = angle + Math.PI / 2;

                    const dx = Math.cos(perpAngle) * offset;
                    const dy = Math.sin(perpAngle) * offset;

                    const passStartX = startX + dx;
                    const passStartY = startY + dy;
                    const passEndX = endX + dx;
                    const passEndY = endY + dy;

                    code.push(`G0 Z${safeZ}`);
                    code.push(`G0 X${passStartX.toFixed(3)} Y${passStartY.toFixed(3)}`);
                    code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
                    code.push(`G1 X${passEndX.toFixed(3)} Y${passEndY.toFixed(3)} F${feed}`);

                    if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                        paths.push({ d: `M${passStartX} ${passStartY} L${passEndX} ${passEndY}`, stroke: 'var(--color-accent-yellow)', strokeWidth: `${toolDiameter}%` });
                        updateBounds(passStartX, passStartY);
                        updateBounds(passEndX, passEndY);
                    }
                } else { // arc
                    const passRadius = radius + offset;
                    if (passRadius <= 0) continue;

                    const startRad = startAngle * (Math.PI / 180);
                    const endRad = endAngle * (Math.PI / 180);

                    const passStartX = centerX + passRadius * Math.cos(startRad);
                    const passStartY = centerY + passRadius * Math.sin(startRad);
                    const passEndX = centerX + passRadius * Math.cos(endRad);
                    const passEndY = centerY + passRadius * Math.sin(endRad);

                    const gCodeArc = (endAngle > startAngle) ? 'G3' : 'G2';
                    const sweepFlag = (endAngle > startAngle) ? 1 : 0;
                    
                    const I = centerX - passStartX;
                    const J = centerY - passStartY;
                    
                    code.push(`G0 Z${safeZ}`);
                    code.push(`G0 X${passStartX.toFixed(3)} Y${passStartY.toFixed(3)}`);
                    code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
                    code.push(`${gCodeArc} X${passEndX.toFixed(3)} Y${passEndY.toFixed(3)} I${I.toFixed(3)} J${J.toFixed(3)} F${feed}`);
                    
                    if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
                        const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
                        paths.push({ d: `M ${passStartX} ${passStartY} A ${passRadius} ${passRadius} 0 ${largeArcFlag} ${sweepFlag} ${passEndX} ${passEndY}`, stroke: 'var(--color-accent-yellow)', fill: 'none', strokeWidth: `${toolDiameter}%` });
                        // Simple bounding box for arc
                        updateBounds(centerX - passRadius, centerY - passRadius);
                        updateBounds(centerX + passRadius, centerY + passRadius);
                    }
                }
            }
        }

        code.push(`G0 Z${safeZ}`, `M5`);
        return { code, paths, bounds, error: null };
    };
    
    const generateTextCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === textParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex] as Tool | undefined;
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };

        const { text, font, height, spacing, startX, startY, alignment, depth, feed, spindle, safeZ } = textParams;
        if ([height, spacing, startX, startY, depth, feed, spindle, safeZ].some(p => p === '' || p === null) || !text) return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };

        const fontData = FONTS[font];
        if (!fontData) {
             return { error: `Font "${font}" not found.`, code: [], paths: [], bounds: {} };
        }

        const code = [];
        const paths = [];
        const FONT_BASE_HEIGHT = 7;
        const FONT_BASE_WIDTH = 5;

        const scale = height / FONT_BASE_HEIGHT;
        const charWidth = FONT_BASE_WIDTH * scale;
        const totalTextWidth = (text.length * charWidth) + Math.max(0, (text.length - 1) * spacing);

        let currentX = startX;
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
        code.push(`M3 S${spindle}`);

        for (let i = 0; i < text.length; i++) {
            const char = text[i].toUpperCase();
            const charData = fontData.characters[char];
            
            if (charData) {
                if (fontData.type === 'stroke') {
                    for (const stroke of charData) {
                        const p1 = {
                            x: startOffsetX + i * (charWidth + spacing) + stroke.p1.x * scale,
                            y: startY + stroke.p1.y * scale
                        };
                        const p2 = {
                            x: startOffsetX + i * (charWidth + spacing) + stroke.p2.x * scale,
                            y: startY + stroke.p2.y * scale
                        };

                        code.push(`G0 Z${safeZ}`);
                        code.push(`G0 X${p1.x.toFixed(3)} Y${p1.y.toFixed(3)}`);
                        code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
                        code.push(`G1 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} F${feed}`);
                        code.push(`G0 Z${safeZ}`);

                        paths.push({ d: `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`, stroke: 'var(--color-accent-yellow)' });
                    }
                } else if (fontData.type === 'outline') {
                    for (const path of charData) {
                        if (path.length === 0) continue;

                        const scaledPath = path.map(p => ({
                           x: startOffsetX + i * (charWidth + spacing) + p.x * scale,
                           y: startY + p.y * scale
                        }));

                        code.push(`G0 Z${safeZ}`);
                        code.push(`G0 X${scaledPath[0].x.toFixed(3)} Y${scaledPath[0].y.toFixed(3)}`);
                        code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
                        
                        for (let j = 1; j < scaledPath.length; j++) {
                           code.push(`G1 X${scaledPath[j].x.toFixed(3)} Y${scaledPath[j].y.toFixed(3)} F${feed}`);
                        }
                        
                        if (scaledPath[0].x !== scaledPath[scaledPath.length-1].x || scaledPath[0].y !== scaledPath[scaledPath.length-1].y) {
                           code.push(`G1 X${scaledPath[0].x.toFixed(3)} Y${scaledPath[0].y.toFixed(3)} F${feed}`);
                        }
                        code.push(`G0 Z${safeZ}`);

                        const pathString = "M" + scaledPath.map(p => `${p.x} ${p.y}`).join(" L ") + " Z";
                        paths.push({ d: pathString, stroke: 'var(--color-accent-yellow)', 'strokeWidth': '2%', fill: 'none' });
                    }
                }
            }
        }

        code.push('M5');
        code.push(`G0 X${startX.toFixed(3)} Y${startY.toFixed(3)}`);
        
        const bounds = { minX: startOffsetX, maxX: startOffsetX + totalTextWidth, minY: startY, maxY: startY + height };
        
        return { code, paths, bounds, error: null };
    };

    const generateThreadMillingCode = () => {
        const toolIndex = toolLibrary.findIndex(t => t.id === threadParams.toolId);
        if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const selectedTool = toolLibrary[toolIndex] as Tool | undefined;
        if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
        const toolDiameter = selectedTool.diameter;

        const { type, hand, feed, spindle, safeZ } = threadParams;
        const diameter = Number(threadParams.diameter);
        const pitch = Number(threadParams.pitch);
        const depth = Number(threadParams.depth);

        if ([diameter, pitch, depth, feed, spindle, safeZ].some(p => p === '' || p === null || isNaN(Number(p)) || Number(p) <= 0)) {
            return { error: "Please fill all fields with positive values.", code: [], paths: [], bounds: {} };
        }
        if (toolDiameter >= diameter && type === 'internal') {
            return { error: "Tool diameter must be smaller than thread diameter for internal threads.", code: [], paths: [], bounds: {} };
        }

        const code = [
            `(--- Thread Milling Operation ---)`,
            `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
            `(Type: ${type}, Hand: ${hand})`,
            `(Diameter: ${diameter}, Pitch: ${pitch}, Depth: ${depth})`,
            `(Feed: ${feed}, Spindle: ${spindle})`,
            // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
            `G21 G90`,
            `M3 S${spindle}`,
            `G0 Z${safeZ}`,
        ];
        const paths = [];

        const centerX = 0; // Assume centered at origin for simplicity
        const centerY = 0;
        
        let pathRadius, helicalDirection;

        // Climb milling logic
        if (type === 'internal') {
            pathRadius = (diameter - toolDiameter) / 2;
            helicalDirection = (hand === 'right') ? 'G3' : 'G2'; // CCW for RH internal climb
        } else { // external
            pathRadius = (diameter + toolDiameter) / 2;
            helicalDirection = (hand === 'right') ? 'G2' : 'G3'; // CW for RH external climb
        }
        
        if (pathRadius <= 0) return { error: "Invalid tool/thread diameter combination.", code: [], paths: [], bounds: {} };

        // Preview paths
        paths.push({ cx: centerX, cy: centerY, r: diameter / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '4 2', strokeWidth: '2%', fill: 'none' });
        paths.push({ cx: centerX, cy: centerY, r: pathRadius, stroke: 'var(--color-accent-yellow)', strokeWidth: '3%', fill: 'none' });

        if (type === 'internal') {
            const preDrillRadius = diameter - pitch; // Approximation for pre-drill size
            paths.push({ cx: centerX, cy: centerY, r: preDrillRadius / 2, stroke: 'var(--color-text-secondary)', strokeDasharray: '2 2', strokeWidth: '2%', fill: 'none' });
        }
        
        const startX = centerX + pathRadius;

        // Start sequence (move to bottom and lead-in)
        code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
        code.push(`G1 Z${(-depth).toFixed(3)} F${feed / 2}`);
        code.push(`G1 X${startX.toFixed(3)} F${feed}`); // Straight lead-in from center

        // Helical motion upwards (climb milling)
        const numericDepth = Number(depth);
        let currentZ = -numericDepth;
        while (currentZ < 0) {
            currentZ = Math.min(0, currentZ + Number(pitch));
            code.push(`${helicalDirection} X${startX.toFixed(3)} Y${centerY.toFixed(3)} I${-pathRadius.toFixed(3)} J0 Z${currentZ.toFixed(3)} F${Number(feed)}`);
        }

        // Retract
        code.push(`G1 X${centerX.toFixed(3)} F${feed}`); // Straight lead-out to center
        code.push(`G0 Z${safeZ.toFixed(3)}`);
        code.push(`M5`);
        code.push(`G0 X0 Y0`);

        const boundsRadius = type === 'internal' ? diameter / 2 : pathRadius;
        const bounds = { minX: centerX - boundsRadius, maxX: centerX + boundsRadius, minY: centerY - boundsRadius, maxY: centerY + boundsRadius };
        
        return { code, paths, bounds, error: null };
    };
    
    const applyArrayPattern = useCallback((singleOpResult) => {
        const { code: singleCode, paths: singlePaths, bounds: singleBounds } = singleOpResult;
        const { pattern, rectCols, rectRows, rectSpacingX, rectSpacingY, circCopies, circRadius, circCenterX, circCenterY, circStartAngle } = arraySettings;
        const inputLines = singleCode;
        
        const transformLine = (line, offset) => {
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
            for (let row = 0; row < rectRows; row++) {
                for (let col = 0; col < rectCols; col++) {
                    offsets.push({ x: col * rectSpacingX, y: row * rectSpacingY });
                }
            }
        } else { // circ
            const angleStep = circCopies > 0 ? 360 / circCopies : 0;
            for (let i = 0; i < circCopies; i++) {
                const angle = (circStartAngle + i * angleStep) * (Math.PI / 180);
                offsets.push({
                    x: circCenterX + circRadius * Math.cos(angle),
                    y: circCenterY + circRadius * Math.sin(angle),
                });
            }
        }

        const finalCode = [];
        const finalPaths = [];
        const finalBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        
        offsets.forEach(offset => {
            finalCode.push(`(--- Repetition at X${offset.x.toFixed(3)} Y${offset.y.toFixed(3)} ---)`);
            inputLines.forEach(line => {
                // Don't transform metadata or tool changes
                if (line.startsWith('(') || /T\d+\s*M6/.test(line)) {
                    // Only add tool change once
                    if (!finalCode.includes(line)) finalCode.unshift(line);
                } else {
                    finalCode.push(transformLine(line, offset));
                }
            });

            singlePaths.forEach(p => {
                 let newPath = {...p};
                 if(p.d) { // path
                     newPath.d = p.d.replace(/([ML])(\s*[\d\.-]+)(\s*,?\s*)([\d\.-]+)/g, (match, cmd, x, sep, y) => {
                         return `${cmd} ${parseFloat(x) + offset.x} ${sep} ${parseFloat(y) + offset.y}`;
                     });
                 }
                 if(p.cx !== undefined) { // circle
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

        return { code: finalCode, paths: finalPaths, bounds: finalBounds };
    }, [arraySettings]);

    const handleGenerate = useCallback(() => {
        setGenerationError(null);
        let result: { code: string[]; paths: any[]; bounds: any; error: string | null; } = { code: [], paths: [], bounds: {}, error: "Unknown operation" };
        if (activeTab === 'surfacing') result = generateSurfacingCode(); else if (activeTab === 'drilling') result = generateDrillingCode();
        else if (activeTab === 'bore') result = generateBoreCode();
        else if (activeTab === 'pocket') result = generatePocketCode();
        else if (activeTab === 'profile') result = generateProfileCode();
        else if (activeTab === 'slot') result = generateSlotCode();
        else if (activeTab === 'text') result = generateTextCode();
        else if (activeTab === 'thread') result = generateThreadMillingCode();
        
        if (result.error) {
            setGenerationError(result.error);
            setGeneratedGCode('');
            setPreviewPaths({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } }); // Reset preview on error
            return;
        }

        const showArray = !['surfacing', 'drilling'].includes(activeTab);
        if (showArray && arraySettings.isEnabled && result.code.length > 0) {
             result = applyArrayPattern(result);
        }

        setGeneratedGCode(result.code ? result.code.join('\n') : '');
        setPreviewPaths({ paths: result.paths, bounds: result.bounds });
    }, [activeTab, surfaceParams, drillParams, boreParams, pocketParams, profileParams, slotParams, textParams, threadParams, toolLibrary, arraySettings, generateSurfacingCode, generateDrillingCode, generateBoreCode, generatePocketCode, generateProfileCode, generateSlotCode, generateTextCode, generateThreadMillingCode, applyArrayPattern]);

    const handleGenerateRef = React.useRef(handleGenerate);
    useEffect(() => {
        handleGenerateRef.current = handleGenerate;
    }, [handleGenerate]);

    const handleZoom = (factor) => {
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

    const handleParamChange = useCallback((setter, field, value) => {
        setter((prevParams: any) => {
            const isNumberField = !['shape', 'cutSide', 'tabsEnabled', 'type', 'font', 'text', 'alignment', 'hand', 'direction'].includes(field);
            const parsedValue = isNumberField ? (value === '' ? '' : parseFloat(value as string)) : value;
            if (isNumberField && value !== '' && isNaN(parsedValue as number)) return prevParams;
            return { ...prevParams, [field]: parsedValue };
        });
    }, []);
    const handleSurfaceUpdate = useCallback((field, value) => handleParamChange(setSurfaceParams, field, value), [handleParamChange]);
    const handleDrillUpdate = useCallback((field, value) => handleParamChange(setDrillParams, field, value), [handleParamChange]);
    const handleBoreUpdate = useCallback((field, value) => handleParamChange(setBoreParams, field, value), [handleParamChange]);
    const handlePocketUpdate = useCallback((field, value) => handleParamChange(setPocketParams, field, value), [handleParamChange]);
    const handleProfileUpdate = useCallback((field, value) => handleParamChange(setProfileParams, field, value), [handleParamChange]);
    const handleSlotUpdate = useCallback((field, value) => handleParamChange(setSlotParams, field, value), [handleParamChange]);
    const handleTextUpdate = useCallback((field, value) => handleParamChange(setTextParams, field, value), [handleParamChange]);
    const handleThreadUpdate = useCallback((field, value) => handleParamChange(setThreadParams, field, value), [handleParamChange]);

    const currentParams = useMemo(() => {
        switch (activeTab) {
            case 'surfacing': return surfaceParams;
            case 'drilling': return drillParams;
            case 'bore': return boreParams;
            case 'pocket': return pocketParams;
            case 'profile': return profileParams;
            case 'slot': return slotParams;
            case 'text': return textParams;
            case 'thread': return threadParams;
            default: return null;
        }
    }, [activeTab, surfaceParams, drillParams, boreParams, pocketParams, profileParams, slotParams, textParams, threadParams]);

    // Effect to automatically trigger G-code generation when relevant parameters change
    useEffect(() => {
        if (isOpen) {
            // Use the ref to call the latest handleGenerate without creating an infinite loop
            handleGenerateRef.current();
        }
    }, [isOpen, currentParams, toolLibrary, arraySettings]);

    const isLoadDisabled = !generatedGCode || !!generationError || !currentParams || currentParams.toolId === null;

    const renderPreviewContent = () => {
        if (!currentParams || currentParams.toolId === null) {
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
        return <Preview paths={previewPaths.paths} viewBox={viewBox} />;
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl border border-secondary transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
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
                            <div className="w-full text-xs text-text-secondary uppercase tracking-wider mt-2">Text & Engraving</div>
                            <Tab label="Text" isActive={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                        </div>
                        <div className="py-4">
                            {activeTab === 'surfacing' && (
                                <SurfacingGenerator
                                    params={surfaceParams}
                                    onParamsChange={handleSurfaceUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'drilling' && (
                                <DrillingGenerator
                                    params={drillParams}
                                    onParamsChange={handleDrillUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'bore' && (
                                <BoreGenerator
                                    params={boreParams}
                                    onParamsChange={handleBoreUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'pocket' && (
                                <PocketGenerator
                                    params={pocketParams}
                                    onParamsChange={handlePocketUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'profile' && (
                                <ProfileGenerator
                                    params={profileParams}
                                    onParamsChange={handleProfileUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'slot' && (
                                <SlotGenerator
                                    params={slotParams}
                                    onParamsChange={handleSlotUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
                                />
                            )}
                            {activeTab === 'text' && (
                                <TextGenerator
                                    params={textParams}
                                    onParamsChange={handleTextUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    fontOptions={Object.keys(FONTS)}
                                    settings={settings}
                                />
                            )} 
                            {activeTab === 'thread' && (
                                <ThreadMillingGenerator
                                    params={threadParams}
                                    onParamsChange={handleThreadUpdate}
                                    toolLibrary={toolLibrary}
                                    unit={unit}
                                    settings={settings}
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
                            <h3 className="font-bold">2D Preview</h3>
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