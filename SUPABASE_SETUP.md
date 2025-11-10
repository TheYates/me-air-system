# Supabase Setup Guide for ME-AIR System

## Prerequisites
- Supabase account created
- Database and tables created in Supabase
- Data imported from `meair.sql`

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on your project
3. Go to **Settings** → **Database**
4. Find your **Connection String** (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Go to **Settings** → **API**
6. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**

## Step 2: Create `.env.local` File

Create a file named `.env.local` in the root of your project with the following content:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Project Details
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# API URL (optional - for custom backend)
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

**Replace:**
- `[YOUR-PASSWORD]` with your database password
- `[YOUR-PROJECT-REF]` with your project reference (e.g., `abcdefghijklmnop`)
- `[YOUR-ANON-KEY]` with your anon/public key

## Step 3: Install Dependencies (if not already installed)

```bash
pnpm install
```

The following packages are already in your `package.json`:
- `drizzle-orm` - ORM for database operations
- `drizzle-kit` - Database migration tool
- `pg` - PostgreSQL client
- `@supabase/supabase-js` - Supabase client library

## Step 4: Verify Database Connection

You can test the connection by running:

```bash
pnpm drizzle-kit push
```

This will sync your schema with the database.

## Step 5: Using the Database in Your App

### Example: Fetching Departments

```typescript
import { db } from "@/db";
import { departments } from "@/db/schema";

// Fetch all departments
const allDepartments = await db.select().from(departments);

// Fetch with conditions
import { eq } from "drizzle-orm";
const dept = await db.select().from(departments).where(eq(departments.id, 1));
```

### Example: Creating API Routes

Create a file `app/api/departments/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { departments } from "@/db/schema";

export async function GET() {
  try {
    const allDepartments = await db.select().from(departments);
    return NextResponse.json(allDepartments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
```

## Step 6: Run Your Application

```bash
pnpm dev
```

Your app should now be connected to Supabase!

## Troubleshooting

### Connection Issues
- Make sure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
- Verify your DATABASE_URL is correct
- Check if the password contains special characters that need URL encoding

### SSL Issues
If you get SSL errors, modify your DATABASE_URL:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Migration Issues
If you need to reset migrations:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Database Schema

Your database includes the following tables:
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

All tables are defined in `db/schema.ts` and can be imported for use in your application.

