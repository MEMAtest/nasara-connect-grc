import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSimpleFavicon() {
  try {
    console.log('🎨 Generating Nasara Connect favicon...\n');

    const appDir = join(__dirname, 'src', 'app');

    // Create a simple emerald/teal gradient favicon with "N" letter
    // SVG for the favicon - emerald gradient background with white "N"
    const svgIcon = `
      <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="180" height="180" rx="32" fill="url(#grad)"/>
        <text x="90" y="135" font-family="Arial, sans-serif" font-size="110" font-weight="bold" fill="white" text-anchor="middle">N</text>
      </svg>
    `;

    // Generate icon.png (180x180)
    console.log('📱 Generating icon.png (180x180)...');
    await sharp(Buffer.from(svgIcon))
      .png()
      .toFile(join(appDir, 'icon.png'));
    console.log('✅ Created src/app/icon.png');

    // Generate apple-icon.png (180x180)
    console.log('🍎 Generating apple-icon.png (180x180)...');
    await sharp(Buffer.from(svgIcon))
      .png()
      .toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ Created src/app/apple-icon.png');

    // Generate favicon.ico (32x32)
    console.log('🔷 Generating favicon.ico (32x32)...');
    const svgFavicon = `
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="6" fill="url(#grad)"/>
        <text x="16" y="24" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">N</text>
      </svg>
    `;

    await sharp(Buffer.from(svgFavicon))
      .png()
      .toFile(join(appDir, 'favicon.ico'));
    console.log('✅ Created src/app/favicon.ico');

    console.log('\n✨ Favicon generation complete!');
    console.log('\nGenerated files:');
    console.log('  • src/app/favicon.ico (32x32)');
    console.log('  • src/app/icon.png (180x180)');
    console.log('  • src/app/apple-icon.png (180x180)');
    console.log('\n📝 All favicons feature the Nasara "N" with emerald/teal gradient');
    console.log('🚀 Next.js will automatically serve these files.\n');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateSimpleFavicon();
