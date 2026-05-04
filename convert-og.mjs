import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('public/og.svg');

// 1200x630 — the OG image standard size, also dev.to cover image
sharp(svg)
  .resize(1200, 630)
  .png()
  .toFile('public/og.png')
  .then(info => console.log('og.png:', info.width + 'x' + info.height, info.size, 'bytes'));

// Also generate logo PNG (square 512x512) for dev.to cover or social
sharp(fs.readFileSync('src/assets/logo.svg'))
  .resize(512, 512)
  .png()
  .toFile('public/logo.png')
  .then(info => console.log('logo.png:', info.width + 'x' + info.height, info.size, 'bytes'));
