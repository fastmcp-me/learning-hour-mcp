# Contributing to learning-hour-mcp

Thank you for your interest in contributing! This project follows XP practices and values simple, clean code.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your API keys
4. Build: `npm run build`
5. Run tests: `npm test`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with TDD (write tests first)
3. Ensure all tests pass: `npm test`
4. Commit with clear messages
5. Push and create a Pull Request

## Code Style

- No comments - use expressive names instead
- Small functions (< 10 lines)
- Test-driven development
- Simple design

## Testing

```bash
npm test              # Run all tests
npm run dev          # Run in development mode
```

Integration tests require API keys in your `.env` file.

## Pull Request Process

1. All tests must pass
2. Code follows project style
3. PR description explains the change
4. One approval required before merge

## Philosophy

This project supports Learning Hours and the 4C Learning Model. We practice what we teach:
- **Connect**: Share your experience in the PR description
- **Concept**: Explain the why behind your change
- **Concrete**: Show working code with tests
- **Conclusion**: Document what others can learn

## Questions?

Open an issue for discussion before making large changes.