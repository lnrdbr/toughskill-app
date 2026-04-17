import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user as
		| (typeof event.locals.user & { isAnonymous?: boolean })
		| undefined;

	if (!user || user.isAnonymous) {
		return redirect(302, '/auth/login');
	}

	return { user };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/auth/login');
	}
};
