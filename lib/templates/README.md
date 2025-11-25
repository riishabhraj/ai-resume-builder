# Resume Templates

This directory contains LaTeX templates for resume generation.

## Adding a New Template

### 1. Create the LaTeX Template File

Create a new `.tex` file in this directory, for example: `my-template.tex`

The template should use these placeholders:
- `{{NAME}}` - Full name
- `{{CONTACT}}` - Contact information (email, location)
- `{{SUMMARY}}` - Professional summary section
- `{{EXPERIENCES}}` - Work experience section
- `{{SKILLS}}` - Skills section
- `{{EDUCATION}}` - Education section

### 2. Add Template Metadata

Edit `index.ts` and add your template to `TEMPLATE_METADATA`:

```typescript
{
  id: 'my-template',
  name: 'My Template',
  description: 'Description of your template',
  category: 'modern', // or 'classic', 'creative', 'minimal'
}
```

### 3. Test the Template

1. Select the template in the create page
2. Fill in the form
3. Generate a resume
4. Check the PDF output

## Converting Word Templates

If you have a Word (.docx) template:

1. Place the Word file in `reference/` directory
2. Analyze the structure (fonts, spacing, layout)
3. Create a corresponding `.tex` file
4. Match the styling as closely as possible
5. Use the placeholders mentioned above

## Template Structure

All templates should:
- Use ATS-friendly formatting (single column, standard fonts)
- Include proper LaTeX packages
- Use the placeholder system for dynamic content
- Be compatible with pdflatex compilation

## Example Template

See `modern.tex`, `classic.tex`, or `minimal.tex` for examples.

