import { beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({ handlers: new Map(), openExternal: vi.fn() }));
vi.mock("electron", () => ({
  clipboard: { writeText: vi.fn() },
  ipcMain: { handle: (channel, handler) => fixture.handlers.set(channel, handler) },
  shell: { openExternal: fixture.openExternal },
  app: {},
}));

import { FORK_RELEASES_URL } from "./fork-policy.mjs";
import { registerUpdaterIpc, startUpdater } from "./updater.mjs";

describe("fork updater IPC", () => {
  const trusted = { trusted: true };
  beforeEach(() => {
    fixture.handlers.clear();
    fixture.openExternal.mockClear();
    registerUpdaterIpc({ pageAllowed: event => event === trusted });
  });

  it("starts without any download or page opening", () => {
    startUpdater();
    expect(fixture.openExternal).not.toHaveBeenCalled();
    expect(fixture.handlers.get("update:get-state")(trusted)).toEqual({ status: "idle" });
  });

  it("opens only the fork release channel on a trusted manual action", async () => {
    await fixture.handlers.get("update:check")(trusted);
    expect(fixture.openExternal).toHaveBeenCalledExactlyOnceWith(FORK_RELEASES_URL);
    await expect(fixture.handlers.get("update:install")(trusted)).resolves.toBe(false);
  });

  it("rejects requests from pages outside the desktop trust boundary", () => {
    for (const channel of ["update:get-state", "update:check", "update:install", "update:seen"]) {
      expect(() => fixture.handlers.get(channel)({ trusted: true })).toThrow("only available");
    }
    expect(fixture.openExternal).not.toHaveBeenCalled();
  });
});
