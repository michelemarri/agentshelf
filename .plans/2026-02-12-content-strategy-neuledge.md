# Neuledge Content Strategy & Business Plan

## Vision

Build a profitable company around `@neuledge/context` (local-first AI documentation) and expand into **indexing and grounding services for LLMs**, with Neuledge.com as the commercial hub.

---

## Current State

- **Open-source tool**: `@neuledge/context` — MCP server that gives AI agents offline, instant, private documentation search
- **Differentiators**: Local-first, SQLite-based, token-aware, no cloud dependency
- **License**: Apache 2.0 (commercial-friendly)
- **Competitors**: Context7 (cloud-based), Deepcon (similar space)

---

## Business Model: Open Core + Services

### Free (Open Source)
- CLI tool, MCP server, local package building
- Community documentation packages

### Paid Tiers

| Tier | Target | Revenue Model |
|------|--------|---------------|
| **Pro** ($29-49/mo per seat) | Individual devs & small teams | Hosted package registry, pre-built packages for 500+ libraries, auto-updates, semantic search |
| **Team** ($149-299/mo) | Engineering teams (5-20) | Shared private doc packages, team analytics, SSO, priority indexing |
| **Enterprise** (custom) | Large orgs | On-prem deployment, custom indexing pipelines, SLA, dedicated support, compliance |
| **API** (usage-based) | Platform builders | Grounding API — query any library docs via REST, embeddings + retrieval endpoints |

### Revenue Projections (Year 1-3 targets)
- Y1: $10-30K MRR (early adopters, API beta)
- Y2: $50-150K MRR (team/enterprise expansion)
- Y3: $200K+ MRR (platform API revenue scales)

---

## Product Expansion Roadmap

### Phase 1: Foundation (Months 1-3)
**Goal**: Rebuild Neuledge.com, establish content engine, launch hosted registry

1. **Rebuild Neuledge.com** as a developer-focused product site
   - Landing page: problem → solution → demo → pricing
   - Documentation hub (dogfood your own tool)
   - Blog with SEO-optimized content
   - Package registry browser (searchable catalog of pre-built doc packages)

2. **Hosted Package Registry**
   - Cloud-hosted SQLite packages for popular libraries
   - One-click install: `context install react@19` pulls from registry
   - Auto-rebuild on new library releases (GitHub webhook integration)
   - This is the first paid feature gate

3. **Content Engine (SEO + Authority)**
   - Launch blog at neuledge.com/blog
   - Initial content pillars (see Content Strategy below)

### Phase 2: Grounding API (Months 3-6)
**Goal**: Launch the API product that becomes the primary revenue driver

1. **Grounding API Service**
   - REST API: `POST /v1/query { library, topic, version }` → returns grounded documentation chunks
   - Embeddings endpoint for semantic search
   - Batch indexing API for custom documentation
   - SDK packages: `@neuledge/client` (TypeScript), `neuledge` (Python)

2. **Semantic Search Upgrade**
   - Local embeddings (already a TODO in codebase)
   - Hybrid search: FTS5 + vector similarity
   - This differentiates from basic keyword search competitors

3. **Pre-built Package Library**
   - Index top 500 npm packages, top 200 Python packages
   - Auto-update pipeline: detect new releases → rebuild → publish
   - Community contribution workflow

### Phase 3: Platform (Months 6-12)
**Goal**: Become the default grounding layer for AI coding tools

1. **GraphRAG Integration** (already a TODO in codebase)
   - Relationship traversal across documentation
   - "How does X relate to Y" queries
   - Cross-library dependency awareness

2. **IDE Plugins**
   - VS Code extension (context panel + inline docs)
   - JetBrains plugin
   - Integrations with Cursor, Windsurf, Claude Code

3. **Enterprise Features**
   - Private documentation indexing (internal APIs, runbooks)
   - Compliance: SOC2, data residency
   - Usage analytics dashboard

---

## Content Strategy

### Core Thesis
Position Neuledge as **the authority on AI grounding and documentation retrieval**. Every piece of content should either:
1. Drive organic search traffic from developers
2. Establish thought leadership in AI+docs space
3. Convert readers to product users

### Content Pillars

#### Pillar 1: "AI Coding Pain Points" (Top-of-funnel)
Target: Developers frustrated with AI hallucinations about APIs

- "Why ChatGPT keeps suggesting deprecated React APIs (and how to fix it)"
- "The hidden cost of AI hallucinations in production code"
- "AI coding assistants vs. reality: a benchmark of documentation accuracy"
- "How to stop your AI pair programmer from using outdated libraries"
- "MCP explained: the protocol that fixes AI context problems"

**SEO keywords**: AI coding assistant accuracy, LLM hallucination fix, AI deprecated API, MCP server documentation

#### Pillar 2: "Building with MCP" (Mid-funnel)
Target: Developers building AI-enhanced tooling

- "Building your first MCP server: a practical guide"
- "MCP vs. RAG: when to use which for AI grounding"
- "How to give Claude/GPT expert knowledge of your internal APIs"
- "The architecture of offline-first AI documentation systems"
- "SQLite + FTS5: why we chose it over vector databases"

**SEO keywords**: MCP server tutorial, AI documentation tool, RAG for code, local AI knowledge base

#### Pillar 3: "Library Deep Dives" (Bottom-of-funnel + SEO)
Target: Developers searching for specific library docs

- "Complete guide to [Library] v[X] API changes"
- "[Library] migration guide: what your AI assistant doesn't know"
- Per-library landing pages that showcase the package registry

**SEO keywords**: [library] API docs, [library] migration guide, [library] latest version

#### Pillar 4: "AI Infrastructure" (Thought leadership)
Target: CTOs, engineering leads, platform teams

- "Why your engineering team needs a documentation grounding layer"
- "The cost of context: how documentation debt slows AI adoption"
- "From RAG to grounding: the evolution of AI knowledge systems"
- "Building an AI-ready documentation pipeline"

**SEO keywords**: AI grounding infrastructure, enterprise AI documentation, LLM knowledge management

### Content Calendar (First 3 Months)

| Week | Content | Pillar | Goal |
|------|---------|--------|------|
| 1 | "Why AI keeps suggesting deprecated APIs" | 1 | Viral/SEO |
| 2 | "Getting started with Context" (tutorial) | 2 | Conversion |
| 3 | "React 19 docs: what your AI doesn't know" | 3 | SEO |
| 4 | "MCP vs RAG for documentation" | 2 | Authority |
| 5 | "Hidden cost of AI hallucinations" | 1 | Viral/SEO |
| 6 | "Building MCP servers: practical guide" | 2 | SEO |
| 7 | "Next.js 15 migration: AI-proof guide" | 3 | SEO |
| 8 | "Why your team needs a grounding layer" | 4 | Enterprise |
| 9 | "SQLite + FTS5 vs vector DBs" | 2 | Authority |
| 10 | "TypeScript 6 API changes deep dive" | 3 | SEO |
| 11 | "AI coding benchmarks: docs accuracy" | 1 | Viral |
| 12 | "State of AI grounding 2026" (report) | 4 | Lead gen |

### Distribution Channels

| Channel | Strategy | Frequency |
|---------|----------|-----------|
| **Blog (neuledge.com/blog)** | Long-form SEO content | 1/week |
| **Dev.to / Hashnode** | Cross-post top articles | 1/week |
| **Twitter/X** | Threads on AI grounding insights, product updates | 3-5/week |
| **Reddit** (r/programming, r/webdev, r/MachineLearning) | Share articles, answer questions | 2-3/week |
| **Hacker News** | Launch posts, technical deep-dives | 1-2/month |
| **YouTube** | Demo videos, architecture deep-dives | 2/month |
| **GitHub** | README-driven growth, examples repo, awesome-mcp list | Ongoing |
| **Newsletter** | Weekly digest: AI docs news + tips | 1/week |
| **Discord/Slack** | Community for MCP/AI tooling developers | Ongoing |

---

## Neuledge.com Website Structure

```
neuledge.com/
├── /                    # Landing page (hero → problem → solution → demo → pricing → CTA)
├── /docs                # Product documentation (dogfood Context itself)
├── /blog                # Content hub (SEO engine)
├── /registry            # Package browser (search 500+ libraries)
│   └── /registry/[lib]  # Per-library page (install instructions, preview)
├── /pricing             # Free / Pro / Team / Enterprise
├── /api                 # Grounding API docs + playground
├── /enterprise          # Enterprise landing page + contact form
├── /changelog           # Auto-generated from changesets
└── /community           # Discord link, GitHub, contributing guide
```

### Landing Page Structure

1. **Hero**: "Give your AI expert knowledge of any library" + live demo GIF
2. **Problem**: "AI assistants confidently suggest deprecated APIs" (with real examples)
3. **Solution**: "Context delivers version-specific docs, offline, in milliseconds"
4. **How it works**: 3-step visual (Install → Build/Browse → Query)
5. **Social proof**: GitHub stars, npm downloads, testimonials
6. **Registry preview**: "500+ libraries ready to go" with search
7. **API teaser**: "Build grounding into your own tools" with code snippet
8. **Pricing**: Tier comparison
9. **CTA**: "Get started in 30 seconds" with install command

### Tech Stack for Website
- **Framework**: Next.js (App Router) or Astro (better for content-heavy sites)
- **Styling**: Tailwind CSS
- **CMS for blog**: MDX files in repo (or Contentlayer)
- **Analytics**: Plausible or PostHog (privacy-friendly)
- **Hosting**: Vercel or Cloudflare Pages
- **Auth**: Clerk or Auth.js (for Pro/Team accounts)
- **Payments**: Stripe

---

## Go-to-Market Strategy

### Launch Sequence

1. **Soft launch** (Week 1-2): Rebuild site, publish 3-4 blog posts
2. **Product Hunt launch**: Package registry + hosted service
3. **Hacker News post**: Technical deep-dive on architecture
4. **API beta**: Invite-only, gather feedback from 20-50 developers
5. **Public API launch**: With documentation, SDKs, pricing

### Growth Levers

| Lever | Mechanism |
|-------|-----------|
| **SEO** | Library-specific pages rank for "[library] docs" queries |
| **Open source** | GitHub growth drives awareness → website traffic |
| **MCP ecosystem** | Listed in MCP registries, Claude integration guides |
| **Community packages** | Users contribute packages → more libraries → more users |
| **API integrations** | Platform builders embed Neuledge → their users discover it |
| **Word of mouth** | "It just works" offline-first UX → developers tell developers |

### Key Metrics to Track

| Metric | Target (3 months) | Target (12 months) |
|--------|-------------------|---------------------|
| GitHub stars | 2,000 | 10,000 |
| npm weekly downloads | 5,000 | 50,000 |
| Website monthly visitors | 10,000 | 100,000 |
| Blog monthly organic traffic | 3,000 | 30,000 |
| Newsletter subscribers | 500 | 5,000 |
| Paying customers | 50 | 500 |
| MRR | $5K | $50K |
| API requests/month | 100K | 5M |

---

## Competitive Positioning

| Feature | Context (Neuledge) | Context7 | Generic RAG |
|---------|-------------------|----------|-------------|
| Local-first / offline | Yes | No (cloud) | Depends |
| Privacy | Full (no data leaves machine) | Cloud-processed | Depends |
| Pre-built packages | Yes (registry) | Yes | No |
| Custom docs | Yes | Limited | Yes |
| MCP native | Yes | Yes | No |
| API service | Yes (planned) | No | No |
| Semantic search | Planned | Unknown | Yes |
| GraphRAG | Planned | No | No |
| Token-aware responses | Yes | Unknown | No |
| Open source | Yes (Apache 2.0) | No | Varies |

**Key differentiator**: Only solution that is both **open-source + local-first** AND offers a **hosted API service** for platform builders. You own both ends of the market.

---

## Immediate Next Steps

| # | Task | Priority |
|---|------|----------|
| 1 | Set up Next.js/Astro project for neuledge.com | High |
| 2 | Design and build landing page | High |
| 3 | Write first 3 blog posts (pillars 1 & 2) | High |
| 4 | Build hosted package registry (backend + UI) | High |
| 5 | Set up Stripe billing + pricing page | Medium |
| 6 | Create API service architecture | Medium |
| 7 | Set up newsletter (Buttondown or Resend) | Medium |
| 8 | Launch on Product Hunt + HN | Medium |
| 9 | Build auto-indexing pipeline for top libraries | Medium |
| 10 | Start Discord community | Low |

---

## Progress

| Task | Status |
|------|--------|
| Research codebase and positioning | Done |
| Draft content strategy plan | Done |
| (remaining tasks pending approval) | — |
