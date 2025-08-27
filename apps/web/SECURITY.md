# 🔒 Security Guide - Infinite Realty Hub

## 🛡️ Security Overview

This document outlines the security measures and best practices implemented in Infinite Realty Hub to protect user data, API keys, and application integrity.

## 🚨 Critical Security Rules

### **1. Environment Variables**
- ❌ **NEVER** commit `.env.local` or any `.env*` files
- ✅ **ALWAYS** use `.env.local.example` as a template
- ✅ **ALWAYS** use different keys for development, staging, and production
- ✅ **ROTATE** API keys and secrets regularly

### **2. API Keys & Secrets**
- ❌ **NEVER** hardcode API keys in source code
- ❌ **NEVER** commit GitHub tokens, Supabase keys, or OAuth secrets
- ✅ **USE** environment variables for all sensitive data
- ✅ **STORE** production secrets in secure secret managers

### **3. Version Control**
- ❌ **NEVER** commit files containing secrets
- ✅ **REVIEW** all commits before pushing
- ✅ **USE** .gitignore to exclude sensitive files
- ✅ **SCAN** for accidentally committed secrets

## 🔧 Security Implementation

### **Environment Security**
```bash
# ✅ Good - Using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

# ❌ Bad - Hardcoded secrets
const supabaseUrl = "https://abc123.supabase.co"
const supabaseKey = "eyJhbG..."
```

### **Git Security**
```bash
# Check what's being committed
git status
git diff --cached

# Scan for secrets before commit
git secrets --scan

# Remove accidentally committed secrets
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch secret-file.env" \
--prune-empty --tag-name-filter cat -- --all
```

### **Supabase Security**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ User authentication via Google OAuth
- ✅ API keys properly scoped (anon vs service role)
- ✅ Database policies restrict data access

## 📝 Security Checklist

### **Before Every Commit**
- [ ] No `.env*` files staged
- [ ] No API keys or secrets in code
- [ ] No MCP server configurations
- [ ] No debugging credentials
- [ ] Review all staged files

### **Before Deployment**
- [ ] Environment variables configured
- [ ] Production secrets in secret manager
- [ ] Database RLS policies active
- [ ] SSL/HTTPS enabled
- [ ] OAuth redirect URLs configured

### **Regular Security Maintenance**
- [ ] Rotate API keys monthly
- [ ] Update dependencies regularly
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs
- [ ] Audit user permissions

## 🚫 Files That Should NEVER Be Committed

### **Environment & Configuration**
```
.env
.env.local
.env.production
*.env
mcp.json
claude-config.json
```

### **Secrets & Keys**
```
*secret*
*key*
*token*
*password*
*.pem
*.p12
*.pfx
*.jwt
```

### **MCP & AI Tools**
```
mcp-server*/
.claude/
.ai-config
*.mcp
claude-context.json
```

### **Development Files**
```
.DS_Store
*.log
node_modules/
.vscode/
.idea/
```

## 🔍 Security Scanning

### **Pre-commit Scanning**
```bash
# Install git-secrets
brew install git-secrets

# Configure for repository
git secrets --register-aws
git secrets --install

# Add custom patterns
git secrets --add 'supabase.*[0-9a-zA-Z]{40}'
git secrets --add 'github_pat_[0-9a-zA-Z]{22,255}'
```

### **Dependency Scanning**
```bash
# Audit npm packages
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## 🛠️ Security Tools

### **Recommended Tools**
- **git-secrets** - Prevent secrets in git repos
- **truffleHog** - Find secrets in git history
- **npm audit** - Scan dependencies
- **Snyk** - Vulnerability monitoring
- **OWASP ZAP** - Security testing

### **VS Code Extensions**
- **GitLens** - Git history and blame
- **Secrets Lens** - Detect potential secrets
- **SonarLint** - Code quality and security

## 📊 Authentication Security

### **Google OAuth Flow**
1. User initiates OAuth with Google
2. Google redirects to Supabase
3. Supabase validates and creates session
4. App receives secure tokens
5. User profile created/updated

### **Session Management**
- JWT tokens with expiration
- Automatic token refresh
- Secure cookie storage
- Session validation on route access

### **Data Protection**
- Row Level Security on all tables
- User data isolated by auth.uid()
- API endpoints require authentication
- Input validation and sanitization

## 🚨 Incident Response

### **If Secrets Are Compromised**
1. **Immediately** rotate the compromised secret
2. **Update** all applications using the secret
3. **Review** git history for the secret
4. **Notify** team members if applicable
5. **Document** the incident and resolution

### **If Unauthorized Access Detected**
1. **Revoke** user sessions immediately
2. **Change** all API keys and secrets
3. **Review** access logs and audit trail
4. **Notify** affected users if required
5. **Strengthen** security measures

## 📞 Security Contacts

### **Reporting Security Issues**
- **Email**: security@infiniteparallelstudios.com
- **GitHub**: Create private security advisory
- **Encryption**: Use GPG key [link to public key]

### **Security Team**
- **Lead**: Joshua Bray
- **Response Time**: 24 hours for critical issues
- **Disclosure**: Responsible disclosure policy

## 📚 Additional Resources

### **Security Guidelines**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

### **Compliance**
- GDPR compliance for user data
- SOC 2 Type II (Supabase)
- ISO 27001 (Infrastructure)

---

**🔒 Remember: Security is everyone's responsibility. When in doubt, err on the side of caution.**

Last Updated: 2025-08-19
Version: 1.0