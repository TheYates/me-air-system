import { test, expect } from "@playwright/test";

test.describe("Equipment Management - Add Equipment Methods", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to equipment page
    await page.goto("/equipment");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("Single Equipment Addition", () => {
    test("should successfully add equipment using single add method with all tabs", async ({
      page,
    }) => {
      // Click the "Add Equipment" button
      await page.click('button:has-text("Add Equipment")');

      // Wait for dialog to appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Tab 1: Equipment Details
      await page.fill('input[id="name"]', "Test MRI Scanner");
      await page.fill('input[id="tag_number"]', "TAG-TEST-001");
      await page.fill('input[id="year_of_manufacture"]', "2023");
      await page.fill(
        'input[id="date_of_installation"]',
        "2023-06-15"
      );
      await page.fill('input[id="manufacturer"]', "Siemens Healthcare");
      await page.fill('input[id="country_of_origin"]', "Germany");
      await page.fill('input[id="owner"]', "Hospital Trust");
      await page.fill('input[id="maintained_by"]', "Biomedical Engineering");
      await page.fill(
        'textarea[id="warranty_info"]',
        "5 year comprehensive warranty"
      );

      // Click Next to go to Location & Model tab
      await page.click('button:has-text("Next")');

      // Tab 2: Location & Model
      // Select department
      await page.click('button[role="combobox"]');
      await page.waitForTimeout(500);
      // Select first available department
      await page.click('[role="option"]').first;
      await page.fill('input[placeholder="Enter sub unit"]', "Radiology Unit 1");
      await page.fill('input[id="model"]', "MAGNETOM Lumina");
      await page.fill('input[id="mfg_number"]', "MFG-2023-001");
      await page.fill('input[id="serial_number"]', "SN-987654321");

      // Click Next to go to Costs tab
      await page.click('button:has-text("Next")');

      // Tab 3: Costs
      // Select purchase type
      await page.click('input[value="purchase"]');
      await page.fill('input[type="date"]', "2023-05-01");
      await page.fill('input[id="purchase_cost"]', "1500000.00");
      await page.fill('input[id="purchase_order_number"]', "PO-2023-12345");

      // Click Next to go to Service tab
      await page.click('button:has-text("Next")');

      // Tab 4: Service
      // Select service contract Yes
      await page.click('input[value="true"]');
      await page.fill(
        'input[id="service_organization"]',
        "Siemens Technical Services"
      );
      
      // Select service types
      await page.check('input[type="checkbox"]', { position: 0 });
      await page.check('input[type="checkbox"]', { position: 1 });
      
      await page.fill('input[id="contact_info"]', "+233 20 123 4567");
      await page.fill('input[id="employee_number"]', "EMP-001");

      // Submit the form
      await page.click('button:has-text("Add Equipment")');

      // Wait for success notification
      await expect(
        page.locator("text=Equipment added successfully")
      ).toBeVisible({ timeout: 10000 });

      // Verify equipment appears in the table
      await expect(page.locator("text=Test MRI Scanner")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should validate required fields in single add", async ({ page }) => {
      // Click the "Add Equipment" button
      await page.click('button:has-text("Add Equipment")');

      // Wait for dialog
      await page.waitForSelector('[role="dialog"]');

      // Try to navigate through tabs without filling required fields
      await page.click('button:has-text("Next")'); // Go to Location tab
      await page.click('button:has-text("Next")'); // Go to Costs tab
      await page.click('button:has-text("Next")'); // Go to Service tab

      // Try to submit without required fields
      await page.click('button:has-text("Add Equipment")');

      // Check if still on the dialog (submission failed)
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test("should cancel single equipment addition", async ({ page }) => {
      // Click the "Add Equipment" button
      await page.click('button:has-text("Add Equipment")');

      // Wait for dialog
      await page.waitForSelector('[role="dialog"]');

      // Fill some data
      await page.fill('input[id="name"]', "Test Equipment to Cancel");
      await page.fill('input[id="tag_number"]', "TAG-CANCEL-001");

      // Close dialog by clicking outside or X button
      await page.keyboard.press("Escape");

      // Check if dialog is closed
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).not.toBeVisible();

      // Equipment should not appear in table
      await expect(
        page.locator("text=Test Equipment to Cancel")
      ).not.toBeVisible();
    });

    test("should navigate between tabs using Previous button", async ({
      page,
    }) => {
      await page.click('button:has-text("Add Equipment")');
      await page.waitForSelector('[role="dialog"]');

      // Fill first tab
      await page.fill('input[id="name"]', "Navigation Test Equipment");
      await page.fill('input[id="tag_number"]', "TAG-NAV-001");
      await page.fill('input[id="manufacturer"]', "Test Manufacturer");

      // Navigate forward
      await page.click('button:has-text("Next")');
      await expect(page.locator('text="Location & Model"')).toBeVisible();

      await page.click('button:has-text("Next")');
      await expect(page.locator('text="Costs"')).toBeVisible();

      // Navigate backward
      await page.click('button:has-text("Previous")');
      await expect(page.locator('text="Location & Model"')).toBeVisible();

      await page.click('button:has-text("Previous")');
      await expect(page.locator('text="Equipment Details"')).toBeVisible();

      // Verify data is preserved
      await expect(page.locator('input[id="name"]')).toHaveValue(
        "Navigation Test Equipment"
      );
    });
  });

  test.describe("Bulk Equipment Addition", () => {
    test("should successfully add multiple equipment using bulk method", async ({
      page,
    }) => {
      // Click the "Bulk Add" button
      await page.click('button:has-text("Bulk Add")');

      // Wait for bulk dialog to appear
      const dialog = page.locator('[role="dialog"]').filter({
        hasText: "Bulk Add Equipment",
      });
      await expect(dialog).toBeVisible();

      // Fill first row
      const firstRow = page.locator("tbody tr").first();
      await firstRow.locator('input[placeholder="Equipment name"]').fill("Bulk Equipment 1");
      await firstRow.locator('input[placeholder="Tag number"]').fill("TAG-BULK-001");
      await firstRow.locator('input[placeholder="Manufacturer"]').fill("Manufacturer A");
      await firstRow.locator('input[placeholder="Serial number"]').fill("SN-BULK-001");
      
      // Select department for first row
      await firstRow.locator('button[role="combobox"]').click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').first().click();
      
      // Select purchase type
      await firstRow.locator('button:has-text("Type")').click();
      await page.locator('text="Purchase"').click();

      // Add a second row
      await page.click('button:has-text("Add Row")');
      
      // Wait for second row to appear
      await page.waitForTimeout(500);
      
      // Fill second row
      const secondRow = page.locator("tbody tr").nth(1);
      await secondRow.locator('input[placeholder="Equipment name"]').fill("Bulk Equipment 2");
      await secondRow.locator('input[placeholder="Tag number"]').fill("TAG-BULK-002");
      await secondRow.locator('input[placeholder="Manufacturer"]').fill("Manufacturer B");
      await secondRow.locator('input[placeholder="Serial number"]').fill("SN-BULK-002");
      
      // Select department for second row
      await secondRow.locator('button[role="combobox"]').click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').first().click();
      
      // Select purchase type for second row
      await secondRow.locator('button:has-text("Type")').click();
      await page.locator('text="Purchase"').click();

      // Verify row count
      await expect(page.locator("text=2 equipment entries")).toBeVisible();

      // Submit bulk addition
      await page.click('button:has-text("Save 2 Equipment")');

      // Wait for success notification
      await expect(
        page.locator("text=equipment items added successfully")
      ).toBeVisible({ timeout: 15000 });

      // Verify equipment appears in the table
      await expect(page.locator("text=Bulk Equipment 1")).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator("text=Bulk Equipment 2")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should add and remove rows in bulk add", async ({ page }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      // Initial row count should be 1
      await expect(page.locator("text=1 equipment entry")).toBeVisible();

      // Add 3 more rows
      await page.click('button:has-text("Add Row")');
      await page.click('button:has-text("Add Row")');
      await page.click('button:has-text("Add Row")');

      // Should now have 4 entries
      await expect(page.locator("text=4 equipment entries")).toBeVisible();

      // Remove a row (click X button on second row)
      await page.locator("tbody tr").nth(1).locator("button").click();

      // Should now have 3 entries
      await expect(page.locator("text=3 equipment entries")).toBeVisible();
    });

    test("should cancel bulk equipment addition", async ({ page }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      // Fill some data in first row
      await page
        .locator('input[placeholder="Equipment name"]')
        .first()
        .fill("Bulk Cancel Test");
      await page
        .locator('input[placeholder="Tag number"]')
        .first()
        .fill("TAG-CANCEL-BULK-001");

      // Add another row
      await page.click('button:has-text("Add Row")');
      await expect(page.locator("text=2 equipment entries")).toBeVisible();

      // Click Cancel button
      await page.click('button:has-text("Cancel")');

      // Dialog should close
      const dialog = page.locator('[role="dialog"]').filter({
        hasText: "Bulk Add Equipment",
      });
      await expect(dialog).not.toBeVisible();

      // Equipment should not appear in table
      await expect(page.locator("text=Bulk Cancel Test")).not.toBeVisible();
    });

    test("should disable lease ID field when purchase type is not lease", async ({
      page,
    }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      const firstRow = page.locator("tbody tr").first();

      // Check lease ID field initially
      const leaseIdField = firstRow.locator('input[placeholder="Lease ID"]');
      
      // Select purchase type "Purchase"
      await firstRow.locator('button:has-text("Type")').click();
      await page.locator('text="Purchase"').click();
      
      // Lease ID should be disabled
      await expect(leaseIdField).toBeDisabled();

      // Change to lease
      await firstRow.locator('button:has-text("Purchase")').click();
      await page.locator('text="Lease"').click();

      // Lease ID should now be enabled
      await expect(leaseIdField).not.toBeDisabled();
    });

    test("should handle Excel-style navigation with Tab key", async ({
      page,
    }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      // Focus on first input (Equipment name)
      const firstInput = page
        .locator('input[placeholder="Equipment name"]')
        .first();
      await firstInput.click();
      await firstInput.fill("Tab Test Equipment");

      // Press Tab to move to next field
      await page.keyboard.press("Tab");

      // Should now be on tag number field
      await page.keyboard.type("TAG-TAB-001");

      // Press Tab multiple times to navigate through fields
      await page.keyboard.press("Tab");
      await page.keyboard.type("2023"); // Year

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // Skip date picker
      await page.keyboard.type("Test Manufacturer");

      // Verify values were entered
      await expect(firstInput).toHaveValue("Tab Test Equipment");
      await expect(
        page.locator('input[placeholder="Tag number"]').first()
      ).toHaveValue("TAG-TAB-001");
    });

    test("should show correct entry count during bulk operations", async ({
      page,
    }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      // Start with 1 entry
      await expect(page.locator("text=1 equipment entry")).toBeVisible();

      // Add 4 rows
      for (let i = 0; i < 4; i++) {
        await page.click('button:has-text("Add Row")');
        await page.waitForTimeout(200);
      }

      // Should show 5 entries
      await expect(page.locator("text=5 equipment entries")).toBeVisible();

      // Button should reflect count
      await expect(page.locator('button:has-text("Save 5 Equipment")')).toBeVisible();
    });

    test("should persist data when adding new rows", async ({ page }) => {
      await page.click('button:has-text("Bulk Add")');
      await page.waitForSelector('text="Bulk Add Equipment"');

      // Fill first row
      await page
        .locator('input[placeholder="Equipment name"]')
        .first()
        .fill("Persistent Equipment 1");
      await page
        .locator('input[placeholder="Tag number"]')
        .first()
        .fill("TAG-PERSIST-001");

      // Add a new row
      await page.click('button:has-text("Add Row")');

      // First row data should still be there
      await expect(
        page.locator('input[placeholder="Equipment name"]').first()
      ).toHaveValue("Persistent Equipment 1");
      await expect(
        page.locator('input[placeholder="Tag number"]').first()
      ).toHaveValue("TAG-PERSIST-001");

      // Second row should be empty
      await expect(
        page.locator('input[placeholder="Equipment name"]').nth(1)
      ).toHaveValue("");
    });
  });

  test.describe("Comparison Tests", () => {
    test("should have both add methods accessible from equipment page", async ({
      page,
    }) => {
      // Verify both buttons exist
      await expect(
        page.locator('button:has-text("Add Equipment")')
      ).toBeVisible();
      await expect(page.locator('button:has-text("Bulk Add")')).toBeVisible();
    });

    test("should open different dialogs for single vs bulk add", async ({
      page,
    }) => {
      // Open single add
      await page.click('button:has-text("Add Equipment")');
      await expect(page.locator('text="Add Equipment"')).toBeVisible();
      await expect(
        page.locator('text="Equipment Details"')
      ).toBeVisible(); // Tab name
      await page.keyboard.press("Escape");

      // Wait for dialog to close
      await page.waitForTimeout(500);

      // Open bulk add
      await page.click('button:has-text("Bulk Add")');
      await expect(page.locator('text="Bulk Add Equipment - Excel Style"')).toBeVisible();
      await expect(page.locator("table")).toBeVisible(); // Excel-style table
    });
  });
});
