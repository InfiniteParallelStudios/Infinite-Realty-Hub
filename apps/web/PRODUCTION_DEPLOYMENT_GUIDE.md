# 🚀 Production Deployment Guide - QR Code Lead Capture System

## 📋 Pre-Deployment Checklist

### ✅ **1. Domain & Hosting Setup**
- [ ] Purchase domain name (e.g., `infiniterealtyhub.com`)
- [ ] Choose hosting provider:
  - **Recommended**: Vercel (seamless Next.js deployment)
  - **Alternative**: Netlify, AWS, or DigitalOcean
- [ ] Configure SSL certificate (automatic with most modern hosts)

### ✅ **2. Database Setup**
- [ ] Set up production database:
  - **Recommended**: Supabase (PostgreSQL + Auth)
  - **Alternative**: PlanetScale, Railway, or AWS RDS
- [ ] Create production database tables
- [ ] Configure database connection string

### ✅ **3. Authentication Configuration**
- [ ] Configure Supabase authentication
- [ ] Set up email providers for auth
- [ ] Configure user roles and permissions
- [ ] Test login/logout flow

### ✅ **4. Environment Variables**
```bash
# Copy and customize the production environment file
cp .env.production.example .env.production

# Required variables:
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
DATABASE_URL=your-database-connection-string
```

## 🚀 Deployment Steps

### **Option A: Vercel Deployment (Recommended)**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel Dashboard**
   - Go to Vercel project settings
   - Add all production environment variables
   - Ensure `NODE_ENV=production`

3. **Custom Domain Setup**
   - Add your custom domain in Vercel settings
   - Update DNS records as instructed
   - SSL automatically configured

### **Option B: Traditional Hosting**

1. **Build Application**
   ```bash
   npm run build
   npm run start
   ```

2. **Configure Web Server**
   - Nginx/Apache configuration
   - SSL certificate setup
   - Process management (PM2)

## 🔧 Production Configuration Changes

### **1. Authentication Enforcement**
```typescript
// In production, authentication is automatically required
// Demo mode is disabled when NODE_ENV=production
const config = {
  enableDemoMode: false,  // Disabled in production
  requireAuth: true       // Enabled in production
}
```

### **2. Database Migration**
```sql
-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  message TEXT,
  interested_in VARCHAR(100),
  agent_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent profiles table
CREATE TABLE agent_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) DEFAULT 'Real Estate Agent',
  company VARCHAR(255) DEFAULT 'Infinite Realty Hub',
  phone VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. QR Code URLs**
- Development: `http://192.168.1.218:3000/capture?...`
- Production: `https://yourdomain.com/capture?...`

## 🧪 Production Testing Protocol

### **Pre-Launch Tests**
1. **Authentication Flow**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Password reset works
   - [ ] Protected routes redirect properly

2. **QR Code System**
   - [ ] QR codes generate correctly
   - [ ] QR codes scan properly on mobile
   - [ ] Capture forms load on mobile
   - [ ] Leads submit successfully
   - [ ] Leads appear in dashboard

3. **Mobile Compatibility**
   - [ ] QR codes readable by camera apps
   - [ ] Forms responsive on all devices
   - [ ] Touch interactions work properly

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Test capture form submission
artillery quick --count 50 --num 10 https://yourdomain.com/capture
```

## 📊 Production Monitoring

### **1. Analytics Setup**
```typescript
// Add Google Analytics or similar
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **2. Error Monitoring**
```typescript
// Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn
```

### **3. Performance Monitoring**
- Vercel Analytics (built-in)
- Core Web Vitals tracking
- QR generation performance metrics

## 🔄 Deployment Workflow

### **1. Development → Staging → Production**
```bash
# 1. Development testing
npm run dev

# 2. Staging deployment
vercel --target staging

# 3. Production deployment (after testing)
vercel --prod
```

### **2. Database Migrations**
```bash
# Run migrations in staging first
npx supabase db push --db-url staging-db-url

# Then in production
npx supabase db push --db-url production-db-url
```

## 🔐 Security Considerations

### **Production Security Checklist**
- [ ] All API keys stored in environment variables
- [ ] Database has proper access controls
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Input validation on all forms

### **QR Code Security**
- [ ] Capture form validation
- [ ] Lead data encryption
- [ ] Agent isolation (agents only see their leads)

## 📈 Scaling Considerations

### **Traffic Growth**
- **Low Traffic** (< 1000 leads/month): Vercel Hobby + Supabase Free
- **Medium Traffic** (1000-10000 leads/month): Vercel Pro + Supabase Pro
- **High Traffic** (> 10000 leads/month): Custom infrastructure

### **Database Scaling**
```sql
-- Add indexes for performance
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

## 🎯 Success Metrics

### **Key Performance Indicators**
- QR code generation success rate
- Mobile form completion rate  
- Lead capture conversion rate
- Agent adoption rate
- System uptime (99.9% target)

---

## 🚨 Emergency Procedures

### **Rollback Plan**
```bash
# Quick rollback to previous deployment
vercel rollback
```

### **Database Recovery**
```bash
# Restore from backup
pg_restore --dbname=production_db backup_file.sql
```

### **Monitoring Alerts**
- Set up alerts for:
  - High error rates
  - Slow response times
  - Failed QR generation
  - Database connection issues

---

**🎉 Ready for Launch!**

Following this guide ensures your QR code lead capture system is production-ready with proper security, monitoring, and scalability.