const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  const backgroundDir = path.join(publicDir, 'background');

  // Optimize banner_bg.webp - create smaller mobile version
  const bannerPath = path.join(backgroundDir, 'banner_bg.webp');
  const bannerMobilePath = path.join(backgroundDir, 'banner_bg_mobile.webp');

  if (fs.existsSync(bannerPath)) {
    console.log('Optimizing banner_bg.webp...');

    // Create mobile version (640px wide, quality 50)
    await sharp(bannerPath)
      .resize(640, null, { withoutEnlargement: true })
      .webp({ quality: 45 })
      .toFile(bannerMobilePath);

    const originalSize = fs.statSync(bannerPath).size;
    const mobileSize = fs.statSync(bannerMobilePath).size;

    console.log(`Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`Mobile: ${(mobileSize / 1024).toFixed(1)} KB`);
    console.log(`Savings: ${((1 - mobileSize / originalSize) * 100).toFixed(1)}%`);

    // Also compress the original for desktop
    const optimizedPath = path.join(backgroundDir, 'banner_bg_optimized.webp');
    await sharp(bannerPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 55 })
      .toFile(optimizedPath);

    const optimizedSize = fs.statSync(optimizedPath).size;
    console.log(`Desktop optimized: ${(optimizedSize / 1024).toFixed(1)} KB`);

    // Replace original with optimized version
    fs.renameSync(bannerPath, path.join(backgroundDir, 'banner_bg_original.webp'));
    fs.renameSync(optimizedPath, bannerPath);
    console.log('Replaced original with optimized version');
  }

  console.log('Done!');
}

optimizeImages().catch(console.error);
