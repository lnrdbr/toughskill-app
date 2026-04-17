import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user as (typeof event.locals.user & { isAnonymous?: boolean }) | undefined;
	if (user && !user.isAnonymous) {
		return redirect(302, '/auth');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/auth');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/auth');
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/auth';

		const result = await auth.api.signInSocial({
			body: {
				provider: provider as 'github',
				callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Social sign-in failed' });
	}
};
