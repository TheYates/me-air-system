# E2E Tests with Playwright

This directory contains end-to-end tests for the ME-AIR Equipment Maintenance Management System using Playwright.

## Setup

Playwright has been installed as a dev dependency. The configuration is in `playwright.config.ts` at the root of the project.

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Run tests in debug mode
```bash
pnpm test:e2e:debug
```

### Run specific test file
```bash
pnpm test:e2e tests/e2e/add-equipment.spec.ts
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e --headed
```

## Test Files

### `add-equipment.spec.ts`
Tests for the equipment addition functionality:
- Opening the add equipment dialog
- Adding equipment with basic information
- Validating required fields
- Canceling the add equipment dialog

## How It Works

1. **Playwright** automatically starts your Next.js dev server (if not already running)
2. Tests run against `http://localhost:3000`
3. Tests are executed in multiple browsers (Chromium, Firefox, WebKit)
4. Screenshots and traces are captured on failure
5. HTML report is generated after tests complete

## Test Structure

Each test follows this pattern:
1. **Setup**: Navigate to the page and wait for it to load
2. **Action**: Interact with the UI (click, fill, select)
3. **Assert**: Verify the expected outcome

## Debugging

- Use `--debug` flag to step through tests
- Use `--headed` flag to see the browser
- Use `--ui` flag for interactive test runner
- Check `playwright-report/` folder for HTML reports

## Tips

- Tests wait for network idle by default
- Use `page.waitForTimeout()` for specific delays if needed
- Use `page.locator()` for finding elements
- Use `expect()` for assertions
- Tests are isolated and can run in parallel

