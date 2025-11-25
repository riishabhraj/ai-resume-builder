# How to Create Template Preview Image

## Quick Method (From Word Document)

### Step 1: Open Your Word Template
1. Open `lib/templates/reference/resume-template.docx`
2. Fill it with sample data (or use existing content)

### Step 2: Take Screenshot or Export
**Option A: Screenshot**
1. Zoom to fit page (View → Zoom → Fit to Page)
2. Take a screenshot of the first page
3. Crop to show just the resume content

**Option B: Export to PDF then Image**
1. File → Save As → PDF
2. Open PDF in Preview (Mac) or Adobe Reader
3. Export first page as PNG:
   - Mac: File → Export → Format: PNG
   - Windows: Use Print to PDF, then convert

### Step 3: Resize and Save
1. Open image in any image editor
2. Resize to approximately **600x800px** (or maintain aspect ratio)
3. Save as: `professional.png`
4. Place in: `public/templates/previews/professional.png`

## Using Command Line (Mac/Linux)

If you have ImageMagick installed:

```bash
# Convert PDF to PNG (if you exported Word to PDF first)
convert -density 150 resume-template.pdf[0] -resize 600x800 public/templates/previews/professional.png

# Or from a screenshot/image
convert your-screenshot.png -resize 600x800 public/templates/previews/professional.png
```

## Image Requirements

- **Format**: PNG (preferred) or JPG
- **Size**: 600x800px (or similar portrait ratio)
- **File size**: Keep under 500KB for fast loading
- **Content**: Show the first page of the resume template with sample data

## Verify

After adding the image:
1. Restart your dev server: `pnpm run dev`
2. Go to `/create` route
3. You should see the preview image in the template card

