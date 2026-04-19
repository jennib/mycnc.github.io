const getParam = (line: string, char: string): number | null => {
    const match = line.match(new RegExp(`${char}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i'));
    return match ? parseFloat(match[1]) : null;
};

const formatCoord = (val: number) => val.toFixed(4).replace(/\.?0+$/, '');

// Translates all tool-center X/Y coordinates so the nearest part edge lands at origin,
// accounting for tool radius. Pass 1 finds minX/minY; Pass 2 applies the offset.
export function translateGCodeToOrigin(gcodeLines: string[], toolDiameter: number): string[] {
    const toolRadius = toolDiameter / 2;

    // Pass 1: find the minimum tool-center X and Y positions
    let currentX = 0;
    let currentY = 0;
    let isAbsolute = true;
    let minX = Infinity;
    let minY = Infinity;

    for (const line of gcodeLines) {
        const commentIndex = line.indexOf(';');
        const parenIndex = line.indexOf('(');
        let firstCommentIdx = -1;
        if (commentIndex !== -1 && parenIndex !== -1) firstCommentIdx = Math.min(commentIndex, parenIndex);
        else if (commentIndex !== -1) firstCommentIdx = commentIndex;
        else if (parenIndex !== -1) firstCommentIdx = parenIndex;

        const codePart = firstCommentIdx !== -1 ? line.substring(0, firstCommentIdx) : line;
        const upperCode = codePart.toUpperCase();

        if (upperCode.includes('G90')) isAbsolute = true;
        if (upperCode.includes('G91')) isAbsolute = false;

        const hasX = upperCode.includes('X');
        const hasY = upperCode.includes('Y');
        if (!hasX && !hasY) continue;

        if (isAbsolute) {
            const x = getParam(upperCode, 'X');
            const y = getParam(upperCode, 'Y');
            if (x !== null) currentX = x;
            if (y !== null) currentY = y;
        } else {
            currentX += getParam(upperCode, 'X') ?? 0;
            currentY += getParam(upperCode, 'Y') ?? 0;
        }

        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
    }

    if (!isFinite(minX) || !isFinite(minY)) return gcodeLines;

    // Shift tool center so the part edge (tool center - tool radius) is at origin
    const offsetX = -minX + toolRadius;
    const offsetY = -minY + toolRadius;

    // Pass 2: apply the translation
    currentX = 0;
    currentY = 0;
    isAbsolute = true;

    return gcodeLines.map(line => {
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
        if (!hasX && !hasY) return line;

        let newLine = codePart;

        if (isAbsolute) {
            const parsedX = getParam(upperCode, 'X');
            const parsedY = getParam(upperCode, 'Y');

            if (parsedX !== null) {
                currentX = parsedX;
                newLine = newLine.replace(/X\s*[-+]?[0-9]*\.?[0-9]*/i, `X${formatCoord(parsedX + offsetX)}`);
            }
            if (parsedY !== null) {
                currentY = parsedY;
                newLine = newLine.replace(/Y\s*[-+]?[0-9]*\.?[0-9]*/i, `Y${formatCoord(parsedY + offsetY)}`);
            }
        } else {
            // Incremental moves don't need translation — the delta is unchanged
            currentX += getParam(upperCode, 'X') ?? 0;
            currentY += getParam(upperCode, 'Y') ?? 0;
        }

        return newLine + commentPart;
    });
}
