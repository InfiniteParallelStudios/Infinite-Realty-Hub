# 🚀 IRH Subdomain Deployment Guide

## 🎯 Target Domain: `irh.infiniteparallelstudios.com`

### **Current Setup:**
- **Development**: `http://192.168.1.218:3000` (local network)
- **Production**: `https://irh.infiniteparallelstudios.com` (live site)
- **Future Migration**: Can move to `infiniterealtyhub.com` later if needed

---

## 📋 Step-by-Step Deployment

### **1. ⚡ Quick Vercel Deployment (Recommended - 10 minutes)**

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from your project directory
cd /Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web
vercel --prod

# 4. Follow prompts:
# - Link to existing project? No
# - What's your project's name? infinite-realty-hub
# - In which directory is your code located? ./
# - Want to override settings? No
```

### **2. 🌐 Configure Custom Domain in Vercel**

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Select your `infinite-realty-hub` project

2. **Add Custom Domain**:
   - Go to Settings → Domains
   - Add domain: `irh.infiniteparallelstudios.com`
   - Vercel will provide DNS instructions

3. **Update DNS Records** (in your domain registrar):
   ```
   Type: CNAME
   Name: irh
   Value: cname.vercel-dns.com
   ```

### **3. ⚙️ Environment Variables Setup**

In Vercel Dashboard → Settings → Environment Variables:

```bash
# Required Variables
NODE_ENV=production
NEXT_PUBLIC_DOMAIN=https://irh.infiniteparallelstudios.com

# Authentication (add when ready)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Disable demo mode in production
ENABLE_DEMO_MODE=false
```

---

## 🔧 Alternative: Manual Hosting Setup

### **Option A: DigitalOcean/AWS/Linode**

```bash
# 1. Build the application
npm run build

# 2. Start production server
npm run start

# 3. Set up reverse proxy (Nginx)
server {
    listen 80;
    server_name irh.infiniteparallelstudios.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 4. SSL with Let's Encrypt
certbot --nginx -d irh.infiniteparallelstudios.com
```

---

## 🧪 Pre-Launch Testing

### **1. Local Testing with Production Config**

```bash
# 1. Create production environment file
cp .env.production.example .env.production

# 2. Update with your values
NEXT_PUBLIC_DOMAIN=https://irh.infiniteparallelstudios.com
NODE_ENV=production
ENABLE_DEMO_MODE=false

# 3. Test production build locally
npm run build
npm run start

# 4. Test QR generation with production URLs
```

### **2. QR Code URL Testing**

The QR codes will generate URLs like:
```
https://irh.infiniteparallelstudios.com/capture?agent_name=John+Doe&agent_email=john@infiniteparallelstudios.com&agent_phone=555-123-4567&agent_company=Infinite+Realty+Hub
```

### **3. Mobile Testing Checklist**

- [ ] QR codes generate visually
- [ ] QR codes scan properly on iPhone/Android
- [ ] Capture forms load on mobile browsers
- [ ] Forms are responsive and touch-friendly
- [ ] Lead submissions work correctly
- [ ] Confirmation pages display properly

---

## 📊 Post-Deployment Monitoring

### **1. Vercel Analytics** (Built-in)
- Automatic performance monitoring
- Core Web Vitals tracking
- Traffic analytics

### **2. Custom Monitoring**

```javascript
// Add to pages for tracking QR scans
gtag('event', 'qr_scan', {
  agent_email: params.agent_email,
  source: 'qr_code'
});

// Track lead submissions
gtag('event', 'lead_submitted', {
  agent_email: formData.agent_email,
  interested_in: formData.interested_in
});
```

---

## 🔄 Future Migration Path

### **When Ready for `infiniterealtyhub.com`:**

1. **Buy new domain**
2. **Update configuration**:
   ```bash
   NEXT_PUBLIC_DOMAIN=https://infiniterealtyhub.com
   ```
3. **Add domain in Vercel**
4. **Set up 301 redirects** from old subdomain
5. **Update existing QR codes** (if needed)

---

## 💳 Cost Breakdown

### **Current Setup (Subdomain)**
- **Domain**: Already owned ✅
- **Vercel**: Free tier (plenty for starting)
- **SSL**: Free (automatic with Vercel)
- **Total Additional Cost**: $0/month

### **When Scaling Up**
- **Vercel Pro**: $20/month (if needed for more traffic)
- **Database**: $0-25/month (Supabase free tier initially)
- **Total**: $0-45/month depending on usage

---

## ⚡ Quick Start Commands

```bash
# Deploy to production right now:
cd /Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web
vercel --prod

# Add domain in Vercel dashboard
# Update DNS: CNAME irh → cname.vercel-dns.com
# Add environment variables
# Done! ✅
```

---

## 🎉 Success Metrics

After deployment, you should see:

- ✅ `https://irh.infiniteparallelstudios.com` loads the app
- ✅ QR codes generate with the correct domain
- ✅ Mobile scanning works perfectly
- ✅ Lead capture forms submit successfully
- ✅ SSL certificate shows as secure
- ✅ Fast loading times (< 2 seconds)

**Ready to deploy when you are!** 🚀