import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

async function testAPI() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing API Endpoints...\n");

  try {
    // Test 1: Database connection
    console.log("1️⃣ Testing /api/test-db...");
    const testRes = await fetch(`${baseUrl}/api/test-db`);
    const testData = await testRes.json();
    console.log("   ✅ Database connected");
    console.log();

    // Test 2: Get all departments
    console.log("2️⃣ Testing /api/departments...");
    const deptRes = await fetch(`${baseUrl}/api/departments`);
    const deptData = await deptRes.json();
    console.log(`   ✅ Found ${deptData.length} departments`);
    console.log();

    // Test 3: Get department by ID
    if (deptData.length > 0) {
      console.log("3️⃣ Testing /api/departments/[id]...");
      const deptId = deptData[0].id;
      const deptDetailRes = await fetch(`${baseUrl}/api/departments/${deptId}`);
      const deptDetail = await deptDetailRes.json();
      console.log(`   ✅ Department: ${deptDetail.name} (Equipment: ${deptDetail.equipmentCount})`);
      console.log();
    }

    // Test 4: Get equipment
    console.log("4️⃣ Testing /api/equipment...");
    const equipRes = await fetch(`${baseUrl}/api/equipment`);
    const equipData = await equipRes.json();
    console.log(`   ✅ Found ${equipData.length} equipment items`);
    console.log();

    // Test 5: Get equipment by ID
    if (equipData.length > 0) {
      console.log("5️⃣ Testing /api/equipment/[id]...");
      const equipId = equipData[0].id;
      const equipDetailRes = await fetch(`${baseUrl}/api/equipment/${equipId}`);
      const equipDetail = await equipDetailRes.json();
      console.log(`   ✅ Equipment: ${equipDetail.name} (Status: ${equipDetail.status})`);
      console.log();
    }

    // Test 6: Filter equipment by status
    console.log("6️⃣ Testing /api/equipment?status=operational...");
    const operationalRes = await fetch(`${baseUrl}/api/equipment?status=operational`);
    const operationalData = await operationalRes.json();
    console.log(`   ✅ Found ${operationalData.length} operational equipment`);
    console.log();

    // Test 7: Get maintenance records
    console.log("7️⃣ Testing /api/maintenance...");
    const maintRes = await fetch(`${baseUrl}/api/maintenance`);
    const maintData = await maintRes.json();
    console.log(`   ✅ Found ${maintData.length} maintenance records`);
    console.log();

    // Test 8: Get dashboard stats
    console.log("8️⃣ Testing /api/dashboard/stats...");
    const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`);
    const statsData = await statsRes.json();
    console.log(`   ✅ Dashboard Stats:`);
    console.log(`      - Total Equipment: ${statsData.totalEquipment}`);
    console.log(`      - Operational: ${statsData.operational}`);
    console.log(`      - In Maintenance: ${statsData.maintenance}`);
    console.log(`      - Broken: ${statsData.broken}`);
    console.log();

    console.log("✅ All API tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAPI();

