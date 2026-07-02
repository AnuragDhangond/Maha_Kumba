#!/bin/bash

# Script to batch convert JPG and PNG images to WebP
# Quality is set to 80 by default

TARGET_DIR="./src/assets"
QUALITY=80

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null
then
    echo "Error: cwebp is not installed. Install it using 'sudo apt-get install webp'"
    exit 1
fi

echo "🚀 Starting batch conversion to WebP in $TARGET_DIR..."

# Convert PNGs
for f in "$TARGET_DIR"/*.png; do
  [ -e "$f" ] || continue
  echo "Converting $f..."
  cwebp -q $QUALITY "$f" -o "${f%.*}.webp"
done

# Convert JPGs
for f in "$TARGET_DIR"/*.jpg; do
  [ -e "$f" ] || continue
  echo "Converting $f..."
  cwebp -q $QUALITY "$f" -o "${f%.*}.webp"
done

echo "✅ Conversion complete! You can now use .webp versions in your code."
