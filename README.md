# Learning Hour MCP

An MCP server that generates comprehensive Learning Hour content for Technical Coaches, enabling teams to practice technical excellence through structured deliberate practice sessions. Works seamlessly with the Miro MCP for creating interactive boards.

## Philosophy

Learning Hours are structured practice sessions where software teams develop technical excellence skills through deliberate practice. Just as athletes and pilots dedicate time to practice their craft, software developers need dedicated time to master fundamental programming practices that stand the test of time.

This MCP server supports the **4C Learning Model** (Connect → Concept → Concrete → Conclusion) and focuses on technical practices that enhance agility:
- Test Driven Development (TDD)
- Refactoring techniques
- Clean code principles
- Evolutionary design
- Pairing/ensemble programming

## Features

- **Generate Session Content**: Creates comprehensive Learning Hour materials for any coding topic
- **Generate Code Examples**: Produces before/after code examples with explanations
- **Miro Integration**: Uses the @k-jarzyna/mcp-miro server to create visual Learning Hour boards
- **MCP-to-MCP Communication**: Demonstrates server-to-server MCP communication patterns

## Tools

### `generate_session`
Generates comprehensive Learning Hour content including objectives, activities, and discussion prompts.

**Input:**
```json
{
  "topic": "Feature Envy"
}
```

**Output:** Structured session data with `miroContent` section ready for Miro board creation.

### `generate_code_example`
Creates detailed before/after code examples for learning topics.

**Input:**
```json
{
  "topic": "Feature Envy",
  "language": "javascript"
}
```

### `create_miro_board`
Creates a Miro board with Learning Hour content by communicating with the @k-jarzyna/mcp-miro server.

**Input:**
```json
{
  "sessionContent": {} // Output from generate_session
}
```

### `analyze_repository`
Analyzes a GitHub repository to find real code examples for Learning Hours. Uses GitHub MCP integration to search for specific code patterns.

**Requirements:** Requires `GITHUB_TOKEN` environment variable to be set.

**Input:**
```json
{
  "repositoryUrl": "https://github.com/owner/repo",
  "codeSmell": "Feature Envy"
}
```

**Output:** List of code examples with file paths, line numbers, and confidence scores.

### `analyze_tech_stack`
Analyzes a repository's technology stack to create team-specific Learning Hour content. Examines package.json, build files, and repository structure.

**Requirements:** Requires `GITHUB_TOKEN` environment variable to be set.

**Input:**
```json
{
  "repositoryUrl": "https://github.com/owner/repo"
}
```

**Output:** Technology profile including languages, frameworks, testing tools, and architectural patterns.

## Installation

### Quick Start with npx (Recommended)

The easiest way to use Learning Hour MCP is directly through npx:

1. Add to your Claude Desktop configuration:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "learning-hour": {
      "command": "npx",
      "args": ["-y", "learning-hour-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here",
        "MIRO_ACCESS_TOKEN": "your-miro-token-here",
        "GITHUB_TOKEN": "your-github-token-here"
      }
    }
  }
}
```

2. Restart Claude Desktop to load the MCP server.

### Local Development Setup

For development or customization:

1. Clone and install:
```bash
git clone https://github.com/yourusername/learning-hour-mcp.git
cd learning-hour-mcp
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

3. Get your API keys:

   **Anthropic API Key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account or sign in
   - Generate an API key
   - Add it to your `.env` file:
     ```
     ANTHROPIC_API_KEY=your_actual_api_key_here
     ```

   **Miro Integration:**
   - This MCP uses the @k-jarzyna/mcp-miro server for Miro operations
   - Ensure you have MIRO_ACCESS_TOKEN configured in your Claude Desktop settings
   - The learning-hour-mcp will automatically connect to the miro-mcp server

   **GitHub Integration (Required for repository analysis):**
   - Required for `analyze_repository` and `analyze_tech_stack` tools
   - Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a new token with `repo` scope
   - Add it to your environment as `GITHUB_TOKEN`

4. Build the project:
```bash
npm run build
```

5. Add to Claude Desktop configuration with local path:
```json
{
  "mcpServers": {
    "learning-hour-dev": {
      "command": "node",
      "args": ["/path/to/learning-hour-mcp/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here",
        "MIRO_ACCESS_TOKEN": "your-miro-token-here",
        "GITHUB_TOKEN": "your-github-token-here"
      }
    }
  }
}
```

## Testing

Run the integration tests to verify your API connection:

```bash
# Run all tests
npm test

# Run only integration tests
npm run test:integration
```

**Note**: Integration tests require a valid `ANTHROPIC_API_KEY` in your `.env` file and will make real API calls.

## MCP-to-MCP Communication

This server demonstrates MCP-to-MCP communication patterns by acting as a client to the @k-jarzyna/mcp-miro server. When you use the `create_miro_board` tool, the learning-hour-mcp:

1. Spawns the miro-mcp server as a subprocess
2. Establishes a client connection using stdio transport
3. Calls miro-mcp tools to create boards and add content
4. Returns the aggregated results

This architecture provides:
- **Clean separation of concerns** - Learning content generation vs Miro API operations
- **Reusability** - Both MCPs can be used independently
- **Composability** - MCPs can be chained together for complex workflows

For detailed MCP-to-MCP communication patterns, see [examples/mcp-to-mcp-communication/mcp-to-mcp-patterns.md](./examples/mcp-to-mcp-communication/mcp-to-mcp-patterns.md).

## Environment Variables

- `ANTHROPIC_API_KEY`: Required - your Anthropic API key for generating Learning Hour content
- `MIRO_ACCESS_TOKEN`: Required for Miro integration - passed to the miro-mcp server
- `GITHUB_TOKEN`: Required for repository analysis features (`analyze_repository` and `analyze_tech_stack` tools)

## Usage Examples

**Generate a complete Learning Hour:**
```json
{
  "tool": "generate_session",
  "arguments": {
    "topic": "Single Responsibility Principle"
  }
}
```

**Create code examples:**
```json
{
  "tool": "generate_code_example", 
  "arguments": {
    "topic": "Feature Envy",
    "language": "python"
  }
}
```

The output includes structured content perfect for Technical Coaches to run effective Learning Hours with hands-on exercises and group discussions.

## Documentation

- [Learning Hours Guide](./docs/LEARNING_HOURS.md) - Comprehensive guide to Learning Hours philosophy and implementation
- [Domain Vocabulary](./docs/DOMAIN_VOCABULARY.md) - Key terms and concepts used in Learning Hours
- [Coding Style Guidelines](./docs/CODING_STYLE.md) - Code style aligned with clean code principles

## Learning Outcomes

Teams practicing Learning Hours experience:
- Frequent deployments with minimal defects
- Faster development velocity  
- Higher quality software delivery
- Improved team morale and collaboration
- Reduced technical debt

> "Continuous attention to technical excellence and good design enhances agility" - The 9th principle of the Agile Manifesto

## Publishing to npm

For maintainers who want to publish updates:

1. Update version in package.json
2. Build and test:
   ```bash
   npm run build
   npm test
   ```
3. Publish to npm:
   ```bash
   npm publish
   ```

The `prepublishOnly` script will automatically build the project before publishing.