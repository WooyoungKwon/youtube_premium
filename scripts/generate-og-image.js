const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  const logoPath = path.join(__dirname, '../public/logo.png');
  const outputPath = path.join(__dirname, '../public/og-image.png');

  // Read logo image
  const logoBuffer = fs.readFileSync(logoPath);
  const logoMetadata = await sharp(logoBuffer).metadata();

  // Calculate resize dimensions to fit within 800x400 while maintaining aspect ratio
  const maxWidth = 800;
  const maxHeight = 400;
  const scale = Math.min(maxWidth / logoMetadata.width, maxHeight / logoMetadata.height);
  const resizedWidth = Math.round(logoMetadata.width * scale);
  const resizedHeight = Math.round(logoMetadata.height * scale);

  // Resize logo
  const resizedLogo = await sharp(logoBuffer)
    .resize(resizedWidth, resizedHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  // Create white background with logo centered
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: resizedLogo,
    top: Math.round((630 - resizedHeight) / 2),
    left: Math.round((1200 - resizedWidth) / 2)
  }])
  .png()
  .toFile(outputPath);

  console.log(`✅ OG image generated at ${outputPath}`);
  console.log(`   Size: 1200x630`);
  console.log(`   Logo scaled to: ${resizedWidth}x${resizedHeight}`);
}

generateOGImage().catch(console.error);
