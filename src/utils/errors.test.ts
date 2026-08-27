import { describe, expect, it } from "vitest";
import { HttpError, isAbortError, isError } from "./errors";
describe("isError", () => {
  it("returns true for Error instances", () => {
    expect(isError(new Error("x"))).toBe(true);
  });
  it("returns false for non-Errors", () => {
    expect(isError("oops")).toBe(false);
    expect(isError(null)).toBe(false);
  });
});
describe("isAbortError", () => {
  it("detects AbortError by name", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(isAbortError(err)).toBe(true);
  });
  it("returns false for other errors", () => {
    expect(isAbortError(new Error("fail"))).toBe(false);
  });
});
describe("HttpError", () => {
  it("stores status on the error", () => {
    const err = new HttpError("401:未授权", 401);
    expect(err.status).toBe(401);
    expect(err.name).toBe("HttpError");
    expect(err.message).toBe("401:未授权");
  });
});