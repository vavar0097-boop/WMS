import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const appUrl = process.env.WMS_APP_URL || "https://app-ku.unaux.com";
const recordRun = process.env.WMS_RECORD === "true";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: appUrl,
    trace: recordRun ? "on" : "retain-on-failure",
    screenshot: recordRun ? "on" : "only-on-failure",
    video: recordRun ? "on" : "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
