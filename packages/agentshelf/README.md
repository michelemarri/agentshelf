<p align="center">
  <h1 align="center">AgentShelf</h1>
  <p align="center">
    <strong>Put docs on the shelf. Your agent knows where to look.</strong><br/>
    Local-first library documentation for AI agents—offline, instant, private.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@michelemarri/agentshelf"><img src="https://img.shields.io/npm/v/@michelemarri/agentshelf.svg" alt="npm version"></a>
  <a href="https://github.com/michelemarri/agentshelf/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"></a>
</p>

---

## The Problem

You're building with Next.js 16, and your AI assistant confidently suggests code using the old Pages Router because that's what it learned from training data. You paste the docs. It hallucinates anyway. You paste more docs. The context window fills up. Repeat.

**AI assistants are powerful, but they're stuck in the past.** Their training data is months or years old, and they don't know the specifics of the libraries you're using today.

---

## The Solution

AgentShelf connects your AI assistant directly to up-to-date documentation—locally, instantly, and privately.

```
You: "How do I create middleware in Next.js 16?"

AI:  [automatically queries local docs]
     "In Next.js 16, create a middleware.ts file in your project root..."
     [accurate, version-specific answer]
```

No copy-pasting. No hallucinations about deprecated APIs. No waiting for cloud lookups.

<p align="center">
  <img src="https://media.githubusercontent.com/media/michelemarri/agentshelf/main/packages/agentshelf/assets/ai-sdk-demo.gif" alt="AgentShelf demo" width="800">
</p>

---

## Real-World Use Cases

### :muscle: "Make my AI actually useful for the stack I use"

Add docs for your entire tech stack. Your AI assistant becomes an expert in the exact versions you're using:

```bash
agentshelf add https://github.com/vercel/next.js
agentshelf add https://github.com/prisma/prisma
agentshelf add https://github.com/tailwindlabs/tailwindcss
```

Now ask things like:
- *"How do I set up Prisma with Next.js App Router?"*
- *"What's the Tailwind config for dark mode?"*
- *"Show me the new Server Actions syntax"*

### :building_construction: "Stop answering the same questions for my team"

Building an internal library? Package your documentation once, share it with your team:

```bash
# Build docs from your repo
agentshelf add https://github.com/your-company/design-system

# Your whole team can now ask:
# "How do I use the DataTable component?"
# "What props does Button accept?"
```

### :airplane: "Code on flights and in coffee shops"

AgentShelf works 100% offline. Download docs once, query forever—no internet required.

### :lock: "Keep proprietary code discussions private"

Cloud documentation services see your queries. AgentShelf runs entirely on your machine. Your questions about internal APIs stay internal.

---

## Why AgentShelf Over Cloud Alternatives?

| | Context7 | Deepcon | **AgentShelf** |
|---|:---:|:---:|:---:|
| **Price** | $10/month | $8/month | **Free forever** |
| **Free tier** | 1,000 req/month | 100 req/month | **Unlimited** |
| **Rate limits** | 60 req/hour | Throttled | **None** |
| **Latency** | 100-500ms | 100-300ms | **<10ms** |
| **Works offline** | :x: | :x: | :white_check_mark: |
| **Privacy** | Queries sent to cloud | Queries sent to cloud | **100% local** |
| **Private repos** | $15/1M tokens | :x: | **Free** |
| **Cross-library search** | :x: | :x: | :white_check_mark: |

---

## :zap: Key Features

- **Two tools** - `get_docs` for targeted search, `search_all` for cross-library discovery
- **Cross-library search** - Don't know which library has the answer? `search_all` searches everywhere at once
- **Token-aware** - Smart relevance filtering with per-library score normalization, never overwhelms the context window
- **Dynamic schema** - Available libraries shown in tool definition
- **Offline-first** - Zero network calls during operation
- **SQLite + FTS5** - Fast full-text search with stemming

---

## :rocket: Quick Start

### 1. Install

```bash
npm install -g @michelemarri/agentshelf
```

### 2. Add documentation

```bash
# From any git repository (GitHub, GitLab, Bitbucket, etc.)
agentshelf add https://github.com/vercel/next.js
agentshelf add https://gitlab.com/org/repo
agentshelf add git@github.com:user/repo.git

# From a local directory
agentshelf add ./my-project
agentshelf add /path/to/docs

# From URL (pre-built package)
agentshelf add https://example.com/react@18.db

# From local file
agentshelf add ./my-package.db
```

### 3. Configure your AI agent

AgentShelf works with any MCP-compatible agent. Choose your setup below:

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add agentshelf -- agentshelf serve
```

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your config file:
- **Linux**: `~/.config/claude/claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentshelf": {
      "command": "agentshelf",
      "args": ["serve"]
    }
  }
}
```

Restart Claude Desktop to apply changes.

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-specific):

```json
{
  "mcpServers": {
    "agentshelf": {
      "command": "agentshelf",
      "args": ["serve"]
    }
  }
}
```

Or use **Settings > Developer > Edit Config** to add the server through the UI.

</details>

<details>
<summary><strong>VS Code (GitHub Copilot)</strong></summary>

> Requires VS Code 1.102+ with GitHub Copilot

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "agentshelf": {
      "type": "stdio",
      "command": "agentshelf",
      "args": ["serve"]
    }
  }
}
```

Click the **Start** button that appears in the file, then use Agent mode in Copilot Chat.

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:
- **Windows**: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

```json
{
  "mcpServers": {
    "agentshelf": {
      "command": "agentshelf",
      "args": ["serve"]
    }
  }
}
```

Or access via **Windsurf Settings > Cascade > MCP Servers**.

</details>

<details>
<summary><strong>Zed</strong></summary>

Add to your Zed settings (`cmd+,` or `ctrl+,`):

```json
{
  "context_servers": {
    "agentshelf": {
      "command": {
        "path": "agentshelf",
        "args": ["serve"]
      }
    }
  }
}
```

Check the Agent Panel settings to verify the server shows a green indicator.

</details>

<details>
<summary><strong>Goose</strong></summary>

Run `goose configure` and select **Command-line Extension**, or add directly to `~/.config/goose/config.yaml`:

```yaml
extensions:
  agentshelf:
    type: stdio
    command: agentshelf
    args:
      - serve
    timeout: 300
```

</details>

### 4. Start using it

That's it! Now just ask your AI agent:

> "How do I create middleware in Next.js?"

The agent automatically uses the `get_docs` tool for targeted queries and `search_all` when a topic might span multiple libraries.

---

## :books: CLI Reference

### `agentshelf add <source>`

Install a documentation package. The source type is auto-detected.

**From git repository:**

Works with GitHub, GitLab, Bitbucket, Codeberg, or any git URL:

```bash
# HTTPS URLs
agentshelf add https://github.com/vercel/next.js
agentshelf add https://gitlab.com/org/repo
agentshelf add https://bitbucket.org/org/repo

# Specific tag or branch
agentshelf add https://github.com/vercel/next.js/tree/v16.0.0

# SSH URLs
agentshelf add git@github.com:user/repo.git
agentshelf add ssh://git@github.com/user/repo.git

# Custom options
agentshelf add https://github.com/vercel/next.js --path packages/docs --name nextjs
```

**From local directory:**

Build a package from documentation in a local folder:

```bash
# Auto-detects docs folder (docs/, documentation/, doc/)
agentshelf add ./my-project

# Specify docs path explicitly
agentshelf add /path/to/repo --path docs

# Custom package name and version
agentshelf add ./my-lib --name my-library --pkg-version 1.0.0
```

| Option | Description |
|--------|-------------|
| `--pkg-version <version>` | Custom version label |
| `--path <path>` | Path to docs folder in repo/directory |
| `--name <name>` | Custom package name |
| `--save <path>` | Save a copy of the package to the specified path |

**Saving packages for sharing:**

```bash
# Save to a directory (auto-names as name@version.db)
agentshelf add https://github.com/vercel/next.js --save ./packages/

# Save to a specific file
agentshelf add ./my-docs --save ./my-package.db
```

**From URL:**

```bash
agentshelf add https://cdn.example.com/react@18.db
```

**From local file:**

```bash
agentshelf add ./nextjs@15.0.db
```

**Finding the right documentation repository:**

Many popular projects keep their documentation in a separate repository from their main codebase. If you see a warning about few sections found, the docs likely live elsewhere:

```bash
# Example: React's docs are in a separate repo
agentshelf add https://github.com/facebook/react
# Warning: Only 45 sections found...
# The warning includes a Google search link to help find the docs repo

# The actual React docs repository:
agentshelf add https://github.com/reactjs/react.dev
```

Common patterns for documentation repositories:
- `project-docs` (e.g., `prisma/docs`)
- `project.dev` or `project.io` (e.g., `reactjs/react.dev`)
- `project-website` (e.g., `expressjs/expressjs.com`)

When the CLI detects few documentation sections, it will show a Google search link to help you find the correct repository.

### `agentshelf list`

Show installed packages.

```bash
$ agentshelf list

Installed packages:

  nextjs@16.0              4.2 MB    847 sections
  react@18                 2.1 MB    423 sections

Total: 2 packages (6.3 MB)
```

### `agentshelf remove <name>`

Remove a package.

```bash
agentshelf remove nextjs
```

### `agentshelf serve`

Start the MCP server (used by AI agents).

```bash
agentshelf serve
```

### `agentshelf query <library> <topic>`

Query documentation directly from the command line. Useful for testing and debugging.

```bash
# Query a package (use name@version format from 'agentshelf list')
agentshelf query 'nextjs@16.0' 'middleware authentication'

# Returns the same JSON format as the MCP get_docs tool
```

---

## :gear: How It Works

```
                         Your Machine
 ┌─────────────────────────────────────────────────────┐
 │                                                     │
 │  ┌──────────┐     ┌─────────────┐   ┌────────────┐ │
 │  │    AI    │────▶│  MCP Server │──▶│~/.agentshelf│ │
 │  │  Agent   │     │             │   │  /packages  │ │
 │  └──────────┘     │  get_docs   │   └────────────┘ │
 │                    │  search_all │         │        │
 │                    └─────────────┘         ▼        │
 │                                      ┌──────────┐  │
 │                                      │  SQLite  │  │
 │                                      │   FTS5   │  │
 │                                      └──────────┘  │
 └─────────────────────────────────────────────────────┘
```

**Two MCP tools:**

| Tool | Use when... |
|------|------------|
| `get_docs` | You know which library to search (e.g., "Next.js middleware") |
| `search_all` | You don't know which library has the answer, or the topic spans multiple libraries (e.g., "authentication middleware") |

`search_all` normalizes BM25 scores per-library so no single package dominates results.

**When you add a package:**

1. Repository is cloned (for git URLs) or read (for local directories)
2. Documentation is parsed and split into sections
3. Sections are indexed with FTS5 full-text search
4. The package is stored in `~/.agentshelf/packages/`

**When the agent queries:**

1. FTS5 finds relevant sections by keyword matching
2. Results are filtered by relevance score
3. Token budget ensures responses stay concise
4. The agent receives focused, relevant documentation

---

## :package: Package Format

Packages are SQLite databases (`.db` files) containing pre-indexed documentation.

```
~/.agentshelf/packages/
├── nextjs@16.0.db
├── react@18.db
└── typescript@5.5.db
```

You can:
- Build from any git repository (GitHub, GitLab, Bitbucket, etc.)
- Build from local directories
- Download pre-built packages from URLs
- Share packages via releases or any file host

---

## :mortar_board: Tutorial: Create, Share, and Reuse Packages

Documentation packages are portable `.db` files that anyone can build once and reuse everywhere. This tutorial walks through the full workflow.

### Step 1: Create a package from your docs

Build a package from a git repository or a local directory:

```bash
# From a git repository
agentshelf add https://github.com/your-org/your-library

# From a local directory with docs
agentshelf add ./my-project
```

AgentShelf auto-detects `docs/`, `documentation/`, or `doc/` folders. Override with `--path` if your docs live elsewhere:

```bash
agentshelf add ./my-project --path content/api-reference
```

Customize the package name and version:

```bash
agentshelf add ./my-project --name my-lib --pkg-version 2.0
```

### Step 2: Export the package for sharing

Use `--save` to write a copy of the `.db` file you can distribute:

```bash
# Save to a directory (auto-named as my-lib@2.0.db)
agentshelf add ./my-project --name my-lib --pkg-version 2.0 --save ./packages/

# Save to a specific file path
agentshelf add ./my-project --save ./my-lib-docs.db
```

You can also export an already-installed package. The `.db` files live in `~/.agentshelf/packages/`—just copy the one you need:

```bash
cp ~/.agentshelf/packages/my-lib@2.0.db ./shared-packages/
```

### Step 3: Share with your team

Share the `.db` file however your team distributes artifacts:

- **Git repository**: Commit the `.db` file to a shared repo or release assets
- **File host / CDN**: Upload to any HTTP server, S3, or internal CDN
- **Direct transfer**: Send the file via Slack, email, or shared drive

### Step 4: Reuse a shared package

Teammates install the shared package with a single command:

```bash
# From a URL (CDN, GitHub release, internal server, etc.)
agentshelf add https://cdn.example.com/my-lib@2.0.db

# From a local file (downloaded or checked into a repo)
agentshelf add ./shared-packages/my-lib@2.0.db
```

No build step needed—pre-built packages install instantly.

### Putting it all together

A typical team workflow:

```bash
# Maintainer: build and export the package
agentshelf add https://github.com/your-org/design-system \
  --name design-system --pkg-version 3.1 --save ./packages/

# Maintainer: upload design-system@3.1.db to your team's file host

# Teammate: install from the shared URL
agentshelf add https://internal-cdn.example.com/design-system@3.1.db

# Everyone: query the docs through any MCP-compatible agent
# "How do I use the DataTable component?"
```

---

## :wrench: Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

---

## :sparkles: Based on

AgentShelf is a fork of [neuledge/context](https://github.com/neuledge/context) with cross-library search and rebranding. Licensed under [Apache-2.0](LICENSE).
