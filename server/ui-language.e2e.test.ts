import { expect, it } from "vitest";
import { launchVerificationServer, runControlOmb } from "../scripts/control-omb.ts";
import { fixtureApi } from "../scripts/testing/preview-fixture.ts";
import { initialGreeting } from "./initial-greeting.ts";

it("defaults a fresh installation's UI to Simplified Chinese without replacing saved languages or System", async () => {
  const fixture = await launchVerificationServer();
  try {
    const api = fixtureApi(fixture.info.url);
    const create = async (name: string) => {
      const created = await runControlOmb(["new-bot", "--name", name, "--url", fixture.info.url]) as { bot: { id: string } };
      return { id: created.bot.id, messages: await runControlOmb(["messages", "--bot", created.bot.id, "--limit", "10", "--url", fixture.info.url]) as { messages: Array<{ text?: string }> } };
    };
    expect((await api("GET", "/api/config")).language).toBe("zh");
    const chinese = await create("中文验收");
    expect(chinese.messages.messages.some(message => message.text === "你好，我是 中文验收。你想让我帮你做什么？")).toBe(true);
    expect((await api("PATCH", "/api/config", { language: "fr" })).language).toBe("fr");
    expect((await api("GET", "/api/config")).language).toBe("fr");
    const prior = await runControlOmb(["messages", "--bot", chinese.id, "--limit", "10", "--url", fixture.info.url]);
    expect(prior).toEqual(chinese.messages);
    expect((await api("PATCH", "/api/config", { language: "en" })).language).toBe("en");
    expect((await create("English Probe")).messages.messages.some(message => message.text === "Hi, I'm English Probe. What would you like me to do?")).toBe(true);
    expect((await api("PATCH", "/api/config", { language: "" })).language).toBe("");
    expect((await api("GET", "/api/config")).language).toBe("");
    const system = await create("System Probe");
    expect(system.messages.messages.some(message => message.text === initialGreeting("System Probe", Intl.DateTimeFormat().resolvedOptions().locale))).toBe(true);
  } finally {
    await fixture.close();
  }
}, 60_000);
