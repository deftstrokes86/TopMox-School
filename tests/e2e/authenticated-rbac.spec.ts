import { expect, type Page, test } from "@playwright/test";

const runAuthE2E = process.env.RUN_AUTH_E2E === "1";

test.skip(
  !runAuthE2E,
  "Authenticated RBAC browser tests require RUN_AUTH_E2E=1 and a live seeded test database."
);

type DemoAccount = {
  role: "ADMIN" | "PARENT" | "TUTOR";
  email: string;
  password: string;
  dashboardPath: "/admin" | "/parent" | "/tutor";
  dashboardText: RegExp;
};

const accounts: DemoAccount[] = [
  {
    role: "ADMIN",
    email: "admin@topmox.test",
    password: "demo-only-change-me",
    dashboardPath: "/admin",
    dashboardText: /Admin Dashboard|Operations|Pending assessments/i
  },
  {
    role: "PARENT",
    email: "ngozi.parent@topmox.test",
    password: "demo-only-change-me",
    dashboardPath: "/parent",
    dashboardText: /Parent Dashboard|Family profile|Next Step/i
  },
  {
    role: "TUTOR",
    email: "amara.math@topmox.test",
    password: "demo-only-change-me",
    dashboardPath: "/tutor",
    dashboardText: /Tutor Dashboard|Today's work|Assigned students/i
  }
];

const protectedRoutes = ["/admin", "/parent", "/tutor"] as const;

const demoRoutesByRole: Record<DemoAccount["role"], string[]> = {
  ADMIN: [
    "/admin",
    "/admin/assessments",
    "/admin/payments",
    "/admin/enrollments",
    "/admin/lessons",
    "/admin/reports",
    "/admin/support",
    "/admin/resources",
    "/admin/notifications"
  ],
  PARENT: [
    "/parent",
    "/parent/children",
    "/parent/assessments",
    "/parent/enrollments",
    "/parent/payments",
    "/parent/lessons",
    "/parent/homework",
    "/parent/reports",
    "/parent/support",
    "/parent/notifications"
  ],
  TUTOR: [
    "/tutor",
    "/tutor/lessons",
    "/tutor/homework",
    "/tutor/reports",
    "/tutor/notifications"
  ]
};

const fatalConsolePatterns = [
  /Hydration failed/i,
  /Minified React error/i,
  /ChunkLoadError/i,
  /Cannot read properties of (undefined|null)/i,
  /TypeError/i,
  /ReferenceError/i
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

async function assertLiveDatabase(page: Page) {
  let payload: {
    status?: string;
    database?: string;
  } = {};

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await page.request.get("/api/health");
    expect(response.status()).toBe(200);

    payload = (await response.json()) as {
      status?: string;
      database?: string;
    };

    if (payload.status === "ok" && payload.database === "connected") {
      break;
    }

    await page.waitForTimeout(1_500);
  }

  expect(
    payload.database,
    "Authenticated browser tests require the live test database to be connected."
  ).toBe("connected");
  expect(payload.status).toBe("ok");
}

async function visibleBodyText(page: Page) {
  return page.locator("body").evaluate((body) =>
    (body as HTMLElement).innerText.replace(/\s+/g, " ").trim()
  );
}

async function assertNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;

    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow, `${context} should not overflow the mobile viewport`).toBeLessThanOrEqual(2);
}

async function loginAs(page: Page, account: DemoAccount) {
  let authenticated = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel(/email address/i).fill(account.email);
    await page.getByLabel(/^password$/i).fill(account.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    try {
      await expect(page).toHaveURL(
        new RegExp(`${account.dashboardPath}(?:$|[?#])`),
        { timeout: 20_000 }
      );
      authenticated = true;
      break;
    } catch (error) {
      const bodyText = await visibleBodyText(page);
      const canRetry =
        /Invalid email or password/i.test(bodyText) && attempt < 2;

      if (!canRetry) {
        throw error;
      }

      await page.waitForTimeout(2_000);
    }
  }

  expect(authenticated).toBe(true);
  await expect.poll(() => visibleBodyText(page)).toMatch(account.dashboardText);

  const session = (await page.evaluate(async () => {
    const response = await fetch("/api/auth/session");
    return response.json();
  })) as {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };
  };

  expect(session.user?.id).toBeTruthy();
  expect(session.user?.email).toBe(account.email);
  expect(session.user?.name).toBeTruthy();
  expect(session.user?.role).toBe(account.role);
}

async function assertAuthenticatedRouteLoads(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status() ?? 200, `${route} should not return a server error`).toBeLessThan(500);
  await expect(page).toHaveURL(new RegExp(`${route}(?:$|[?#])`));

  await expect
    .poll(() => visibleBodyText(page), {
      message: `${route} should render meaningful authenticated content`
    })
    .toSatisfy((text) => text.length > 40);

  const bodyText = await visibleBodyText(page);

  expect(bodyText.length, `${route} should render meaningful content`).toBeGreaterThan(40);
  expect(bodyText, `${route} should not redirect to login`).not.toMatch(/Log in|Sign in/i);
  expect(bodyText, `${route} should not render a not-found page`).not.toMatch(/Page not found|not found/i);
  expect(bodyText, `${route} should not render the generic error boundary`).not.toMatch(/Something went wrong/i);
}

test.describe("authenticated browser RBAC", () => {
  test("unauthenticated users are redirected from protected dashboards", async ({
    page
  }) => {
    const guard = attachBrowserStabilityGuards(page);
    await assertLiveDatabase(page);

    for (const route of protectedRoutes) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=%2F${route.slice(1)}`));
      await expect.poll(() => visibleBodyText(page)).toMatch(/Log in|Sign in/i);
    }

    guard.assertClean();
  });

  for (const account of accounts) {
    test(`${account.role} logs in and wrong-role dashboards redirect back`, async ({
      page
    }) => {
      const guard = attachBrowserStabilityGuards(page);
      await assertLiveDatabase(page);
      await loginAs(page, account);

      for (const route of protectedRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page).toHaveURL(
          new RegExp(`${account.dashboardPath}(?:$|[?#])`)
        );
        await expect.poll(() => visibleBodyText(page)).toMatch(account.dashboardText);
      }

      guard.assertClean();
    });

    test(`${account.role} dashboard is usable on mobile after login`, async ({
      page
    }) => {
      const guard = attachBrowserStabilityGuards(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await assertLiveDatabase(page);
      await loginAs(page, account);

      await expect.poll(() => visibleBodyText(page)).toMatch(account.dashboardText);
      await assertNoHorizontalOverflow(page, `${account.role} dashboard`);

      await page.getByLabel(/open notifications/i).click();
      await expect(
        page.getByRole("link", { name: /view all notifications/i })
      ).toBeVisible();
      await assertNoHorizontalOverflow(page, `${account.role} notification dropdown`);

      guard.assertClean();
    });

    test(`${account.role} seeded demo routes load after login`, async ({
      page
    }) => {
      const guard = attachBrowserStabilityGuards(page);
      await assertLiveDatabase(page);
      await loginAs(page, account);

      for (const route of demoRoutesByRole[account.role]) {
        await assertAuthenticatedRouteLoads(page, route);
      }

      guard.assertClean();
    });
  }
});
