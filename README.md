# learning-hour-mcp

Generate Learning Hour content for Technical Coaches using AI. Create structured practice sessions that help development teams master technical excellence through the 4C Learning Model.

## What is this?

An MCP server that helps Technical Coaches run Learning Hours - structured 60-minute practice sessions where teams improve their coding skills through deliberate practice. It generates session plans, code examples, and can even create interactive Miro boards.

## Who is this for?

- **Technical Coaches** facilitating team learning sessions
- **Team Leads** wanting to improve their team's technical practices
- **Developers** organizing coding dojos or practice sessions

## Installation

### Prerequisites
1. [Claude Desktop](https://claude.ai/download) - Install the desktop app
2. [Anthropic API Key](https://console.anthropic.com/settings/keys) - Sign up and create a key ($5 free credit for new accounts)

### Complete Setup

Choose your preferred editor:

#### Claude Desktop
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "learning-hour": {
      "command": "npx",
      "args": ["-y", "learning-hour-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "MIRO_ACCESS_TOKEN": "your-miro-token-optional",
        "GITHUB_TOKEN": "your-github-token-optional"
      }
    }
  }
}
```

**Configuration steps:**
1. Open Claude Desktop settings (cmd/ctrl + ,)
2. Go to "Developer" → "Edit Config"
3. Paste the configuration above
4. Replace `your-anthropic-key` with your actual key
5. Save and restart Claude Desktop

#### VSCode
Add to your VSCode settings.json:

```json
{
  "mcp.servers": {
    "learning-hour": {
      "command": "npx",
      "args": ["-y", "learning-hour-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "MIRO_ACCESS_TOKEN": "your-miro-token-optional",
        "GITHUB_TOKEN": "your-github-token-optional"
      }
    }
  }
}
```

**Configuration steps:**
1. Install the [MCP VSCode Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp)
2. Open settings.json (Cmd/Ctrl+Shift+P → "Preferences: Open Settings (JSON)")
3. Add the configuration above
4. Replace tokens with your actual values
5. Reload VSCode window (Cmd/Ctrl+Shift+P → "Developer: Reload Window")

#### Cursor
Add to your Cursor configuration:

```json
{
  "mcpServers": {
    "learning-hour": {
      "command": "npx",
      "args": ["-y", "learning-hour-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "MIRO_ACCESS_TOKEN": "your-miro-token-optional",
        "GITHUB_TOKEN": "your-github-token-optional"
      }
    }
  }
}
```

**Configuration steps:**
1. Open Cursor settings (Cmd/Ctrl + ,)
2. Click on "Features" → "Claude" → "Advanced"
3. Add the MCP server configuration
4. Replace tokens with your actual values
5. Restart Cursor

**Required**: Only `ANTHROPIC_API_KEY` is required. The other tokens enable additional features.

## Quick Start

After installation, try this in Claude:

> "Use the learning hour tools to create a session about the Extract Method refactoring"

Claude will generate a complete 60-minute session plan with:
- Opening connection activity
- Concept introduction 
- Hands-on coding exercise
- Reflection and commitment

## Available Tools

### `generate_session`
Generate a complete Learning Hour session plan with activities following the 4C model (Connect, Concept, Concrete, Conclusion).

```json
{
  "topic": "Feature Envy"
}
```

### `generate_code_example`
Create before/after code examples for a specific topic.

```json
{
  "topic": "Extract Method",
  "language": "typescript"
}
```

### `create_miro_board`
Transform session content into an interactive Miro board (requires `MIRO_ACCESS_TOKEN`).

### `analyze_repository`
Find real code examples in GitHub repositories (requires `GITHUB_TOKEN`).

### `analyze_tech_stack`
Analyze a repository's technology stack to create team-specific content (requires `GITHUB_TOKEN`).

## Optional Features

### Enable Miro Board Creation
*Transform your Learning Hour into a visual, interactive workshop board*

Get a Miro token:
- Go to [Miro Apps](https://miro.com/app/settings/apps)
- Create a new app (name it "Learning Hours")
- Copy the access token
- Add as `MIRO_ACCESS_TOKEN` in your config

### Enable Repository Analysis
*Find real code examples from your team's actual codebase*

Create a [GitHub Personal Access Token](https://github.com/settings/tokens/new):
- Name: "Learning Hour MCP"
- Expiration: 90 days (recommended)
- Permissions: `repo` (read access)
- Add as `GITHUB_TOKEN` in your config

## Learn More

- [Diamante Technical Coaching](https://diamantetechcoaching.com/)
- [SammanCoaching.org](https://sammancoaching.org/) - Technical coaching resources and Learning Hour guides
- [Learning Hours](https://sammancoaching.org/learning_hours/index.html) - Catalog of Learning Hour topics
- [4C Learning Model](https://sammancoaching.org/society/index.html) - Connect, Concept, Concrete, Conclusion
- [Technical Coaching](https://www.sammancoaching.org/society/technical_coach.html) - Role and practices

## Troubleshooting

**"Tool not found" error**: Make sure you restarted Claude Desktop after adding the configuration.

**"Invalid API key"**: Check that you copied the entire key including any prefixes (sk-ant-...).

**Miro board not creating**: Check that your MIRO_ACCESS_TOKEN is valid and has board creation permissions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
