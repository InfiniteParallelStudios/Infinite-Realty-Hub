# AWS Infrastructure Setup Guide

## Overview
This guide walks through setting up the AWS infrastructure for the Infinite Realty Hub application using Terraform.

## Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- Terraform >= 1.0 installed

### 2. Required AWS Permissions
Your AWS user/role needs the following permissions:
- EC2 (VPC, subnets, security groups)
- ECS (clusters, services, tasks)
- RDS (PostgreSQL instances)
- ElastiCache (Redis clusters)
- ECR (container registry)
- Application Load Balancer
- S3 (static assets)
- CloudFront (CDN)
- Secrets Manager
- CloudWatch (logging)
- WAF (web application firewall)
- IAM (roles and policies)

## Setup Instructions

### Step 1: Configure AWS CLI
```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Prepare Terraform Configuration
```bash
# Navigate to terraform directory
cd infrastructure/terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

### Step 3: Initialize Terraform
```bash
# Initialize Terraform (first time only)
terraform init

# Optional: Create S3 bucket for state storage
aws s3 mb s3://infinite-realty-terraform-state-$(date +%s)
```

### Step 4: Plan and Apply Infrastructure
```bash
# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply
```

### Step 5: Configure GitHub Secrets
Add the following secrets to your GitHub repository:

#### AWS Configuration
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)

#### Infrastructure Configuration
- `ECR_REPOSITORY_NAME`: ECR repository name (e.g., infinite-realty-hub/api)
- `ECS_CLUSTER_NAME`: ECS cluster name (from Terraform output)
- `ECS_SERVICE_NAME`: ECS service name (from Terraform output)
- `ECS_TASK_DEFINITION_NAME`: ECS task definition name (from Terraform output)
- `APP_NAME`: Application name (e.g., infinite-realty-hub)

#### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string (from Terraform output)
- `REDIS_URL`: Redis connection string (from Terraform output)

## Terraform Variables

### Required Variables
```hcl
# Database password (must be at least 8 characters)
db_password = "your-secure-database-password"

# AWS region
aws_region = "us-east-1"

# Environment name
environment = "staging"
```

### Optional Variables
```hcl
# Application name
app_name = "infinite-realty-hub"

# Domain name
domain_name = "your-domain.com"

# Database configuration
db_instance_class = "db.t3.micro"
db_allocated_storage = 20

# ECS configuration
ecs_cpu = 256
ecs_memory = 512
ecs_desired_count = 1

# Feature flags
enable_waf = true
enable_cloudfront = true
enable_multi_az = false
```

## Post-Deployment Setup

### 1. Verify Infrastructure
```bash
# Check Terraform outputs
terraform output

# Verify ECS cluster
aws ecs describe-clusters --clusters infinite-realty-hub-cluster

# Check RDS instance
aws rds describe-db-instances --db-instance-identifier infinite-realty-hub-postgres
```

### 2. Test Database Connection
```bash
# Get database endpoint from Terraform output
DB_ENDPOINT=$(terraform output -raw database_endpoint)

# Test connection (replace with actual values)
psql -h $DB_ENDPOINT -U postgres -d infinite_realty_hub
```

### 3. Verify Load Balancer
```bash
# Get load balancer DNS
ALB_DNS=$(terraform output -raw load_balancer_dns)

# Test health endpoint (after deployment)
curl http://$ALB_DNS/health
```

## Security Configuration

### 1. WAF Rules
The infrastructure includes AWS WAF with:
- Common rule set (OWASP top 10)
- Known bad inputs protection
- Rate limiting (can be configured)

### 2. Security Groups
- ALB: Allows HTTP/HTTPS traffic
- API: Allows traffic from ALB only
- RDS: Allows PostgreSQL traffic from API only
- Redis: Allows Redis traffic from API only

### 3. Secrets Management
- Database credentials stored in AWS Secrets Manager
- Redis connection details in Secrets Manager
- ECS tasks retrieve secrets automatically

## Monitoring and Logging

### 1. CloudWatch
- ECS container logs: `/ecs/infinite-realty-hub/api`
- Log retention: 7 days (configurable)
- Container insights enabled

### 2. Health Checks
- Load balancer health checks on `/health`
- ECS service health monitoring
- Database connection monitoring

## Cost Optimization

### Free Tier Resources
- RDS: db.t3.micro (750 hours/month)
- ElastiCache: cache.t3.micro (750 hours/month)
- ECS: Fargate free tier
- S3: 5GB storage
- CloudFront: 50GB data transfer

### Estimated Monthly Costs (after free tier)
- RDS db.t3.micro: ~$15-20/month
- ElastiCache: ~$15-20/month
- ECS Fargate: ~$10-15/month
- ALB: ~$18/month
- NAT Gateway: ~$45/month
- **Total: ~$100-120/month**

## Troubleshooting

### Common Issues

#### 1. Terraform Apply Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Terraform state
terraform show

# Force unlock if needed
terraform force-unlock LOCK_ID
```

#### 2. ECS Service Won't Start
```bash
# Check ECS service events
aws ecs describe-services --cluster infinite-realty-hub-cluster --services infinite-realty-hub-api-service

# Check task definition
aws ecs describe-task-definition --task-definition infinite-realty-hub-api

# Check logs
aws logs get-log-events --log-group-name /ecs/infinite-realty-hub/api --log-stream-name <stream-name>
```

#### 3. Database Connection Issues
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test from ECS task
aws ecs execute-command --cluster infinite-realty-hub-cluster --task <task-id> --container api --interactive --command "/bin/bash"
```

## Cleanup

### Remove All Resources
```bash
# Destroy infrastructure
terraform destroy

# Remove S3 bucket (if created)
aws s3 rb s3://your-terraform-state-bucket --force
```

### Remove Specific Resources
```bash
# Remove specific resource
terraform destroy -target=aws_ecs_service.api

# Remove and recreate resource
terraform taint aws_ecs_service.api
terraform apply
```

## Next Steps

1. **Set up CI/CD Pipeline**: Configure GitHub Actions with AWS credentials
2. **Deploy Application**: Push code to trigger deployment
3. **Configure Domain**: Set up Route 53 and SSL certificates
4. **Enable Monitoring**: Set up CloudWatch alarms and dashboards
5. **Scale Configuration**: Adjust ECS service scaling based on load

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review ECS service events
3. Verify security group rules
4. Check Terraform state for drift
5. Review AWS service limits
