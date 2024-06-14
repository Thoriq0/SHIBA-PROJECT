// scripts/resizeImages.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../dist/images');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  sharp(inputPath)
    .resize({ width: 800 })
    .toFile(outputPath, (err, info) => {
      if (err) {
        console.error(`Error resizing file ${file}:`, err);
      } else {
        console.log(`Resized file ${file} to ${info.width}x${info.height}`);
      }
    });
});
