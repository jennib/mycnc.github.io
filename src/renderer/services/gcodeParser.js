
const getParam = (gcode, param) => {
    // Allows for optional whitespace between parameter and value
    const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

export const parseGCode = (gcodeLines) => {
    const segments = [];
    const bounds = {
        minX: Infinity, maxX: -Infinity, 
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity
    };

    let currentPos = { x: 0, y: 0, z: 0 };
    let motionMode = 'G0'; // Default motion mode

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
        const cleanLine = line.toUpperCase().replace(/\(.*\)/g, '').split(';')[0].trim();
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

        // A motion command must have a destination (X, Y, Z) or an arc offset (I, J)
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
                // Arcs are in XY plane, Z is interpolated. The center point's Z is the same as the start point's.
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