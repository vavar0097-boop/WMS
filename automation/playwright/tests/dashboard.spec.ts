import { expect, test } from "@playwright/test";

import { login } from "../src/auth";
import {
  credentialsFor,
  missingCredentialsMessage,
} from "../src/env";

test.describe("dashboard", () => {
  test("shows outlet POS sales and removes weekly movement", async ({ page }) => {
    const credentials = credentialsFor("admin");
    test.skip(!credentials, missingCredentialsMessage("admin"));

    await login(page, credentials!);
    await page.goto("/dashboard");

    await expect(page.getByText("POS Sales by Outlet")).toBeVisible();
    await expect(page.getByText("Auto refresh 30s")).toBeVisible();
    await expect(page.getByText("POS Snapshot")).toBeVisible();
    await expect(page.getByText("Weekly Movement")).toHaveCount(0);
  });
});
