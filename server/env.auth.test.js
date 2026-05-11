import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const authModuleUrl = pathToFileURL(
  path.resolve(process.cwd(), "src/config/env/auth.js")
).href;

test("auth env throws in production when JWT_SECRET is default", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.JWT_SECRET;

  process.env.NODE_ENV = "production";
  delete process.env.JWT_SECRET;

  await assert.rejects(async () => import(`${authModuleUrl}?case=prod-default`), {
    message: "JWT_SECRET must be set in production",
  });

  process.env.NODE_ENV = previousNodeEnv;
  if (previousSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousSecret;
  }
});

test("auth env allows explicit JWT_SECRET in production", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.JWT_SECRET;

  process.env.NODE_ENV = "production";
  process.env.JWT_SECRET = "safe_secret";

  const module = await import(`${authModuleUrl}?case=prod-safe`);
  assert.equal(module.JWT_SECRET, "safe_secret");

  process.env.NODE_ENV = previousNodeEnv;
  if (previousSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousSecret;
  }
});
