import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  PUBLIC_ABOUT_MENU_ITEMS,
  PUBLIC_HELP_LINKS,
  PUBLIC_NAV_ITEMS
} from "@/lib/constants/navigation";

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

  test("global tutoring, locations, resources, and FAQ live under the about menu", () => {
    const directMainHrefs = PUBLIC_NAV_ITEMS.map((item) => item.href);
    const aboutMenuHrefs = PUBLIC_ABOUT_MENU_ITEMS.map((item) => item.href);

    for (const href of ["/global-tutoring", "/locations", "/resources", "/faq"]) {
      assert.equal(directMainHrefs.includes(href), false);
      assert.equal(aboutMenuHrefs.includes(href), true);
    }

    assert.equal(aboutMenuHrefs.includes("/about"), true);
  });
});
