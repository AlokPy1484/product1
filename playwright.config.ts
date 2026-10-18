import { defineConfig } from "@playwright/test"

const external = process.env.DOTGRID_TEST_URL
export default defineConfig({
    testDir: "./tests",
    timeout: 45_000,
    fullyParallel: true,
    use: { baseURL: external || "http://localhost:3100", viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure" },
    webServer: external ? undefined : { command: "npm run dev -- --port 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 120_000 },
})
