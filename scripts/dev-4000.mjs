import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const workspaceRoot = process.cwd();
const nextCachePath = resolve(workspaceRoot, ".next");
const nextBinPath = resolve(
  workspaceRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

async function run() {
  await rm(nextCachePath, { recursive: true, force: true });

  const child = spawn(
    process.execPath,
    [nextBinPath, "dev", "--hostname", "0.0.0.0", "--port", "4000"],
    {
      stdio: "inherit",
      env: process.env
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

run().catch((error) => {
  console.error("Failed to start dev server on port 4000:", error);
  process.exit(1);
});
