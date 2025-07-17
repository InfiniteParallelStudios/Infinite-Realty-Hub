# Deployment Tools

This directory contains deployment scripts and utilities.

## Scripts

- `deploy-staging.sh` - Deploy to staging environment
- `deploy-production.sh` - Deploy to production environment
- `rollback.sh` - Rollback deployment
- `health-check.sh` - Post-deployment health checks

## Usage

```bash
# Make scripts executable
chmod +x *.sh

# Deploy to staging
./deploy-staging.sh

# Deploy to production
./deploy-production.sh

# Rollback if needed
./rollback.sh
```
