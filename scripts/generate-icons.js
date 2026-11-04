import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicIconsDir = path.resolve('public/icons');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

const standardSvgPath = path.join(publicIconsDir, 'icon.svg');
const maskableSvgPath = path.join(publicIconsDir, 'icon-maskable.svg');

const standardSvg = fs.readFileSync(standardSvgPath);
const maskableSvg = fs.readFileSync(maskableSvgPath);

async function generate() {
  console.log('Generating PNG assets with sharp...');

  // 192x192 standard
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-192.png'));

  // 512x512 standard
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-512.png'));

  // 192x192 maskable
  await sharp(maskableSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-maskable-192.png'));

  // 512x512 maskable
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-maskable-512.png'));

  // Apple touch icon (180x180) in public/icons and public/
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicIconsDir, 'apple-touch-icon.png'));

  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon (32x32)
  await sharp(standardSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicIconsDir, 'favicon-32x32.png'));

  // Also save copy of SVG as icon-192.svg and icon-512.svg for completeness
  fs.copyFileSync(standardSvgPath, path.join(publicIconsDir, 'icon-192.svg'));
  fs.copyFileSync(standardSvgPath, path.join(publicIconsDir, 'icon-512.svg'));

  console.log('Successfully generated all PWA icons!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
