import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';

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
				await db
					.update(exerciseSubmission)
					.set({ userId: newUser.user.id })
					.where(eq(exerciseSubmission.userId, anonymousUser.user.id));
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
