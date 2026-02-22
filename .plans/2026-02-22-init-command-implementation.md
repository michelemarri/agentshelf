# `agentshelf init` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an `agentshelf init` command that reads `package.json`, resolves dependencies via the npm registry, and auto-installs documentation for libraries that have a `docs/` folder.

**Architecture:** New `registry.ts` module handles npm registry resolution (name → repo URL). The `init` command in `cli.ts` orchestrates: read package.json → resolve → clone+build each. Reuses existing `addFromGitClone` pipeline (clone, detect docs, build package). New `printInitInsight()` in `insight.ts` for the report.

**Tech Stack:** TypeScript, node:fetch (npm registry API), existing git.ts/build pipeline, vitest for tests.

---

### Task 1: Create `registry.ts` — npm registry resolution

**Files:**
- Create: `packages/agentshelf/src/registry.ts`
- Test: `packages/agentshelf/src/registry.test.ts`

**Step 1: Write the failing tests**

Create `packages/agentshelf/src/registry.test.ts`:

```typescript
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
    const result = parseNpmRepositoryField(
      "https://github.com/vercel/next.js",
    );
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
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/agentshelf && pnpm test -- registry.test`
Expected: FAIL — cannot find `./registry.js`

**Step 3: Write minimal implementation**

Create `packages/agentshelf/src/registry.ts`:

```typescript
/**
 * Normalize npm repository URLs to cloneable HTTPS format.
 * Handles: git+https://, git://, git@host:, .git suffix, GitHub shorthand.
 */
export function normalizeRepoUrl(url: string): string {
  let normalized = url;

  // git+https://... → https://...
  normalized = normalized.replace(/^git\+/, "");

  // git://... → https://...
  normalized = normalized.replace(/^git:\/\//, "https://");

  // git@host:user/repo → https://host/user/repo
  const sshMatch = normalized.match(/^git@([^:]+):(.+)$/);
  if (sshMatch?.[1] && sshMatch[2]) {
    normalized = `https://${sshMatch[1]}/${sshMatch[2]}`;
  }

  // Strip .git suffix
  normalized = normalized.replace(/\.git$/, "");

  return normalized;
}

/**
 * Parse the `repository` field from an npm package's registry response.
 * Handles: object `{ type, url }`, string URL, GitHub shorthand `owner/repo`.
 */
export function parseNpmRepositoryField(
  field: unknown,
): string | null {
  if (field == null) return null;

  let raw: string;

  if (typeof field === "string") {
    raw = field;
  } else if (typeof field === "object" && "url" in (field as Record<string, unknown>)) {
    raw = String((field as Record<string, unknown>).url);
  } else {
    return null;
  }

  // GitHub shorthand: "github:owner/repo" or "owner/repo"
  raw = raw.replace(/^github:/, "");
  if (/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(raw)) {
    return `https://github.com/${raw}`;
  }

  return normalizeRepoUrl(raw);
}

export interface ResolvedPackage {
  name: string;
  version: string;
  repoUrl: string;
}

/**
 * Resolve npm package names to GitHub repository URLs via the npm registry.
 */
export async function resolveNpmPackages(
  deps: Record<string, string>,
): Promise<{ resolved: ResolvedPackage[]; unresolved: string[] }> {
  const resolved: ResolvedPackage[] = [];
  const unresolved: string[] = [];

  for (const name of Object.keys(deps)) {
    try {
      const response = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,
      );
      if (!response.ok) {
        unresolved.push(name);
        continue;
      }
      const data = (await response.json()) as {
        version?: string;
        repository?: unknown;
      };
      const repoUrl = parseNpmRepositoryField(data.repository);
      if (!repoUrl) {
        unresolved.push(name);
        continue;
      }
      resolved.push({
        name,
        version: data.version ?? "latest",
        repoUrl,
      });
    } catch {
      unresolved.push(name);
    }
  }

  return { resolved, unresolved };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/agentshelf && pnpm test -- registry.test`
Expected: PASS (all 9 tests)

**Step 5: Fix lint**

Run: `cd packages/agentshelf && pnpm fix && pnpm lint`

**Step 6: Commit**

```bash
git add packages/agentshelf/src/registry.ts packages/agentshelf/src/registry.test.ts
git commit -m "feat(init): add npm registry resolution module"
```

---

### Task 2: Add `printInitInsight()` to insight.ts

**Files:**
- Modify: `packages/agentshelf/src/insight.ts`
- Modify: `packages/agentshelf/src/insight.test.ts`

**Step 1: Write the failing tests**

Add to `packages/agentshelf/src/insight.test.ts`:

```typescript
import { printInitInsight } from "./insight.js";
import type { InitReport } from "./insight.js";

describe("printInitInsight", () => {
  // ... same beforeEach/afterEach as existing tests ...

  it("shows installed packages with sections", () => {
    const report: InitReport = {
      scanned: 24,
      installed: [
        { name: "next", version: "15.3.3", sections: 1285 },
        { name: "payload", version: "3.33.0", sections: 749 },
      ],
      skippedNoDocs: 18,
      skippedAlreadyInstalled: 2,
      skippedNoRepo: 2,
    };

    printInitInsight(report);

    const output = stderrOutput.join("\n");
    expect(output).toContain("Scanned: 24 dependencies");
    expect(output).toContain("Installed: 2 packages");
    expect(output).toContain("next@15.3.3 — 1285 sections");
    expect(output).toContain("payload@3.33.0 — 749 sections");
    expect(output).toContain("Skipped:");
  });

  it("shows zero installs with suggestion", () => {
    const report: InitReport = {
      scanned: 10,
      installed: [],
      skippedNoDocs: 8,
      skippedAlreadyInstalled: 2,
      skippedNoRepo: 0,
    };

    printInitInsight(report);

    const output = stderrOutput.join("\n");
    expect(output).toContain("Installed: 0 packages");
    expect(output).toContain("Try:");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/agentshelf && pnpm test -- insight.test`
Expected: FAIL — `printInitInsight` / `InitReport` not exported

**Step 3: Implement printInitInsight**

Add to `packages/agentshelf/src/insight.ts`:

```typescript
export interface InitReport {
  scanned: number;
  installed: Array<{ name: string; version: string; sections: number }>;
  skippedNoDocs: number;
  skippedAlreadyInstalled: number;
  skippedNoRepo: number;
}

export function printInitInsight(report: InitReport): void {
  console.error(TOP_LINE.replace("AgentShelf", "AgentShelf init"));

  console.error(`  Scanned: ${report.scanned} ${plural(report.scanned, "dependency", "dependencies")}`);
  console.error(`  Installed: ${report.installed.length} ${plural(report.installed.length, "package", "packages")}`);

  for (const pkg of report.installed) {
    console.error(`  ● ${pkg.name}@${pkg.version} — ${pkg.sections} sections`);
  }

  const skippedParts: string[] = [];
  if (report.skippedNoDocs > 0) skippedParts.push(`${report.skippedNoDocs} no docs`);
  if (report.skippedAlreadyInstalled > 0) skippedParts.push(`${report.skippedAlreadyInstalled} already installed`);
  if (report.skippedNoRepo > 0) skippedParts.push(`${report.skippedNoRepo} no repo`);

  if (skippedParts.length > 0) {
    console.error(`  Skipped: ${skippedParts.join(", ")}`);
  }

  if (report.installed.length === 0) {
    console.error("  Try: agentshelf add <github-url> for specific libraries");
  }

  console.error(BOTTOM_LINE);
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/agentshelf && pnpm test -- insight.test`
Expected: PASS (8 tests — 6 existing + 2 new)

**Step 5: Commit**

```bash
git add packages/agentshelf/src/insight.ts packages/agentshelf/src/insight.test.ts
git commit -m "feat(init): add printInitInsight report function"
```

---

### Task 3: Wire `init` command into cli.ts

**Files:**
- Modify: `packages/agentshelf/src/cli.ts`

This task reuses existing `addFromGitClone` pipeline internals. The `init` command needs to:
1. Read `package.json` from cwd (or `--path`)
2. Filter already-installed packages
3. Resolve via npm registry
4. For each: clone → detect docs → build → install
5. Print report

**Step 1: Add the init command**

Add after the existing `search-all` command block in `cli.ts` (around line 810):

```typescript
import { resolveNpmPackages } from "./registry.js";
import { printInitInsight } from "./insight.js";
import type { InitReport } from "./insight.js";
```

Command definition:

```typescript
program
  .command("init")
  .description(
    "Auto-discover project dependencies and install their documentation",
  )
  .option("--interactive", "Select which packages to install")
  .option("--path <dir>", "Project directory (default: current directory)")
  .action(async (options: { interactive?: boolean; path?: string }) => {
    try {
      const projectDir = resolve(options.path ?? ".");
      const pkgJsonPath = join(projectDir, "package.json");

      if (!existsSync(pkgJsonPath)) {
        console.error(
          `Error: No package.json found in ${projectDir}\nUse --path to specify the project directory.`,
        );
        process.exit(1);
      }

      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      const allDeps: Record<string, string> = {
        ...(pkgJson.dependencies ?? {}),
        ...(pkgJson.devDependencies ?? {}),
      };

      const depNames = Object.keys(allDeps);
      if (depNames.length === 0) {
        console.error("No dependencies found in package.json.");
        process.exit(1);
      }

      console.log(`Found ${depNames.length} dependencies in package.json`);

      // Filter already installed
      const store = new PackageStore();
      loadPackages(store);
      const installedNames = new Set(store.list().map((p) => p.name));
      const skippedAlreadyInstalled = depNames.filter((n) =>
        installedNames.has(n),
      ).length;
      const depsToResolve: Record<string, string> = {};
      for (const [name, version] of Object.entries(allDeps)) {
        if (!installedNames.has(name)) {
          depsToResolve[name] = version;
        }
      }

      if (Object.keys(depsToResolve).length === 0) {
        console.log("All dependencies already installed.");
        return;
      }

      // Resolve via npm registry
      console.log("Resolving repositories from npm registry...");
      const { resolved, unresolved } =
        await resolveNpmPackages(depsToResolve);

      if (resolved.length === 0) {
        console.error("No resolvable repositories found.");
        return;
      }

      console.log(
        `Resolved ${resolved.length} repositories (${unresolved.length} without repo)`,
      );

      // Interactive selection
      let toInstall = resolved;
      if (options.interactive && isInteractive()) {
        const { checkbox } = await import("@inquirer/prompts");
        const selected = await checkbox({
          message: "Select packages to install:",
          choices: resolved.map((pkg) => ({
            name: `${pkg.name}@${pkg.version} (${pkg.repoUrl})`,
            value: pkg,
            checked: true,
          })),
        });
        toInstall = selected;
      }

      // Install each package
      const report: InitReport = {
        scanned: depNames.length,
        installed: [],
        skippedNoDocs: 0,
        skippedAlreadyInstalled,
        skippedNoRepo: unresolved.length,
      };

      for (const pkg of toInstall) {
        console.log(`\n[${pkg.name}] Cloning ${pkg.repoUrl}...`);
        try {
          const { tempDir, cleanup } = cloneRepository(pkg.repoUrl);
          try {
            // Detect version from tags
            const repoName = extractRepoName(pkg.repoUrl);
            const version = detectVersion(tempDir, repoName);

            // Detect docs folder
            const docsFolder = detectLocalDocsFolder(tempDir);
            if (!docsFolder) {
              console.log(`[${pkg.name}] No docs folder found, skipping`);
              report.skippedNoDocs++;
              continue;
            }

            console.log(`[${pkg.name}] Found docs at /${docsFolder}`);

            // Read markdown files
            const files = readLocalDocsFiles(tempDir, { path: docsFolder });
            if (files.length === 0) {
              console.log(`[${pkg.name}] No markdown files found, skipping`);
              report.skippedNoDocs++;
              continue;
            }

            // Build and install
            ensureDataDir();
            const packageName = repoName;
            const outputPath = join(
              DATA_DIR,
              `${packageName}@${version}.db`,
            );

            const result = buildPackage(outputPath, files, {
              name: packageName,
              version,
              sourceUrl: pkg.repoUrl,
            });

            console.log(
              `[${pkg.name}] Installed: ${packageName}@${version} (${result.sectionCount} sections)`,
            );
            report.installed.push({
              name: packageName,
              version,
              sections: result.sectionCount,
            });
          } finally {
            cleanup();
          }
        } catch (err) {
          console.log(
            `[${pkg.name}] Failed: ${err instanceof Error ? err.message : err}`,
          );
          report.skippedNoDocs++;
        }
      }

      // Print report
      printInitInsight(report);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  });
```

Note: `existsSync`, `readFileSync` from `node:fs` and `resolve`, `join` from `node:path` are already imported in cli.ts. `cloneRepository`, `detectLocalDocsFolder`, `readLocalDocsFiles`, `extractRepoName`, `detectVersion` are already imported from `./git.js`. `buildPackage` is already imported from `./package-builder.js`. `isInteractive` is already defined in cli.ts. `ensureDataDir`, `loadPackages`, `DATA_DIR` are already defined in cli.ts.

**Step 2: Build and verify**

Run: `cd packages/agentshelf && pnpm build`
Expected: Build succeeds

**Step 3: Smoke test**

Run: `agentshelf init --help`
Expected: Shows init command with `--interactive` and `--path` options

**Step 4: Fix lint**

Run: `cd packages/agentshelf && pnpm fix && pnpm lint`

**Step 5: Commit**

```bash
git add packages/agentshelf/src/cli.ts
git commit -m "feat: add init command with npm autodiscovery"
```

---

### Task 4: End-to-end test in a real project

**Step 1: Test in metodo.dev project**

Run: `agentshelf init --path /Users/michelemarri/Sites/metodo.dev/frontend 2>&1`

Expected: scans package.json, resolves repos, installs docs for libraries with docs/, prints report.

**Step 2: Verify installed packages**

Run: `agentshelf list`

Expected: shows newly installed packages alongside previously installed ones.

**Step 3: Fix any issues found during e2e testing**

Iterate as needed.

**Step 4: Final build + test + lint**

Run: `cd packages/agentshelf && pnpm build && pnpm test && pnpm lint`
Expected: all green

**Step 5: Commit and push**

```bash
git add -A
git commit -m "feat: agentshelf init — autodiscovery and install from package.json"
git push
```
