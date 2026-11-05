import assert from "node:assert/strict";
import { test } from "node:test";
import { FORK_RELEASES_URL, createManualForkUpdater, upstreamCompatibleDeepLink } from "./fork-policy.mjs";

test("fork updater only opens its own releases on a deliberate check", async () => {
  const opened = [];
  const updater = createManualForkUpdater(async url => opened.push(url));
  await updater.check();
  assert.deepEqual(opened, []);
  assert.equal(await updater.install(), false);
  assert.deepEqual(opened, []);
  await updater.check(true);
  assert.deepEqual(opened, [FORK_RELEASES_URL]);
});

test("fork protocol preserves the upstream internal parser contract", () => {
  assert.equal(upstreamCompatibleDeepLink("dynasturn-console://thread/a?bot=b"), "openmausbot://thread/a?bot=b");
  assert.equal(upstreamCompatibleDeepLink("https://example.test"), "https://example.test");
  assert.equal(upstreamCompatibleDeepLink("dynasturn-console-evil://thread/a"), "dynasturn-console-evil://thread/a");
  assert.equal(upstreamCompatibleDeepLink(null), null);
});
