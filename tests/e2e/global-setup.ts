import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const DB_FILE = 'e2e.db';

/**
 * Wipe any previous e2e SQLite database and push a fresh Drizzle schema
 * against it so each test run starts from a clean slate. SQLite in WAL
 * mode can leave `-shm` / `-wal` sidecar files — remove those too.
 */
export default async function globalSetup() {
	const root = process.cwd();
	for (const suffix of ['', '-shm', '-wal']) {
		const path = resolve(root, `${DB_FILE}${suffix}`);
		if (existsSync(path)) unlinkSync(path);
	}

	execSync('npx drizzle-kit push --force', {
		stdio: 'inherit',
		env: { ...process.env, DATABASE_URL: DB_FILE }
	});
}
