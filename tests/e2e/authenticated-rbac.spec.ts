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

async function loginAs(page: Page, account: DemoAccount) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel(/email address/i).fill(account.email);
  await page.getByLabel(/^password$/i).fill(account.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(new RegExp(`${account.dashboardPath}(?:$|[?#])`));
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
  }
});
