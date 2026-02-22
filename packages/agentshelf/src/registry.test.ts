import { describe, expect, it } from "vitest";
import { normalizeRepoUrl, parseNpmRepositoryField } from "./registry.js";

describe("parseNpmRepositoryField", () => {
  it("extracts URL from object format", () => {
    const result = parseNpmRepositoryField({
      type: "git",
      url: "git+https://github.com/vercel/next.js.git",
    });
    expect(result).toBe("https://github.com/vercel/next.js");
  });

  it("extracts URL from string format", () => {
    const result = parseNpmRepositoryField("https://github.com/vercel/next.js");
    expect(result).toBe("https://github.com/vercel/next.js");
  });

  it("handles GitHub shorthand", () => {
    const result = parseNpmRepositoryField("github:vercel/next.js");
    expect(result).toBe("https://github.com/vercel/next.js");
  });

  it("handles shorthand owner/repo", () => {
    const result = parseNpmRepositoryField("vercel/next.js");
    expect(result).toBe("https://github.com/vercel/next.js");
  });

  it("returns null for missing field", () => {
    expect(parseNpmRepositoryField(undefined)).toBeNull();
    expect(parseNpmRepositoryField(null)).toBeNull();
  });
});

describe("normalizeRepoUrl", () => {
  it("strips git+ prefix and .git suffix", () => {
    expect(normalizeRepoUrl("git+https://github.com/vercel/next.js.git")).toBe(
      "https://github.com/vercel/next.js",
    );
  });

  it("converts git:// to https://", () => {
    expect(normalizeRepoUrl("git://github.com/lodash/lodash.git")).toBe(
      "https://github.com/lodash/lodash",
    );
  });

  it("converts SSH to HTTPS", () => {
    expect(normalizeRepoUrl("git@github.com:vercel/next.js.git")).toBe(
      "https://github.com/vercel/next.js",
    );
  });

  it("passes through clean HTTPS URLs", () => {
    expect(normalizeRepoUrl("https://github.com/vercel/next.js")).toBe(
      "https://github.com/vercel/next.js",
    );
  });
});
