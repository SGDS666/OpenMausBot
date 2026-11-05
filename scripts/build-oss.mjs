import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const packageManager = process.env.npm_execpath;
if (!packageManager) throw new Error("Run this build with pnpm build:oss");
for (const script of ["build", "build:server"]) {
  const result = spawnSync(process.execPath, [packageManager, "run", script], {
    cwd: root,
    env: { ...process.env, OMB_EDITION: "oss" },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
