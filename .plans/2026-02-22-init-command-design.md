# `agentshelf init` — Autodiscovery & Install

## Problem

Installing documentation packages requires manual `agentshelf add <url> --tag <version>` for each library. A project with 20+ dependencies means 20+ manual commands. There's no way to bootstrap a shelf from an existing project.

## Design

### Command

```
agentshelf init [--interactive] [--path <dir>]
```

- **No flags** — reads `package.json`, resolves all deps, installs docs automatically
- `--interactive` — shows checkbox selection via `@inquirer/prompts` before installing
- `--path <dir>` — project directory (default: `cwd`)

### Flow

```
1. Find and read package.json (dependencies + devDependencies)
2. Filter out packages already installed in agentshelf (match by name)
3. Resolve each dependency via npm registry → GitHub repo URL
4. For each resolved package:
   a. Shallow clone repo
   b. detectLocalDocsFolder() — look for docs/, documentation/, doc/
   c. If no docs folder → skip
   d. Build SQLite package + install to ~/.agentshelf/packages/
5. Print report (insight box on stderr)
```

### npm Registry Resolution

New module: `registry.ts`

```typescript
interface ResolvedPackage {
  name: string;
  version: string;
  repoUrl: string;
}

async function resolveNpmPackages(
  deps: Record<string, string>
): Promise<{ resolved: ResolvedPackage[]; unresolved: string[] }>
```

- Fetches `https://registry.npmjs.org/<pkg>/latest` for each dependency
- Extracts `repository.url` field
- Normalizes URL formats: `git+https://...`, `github:owner/repo`, `git://`, SSH
- Returns resolved (has repo URL) and unresolved (no repo or not on GitHub)

### Skip Logic

A dependency is skipped when:
- Already installed in agentshelf (name match, ignoring version)
- No `repository` field in npm registry response
- Repository URL is not a cloneable git URL
- Cloned repo has no detectable docs folder (`docs/`, `documentation/`, `doc/`)
- Clone or build fails (non-blocking — continues with other deps)

### Interactive Mode (`--interactive`)

Uses `@inquirer/prompts` checkbox to show resolved packages with docs. All selected by default. User deselects what they don't want, confirms, then installation proceeds.

### Report (stderr insight box)

```
★ AgentShelf init ─────────────────────────────
  Scanned: 24 dependencies
  Installed: 4 packages
  ● next@15.3.3 — 1285 sections
  ● payload@3.33.0 — 749 sections
  ● react@19.1.0 — 312 sections
  ● zod@3.24.0 — 89 sections
  Skipped: 18 (no docs), 2 (already installed)
──────────────────────────────────────────────────
```

### Error Handling

| Scenario | Behavior |
|----------|----------|
| `package.json` not found | Error with suggestion: `--path` or check cwd |
| npm registry unreachable | Error: "Cannot reach npm registry. Are you online?" |
| Single dep clone fails | Skip, log warning, continue with others |
| Zero docs installed | Suggestion: "Try: `agentshelf add <url>` for specific libraries" |

### Architecture

- **New file: `registry.ts`** — npm registry resolution, URL normalization
- **New file: `registry.test.ts`** — tests for resolution logic
- **Modified: `cli.ts`** — new `init` command wired to registry + existing `addFromGitClone` pipeline
- **Modified: `insight.ts`** — new `printInitInsight()` function for the report
- **No changes** to: search.ts, server.ts, store.ts, db.ts, git.ts, index.ts

### Scope

- **V1: npm only** (package.json). Python/Rust/Go deferred.
- **No curated registry** — pure heuristic via npm registry `repository` field.
- **Sequential clones** — parallel execution deferred as optimization.
