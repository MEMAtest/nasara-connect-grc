import { expect, test } from "@playwright/test";
import {
  validFormData,
  invalidDates,
  validationTestData,
  xssPayloads,
  specialCharacterSurnames,
  getFutureDate,
  getTodayDate,
  getPastDate,
  getBirthDateForAge,
} from "./fixtures/smcr-forms-data";

const STORAGE_KEY = "nasara-form-a-draft";

test.describe("SMCR Forms - Core Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
  });

  test("loads form page with all sections visible", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Check page title and header
    await expect(page.getByRole("heading", { name: "FCA Controller Forms" })).toBeVisible();
    await expect(page.getByText("Complete SM&CR forms with step-by-step guidance")).toBeVisible();

    // Check form tabs
    await expect(page.getByRole("tab", { name: /Form A/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Form C/ })).toBeVisible();

    // Check section navigation buttons (14 sections)
    for (let i = 1; i <= 14; i++) {
      await expect(page.getByRole("button", { name: new RegExp(`^Section ${i}:`) })).toBeVisible();
    }

    // Check progress bar
    await expect(page.getByText("Form Completion")).toBeVisible();
    await expect(page.getByText("0%")).toBeVisible();
  });

  test("navigates through all sections sequentially", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Section 1 should be visible by default
    await expect(page.getByText("Section 1: Firm Details")).toBeVisible();

    // Navigate forward through sections
    const sectionTitles = [
      "Section 1: Firm Details",
      "Section 2: Candidate Personal Details",
      "Section 3: Contact Details",
      "Section 4: Controlled Function Applied For",
      "Section 5: Employment History",
      "Section 6: Directorships",
      "Sections 7-11: Fitness & Propriety",
      "Section 12: Statement of Responsibilities",
      "Section 13: Competency Assessment",
      "Section 14: Declarations",
    ];

    for (let i = 0; i < sectionTitles.length - 1; i++) {
      await expect(page.getByText(sectionTitles[i])).toBeVisible();
      await page.getByRole("button", { name: /Next:/ }).click();
    }

    // Should be on Section 14
    await expect(page.getByText("Section 14: Declarations")).toBeVisible();
  });

  test("jumps to specific section using navigation", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Jump to Section 12
    await page.getByRole("button", { name: /^Section 12:/ }).click();
    await expect(page.getByText("Section 12: Statement of Responsibilities")).toBeVisible();

    // Jump back to Section 3
    await page.getByRole("button", { name: /^Section 3:/ }).click();
    await expect(page.getByText("Section 3: Contact Details")).toBeVisible();
  });

  test("navigates backward through sections without data loss", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Fill Section 1
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await page.getByLabel(/Firm Reference Number/).fill(validFormData.firmFRN);

    // Go to Section 2
    await page.getByRole("button", { name: /Next: Personal Details/ }).click();
    await expect(page.getByText("Section 2: Candidate Personal Details")).toBeVisible();

    // Fill Section 2
    await page.getByLabel("Surname").fill(validFormData.surname);

    // Go back to Section 1
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Section 1: Firm Details")).toBeVisible();

    // Verify data persisted
    await expect(page.getByLabel("Firm Name")).toHaveValue(validFormData.firmName);
    await expect(page.getByLabel(/Firm Reference Number/)).toHaveValue(validFormData.firmFRN);

    // Go forward again and verify Section 2 data
    await page.getByRole("button", { name: /Next: Personal Details/ }).click();
    await expect(page.getByLabel("Surname")).toHaveValue(validFormData.surname);
  });
});

test.describe("SMCR Forms - LocalStorage Persistence", () => {
  test("auto-saves form data and shows save status", async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();

    // Fill a field
    await page.getByLabel("Firm Name").fill(validFormData.firmName);

    // Wait for auto-save (1 second debounce + save)
    await expect(page.getByText("Draft saved")).toBeVisible({ timeout: 5000 });

    // Verify localStorage
    const savedData = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(savedData).toBeTruthy();
    expect(JSON.parse(savedData!).firmName).toBe(validFormData.firmName);
  });

  test("persists form data across page refresh", async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();

    // Fill multiple fields
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await page.getByLabel(/Firm Reference Number/).fill(validFormData.firmFRN);

    // Wait for save
    await expect(page.getByText("Draft saved")).toBeVisible({ timeout: 5000 });

    // Refresh page
    await page.reload();

    // Verify data persisted
    await expect(page.getByLabel("Firm Name")).toHaveValue(validFormData.firmName);
    await expect(page.getByLabel(/Firm Reference Number/)).toHaveValue(validFormData.firmFRN);
  });

  test("clears form data when Clear Form is clicked", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Fill some data
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await expect(page.getByText("Draft saved")).toBeVisible({ timeout: 5000 });

    // Click Clear Form
    await page.getByRole("button", { name: "Clear Form" }).click();

    // Verify fields are cleared
    await expect(page.getByLabel("Firm Name")).toHaveValue("");

    // Verify localStorage is cleared
    const savedData = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(savedData).toBeNull();
  });
});

test.describe("SMCR Forms - Date Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
  });

  test("validates birth date - rejects under 18 years old", async ({ page }) => {
    // Navigate to Section 2
    await page.getByRole("button", { name: /^Section 2:/ }).click();

    // Enter a date making candidate under 18
    const underAgeBirthDate = getBirthDateForAge(17);
    await page.getByLabel("Date of Birth").fill(underAgeBirthDate);
    await page.getByLabel("Date of Birth").blur();

    // Check validation error
    await expect(page.getByText("Candidate must be between 18-100 years old")).toBeVisible();
  });

  test("validates birth date - rejects over 100 years old", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 2:/ }).click();

    const overAgeBirthDate = getBirthDateForAge(101);
    await page.getByLabel("Date of Birth").fill(overAgeBirthDate);
    await page.getByLabel("Date of Birth").blur();

    await expect(page.getByText("Candidate must be between 18-100 years old")).toBeVisible();
  });

  test("validates birth date - accepts valid ages (18-100)", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 2:/ }).click();

    // Test age 18 (boundary)
    const age18BirthDate = getBirthDateForAge(18);
    await page.getByLabel("Date of Birth").fill(age18BirthDate);
    await page.getByLabel("Date of Birth").blur();
    await expect(page.getByText("Candidate must be between 18-100 years old")).not.toBeVisible();

    // Test age 50 (middle)
    const age50BirthDate = getBirthDateForAge(50);
    await page.getByLabel("Date of Birth").fill(age50BirthDate);
    await page.getByLabel("Date of Birth").blur();
    await expect(page.getByText("Candidate must be between 18-100 years old")).not.toBeVisible();
  });

  test("validates effective date - rejects past dates", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 4:/ }).click();

    const pastDate = getPastDate(30);
    await page.getByLabel("Proposed Effective Date").fill(pastDate);
    await page.getByLabel("Proposed Effective Date").blur();

    await expect(page.getByText("Date must be today or in the future")).toBeVisible();
  });

  test("validates effective date - accepts today and future dates", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 4:/ }).click();

    // Test today
    const today = getTodayDate();
    await page.getByLabel("Proposed Effective Date").fill(today);
    await page.getByLabel("Proposed Effective Date").blur();
    await expect(page.getByText("Date must be today or in the future")).not.toBeVisible();

    // Test future date
    const futureDate = getFutureDate(30);
    await page.getByLabel("Proposed Effective Date").fill(futureDate);
    await page.getByLabel("Proposed Effective Date").blur();
    await expect(page.getByText("Date must be today or in the future")).not.toBeVisible();
  });
});

test.describe("SMCR Forms - Employment History Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await page.getByRole("button", { name: /^Section 5:/ }).click();
  });

  test("has one employment entry by default", async ({ page }) => {
    await expect(page.getByText("Employment 1 (Most Recent)")).toBeVisible();
    // Should not have Remove button when only 1 entry
    await expect(page.getByRole("button", { name: "Remove" })).not.toBeVisible();
  });

  test("adds new employment entry", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Another Employment" }).click();
    await expect(page.getByText("Employment 2")).toBeVisible();

    // Now both should have Remove buttons
    const removeButtons = page.getByRole("button", { name: "Remove" });
    await expect(removeButtons).toHaveCount(2);
  });

  test("removes employment entry (keeps at least 1)", async ({ page }) => {
    // Add a second entry
    await page.getByRole("button", { name: "+ Add Another Employment" }).click();
    await expect(page.getByText("Employment 2")).toBeVisible();

    // Remove first entry
    await page.getByRole("button", { name: "Remove" }).first().click();

    // Should still have one entry
    await expect(page.getByText(/Employment 1/)).toBeVisible();
    // Remove button should disappear when only 1 left
    await expect(page.getByRole("button", { name: "Remove" })).not.toBeVisible();
  });

  test("fills employment fields correctly", async ({ page }) => {
    await page.locator('[id^="employer-"]').first().fill(validFormData.employment.employer);
    await page.locator('[id^="jobTitle-"]').first().fill(validFormData.employment.jobTitle);
    await page.locator('[id^="startDate-"]').first().fill(validFormData.employment.startDate);
    await page.locator('[id^="endDate-"]').first().fill(validFormData.employment.endDate);
    await page.locator('[id^="reasonForLeaving-"]').first().fill(validFormData.employment.reasonForLeaving);

    // Verify data
    await expect(page.locator('[id^="employer-"]').first()).toHaveValue(validFormData.employment.employer);
    await expect(page.locator('[id^="jobTitle-"]').first()).toHaveValue(validFormData.employment.jobTitle);
  });

  test("shows regulator field when employer is regulated", async ({ page }) => {
    // Check the regulated checkbox
    const regulatedCheckbox = page.locator('[id^="regulated-"]').first();
    await regulatedCheckbox.click();

    // Regulator name field should appear
    await expect(page.locator('[id^="regulatorName-"]').first()).toBeVisible();

    // Fill regulator name
    await page.locator('[id^="regulatorName-"]').first().fill(validFormData.employment.regulatorName);
    await expect(page.locator('[id^="regulatorName-"]').first()).toHaveValue(validFormData.employment.regulatorName);

    // Uncheck - field should disappear
    await regulatedCheckbox.click();
    await expect(page.locator('[id^="regulatorName-"]').first()).not.toBeVisible();
  });

  test("maintains employment data across navigation", async ({ page }) => {
    // Fill employment data
    await page.locator('[id^="employer-"]').first().fill(validFormData.employment.employer);
    await page.locator('[id^="jobTitle-"]').first().fill(validFormData.employment.jobTitle);

    // Navigate away
    await page.getByRole("button", { name: /^Section 6:/ }).click();
    await expect(page.getByText("Section 6: Directorships")).toBeVisible();

    // Navigate back
    await page.getByRole("button", { name: /^Section 5:/ }).click();

    // Verify data persisted
    await expect(page.locator('[id^="employer-"]').first()).toHaveValue(validFormData.employment.employer);
    await expect(page.locator('[id^="jobTitle-"]').first()).toHaveValue(validFormData.employment.jobTitle);
  });
});

test.describe("SMCR Forms - Directorship Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await page.getByRole("button", { name: /^Section 6:/ }).click();
  });

  test("starts with no directorships", async ({ page }) => {
    await expect(page.getByText("No directorships added yet")).toBeVisible();
  });

  test("adds directorship entry", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Directorship" }).click();
    await expect(page.getByText("Directorship 1")).toBeVisible();
  });

  test("removes directorship entry (can remove all)", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Directorship" }).click();
    await expect(page.getByText("Directorship 1")).toBeVisible();

    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("No directorships added yet")).toBeVisible();
  });

  test("fills directorship fields correctly", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add Directorship" }).click();

    await page.locator('[id^="companyName-"]').first().fill("Test Holdings Ltd");
    await page.locator('[id^="position-"]').first().fill("Non-Executive Director");
    await page.locator('[id^="natureOfBusiness-"]').first().fill("Investment holding");

    await expect(page.locator('[id^="companyName-"]').first()).toHaveValue("Test Holdings Ltd");
  });
});

test.describe("SMCR Forms - Fitness & Propriety Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await page.getByRole("button", { name: /^Section 7:/ }).click();
  });

  test("displays F&P combined section with accordion", async ({ page }) => {
    await expect(page.getByText("Sections 7-11: Fitness & Propriety")).toBeVisible();

    // Check accordion sections
    await expect(page.getByText("Section 7: Criminal Matters")).toBeVisible();
    await expect(page.getByText("Section 8: Civil Proceedings")).toBeVisible();
    await expect(page.getByText("Section 9: Regulatory Matters")).toBeVisible();
    await expect(page.getByText("Section 10: Employment & Disciplinary")).toBeVisible();
    await expect(page.getByText("Section 11: Financial Soundness")).toBeVisible();
  });

  test("shows conditional detail fields when disclosure checkbox is checked", async ({ page }) => {
    // Open Criminal Matters section (should be open by default)
    const criminalConvictionCheckbox = page.getByLabel(/criminal offence/);
    await criminalConvictionCheckbox.click();

    // Detail textarea should appear
    const detailTextarea = page.getByPlaceholder(/Date, offence, court/);
    await expect(detailTextarea).toBeVisible();

    // Fill detail
    await detailTextarea.fill("Test criminal details");

    // Uncheck - detail should hide
    await criminalConvictionCheckbox.click();
    await expect(detailTextarea).not.toBeVisible();
  });

  test("persists F&P data across section navigation", async ({ page }) => {
    const criminalCheckbox = page.getByLabel(/criminal offence/);
    await criminalCheckbox.click();
    await page.getByPlaceholder(/Date, offence, court/).fill("Test details");

    // Navigate to another section
    await page.getByRole("button", { name: /^Section 12:/ }).click();

    // Come back
    await page.getByRole("button", { name: /^Section 7:/ }).click();

    // Verify data
    await expect(criminalCheckbox).toBeChecked();
    await expect(page.getByPlaceholder(/Date, offence, court/)).toHaveValue("Test details");
  });
});

test.describe("SMCR Forms - Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
  });

  test("validates email addresses", async ({ page }) => {
    // Section 1 has the submitter email field
    await page.locator('#submitterEmail').fill(validationTestData.invalidEmail);
    await page.locator('#submitterEmail').blur();

    await expect(page.getByText(/valid email address/)).toBeVisible();
  });

  test("validates UK postcodes", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 3:/ }).click();

    await page.getByLabel("Postcode").fill(validationTestData.invalidPostcode);
    await page.getByLabel("Postcode").blur();

    await expect(page.getByText(/valid UK postcode/)).toBeVisible();
  });

  test("validates National Insurance numbers", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 2:/ }).click();

    await page.getByLabel("National Insurance Number").fill(validationTestData.invalidNI);
    await page.getByLabel("National Insurance Number").blur();

    await expect(page.getByText(/valid NI number/)).toBeVisible();
  });

  test("validates FRN format (6-7 digits)", async ({ page }) => {
    await page.getByLabel(/Firm Reference Number/).fill(validationTestData.invalidFRN);
    await page.getByLabel(/Firm Reference Number/).blur();

    await expect(page.getByText(/valid 6-7 digit FRN/)).toBeVisible();
  });

  test("clears validation error when corrected", async ({ page }) => {
    const frnInput = page.getByLabel(/Firm Reference Number/);
    await frnInput.fill(validationTestData.invalidFRN);
    await frnInput.blur();

    await expect(page.getByText(/valid 6-7 digit FRN/)).toBeVisible();

    // Correct the value
    await frnInput.fill(validFormData.firmFRN);
    await frnInput.blur();

    await expect(page.getByText(/valid 6-7 digit FRN/)).not.toBeVisible();
  });
});

test.describe("SMCR Forms - HTML Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
  });

  test("export button is disabled until declarations are completed", async ({ page }) => {
    await page.getByRole("button", { name: /^Section 14:/ }).click();

    const exportButton = page.getByRole("button", { name: "Export Completed Form" });
    await expect(exportButton).toBeDisabled();

    // Check candidate declaration
    await page.getByLabel(/I have read and agree/).first().click();
    await expect(exportButton).toBeDisabled();

    // Check firm declaration
    await page.getByLabel(/firm has read and agrees/).click();
    await expect(exportButton).toBeEnabled();
  });

  test("exports form with sanitized filename", async ({ page }) => {
    // Fill minimum required data
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await page.getByRole("button", { name: /^Section 2:/ }).click();
    await page.getByLabel("Surname").fill(specialCharacterSurnames.specialChars);

    // Go to declarations and complete them
    await page.getByRole("button", { name: /^Section 14:/ }).click();
    await page.getByLabel(/I have read and agree/).first().click();
    await page.getByLabel(/firm has read and agrees/).click();

    // Set up download handler
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Completed Form" }).click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();

    // Filename should not contain special characters
    expect(filename).toMatch(/^Form-A-.+-\d{4}-\d{2}-\d{2}\.html$/);
    expect(filename).not.toContain("<");
    expect(filename).not.toContain(">");
    expect(filename).not.toContain(":");
    expect(filename).not.toContain("/");
    expect(filename).not.toContain("\\");
  });

  test("exported HTML escapes user input (XSS prevention)", async ({ page }) => {
    // Fill XSS payloads in fields
    await page.getByLabel("Firm Name").fill(xssPayloads.scriptTag);
    await page.getByRole("button", { name: /^Section 2:/ }).click();
    await page.getByLabel("Surname").fill(xssPayloads.eventHandler);
    await page.getByLabel("Forename").fill(validFormData.forenames);

    // Complete declarations
    await page.getByRole("button", { name: /^Section 14:/ }).click();
    await page.getByLabel(/I have read and agree/).first().click();
    await page.getByLabel(/firm has read and agrees/).click();

    // Export and check content
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Completed Form" }).click();

    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const content = await streamToString(stream);

    // Should NOT contain raw script tags
    expect(content).not.toContain("<script>");
    expect(content).not.toContain('onerror="alert');

    // Should contain escaped versions
    expect(content).toContain("&lt;script&gt;");
    expect(content).toContain("&lt;img");
  });

  test("top-level Export button works from any section", async ({ page }) => {
    // Fill some data
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await page.getByRole("button", { name: /^Section 2:/ }).click();
    await page.getByLabel("Surname").fill(validFormData.surname);

    // Use top-level Export button (in header)
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export" }).first().click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("Form-A");
  });
});

test.describe("SMCR Forms - Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/smcr/forms");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
  });

  test("progress starts at 0%", async ({ page }) => {
    await expect(page.getByText("0%")).toBeVisible();
  });

  test("progress increases as required fields are filled", async ({ page }) => {
    // Fill some required fields
    await page.getByLabel("Firm Name").fill(validFormData.firmName);
    await page.getByLabel(/Firm Reference Number/).fill(validFormData.firmFRN);

    // Progress should be > 0
    await page.waitForTimeout(500); // Wait for state update
    const progressText = await page.locator('[class*="text-slate-500"]').filter({ hasText: /\d+%/ }).textContent();
    const progress = parseInt(progressText?.replace("%", "") || "0");
    expect(progress).toBeGreaterThan(0);
  });
});

test.describe("SMCR Forms - Form C Tab", () => {
  test("switches between Form A and Form C tabs", async ({ page }) => {
    await page.goto("/smcr/forms");

    // Default is Form A
    await expect(page.getByText("Section 1: Firm Details")).toBeVisible();

    // Switch to Form C
    await page.getByRole("tab", { name: /Form C/ }).click();
    await expect(page.getByText("Form C - Ceasing Function")).toBeVisible();

    // Switch back to Form A
    await page.getByRole("button", { name: "Go to Form A" }).click();
    await expect(page.getByText("Section 1: Firm Details")).toBeVisible();
  });
});

// Helper function to convert stream to string
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}
