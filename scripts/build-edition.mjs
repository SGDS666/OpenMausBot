import { existsSync, lstatSync, realpathSync, rmSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

export function buildEdition(env = process.env) {
  const edition = env.OMB_EDITION ?? "oss";
  if (edition !== "oss" && edition !== "enterprise") throw new Error("OMB_EDITION must be oss or enterprise");
  return edition;
}

export function removeEnterpriseOutput(root) {
  const project = realpathSync(root);
  const output = resolve(project, "dist-server");
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) throw new Error("dist-server must not be a symbolic link");
  const target = resolve(output, "enterprise");
  const within = relative(output, target);
  if (!within || isAbsolute(within) || within.startsWith("..")) throw new Error("Enterprise output escapes dist-server");
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}
