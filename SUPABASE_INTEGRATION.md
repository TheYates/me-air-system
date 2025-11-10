# ME-AIR Supabase Integration Guide

## ✅ Setup Complete

Your ME-AIR Equipment Maintenance Management System is now fully integrated with Supabase!

## Database Connection

**Status**: ✅ Connected and Verified

- **Database**: PostgreSQL on Supabase
- **Region**: EU North (aws-1-eu-north-1)
- **Connection Mode**: Transaction Pooler (port 6543)
- **Tables**: 14 tables with 689 equipment records

### Connection String
```
postgresql://postgres.lgyxleeukfcftsovqinx:meairroot@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

## Database Tables

| Table | Records | Purpose |
|-------|---------|---------|
| departments | 14 | Organizational departments |
| equipment | 689 | Equipment inventory |
| maintenance | 2 | Maintenance records |
| activities | 131 | Activity logs |
| maintenance_checklist | 0 | Maintenance checklists |
| maintenance_documents | 0 | Maintenance documentation |
| maintenance_notes | 0 | Maintenance notes |
| maintenance_parts | 1 | Parts used in maintenance |
| maintenance_photos | 0 | Maintenance photos |
| maintenance_requests | 0 | Maintenance requests |
| maintenance_types | 0 | Types of maintenance |
| equipment_documents | 0 | Equipment documentation |
| equipment_photos | 0 | Equipment photos |
| equipment_specifications | 1 | Equipment specifications |

## API Endpoints

All endpoints are available at `http://localhost:3000/api`

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/[id]` - Get department details
- `POST /api/departments` - Create department
- `PUT /api/departments/[id]` - Update department
- `DELETE /api/departments/[id]` - Delete department

### Equipment
- `GET /api/equipment` - List equipment (supports filters: status, department, search)
- `GET /api/equipment/[id]` - Get equipment details
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment
- `PATCH /api/equipment/[id]/status` - Update equipment status

### Maintenance
- `GET /api/maintenance` - List maintenance records (supports filters: status, type, equipmentId, upcoming)
- `GET /api/maintenance/[id]` - Get maintenance details
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/[id]` - Update maintenance record
- `DELETE /api/maintenance/[id]` - Delete maintenance record
- `GET /api/maintenance/[id]/notes` - Get maintenance notes
- `POST /api/maintenance/[id]/notes` - Add maintenance note
- `GET /api/maintenance/[id]/parts` - Get maintenance parts
- `POST /api/maintenance/[id]/parts` - Add maintenance part

## Frontend Integration

The frontend is configured to use the Next.js API routes:

```env
NEXT_PUBLIC_API_URL=/api
```

All pages automatically use the Supabase data:
- Dashboard displays real equipment statistics
- Equipment page shows all 689 items from database
- Departments page lists all 14 departments
- Maintenance page shows maintenance records

## Testing

Run the API test suite:
```bash
pnpm test:api
```

This will verify:
- Database connection
- All CRUD operations
- Filtering and search
- Dashboard statistics

## File Structure

```
app/
├── api/
│   ├── dashboard/
│   │   └── stats/route.ts
│   ├── departments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── equipment/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/status/route.ts
│   ├── maintenance/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── [id]/notes/route.ts
│   │   └── [id]/parts/route.ts
│   └── test-db/route.ts
db/
├── index.ts (Database connection)
└── schema.ts (Table definitions)
lib/
├── api.ts (API client)
└── supabase.ts (Supabase client)
scripts/
├── check-tables.ts (Verify database tables)
└── test-api.ts (Test all endpoints)
```

## Environment Variables

Required in `.env.local`:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.lgyxleeukfcftsovqinx:meairroot@aws-1-eu-north-1.pooler.supabase.com:6543/postgres

# Supabase Project Details
NEXT_PUBLIC_SUPABASE_URL=https://lgyxleeukfcftsovqinx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API URL
NEXT_PUBLIC_API_URL=/api
```

## Development

Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Database Management

### Check Tables
```bash
pnpm db:check
```

### Generate Migrations
```bash
pnpm db:generate
```

### Push Schema
```bash
pnpm db:push
```

### Drizzle Studio
```bash
pnpm db:studio
```

## Key Features Implemented

✅ Database connection with Drizzle ORM
✅ All CRUD operations for departments, equipment, and maintenance
✅ Dashboard statistics with real data
✅ Equipment filtering by status and department
✅ Maintenance record management
✅ Maintenance notes and parts tracking
✅ API testing suite
✅ Type-safe database queries

## Next Steps

1. Test the application at http://localhost:3000
2. Create maintenance records through the UI
3. Add maintenance notes and parts
4. Generate reports from the Reports page
5. Monitor equipment status changes

## Support

For issues or questions:
1. Check the server logs: `pnpm dev`
2. Run the test suite: `pnpm test:api`
3. Verify database connection: `pnpm db:check`

