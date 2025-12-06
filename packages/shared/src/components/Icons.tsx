import {
    Power,
    PowerOff,
    Radio,
    Play,
    Pause,
    Square,
    Upload,
    Download,
    FileText,
    Send,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Info,
    AlertTriangle,
    Code,
    Eye,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Home,
    Pin,
    OctagonAlert,
    ChevronDown,
    ChevronUp,
    Unlock,
    CheckCircle,
    Circle,
    X,
    Maximize,
    Minimize,
    Pencil,
    Save,
    Sun,
    Moon,
    Volume2,
    VolumeX,
    Terminal,
    Move,
    PlayCircle,
    RotateCw,
    RotateCcw,
    Plus,
    Minus,
    RefreshCw,
    Percent,
    ZoomIn,
    ZoomOut,
    Clock,
    Zap,
    ZapOff,
    Trash2,
    PlusCircle,
    Settings,
    Wrench as Tool, // Lucide doesn't have "Tool", mapped to Wrench
    Camera,
    CameraOff,
    BookOpen,
    Crosshair,
    PictureInPicture, // Lucide has PictureInPicture
    Dock, // Lucide has Dock
    Search,
    Code2,
    Undo,
    Redo,
    Ruler,
    Check,
    Hand,
    GripHorizontal
} from 'lucide-react';

import React from 'react';

// Re-export Lucide icons
export {
    Power,
    PowerOff,
    Radio,
    Play,
    Pause,
    Square,
    Upload,
    Download,
    FileText,
    Send,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Info,
    AlertTriangle,
    Code,
    Eye,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Home,
    Pin,
    OctagonAlert,
    ChevronDown,
    ChevronUp,
    Unlock,
    CheckCircle,
    Circle,
    X,
    Maximize,
    Minimize,
    Pencil,
    Save,
    Sun,
    Moon,
    Volume2,
    VolumeX,
    Terminal,
    Move,
    PlayCircle,
    RotateCw,
    RotateCcw,
    Plus,
    Minus,
    RefreshCw,
    Percent,
    ZoomIn,
    ZoomOut,
    Clock,
    Zap,
    ZapOff,
    Trash2,
    PlusCircle,
    Settings,
    Tool,
    Camera,
    CameraOff,
    BookOpen,
    Crosshair,
    PictureInPicture,
    Dock,
    Search,
    Code2,
    Undo,
    Redo,
    Ruler,
    Check,
    Hand,
    GripHorizontal
};

// Custom Composite Icons (using Lucide style)
// These are specific to CNC and might not be in Lucide, so we recreate them to match Lucide's style (2px stroke, 24x24)

type IconProps = React.SVGProps<SVGSVGElement>;

export const Probe: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2v14" />
        <path d="m7 9 5 5 5-5" />
        <path d="M3 20h18" />
    </svg>
);

export const ProbeX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 3v18" />
        <path d="M2 12h15" />
        <path d="m13 8 4 4-4 4" />
    </svg>
);

export const ProbeY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 3h18" />
        <path d="M12 22V7" />
        <path d="m8 11 4-4 4 4" />
    </svg>
);

export const ProbeXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 3v18" />
        <path d="M3 21h18" />
        <path d="M3 3 17 17" />
        <path d="m13 17 4 4-4-4" />
        <circle cx="19" cy="19" r="2" />
    </svg>
);

export const HomeX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="translate(0, 0) scale(0.8)" />
        <text x="20" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">X</text>
    </svg>
);

export const HomeY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="translate(0, 0) scale(0.8)" />
        <text x="20" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">Y</text>
    </svg>
);

export const HomeZ: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="translate(0, 0) scale(0.8)" />
        <text x="20" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">Z</text>
    </svg>
);

export const HomeXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="translate(-2, -2) scale(0.8)" />
        <text x="20" y="22" textAnchor="end" fontSize="10" fontWeight="bold" stroke="none" fill="currentColor">XY</text>
    </svg>
);

export const CrosshairXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.8)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <text x="22" y="22" textAnchor="end" fontSize="10" fontWeight="bold" stroke="none" fill="currentColor">XY</text>
    </svg>
);

export const CrosshairZ: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.8)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <text x="22" y="22" textAnchor="end" fontSize="12" fontWeight="bold" stroke="none" fill="currentColor">Z</text>
    </svg>
);

export const CrosshairX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.8)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <text x="22" y="22" textAnchor="end" fontSize="12" fontWeight="bold" stroke="none" fill="currentColor">X</text>
    </svg>
);

export const CrosshairY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.8)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <text x="22" y="22" textAnchor="end" fontSize="12" fontWeight="bold" stroke="none" fill="currentColor">Y</text>
    </svg>
);

export const Contrast: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 18a6 6 0 0 0 0-12v12z" />
    </svg>
);
