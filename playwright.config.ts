import { defineConfig } from '@playwright/test';

try {
	process.loadEnvFile('.env');
} catch {
	// No .env file (e.g. in CI where env vars are injected directly) — ignore.
}

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}',
	use: { baseURL: 'http://localhost:4173' }
});
