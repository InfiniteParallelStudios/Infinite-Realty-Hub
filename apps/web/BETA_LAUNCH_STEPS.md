# 🚀 BETA LAUNCH - Exact Steps to Go Live

## ⏰ Timeline: 15 minutes to live beta

### **STEP 1: Deploy to Vercel (5 minutes)**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to project
cd /Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel --prod

# When prompted:
# - What's your project's name? infinite-realty-hub
# - In which directory is your code located? ./
# - Want to modify these settings? No
```

### **STEP 2: Configure Custom Domain (5 minutes)**

1. **Get your Vercel URL** (something like `infinite-realty-hub-xyz.vercel.app`)
2. **Go to Vercel Dashboard**: https://vercel.com/dashboard
3. **Select your project** → Settings → Domains
4. **Add domain**: `irh.infiniteparallelstudios.com`

### **STEP 3: Update DNS (5 minutes)**

**In your domain registrar** (where you manage infiniteparallelstudios.com):

```
Type: CNAME
Name: irh
Value: cname.vercel-dns.com
TTL: 300
```

### **STEP 4: Beta Environment Variables**

**In Vercel Dashboard** → Settings → Environment Variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_DOMAIN=https://irh.infiniteparallelstudios.com
ENABLE_DEMO_MODE=true
```

**⚠️ BETA NOTE**: Keep `ENABLE_DEMO_MODE=true` for now so beta testers don't need accounts!

---

## 🧪 BETA TESTING SETUP

### **For Beta Testers - No Login Required!**

**Main URL**: https://irh.infiniteparallelstudios.com
**QR Generator**: https://irh.infiniteparallelstudios.com/qr-generator

### **Beta Test Flow:**
1. **Generate QR**: Fill form, click "Generate QR Code"
2. **Scan QR**: Use phone to scan
3. **Fill Form**: Complete lead capture form
4. **View Leads**: Check leads dashboard

### **Beta Tester Instructions:**

Send this to your beta testers:

---

**🧪 BETA TEST: Infinite Realty Hub QR System**

**What to test:**
1. Go to: https://irh.infiniteparallelstudios.com/qr-generator
2. Fill in your contact info
3. Generate a QR code
4. Scan it with your phone
5. Fill out the lead form that opens
6. Report any issues!

**What we want feedback on:**
- ✅ QR codes generate properly
- ✅ QR codes scan on your phone
- ✅ Forms work on mobile
- ✅ Overall user experience
- ❌ Any bugs or issues

**Send feedback to**: [your email]

---

## 📊 Beta Monitoring

### **Check These After Launch:**

1. **Main Site**: https://irh.infiniteparallelstudios.com ✅
2. **QR Generator**: https://irh.infiniteparallelstudios.com/qr-generator ✅  
3. **System Tests**: https://irh.infiniteparallelstudios.com/system-test ✅
4. **SSL Certificate**: Should show 🔒 in browser ✅

### **Beta Analytics:**
- Vercel provides built-in analytics
- Monitor QR generation success rate
- Track mobile form submissions
- Watch for error patterns

---

## 🔧 Beta Troubleshooting

### **Common Issues:**

**DNS not propagating?**
- Wait 5-30 minutes
- Use https://dnschecker.org to verify

**QR codes not working?**
- Check browser console (F12)
- Verify mobile has internet connection

**Forms not submitting?**
- Currently saves to browser storage
- Check leads dashboard for submissions

---

## 🎯 Success Metrics for Beta

**Week 1 Goals:**
- [ ] 10+ beta testers
- [ ] 50+ QR codes generated  
- [ ] 20+ lead submissions
- [ ] 0 critical bugs
- [ ] Positive feedback on mobile UX

**Ready to scale?**
- Add real authentication
- Set up production database
- Remove demo mode
- Launch! 🚀

---

## 🚨 Emergency Commands

**Rollback deployment:**
```bash
vercel rollback
```

**View logs:**
```bash
vercel logs
```

**Redeploy:**
```bash
vercel --prod
```