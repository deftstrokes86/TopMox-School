import { expect, type Locator, type Page, test } from "@playwright/test";

const desktopMainNavLabels = ["Home", "About", "Pricing", "Contact"];
const aboutDropdownLabels = [
  "About TopMox",
  "Global Tutoring",
  "Subjects",
  "Locations",
  "Resources"
];
const aboutDropdownByLabel: Record<string, string> = {
  "About TopMox": "/about",
  "Global Tutoring": "/global-tutoring",
  Subjects: "/subjects",
  Locations: "/locations",
  Resources: "/resources"
};
const nonTopLevelLabels = [
  "Global Tutoring",
  "Subjects",
  "Locations",
  "Resources",
  "FAQ",
  "Exam Prep"
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

function getTopLevelMobileItems(menu: ReturnType<Page["getByTestId"]>) {
  return menu.locator("[data-mobile-main-nav-item]");
}

function getTopLevelDesktopItems(nav: ReturnType<Page["getByTestId"]>) {
  return nav.locator("[data-public-main-nav-item]");
}

function getLoginAuthButton(page: Page) {
  return page.getByRole("link", { name: "Login / Sign Up" });
}

function getRegionSwitcher(page: Page) {
  return page.getByTestId("region-switcher-trigger");
}

async function assertFirstAboveSecond(
  first: Locator,
  second: Locator,
  page: Page
) {
  const [firstBox, secondBox] = await Promise.all([
    first.boundingBox(),
    second.boundingBox()
  ]);

  expect(firstBox, "first element must be visible").not.toBeNull();
  expect(secondBox, "second element must be visible").not.toBeNull();

  const firstTop = firstBox ? firstBox.y : null;
  const secondTop = secondBox ? secondBox.y : null;

  expect(
    firstTop,
    "first item should appear above or in the same row as second item"
  ).toBeLessThanOrEqual(secondTop ?? Number.POSITIVE_INFINITY);
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;

    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(2);
}

async function assertDropdownContainsOnlyExpectedLinks(
  dropdown: ReturnType<Page["getByTestId"]>
) {
  for (const label of aboutDropdownLabels) {
    const link = dropdown.getByRole("link", { name: label });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", aboutDropdownByLabel[label]!);
  }

  await expect(dropdown.getByRole("link", { name: "FAQ" })).toHaveCount(0);
  await expect(dropdown.getByRole("link", { name: "Exam Prep" })).toHaveCount(0);
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
      await expect(
        getTopLevelDesktopItems(desktopNav).filter({ hasText: label })
      ).toHaveCount(0);
    }

    const authButton = getLoginAuthButton(page);
    await expect(authButton).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign Up" })).toHaveCount(0);

    const cta = page.getByRole("link", { name: "Book Assessment" });
    await expect(cta).toBeVisible();
    await expect(getRegionSwitcher(page)).toBeVisible();

    await assertFirstAboveSecond(
      getRegionSwitcher(page),
      cta,
      page
    );

    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("desktop about dropdown contains grouped links", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "About" }).click();

    const aboutDropdown = page.getByTestId("public-about-dropdown");
    await expect(aboutDropdown).toBeVisible();
    await assertDropdownContainsOnlyExpectedLinks(aboutDropdown);

    await aboutDropdown.getByRole("link", { name: "About TopMox" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await assertNoHorizontalOverflow(page);
    guard.assertClean();
  });

  test("mobile navigation is a drawer with grouped About links and compact actions", async ({
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
    await expect(mobileMenu).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const mobileTopLevelItems = getTopLevelMobileItems(mobileMenu);
    await expect(mobileTopLevelItems).toHaveText(desktopMainNavLabels);

    await assertDropdownContainsOnlyExpectedLinks(
      mobileMenu.locator("[data-mobile-about-dropdown]")
    );

    for (const label of nonTopLevelLabels) {
      const topLevelMatch = mobileTopLevelItems.filter({ hasText: label });
      await expect(topLevelMatch).toHaveCount(0);
    }

    const authButton = getLoginAuthButton(page);
    await expect(authButton).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign Up" })).toHaveCount(0);

    const regionSwitcher = mobileMenu.getByTestId("region-switcher-trigger");
    const cta = mobileMenu.getByRole("link", { name: "Book Assessment" });
    await expect(regionSwitcher).toBeVisible();
    await expect(cta).toBeVisible();
    await assertFirstAboveSecond(regionSwitcher, cta, page);

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
