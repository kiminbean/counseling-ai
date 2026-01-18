#!/usr/bin/env node
/**
 * PWA Icon Generator Script
 * Generates PWA icons from an SVG base design using sharp
 *
 * Brand Colors:
 * - Primary: #0ea5e9 (brand-500)
 * - Secondary: #0284c7 (brand-600)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Additional sizes for Apple Touch Icon and favicon
const APPLE_TOUCH_SIZE = 180;
const FAVICON_SIZE = 32;

// Output directories
const ICONS_DIR = path.join(__dirname, '../public/icons');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Create SVG icon with brain/mind symbol
// This is a simple circular icon with a brain wave pattern
function createSvgIcon(size) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerPadding = size * 0.15;

  // Brain wave path - scaled to icon size
  const waveHeight = size * 0.08;
  const waveWidth = size * 0.5;
  const waveY = centerY;
  const waveStartX = centerX - waveWidth / 2;

  // Create smooth brain wave pattern
  const wavePath = `
    M ${waveStartX} ${waveY}
    q ${waveWidth * 0.125} ${-waveHeight * 2}, ${waveWidth * 0.25} 0
    q ${waveWidth * 0.125} ${waveHeight * 2}, ${waveWidth * 0.25} 0
    q ${waveWidth * 0.125} ${-waveHeight * 1.5}, ${waveWidth * 0.25} 0
    q ${waveWidth * 0.125} ${waveHeight * 1.5}, ${waveWidth * 0.25} 0
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${outerRadius}" fill="url(#bgGradient)"/>

  <!-- Brain wave pattern -->
  <path d="${wavePath}" stroke="url(#waveGradient)" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Heart symbol at the start of wave - represents emotional care -->
  <path d="M ${centerX - waveWidth * 0.35} ${centerY - size * 0.12}
           c 0 ${-size * 0.04} ${size * 0.04} ${-size * 0.07} ${size * 0.07} ${-size * 0.07}
           c ${size * 0.04} 0 ${size * 0.07} ${size * 0.04} ${size * 0.07} ${size * 0.07}
           c 0 ${-size * 0.04} ${size * 0.04} ${-size * 0.07} ${size * 0.07} ${-size * 0.07}
           c ${size * 0.04} 0 ${size * 0.07} ${size * 0.04} ${size * 0.07} ${size * 0.07}
           c 0 ${size * 0.08} ${-size * 0.14} ${size * 0.14} ${-size * 0.14} ${size * 0.14}
           c ${-size * 0.14} ${-size * 0.06} ${-size * 0.14} ${-size * 0.14} ${-size * 0.14} ${-size * 0.14}
           z" fill="#ffffff" opacity="0.9"/>
</svg>`;
}

// Simpler, more reliable icon design
function createSimpleSvgIcon(size) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;

  // Create a simple brain/wave icon
  const waveY = centerY;
  const waveWidth = size * 0.5;
  const waveStartX = centerX - waveWidth / 2;
  const strokeWidth = Math.max(2, size * 0.04);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${outerRadius}" fill="url(#bgGradient)"/>

  <!-- Brain wave EKG-style pattern -->
  <polyline
    points="${waveStartX},${waveY} ${waveStartX + waveWidth * 0.2},${waveY} ${waveStartX + waveWidth * 0.3},${waveY - size * 0.12} ${waveStartX + waveWidth * 0.4},${waveY + size * 0.08} ${waveStartX + waveWidth * 0.5},${waveY - size * 0.06} ${waveStartX + waveWidth * 0.6},${waveY + size * 0.1} ${waveStartX + waveWidth * 0.7},${waveY} ${waveStartX + waveWidth},${waveY}"
    stroke="#ffffff"
    stroke-width="${strokeWidth}"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"/>
</svg>`;
}

async function generateIcons() {
  console.log('Starting PWA icon generation...\n');

  // Ensure directories exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log('Created icons directory:', ICONS_DIR);
  }

  // Generate PWA icons
  console.log('Generating PWA icons...');
  for (const size of ICON_SIZES) {
    try {
      const svg = createSimpleSvgIcon(size);
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`  Created: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`  Error creating icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generate Apple Touch Icon (180x180)
  console.log('\nGenerating Apple Touch Icon...');
  try {
    const svg = createSimpleSvgIcon(APPLE_TOUCH_SIZE);
    const outputPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`  Created: apple-touch-icon.png (${APPLE_TOUCH_SIZE}x${APPLE_TOUCH_SIZE})`);
  } catch (error) {
    console.error('  Error creating apple-touch-icon.png:', error.message);
  }

  // Generate favicon (32x32)
  console.log('\nGenerating favicon...');
  try {
    const svg = createSimpleSvgIcon(FAVICON_SIZE);
    const outputPath = path.join(PUBLIC_DIR, 'favicon.ico');

    // Create as PNG (modern browsers support PNG favicons)
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`  Created: favicon.ico (${FAVICON_SIZE}x${FAVICON_SIZE})`);
  } catch (error) {
    console.error('  Error creating favicon.ico:', error.message);
  }

  // Generate shortcut icons for manifest.json
  console.log('\nGenerating shortcut icons...');
  const shortcutIcons = ['chat-icon', 'checkin-icon'];
  for (const iconName of shortcutIcons) {
    try {
      const svg = createSimpleSvgIcon(96);
      const outputPath = path.join(ICONS_DIR, `${iconName}.png`);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`  Created: ${iconName}.png (96x96)`);
    } catch (error) {
      console.error(`  Error creating ${iconName}.png:`, error.message);
    }
  }

  console.log('\nIcon generation complete!');
}

// Run the generator
generateIcons().catch(console.error);
