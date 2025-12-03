import sharp from 'sharp';
import toIco from 'to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcon() {
    const svgPath = path.join(__dirname, 'public', 'logo.svg');
    const outputPath = path.join(__dirname, 'build', 'mycnc.ico');

    console.log(`Reading SVG from ${svgPath}...`);
    // Read SVG
    let svgContent = fs.readFileSync(svgPath, 'utf8');

    // Replace CSS variable with white color
    svgContent = svgContent.replace(/var\(--color-text-primary\)/g, '#ffffff');

    // Make lines thicker (increase strokeWidth from 4 to 12)
    svgContent = svgContent.replace(/strokeWidth="4"/g, 'strokeWidth="12"');

    // Define sizes for ICO
    const sizes = [256, 128, 64, 48, 32, 16];
    const pngBuffers = [];

    // Background color
    const bgColor = { r: 26, g: 26, b: 26, alpha: 1 }; // #1a1a1a

    for (const size of sizes) {
        // Create background
        const background = await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: bgColor
            }
        }).png().toBuffer();

        // Resize SVG (padding 20%)
        const padding = Math.floor(size * 0.2);
        const logoSize = size - padding;

        const logo = await sharp(Buffer.from(svgContent))
            .resize(logoSize, logoSize)
            .png()
            .toBuffer();

        // Composite logo onto background
        const composite = await sharp(background)
            .composite([{ input: logo, gravity: 'center' }])
            .png()
            .toBuffer();

        pngBuffers.push(composite);
    }

    console.log('Converting to ICO...');
    // Convert to ICO
    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(outputPath, icoBuffer);
    console.log(`Successfully created ${outputPath}`);
}

generateIcon().catch(console.error);
