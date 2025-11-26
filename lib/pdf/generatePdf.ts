type PuppeteerBrowser = import('puppeteer').Browser;
type PuppeteerPage = import('puppeteer').Page;

type GeneratePdfOptions = {
  html: string;
};

const viewport = { width: 1240, height: 1754, deviceScaleFactor: 1 };

async function initBrowser(): Promise<{ browser: PuppeteerBrowser; page: PuppeteerPage }> {
  // Local dev path: full puppeteer (pnpm add puppeteer)
  // For serverless deployment, install puppeteer-core and chrome-aws-lambda,
  // then uncomment the serverless path below and set USE_SERVERLESS_CHROME=1
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  return { browser, page };

  /* Serverless path (uncomment when deploying to serverless):
  if (process.env.USE_SERVERLESS_CHROME === '1') {
    const chromium = await import('chrome-aws-lambda');
    const puppeteerCore = await import('puppeteer-core');
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    return { browser: browser as unknown as PuppeteerBrowser, page: page as unknown as PuppeteerPage };
  }
  */
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

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
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
- Local development: `pnpm add puppeteer`.
- Serverless (Vercel / AWS Lambda): `pnpm add puppeteer-core chrome-aws-lambda`
  and set USE_SERVERLESS_CHROME=1. Keep bundle size limits and Lambda layers in mind.

Font + layout fidelity tips:
- Make sure the HTML you pass includes the same CSS and fonts as /create.
- Await `document.fonts.ready` (already done above) to prevent fallback fonts.
- Keep `.resume-page { width: 210mm; }` and `@page { size: A4; }` in the HTML.
- `preferCSSPageSize: true` and `printBackground: true` are required for exact rendering.
- If layout differs, open /resume/print/[id] in a browser, View Source, and ensure the HTML
  matches what Puppeteer receives.
*/

