# Learning Hour MCP

An MCP server that generates comprehensive Learning Hour content for Technical Coaches. Works seamlessly with the Miro MCP for creating interactive boards.

## Features

- **Generate Session Content**: Creates comprehensive Learning Hour materials for any coding topic
- **Generate Code Examples**: Produces before/after code examples with explanations
- **Miro-Compatible Output**: Structured content ready for use with Miro MCP tools

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

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variable (optional):
```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

3. Build and run:
```bash
npm run build && npm start
```

## Integration with Miro

This MCP works perfectly with the Miro MCP server. The workflow is:

1. **Generate Content**: Use `generate_session` to create learning content
2. **Create Board**: Use Miro MCP tools with the `miroContent` output
3. **Add Examples**: Use `generate_code_example` for detailed code demonstrations

### Example Workflow

```bash
# 1. Generate learning session
learning-hour: generate_session {"topic": "Feature Envy"}

# 2. Use the miroContent output with Miro MCP
miro: createBoard {"name": "Learning Hour: Feature Envy"}
miro: createStickyNoteItem {...} # for each section
```

## Environment Variables

- `ANTHROPIC_API_KEY`: Optional - enables AI-generated content (falls back to mock data)

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