# Terraform Infrastructure

This directory contains Terraform configurations for AWS infrastructure.

## Directory Structure

- `main.tf` - Main Terraform configuration
- `variables.tf` - Input variables
- `outputs.tf` - Output values
- `terraform.tfvars.example` - Example variable values

## Usage

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

## Prerequisites

- AWS CLI configured
- Terraform >= 1.0
- Appropriate AWS permissions
