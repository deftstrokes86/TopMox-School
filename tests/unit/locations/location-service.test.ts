import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEFAULT_REGION_CODE,
  getCurrencyForRegion,
  getRegionFromBrowserHints,
  getRegionFromCloudflareHeaders,
  getRegionFromCookie,
  getRegionFromCountryCode,
  getRegionFromGenericGeoHeaders,
  getRegionConfig,
  isFlutterwaveEnabledForRegion,
  resolveVisitorRegion
} from "@/server/services/location.service";

function headers(values: Record<string, string>) {
  return new Headers(values);
}

describe("location service detection priorities and fallbacks", () => {
  test("manual region cookie always wins", () => {
    const resolved = resolveVisitorRegion({
      headers: headers({ "CF-IPCountry": "US" }),
      cookie: "canada"
    });

    assert.equal(resolved.region.code, "canada");
    assert.equal(resolved.source, "cookie");
    assert.equal(getRegionFromCookie("not-a-region"), null);
  });

  test("cloudflare and generic headers map to regional codes", () => {
    assert.equal(
      getRegionFromCloudflareHeaders(headers({ "CF-IPCountry": "NG" })),
      "nigeria"
    );
    assert.equal(
      getRegionFromCloudflareHeaders(headers({ "cf-ipcountry": "GB" })),
      "united-kingdom"
    );
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-country-code": "AU" })),
      "australia"
    );
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-forwarded-country": "AE" })),
      "uae"
    );
    assert.equal(
      getRegionFromGenericGeoHeaders(headers({ "x-geo-country": "DE" })),
      "europe"
    );
  });

  test("country-code mapping handles unknown values with Nigeria fallback", () => {
    assert.equal(getRegionFromCountryCode("NG"), "nigeria");
    assert.equal(getRegionFromCountryCode("XX"), DEFAULT_REGION_CODE);
    assert.equal(getRegionFromCountryCode(undefined), DEFAULT_REGION_CODE);
  });

  test("currency resolution is deterministic and falls back to NGN", () => {
    assert.equal(getCurrencyForRegion("nigeria"), "NGN");
    assert.equal(getCurrencyForRegion("united-states"), "USD");
    assert.equal(getCurrencyForRegion("australia"), "AUD");
    assert.equal(getCurrencyForRegion("uae"), "AED");
    assert.equal(getCurrencyForRegion("unknown"), "NGN");
  });

  test("browser hints are a weak fallback and never throw", () => {
    const fallbackFromTimezone = getRegionFromBrowserHints({
      timezone: "Europe/Paris",
      acceptLanguage: ""
    });

    const fallbackFromLanguage = getRegionFromBrowserHints({
      timezone: "Etc/UTC",
      acceptLanguage: "en-CA,en;q=0.9"
    });

    assert.equal(fallbackFromTimezone, "europe");
    assert.equal(fallbackFromLanguage, "canada");
  });

  test("region resolution does not throw with missing inputs", () => {
    const resolved = resolveVisitorRegion({
      headers: undefined,
      cookie: undefined,
      browserHints: undefined
    });

    assert.equal(resolved.region.code, "nigeria");
    assert.equal(resolved.source, "default");
    assert.equal(resolveVisitorRegion({ headers: undefined, cookie: "global" }).region.code, "global");
    assert.equal(
      getRegionConfig("unknown").code,
      DEFAULT_REGION_CODE
    );
  });

  test("flutterwave availability is region aware", () => {
    assert.equal(isFlutterwaveEnabledForRegion("nigeria"), true);
    assert.equal(isFlutterwaveEnabledForRegion("united-kingdom"), true);
    assert.equal(isFlutterwaveEnabledForRegion("australia"), false);
    assert.equal(isFlutterwaveEnabledForRegion("uae"), false);
  });
});
