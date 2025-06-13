# Learning Hour MCP - Features & Usage Guide

## Repository Analysis for Team-Specific Learning Hours

The Learning Hour MCP now includes powerful repository analysis features that allow Claude to create highly contextual,
team-specific Learning Hour content using your actual codebase.

### Available MCP Tools

#### 1. `analyze_repository`
Analyzes a GitHub repository to find real code examples for specific code smells or patterns.

**Parameters:**
- `repositoryUrl` (string): GitHub repository URL to analyze
- `codeSmell` (string): Type of code smell to find (e.g., 'Feature Envy', 'Long Method', 'Duplicate Code')

#### 2. `analyze_tech_stack`
Analyzes a repository's technology stack to understand the team's preferred frameworks and tools.

**Parameters:**
- `repositoryUrl` (string): GitHub repository URL to analyze

### Usage Examples

#### Example 1: Finding Feature Envy Examples in Your Codebase

```
You: Claude, I want to create a Learning Hour about Feature Envy using examples from our actual codebase. Can you analyze our repository for Feature Envy patterns?

Claude: I'll analyze your repository for Feature Envy examples using the analyze_repository tool.

[Claude calls: analyze_repository with repositoryUrl: "https://github.com/yourteam/your-project", codeSmell: "Feature Envy"]

Results show 3 real examples:
1. src/UserService.java (lines 45-67) - Medium complexity, Intermediate level
2. src/OrderProcessor.java (lines 123-140) - High complexity, Advanced level  
3. src/ProductManager.java (lines 78-95) - Low complexity, Beginner level

Now I can create a Learning Hour that uses these actual examples from your codebase, showing real refactoring opportunities your team encounters daily.
```

#### Example 2: Creating Technology Stack-Specific Content

```
You: Create a Clean Code Learning Hour that's tailored to our tech stack

Claude: First, let me analyze your repository's technology stack to understand what frameworks and tools your team uses.

[Claude calls: analyze_tech_stack with repositoryUrl: "https://github.com/yourteam/your-project"]

I can see your team uses:
- Languages: JavaScript, TypeScript
- Frameworks: Express, React, Node.js
- Testing: Jest, React Testing Library
- Build tools: npm, webpack

Now I'll create Clean Code examples using Express route handlers, React components, and Jest tests that match your existing patterns and coding style.
```

#### Example 3: Team-Specific Refactoring Session

```
You: We found some Feature Envy in our UserService class. Can you create a Learning Hour session that shows how to refactor this specific code?

Claude: [After analyzing the repository] I found Feature Envy in src/UserService.java lines 45-67. Let me create a refactoring example using your actual code structure.

**Before (from your codebase):**
```java
public void updateUser(User user) {
  user.getAccount().setBalance(calculateNewBalance());
  user.getProfile().updateLastLogin();
}
```

**After (refactored):**
```java
public void updateUser(User user) {
  updateAccount(user);
  updateProfile(user);
}

private void updateAccount(User user) {
  user.getAccount().setBalance(calculateNewBalance());
}

private void updateProfile(User user) {
  user.getProfile().updateLastLogin();
}
```

This session content will use your team's actual naming conventions and business logic (anonymized for safety).
```

### Setting Up the MCP

1. **Install the Learning Hour MCP** in your Claude Desktop configuration
2. **Configure the MCP server** to point to this project
3. **Start using the tools** in your Claude conversations

### Privacy & Security Features

The repository analysis automatically:
- **Anonymizes sensitive information** (API keys, credentials, internal hostnames)
- **Preserves technical structure** while removing business context
- **Flags potentially sensitive code** for your review
- **Asks permission** before including sensitive examples

### Workflow Integration

1. **Discovery**: Use `analyze_repository` to find learning opportunities in your actual code
2. **Context**: Use `analyze_tech_stack` to understand your team's technology preferences
3. **Creation**: Generate Learning Hours using real examples from your codebase
4. **Delivery**: Use familiar frameworks and patterns your team already knows

### Benefits

- **Immediate Relevance**: Examples come from code your team maintains daily
- **No Setup Time**: No need to create artificial examples
- **Team Buy-in**: Higher engagement when using familiar code
- **Practical Application**: Direct path from learning to improving existing code
- **Contextual Learning**: Examples use your team's coding style and business domain

### Next Steps

After completing a Learning Hour:
1. Apply the learnings to the actual code examples found
2. Create GitHub issues for refactoring opportunities
3. Use the patterns in future code reviews
4. Build on previous sessions with increasingly advanced topics

This creates a continuous improvement cycle where Learning Hours directly improve your actual codebase quality.
