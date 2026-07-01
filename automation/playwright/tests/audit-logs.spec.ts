import { expect, test } from "@playwright/test";

import { login } from "../src/auth";
import {
  credentialsFor,
  missingCredentialsMessage,
} from "../src/env";

test.describe("audit logs", () => {
  test("audit log page renders real table shell", async ({ page }) => {
    const credentials = credentialsFor("finance");
    test.skip(!credentials, missingCredentialsMessage("finance"));

    await login(page, credentials!);
    await page.goto("/dashboard/audit-logs");

    await expect(
      page.getByRole("heading", { name: "Audit Logs" }),
    ).toBeVisible();
    await expect(page.getByText("Operational Events")).toBeVisible();
    await expect(page.getByPlaceholder("Search action or module")).toBeVisible();
  });
});
