/**
 * Formats a decimal number into a fraction string (e.g., 0.625 -> 5/8).
 * @param decimal The decimal number to convert.
 * @param precision The denominator to use (e.g., 64 for 1/64ths).
 * @returns A string representation of the fraction.
 */
export function decimalToFraction(decimal: number, precision: number = 64): string {
  if (isNaN(decimal)) return '0';
  
  const whole = Math.floor(Math.abs(decimal));
  const fraction = Math.abs(decimal) - whole;
  const sign = decimal < 0 ? '-' : '';

  if (fraction < (1 / (precision * 2))) {
    return sign + whole.toString();
  }

  // Find the closest numerator for the given precision
  let numerator = Math.round(fraction * precision);
  let denominator = precision;

  if (numerator === precision) {
    return sign + (whole + 1).toString();
  }

  // Simplify the fraction
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const common = gcd(numerator, denominator);
  
  numerator /= common;
  denominator /= common;

  const fractionPart = `${numerator}/${denominator}`;
  
  if (whole === 0) {
    return sign + fractionPart;
  }
  
  return `${sign}${whole} ${fractionPart}`;
}

/**
 * Converts millimeters to inches.
 * @param mm Millimeters
 * @returns Inches
 */
export function mmToInches(mm: number): number {
  return mm / 25.4;
}

/**
 * Converts inches to millimeters.
 * @param inches Inches
 * @returns Millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * 25.4;
}
/**
 * Converts a fraction string to a decimal number.
 * Supports: "1/2", "1 1/2", "1-1/2", "1.5"
 * @param fraction The fraction string to convert.
 * @returns The decimal number, or NaN if invalid.
 */
export function fractionToDecimal(fraction: string): number {
  if (!fraction) return NaN;
  
  // Clean string
  const str = fraction.trim().replace(/-/g, ' ');
  
  // Check if it's a simple decimal
  if (!str.includes('/')) {
    const num = parseFloat(str);
    return isNaN(num) ? NaN : num;
  }
  
  // Check for mixed numbers "1 1/2"
  const parts = str.split(/\s+/);
  
  if (parts.length === 2) {
    const whole = parseFloat(parts[0]);
    const fracPart = parts[1].split('/');
    if (fracPart.length === 2) {
      const num = parseFloat(fracPart[0]);
      const den = parseFloat(fracPart[1]);
      if (isNaN(whole) || isNaN(num) || isNaN(den) || den === 0) return NaN;
      return whole + (num / den);
    }
  } else if (parts.length === 1) {
    // Simple fraction "1/2"
    const fracPart = parts[0].split('/');
    if (fracPart.length === 2) {
      const num = parseFloat(fracPart[0]);
      const den = parseFloat(fracPart[1]);
      if (isNaN(num) || isNaN(den) || den === 0) return NaN;
      return num / den;
    }
  }
  
  return NaN;
}
