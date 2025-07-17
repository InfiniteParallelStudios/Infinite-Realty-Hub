# CI/CD Pipeline Guide

This document provides comprehensive information about the CI/CD pipeline for the Infinite Realty Hub project.

## Overview

The CI/CD pipeline is built using GitHub Actions and consists of multiple workflows:

- **`ci-cd.yml`** - Main CI/CD pipeline for code quality, testing, and deployment
- **`mobile-ci.yml`** - Mobile app specific CI/CD pipeline
- **`api-ci.yml`** - API service specific CI/CD pipeline
- **`release.yml`** - Release automation workflow

## Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Code Quality** - ESLint, Prettier, TypeScript checks
2. **Security** - npm audit, dependency vulnerability checks
3. **Package Tests** - Test all packages in parallel
4. **API Tests** - Test API service with PostgreSQL
5. **Mobile Tests** - Test mobile app
6. **Build Verification** - Build all packages and apps
7. **Deploy Staging** - Deploy to staging environment (main branch only)

### 2. Mobile CI Pipeline (`mobile-ci.yml`)

**Triggers:**
- Changes to `apps/mobile/` or `packages/`

**Jobs:**
1. **Mobile Tests** - Unit tests and type checking
2. **Android Build** - Build Android APK
3. **iOS Build** - Build iOS IPA (macOS runner)
4. **E2E Tests** - End-to-end testing with Detox
5. **Deploy Mobile** - Deploy to internal distribution

### 3. API CI Pipeline (`api-ci.yml`)

**Triggers:**
- Changes to `services/api/` or `packages/`

**Jobs:**
1. **API Tests** - Unit and integration tests
2. **Migration Tests** - Database migration testing
3. **Security Tests** - OWASP dependency check
4. **Performance Tests** - API performance testing
5. **Docker Build** - Build Docker container
6. **Deploy API** - Deploy to staging environment

### 4. Release Pipeline (`release.yml`)

**Triggers:**
- Tags matching `v*` pattern
- Manual workflow dispatch

**Jobs:**
1. **Create Release** - Generate changelog and create GitHub release
2. **Build Mobile Release** - Build production mobile apps
3. **Build API Release** - Build and push Docker image
4. **Deploy Production** - Deploy to production environment
5. **Update Versions** - Update package versions

## Required Secrets

The following secrets must be configured in your GitHub repository:

### Mobile App Secrets
- `EXPO_TOKEN` - Expo authentication token for builds

### API Service Secrets
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### Deployment Secrets
- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- `STAGING_API_URL` - Staging API URL for health checks
- `PRODUCTION_API_URL` - Production API URL for health checks

## Environment Configuration

### Staging Environment
- **Purpose**: Integration testing and QA
- **Trigger**: Automatic deployment on push to `main`
- **Approval**: Not required
- **URL**: To be configured

### Production Environment
- **Purpose**: Live production deployment
- **Trigger**: Manual release workflow
- **Approval**: Required
- **URL**: To be configured

## Branch Protection Rules

Configure the following branch protection rules:

### Main Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes to maintainers only

### Develop Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Allow force pushes for maintainers

## Local Development

### Running Tests Locally

```bash
# Run all tests
npm test

# Run specific workspace tests
npm run test --workspace=packages/utils
npm run test --workspace=services/api
npm run test --workspace=apps/mobile

# Run with coverage
npm run test:coverage --workspace=apps/mobile
```

### Code Quality Checks

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run prettier:check

# Fix formatting
npm run prettier:fix

# Type checking
npm run type-check
```

### Building

```bash
# Build all packages
npm run build:packages

# Build all apps
npm run build:apps

# Build everything
npm run build
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check if all dependencies are installed
   - Verify TypeScript compilation
   - Check for linting errors

2. **Test Failures**
   - Ensure test database is running
   - Check for missing environment variables
   - Verify test data setup

3. **Deployment Issues**
   - Check secrets configuration
   - Verify environment URLs
   - Check deployment permissions

### Debug Steps

1. Check workflow logs in GitHub Actions
2. Run tests locally to reproduce issues
3. Verify environment configuration
4. Check secrets and permissions

## Monitoring

### Build Status
- GitHub Actions dashboard
- Branch protection status
- Pull request checks

### Performance Metrics
- Test execution time
- Build duration
- Deployment success rate

### Notifications
- Build failure notifications (to be configured)
- Deployment success notifications (to be configured)
- Security vulnerability alerts

## Best Practices

1. **Commits**
   - Use conventional commit messages
   - Keep commits focused and atomic
   - Include tests with new features

2. **Pull Requests**
   - Fill out PR template completely
   - Include relevant reviewers
   - Wait for all checks to pass

3. **Deployments**
   - Test thoroughly in staging
   - Monitor deployment health
   - Have rollback plan ready

4. **Security**
   - Keep dependencies updated
   - Review security scan results
   - Rotate secrets regularly

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

## Support

For issues with the CI/CD pipeline, please:
1. Check this documentation
2. Review workflow logs
3. Open an issue with detailed information
4. Contact the development team
