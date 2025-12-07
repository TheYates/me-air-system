# Equipment Add Methods - E2E Tests

## Quick Start

### 1. Complete Playwright Installation (if not already done)

```bash
# Install Playwright browsers (run once)
bunx playwright install

# Or install only Chromium (faster)
bunx playwright install chromium
```

### 2. Start Development Server

In one terminal:
```bash
bun run dev
```

Wait for the message: `Ready on http://localhost:3000`

### 3. Run Tests

In another terminal:

```bash
# Run all equipment add tests
bun run test:e2e tests/e2e/equipment-add-methods.spec.ts

# Run with UI mode (recommended - visual feedback)
bun run test:e2e:ui tests/e2e/equipment-add-methods.spec.ts

# Run specific test suite
bunx playwright test -g "Single Equipment Addition"
bunx playwright test -g "Bulk Equipment Addition"

# Run in headed mode (see browser)
bunx playwright test tests/e2e/equipment-add-methods.spec.ts --headed

# Debug a specific test
bunx playwright test -g "should successfully add equipment" --debug
```

## Test Suites

### Single Equipment Addition (5 tests)
- ✅ Full workflow through all 4 tabs
- ✅ Required field validation
- ✅ Cancel functionality
- ✅ Tab navigation (Previous/Next)
- ✅ Data persistence between tabs

### Bulk Equipment Addition (8 tests)
- ✅ Add multiple equipment (2+ rows)
- ✅ Add and remove rows dynamically
- ✅ Cancel bulk operation
- ✅ Conditional field disabling (Lease ID)
- ✅ Excel-style Tab navigation
- ✅ Entry count tracking
- ✅ Data persistence when adding rows
- ✅ Prevent row deletion when only 1 remains

### Comparison Tests (2 tests)
- ✅ Both methods accessible
- ✅ Different dialog interfaces

## Prerequisites

Make sure you have:
1. ✅ At least one department in your database
2. ✅ Dev server running (`bun run dev`)
3. ✅ Playwright browsers installed

## Test Reports

After running tests:
```bash
# View HTML report
bunx playwright show-report
```

## Troubleshooting

### Tests failing?
1. **Check dev server is running** on http://localhost:3000
2. **Check database has departments** - run: `bun run db:check`
3. **Clear test data** if tests are interfering with each other

### Slow tests?
- Use `--project=chromium` to run only in Chromium (faster)
- Reduce timeout in playwright.config.ts

### Can't see what's happening?
- Use `--headed` flag to see browser
- Use `--ui` flag for interactive mode
- Use `--debug` flag to step through

## Test Data

Tests create equipment with these prefixes:
- Single add: `Test MRI Scanner`, `Navigation Test Equipment`
- Bulk add: `Bulk Equipment 1`, `Bulk Equipment 2`
- Tag numbers: `TAG-TEST-001`, `TAG-BULK-001`, etc.

You may want to clean up test data periodically.

## CI/CD Integration

These tests can be added to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: bunx playwright install --with-deps

- name: Run E2E Tests
  run: bun run test:e2e
```
