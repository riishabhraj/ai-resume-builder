type PuppeteerBrowser = import('puppeteer').Browser;
type PuppeteerPage = import('puppeteer').Page;

type GeneratePdfOptions = {
  html: string;
};

// Match preview dimensions: 850px × 1150px (from create page container)
const viewport = { width: 850, height: 1150, deviceScaleFactor: 1 };

async function initBrowser(): Promise<{ browser: PuppeteerBrowser; page: PuppeteerPage }> {
  // Check if we're in a serverless environment
  const isServerless = 
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.USE_SERVERLESS_CHROME === '1';
  
  if (isServerless) {
    // Serverless path: use puppeteer-core + @sparticuz/chromium
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = await import('puppeteer-core');
    
    const browser = await puppeteerCore.launch({
      args: chromium.args || ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: { width: 850, height: 1150 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    
    const page = await browser.newPage();
    return { browser: browser as unknown as PuppeteerBrowser, page: page as unknown as PuppeteerPage };
  } else {
    // Local dev path: use full puppeteer
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    return { browser, page };
  }
}

export async function generatePdfFromHtml({ html }: GeneratePdfOptions): Promise<Buffer> {
  const { browser, page } = await initBrowser();

  try {
    await page.setViewport(viewport);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Wait for fonts to load (especially Tinos/Liberation Serif)
    await page.evaluateHandle('document.fonts.ready');
    // Additional wait to ensure fonts are fully rendered (using Promise-based delay)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use fixed page dimensions to match preview (single page)
    // Preview container is 850px × 1150px with fixed height and overflow hidden
    // PDF should match this behavior exactly
    // 1150px × 0.2645833 ≈ 304mm
    const pdf = await page.pdf({
      width: '225mm',   // 850px in mm
      height: '304mm',  // 1150px in mm - fixed to match preview single page
      printBackground: true,
      preferCSSPageSize: false, // Use explicit width/height instead of CSS @page
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      scale: 1,
    });

    // Convert Uint8Array to Buffer
    return Buffer.from(pdf);
  } finally {
    await page.close();
    await browser.close();
  }
}

/*
Local vs Serverless setup:
- Local development: Uses full `puppeteer` package automatically
- Serverless (Vercel / AWS Lambda): Automatically detects and uses `puppeteer-core` + `@sparticuz/chromium`
  - Auto-detects via VERCEL or AWS_LAMBDA_FUNCTION_NAME environment variables
  - Or manually set USE_SERVERLESS_CHROME=1 in production environment
  - Keep bundle size limits and Lambda layers in mind

Font + layout fidelity tips:
- Make sure the HTML you pass includes the same CSS and fonts as /create.
- Await `document.fonts.ready` (already done above) to prevent fallback fonts.
- Keep `.resume-page { width: 210mm; }` and `@page { size: A4; }` in the HTML.
- `preferCSSPageSize: true` and `printBackground: true` are required for exact rendering.
- If layout differs, open /resume/print/[id] in a browser, View Source, and ensure the HTML
  matches what Puppeteer receives.
*/

