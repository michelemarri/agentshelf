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
export function parseNpmRepositoryField(field: unknown): string | null {
  if (field == null) return null;

  let raw: string;

  if (typeof field === "string") {
    raw = field;
  } else if (
    typeof field === "object" &&
    "url" in (field as Record<string, unknown>)
  ) {
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
