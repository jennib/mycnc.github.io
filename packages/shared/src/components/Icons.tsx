import {
    Power,
    PowerOff,
    Calculator,
    Radio,
    ArrowRightLeft,
    Play,
    Pause,
    Square,
    Upload,
    Download,
    FileText,
    FolderOpen,
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
    Wrench,
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
    GripHorizontal,
    Wand,
    Layers,
    Keyboard,
    Activity,
    Image,
    History,
    Cpu,
    Target,
    ScanLine
} from 'lucide-react';

import React from 'react';

// Re-export Lucide icons
export {
    Power,
    PowerOff,
    Calculator,
    Radio,
    ArrowRightLeft,
    Play,
    Pause,
    Square,
    Upload,
    Download,
    FileText,
    FolderOpen,
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
    Wrench,
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
    GripHorizontal,
    Wand,
    Layers,
    Keyboard,
    Activity,
    Image,
    History,
    Cpu,
    Target,
    ScanLine
};

// Custom Composite Icons (using Lucide style)
// These are specific to CNC and might not be in Lucide, so we recreate them to match Lucide's style (2px stroke, 24x24)

type IconProps = React.SVGProps<SVGSVGElement>;

// ─── Probe Icons ─────────────────────────────────────────────────────────────
// Each probe icon shows the tool tip approaching the workpiece surface
// along the relevant axis, making the direction immediately obvious.

/** Probe Z – tool descends vertically to touch the top face */
export const Probe: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Tool body */}
        <rect x="9" y="2" width="6" height="10" rx="1" />
        {/* Tool tip point */}
        <path d="M9 12 12 16 15 12" />
        {/* Surface line */}
        <line x1="3" y1="19" x2="21" y2="19" />
        {/* Descent indicator arrows */}
        <path d="M12 16 12 18" strokeDasharray="1.5 1"/>
    </svg>
);

/** Probe X – tool moves right to touch the right face */
export const ProbeX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Surface wall on right */}
        <line x1="21" y1="3" x2="21" y2="21" />
        {/* Approach arrow */}
        <line x1="4" y1="12" x2="17" y2="12" />
        <path d="M14 8 18 12 14 16" />
        {/* Axis label badge */}
        <rect x="1" y="1" width="8" height="7" rx="1.5" fill="currentColor" stroke="none" opacity="0.85"/>
        <text x="5" y="7.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">X</text>
    </svg>
);

/** Probe Y – tool moves up to touch the top face */
export const ProbeY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Surface wall on top */}
        <line x1="3" y1="3" x2="21" y2="3" />
        {/* Approach arrow */}
        <line x1="12" y1="20" x2="12" y2="7" />
        <path d="M8 10 12 6 16 10" />
        {/* Axis label badge */}
        <rect x="1" y="16" width="8" height="7" rx="1.5" fill="currentColor" stroke="none" opacity="0.85"/>
        <text x="5" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">Y</text>
    </svg>
);

/** Probe XY – corner probe (finds both X and Y walls) */
export const ProbeXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Corner walls */}
        <line x1="20" y1="4" x2="20" y2="20" />
        <line x1="4" y1="20" x2="20" y2="20" />
        {/* Diagonal approach from top-left */}
        <line x1="4" y1="4" x2="15" y2="15" />
        <path d="M11 15 15 15 15 11" />
        {/* Corner contact dot */}
        <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
        {/* Badge */}
        <rect x="1" y="1" width="10" height="7" rx="1.5" fill="currentColor" stroke="none" opacity="0.85"/>
        <text x="6" y="7" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">XY</text>
    </svg>
);

/** Probe XYZ – full 3-axis corner probe */
export const ProbeXYZ: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Three walls representing a 3D corner */}
        <line x1="20" y1="3" x2="20" y2="18" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <line x1="4" y1="3" x2="4" y2="18" />
        {/* Target corner dot */}
        <circle cx="20" cy="18" r="2" fill="currentColor" stroke="none" />
        {/* Z descent line */}
        <line x1="12" y1="6" x2="12" y2="16" strokeDasharray="2 1.5"/>
        <path d="M9 13 12 17 15 13" />
        {/* Badge */}
        <rect x="13" y="1" width="11" height="7" rx="1.5" fill="currentColor" stroke="none" opacity="0.85"/>
        <text x="18.5" y="7" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">XYZ</text>
    </svg>
);

// ─── Home Axis Icons ──────────────────────────────────────────────────────────
// House icon at full size with a crisp axis-letter badge in the bottom-right.
// The badge uses a filled rect so the letter is always legible at any size.

/** Home All axes */
// (re-exported from Lucide as `Home` – no composite needed)

/** Home X axis */
export const HomeX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* House – scaled to leave room for badge */}
        <g transform="translate(0,-1) scale(0.82)">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </g>
        {/* Axis badge */}
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">X</text>
    </svg>
);

/** Home Y axis */
export const HomeY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="translate(0,-1) scale(0.82)">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </g>
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">Y</text>
    </svg>
);

/** Home Z axis */
export const HomeZ: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="translate(0,-1) scale(0.82)">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </g>
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">Z</text>
    </svg>
);

/** Home XY axes */
export const HomeXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="translate(0,-1) scale(0.82)">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </g>
        <rect x="13" y="16" width="11" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="18.5" y="23" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">XY</text>
    </svg>
);

// ─── Crosshair / Zero Axis Icons ──────────────────────────────────────────────
// Standard Lucide crosshair at 80% scale + colored axis badge bottom-right.

/** Zero All axes – re-use Lucide Crosshair directly (no badge needed) */
// exported from Lucide as `Crosshair`

/** Zero XY axes */
export const CrosshairXY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="translate(0,0) scale(0.82)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <rect x="13" y="16" width="11" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="18.5" y="23" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">XY</text>
    </svg>
);

/** Zero Z axis */
export const CrosshairZ: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.82)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">Z</text>
    </svg>
);

/** Zero X axis */
export const CrosshairX: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.82)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">X</text>
    </svg>
);

/** Zero Y axis */
export const CrosshairY: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="scale(0.82)">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </g>
        <rect x="15" y="16" width="9" height="8" rx="2" fill="currentColor" stroke="none"/>
        <text x="19.5" y="23" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" stroke="none" fontFamily="system-ui,sans-serif">Y</text>
    </svg>
);

export const Contrast: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 18a6 6 0 0 0 0-12v12z" />
    </svg>
);
