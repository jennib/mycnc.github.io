// A sensible default for rapid moves in mm/min. Adjust based on typical machine capabilities.
const RAPID_FEED_RATE = 4000;
// A fallback feed rate if none is specified in the G-code.
const DEFAULT_FEED_RATE = 500;

const getParam = (gcode, param) => {
    // Allows for optional whitespace between parameter and value
    const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

export const estimateGCodeTime = (gcodeLines) => {
    let totalSeconds = 0;
    const cumulativeSeconds = [];
    
    // Machine state simulation
    let state = {
        x: 0, y: 0, z: 0,
        feedRate: DEFAULT_FEED_RATE,
        isAbsolute: true, // G90 is default
        motionMode: 'G0'
    };

    gcodeLines.forEach(line => {
        const upperLine = line.toUpperCase();

        if (upperLine.includes('G90')) state.isAbsolute = true;
        if (upperLine.includes('G91')) state.isAbsolute = false;
        
        const f = getParam(upperLine, 'F');
        if (f !== null) state.feedRate = f;

        const gCommandMatch = upperLine.match(/G(\d+(\.\d+)?)/);
        if (gCommandMatch) {
            const gCode = parseInt(gCommandMatch[1], 10);
            if ([0, 1, 2, 3].includes(gCode)) {
                state.motionMode = `G${gCode}`;
            }
        }

        if (upperLine.includes('X') || upperLine.includes('Y') || upperLine.includes('Z')) {
            const lastPos = { ...state };
            
            const nextX = getParam(upperLine, 'X');
            const nextY = getParam(upperLine, 'Y');
            const nextZ = getParam(upperLine, 'Z');
            
            let targetX = state.x, targetY = state.y, targetZ = state.z;

            if (state.isAbsolute) {
                if (nextX !== null) targetX = nextX;
                if (nextY !== null) targetY = nextY;
                if (nextZ !== null) targetZ = nextZ;
            } else { // Incremental
                if (nextX !== null) targetX += nextX;
                if (nextY !== null) targetY += nextY;
                if (nextZ !== null) targetZ += nextZ;
            }
            
            state.x = targetX;
            state.y = targetY;
            state.z = targetZ;

            let distance = 0;
            
            // For now, we treat arcs (G2/G3) as linear moves for estimation simplicity.
            // A more advanced implementation would calculate arc length.
            const dx = state.x - lastPos.x;
            const dy = state.y - lastPos.y;
            const dz = state.z - lastPos.z;
            distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (distance > 0) {
                // Use a high, constant feed rate for rapid moves (G0)
                const effectiveFeed = state.motionMode === 'G0' ? RAPID_FEED_RATE : state.feedRate;
                
                if (effectiveFeed > 0) {
                    const timeMinutes = distance / effectiveFeed;
                    totalSeconds += timeMinutes * 60;
                }
            }
        }

        cumulativeSeconds.push(totalSeconds);
    });

    return { totalSeconds, cumulativeSeconds };
};