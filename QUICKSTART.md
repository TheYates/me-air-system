# Quick Start Guide - Connecting to Supabase

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Go to **Settings** → **API**
6. Copy **Project URL** and **anon public key**

### Step 2: Create `.env.local` File

Create a file named `.env.local` in the root directory:

```env
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace the values with your actual Supabase credentials!

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Test Database Connection

```bash
pnpm dev
```

Then visit: http://localhost:3000/api/test-db

You should see:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "stats": {
    "departments": 14,
    "equipment": 682
  }
}
```

## ✅ You're Connected!

Your app is now connected to Supabase. Here's what you can do:

### Test the Departments API

```bash
# Get all departments
curl http://localhost:3000/api/departments

# Get specific department
curl http://localhost:3000/api/departments?id=1
```

### Use Database in Your Code

```typescript
import { db } from "@/db";
import { departments, equipment } from "@/db/schema";

// Fetch all departments
const allDepts = await db.select().from(departments);

// Fetch with conditions
import { eq } from "drizzle-orm";
const dept = await db.select()
  .from(departments)
  .where(eq(departments.id, 1));
```

## 📁 Files Created

- ✅ `db/index.ts` - Database connection
- ✅ `db/schema.ts` - Database schema definitions
- ✅ `drizzle.config.ts` - Drizzle configuration
- ✅ `lib/supabase.ts` - Supabase client (for client-side)
- ✅ `app/api/test-db/route.ts` - Test endpoint
- ✅ `app/api/departments/route.ts` - Departments CRUD API
- ✅ `.env.example` - Environment variables template

## 🛠️ Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm db:generate  # Generate migrations
```

## 🔍 Drizzle Studio

View and edit your database with a GUI:

```bash
pnpm db:studio
```

This opens a web interface at https://local.drizzle.studio

## 📊 Your Database Tables

- `activities` - Activity logs
- `departments` - Department information
- `equipment` - Equipment inventory
- `equipment_documents` - Equipment documentation
- `equipment_photos` - Equipment photos
- `equipment_specifications` - Equipment specifications
- `maintenance_records` - Maintenance history
- `maintenance_schedule` - Scheduled maintenance
- `maintenance_types` - Types of maintenance
- `service_contracts` - Service contract information
- `users` - User accounts

## 🐛 Troubleshooting

### "Failed to connect to database"

1. Check your `.env.local` file exists
2. Verify DATABASE_URL is correct
3. Make sure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
4. Try adding `?sslmode=require` to your DATABASE_URL

### "Module not found: Can't resolve '@/db'"

Restart your dev server:
```bash
# Stop the server (Ctrl+C)
pnpm dev
```

### SSL Certificate Error

Add this to your DATABASE_URL:
```
?sslmode=require
```

## 📚 Next Steps

1. ✅ Test the connection
2. Create more API routes for equipment, maintenance, etc.
3. Update your frontend to use the new API endpoints
4. Add authentication with Supabase Auth
5. Deploy to Vercel/Netlify

## 🔗 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Need help?** Check `SUPABASE_SETUP.md` for detailed setup instructions.

