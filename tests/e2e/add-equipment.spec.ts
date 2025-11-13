import { test, expect } from "@playwright/test";

test.describe("Equipment Management - Add Equipment", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to equipment page
    await page.goto("/equipment");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test("should open add equipment dialog", async ({ page }) => {
    // Click the "Add Equipment" button
    await page.click('button:has-text("Add Equipment")');

    // Check if dialog is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check if the dialog title is visible
    await expect(page.locator("text=Add Equipment")).toBeVisible();
  });

  test("should add equipment with basic information", async ({ page }) => {
    // Click the "Add Equipment" button
    await page.click('button:has-text("Add Equipment")');

    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]');

    // Fill in basic equipment details
    await page.fill('input[id="name"]', "Test Equipment");
    await page.fill('input[id="tag_number"]', "TAG-001");
    await page.fill('input[id="manufacturer"]', "Test Manufacturer");
    await page.fill('input[id="model"]', "Model X");
    await page.fill('input[id="serial_number"]', "SN-12345");

    // Select a department (if available)
    const departmentSelect = page.locator('select, [role="combobox"]').first();
    if (await departmentSelect.isVisible()) {
      await departmentSelect.click();
      await page.locator("text=Unassigned").first().click();
    }

    // Click the Save button
    await page.click('button:has-text("Save Equipment")');

    // Wait for success notification
    await page.waitForTimeout(1000);

    // Check if success toast appears
    const successToast = page.locator("text=Equipment added successfully");
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify equipment appears in the table
    await expect(page.locator("text=Test Equipment")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should validate required fields", async ({ page }) => {
    // Click the "Add Equipment" button
    await page.click('button:has-text("Add Equipment")');

    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]');

    // Try to save without filling required fields
    await page.click('button:has-text("Save Equipment")');

    // Check if validation error appears
    const errorMessage = page.locator("text=required");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should cancel adding equipment", async ({ page }) => {
    // Click the "Add Equipment" button
    await page.click('button:has-text("Add Equipment")');

    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]');

    // Fill in some data
    await page.fill('input[id="name"]', "Test Equipment");

    // Click Cancel button
    await page.click('button:has-text("Cancel")');

    // Check if dialog is closed
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });
});
