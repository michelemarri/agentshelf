import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { printQueryInsight, printSearchAllInsight } from "./insight.js";
import type { SearchAllResult } from "./search.js";

describe("printSearchAllInsight", () => {
  let stderrOutput: string[];

  beforeEach(() => {
    stderrOutput = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      stderrOutput.push(args.join(" "));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows results grouped by library", () => {
    const result: SearchAllResult = {
      results: [
        {
          library: "next@15.3.3",
          title: "Middleware > Producing a Response",
          content: "a".repeat(400),
          source: "docs/middleware.mdx",
          score: 1.0,
        },
        {
          library: "next@15.3.3",
          title: "Authentication > Authorization",
          content: "b".repeat(300),
          source: "docs/auth.mdx",
          score: 0.9,
        },
        {
          library: "payload@3.33.0",
          title: "REST API > Custom Endpoints",
          content: "c".repeat(500),
          source: "docs/rest-api.mdx",
          score: 1.0,
        },
      ],
    };

    printSearchAllInsight(result, 3);

    const output = stderrOutput.join("\n");
    expect(output).toContain("3 results across 2 libraries");
    expect(output).toContain("next@15.3.3");
    expect(output).toContain("payload@3.33.0");
    expect(output).toContain("(2)");
    // payload has 1 result — no count suffix shown
    expect(output).toMatch(/payload@3\.33\.0 — REST API/);
    expect(output).toContain("Tokens:");
  });

  it("shows no results message with library count", () => {
    const result: SearchAllResult = { results: [] };

    printSearchAllInsight(result, 3);

    const output = stderrOutput.join("\n");
    expect(output).toContain("No results found across 3 libraries");
    expect(output).toContain("Try:");
  });

  it("shows single result correctly", () => {
    const result: SearchAllResult = {
      results: [
        {
          library: "next@15.3.3",
          title: "Middleware > Overview",
          content: "a".repeat(200),
          source: "docs/middleware.mdx",
          score: 1.0,
        },
      ],
    };

    printSearchAllInsight(result, 1);

    const output = stderrOutput.join("\n");
    expect(output).toContain("1 result across 1 library");
  });

  it("truncates long section titles", () => {
    const result: SearchAllResult = {
      results: [
        {
          library: "next@15.3.3",
          title:
            "Very Long Section Title That Should Be Truncated Because It Exceeds The Maximum Length",
          content: "a".repeat(200),
          source: "docs/long.mdx",
          score: 1.0,
        },
      ],
    };

    printSearchAllInsight(result, 1);

    const output = stderrOutput.join("\n");
    // Title should be truncated with ellipsis
    expect(output).toContain("...");
    // Full title should NOT appear
    expect(output).not.toContain("Exceeds The Maximum Length");
  });
});

describe("printQueryInsight", () => {
  let stderrOutput: string[];

  beforeEach(() => {
    stderrOutput = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      stderrOutput.push(args.join(" "));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows results for a single library", () => {
    const result = {
      library: "next@15.3.3",
      version: "15.3.3",
      results: [
        {
          title: "Middleware > Producing a Response",
          content: "a".repeat(400),
          source: "docs/middleware.mdx",
        },
        {
          title: "Authentication > Authorization",
          content: "b".repeat(300),
          source: "docs/auth.mdx",
        },
      ],
    };

    printQueryInsight(result);

    const output = stderrOutput.join("\n");
    expect(output).toContain("2 results in next@15.3.3");
    expect(output).toContain("Middleware > Producing a Response");
    expect(output).toContain("Authentication > Authorization");
    expect(output).toContain("Tokens:");
  });

  it("shows no results message", () => {
    const result = {
      library: "next@15.3.3",
      version: "15.3.3",
      results: [],
    };

    printQueryInsight(result);

    const output = stderrOutput.join("\n");
    expect(output).toContain("No results in next@15.3.3");
    expect(output).toContain("Try:");
  });
});
