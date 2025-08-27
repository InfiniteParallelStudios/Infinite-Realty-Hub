# 🏢 Infinite Realty Hub

[![Development Status](https://img.shields.io/badge/status-active%20development-blue)](https://github.com/InfiniteParallelStudios/infinite-realty-hub)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

> **AI-powered real estate platform with JARVIS-style HUD interface**

A comprehensive real estate CRM and management platform featuring a stunning JARVIS-inspired user interface, Google OAuth authentication, and modular architecture for real estate professionals.

## ✨ Current Features

### 🎨 **JARVIS-Style HUD Interface**
- Animated infinity logo with glowing orbs
- Animated geometric backgrounds with rotating elements
- Glass morphism design with cyan/blue color scheme
- Mobile-first responsive design
- Light/Dark theme system with smooth transitions
- Data flow animations and HUD-style visual effects

### 📱 **Progressive Web App (PWA)**
- Installable web app with native experience
- Offline functionality with service worker
- Custom app icons and splash screens
- Background sync and push notifications
- Mobile-optimized touch interface

### 🔐 **Enhanced Authentication System**
- Dual authentication: Google OAuth + Email/Password
- Automatic user profile creation
- Session management and persistence
- Protected routes with authentication guards
- Forgot password functionality
- Mobile-optimized auth forms

### 📊 **Mobile-Ready Dashboard**
- Personalized welcome with user information
- Responsive statistics cards (1/2/4 column layouts)
- Touch-friendly navigation
- Theme toggle functionality
- PWA install prompts

### 📱 **QR Code Lead Generation**
- Agent QR code generator with contact info
- Mobile-optimized lead capture forms
- Automatic contact card generation (.vcf)
- Real-time form validation
- Professional thank you flow

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom JARVIS theme
- **Framer Motion** - Smooth animations
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Google OAuth** - Secure authentication

## 🏁 Quick Start

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud project (for OAuth)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/InfiniteParallelStudios/infinite-realty-hub.git
   cd infinite-realty-hub/apps/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Copy content from scripts/essential-schema.sql
   # Paste into Supabase SQL Editor and run
   ```

5. **Configure Google OAuth in Supabase**
   - Enable Google provider in Authentication > Providers
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Visit** http://localhost:3000

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Enhanced authentication pages
│   ├── dashboard/         # Mobile-ready dashboard
│   ├── qr-generator/      # QR code generation system
│   ├── capture/           # Lead capture forms
│   ├── test-qr/           # QR testing interface
│   └── settings/          # User settings
├── components/            # Reusable components
│   ├── auth/              # Auth guards and components
│   ├── layout/            # Layout with PWA integration
│   ├── pwa/               # PWA install prompts
│   ├── qr/                # QR code generation
│   └── ui/                # UI components (InfinityLogo, GlassCard, HudBackground)
├── contexts/              # React contexts
│   ├── auth-context.tsx   # Enhanced authentication state
│   └── theme-context.tsx  # Theme management
├── lib/                   # Utilities
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Helper functions
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── icons/                 # PWA icons (SVG)
```

## 🎯 Development Roadmap

### **Phase 1: Foundation** ✅ **COMPLETE**
- [x] JARVIS HUD interface design
- [x] Animated infinity logo with glowing orbs
- [x] Enhanced authentication (Google OAuth + Email/Password)
- [x] Mobile-first responsive design
- [x] Progressive Web App (PWA) capabilities
- [x] QR code lead generation system
- [x] Lead capture forms with contact cards
- [x] Theme system and security implementation

### **Phase 2: CRM Core** 📋 **NEXT UP**
- [ ] Contact management system
- [ ] Lead tracking and pipeline
- [ ] Communication logging
- [ ] Task management
- [ ] Appointment scheduling

### **Phase 3: Advanced Features** 🔮 **PLANNED**
- [ ] Market data integration
- [ ] Analytics and reporting
- [ ] Email automation
- [ ] Document management
- [ ] Mobile app (React Native)

## 🛠️ Development

### **Branch Strategy**
- `main` - Production releases only (protected)
- `development` - Active development
- `feature/*` - Individual features

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Testing Authentication**
```bash
# Test Supabase connection
node scripts/test-supabase-connection.js

# Visit test page for debugging
http://localhost:3000/auth/direct-test
```

## 🔒 Security

Comprehensive security measures implemented:

- ✅ Environment variables for all secrets
- ✅ Comprehensive .gitignore protection
- ✅ Row Level Security (RLS) in database
- ✅ Secure OAuth flow
- ✅ Protected routes and API endpoints

See [SECURITY.md](SECURITY.md) for detailed guidelines.

## 🎨 Design System

### **JARVIS Theme Colors**
```css
--jarvis-primary: #00d4ff     /* Bright cyan */
--jarvis-secondary: #0099cc   /* Darker cyan */
--jarvis-glow: #00ffff        /* Bright glow */
--jarvis-dark: #001a33        /* Deep blue */
```

### **Components**
- **GlassCard** - Glass morphism container with variants
- **HudBackground** - Animated JARVIS-style background
- **BottomNavigation** - Protected navigation bar
- **ThemeProvider** - Light/Dark theme system

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
npm run build
# Configure environment variables in Vercel dashboard
```

### **Environment Variables for Production**
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request to `development` branch

See [BRANCHING-STRATEGY.md](BRANCHING-STRATEGY.md) for workflow details.

## 📊 Current Status

- **Authentication**: ✅ Enhanced with Email/Password + Google OAuth
- **UI/UX**: ✅ Mobile-first JARVIS HUD interface with infinity logo
- **PWA**: ✅ Full Progressive Web App capabilities
- **QR System**: ✅ Lead generation with contact cards
- **Mobile**: ✅ Responsive design and touch optimization
- **Security**: ✅ Comprehensive protection implemented
- **Database**: ✅ Schema ready for CRM features
- **Deployment**: ✅ Ready for production

## 🆘 Support

- **Repository**: [GitHub](https://github.com/InfiniteParallelStudios/infinite-realty-hub)
- **Issues**: [Report Issues](https://github.com/InfiniteParallelStudios/infinite-realty-hub/issues)
- **Branch**: Currently on `development`

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🚀 Built with [Claude Code](https://claude.ai/code) - Ready to revolutionize real estate!**

**Repository**: https://github.com/InfiniteParallelStudios/infinite-realty-hub