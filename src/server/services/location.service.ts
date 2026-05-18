import {
  DEFAULT_REGION_CODE,
  REGION_CONFIGS,
  type RegionCode,
  getRegionConfig,
  isRegionCode
} from "@/lib/constants/locations";

export type GeoDetectionSource =
  | "cookie"
  | "cloudflare-header"
  | "generic-header"
  | "browser-hint"
  | "default";

export type HeaderInput =
  | Headers
  | Record<string, string | string[] | null | undefined>
  | undefined
  | null;

export type BrowserHints = {
  timezone?: string | null;
  acceptLanguage?: string | null;
};

export type ResolvedVisitorRegion = {
  region: ReturnType<typeof getRegionConfig>;
  source: GeoDetectionSource;
  detectedCountry?: string | null;
};

const CLOUDFLARE_COUNTRY_HEADERS = ["CF-IPCountry", "cf-ipcountry"];
const GENERIC_COUNTRY_HEADERS = [
  "x-country-code",
  "x-forwarded-country",
  "x-geo-country"
];
const FLUTTERWAVE_CONFIRMED_CHECKOUT_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "CAD"
];

const ACCEPT_LANGUAGE_REGION_HINTS: Array<{
  pattern: RegExp;
  region: RegionCode;
}> = [
  { pattern: /(^|,|\s)(en-)?ng\b/i, region: "nigeria" },
  { pattern: /(^|,|\s)(en-)?us\b/i, region: "united-states" },
  { pattern: /(^|,|\s)(en-)?ca\b/i, region: "canada" },
  { pattern: /(^|,|\s)(en-)?au\b/i, region: "australia" },
  { pattern: /(^|,|\s)(en-)?gb\b|(^|,|\s)en-uk\b/i, region: "united-kingdom" },
  { pattern: /(^|,|\s)(fr-fr|de-de|es-es|it-it|nl-nl|pt-pt)\b/i, region: "europe" },
  { pattern: /(^|,|\s)(ar-)?ae\b/i, region: "uae" }
];

function normalizeCountryCode(countryCode: string | null | undefined) {
  return countryCode?.trim().toUpperCase() || "";
}

function getHeaderValue(headers: HeaderInput, headerName: string) {
  try {
    if (!headers) {
      return null;
    }

    if (headers instanceof Headers) {
      return headers.get(headerName);
    }

    const directValue = headers[headerName] ?? headers[headerName.toLowerCase()];

    if (Array.isArray(directValue)) {
      return directValue[0] ?? null;
    }

    return directValue ?? null;
  } catch {
    return null;
  }
}

function getFirstHeaderValue(headers: HeaderInput, headerNames: string[]) {
  for (const headerName of headerNames) {
    const value = getHeaderValue(headers, headerName);
    if (value) {
      return value;
    }
  }

  return null;
}

export function getRegionFromCountryCode(
  countryCode: string | null | undefined
): RegionCode {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  if (!normalizedCountryCode) {
    return DEFAULT_REGION_CODE;
  }

  for (const region of Object.values(REGION_CONFIGS)) {
    if (region.countryCodes.includes(normalizedCountryCode)) {
      return region.code;
    }
  }

  return DEFAULT_REGION_CODE;
}

export function getRegionFromCloudflareHeaders(headers: HeaderInput): RegionCode {
  return getRegionFromCountryCode(
    getFirstHeaderValue(headers, CLOUDFLARE_COUNTRY_HEADERS)
  );
}

export function getRegionFromGenericGeoHeaders(headers: HeaderInput): RegionCode {
  return getRegionFromCountryCode(
    getFirstHeaderValue(headers, GENERIC_COUNTRY_HEADERS)
  );
}

function getRegionFromTimezone(timezone: string | null | undefined): RegionCode {
  const normalizedTimezone = timezone?.trim();

  if (!normalizedTimezone) {
    return DEFAULT_REGION_CODE;
  }

  if (normalizedTimezone === "Africa/Lagos") {
    return "nigeria";
  }

  if (normalizedTimezone === "Europe/London") {
    return "united-kingdom";
  }

  if (normalizedTimezone.startsWith("Europe/")) {
    return "europe";
  }

  if (normalizedTimezone.startsWith("Australia/")) {
    return "australia";
  }

  if (normalizedTimezone === "Asia/Dubai") {
    return "uae";
  }

  if (
    normalizedTimezone.startsWith("America/New_York") ||
    normalizedTimezone.startsWith("America/Chicago") ||
    normalizedTimezone.startsWith("America/Los_Angeles")
  ) {
    return "united-states";
  }

  if (
    normalizedTimezone.startsWith("America/Toronto") ||
    normalizedTimezone.startsWith("America/Vancouver")
  ) {
    return "canada";
  }

  return DEFAULT_REGION_CODE;
}

function getRegionFromAcceptLanguage(
  acceptLanguage: string | null | undefined
): RegionCode {
  const normalizedLanguage = acceptLanguage?.trim();

  if (!normalizedLanguage) {
    return DEFAULT_REGION_CODE;
  }

  const match = ACCEPT_LANGUAGE_REGION_HINTS.find(({ pattern }) =>
    pattern.test(normalizedLanguage)
  );

  return match?.region ?? DEFAULT_REGION_CODE;
}

export function getRegionFromBrowserHints(
  browserHints: BrowserHints = {}
): RegionCode {
  try {
    const timezoneRegion = getRegionFromTimezone(browserHints.timezone);
    if (timezoneRegion !== DEFAULT_REGION_CODE) {
      return timezoneRegion;
    }

    return getRegionFromAcceptLanguage(browserHints.acceptLanguage);
  } catch {
    return DEFAULT_REGION_CODE;
  }
}

export function getRegionFromCookie(
  cookieValue: string | null | undefined
): RegionCode | null {
  const normalizedCookie = cookieValue?.trim();

  return isRegionCode(normalizedCookie) ? normalizedCookie : null;
}

export function resolveVisitorRegion({
  headers,
  cookie,
  browserHints
}: {
  headers?: HeaderInput;
  cookie?: string | null;
  browserHints?: BrowserHints;
} = {}): ResolvedVisitorRegion {
  try {
    const cookieRegion = getRegionFromCookie(cookie);

    if (cookieRegion) {
      return {
        region: getRegionConfig(cookieRegion),
        source: "cookie"
      };
    }

    const cloudflareCountry = getFirstHeaderValue(
      headers,
      CLOUDFLARE_COUNTRY_HEADERS
    );

    if (cloudflareCountry) {
      return {
        region: getRegionConfig(getRegionFromCountryCode(cloudflareCountry)),
        source: "cloudflare-header",
        detectedCountry: normalizeCountryCode(cloudflareCountry)
      };
    }

    const genericCountry = getFirstHeaderValue(headers, GENERIC_COUNTRY_HEADERS);

    if (genericCountry) {
      return {
        region: getRegionConfig(getRegionFromCountryCode(genericCountry)),
        source: "generic-header",
        detectedCountry: normalizeCountryCode(genericCountry)
      };
    }

    const browserHintRegion = getRegionFromBrowserHints(browserHints);

    if (browserHintRegion !== DEFAULT_REGION_CODE) {
      return {
        region: getRegionConfig(browserHintRegion),
        source: "browser-hint"
      };
    }

    return {
      region: getRegionConfig(DEFAULT_REGION_CODE),
      source: "default"
    };
  } catch {
    return {
      region: getRegionConfig(DEFAULT_REGION_CODE),
      source: "default"
    };
  }
}

export function getCurrencyForRegion(
  regionCode: string | null | undefined
): string {
  return getRegionConfig(regionCode).currency;
}

export function isFlutterwaveEnabledForRegion(
  regionCode: string | null | undefined
): boolean {
  return getRegionConfig(regionCode).flutterwaveEnabledDefault;
}

export function isFlutterwaveEnabledForCurrency(
  currency: string | null | undefined
): boolean {
  const normalizedCurrency = currency?.trim().toUpperCase();

  return Boolean(
    normalizedCurrency &&
      FLUTTERWAVE_CONFIRMED_CHECKOUT_CURRENCIES.includes(normalizedCurrency)
  );
}

export function getPaymentFallbackForCurrency(
  currency: string | null | undefined
) {
  const normalizedCurrency = currency?.trim().toUpperCase() || "NGN";
  const flutterwaveEnabled =
    isFlutterwaveEnabledForCurrency(normalizedCurrency);

  return {
    currency: normalizedCurrency,
    flutterwaveEnabled,
    manualPaymentEnabled: true,
    note: flutterwaveEnabled
      ? "Online checkout can be offered when the TopMox account is configured for this currency. Manual payment remains available."
      : "Online checkout for this currency should be confirmed before launch. Manual payment fallback remains available."
  };
}

export function getPaymentFallbackForRegion(regionCode: string | null | undefined) {
  const region = getRegionConfig(regionCode);

  return {
    regionCode: region.code,
    currency: region.currency,
    flutterwaveEnabled: region.flutterwaveEnabledDefault,
    manualPaymentEnabled: region.manualPaymentEnabledDefault,
    note: region.paymentNotes
  };
}
