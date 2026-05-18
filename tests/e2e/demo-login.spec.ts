import { expect, type Page, test } from "@playwright/test";

const runDemoE2E = process.env.RUN_DEMO_E2E === "1";

const fatalConsolePatterns = [
  /Hydration failed/i,
  /Minified React error/i,
  /ChunkLoadError/i,
  /Cannot read properties of (undefined|null)/i,
  /TypeError/i,
  /ReferenceError/i
];

type DemoRole = "ADMIN" | "PARENT" | "TUTOR";

type DemoAccount = {
  role: DemoRole;
  buttonName: RegExp;
  email: string;
  dashboardPath: "/admin" | "/parent" | "/tutor";
  wrongRoute: "/admin" | "/parent" | "/tutor";
};

const accounts: DemoAccount[] = [
  {
    role: "ADMIN",
    buttonName: /continue as admin/i,
    email: "admin@topmox.test",
    dashboardPath: "/admin",
    wrongRoute: "/parent"
  },
  {
    role: "PARENT",
    buttonName: /continue as parent/i,
    email: "ngozi.parent@topmox.test",
    dashboardPath: "/parent",
    wrongRoute: "/admin"
  },
  {
    role: "TUTOR",
    buttonName: /continue as tutor/i,
    email: "amara.math@topmox.test",
    dashboardPath: "/tutor",
    wrongRoute: "/parent"
  }
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
  const response = await page.request.get("/api/health");
  expect(response.status()).toBe(200);

  const payload = (await response.json()) as {
    status?: string;
    database?: string;
  };

  expect(
    payload.database,
    "Demo login browser tests require Supabase database connectivity."
  ).toBe("connected");
  expect(payload.status).toBe("ok");
}

async function assertSession(page: Page, account: DemoAccount) {
  const session = (await page.evaluate(async () => {
    const response = await fetch("/api/auth/session");
    return response.json();
  })) as {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
      passwordHash?: string;
    };
  };

  expect(session.user?.id).toBeTruthy();
  expect(session.user?.email).toBe(account.email);
  expect(session.user?.name).toBeTruthy();
  expect(session.user?.role).toBe(account.role);
  expect(session.user?.passwordHash).toBeUndefined();
}

test.describe("demo login disabled", () => {
  test.skip(runDemoE2E, "Disabled-state assertion only runs outside demo E2E mode.");

  test("hides demo access when public demo login flag is disabled", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    await expect(page.getByText(/demo access/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /continue as admin/i })).toHaveCount(0);
    await expect(page).not.toHaveURL(/password=/i);
  });
});

test.describe("demo login enabled", () => {
  test.skip(
    !runDemoE2E,
    "Set RUN_DEMO_E2E=1 with demo flags enabled to run browser demo login tests."
  );

  test("renders demo access buttons", async ({ page }) => {
    const guard = attachBrowserStabilityGuards(page);
    await assertLiveDatabase(page);
    await page.goto("/login", { waitUntil: "networkidle" });

    await expect(page.getByText(/^Demo access$/i)).toBeVisible();
    await expect(
      page.getByText(/Use these buttons to preview the Admin, Parent, and Tutor experiences/i)
    ).toBeVisible();

    for (const account of accounts) {
      await expect(page.getByRole("button", { name: account.buttonName })).toBeVisible();
    }

    await expect(page).not.toHaveURL(/password=/i);
    guard.assertClean();
  });

  for (const account of accounts) {
    test(`Continue as ${account.role} logs in and keeps credentials out of the URL`, async ({
      page
    }) => {
      const guard = attachBrowserStabilityGuards(page);
      await assertLiveDatabase(page);

      await page.goto("/login", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: account.buttonName }).click();
      await expect(page).toHaveURL(new RegExp(`${account.dashboardPath}(?:$|[?#])`), {
        timeout: 20_000
      });
      await expect(page).not.toHaveURL(/password=/i);

      await assertSession(page, account);

      await page.goto(account.wrongRoute, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${account.dashboardPath}(?:$|[?#])`));

      guard.assertClean();
    });
  }
});
