#!/bin/bash
# This script would generate icons using ImageMagick
# For now, we'll create placeholder SVG files

# Create a simple SVG icon
cat > icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="16" fill="#667eea"/>
  <text x="64" y="64" text-anchor="middle" dy=".3em" 
        font-family="Arial" font-size="48" font-weight="bold" fill="white">Fx</text>
</svg>
SVG

echo "Icon placeholder created. Convert to PNG at different sizes:"
echo "- 16x16 for icon-16.png"
echo "- 32x32 for icon-32.png"
echo "- 48x48 for icon-48.png"
echo "- 128x128 for icon-128.png"
