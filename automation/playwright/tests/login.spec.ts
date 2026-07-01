import { expect, test } from "@playwright/test";

import { login } from "../src/auth";
import {
  credentialsFor,
  missingCredentialsMessage,
} from "../src/env";

test.describe("login", () => {
  test("renders login form and keeps submit disabled until filled", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByPlaceholder("Enter your username")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();

    await page.getByPlaceholder("Enter your username").fill("admin");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();

    await page.getByPlaceholder("Enter your password").fill("wrong-password");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  test("rejects invalid credentials and stays on login page", async ({
    page,
  }) => {
    await page.goto("/login");

    await page
      .getByPlaceholder("Enter your username")
      .fill(`invalid-${Date.now()}`);
    await page.getByPlaceholder("Enter your password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByText("Login failed")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your username")).toBeEnabled();
    await expect(page.getByPlaceholder("Enter your password")).toBeEnabled();
  });

  test("admin can login and land on dashboard", async ({ page }) => {
    const credentials = credentialsFor("admin");
    test.skip(!credentials, missingCredentialsMessage("admin"));

    await login(page, credentials!);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("POS Sales by Outlet")).toBeVisible();
  });

  test("session cookie keeps protected dashboard accessible after reload", async ({
    page,
  }) => {
    const credentials = credentialsFor("admin");
    test.skip(!credentials, missingCredentialsMessage("admin"));

    await login(page, credentials!);
    await page.reload();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
