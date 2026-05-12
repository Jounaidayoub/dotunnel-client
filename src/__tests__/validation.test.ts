import { describe, expect, it } from "vitest";
import { validatePortNumber, validateProxyName } from "../validation.js";

describe("validatePortNumber", () => {
  it("accepts valid ports", () => {
    expect(validatePortNumber(3000).ok).toBe(true);
    expect(validatePortNumber("8080").ok).toBe(true);
  });

  it("rejects invalid ports", () => {
    expect(validatePortNumber("abc").ok).toBe(false);
    expect(validatePortNumber(0).ok).toBe(false);
    expect(validatePortNumber(70000).ok).toBe(false);
  });
});

describe("validateProxyName", () => {
  it("normalizes and validates", () => {
    const result = validateProxyName("My-App");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("my-app");
    }
  });

  it("rejects invalid names", () => {
    expect(validateProxyName("-bad").ok).toBe(false);
    expect(validateProxyName("bad-").ok).toBe(false);
    expect(validateProxyName("bad name").ok).toBe(false);
  });
});
