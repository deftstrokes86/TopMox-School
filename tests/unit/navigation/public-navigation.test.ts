import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { PUBLIC_HELP_LINKS, PUBLIC_NAV_ITEMS } from "@/lib/constants/navigation";

describe("public navigation", () => {
  test("main public navigation does not include FAQ", () => {
    assert.equal(
      PUBLIC_NAV_ITEMS.some((item) => item.href === "/faq" || item.label === "FAQ"),
      false
    );
  });

  test("FAQ remains available as a help link outside the main nav", () => {
    assert.equal(
      PUBLIC_HELP_LINKS.some((item) => item.href === "/faq" && item.label === "FAQ"),
      true
    );
  });
});
