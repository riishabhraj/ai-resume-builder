import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Try multiple sources for country detection
  // 1. Cloudflare header (most reliable on Cloudflare)
  let country = request.headers.get('cf-ipcountry');

  // 2. Vercel geo (available on Vercel deployment)
  if (!country && request.geo?.country) {
    country = request.geo.country;
  }

  // 3. Custom header set by middleware
  if (!country) {
    country = request.headers.get('x-detected-country');
  }

  // 4. Fallback to US
  if (!country || country === 'XX') {
    country = 'US';
  }

  // Convert country to currency
  const currency = country === 'IN' ? 'INR' : 'USD';

  return NextResponse.json({
    country,
    currency,
    detectedFrom: request.headers.get('cf-ipcountry') ? 'cloudflare' :
                   request.geo?.country ? 'vercel' :
                   'fallback',
  });
}
