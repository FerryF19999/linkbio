import assert from "node:assert/strict";
import { test } from "node:test";
import { isMissingAuthSession, loginErrorMessage } from "../lib/auth-errors.ts";

test("expired or missing credentials require sign-in", () => {
  for (const error of [
    { name: "AuthSessionMissingError", status: 400 },
    { status: 401 },
    { code: "refresh_token_not_found", status: 400 },
    { code: "session_expired", status: 400 },
  ]) assert.equal(isMissingAuthSession(error), true);
});

test("network, rate-limit and server errors do not falsely expire a session", () => {
  for (const error of [
    new TypeError("fetch failed"),
    { name: "AuthRetryableFetchError", status: 503 },
    { status: 500 },
    { status: 429 },
    null,
  ]) assert.equal(isMissingAuthSession(error), false);
});

test("login errors explain the recovery without exposing provider internals", () => {
  assert.match(loginErrorMessage({ code: "invalid_credentials" }), /password tidak cocok/);
  assert.match(loginErrorMessage({ status: 429 }), /Terlalu banyak/);
  assert.doesNotMatch(loginErrorMessage(new Error("private provider details")), /private provider/);
});
