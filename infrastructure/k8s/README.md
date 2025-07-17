# Kubernetes Manifests

This directory contains Kubernetes deployment manifests for the platform.

## Directory Structure

- `deployments/` - Deployment configurations
- `services/` - Service configurations
- `configmaps/` - Configuration maps
- `secrets/` - Secret management
- `ingress/` - Ingress configurations

## Usage

```bash
# Apply all manifests
kubectl apply -f .

# Deploy specific service
kubectl apply -f deployments/api-deployment.yaml

# Check deployment status
kubectl get deployments
```

## Prerequisites

- Kubernetes cluster access
- kubectl configured
- Appropriate cluster permissions
