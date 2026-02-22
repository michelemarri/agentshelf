# search_all: Cross-Package Documentation Search

## Problem

The current `get_docs` tool requires the agent to specify which library to search.
When the agent doesn't know which library contains the answer, or when a topic spans
multiple libraries (e.g., "authentication middleware" across Express, Passport, jose),
it must make separate guesses — one query per library.

## Design

### New MCP Tool

```
Tool: search_all
Description: "Search across ALL installed documentation packages for a topic.
              Use when you don't know which library has the answer, or when
              a topic may span multiple libraries."
Parameters:
  - topic: string (required) — the search query
```

`get_docs` remains unchanged for targeted single-library queries.

### Algorithm

1. For each library in PackageStore:
   - Open DB, run `searchFts(db, topic)` → `ChunkMatch[]` with raw BM25 scores
   - Close DB
2. Normalize scores per-library using min-max: `(score - min) / (max - min)` → [0, 1]
   - Libraries with a single result get `normalizedScore = 1.0`
3. Merge all results into a single array, sorted by normalized score DESC
4. Apply `filterByRelevance` on normalized scores (RELEVANCE_DROP = 0.5)
5. Apply `applyTokenBudget` (MAX_TOKENS = 2000 global)
6. Assemble results with library name in each snippet

### Changes

**`search.ts`**
- Export `searchFts` (currently private) — needed to get raw ChunkMatch[] per library
- Add `SearchAllResult` interface
- Add `searchAll(store: PackageStore, topic: string): SearchAllResult` function
- Add `normalizeScores()` helper for min-max normalization

**`server.ts`**
- Register `search_all` tool alongside `get_docs`
- `search_all` is always registered (even with 0 packages — returns empty results)

**`index.ts`**
- Export `SearchAllResult` type

**No changes to:** `store.ts`, `db.ts`, `build.ts`, `cli.ts`, `git.ts`

### Output Format

```typescript
interface SearchAllResult {
  results: Array<{
    library: string;    // "express@4.21.0"
    title: string;      // "Authentication > Middleware"
    content: string;
    source: string;
    score: number;      // 0..1 normalized
  }>;
}
```

### Edge Cases

- **0 libraries installed** → `{ results: [] }`
- **No match in any library** → `{ results: [] }`
- **Library with 1 result** → normalizedScore = 1.0
- **All results from one library** → allowed, budget is global

## Progress

| # | Task | Status |
|---|------|--------|
| 1 | Export `searchFts` from search.ts, add `searchAll` + `normalizeScores` | pending |
| 2 | Register `search_all` tool in server.ts | pending |
| 3 | Export new types from index.ts | pending |
| 4 | Add unit tests for `searchAll` in search.test.ts | pending |
| 5 | Add integration test for `search_all` tool in server.test.ts | pending |
| 6 | Run full test suite + lint + build | pending |
