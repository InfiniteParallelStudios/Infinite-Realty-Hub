# Docker Configurations

This directory contains Docker configurations for containerizing services.

## Directory Structure

- `Dockerfile.api` - API service container
- `Dockerfile.auth` - Authentication service container
- `docker-compose.yml` - Multi-service orchestration
- `docker-compose.dev.yml` - Development environment

## Usage

```bash
# Build all services
docker-compose build

# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start production environment
docker-compose up -d
```
