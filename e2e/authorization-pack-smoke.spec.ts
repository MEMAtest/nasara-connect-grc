import { expect, test } from "@playwright/test";

const jsonHeaders = { "Content-Type": "application/json" };

const completePaymentResponses = {
  "core-regulated-activities": "Payments and money remittance for UK SMEs.",
  "core-perimeter-clarity": "documented",
  "core-customer-segments": ["retail"],
  "core-distribution": ["direct"],
  "core-revenue-model": ["transaction-fees"],
  "core-geography": "uk",
  "core-outsourcing": ["cloud-hosting"],
  "core-hosting-model": "aws",
  "core-tech-stack": ["core-ledger"],
  "core-governance": "appointed",
  "core-risk-areas": ["safeguarding"],
  "core-risk-theme": ["safeguarding-breach"],
  "core-risk-mitigation": "Daily safeguarding reconciliations owned by Finance; evidence in weekly MI pack.",
  "core-capital": "funded-buffer",
  "core-projections": "full",
  "core-winddown": "draft",
  "core-winddown-trigger": ["capital-shortfall"],
  "core-winddown-plan": "Trigger-based plan covering customer comms, safeguarding account actions, settlement timelines, and data retention.",
  "pay-psp-record": "psp-of-record",
  "pay-operate-accounts": "yes",
  "pay-credit-line": "prefunded",
  "pay-payment-instruments": "yes",
  "pay-services": ["money-remittance"],
  "pay-emoney": "no",
  "pay-safeguarding": "segregated",
  "pay-funds-flow": "Customer funds move to safeguarding account then settle to merchants.",
  "pay-agents": "no",
  "pay-security": "mature",
  "pay-headcount": "1-5",
  "pay-monthly-opex": 120000,
  "pay-capital-method": "method-a",
};

test.describe("Authorization pack smoke", () => {
  test("loads empty projects list", async ({ page }) => {
    await page.route("**/api/authorization-pack/projects?**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ projects: [] }),
      });
    });

    await page.goto("/authorization-pack");

    await expect(page.getByRole("heading", { name: "Authorization Projects" })).toBeVisible();
    await expect(page.getByText("No projects yet")).toBeVisible();
  });

  test("saves profile before navigating and generates opinion pack", async ({ page }) => {
    const projectId = "test-project";
    const packId = "pack-1";
    let profileResponses: Record<string, unknown> = {};
    let profileFetchCount = 0;

    await page.route(`**/api/authorization-pack/projects/${projectId}`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          project: {
            id: projectId,
            name: "Payment Services Authorisation Project",
            permissionCode: "payments",
            permissionName: "Payment Services",
            status: "draft",
            packId,
          },
        }),
      });
    });

    await page.route(`**/api/authorization-pack/packs/${packId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ documents: [] }),
      });
    });

    await page.route(`**/api/authorization-pack/projects/${projectId}/business-plan-profile`, async (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        const payload = request.postDataJSON() as { responses?: Record<string, unknown> } | null;
        profileResponses = payload?.responses ?? {};
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({ profile: { responses: profileResponses } }),
        });
        return;
      }

      profileFetchCount += 1;
      const responses = profileFetchCount > 1 ? completePaymentResponses : profileResponses;
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ profile: { responses } }),
      });
    });

    await page.route(`**/api/authorization-pack/packs/${packId}/generate-business-plan`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "X-Document-Filename": "Opinion Pack.pdf",
        },
        body: "%PDF-1.4\n%mock",
      });
    });

    await page.goto(`/authorization-pack/${projectId}/opinion-pack`);

    await expect(page.getByText("Loading business plan profile...")).toBeHidden();
    await expect(page.getByText("Profile completion")).toBeVisible();
    await expect(page.getByText("Profile Questions")).toBeVisible();

    const sectionTabs = page.getByRole("tablist").nth(1);
    await sectionTabs.getByRole("tab", { name: /^Payments/ }).click();

    const opexInput = page.locator('input[placeholder="e.g., 120000"]');
    await opexInput.fill("j123abc");
    await expect(opexInput).toHaveValue("123");

    const fundsCard = page
      .locator("div", { hasText: "Funds flow touchpoints" })
      .filter({ has: page.getByText("Other") })
      .first();
    await fundsCard.getByRole("checkbox", { name: "Other" }).click();
    await expect(fundsCard.getByPlaceholder("Describe your other option...")).toBeVisible();

    const saveRequest = page.waitForRequest(
      (request) =>
        request.url().includes(`/api/authorization-pack/projects/${projectId}/business-plan-profile`) &&
        request.method() === "POST"
    );
    await page.getByRole("button", { name: "Go to Opinion Pack" }).click();
    await saveRequest;

    await expect(page.getByRole("button", { name: "Generate Opinion Pack" })).toBeVisible();

    const generateRequest = page.waitForRequest(
      (request) =>
        request.url().includes(`/api/authorization-pack/packs/${packId}/generate-business-plan`) &&
        request.method() === "POST"
    );
    await page.getByRole("button", { name: "Generate Opinion Pack" }).click();
    await generateRequest;
  });

  test("shows gantt tooltip on hover", async ({ page }) => {
    const projectId = "plan-project";

    await page.route(`**/api/authorization-pack/projects/${projectId}`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          project: {
            id: projectId,
            name: "Plan Smoke Test",
            permissionCode: "payments",
            status: "draft",
            projectPlan: {
              startDate: "2024-01-01",
              totalWeeks: 8,
              milestones: [
                {
                  id: "m1",
                  title: "Define scope",
                  description: "Confirm permissions and perimeter.",
                  phase: "Assessment & Scoping",
                  status: "in-progress",
                  startWeek: 1,
                  durationWeeks: 2,
                  endWeek: 2,
                  dueDate: "2024-01-14",
                },
              ],
            },
          },
        }),
      });
    });

    await page.goto(`/authorization-pack/${projectId}/plan`);

    await page.getByRole("button", { name: /Assessment & Scoping/ }).click();

    const milestone = page.getByRole("button", { name: /Define scope/ });
    await milestone.hover();

    await expect(page.locator('[role="tooltip"]', { hasText: "Define scope" })).toBeVisible();
  });
});
