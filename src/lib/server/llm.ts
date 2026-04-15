import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

let _client: Anthropic | undefined;

export const anthropic = new Proxy({} as Anthropic, {
	get(_, prop) {
		_client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
		return Reflect.get(_client, prop);
	}
});
