#!/bin/bash

# Deploy to AWS - Staging Environment
# This script is called from GitHub Actions CI/CD pipeline

set -e

echo "🚀 Starting deployment to AWS Staging Environment..."

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-staging}
APP_NAME=${APP_NAME:-infinite-realty-hub}
ECR_REPOSITORY=${ECR_REPOSITORY_URL}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check required environment variables
check_env_vars() {
    log "Checking required environment variables..."
    
    required_vars=(
        "AWS_REGION"
        "ENVIRONMENT"
        "ECR_REPOSITORY_URL"
        "ECS_CLUSTER_NAME"
        "ECS_SERVICE_NAME"
        "DATABASE_URL"
        "REDIS_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    log "All required environment variables are set"
}

# Login to AWS ECR
ecr_login() {
    log "Logging into AWS ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
    log "Successfully logged into ECR"
}

# Build and push Docker image
build_and_push() {
    log "Building Docker image..."
    
    # Build image
    docker build -t $APP_NAME:latest -f services/api/Dockerfile .
    
    # Tag for ECR
    docker tag $APP_NAME:latest $ECR_REPOSITORY:latest
    docker tag $APP_NAME:latest $ECR_REPOSITORY:$GITHUB_SHA
    
    log "Pushing Docker image to ECR..."
    docker push $ECR_REPOSITORY:latest
    docker push $ECR_REPOSITORY:$GITHUB_SHA
    
    log "Docker image pushed successfully"
}

# Update ECS service
update_ecs_service() {
    log "Updating ECS service..."
    
    # Get current task definition
    TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $ECS_TASK_DEFINITION_NAME --region $AWS_REGION)
    
    # Update image in task definition
    NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "$ECR_REPOSITORY:$GITHUB_SHA" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresCompatibilities) | del(.placementConstraints) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
    
    # Register new task definition
    NEW_TASK_INFO=$(aws ecs register-task-definition --region $AWS_REGION --cli-input-json "$NEW_TASK_DEFINITION")
    NEW_REVISION=$(echo $NEW_TASK_INFO | jq '.taskDefinition.revision')
    
    # Update service
    aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --task-definition $ECS_TASK_DEFINITION_NAME:$NEW_REVISION --region $AWS_REGION
    
    log "ECS service updated with new task definition revision: $NEW_REVISION"
}

# Wait for deployment to complete
wait_for_deployment() {
    log "Waiting for deployment to complete..."
    
    aws ecs wait services-stable --cluster $ECS_CLUSTER_NAME --services $ECS_SERVICE_NAME --region $AWS_REGION
    
    log "Deployment completed successfully"
}

# Run health check
health_check() {
    log "Running health check..."
    
    # Get load balancer DNS name
    ALB_DNS=$(aws elbv2 describe-load-balancers --names $APP_NAME-alb --region $AWS_REGION --query 'LoadBalancers[0].DNSName' --output text)
    
    # Wait for service to be healthy
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s http://$ALB_DNS/health > /dev/null; then
            log "Health check passed!"
            return 0
        fi
        
        warn "Health check failed, retrying in 10 seconds... (attempt $((attempt + 1))/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Update application configuration
update_config() {
    log "Updating application configuration..."
    
    # Update Secrets Manager secrets if needed
    if [ -n "$DATABASE_URL" ]; then
        aws secretsmanager update-secret --secret-id "$APP_NAME/database-url" --secret-string "$DATABASE_URL" --region $AWS_REGION
    fi
    
    if [ -n "$REDIS_URL" ]; then
        aws secretsmanager update-secret --secret-id "$APP_NAME/redis-url" --secret-string "$REDIS_URL" --region $AWS_REGION
    fi
    
    log "Configuration updated successfully"
}

# Rollback function
rollback() {
    warn "Rolling back deployment..."
    
    # Get previous task definition
    PREVIOUS_TASK_DEFINITION=$(aws ecs describe-services --cluster $ECS_CLUSTER_NAME --services $ECS_SERVICE_NAME --region $AWS_REGION --query 'services[0].taskDefinition' --output text)
    
    # Get previous revision number
    CURRENT_REVISION=$(echo $PREVIOUS_TASK_DEFINITION | grep -o '[0-9]*$')
    PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
    
    if [ $PREVIOUS_REVISION -gt 0 ]; then
        aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --task-definition $ECS_TASK_DEFINITION_NAME:$PREVIOUS_REVISION --region $AWS_REGION
        log "Rolled back to task definition revision: $PREVIOUS_REVISION"
    else
        error "No previous revision found for rollback"
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment process..."
    
    # Set trap for cleanup on error
    trap 'error "Deployment failed"; rollback' ERR
    
    check_env_vars
    ecr_login
    build_and_push
    update_config
    update_ecs_service
    wait_for_deployment
    health_check
    
    log "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "health-check")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check}"
        exit 1
        ;;
esac
