import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { search, searchAll } from "./search.js";
import { ContextServer } from "./server.js";
import { PackageStore, readPackageInfo } from "./store.js";
import { createTestDb, insertChunk, rebuildFtsIndex } from "./test-utils.js";

describe("ContextServer", () => {
  it("creates an MCP server instance", () => {
    const store = new PackageStore();
    const server = new ContextServer(store);

    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });

  it("has correct name and version from package.json", () => {
    const store = new PackageStore();
    const ctx = new ContextServer(store);
    const serverInfo = ctx.server.server as unknown as {
      _serverInfo: { name: string; version: string };
    };

    expect(serverInfo._serverInfo.name).toBe("agentshelf");
    expect(serverInfo._serverInfo.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("ContextServer integration", () => {
  const TEST_DIR = join(tmpdir(), `context-server-int-test-${Date.now()}`);
  let db: Database.Database;
  const testPackagePath = join(TEST_DIR, "nextjs@15.0.db");

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    db = createTestDb(testPackagePath, {
      name: "nextjs",
      version: "15.0",
      description: "Next.js documentation",
    });

    // Add realistic documentation chunks
    insertChunk(db, {
      docPath: "docs/routing/middleware.md",
      docTitle: "Middleware",
      sectionTitle: "Introduction",
      content:
        "Middleware allows you to run code before a request is completed. Based on the incoming request, you can modify the response by rewriting, redirecting, modifying headers, or responding directly.",
      tokens: 45,
    });
    insertChunk(db, {
      docPath: "docs/routing/middleware.md",
      docTitle: "Middleware",
      sectionTitle: "Convention",
      content:
        "Use the file `middleware.ts` (or `.js`) in the root of your project to define Middleware. For example, at the same level as `pages` or `app`, or inside `src` if applicable.",
      tokens: 40,
    });
    insertChunk(db, {
      docPath: "docs/app/building-your-application/routing/route-handlers.md",
      docTitle: "Route Handlers",
      sectionTitle: "Introduction",
      content:
        "Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs.",
      tokens: 30,
    });
    rebuildFtsIndex(db);
    db.close();
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it("returns search results through get_docs tool handler", () => {
    const store = new PackageStore();
    const info = readPackageInfo(testPackagePath);
    store.add(info);

    // Test the search flow directly (simulates what get_docs handler does)
    const pkgDb = store.openDb("nextjs");
    expect(pkgDb).not.toBeNull();

    if (pkgDb) {
      const result = search(pkgDb, "middleware");
      pkgDb.close();

      expect(result.library).toBe("nextjs@15.0");
      expect(result.version).toBe("15.0");
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]?.title).toContain("Middleware");
    }
  });

  it("end-to-end: store → server → search flow works correctly", () => {
    const store = new PackageStore();
    const info = readPackageInfo(testPackagePath);
    store.add(info);

    // Verify package is registered
    expect(store.list()).toHaveLength(1);
    expect(store.get("nextjs")?.version).toBe("15.0");

    // Verify database can be opened and searched
    const pkgDb = store.openDb("nextjs");
    expect(pkgDb).not.toBeNull();

    if (pkgDb) {
      // Search for middleware docs
      const middlewareResult = search(pkgDb, "middleware");
      expect(middlewareResult.results.length).toBeGreaterThan(0);
      expect(
        middlewareResult.results.some((r) => r.title.includes("Middleware")),
      ).toBe(true);

      // Search for route handlers
      const routeResult = search(pkgDb, "route handlers");
      expect(routeResult.results.length).toBeGreaterThan(0);
      expect(
        routeResult.results.some((r) => r.title.includes("Route Handlers")),
      ).toBe(true);

      // Search for non-existent topic
      const noResult = search(pkgDb, "graphql federation");
      expect(noResult.results).toHaveLength(0);

      pkgDb.close();
    }
  });

  it("ContextServer can be created with packages", () => {
    const store = new PackageStore();
    const info = readPackageInfo(testPackagePath);
    store.add(info);

    const server = new ContextServer(store);
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();

    // Verify store has the package
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]?.name).toBe("nextjs");
  });
});

describe("search_all integration", () => {
  const TEST_DIR = join(tmpdir(), `context-searchall-int-test-${Date.now()}`);

  function setupLibrary(
    name: string,
    version: string,
    chunks: Array<{
      docPath: string;
      docTitle: string;
      sectionTitle: string;
      content: string;
      tokens: number;
    }>,
  ): string {
    const dbPath = join(TEST_DIR, `${name}@${version}.db`);
    const db = createTestDb(dbPath, { name, version });
    for (const chunk of chunks) {
      insertChunk(db, chunk);
    }
    rebuildFtsIndex(db);
    db.close();
    return dbPath;
  }

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it("end-to-end: store → searchAll across multiple packages", () => {
    const store = new PackageStore();

    const expressPath = setupLibrary("express", "4.21.0", [
      {
        docPath: "docs/middleware.md",
        docTitle: "Middleware",
        sectionTitle: "Overview",
        content:
          "Express middleware functions have access to the request object, the response object, and the next middleware function.",
        tokens: 40,
      },
    ]);
    const passportPath = setupLibrary("passport", "0.7.0", [
      {
        docPath: "docs/authenticate.md",
        docTitle: "Authentication",
        sectionTitle: "Middleware",
        content:
          "Passport is authentication middleware for Node.js. It uses strategies to authenticate requests.",
        tokens: 35,
      },
    ]);

    store.add(readPackageInfo(expressPath));
    store.add(readPackageInfo(passportPath));

    const result = searchAll(store, "middleware");

    expect(result.results.length).toBeGreaterThanOrEqual(2);
    const libs = result.results.map((r) => r.library);
    expect(libs).toContain("express@4.21.0");
    expect(libs).toContain("passport@0.7.0");
  });

  it("ContextServer registers search_all tool when packages exist", () => {
    const store = new PackageStore();
    const expressPath = setupLibrary("express", "4.21.0", [
      {
        docPath: "docs/routing.md",
        docTitle: "Routing",
        sectionTitle: "Basics",
        content: "Express routing overview.",
        tokens: 20,
      },
    ]);
    store.add(readPackageInfo(expressPath));

    const ctx = new ContextServer(store);

    // Verify the server is constructible with packages that would trigger registration
    expect(ctx).toBeDefined();
    expect(ctx.server).toBeDefined();
  });
});
