import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import en from "./en.json";
import zh from "./zh.json";
import hashes from "./source-hashes.json";

it("keeps Simplified Chinese complete with the English placeholders and current source hashes", () => {
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  const chinese = zh as Record<string, string>;
  const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(",");
  expect(Object.entries(en).filter(([key, value]) => !chinese[key]?.trim() || placeholders(chinese[key]!) !== placeholders(value)).map(([key]) => key)).toEqual([]);
  const recorded = hashes.locales.zh as Record<string, string>;
  expect(Object.entries(en).filter(([key, value]) => recorded[key] !== createHash("sha256").update(value).digest("hex")).map(([key]) => key)).toEqual([]);
});
