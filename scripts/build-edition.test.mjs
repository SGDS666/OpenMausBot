import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildEdition, removeEnterpriseOutput } from "./build-edition.mjs";

describe("fork edition builds", () => {
  it("defaults to OSS and requires an explicit valid edition", () => {
    expect(buildEdition({})).toBe("oss");
    expect(buildEdition({ OMB_EDITION: "enterprise" })).toBe("enterprise");
    expect(() => buildEdition({ OMB_EDITION: "enterprize" })).toThrow();
  });

  it("removes stale bundled enterprise output while preserving source", () => {
    const root = mkdtempSync(join(tmpdir(), "dynasturn-edition-"));
    try {
      mkdirSync(join(root, "enterprise"));
      writeFileSync(join(root, "enterprise", "LICENSE"), "source remains");
      mkdirSync(join(root, "dist-server", "enterprise"), { recursive: true });
      writeFileSync(join(root, "dist-server", "enterprise", "index.js"), "stale");
      removeEnterpriseOutput(root);
      expect(existsSync(join(root, "dist-server", "enterprise"))).toBe(false);
      expect(readFileSync(join(root, "enterprise", "LICENSE"), "utf8")).toBe("source remains");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
