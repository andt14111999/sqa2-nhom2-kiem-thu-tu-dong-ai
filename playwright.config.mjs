import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: [["list"], ["html", { open: "never", outputFolder: "KetQua/playwright-report" }]],
  outputDir: "KetQua/playwright-artifacts",
  use: { baseURL: "http://127.0.0.1:4173", channel: "chrome", viewport: { width: 760, height: 520 } },
  webServer: { command: "node scripts/phuc_vu.mjs", url: "http://127.0.0.1:4173", reuseExistingServer: true },
});
