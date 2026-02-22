import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { formatSearchAllResult, search, searchAll } from "./search.js";
import { PackageStore, readPackageInfo } from "./store.js";
import { createTestDb, insertChunk, rebuildFtsIndex } from "./test-utils.js";

const TEST_DIR = join(tmpdir(), `context-search-test-${Date.now()}`);

describe("search", () => {
  let db: Database.Database;
  const testPackagePath = join(TEST_DIR, "test.db");

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    db = createTestDb(testPackagePath, { name: "nextjs", version: "15.0" });
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it("returns library info in result", () => {
    rebuildFtsIndex(db);

    const result = search(db, "anything");

    expect(result.library).toBe("nextjs@15.0");
    expect(result.version).toBe("15.0");
  });

  it("finds matching content by topic", () => {
    insertChunk(db, {
      docPath: "docs/middleware.md",
      docTitle: "Middleware",
      sectionTitle: "Introduction",
      content:
        "Middleware allows you to run code before a request is completed.",
      tokens: 50,
    });
    rebuildFtsIndex(db);

    const result = search(db, "middleware");

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Middleware > Introduction");
    expect(result.results[0].source).toBe("docs/middleware.md");
  });

  it("returns empty results for no matches", () => {
    insertChunk(db, {
      docPath: "docs/routing.md",
      docTitle: "Routing",
      sectionTitle: "Basics",
      content: "Next.js uses a file-system based router.",
      tokens: 30,
    });
    rebuildFtsIndex(db);

    const result = search(db, "authentication");

    expect(result.results).toHaveLength(0);
  });

  it("respects token budget", () => {
    for (let i = 0; i < 5; i++) {
      insertChunk(db, {
        docPath: `docs/section${i}.md`,
        docTitle: `Section ${i}`,
        sectionTitle: "Overview",
        content: `This is documentation about middleware features part ${i}.`,
        tokens: 500,
      });
    }
    rebuildFtsIndex(db);

    const result = search(db, "middleware");

    expect(result.results.length).toBeLessThanOrEqual(4);
  });

  it("groups and orders chunks by document", () => {
    insertChunk(db, {
      docPath: "docs/middleware.md",
      docTitle: "Middleware",
      sectionTitle: "Configuration",
      content: "Configure middleware using matcher.",
      tokens: 30,
    });
    insertChunk(db, {
      docPath: "docs/middleware.md",
      docTitle: "Middleware",
      sectionTitle: "Introduction",
      content: "Middleware runs before requests.",
      tokens: 30,
    });
    rebuildFtsIndex(db);

    const result = search(db, "middleware");

    expect(result.results.every((r) => r.source === "docs/middleware.md")).toBe(
      true,
    );
  });

  it("handles empty query", () => {
    insertChunk(db, {
      docPath: "docs/test.md",
      docTitle: "Test",
      sectionTitle: "Section",
      content: "Some content",
      tokens: 10,
    });
    rebuildFtsIndex(db);

    const result = search(db, "   ");

    expect(result.results).toHaveLength(0);
  });

  it("handles special characters in query", () => {
    insertChunk(db, {
      docPath: "docs/api.md",
      docTitle: "API",
      sectionTitle: "Functions",
      content: "The getData function fetches data.",
      tokens: 20,
    });
    rebuildFtsIndex(db);

    const result = search(db, "getData()");

    expect(result.results).toHaveLength(1);
  });
});

describe("searchAll", () => {
  const TEST_DIR = join(tmpdir(), `context-searchall-test-${Date.now()}`);
  let store: PackageStore;

  function addLibrary(
    name: string,
    version: string,
    chunks: Array<{
      docPath: string;
      docTitle: string;
      sectionTitle: string;
      content: string;
      tokens: number;
    }>,
  ): void {
    const dbPath = join(TEST_DIR, `${name}@${version}.db`);
    const db = createTestDb(dbPath, { name, version });
    for (const chunk of chunks) {
      insertChunk(db, chunk);
    }
    rebuildFtsIndex(db);
    db.close();
    store.add(readPackageInfo(dbPath));
  }

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    store = new PackageStore();
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it("returns results from multiple libraries", () => {
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Overview",
        content:
          "Express middleware functions have access to request and response objects.",
        tokens: 40,
      },
    ]);
    addLibrary("passport", "0.7.0", [
      {
        docPath: "docs/authenticate.md",
        docTitle: "Authentication",
        sectionTitle: "Middleware",
        content:
          "Passport authenticate middleware handles authentication strategies.",
        tokens: 40,
      },
    ]);

    const result = searchAll(store, "middleware");

    expect(result.results.length).toBe(2);
    const libraries = result.results.map((r) => r.library);
    expect(libraries).toContain("express@4.21.0");
    expect(libraries).toContain("passport@0.7.0");
  });

  it("returns empty results when no libraries are installed", () => {
    const result = searchAll(store, "middleware");

    expect(result.results).toHaveLength(0);
  });

  it("returns empty results when no library matches", () => {
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/routing.md",
        docTitle: "Routing",
        sectionTitle: "Basics",
        content: "Express uses a routing system based on HTTP methods.",
        tokens: 30,
      },
    ]);

    const result = searchAll(store, "graphql federation");

    expect(result.results).toHaveLength(0);
  });

  it("normalizes scores so one library does not dominate", () => {
    // Library with many matching chunks (higher raw BM25 scores)
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Overview",
        content:
          "Express middleware functions handle middleware processing for middleware chains.",
        tokens: 40,
      },
      {
        docPath: "docs/middleware-guide.md",
        docTitle: "Middleware Guide",
        sectionTitle: "Advanced",
        content: "Advanced middleware patterns for middleware composition.",
        tokens: 40,
      },
    ]);
    // Library with one highly relevant chunk
    addLibrary("koa", "2.15.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Introduction",
        content: "Koa middleware uses async functions for middleware handling.",
        tokens: 40,
      },
    ]);

    const result = searchAll(store, "middleware");

    // Both libraries should be represented in results
    const libraries = new Set(result.results.map((r) => r.library));
    expect(libraries.size).toBeGreaterThanOrEqual(2);

    // All scores should be in [0, 1] range
    for (const r of result.results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it("respects global token budget across libraries", () => {
    // Fill two libraries with large chunks that exceed budget together
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Part 1",
        content: "Express middleware for handling requests.",
        tokens: 800,
      },
      {
        docPath: "docs/middleware2.md",
        docTitle: "Middleware",
        sectionTitle: "Part 2",
        content: "More express middleware documentation.",
        tokens: 800,
      },
    ]);
    addLibrary("passport", "0.7.0", [
      {
        docPath: "docs/strategy.md",
        docTitle: "Strategy",
        sectionTitle: "Middleware",
        content: "Passport middleware strategy for authentication.",
        tokens: 800,
      },
      {
        docPath: "docs/strategy2.md",
        docTitle: "Strategy",
        sectionTitle: "Middleware 2",
        content: "Additional passport middleware configuration.",
        tokens: 800,
      },
    ]);

    const result = searchAll(store, "middleware");

    // Total tokens should not exceed 2000 — at most 2 chunks of 800
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it("includes library name in each result", () => {
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/routing.md",
        docTitle: "Routing",
        sectionTitle: "Overview",
        content: "Express routing determines how an application responds.",
        tokens: 30,
      },
    ]);

    const result = searchAll(store, "routing");

    expect(result.results).toHaveLength(1);
    expect(result.results[0].library).toBe("express@4.21.0");
    expect(result.results[0].title).toContain("Routing");
  });

  it("formatSearchAllResult returns JSON with results array", () => {
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/routing.md",
        docTitle: "Routing",
        sectionTitle: "Overview",
        content: "Express routing determines how an application responds.",
        tokens: 30,
      },
    ]);

    const result = searchAll(store, "routing");
    const formatted = formatSearchAllResult(result);
    const parsed = JSON.parse(formatted);

    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].library).toBe("express@4.21.0");
    expect(parsed.results[0].title).toContain("Routing");
    expect(parsed.results[0].content).toBeTruthy();
    expect(parsed.results[0].source).toBeTruthy();
    expect(parsed.results[0].score).toBeTypeOf("number");
  });

  it("formatSearchAllResult returns message when no results", () => {
    const result = searchAll(store, "nonexistent-topic-xyz");
    const formatted = formatSearchAllResult(result);
    const parsed = JSON.parse(formatted);

    expect(parsed.results).toHaveLength(0);
    expect(parsed.message).toContain("No documentation found");
  });

  it("results are sorted by normalized score descending", () => {
    addLibrary("express", "4.21.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Overview",
        content: "Express middleware functions.",
        tokens: 30,
      },
    ]);
    addLibrary("koa", "2.15.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Overview",
        content: "Koa middleware functions.",
        tokens: 30,
      },
    ]);

    const result = searchAll(store, "middleware");

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].score).toBeLessThanOrEqual(
        result.results[i - 1].score,
      );
    }
  });
});
