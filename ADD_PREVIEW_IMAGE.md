# How to Add Template Preview Image

## Quick Steps

1. **Open your Word template:**
   - File: `lib/templates/reference/resume-template.docx`

2. **Take a screenshot or export:**
   - **Option A (Easiest):** Take a screenshot of the first page
   - **Option B:** Export Word to PDF, then convert first page to PNG

3. **Resize the image:**
   - Recommended size: 600x800px (portrait)
   - Use any image editor (Preview on Mac, Paint on Windows, or online tools)

4. **Save the image:**
   - Name: `professional.png`
   - Location: `public/templates/previews/professional.png`

5. **Restart dev server:**
   ```bash
   pnpm run dev
   ```

6. **Check the result:**
   - Go to `http://localhost:3000/create`
   - You should see the preview image in the template card

## Using Command Line (Mac)

If you have ImageMagick installed:

```bash
# If you exported Word to PDF first
convert -density 150 resume-template.pdf[0] -resize 600x800 public/templates/previews/professional.png
```

## Image Requirements

- Format: PNG or JPG
- Size: ~600x800px (portrait orientation)
- File size: Under 500KB
- Content: First page of resume template with sample data

Once you add the image, it will automatically appear in the template selection UI!

