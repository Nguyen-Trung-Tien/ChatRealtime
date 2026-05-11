import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetSocketRateLimitBucketsForTest,
  consumeSocketRateLimit,
} from "./src/services/socket/rateLimit.js";

test("socket rate limiter denies request after max events", () => {
  __resetSocketRateLimitBucketsForTest();

  const options = {
    key: "chat:send-message:user-1",
    windowMs: 20_000,
    max: 2,
  };

  assert.equal(consumeSocketRateLimit(options), true);
  assert.equal(consumeSocketRateLimit(options), true);
  assert.equal(consumeSocketRateLimit(options), false);
});
