import assert from "node:assert/strict";
import test from "node:test";

import { defer, withTimeout } from "../js/timing.js";

test("defer does not return the callback promise to the caller", async () => {
  let release;
  let started = false;
  const blocked = new Promise((resolve) => { release = resolve; });

  const returned = defer(async () => {
    started = true;
    await blocked;
  });

  assert.equal(returned, undefined);
  assert.equal(started, false);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(started, true);
  release();
});

test("withTimeout returns a fast result", async () => {
  assert.equal(await withTimeout(Promise.resolve("ok"), 50, "test"), "ok");
});

test("withTimeout rejects a stuck operation", async () => {
  await assert.rejects(
    withTimeout(new Promise(() => {}), 5, "test"),
    /test逾時/,
  );
});
