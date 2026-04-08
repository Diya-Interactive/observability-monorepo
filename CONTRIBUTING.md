# Contributing

We love contributions! Here's how to get started:

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- .NET 8.0 SDK
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/your-org/observability-monorepo.git
cd observability-monorepo
```

2. **Install dependencies**
```bash
npm install
```

3. **Build all packages**
```bash
npm run build
```

4. **Type check**
```bash
npm run type-check
```

5. **Lint**
```bash
npm run lint
```

## Package Structure

```
packages/
├── sdk-node/          # Node.js/Express SDK
├── sdk-python/        # Python/Django SDK
├── sdk-dotnet/        # .NET/C# SDK
└── cli/               # CLI tool for infrastructure scaffolding
```

## Making Changes

### For Node.js/TypeScript
1. Edit files in `packages/sdk-node/src/` or `packages/cli/src/`
2. Run `npm run build --workspace=@your-org/observability`
3. Test changes: `npm run test`

### For Python
1. Edit files in `packages/sdk-python/your_org_observability/`
2. Run `python -m mypy --strict packages/sdk-python/your_org_observability/`
3. Run tests: `pytest packages/sdk-python/tests/`

### For .NET
1. Edit files in `packages/sdk-dotnet/src/`
2. Run `dotnet build packages/sdk-dotnet/`
3. Run tests: `dotnet test packages/sdk-dotnet/`

## Testing

### Run all tests
```bash
npm run test
```

### Run specific test suite
```bash
npm run test --workspace=@your-org/observability
```

### Generate coverage
```bash
npm run test:coverage
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
Scopes: `sdk-node`, `sdk-python`, `sdk-dotnet`, `cli`, `docs`

Examples:
```
feat(sdk-node): add request filtering middleware
fix(cli): correct docker-compose configuration
docs: update installation instructions
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'feat(scope): description'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request with a clear title and description
5. Ensure all CI checks pass
6. Request review from maintainers

## Code Style

### TypeScript/Node.js
- Use ESLint for linting
- Use Prettier for formatting
- TypeScript strict mode enabled
- JSDoc comments for public APIs

### Python
- Use mypy for type checking (strict mode)
- Follow PEP 8 style guide
- Use type hints for all functions
- Docstrings for all public functions/classes

### .NET/C#
- Enable nullable reference types
- Use C# 8.0+ features
- XML doc comments for all public members
- Follow Microsoft C# coding conventions

## Release Process

1. Update version in package files
2. Update CHANGELOG.md
3. Create annotated git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will publish to all package registries

## Getting Help

- 📖 Check existing [documentation](./README.md)
- 💬 Open a GitHub Discussion
- 🐛 Report bugs via GitHub Issues
- 📧 Email team@your-org.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
