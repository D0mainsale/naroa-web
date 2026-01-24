#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# NAROA IMAGE OPTIMIZER
# Converts all JPG/PNG to WebP, creates thumbnails, optimizes quality
# ═══════════════════════════════════════════════════════════════════════

set -e

# Configuration
QUALITY=80          # WebP quality (0-100)
THUMB_SIZE=400      # Thumbnail max dimension
ORIGINAL_DIR="images"
OPTIMIZED_DIR="images/optimized"
THUMB_DIR="images/thumbnails"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════════════════════"
echo "  🖼️  NAROA IMAGE OPTIMIZER"
echo "═══════════════════════════════════════════════════════════════════════"

# Create directories
mkdir -p "$OPTIMIZED_DIR"
mkdir -p "$THUMB_DIR"

# Count total images
TOTAL=$(find "$ORIGINAL_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -path "$OPTIMIZED_DIR/*" ! -path "$THUMB_DIR/*" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL images to optimize"

# Initialize counters
COUNT=0
SAVED_BYTES=0

# Process each image
find "$ORIGINAL_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -path "$OPTIMIZED_DIR/*" ! -path "$THUMB_DIR/*" | while read -r img; do
    COUNT=$((COUNT + 1))
    
    # Get relative path and create output paths
    REL_PATH="${img#$ORIGINAL_DIR/}"
    DIR_PATH=$(dirname "$REL_PATH")
    BASENAME=$(basename "$img")
    NAME="${BASENAME%.*}"
    
    # Create subdirectory in optimized
    mkdir -p "$OPTIMIZED_DIR/$DIR_PATH"
    mkdir -p "$THUMB_DIR/$DIR_PATH"
    
    OUTPUT_WEBP="$OPTIMIZED_DIR/$DIR_PATH/$NAME.webp"
    OUTPUT_THUMB="$THUMB_DIR/$DIR_PATH/$NAME.webp"
    
    # Skip if already optimized
    if [ -f "$OUTPUT_WEBP" ]; then
        printf "\r[%d/%d] ⏭️  Skipping: %s (exists)" "$COUNT" "$TOTAL" "$BASENAME"
        continue
    fi
    
    # Get original size
    ORIG_SIZE=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    
    # Convert to WebP (optimized)
    cwebp -q $QUALITY -m 6 -quiet "$img" -o "$OUTPUT_WEBP" 2>/dev/null
    
    # Create thumbnail (resized WebP)
    cwebp -q 75 -resize $THUMB_SIZE 0 -quiet "$img" -o "$OUTPUT_THUMB" 2>/dev/null
    
    # Get new size
    if [ -f "$OUTPUT_WEBP" ]; then
        NEW_SIZE=$(stat -f%z "$OUTPUT_WEBP" 2>/dev/null || stat -c%s "$OUTPUT_WEBP" 2>/dev/null)
        SAVED=$((ORIG_SIZE - NEW_SIZE))
        SAVED_BYTES=$((SAVED_BYTES + SAVED))
        
        printf "\r[%d/%d] ✅ %s → WebP (%.1f%% smaller)" "$COUNT" "$TOTAL" "$BASENAME" "$(echo "scale=1; ($ORIG_SIZE - $NEW_SIZE) * 100 / $ORIG_SIZE" | bc)"
    else
        printf "\r[%d/%d] ❌ Failed: %s" "$COUNT" "$TOTAL" "$BASENAME"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  ✅ OPTIMIZATION COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════"

# Calculate results
ORIG_SIZE=$(du -sh "$ORIGINAL_DIR" | cut -f1)
OPT_SIZE=$(du -sh "$OPTIMIZED_DIR" 2>/dev/null | cut -f1 || echo "0")
THUMB_SIZE_RESULT=$(du -sh "$THUMB_DIR" 2>/dev/null | cut -f1 || echo "0")

echo "📊 Original: $ORIG_SIZE"
echo "📦 Optimized WebP: $OPT_SIZE"
echo "🖼️  Thumbnails: $THUMB_SIZE_RESULT"
echo ""
echo "Next steps:"
echo "  1. Update image paths in code to use /images/optimized/*.webp"
echo "  2. Use thumbnails for grid views"
echo "  3. Lazy load full images on click"
