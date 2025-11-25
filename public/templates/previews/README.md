# Template Preview Images

This directory should contain preview images for each resume template.

## Required Images

- `modern.png` - Preview of the Modern template
- `classic.png` - Preview of the Classic template
- `minimal.png` - Preview of the Minimal template
- `professional.png` - Preview of the Professional template (based on your Word document)

## How to Generate Preview Images

### Option 1: From LaTeX Templates (Recommended)

1. Compile each template with sample data to PDF
2. Convert PDF first page to PNG:
   ```bash
   # Using ImageMagick
   convert -density 150 template.pdf[0] template.png
   
   # Or using pdftoppm
   pdftoppm -png -f 1 -l 1 template.pdf template
   ```

3. Resize to appropriate dimensions (e.g., 400x600px for preview)
   ```bash
   convert template.png -resize 400x600 template.png
   ```

### Option 2: From Your Word Document

1. Open your Word template
2. Take a screenshot or export to PDF
3. Convert to PNG and resize

### Option 3: Manual Creation

Create preview images showing:
- Template layout
- Font styles
- Color scheme
- Overall design aesthetic

## Image Specifications

- Format: PNG (with transparency) or JPG
- Recommended size: 400x600px (portrait) or 600x400px (landscape)
- File size: Keep under 200KB for fast loading

## Placeholder

Until preview images are added, the UI will show "Preview coming soon" for missing images.

