import { expect, test } from "@playwright/test";

import { storageStatePath } from "../src/env";

test.describe("role entry points", () => {
  test("admin can open dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("POS Sales by Outlet")).toBeVisible();
  });

  test.describe("cashier", () => {
    test.use({ storageState: storageStatePath("cashier") });

    test("cashier lands on POS", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(/\/pos/);
      await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Confirm Payment" }),
      ).toBeVisible();
    });
  });
});
