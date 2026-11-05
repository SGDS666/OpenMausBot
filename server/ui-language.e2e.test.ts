import { expect, it } from "vitest";
import { launchVerificationServer } from "../scripts/control-omb.ts";
import { fixtureApi } from "../scripts/testing/preview-fixture.ts";

it("defaults a fresh installation's UI to Simplified Chinese without replacing saved languages or System", async () => {
  const fixture = await launchVerificationServer();
  try {
    const api = fixtureApi(fixture.info.url);
    expect((await api("GET", "/api/config")).language).toBe("zh");
    expect((await api("PATCH", "/api/config", { language: "fr" })).language).toBe("fr");
    expect((await api("GET", "/api/config")).language).toBe("fr");
    expect((await api("PATCH", "/api/config", { language: "" })).language).toBe("");
    expect((await api("GET", "/api/config")).language).toBe("");
  } finally {
    await fixture.close();
  }
}, 60_000);
