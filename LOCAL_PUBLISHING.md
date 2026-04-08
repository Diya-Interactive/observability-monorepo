# Local Build and Publishing Guide

This document explains how to build and publish the observability monorepo packages locally instead of using GitHub Actions CI/CD.

## 📋 Overview

Local publishing scripts allow you to:
- Build packages on your local machine
- Test builds before publishing
- Publish directly to npm, PyPI, and NuGet
- Skip intermediate GitHub Actions workflows
- Have full control over the publishing process

## 🚀 Quick Start

### Option 1: Build All, Publish All

```bash
# Build all packages
./build-all.sh

# Publish all packages to npm, PyPI, and NuGet
./publish-local.sh
```

### Option 2: Build and Publish Individually

```bash
# Node.js (npm)
./build-node.sh
npm publish -w @your-org/observability
npm publish -w @your-org/observability-cli

# Python (PyPI)
./build-python.sh
cd packages/sdk-python && twine upload dist/*

# .NET (NuGet)
./build-dotnet.sh
cd packages/sdk-dotnet && dotnet nuget push nupkg/*.nupkg --api-key YOUR_NUGET_TOKEN
```

## 📦 Build Scripts

### `build-all.sh` - Build All Packages

Builds Node.js, Python, and .NET packages in one command.

**Usage:**
```bash
./build-all.sh [options]
```

**Options:**
```
--skip-node        Skip Node.js build
--skip-python      Skip Python build
--skip-dotnet      Skip .NET build
--node-only        Build only Node.js
--python-only      Build only Python
--dotnet-only      Build only .NET
--help             Show help
```

**Examples:**
```bash
# Build everything
./build-all.sh

# Build only Node.js and Python
./build-all.sh --skip-dotnet

# Build only .NET
./build-all.sh --dotnet-only
```

### `build-node.sh` - Build Node.js Packages

Builds `@your-org/observability` and `@your-org/observability-cli`.

**Usage:**
```bash
./build-node.sh
```

**What it does:**
- Installs npm dependencies
- Runs TypeScript compilation
- Creates dist/ directories

### `build-python.sh` - Build Python SDK

Builds `your-org-observability` wheel and sdist distribution.

**Usage:**
```bash
./build-python.sh
```

**What it does:**
- Installs build tools (build, twine)
- Cleans previous builds
- Creates dist/ with .whl and .tar.gz files
- Validates distribution with twine

### `build-dotnet.sh` - Build .NET SDK

Builds `YourOrg.Observability` NuGet package.

**Usage:**
```bash
./build-dotnet.sh
```

**What it does:**
- Restores NuGet dependencies
- Compiles in Release configuration
- Creates NuGet package (.nupkg)

## 📤 Publishing Scripts

### `publish-local.sh` - Publish All Packages

Orchestrates publishing to all three registries.

**Requirements:**
- Must be logged into npm: `npm login`
- NPM_TOKEN environment variable, or will prompt during execution
- PYPI_TOKEN environment variable (or will prompt)
- NUGET_TOKEN environment variable (or will prompt)

**Usage:**
```bash
./publish-local.sh [options]
```

**Options:**
```
--skip-npm       Skip npm publishing
--skip-pypi      Skip PyPI publishing
--skip-nuget     Skip NuGet publishing
--skip-all       Build only, don't publish
--help           Show help
```

**Examples:**
```bash
# Publish everything
./publish-local.sh

# Build all, publish only to npm
./publish-local.sh --skip-pypi --skip-nuget

# Build and publish only to NuGet
./publish-local.sh --skip-npm --skip-pypi
```

## 🔑 Authentication Setup

### npm (Node.js)

```bash
# Login to npm
npm login

# Generate token
npm token create --read-only --name observability-monorepo
```

### PyPI (Python)

```bash
# Create token at https://pypi.org/account/

# Set environment variable
export PYPI_TOKEN="pypi-AgEIc..."

# Or let the script prompt you
./publish-local.sh
```

### NuGet (.NET)

```bash
# Create token at https://www.nuget.org/account/

# Set environment variable
export NUGET_TOKEN="oy2oxv6u..."

# Or let the script prompt you
./publish-local.sh
```

## 📊 Workflow Examples

### Example 1: Full Development Cycle

```bash
# 1. Make code changes
# 2. Build locally
./build-all.sh

# 3. Test builds
npm run test --workspaces  # If tests are configured

# 4. Publish to registries
./publish-local.sh
```

### Example 2: Publish Specific Language

```bash
# Build and publish only Python
./build-python.sh
cd packages/sdk-python && twine upload dist/*

# Or use publish script
./publish-local.sh --skip-npm --skip-nuget
```

### Example 3: Dry Run (Build Only)

```bash
# Build everything without publishing
./publish-local.sh --skip-all

# Review build artifacts
ls packages/sdk-node/dist/
ls packages/sdk-python/dist/
ls packages/sdk-dotnet/nupkg/
```

## 🔍 Troubleshooting

### npm: "not authenticated"

```bash
npm login
npm token create --read-only
```

### Python: "403 Forbidden"

```bash
# Update PYPI_TOKEN
export PYPI_TOKEN="pypi-..."
./publish-local.sh --skip-npm --skip-nuget
```

### .NET: "API key invalid"

```bash
# Verify NUGET_TOKEN
echo $NUGET_TOKEN
# Get new token at https://www.nuget.org/account/
```

### Build errors: "missing dependencies"

```bash
# Reinstall dependencies
rm -rf node_modules packages/*/dist packages/sdk-dotnet/bin
./build-all.sh
```

## 📋 Build Artifacts Location

After building, find artifacts here:

```
packages/sdk-node/
├── dist/
│   ├── index.d.ts
│   ├── index.js
│   └── ...

packages/cli/
├── dist/
│   ├── index.js
│   └── ...

packages/sdk-python/
├── dist/
│   ├── your_org_observability-1.0.1-py3-none-any.whl
│   └── your-org-observability-1.0.1.tar.gz

packages/sdk-dotnet/
└── nupkg/
    └── YourOrg.Observability.1.0.1.nupkg
```

## 🔄 Updating Package Versions

To update versions before publishing:

```bash
# Update package.json versions
# Update pyproject.toml version
# Update .csproj Version

# Then rebuild and publish
./build-all.sh
./publish-local.sh
```

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

## ⚙️ Environment Variables

Optional environment variables for automation:

```bash
# npm authentication
npm login  # Interactive or set via .npmrc

# PyPI authentication
export PYPI_TOKEN="pypi-..."

# NuGet authentication
export NUGET_TOKEN="..."

# Build artifacts cleanup
export CLEAN_BUILD=true  # Remove previous builds before building
```

## 🎯 CI/CD vs Local Publishing

| Aspect | GitHub Actions | Local Scripts |
|--------|---|---|
| Setup | Automated | Manual login/tokens |
| Speed | Slower (builds on remote) | Faster (local machine) |
| Control | Limited to workflow | Full control |
| Testing | Automatic on tag | Manual before publish |
| Verification | Build logs in Actions | Real-time console output |
| Best for | Automated releases | Development & testing |

---

For questions or issues, see [CONTRIBUTING.md](./CONTRIBUTING.md) or open an issue on GitHub.
