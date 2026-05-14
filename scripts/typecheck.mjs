import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const workspaceRoot = process.cwd();
const nextTypesPath = resolve(workspaceRoot, ".next", "types");

async function run() {
  // Clean stale generated Next route types before running tsc.
  await rm(nextTypesPath, { recursive: true, force: true });

  const child = spawn(
    process.execPath,
    [resolve(workspaceRoot, "node_modules", "typescript", "bin", "tsc"), "--noEmit"],
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
  console.error("Typecheck failed to start:", error);
  process.exit(1);
});
