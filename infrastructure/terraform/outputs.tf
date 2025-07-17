# Terraform Outputs for Infinite Realty Hub

# Network Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "NAT Gateway ID"
  value       = aws_nat_gateway.main.id
}

output "nat_gateway_ip" {
  description = "NAT Gateway public IP"
  value       = aws_eip.nat.public_ip
}

# Database Outputs
output "database_endpoint" {
  description = "RDS PostgreSQL database endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS PostgreSQL database port"
  value       = aws_db_instance.postgres.port
}

output "database_name" {
  description = "RDS PostgreSQL database name"
  value       = aws_db_instance.postgres.db_name
}

output "database_username" {
  description = "RDS PostgreSQL database username"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}

# Cache Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis cluster endpoint"
  value       = aws_elasticache_cluster.redis.cluster_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis cluster port"
  value       = aws_elasticache_cluster.redis.port
}

# Load Balancer Outputs
output "load_balancer_dns" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Application Load Balancer zone ID"
  value       = aws_lb.main.zone_id
}

output "load_balancer_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.api.name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = aws_ecs_task_definition.api.arn
}

# ECR Outputs
output "ecr_repository_url" {
  description = "ECR repository URL for API service"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.api.arn
}

# S3 Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.assets.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.assets.bucket_domain_name
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.assets.id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.assets.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.assets.arn
}

# Security Outputs
output "security_group_alb_id" {
  description = "Application Load Balancer security group ID"
  value       = aws_security_group.alb.id
}

output "security_group_api_id" {
  description = "API service security group ID"
  value       = aws_security_group.api.id
}

output "security_group_rds_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "security_group_redis_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# WAF Outputs
output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

# IAM Outputs
output "ecs_execution_role_arn" {
  description = "ECS execution role ARN"
  value       = aws_iam_role.ecs_execution.arn
}

output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task.arn
}

# Secrets Manager Outputs
output "database_secret_arn" {
  description = "Database URL secret ARN"
  value       = aws_secretsmanager_secret.database_url.arn
}

output "redis_secret_arn" {
  description = "Redis URL secret ARN"
  value       = aws_secretsmanager_secret.redis_url.arn
}

# CloudWatch Outputs
output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.api.name
}

output "log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.api.arn
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "app_name" {
  description = "Application name"
  value       = var.app_name
}

# Connection Strings (for CI/CD)
output "database_connection_string" {
  description = "Database connection string for applications"
  value       = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}:${aws_db_instance.postgres.port}/${aws_db_instance.postgres.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string for applications"
  value       = "redis://${aws_elasticache_cluster.redis.cluster_address}:${aws_elasticache_cluster.redis.port}"
  sensitive   = true
}

# URLs for applications
output "api_url" {
  description = "API service URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "cdn_url" {
  description = "CDN URL for static assets"
  value       = "https://${aws_cloudfront_distribution.assets.domain_name}"
}

# Resource counts for monitoring
output "resource_summary" {
  description = "Summary of created resources"
  value = {
    vpc_subnets           = length(aws_subnet.public) + length(aws_subnet.private)
    security_groups       = 4
    ecs_services         = 1
    rds_instances        = 1
    elasticache_clusters = 1
    load_balancers       = 1
    s3_buckets          = 1
    cloudfront_distributions = 1
    secrets             = 2
    log_groups          = 1
  }
}
