import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "7000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";
const runAuthE2E = process.env.RUN_AUTH_E2E === "1";
const runDemoE2E = process.env.RUN_DEMO_E2E === "1";
const runAuthenticatedBrowserE2E = runAuthE2E || runDemoE2E;

export default defineConfig({
  testDir: "./tests/e2e",
  globalTeardown: skipWebServer ? undefined : "./tests/e2e/global-teardown.ts",
  timeout: runAuthenticatedBrowserE2E ? 60_000 : 30_000,
  expect: {
    timeout: runAuthenticatedBrowserE2E ? 20_000 : 7_500
  },
  retries: process.env.CI ? 1 : 0,
  workers: runAuthenticatedBrowserE2E ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: skipWebServer
    ? undefined
    : {
        command: "node scripts/playwright-dev-server.mjs",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe"
      }
});
