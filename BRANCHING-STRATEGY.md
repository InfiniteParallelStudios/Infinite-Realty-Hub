# 🌿 Git Branching Strategy - Infinite Realty Hub

## 📋 Branch Structure

### **Main Branches**

#### `main` 
- **Production-ready code only**
- Protected branch
- Only merge from `development` when fully tested
- Tagged releases for versioning
- **No direct commits allowed**

#### `development`
- **Active development branch**
- All feature branches merge here first
- Continuous integration testing
- Code reviews before merging to main
- **Current working branch**

### **Feature Branches**

Create feature branches from `development`:

```bash
# CRM Module
git checkout -b feature/crm-contacts
git checkout -b feature/crm-leads
git checkout -b feature/crm-pipeline

# Dashboard Features
git checkout -b feature/dashboard-widgets
git checkout -b feature/market-data
git checkout -b feature/analytics

# Store/Billing
git checkout -b feature/store-marketplace
git checkout -b feature/subscription-system
git checkout -b feature/billing-integration

# UI/UX Improvements
git checkout -b feature/mobile-responsive
git checkout -b feature/theme-enhancements
git checkout -b feature/accessibility

# Infrastructure
git checkout -b feature/database-migrations
git checkout -b feature/performance-optimization
git checkout -b feature/deployment-setup
```

### **Hotfix Branches**

For critical production fixes:
```bash
git checkout -b hotfix/critical-auth-bug main
# Fix the issue
git checkout main
git merge hotfix/critical-auth-bug
git checkout development 
git merge hotfix/critical-auth-bug
```

## 🔄 Workflow Process

### **1. Feature Development**
```bash
# Start new feature
git checkout development
git pull origin development
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "feat: add new feature functionality"

# Push feature branch
git push -u origin feature/new-feature
```

### **2. Code Review & Merge**
```bash
# Create PR: feature/new-feature → development
# After review approval:
git checkout development
git merge feature/new-feature
git push origin development

# Clean up
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### **3. Release to Production**
```bash
# When development is stable and tested
git checkout main
git merge development
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"
git push origin main --tags
```

## 🎯 Current Branch Status

- ✅ **development**: Active development with auth system complete
- 🔒 **main**: Protected, awaiting first production release
- 🚧 **Next up**: Create feature branches for CRM module

## 📝 Commit Message Format

```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Build/config changes

**Examples:**
```
feat(auth): implement Google OAuth with Supabase
fix(ui): resolve theme toggle animation glitch  
docs(api): update CRM endpoint documentation
```

## 🚀 Ready for Next Feature

Current status: **Ready to create CRM feature branches**

Next recommended branches:
1. `feature/crm-database-schema`
2. `feature/crm-contacts-list`
3. `feature/crm-lead-pipeline`

---

**Repository:** https://github.com/InfiniteParallelStudios/infinite-realty-hub
**Current Branch:** `development`
**Protection:** `main` branch protected for production releases