# Publishing Guide for Learning Hour MCP

This guide is for maintainers who need to publish updates to npm.

## Prerequisites

1. npm account with publish access to `learning-hour-mcp`
2. Logged in to npm CLI: `npm login`

## Publishing Process

### 1. Pre-publish Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Update version in package.json following [semver](https://semver.org/)
- [ ] Update README.md if needed
- [ ] Commit all changes

### 2. Version Bump

```bash
# For patch releases (bug fixes)
npm version patch

# For minor releases (new features, backwards compatible)
npm version minor

# For major releases (breaking changes)
npm version major
```

### 3. Publish to npm

```bash
npm publish
```

The `prepublishOnly` script will automatically build the project before publishing.

### 4. Post-publish

1. Push tags to GitHub:
   ```bash
   git push --tags
   ```

2. Create GitHub release with changelog

3. Test the published package:
   ```bash
   npx learning-hour-mcp@latest
   ```

## First-time Publishing

If this is the first time publishing:

1. Check package name availability:
   ```bash
   npm view learning-hour-mcp
   ```

2. If available, publish:
   ```bash
   npm publish --access public
   ```

## Troubleshooting

- **E403 Forbidden**: Check npm login and package ownership
- **Build errors**: Run `npm run build` manually to debug
- **Missing files**: Check `.npmignore` and `files` in package.json