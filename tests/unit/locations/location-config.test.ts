import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  PUBLIC_REGION_OPTIONS,
  REGION_CONFIGS,
  RegionCurrency,
  type RegionCode
} from "@/lib/constants/locations";

describe("public location config", () => {
  test("public menu excludes global fallback region", () => {
    const publicCodes = PUBLIC_REGION_OPTIONS.map((region) => region.code);

    assert.equal(publicCodes.includes("global"), false);
    assert.equal(publicCodes.length, 7);
    assert.equal(publicCodes[0], "nigeria");
  });

  test("region flag text and currency mapping is stable", () => {
    type PublicRegionCode = Exclude<RegionCode, "global">;

    const expectedFlags: Record<PublicRegionCode, string> = {
      nigeria: "\u{1F1F3}\u{1F1EC}",
      "united-states": "\u{1F1FA}\u{1F1F8}",
      canada: "\u{1F1E8}\u{1F1E6}",
      australia: "\u{1F1E6}\u{1F1FA}",
      "united-kingdom": "\u{1F1EC}\u{1F1E7}",
      europe: "\u{1F1EA}\u{1F1FA}",
      uae: "\u{1F1E6}\u{1F1EA}"
    };

    const expectedCurrencies: Record<PublicRegionCode, RegionCurrency> = {
      nigeria: "NGN",
      "united-states": "USD",
      canada: "CAD",
      australia: "AUD",
      "united-kingdom": "GBP",
      europe: "EUR",
      uae: "AED"
    };

    for (const [rawRegionCode, expectedFlag] of Object.entries(expectedFlags)) {
      const regionCode = rawRegionCode as PublicRegionCode;
      const regionConfig = REGION_CONFIGS[regionCode];

      assert.equal(regionConfig.flag, expectedFlag);
      assert.equal(regionConfig.currency, expectedCurrencies[regionCode]);
      assert.equal(regionConfig.countryCodes.length > 0, true);
    }
  });
});
