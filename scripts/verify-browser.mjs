import { spawn } from "node:child_process";

const port = process.env.PORT ?? "7000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const serverScript = "scripts/playwright-dev-server.mjs";
const rawArgs = process.argv.slice(2);
const headed = rawArgs.includes("--headed");
const testArgs = rawArgs.filter((arg) => arg !== "--headed");
const playwrightArgs = ["playwright", "test", ...testArgs];

if (headed) {
  playwrightArgs.push("--headed");
}

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
    ...options
  });
}

function killProcessTree(child) {
  return new Promise((resolve) => {
    if (!child?.pid) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, 5_000);
    timeout.unref();

    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });

      killer.on("close", () => {
        clearTimeout(timeout);
        resolve();
      });
      return;
    }

    child.kill("SIGTERM");
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  let lastError = "";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL);
      const html = await response.text();

      if (response.ok && html.includes("TopMox")) {
        return;
      }

      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`Timed out waiting for ${baseURL}: ${lastError}`);
}

async function runPlaywright() {
  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", ["npx", ...playwrightArgs].join(" ")]
      : playwrightArgs;

  return new Promise((resolve) => {
    const child = spawnProcess(command, args, {
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_WEBSERVER: "1"
      }
    });

    child.on("exit", (code) => resolve(code ?? 1));
  });
}

let serverProcess;

try {
  serverProcess = spawnProcess(process.execPath, [serverScript]);
  await waitForServer();
  const exitCode = await runPlaywright();
  process.exitCode = exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await killProcessTree(serverProcess);
  process.exit(process.exitCode ?? 0);
}
