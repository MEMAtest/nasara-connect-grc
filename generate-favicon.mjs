import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

async function generateFavicons() {
  try {
    console.log('🎨 Generating favicons from nasara-logo.png...\n');

    const logoPath = join(__dirname, 'public', 'nasara-logo.png');
    const appDir = join(__dirname, 'src', 'app');

    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Error: nasara-logo.png not found in /public directory');
      process.exit(1);
    }

    // Read the file and check if it's base64 encoded
    let logoBuffer;
    const fileContent = fs.readFileSync(logoPath, 'utf8');

    // Check if the file is base64-encoded
    if (fileContent.startsWith('iVBORw0KGgo') || fileContent.startsWith('data:image')) {
      console.log('📝 Detected base64-encoded PNG, decoding...');
      // Remove data URI prefix if present
      const base64Data = fileContent.replace(/^data:image\/\w+;base64,/, '');
      logoBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // It's a binary file
      logoBuffer = fs.readFileSync(logoPath);
    }

    // Generate icon.png (180x180 for general use and Apple)
    console.log('📱 Generating icon.png (180x180)...');
    await sharp(logoBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(appDir, 'icon.png'));
    console.log('✅ Created src/app/icon.png');

    // Generate apple-icon.png (180x180)
    console.log('🍎 Generating apple-icon.png (180x180)...');
    await sharp(logoBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ Created src/app/apple-icon.png');

    // Generate favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
    console.log('🔷 Generating favicon.ico...');
    // Note: sharp doesn't directly support ICO format, so we'll create a 32x32 PNG
    // and rename it. For true ICO with multiple sizes, you'd need a specialized library.
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(appDir, 'favicon-temp.png'));

    // For now, we'll create a PNG as favicon.ico
    // In production, consider using a tool like png-to-ico or favicon npm package
    fs.renameSync(join(appDir, 'favicon-temp.png'), join(appDir, 'favicon.ico'));
    console.log('✅ Created src/app/favicon.ico (32x32 PNG format)');

    console.log('\n✨ Favicon generation complete!');
    console.log('\nGenerated files:');
    console.log('  • src/app/favicon.ico');
    console.log('  • src/app/icon.png');
    console.log('  • src/app/apple-icon.png');
    console.log('\nNote: Next.js will automatically serve these files.');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
