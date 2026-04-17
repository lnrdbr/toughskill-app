import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { exerciseSubmission, moduleCompletion, moduleSubmission } from '$lib/server/db/schema';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		}
	},
	plugins: [
		anonymous({
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				// Reassign every piece of progress the anon user accumulated so the
				// newly-signed-up account picks up exactly where they left off.
				const anonId = anonymousUser.user.id;
				const realId = newUser.user.id;

				await Promise.all([
					db
						.update(exerciseSubmission)
						.set({ userId: realId })
						.where(eq(exerciseSubmission.userId, anonId)),
					db
						.update(moduleCompletion)
						.set({ userId: realId })
						.where(eq(moduleCompletion.userId, anonId)),
					db
						.update(moduleSubmission)
						.set({ userId: realId })
						.where(eq(moduleSubmission.userId, anonId))
				]);
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
