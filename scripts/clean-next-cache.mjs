import { rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const workspaceRoot = process.cwd();

const targets = [".next", "node_modules/.cache"];

function assertInWorkspace(absolutePath) {
  const relPath = relative(workspaceRoot, absolutePath);
  const isOutside =
    relPath === ".." || relPath.startsWith(`..${sep}`) || relPath.startsWith("../");

  if (isOutside) {
    throw new Error(`Refusing to delete path outside workspace: ${absolutePath}`);
  }
}

async function removeTarget(target) {
  const absolutePath = resolve(workspaceRoot, target);
  assertInWorkspace(absolutePath);

  await rm(absolutePath, { recursive: true, force: true });
  console.log(`Removed cache target: ${target}`);
}

async function main() {
  for (const target of targets) {
    await removeTarget(target);
  }

  console.log("Next.js cache cleanup complete.");
}

main().catch((error) => {
  console.error("Failed to clean Next.js cache:", error);
  process.exit(1);
});
