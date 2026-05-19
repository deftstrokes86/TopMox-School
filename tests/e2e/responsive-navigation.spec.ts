import { expect, type Page, test } from "@playwright/test";

const publicNavLabels = [
  "Home",
  "Global Tutoring",
  "Subjects",
  "Locations",
  "Exam Prep",
  "Pricing",
  "Resources",
  "About",
  "Contact"
];

const fatalConsolePatterns = [
  /Uncaught Error/i,
  /Hydration failed/i,
  /Text content does not match server-rendered HTML/i,
  /Minified React error/i,
  /ChunkLoadError/i,
  /TypeError/i,
  /ReferenceError/i,
  /Cannot read properties of (undefined|null)/i,
  /Failed to load resource.*\/_next\/static.*(404|500)/i
];

function attachBrowserStabilityGuards(page: Page) {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (fatalConsolePatterns.some((pattern) => pattern.test(text))) {
      failures.push(`console error: ${text}`);
    }
  });

  page.on("pageerror", (error) => {
    failures.push(`page error: ${error.message}`);
  });

  return {
    assertClean() {
      expect(failures).toEqual([]);
    }
  };
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;

    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe("responsive public navigation", () => {
  test("desktop navigation is readable, complete, and overflow-safe", async ({
    page
  }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const desktopNav = page.getByTestId("public-desktop-nav");
    await expect(desktopNav).toBeVisible();

    for (const label of publicNavLabels) {
      await expect(desktopNav.getByRole("link", { name: label })).toBeVisible();
    }

    await expect(desktopNav.getByRole("link", { name: "FAQ" })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Book a Child Assessment" }).first()
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("tablet navigation does not overflow or expose duplicate breakpoints", async ({
    page
  }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/", { waitUntil: "networkidle" });

    const desktopNavVisible = await page
      .getByTestId("public-desktop-nav")
      .isVisible();
    const menuButtonVisible = await page
      .getByRole("button", { name: /open main menu/i })
      .isVisible();

    expect(desktopNavVisible || menuButtonVisible).toBe(true);
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("mobile navigation opens as a drawer and closes after navigation", async ({
    page
  }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByTestId("public-desktop-nav")).toBeHidden();
    const menuButton = page.getByRole("button", { name: /open main menu/i });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();

    const mobileMenu = page.getByTestId("public-mobile-menu");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(mobileMenu).toBeVisible();

    for (const label of publicNavLabels) {
      await expect(mobileMenu.getByRole("link", { name: label })).toBeVisible();
    }

    await expect(mobileMenu.getByRole("link", { name: "FAQ" })).toHaveCount(0);
    await expect(
      mobileMenu.getByRole("link", { name: "Book a Child Assessment" })
    ).toBeVisible();
    await expect(
      mobileMenu.getByLabel(/choose topmox region/i)
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await mobileMenu.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(mobileMenu).toBeHidden();
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });
});

test.describe("responsive dashboard navigation", () => {
  test("mobile protected dashboard routes redirect safely without overflow", async ({
    page
  }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin", { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });
});
