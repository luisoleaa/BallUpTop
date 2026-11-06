import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const prettierCli = resolve(
  projectDir,
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);
const supportedExtensions = new Set([".ts", ".tsx", ".mts", ".cts"]);

let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
}

let payload;
try {
  payload = JSON.parse(input);
} catch (error) {
  console.error("Unable to read Claude hook input:", error);
  process.exit(1);
}

const filePath = payload.tool_input?.file_path;
if (
  typeof filePath !== "string" ||
  !supportedExtensions.has(
    filePath.slice(filePath.lastIndexOf(".")).toLowerCase(),
  )
) {
  process.exit(0);
}

if (!existsSync(prettierCli)) {
  console.error(
    `Prettier was not found at ${prettierCli}. Install project dependencies first.`,
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [prettierCli, "--write", resolve(projectDir, filePath)],
  {
    cwd: projectDir,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error("Failed to run Prettier:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
