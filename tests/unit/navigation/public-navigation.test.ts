import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  PUBLIC_ABOUT_MENU_ITEMS,
  PUBLIC_NAV_ITEMS
} from "@/lib/constants/navigation";

describe("public navigation", () => {
  test("main public navigation does not include FAQ", () => {
    assert.equal(
      PUBLIC_NAV_ITEMS.some((item) => item.href === "/faq" || item.label === "FAQ"),
      false
    );
  });

  test("primary public pages are top-level links while secondary pages stay in About", () => {
    const directMainHrefs = PUBLIC_NAV_ITEMS.map((item) => item.href);
    const aboutMenuHrefs = PUBLIC_ABOUT_MENU_ITEMS.map((item) => item.href);

    for (const href of [
      "/",
      "/pricing",
      "/about",
      "/contact"
    ]) {
      assert.equal(directMainHrefs.includes(href), true);
    }

    for (const href of [
      "/global-tutoring",
      "/subjects",
      "/locations",
      "/exam-prep",
      "/resources",
      "/faq"
    ]) {
      assert.equal(aboutMenuHrefs.includes(href), true);
    }
  });
});
