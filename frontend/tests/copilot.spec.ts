import { test, expect } from "@playwright/test";

test.describe("Policy Radar Copilot Quality & Rendering Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Disable initial guided tour popup so tests can navigate cleanly
    await page.addInitScript(() => {
      window.localStorage.setItem("govdash_tour_completed", "true");
    });
  });

  test("opens Copilot, clicks starter chips, asserts no '**', no '₹0.0L', and distinct answers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open Copilot drawer
    const copilotBtn = page.locator('button[aria-label="Open Policy Copilot"]').first();
    await expect(copilotBtn).toBeVisible({ timeout: 10000 });
    await copilotBtn.click();

    // Verify Copilot drawer opened
    const drawerTitle = page.locator("text=Policy Radar Copilot").first();
    await expect(drawerTitle).toBeVisible({ timeout: 5000 });

    // Initial greeting assistant message
    const greetingMsg = page.locator(".max-w-\\[88\\%\\]").first();
    await expect(greetingMsg).toBeVisible();
    const greetingText = await greetingMsg.innerText();
    expect(greetingText).not.toContain("**");
    expect(greetingText).not.toContain("₹0.0L");
    expect(greetingText).not.toContain("₹1000.0L");

    // Click starter chips one by one and assert
    const chipLabels = [
      "Which schemes do NOT require DPIIT?",
      "Top 5 early stage grants"
    ];

    const answers: string[] = [];

    for (const label of chipLabels) {
      const chip = page.locator(`button:has-text("${label}")`).first();
      await expect(chip).toBeVisible({ timeout: 5000 });
      await chip.click();

      // Wait for assistant response to appear
      await page.waitForTimeout(1000);

      // Get all assistant messages
      const allMsgs = page.locator(".max-w-\\[88\\%\\]");
      const count = await allMsgs.count();
      expect(count).toBeGreaterThan(1);

      const latestMsg = allMsgs.last();
      const content = await latestMsg.innerText();

      // Asserts required by specification
      expect(content).not.toContain("**");
      expect(content).not.toContain("₹0.0L");
      expect(content).not.toContain("₹1000.0L");
      answers.push(content);
    }

    // Assert different chips produce different answers
    expect(answers[0]).not.toEqual(answers[1]);
  });
});
