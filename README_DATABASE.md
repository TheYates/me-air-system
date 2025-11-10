# ME-AIR Database Setup with Supabase

This guide will help you connect your ME-AIR Equipment Maintenance Management System to Supabase.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Prerequisites

✅ Supabase account created at [supabase.com](https://supabase.com)  
✅ Database created in Supabase  
✅ Data imported from `meair.sql` file  
✅ Node.js and pnpm installed

## Quick Start

### 1. Install Missing Dependencies

```bash
pnpm add postgres
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Supabase Project Details
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

**Get your credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. **Database URL**: Settings → Database → Connection String (URI)
4. **Project URL & Key**: Settings → API

### 3. Test Connection

```bash
# Start development server
pnpm dev

# Visit test endpoint
# Open: http://localhost:3000/api/test-db
```

Expected response:
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

## Detailed Setup

### Project Structure

```
me-air-system/
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Table schemas
├── app/
│   └── api/
│       ├── test-db/      # Connection test endpoint
│       ├── departments/  # Departments CRUD API
│       └── equipment/    # Equipment CRUD API
├── lib/
│   └── supabase.ts       # Supabase client
├── drizzle.config.ts     # Drizzle ORM config
├── .env.local            # Environment variables (create this)
└── .env.example          # Environment template
```

### Database Connection Files

#### `db/index.ts`
Establishes connection to PostgreSQL using Drizzle ORM:
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
```

#### `db/schema.ts`
Defines all database tables and their relationships.

#### `drizzle.config.ts`
Configuration for Drizzle Kit (migrations, schema push, studio).

## Database Schema

### Tables Overview

| Table | Description | Records |
|-------|-------------|---------|
| `departments` | Department information | ~14 |
| `equipment` | Equipment inventory | ~682 |
| `maintenance_records` | Maintenance history | Variable |
| `maintenance_schedule` | Scheduled maintenance | Variable |
| `maintenance_types` | Types of maintenance | Variable |
| `equipment_documents` | Equipment documentation | Variable |
| `equipment_photos` | Equipment photos | Variable |
| `equipment_specifications` | Equipment specs | Variable |
| `service_contracts` | Service contracts | Variable |
| `activities` | Activity logs | Variable |
| `users` | User accounts | Variable |

### Key Tables Schema

#### Departments
```typescript
{
  id: serial
  name: varchar(255)
  manager: varchar(255)
  email: varchar(255)
  phone: varchar(20)
  description: text
  subUnits: json
  budget: numeric(15,2)
  employees: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Equipment
```typescript
{
  id: serial
  name: varchar(255)
  manufacturer: varchar(255)
  tagNumber: varchar(255)
  status: varchar(50) // 'operational', 'maintenance', 'broken'
  departmentId: integer
  purchaseType: varchar(50)
  purchaseCost: numeric(15,2)
  // ... and many more fields
}
```

## API Endpoints

### Test Connection
```
GET /api/test-db
```

### Departments

```
GET    /api/departments           # Get all departments
GET    /api/departments?id=1      # Get specific department
POST   /api/departments           # Create department
PUT    /api/departments           # Update department
DELETE /api/departments?id=1      # Delete department
```

### Equipment

```
GET    /api/equipment                      # Get all equipment
GET    /api/equipment?id=1                 # Get specific equipment
GET    /api/equipment?departmentId=1       # Filter by department
GET    /api/equipment?status=operational   # Filter by status
GET    /api/equipment?search=pump          # Search equipment
POST   /api/equipment                      # Create equipment
PUT    /api/equipment                      # Update equipment
DELETE /api/equipment?id=1                 # Delete equipment
```

## Usage Examples

### Server-Side (API Routes, Server Components)

```typescript
import { db } from "@/db";
import { departments, equipment } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// Get all departments
const allDepts = await db.select().from(departments);

// Get department by ID
const dept = await db
  .select()
  .from(departments)
  .where(eq(departments.id, 1));

// Get equipment by status
const operationalEquip = await db
  .select()
  .from(equipment)
  .where(eq(equipment.status, "operational"));

// Join departments with equipment count
const deptsWithEquipCount = await db
  .select({
    id: departments.id,
    name: departments.name,
    equipmentCount: sql<number>`count(${equipment.id})`,
  })
  .from(departments)
  .leftJoin(equipment, eq(departments.id, equipment.departmentId))
  .groupBy(departments.id);
```

### Client-Side (React Components)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

function DepartmentsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map((dept) => (
        <div key={dept.id}>{dept.name}</div>
      ))}
    </div>
  );
}
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server

# Database Management
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio (GUI)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations

# Build
pnpm build            # Build for production
pnpm start            # Start production server
```

## Drizzle Studio

Visual database management tool:

```bash
pnpm db:studio
```

Opens at: https://local.drizzle.studio

Features:
- Browse all tables
- Edit data directly
- Run queries
- View relationships

## Troubleshooting

### Issue: "Module not found: Can't resolve 'postgres'"

**Solution:**
```bash
pnpm add postgres
```

### Issue: "Failed to connect to database"

**Checklist:**
1. ✅ `.env.local` file exists in root directory
2. ✅ `DATABASE_URL` is correct (check for typos)
3. ✅ Password is correct (no special characters issues)
4. ✅ IP address is allowed in Supabase
5. ✅ Restart dev server after creating `.env.local`

**Allow your IP in Supabase:**
1. Go to Supabase Dashboard
2. Settings → Database
3. Connection Pooling → Add your IP

### Issue: SSL/TLS Connection Error

**Solution:** Add SSL mode to DATABASE_URL:
```env
DATABASE_URL=postgresql://...?sslmode=require
```

### Issue: "Cannot find module '@/db'"

**Solution:** Restart your development server:
```bash
# Press Ctrl+C to stop
pnpm dev
```

### Issue: Environment variables not loading

**Checklist:**
1. File is named `.env.local` (not `.env.local.txt`)
2. File is in the root directory
3. No spaces around `=` in env file
4. Restart dev server after changes

## Security Best Practices

1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ✅ Use environment variables for all secrets
3. ✅ Use Supabase Row Level Security (RLS) for production
4. ✅ Rotate database passwords regularly
5. ✅ Use connection pooling for production

## Next Steps

1. ✅ Test database connection
2. Create additional API routes for:
   - Maintenance records
   - Maintenance schedule
   - Service contracts
3. Update frontend components to use new API
4. Add authentication with Supabase Auth
5. Implement Row Level Security (RLS)
6. Deploy to Vercel/Netlify

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)

## Support

For issues or questions:
1. Check this documentation
2. Review `SUPABASE_SETUP.md` for detailed setup
3. Check `QUICKSTART.md` for quick reference
4. Review Drizzle ORM docs for query examples

---

**Status:** ✅ Database setup complete and ready to use!

