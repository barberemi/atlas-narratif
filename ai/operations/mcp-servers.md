# MCP Servers — Agent tools

> Config source: `.mcp.json.example` (committed). Actual `.mcp.json` is gitignored.

## Available servers

| Server | Package | Purpose | Key capabilities | Credentials |
|--------|---------|---------|-----------------|-------------|
| atlassian | `mcp-atlassian` (via `uvx`) | Jira + Confluence integration | Create/edit/search Jira issues, read/write Confluence pages, manage worklogs and issue links | `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, `CONFLUENCE_URL`, `CONFLUENCE_USERNAME`, `CONFLUENCE_API_TOKEN` |
| github | `@modelcontextprotocol/server-github` (via `npx`) | GitHub API access | PR management, issue tracking, repo operations | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| context7 | `@upstash/context7-mcp@latest` (via `npx`) | Library documentation lookup | Fetch up-to-date docs for any library/framework/SDK; use instead of relying on training data | None |

## Workflow automation hints

| MCP combination | Possible workflow | Target audience |
|-----------------|-------------------|-----------------|
| github + atlassian | Sync Jira issue status when a PR is merged; link PRs to Jira tickets | DEV |
| context7 + github | Look up latest API docs before reviewing or writing code in PRs | DEV |

## Per-MCP context files

Each MCP has a context file at `ai/operations/mcp-servers/<slug>.md` with project-specific rules.
If a context file exists for an MCP, agents should read it before calling that MCP's tools.

## Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.mcp.json.example` | Yes | Template with env var placeholders |
| `.mcp.json` | No (gitignored) | Actual MCP config with real credentials |
