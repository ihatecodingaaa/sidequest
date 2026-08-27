import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = process.env.SQ_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * Smoke coverage runs against a production build, because that is what a judge
 * will actually open and it removes dev-only behaviour from the equation.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : [["list"]],
  timeout: 45_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    colorScheme: "dark",
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    /*
     * WebKit, opt in with SQ_WEBKIT=1.
     *
     * Two P0 defects reached a real iPhone that this Chromium suite could not
     * see, so a WebKit project is worth having. It is opt in rather than
     * default because the WebKit binary cannot launch on every machine: this
     * one is missing libxslt.dll, and a suite that fails to start is worse
     * than one that has to be asked for.
     *
     * It runs the three specs where engine and browser meet, not the whole
     * suite. The rest is React and DOM behaviour that does not vary by engine,
     * and duplicating four hundred tests to find out would cost more than it
     * returns.
     *
     * On a machine that can run it:  SQ_WEBKIT=1 npx playwright test
     */
    ...(process.env.SQ_WEBKIT === "1"
      ? [
          {
            name: "webkit-streets",
            testMatch: /(orientation|navigation-return|streets)\.spec\.ts/,
            use: { ...devices["iPhone 13"] },
          },
        ]
      : []),
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
