# 🔍 SUPABASE GOOGLE OAUTH CONFIGURATION CHECKLIST

## ❗ The 401 Error Indicates:
Your Google OAuth is authenticating with Google successfully, but Supabase isn't creating a session. This means the callback URL configuration is mismatched.

## 🎯 **CRITICAL: Fix These Settings in Supabase Dashboard**

### 1. **Go to Supabase Authentication Settings:**
```
https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/auth/providers
```

### 2. **In Google Provider Settings, ensure:**

✅ **Google enabled:** ON

✅ **Authorized Client IDs:** (leave empty if not using custom client)

✅ **Skip nonce checks:** OFF (default)

### 3. **CRITICAL - Site URL Configuration:**
Go to: `Authentication → URL Configuration`
```
https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/auth/url-configuration
```

Set these EXACTLY:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** Add ALL of these:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/**
  http://localhost:3000
  ```

### 4. **In Google Cloud Console:**
```
https://console.cloud.google.com/apis/credentials
```

Your OAuth 2.0 Client should have these Authorized redirect URIs:
```
https://fncqxcmkylscjjbcxriu.supabase.co/auth/v1/callback
```

## 🔧 **IMMEDIATE FIX TO TRY:**

The issue is likely that Supabase is trying to redirect to a different URL than expected. Let me update the auth configuration to handle this properly.