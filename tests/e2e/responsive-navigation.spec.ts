import { expect, type Page, test } from "@playwright/test";

const desktopMainNavLabels = ["Home", "About", "Pricing", "Contact"];
const aboutDropdownLabels = [
  "About TopMox",
  "Global Tutoring",
  "Subjects",
  "Exam Prep",
  "Locations",
  "Resources",
  "FAQ"
];
const aboutDropdownByLabel: Record<string, string> = {
  "About TopMox": "/about",
  "Global Tutoring": "/global-tutoring",
  Subjects: "/subjects",
  "Exam Prep": "/exam-prep",
  Locations: "/locations",
  Resources: "/resources",
  FAQ: "/faq"
};
const nonTopLevelLabels = ["Global Tutoring", "Subjects", "Locations", "Resources", "FAQ", "Exam Prep"];

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

function getTopLevelMobileItems(menu: ReturnType<Page["getByTestId"]>) {
  return menu.locator("[data-mobile-main-nav-item]");
}

function getTopLevelDesktopItems(nav: ReturnType<Page["getByTestId"]>) {
  return nav.locator("[data-public-main-nav-item]");
}

test.describe("responsive public navigation", () => {
  test("desktop navigation is compact and ordered correctly", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const desktopNav = page.getByTestId("public-desktop-nav");
    await expect(desktopNav).toBeVisible();

    const desktopItems = await getTopLevelDesktopItems(desktopNav).allTextContents();
    expect(desktopItems).toEqual(desktopMainNavLabels);
    expect(desktopItems[1]).toBe("About");
    expect(desktopItems.at(-1)).toBe("Contact");

    for (const label of nonTopLevelLabels) {
      const desktopTopLevel = getTopLevelDesktopItems(desktopNav).filter({ hasText: label });
      await expect(desktopTopLevel).toHaveCount(0);
    }

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Assessment" })).toBeVisible();

    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("about dropdown contains grouped public links", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "About" }).click();

    const aboutDropdown = page.getByTestId("public-about-dropdown");
    await expect(aboutDropdown).toBeVisible();

    for (const label of aboutDropdownLabels) {
      const link = aboutDropdown.getByRole("link", { name: label });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", aboutDropdownByLabel[label]!);
    }

    await aboutDropdown.getByRole("link", { name: "Exam Prep" }).click();
    await expect(page).toHaveURL(/\/exam-prep$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("mobile navigation is a drawer with actions and nested About links", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByTestId("public-desktop-nav")).toBeHidden();
    const menuButton = page.getByRole("button", { name: /open main menu/i });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();

    const mobileMenu = page.getByTestId("public-mobile-menu");
    await expect(mobileMenu).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const mobileTopLevelItems = getTopLevelMobileItems(mobileMenu);
    await expect(mobileTopLevelItems).toHaveText(desktopMainNavLabels);

    for (const label of aboutDropdownLabels) {
      await expect(mobileMenu.getByRole("link", { name: label })).toBeVisible();
    }

    for (const label of nonTopLevelLabels) {
      const topLevelMatch = mobileTopLevelItems.filter({ hasText: label });
      await expect(topLevelMatch).toHaveCount(0);
    }

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Assessment" })).toBeVisible();
    await expect(mobileMenu.getByLabel(/choose topmox region/i)).toBeVisible();

    await mobileMenu.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(mobileMenu).toBeHidden();
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("tablet header uses no horizontal overflow", async ({ page }) => {
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
});

test.describe("responsive dashboard navigation", () => {
  test("mobile protected dashboard routes redirect safely without overflow", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin", { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });
});
