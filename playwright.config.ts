import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: 1,
	reporter: 'list',
	globalSetup: './tests/e2e/global-setup.ts',
	use: {
		baseURL: BASE_URL,
		trace: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: `yarn dev --port ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: {
			DATABASE_URL: 'e2e.db',
			BETTER_AUTH_SECRET: 'e2e-test-secret-not-for-production-use-only',
			ORIGIN: BASE_URL
		}
	}
});
