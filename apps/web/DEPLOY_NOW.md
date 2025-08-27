# ⚡ Deploy IRH QR System NOW - Quick Guide

## 🎯 Target: `irh.infiniteparallelstudios.com`

### **⏰ 10-Minute Deployment**

```bash
# 1. Install Vercel (if needed)
npm install -g vercel

# 2. Deploy from your project
cd /Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web
vercel login
vercel --prod
```

### **🌐 DNS Setup (in your domain registrar)**

Add this DNS record to `infiniteparallelstudios.com`:
```
Type: CNAME
Name: irh
Value: cname.vercel-dns.com
TTL: 300 (5 minutes)
```

### **⚙️ Environment Variables (in Vercel Dashboard)**

Go to your project → Settings → Environment Variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_DOMAIN=https://irh.infiniteparallelstudios.com
ENABLE_DEMO_MODE=false
```

### **✅ After Deployment - Test These URLs:**

1. **Main Site**: https://irh.infiniteparallelstudios.com
2. **QR Generator**: https://irh.infiniteparallelstudios.com/qr-generator
3. **Sample QR URL**: https://irh.infiniteparallelstudios.com/capture?agent_name=Test&agent_email=test@test.com

### **📱 Mobile QR Test:**

1. Generate QR code on site
2. Scan with phone camera
3. Should open: `https://irh.infiniteparallelstudios.com/capture?...`
4. Fill form and submit
5. Check leads dashboard

---

## 🚨 If You Need Help

**Vercel Support**: https://vercel.com/help
**DNS Help**: Contact your domain registrar
**Technical Issues**: Check browser console (F12)

---

## 🎉 What Happens After Deployment:

✅ **Professional URL**: No more localhost/IP addresses
✅ **Mobile QR Codes**: Work from anywhere in the world  
✅ **SSL Security**: Automatic HTTPS encryption
✅ **Global CDN**: Fast loading worldwide
✅ **Production Ready**: Authentication required (no demo mode)

**Ready to launch! 🚀**