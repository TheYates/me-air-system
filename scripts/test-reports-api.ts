import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

async function testReportsAPI() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🔍 Testing Equipment Inventory Report API...\n");

    const response = await fetch(
      `${baseUrl}/api/reports/equipment-inventory?departmentId=all&startDate=2024-01-01&endDate=2025-12-31`
    );

    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ API working correctly!");
      console.log("Total Equipment:", data.summary.totalEquipment);
      console.log("Total Value:", data.summary.totalValue);
      console.log("Data length:", data.data.length);
    } else {
      console.log("\n❌ API returned error:", data.error);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error);
  }
}

testReportsAPI();
