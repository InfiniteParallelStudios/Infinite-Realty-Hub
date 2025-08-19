# PWA Icons

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
2. Or use ImageMagick: `convert icon-192x192.svg icon-192x192.png`
3. Or use Node.js with sharp: `sharp('icon.svg').png().toFile('icon.png')`

The PWA will work with SVG icons in modern browsers, but PNG icons provide better compatibility across all devices.
