# 📋 Database Schema Application Instructions

## 🎯 Quick Manual Application

Since automatic application encountered RPC limitations, please apply the schema manually:

### **Step 1: Access Supabase SQL Editor**
1. Go to: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/sql
2. Click on "New Query" or use the main SQL editor

### **Step 2: Apply Schema**
1. Copy the entire content from: `packages/database/src/schema.sql`
2. Paste it into the SQL editor
3. Click "Run" to execute the schema

### **Step 3: Verify Installation**
After running the schema, you should see these tables created:
- ✅ `organizations` (multi-tenancy)
- ✅ `profiles` (extends auth.users)
- ✅ `module_subscriptions` (billing)
- ✅ `contacts` (CRM core)
- ✅ `communications` (contact history)
- ✅ `leads` (sales pipeline)
- ✅ `appointments` (calendar)
- ✅ `tasks` (task management)
- ✅ `widget_configs` (dashboard)
- ✅ `notifications` (alerts)
- ✅ `audit_logs` (tracking)

## 🔍 What The Schema Includes

### **Core Features:**
- **Multi-tenant Architecture**: Organizations with user isolation
- **Complete CRM System**: Contacts, leads, communications
- **Calendar Integration**: Appointments and scheduling
- **Task Management**: With priorities and relationships
- **Dashboard System**: Configurable widgets
- **Audit Trail**: Complete change tracking

### **Security Features:**
- **Row Level Security (RLS)**: Data isolation per user/organization
- **Role-based Access**: Agent, Broker, Admin, Team Lead
- **Secure Policies**: Users only see their own data

### **Performance Optimizations:**
- **Strategic Indexes**: For fast queries
- **Full-text Search**: On contacts and communications
- **Triggers**: Auto-update timestamps and computed fields

## 🚀 After Schema Application

Once the schema is applied, the authentication system will automatically:
1. ✅ Create user profiles when users sign in with Google
2. ✅ Assign appropriate roles and permissions
3. ✅ Enable full CRM functionality
4. ✅ Allow dashboard customization

## 🔧 Troubleshooting

If you encounter any errors:

1. **"Extension already exists"** - This is normal, continue
2. **"Table already exists"** - Normal if re-running
3. **"Permission denied"** - Make sure you're logged in as the project owner
4. **"Syntax error"** - Check that the entire schema was copied correctly

## 🎉 Success Indicators

You'll know it worked when:
- ✅ Tables appear in the Supabase dashboard
- ✅ Authentication creates profiles automatically
- ✅ Dashboard shows user welcome message with name
- ✅ No errors when navigating the app

## 📞 Next Steps

After applying the schema:
1. Test the authentication flow at http://localhost:3000
2. Sign in with Google to create your first profile
3. Verify the dashboard shows your name
4. Ready to start building CRM features!

---

**Need help?** The schema is located at: `/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/packages/database/src/schema.sql`