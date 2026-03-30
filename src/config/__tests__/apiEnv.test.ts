import { describe, it, expect } from "vitest";
import { validateProductionApiBaseUrl } from "../apiEnv";

describe("validateProductionApiBaseUrl", () => {
  it("returns error for empty string", () => {
    expect(validateProductionApiBaseUrl("")).toMatch(/required/i);
  });

  it("returns error for localhost URL", () => {
    expect(validateProductionApiBaseUrl("http://127.0.0.1:8000")).toMatch(/localhost/i);
    expect(validateProductionApiBaseUrl("http://localhost:3000/api")).toMatch(/localhost/i);
  });

  it("returns error for http non-localhost in production validation", () => {
    expect(validateProductionApiBaseUrl("http://api.example.com")).toMatch(/https/i);
  });

  it("returns null for valid https URL", () => {
    expect(validateProductionApiBaseUrl("https://api.example.com")).toBeNull();
    expect(validateProductionApiBaseUrl("https://api.example.com/v1")).toBeNull();
  });
});
