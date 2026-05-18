import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEFAULT_REGION_CODE,
  REGION_COOKIE_NAME,
  REGION_CONFIGS,
  type RegionCode
} from "@/lib/constants/locations";
import {
  getCurrencyForRegion,
  getPaymentFallbackForRegion,
  getRegionFromBrowserHints,
  getRegionFromCloudflareHeaders,
  getRegionFromCookie,
  getRegionFromCountryCode,
  getRegionFromGenericGeoHeaders,
  isFlutterwaveEnabledForRegion,
  resolveVisitorRegion
} from "@/server/services/location.service";

function headers(values: Record<string, string>) {
  return new Headers(values);
}

describe("Hostinger-safe location service", () => {
  test("region currency mapping covers launch regions", () => {
    const expectedCurrencies: Record<RegionCode, string> = {
      global: "USD",
      nigeria: "NGN",
      "united-states": "USD",
      canada: "CAD",
      australia: "AUD",
      "united-kingdom": "GBP",
      europe: "EUR",
      uae: "AED"
    };

    for (const [regionCode, currency] of Object.entries(expectedCurrencies)) {
      assert.equal(getCurrencyForRegion(regionCode as RegionCode), currency);
      assert.equal(REGION_CONFIGS[regionCode as RegionCode].currency, currency);
    }

    assert.equal(DEFAULT_REGION_CODE, "nigeria");
    assert.equal(getCurrencyForRegion("unknown"), "NGN");
  });

  test("Cloudflare country header maps to soft region defaults", () => {
    const expectations: Record<string, RegionCode> = {
      NG: "nigeria",
      US: "united-states",
      CA: "canada",
      AU: "australia",
      GB: "united-kingdom",
      AE: "uae",
      FR: "europe",
      DE: "europe",
      XX: "nigeria"
    };

    for (const [countryCode, regionCode] of Object.entries(expectations)) {
      assert.equal(
        getRegionFromCloudflareHeaders(headers({ "CF-IPCountry": countryCode })),
        regionCode
      );
      assert.equal(
        getRegionFromCloudflareHeaders(headers({ "cf-ipcountry": countryCode })),
        regionCode
      );
    }

    assert.equal(getRegionFromCloudflareHeaders(headers({})), "nigeria");
  });

  test("generic country headers are optional Hostinger/CDN fallback", () => {
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-country-code": "NG" })),
      "nigeria"
    );
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-forwarded-country": "CA" })),
      "canada"
    );
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-geo-country": "GB" })),
      "united-kingdom"
    );
    assert.equal(getRegionFromGenericGeoHeaders(headers({})), "nigeria");
  });

  test("manual region cookie wins and invalid cookie is ignored", () => {
    const resolved = resolveVisitorRegion({
      headers: headers({ "CF-IPCountry": "NG" }),
      cookie: "canada"
    });

    assert.equal(REGION_COOKIE_NAME, "topmox_region");
    assert.equal(resolved.region.code, "canada");
    assert.equal(resolved.source, "cookie");
    assert.equal(getRegionFromCookie("not-a-region"), null);

    const fallback = resolveVisitorRegion({
      headers: headers({ "CF-IPCountry": "NG" }),
      cookie: "not-a-region"
    });

    assert.equal(fallback.region.code, "nigeria");
    assert.equal(fallback.source, "cloudflare-header");
  });

  test("browser hints are weak fallback only", () => {
    assert.equal(
      getRegionFromBrowserHints({
        timezone: "Africa/Lagos",
        acceptLanguage: ""
      }),
      "nigeria"
    );
    assert.equal(
      getRegionFromBrowserHints({
        timezone: "Europe/Paris",
        acceptLanguage: ""
      }),
      "europe"
    );
    assert.equal(
      getRegionFromBrowserHints({
        timezone: "Etc/UTC",
        acceptLanguage: "en-CA,en;q=0.9"
      }),
      "canada"
    );
    assert.equal(
      getRegionFromBrowserHints({
        timezone: "Etc/UTC",
        acceptLanguage: ""
      }),
      "nigeria"
    );
  });

  test("resolve priority uses Hostinger-safe headers and never throws", () => {
    const resolved = resolveVisitorRegion({
      headers: headers({
        "CF-IPCountry": "NG"
      }),
      browserHints: {
        timezone: "America/New_York",
        acceptLanguage: "en-US"
      }
    });

    assert.equal(resolved.region.code, "nigeria");
    assert.equal(resolved.source, "cloudflare-header");

    assert.doesNotThrow(() =>
      resolveVisitorRegion({
        headers: undefined,
        cookie: undefined,
        browserHints: undefined
      })
    );
  });

  test("country-code mapping falls back safely", () => {
    assert.equal(getRegionFromCountryCode("NG"), "nigeria");
    assert.equal(getRegionFromCountryCode("US"), "united-states");
    assert.equal(getRegionFromCountryCode("FR"), "europe");
    assert.equal(getRegionFromCountryCode("XX"), "nigeria");
    assert.equal(getRegionFromCountryCode(undefined), "nigeria");
  });

  test("payment fallback and gateway enablement are region-aware", () => {
    assert.equal(isFlutterwaveEnabledForRegion("nigeria"), true);
    assert.equal(isFlutterwaveEnabledForRegion("united-states"), true);
    assert.equal(isFlutterwaveEnabledForRegion("canada"), true);
    assert.equal(isFlutterwaveEnabledForRegion("united-kingdom"), true);
    assert.equal(isFlutterwaveEnabledForRegion("europe"), true);
    assert.equal(isFlutterwaveEnabledForRegion("australia"), false);
    assert.equal(isFlutterwaveEnabledForRegion("uae"), false);
    assert.equal(getPaymentFallbackForRegion("australia").manualPaymentEnabled, true);
    assert.equal(getPaymentFallbackForRegion("uae").manualPaymentEnabled, true);
  });
});
