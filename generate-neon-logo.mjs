import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateNeonLogo() {
  try {
    console.log('🎨 Generating Nasara Connect neon logo...\n');

    const svgLogo = `
      <svg width="1000" height="250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Glow filters -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <!-- Gradients for the N -->
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Tech Circuit "N" -->
        <g filter="url(#strongGlow)">
          <!-- Left vertical stroke of N -->
          <path d="M 80 60 L 80 190" stroke="#14b8a6" stroke-width="12" stroke-linecap="round" fill="none"/>
          <!-- Circuit nodes on left -->
          <circle cx="80" cy="80" r="8" fill="#14b8a6"/>
          <circle cx="80" cy="125" r="8" fill="#14b8a6"/>
          <circle cx="80" cy="170" r="8" fill="#14b8a6"/>

          <!-- Diagonal stroke -->
          <path d="M 80 60 L 200 190" stroke="url(#neonGrad)" stroke-width="12" stroke-linecap="round" fill="none"/>
          <!-- Circuit nodes on diagonal -->
          <circle cx="120" cy="100" r="8" fill="#3b82f6"/>
          <circle cx="160" cy="145" r="8" fill="#f59e0b"/>

          <!-- Right vertical stroke of N -->
          <path d="M 200 60 L 200 190" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" fill="none"/>
          <!-- Circuit nodes on right -->
          <circle cx="200" cy="80" r="8" fill="#f59e0b"/>
          <circle cx="200" cy="125" r="8" fill="#f59e0b"/>
          <circle cx="200" cy="170" r="8" fill="#f59e0b"/>

          <!-- Circuit traces/connections -->
          <path d="M 80 80 L 60 80 L 60 125 L 80 125" stroke="#14b8a6" stroke-width="3" fill="none" opacity="0.6"/>
          <path d="M 200 80 L 220 80 L 220 125 L 200 125" stroke="#f59e0b" stroke-width="3" fill="none" opacity="0.6"/>

          <!-- Small decorative nodes -->
          <circle cx="60" cy="102" r="4" fill="#14b8a6" opacity="0.8"/>
          <circle cx="220" cy="102" r="4" fill="#f59e0b" opacity="0.8"/>
        </g>

        <!-- "Nasara" Text with glow -->
        <g filter="url(#glow)">
          <text x="280" y="140" font-family="Arial, sans-serif" font-size="72" font-weight="300" fill="#14b8a6" letter-spacing="4">Nasara</text>
        </g>

        <!-- "Connect" Text with glow -->
        <g filter="url(#glow)">
          <text x="280" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="300" fill="#60a5fa" letter-spacing="4">Connect</text>
        </g>
      </svg>
    `;

    const publicDir = join(__dirname, 'public');

    // Generate PNG version with transparent background
    console.log('📱 Generating nasara-logo.png...');
    await sharp(Buffer.from(svgLogo))
      .png()
      .toFile(join(publicDir, 'nasara-logo.png'));
    console.log('✅ Created public/nasara-logo.png');

    console.log('\n✨ Neon logo generation complete!');
    console.log('🎨 Features:');
    console.log('  • Circuit board style "N" with glowing nodes');
    console.log('  • Cyan-to-orange gradient effect');
    console.log('  • Transparent background for dark/light themes');
    console.log('  • Modern tech aesthetic\n');

  } catch (error) {
    console.error('❌ Error generating logo:', error.message);
    process.exit(1);
  }
}

generateNeonLogo();
