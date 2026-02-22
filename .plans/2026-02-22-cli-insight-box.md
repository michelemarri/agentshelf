# CLI Insight Box

## Problem

When running `agentshelf query` or `agentshelf search-all` from the terminal, the user sees raw JSON — no summary, no orientation. The value agentshelf provides (cross-library search, score normalization, token budgeting) is invisible.

## Design

Add a visual insight box printed to **stderr** before the JSON output on stdout. This follows Unix conventions (data on stdout, info on stderr) and doesn't break JSON parsing.

### Output Examples

**search-all** (cross-package):
```
★ AgentShelf ──────────────────────────────────
  3 results across 2 libraries
  ● next@15.3.3 — Middleware, Authentication (2)
  ● payload@3.33.0 — Custom Endpoints (1)
  Tokens: 1.8K / 2K
──────────────────────────────────────────────────
```

**query** (single library):
```
★ AgentShelf ──────────────────────────────────
  2 results in next@15.3.3
  ● Middleware > Producing a Response
  ● Authentication > Authorization
  Tokens: 1.2K / 2K
──────────────────────────────────────────────────
```

**No results**:
```
★ AgentShelf ──────────────────────────────────
  No results found across 3 libraries
  Try: broader keywords, check `agentshelf list`
──────────────────────────────────────────────────
```

### Architecture

- New file `insight.ts` with two functions: `printSearchAllInsight()` and `printQueryInsight()`
- Called from `cli.ts` before JSON output
- Prints to `process.stderr` — zero impact on stdout JSON
- Token estimation: `content.length / 4` (avoids touching search.ts interfaces)
- Section titles truncated at ~60 chars
- **No changes** to search.ts, server.ts, index.ts, or MCP tool responses

### Changes

**New: `insight.ts`**
- `printSearchAllInsight(result: SearchAllResult, packageCount: number): void`
- `printQueryInsight(result: SearchResult): void`
- Helper: `formatTokens(chars: number): string` — converts char count to "1.2K / 2K"
- Helper: `truncate(str: string, max: number): string`

**Modified: `cli.ts`**
- Import and call `printSearchAllInsight()` in `search-all` command
- Import and call `printQueryInsight()` in `query` command

### Tests

- `insight.test.ts`: intercept `console.error`, verify output for multi-result, single-result, zero-result, title truncation

## Progress

| # | Task | Status |
|---|------|--------|
| 1 | Create `insight.ts` with `printSearchAllInsight` and `printQueryInsight` | pending |
| 2 | Add tests in `insight.test.ts` | pending |
| 3 | Wire into `cli.ts` for both commands | pending |
| 4 | Build + test + lint | pending |
