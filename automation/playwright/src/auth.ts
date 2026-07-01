import { expect, Page } from "@playwright/test";

import { Credentials } from "./env";

export async function login(page: Page, credentials: Credentials) {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

  await page.getByPlaceholder("Enter your username").fill(credentials.username);
  await page.getByPlaceholder("Enter your password").fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
