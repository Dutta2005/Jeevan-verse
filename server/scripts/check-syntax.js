import { readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const excluded = new Set(["node_modules", ".git", "coverage", "dist"]);

function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return excluded.has(entry.name) ? [] : collect(path);
    }
    return entry.isFile() && /\.(?:js|mjs|cjs)$/.test(entry.name) ? [path] : [];
  });
}

const files = collect(root).sort();
for (const file of files) {
  // Parse only: never import application code or start external services.
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) {
    console.error(`Syntax check failed: ${relative(root, file)}`);
    console.error(result.error?.message ?? result.stderr);
    process.exit(1);
  }
}
console.log(`Syntax checks passed for ${files.length} JavaScript files.`);
