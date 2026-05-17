import { expect, type Page, test } from "@playwright/test";

type SmokeRoute = {
  path: string;
  expectedText: RegExp;
  allowLoginRedirect?: boolean;
};

const smokeRoutes: SmokeRoute[] = [
  { path: "/", expectedText: /TopMox Global Tutoring/i },
  { path: "/global-tutoring", expectedText: /Global Tutoring/i },
  { path: "/subjects", expectedText: /Subjects|Mathematics|English/i },
  { path: "/pricing", expectedText: /Pricing|Tutoring Plans/i },
  { path: "/about", expectedText: /About|TopMox Schools/i },
  { path: "/faq", expectedText: /FAQ|Questions/i },
  { path: "/contact", expectedText: /Contact|WhatsApp|TopMox/i },
  { path: "/resources", expectedText: /Resources|Read more/i },
  {
    path: "/resources/how-online-tutoring-works-at-topmox",
    expectedText: /How online tutoring works at TopMox|assessment|structured/i
  },
  { path: "/login", expectedText: /TopMox Global Tutoring|Log in|Sign in/i },
  { path: "/register", expectedText: /TopMox Global Tutoring|Create|Register/i },
  {
    path: "/forgot-password",
    expectedText: /TopMox Global Tutoring|password|Email/i
  },
  {
    path: "/admin",
    expectedText: /TopMox Global Tutoring|Log in|Admin Dashboard/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/assessments",
    expectedText: /TopMox Global Tutoring|Log in|Assessment Requests/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/payments",
    expectedText: /TopMox Global Tutoring|Log in|Payments/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/lessons",
    expectedText: /TopMox Global Tutoring|Log in|Lessons/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/reports",
    expectedText: /TopMox Global Tutoring|Log in|Progress Reports/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/support",
    expectedText: /TopMox Global Tutoring|Log in|Support Requests/i,
    allowLoginRedirect: true
  },
  {
    path: "/admin/resources",
    expectedText: /TopMox Global Tutoring|Log in|Resources/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent",
    expectedText: /TopMox Global Tutoring|Log in|Parent Dashboard/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/assessments",
    expectedText: /TopMox Global Tutoring|Log in|Assessments/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/payments",
    expectedText: /TopMox Global Tutoring|Log in|Payments/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/lessons",
    expectedText: /TopMox Global Tutoring|Log in|Lessons/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/homework",
    expectedText: /TopMox Global Tutoring|Log in|Homework/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/reports",
    expectedText: /TopMox Global Tutoring|Log in|Progress Reports/i,
    allowLoginRedirect: true
  },
  {
    path: "/parent/support",
    expectedText: /TopMox Global Tutoring|Log in|Support/i,
    allowLoginRedirect: true
  },
  {
    path: "/tutor",
    expectedText: /TopMox Global Tutoring|Log in|Tutor Dashboard/i,
    allowLoginRedirect: true
  },
  {
    path: "/tutor/lessons",
    expectedText: /TopMox Global Tutoring|Log in|Lessons/i,
    allowLoginRedirect: true
  },
  {
    path: "/tutor/homework",
    expectedText: /TopMox Global Tutoring|Log in|Homework/i,
    allowLoginRedirect: true
  },
  {
    path: "/tutor/reports",
    expectedText: /TopMox Global Tutoring|Log in|Progress Reports/i,
    allowLoginRedirect: true
  }
];

const fatalConsolePatterns = [
  /Uncaught Error/i,
  /Hydration failed/i,
  /Text content does not match server-rendered HTML/i,
  /Minified React error/i,
  /ChunkLoadError/i,
  /Cannot find module '\.\//i,
  /Unexpected end of JSON input/i,
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

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    if (url.includes("/_next/static/") && status >= 400) {
      failures.push(`missing Next static asset: ${status} ${url}`);
    }
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.includes("/_next/static/")) {
      failures.push(
        `failed Next static request: ${url} ${request.failure()?.errorText ?? ""}`
      );
    }
  });

  return {
    assertClean() {
      expect(failures).toEqual([]);
    }
  };
}

async function assertNotBlank(page: Page, route: SmokeRoute) {
  await page.waitForLoadState("domcontentloaded");

  await expect
    .poll(
      async () => getVisibleBodyText(page),
      {
        message: `${route.path} should render expected visible text`
      }
    )
    .toMatch(route.expectedText);

  const bodyText = await getVisibleBodyText(page);

  expect(
    bodyText.length,
    `${route.path} should render meaningful text`
  ).toBeGreaterThan(40);
  expect(bodyText, `${route.path} should not stay on the loading fallback`).not.toMatch(
    /^Preparing TopMox Global Tutoring/i
  );
  expect(bodyText, `${route.path} should not render only an error boundary`).not.toMatch(
    /Something went wrong|critical app shell issue/i
  );
}

async function getVisibleBodyText(page: Page) {
  try {
    return await page.locator("body").evaluate((body) => {
      const normalize = (value: string | null | undefined) =>
        (value ?? "").replace(/\s+/g, " ").trim();
      const htmlBody = body as HTMLElement;

      const bodyText = normalize(htmlBody.innerText);
      if (bodyText.length > 0) {
        return bodyText;
      }

      const visibleElements = Array.from(
        body.querySelectorAll<HTMLElement>(
          "h1,h2,h3,h4,p,a,button,label,input,textarea,summary,li"
        )
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      return normalize(
        visibleElements
          .map((element) => {
            if (
              element instanceof HTMLInputElement ||
              element instanceof HTMLTextAreaElement
            ) {
              return (
                element.value ||
                element.placeholder ||
                element.getAttribute("aria-label")
              );
            }

            return element.innerText || element.textContent;
          })
          .filter(Boolean)
          .join(" ")
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      /Execution context was destroyed|Cannot find context with specified id/i.test(
        message
      )
    ) {
      return "";
    }

    throw error;
  }
}

test.describe("browser route smoke checks", () => {
  for (const route of smokeRoutes) {
    test(`${route.path} renders without blanking`, async ({ page }) => {
      const guard = attachBrowserStabilityGuards(page);
      const response = await page.goto(route.path, {
        waitUntil: "networkidle"
      });

      expect(response, `${route.path} should produce a response`).not.toBeNull();
      expect(response?.status(), `${route.path} should not return 500`).toBeLessThan(500);

      if (route.allowLoginRedirect) {
        expect(
          page.url(),
          `${route.path} should render safely or redirect to login`
        ).toMatch(/\/(admin|parent|tutor|login)(\?|$|\/)/);
      }

      await assertNotBlank(page, route);
      guard.assertClean();
    });
  }

  test("/api/health returns safe health JSON", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const payload = (await response.json()) as {
      status?: string;
      app?: string;
      timestamp?: string;
      database?: string;
    };

    expect(["ok", "degraded"]).toContain(payload.status);
    expect(payload.app).toBe("TopMox Global Tutoring");
    expect(payload.timestamp).toBeTruthy();
    expect(["connected", "disconnected"]).toContain(payload.database);
  });
});
