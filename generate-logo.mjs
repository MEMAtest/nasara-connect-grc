import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateLogo() {
  try {
    console.log('🎨 Generating Nasara Connect logo...\n');

    const svgLogo = `
      <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Icon/Logo -->
        <rect x="10" y="40" width="120" height="120" rx="20" fill="url(#grad)"/>
        <text x="70" y="130" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">N</text>

        <!-- Text -->
        <text x="160" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#1e293b">Nasara Connect</text>
        <text x="160" y="145" font-family="Arial, sans-serif" font-size="20" fill="#64748b">Governance &amp; Compliance Platform</text>
      </svg>
    `;

    const publicDir = join(__dirname, 'public');

    // Generate PNG version
    console.log('📱 Generating nasara-logo.png...');
    await sharp(Buffer.from(svgLogo))
      .png()
      .toFile(join(publicDir, 'nasara-logo.png'));
    console.log('✅ Created public/nasara-logo.png');

    console.log('\n✨ Logo generation complete!');

  } catch (error) {
    console.error('❌ Error generating logo:', error.message);
    process.exit(1);
  }
}

generateLogo();
