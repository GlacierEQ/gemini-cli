# Deployment Guide

This guide will help you integrate and deploy the Gemini CLI project.

## Quick Start

1. **Run the deployment script to check everything:**
   ```powershell
   .\deploy.ps1 -Action check
   ```

2. **Set up the environment:**
   ```powershell
   .\deploy.ps1 -Action setup
   ```

3. **Deploy to staging:**
   ```powershell
   .\deploy.ps1 -Action deploy -Environment staging
   ```

## Prerequisites

- Node.js 20+ installed
- npm installed
- Git installed
- GitHub Personal Access Token with `admin:org` scope

## Environment Setup

### 1. Set GitHub Personal Access Token

```powershell
$env:GITHUB_PAT = 'your_github_token_here'
```

### 2. Configure Repository Secrets

Go to your GitHub repository settings and add these secrets:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `NPM_TOKEN` | npm authentication token | Publishing to npm |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | CI/CD notifications |

### 3. Install Dependencies

```powershell
npm ci
```

## Deployment Process

### Automatic Deployment (Recommended)

The project uses GitHub Actions for automated CI/CD:

1. **Push to main branch** - Triggers build and test
2. **Push to release branch** - Triggers build, test, and npm publish
3. **Create version tag** - Triggers full release with GitHub Release

### Manual Deployment

```powershell
# Create and push a version tag
git tag v0.1.14
git push origin v0.1.14
```

## Self-Hosted Runner (Optional)

For better performance, set up a self-hosted runner:

```powershell
.\deploy.ps1 -Action runner
```

Or manually:

```powershell
.\scripts\setup-self-hosted-runner.ps1 -RunnerName "my-runner"
```

## CI/CD Pipeline

The enhanced CI/CD pipeline includes:

### 1. Lint and Format
- Code formatting checks
- ESLint validation
- TypeScript type checking

### 2. Test Matrix
- Node.js versions: 20.x, 22.x, 24.x
- Operating systems: Ubuntu, Windows, macOS
- Unit and integration tests

### 3. Security Scan
- npm audit for vulnerabilities
- Dependency review

### 4. Build and Publish
- Project build
- npm publishing (on release)
- GitHub Release creation (on tag)

### 5. Notifications
- Slack notifications for success/failure

## Monitoring Deployment

### GitHub Actions
- Check the Actions tab in your repository
- Monitor workflow runs and logs

### npm Package
- Verify package publication at https://www.npmjs.com/package/@google/gemini-cli

### GitHub Releases
- Check releases at https://github.com/GlacierEQ/gemini-cli/releases

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```powershell
   npm run lint:fix
   npm run format
   npm run build
   ```

2. **Test Failures**
   ```powershell
   npm run test:ci
   ```

3. **Authentication Issues**
   - Verify GitHub PAT has correct permissions
   - Check npm token is valid
   - Ensure secrets are properly set in repository

### Logs and Debugging

- Check GitHub Actions logs for detailed error information
- Use `npm run debug` for local debugging
- Review self-hosted runner logs: `Get-Content "C:\actions-runner\_diag\*.log"`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_VERSION` | 20 | Node.js version for CI |
| `REGISTRY` | ghcr.io | Container registry |
| `IMAGE_NAME` | repository name | Container image name |

## Release Process

1. **Update version** in package.json
2. **Commit changes** to main branch
3. **Create release branch** (optional)
4. **Create version tag** to trigger release
5. **Monitor deployment** in GitHub Actions

## Support

For deployment issues:
1. Check this deployment guide
2. Review GitHub Actions logs
3. Check the troubleshooting section in README.md
4. Create an issue in the repository