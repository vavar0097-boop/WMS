import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

const configDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(configDir, ".env"), quiet: true });

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
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "firefox",
      dependencies: ["setup"],
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices["Desktop Firefox"],
        storageState: ".auth/admin.json",
      },
    },
  ],
});
