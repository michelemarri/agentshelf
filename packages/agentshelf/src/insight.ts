import type { SearchAllResult } from "./search.js";

const TOP_LINE = "★ AgentShelf ──────────────────────────────────";
const BOTTOM_LINE = "──────────────────────────────────────────────────";
const MAX_TITLE_LENGTH = 55;
const CHARS_PER_TOKEN = 4;
const TOKEN_BUDGET = 2000;

interface QueryResult {
  library: string;
  version: string;
  results: Array<{
    title: string;
    content: string;
    source: string;
  }>;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3)}...`;
}

function formatTokens(totalChars: number): string {
  const tokens = Math.round(totalChars / CHARS_PER_TOKEN);
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K / ${TOKEN_BUDGET / 1000}K`;
  }
  return `${tokens} / ${TOKEN_BUDGET / 1000}K`;
}

function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

export function printSearchAllInsight(
  result: SearchAllResult,
  packageCount: number,
): void {
  console.error(TOP_LINE);

  if (result.results.length === 0) {
    console.error(
      `  No results found across ${packageCount} ${plural(packageCount, "library", "libraries")}`,
    );
    console.error("  Try: broader keywords, check `agentshelf list`");
    console.error(BOTTOM_LINE);
    return;
  }

  // Group results by library
  const byLibrary = new Map<string, string[]>();
  let totalChars = 0;
  for (const r of result.results) {
    const titles = byLibrary.get(r.library) ?? [];
    titles.push(r.title);
    byLibrary.set(r.library, titles);
    totalChars += r.content.length;
  }

  const libraryCount = byLibrary.size;
  const resultCount = result.results.length;

  console.error(
    `  ${resultCount} ${plural(resultCount, "result", "results")} across ${libraryCount} ${plural(libraryCount, "library", "libraries")}`,
  );

  for (const [library, titles] of byLibrary) {
    const first = titles[0] ?? "";
    const firstTitle = truncate(first, MAX_TITLE_LENGTH);
    if (titles.length === 1) {
      console.error(`  ● ${library} — ${firstTitle}`);
    } else {
      console.error(`  ● ${library} — ${firstTitle} (${titles.length})`);
    }
  }

  console.error(`  Tokens: ${formatTokens(totalChars)}`);
  console.error(BOTTOM_LINE);
}

export function printQueryInsight(result: QueryResult): void {
  console.error(TOP_LINE);

  if (result.results.length === 0) {
    console.error(`  No results in ${result.library}`);
    console.error("  Try: different keywords, check spelling");
    console.error(BOTTOM_LINE);
    return;
  }

  const resultCount = result.results.length;
  let totalChars = 0;

  console.error(
    `  ${resultCount} ${plural(resultCount, "result", "results")} in ${result.library}`,
  );

  for (const r of result.results) {
    console.error(`  ● ${truncate(r.title, MAX_TITLE_LENGTH)}`);
    totalChars += r.content.length;
  }

  console.error(`  Tokens: ${formatTokens(totalChars)}`);
  console.error(BOTTOM_LINE);
}

export interface InitReport {
  scanned: number;
  installed: Array<{ name: string; version: string; sections: number }>;
  skippedNoDocs: number;
  skippedAlreadyInstalled: number;
  skippedNoRepo: number;
}

export function printInitInsight(report: InitReport): void {
  console.error(TOP_LINE.replace("AgentShelf", "AgentShelf init"));

  console.error(
    `  Scanned: ${report.scanned} ${plural(report.scanned, "dependency", "dependencies")}`,
  );
  console.error(
    `  Installed: ${report.installed.length} ${plural(report.installed.length, "package", "packages")}`,
  );

  for (const pkg of report.installed) {
    console.error(`  ● ${pkg.name}@${pkg.version} — ${pkg.sections} sections`);
  }

  const skippedParts: string[] = [];
  if (report.skippedNoDocs > 0)
    skippedParts.push(`${report.skippedNoDocs} no docs`);
  if (report.skippedAlreadyInstalled > 0)
    skippedParts.push(`${report.skippedAlreadyInstalled} already installed`);
  if (report.skippedNoRepo > 0)
    skippedParts.push(`${report.skippedNoRepo} no repo`);

  if (skippedParts.length > 0) {
    console.error(`  Skipped: ${skippedParts.join(", ")}`);
  }

  if (report.installed.length === 0) {
    console.error("  Try: agentshelf add <github-url> for specific libraries");
  }

  console.error(BOTTOM_LINE);
}
