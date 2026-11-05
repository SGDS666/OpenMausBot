import { describe, expect, it } from "vitest";

import { hasSetupChoices, initialGreeting, initialGreetingMessage, setupChoices, setupRequestLine } from "./initial-greeting.ts";

describe("the line after Set me up", () => {
  it("is written in the app's language, by region, with English for any other", () => {
    expect(setupRequestLine("en")).toBe(
      "Great. Tell me what you'd like help with, in your own words, and I'll set myself up for it. For example: \"sort my inbox every morning\" or \"research our competitors every week\".",
    );
    expect(setupRequestLine("es-MX")).toMatch(/^Genial\. Cuéntame/);
    expect(setupRequestLine("pt-BR")).toMatch(/^Ótimo\. Me conte/);
    expect(setupRequestLine("fr")).toBe(setupRequestLine("en"));
    expect(setupRequestLine(undefined)).toBe(setupRequestLine("en"));
  });

  it("leaves the greeting itself as it was", () => {
    expect(initialGreeting("Ava", "en")).toBe("Hi, I'm Ava. What would you like me to do?");
  });
});

describe("a new bot's greeting", () => {
  it.each(["zh", "zh-CN", "zh-Hans-CN"])("offers fixed Chinese setup without a model in %s", language => {
    expect(initialGreeting("小白", language)).toBe("你好，我是 小白。你想让我帮你做什么？");
    expect(initialGreeting("Scout", language, "张先生")).toBe("你好，张先生，我是 Scout。你想让我帮你做什么？");
    expect(setupRequestLine(language)).toBe("好的。请用你自己的话告诉我需要什么帮助，我会据此完成设置。例如：“每天早晨整理收件箱”或“每周研究我们的竞争对手”。");
    expect(hasSetupChoices(language)).toBe(true);
    expect(setupChoices(language)).toEqual(["研究和深入了解主题", "替我关注事项", "邮件、日历和消息", "预订、购物和跑腿", "数据、电子表格和报告"]);
    expect(initialGreetingMessage("小白", () => language, true)).toMatchObject({ text: "你好，我是 小白。你想让我帮你做什么？", setupOffer: true, setupChoices: setupChoices(language) });
  });

  it("names the person by their first name, in the app's language", () => {
    expect(initialGreeting("Scout", "en", "Milind Soni")).toBe("Hi Milind, I'm Scout. What would you like me to do?");
    expect(initialGreeting("Scout", "es-MX", "  Ana  María ")).toBe("Hola Ana, soy Scout. ¿Qué te gustaría que hiciera?");
    expect(initialGreeting("Scout", "pt-BR", "João")).toBe("Oi João, eu sou Scout. O que você gostaria que eu fizesse?");
  });

  it("names no one when the person has not given a name", () => {
    for (const person of [undefined, "", "   "]) {
      expect(initialGreeting("Scout", "en", person)).toBe("Hi, I'm Scout. What would you like me to do?");
    }
  });
});
