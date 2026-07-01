import { expect, test } from "@playwright/test";

import { login } from "../src/auth";
import {
  credentialsFor,
  missingCredentialsMessage,
} from "../src/env";

test.describe("role entry points", () => {
  test("admin can open dashboard", async ({ page }) => {
    const credentials = credentialsFor("admin");
    test.skip(!credentials, missingCredentialsMessage("admin"));

    await login(page, credentials!);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("POS Sales by Outlet")).toBeVisible();
  });

  test("cashier lands on POS", async ({ page }) => {
    const credentials = credentialsFor("cashier");
    test.skip(!credentials, missingCredentialsMessage("cashier"));

    await login(page, credentials!);

    await expect(page).toHaveURL(/\/pos/);
    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm Payment" }),
    ).toBeVisible();
  });
});
