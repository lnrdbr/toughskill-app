import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { account } from '$lib/server/db/auth.schema';
import { asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user as
		| (typeof event.locals.user & { isAnonymous?: boolean })
		| undefined;

	if (!user || user.isAnonymous) {
		return redirect(302, '/auth/login');
	}

	// Which identity provider(s) the account uses. Better Auth writes one
	// `account` row per linked provider: `credential` for email/password,
	// `github` for the OAuth linkage. The earliest row is the sign-up method.
	const providers = await db
		.select({ providerId: account.providerId, createdAt: account.createdAt })
		.from(account)
		.where(eq(account.userId, user.id))
		.orderBy(asc(account.createdAt));

	const signUpProvider = providers[0]?.providerId ?? null;

	return { user, signUpProvider };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/auth/login');
	}
};
