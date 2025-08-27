#!/usr/bin/env node

/**
 * Simple icon generator for Infinite Realty Hub PWA
 * Generates SVG icons that can be used for PWA icons
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the infinity logo icon
const createInfinityIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="background" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000811"/>
      <stop offset="100%" stop-color="#001122"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00d4ff" stop-opacity="1"/>
      <stop offset="70%" stop-color="#00d4ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00d4ff" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#background)"/>
  
  <!-- Infinity symbol -->
  <path 
    d="M ${size * 0.2} ${size * 0.5} 
       C ${size * 0.2} ${size * 0.35}, ${size * 0.35} ${size * 0.25}, ${size * 0.5} ${size * 0.5}
       C ${size * 0.65} ${size * 0.75}, ${size * 0.8} ${size * 0.65}, ${size * 0.8} ${size * 0.5}
       C ${size * 0.8} ${size * 0.35}, ${size * 0.65} ${size * 0.25}, ${size * 0.5} ${size * 0.5}
       C ${size * 0.35} ${size * 0.75}, ${size * 0.2} ${size * 0.65}, ${size * 0.2} ${size * 0.5}"
    fill="none" 
    stroke="url(#glow)" 
    stroke-width="${size * 0.04}" 
    stroke-linecap="round"
  />
  
  <!-- Glowing orbs -->
  <circle cx="${size * 0.3}" cy="${size * 0.5}" r="${size * 0.03}" fill="#00d4ff" opacity="0.8">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${size * 0.7}" cy="${size * 0.5}" r="${size * 0.03}" fill="#00d4ff" opacity="0.8">
    <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
`;

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Generating PWA icons...');

iconSizes.forEach(size => {
  const svgContent = createInfinityIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`✅ Generated ${filename}`);
});

// Generate a simple PNG fallback using Canvas (if available) or create SVG versions
// For now, we'll create SVG versions which modern browsers support well
console.log('📱 Creating PNG alternatives...');

// Create a simple conversion note
const readmeContent = `# PWA Icons

This directory contains the icons for the Infinite Realty Hub Progressive Web App.

## Icon Sizes
- 72x72: Small notification icon
- 96x96: Default icon size
- 128x128: Standard app icon
- 144x144: Windows tile icon
- 152x152: iOS app icon
- 192x192: Android app icon
- 384x384: Large app icon
- 512x512: Splash screen icon

## Converting SVG to PNG
To convert these SVG icons to PNG format for better compatibility:

1. Use an online tool like https://convertio.co/svg-png/
2. Or use ImageMagick: \`convert icon-192x192.svg icon-192x192.png\`
3. Or use Node.js with sharp: \`sharp('icon.svg').png().toFile('icon.png')\`

The PWA will work with SVG icons in modern browsers, but PNG icons provide better compatibility across all devices.
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('✅ Icon generation complete!');
console.log('📁 Icons saved to:', iconsDir);
console.log('💡 Tip: Convert SVG icons to PNG for better compatibility');