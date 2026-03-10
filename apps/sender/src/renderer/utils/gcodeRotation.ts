export function rotateGCodeLines(gcodeLines: string[], angleRadians: number): string[] {
    const cosA = Math.cos(angleRadians);
    const sinA = Math.sin(angleRadians);

    let currentX = 0;
    let currentY = 0;
    let isAbsolute = true; // G90 by default

    // Helper to rotate a point or vector
    const rotate = (x: number, y: number) => {
        return {
            x: x * cosA - y * sinA,
            y: x * sinA + y * cosA
        };
    };

    // Helper to extract a parameter value
    const getParam = (line: string, char: string): number | null => {
        const match = line.match(new RegExp(`${char}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i'));
        return match ? parseFloat(match[1]) : null;
    };

    const formatCoord = (val: number) => val.toFixed(4).replace(/\.?0+$/, '');

    return gcodeLines.map(line => {
        // Strip comments temporarily for parsing
        const commentIndex = line.indexOf(';');
        const parenIndex = line.indexOf('(');
        let firstCommentIdx = -1;
        if (commentIndex !== -1 && parenIndex !== -1) firstCommentIdx = Math.min(commentIndex, parenIndex);
        else if (commentIndex !== -1) firstCommentIdx = commentIndex;
        else if (parenIndex !== -1) firstCommentIdx = parenIndex;

        const codePart = firstCommentIdx !== -1 ? line.substring(0, firstCommentIdx) : line;
        const commentPart = firstCommentIdx !== -1 ? line.substring(firstCommentIdx) : '';
        const upperCode = codePart.toUpperCase();

        if (upperCode.includes('G90')) isAbsolute = true;
        if (upperCode.includes('G91')) isAbsolute = false;

        const hasX = upperCode.includes('X');
        const hasY = upperCode.includes('Y');
        const hasI = upperCode.includes('I');
        const hasJ = upperCode.includes('J');

        // Only rotate lines that contain spatial motion instructions
        if (!hasX && !hasY && !hasI && !hasJ) {
            return line;
        }

        let newLine = codePart;

        if (hasI || hasJ) {
            const i = getParam(upperCode, 'I') ?? 0;
            const j = getParam(upperCode, 'J') ?? 0;
            const rotated = rotate(i, j);

            if (hasI) newLine = newLine.replace(/I\s*[-+]?[0-9]*\.?[0-9]*/i, `I${formatCoord(rotated.x)}`);
            else if (Math.abs(rotated.x) > 0.0001) newLine += ` I${formatCoord(rotated.x)}`;

            if (hasJ) newLine = newLine.replace(/J\s*[-+]?[0-9]*\.?[0-9]*/i, `J${formatCoord(rotated.y)}`);
            else if (Math.abs(rotated.y) > 0.0001) newLine += ` J${formatCoord(rotated.y)}`;
        }

        if (hasX || hasY) {
            const parsedX = getParam(upperCode, 'X');
            const parsedY = getParam(upperCode, 'Y');

            if (isAbsolute) {
                const targetX = parsedX !== null ? parsedX : currentX;
                const targetY = parsedY !== null ? parsedY : currentY;

                const rotated = rotate(targetX, targetY);

                if (hasX) newLine = newLine.replace(/X\s*[-+]?[0-9]*\.?[0-9]*/i, `X${formatCoord(rotated.x)}`);
                else newLine += ` X${formatCoord(rotated.x)}`;

                if (hasY) newLine = newLine.replace(/Y\s*[-+]?[0-9]*\.?[0-9]*/i, `Y${formatCoord(rotated.y)}`);
                else newLine += ` Y${formatCoord(rotated.y)}`;

                currentX = targetX;
                currentY = targetY;
            } else {
                const dx = parsedX ?? 0;
                const dy = parsedY ?? 0;

                const rotated = rotate(dx, dy);

                if (hasX) newLine = newLine.replace(/X\s*[-+]?[0-9]*\.?[0-9]*/i, `X${formatCoord(rotated.x)}`);
                else if (Math.abs(rotated.x) > 0.0001) newLine += ` X${formatCoord(rotated.x)}`;

                if (hasY) newLine = newLine.replace(/Y\s*[-+]?[0-9]*\.?[0-9]*/i, `Y${formatCoord(rotated.y)}`);
                else if (Math.abs(rotated.y) > 0.0001) newLine += ` Y${formatCoord(rotated.y)}`;

                // For incremental, position updates are less critical unless tracking later absolute moves,
                // but strictly speaking, incremental update is dx, dy.
                currentX += dx;
                currentY += dy;
            }
        }

        return newLine + commentPart;
    });
}
