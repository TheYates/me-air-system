import postgres from "postgres";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.log("\nPlease create a .env.local file with:");
  console.log("DATABASE_URL=your-supabase-connection-string");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

async function checkTables() {
  try {
    console.log("🔍 Checking Supabase tables...\n");

    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log(`✅ Found ${tables.length} tables:\n`);
    
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get row count
      const count = await sql`
        SELECT COUNT(*) as count 
        FROM ${sql(tableName)}
      `;
      
      console.log(`  📊 ${tableName.padEnd(30)} - ${count[0].count} rows`);
    }

    console.log("\n✅ Database connection successful!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

checkTables();

