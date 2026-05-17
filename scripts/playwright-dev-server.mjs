import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const workspaceRoot = process.cwd();
const port = process.env.PORT ?? "7000";
const targets = [".next", "node_modules/.cache"];

function assertInWorkspace(absolutePath) {
  const relPath = relative(workspaceRoot, absolutePath);
  const isOutside =
    relPath === ".." || relPath.startsWith(`..${sep}`) || relPath.startsWith("../");

  if (isOutside) {
    throw new Error(`Refusing to delete path outside workspace: ${absolutePath}`);
  }
}

async function cleanNextCache() {
  for (const target of targets) {
    const absolutePath = resolve(workspaceRoot, target);
    assertInWorkspace(absolutePath);
    await rm(absolutePath, { recursive: true, force: true });
    console.log(`Removed cache target: ${target}`);
  }

  console.log("Next.js cache cleanup complete.");
}

function startNextDevServer() {
  const nextBin = resolve(workspaceRoot, "node_modules/next/dist/bin/next");
  const child = spawn(process.execPath, [nextBin, "dev", "--port", port], {
    cwd: workspaceRoot,
    env: process.env,
    stdio: "inherit",
    windowsHide: true
  });
  let shuttingDown = false;

  const shutdown = (exitCode = 0) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (process.platform === "win32" && child.pid) {
      const killer = spawn(
        "taskkill",
        ["/pid", String(child.pid), "/T", "/F"],
        {
          stdio: "ignore",
          windowsHide: true
        }
      );

      killer.on("close", () => process.exit(exitCode));
      setTimeout(() => process.exit(exitCode), 5_000).unref();
      return;
    }

    child.kill("SIGTERM");
    setTimeout(() => {
      child.kill("SIGKILL");
      process.exit(exitCode);
    }, 5_000).unref();
  };

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      process.exit(0);
    }

    if (signal) {
      process.exit(0);
    }

    process.exit(code ?? 0);
  });
}

await cleanNextCache();
startNextDevServer();
