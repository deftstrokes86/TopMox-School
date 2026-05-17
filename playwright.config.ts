import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "7000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  globalTeardown: skipWebServer ? undefined : "./tests/e2e/global-teardown.ts",
  timeout: 30_000,
  expect: {
    timeout: 7_500
  },
  retries: process.env.CI ? 1 : 0,
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
