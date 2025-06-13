# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based MCP (Model Context Protocol) server that helps Technical Coaches generate comprehensive Learning Hour content. Learning Hours are 60-minute structured practice sessions where teams develop technical excellence skills through deliberate practice.

## Common Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload (tsx)
- `npm test` - Run all tests
- `npm run test:integration` - Run integration tests only

## Architecture

The codebase follows a clean architecture with these key components:

- **src/index.ts** - MCP server entry point, defines available tools
- **src/LearningHourGenerator.ts** - Generates Learning Hour session content using enhanced prompts that deeply incorporate 4C model
- **src/RepositoryAnalyzer.ts** - Analyzes GitHub repositories for code examples
- **src/TechStackAnalyzer.ts** - Identifies technology stack in repositories
- **src/schemas.ts** - Zod schemas for input validation
- **src/EnhancedMiroBuilder.ts** - Creates beautiful, workshop-ready Miro boards with visual 4C flow
- **src/MiroBoardPrompt.ts** - Sophisticated prompt for Miro board visual design

The server integrates with:
- Anthropic API for AI-powered content generation with carefully crafted prompts
- Other MCP servers (specifically miro-mcp) via subprocess spawning for MCP-to-MCP communication

## Development Guidelines

1. **Code Style**: Follow clean code principles - no comments, small focused functions, expressive naming
2. **Testing**: Write tests in `__tests__/` directory using Jest
3. **Environment**: Requires `ANTHROPIC_API_KEY` in environment variables
4. **TypeScript**: Strict mode enabled, target ES2020

## Key Domain Concepts

- **Learning Hour**: Structured 60-minute practice session following 4C model
- **4C Learning Model**: 
  - **Connect (10 min)**: Share experiences, connect to existing knowledge
  - **Concept (10 min)**: Introduce new ideas, discuss theory and principles
  - **Concrete (30 min)**: Hands-on practice with pair programming and coding
  - **Conclusion (10 min)**: Reflect, commit to apply learning, share insights
- **Technical Excellence**: Focus on TDD, refactoring, clean code, evolutionary design
- **Deliberate Practice**: Focused improvement with immediate feedback

## MCP Tools

The server provides these tools:
- `generate_session` - Generate complete Learning Hour content with rich 4C activities
- `generate_code_example` - Create multi-stage refactoring examples with tests
- `create_miro_board` - Create professional visual boards with 4C flow (requires miro-mcp)
- `analyze_repository` - Find code smell examples in GitHub repos
- `analyze_tech_stack` - Analyze repository technology stack

## Prompt Engineering Notes

The prompts have been carefully engineered using three sub-agents approach:
1. **Learning Design Agent**: Ensures deep 4C model integration and adult learning principles
2. **Code Quality Agent**: Creates realistic, incremental refactoring examples with tests
3. **Visual Design Agent**: Transforms content into beautiful Miro boards with proper UX

Key improvements:
- Prompts emphasize deliberate practice and hands-on coding
- Code examples show incremental improvement steps with specific code smells
- Miro boards use color psychology, visual hierarchy, and workshop best practices
- All content connects to participants' real work and current projects