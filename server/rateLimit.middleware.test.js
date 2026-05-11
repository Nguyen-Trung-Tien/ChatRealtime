import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetRateLimitBucketsForTest,
  createRateLimitMiddleware,
} from "./src/middleware/rateLimit.js";

const createMockRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("rate limit middleware blocks after max hits inside window", () => {
  __resetRateLimitBucketsForTest();
  const middleware = createRateLimitMiddleware({
    keyPrefix: "test:auth",
    windowMs: 10_000,
    max: 2,
    message: "blocked",
  });

  const req = { ip: "127.0.0.1" };
  const res = createMockRes();
  let nextCalls = 0;
  const next = () => {
    nextCalls += 1;
  };

  middleware(req, res, next);
  middleware(req, res, next);
  middleware(req, res, next);

  assert.equal(nextCalls, 2);
  assert.equal(res.statusCode, 429);
  assert.deepEqual(res.body, { message: "blocked" });
});
