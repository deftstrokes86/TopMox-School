import { NextResponse, type NextRequest } from "next/server";

import { REGION_COOKIE_NAME } from "@/lib/constants/locations";
import {
  getPaymentFallbackForRegion,
  resolveVisitorRegion
} from "@/server/services/location.service";

export function GET(request: NextRequest) {
  const resolved = resolveVisitorRegion({
    headers: request.headers,
    cookie: request.cookies.get(REGION_COOKIE_NAME)?.value,
    browserHints: {
      timezone: request.nextUrl.searchParams.get("timezone"),
      acceptLanguage: request.headers.get("accept-language")
    }
  });
  const paymentFallback = getPaymentFallbackForRegion(resolved.region.code);

  return NextResponse.json({
    detectedCountry: resolved.detectedCountry ?? null,
    source: resolved.source,
    region: {
      code: resolved.region.code,
      name: resolved.region.name,
      slug: resolved.region.slug,
      currency: resolved.region.currency,
      currencySymbol: resolved.region.currencySymbol
    },
    currency: resolved.region.currency,
    flutterwaveEnabled: paymentFallback.flutterwaveEnabled,
    manualPaymentEnabled: paymentFallback.manualPaymentEnabled
  });
}
