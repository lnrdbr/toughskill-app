import { env } from '$env/dynamic/private';

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface MistralCompletionResponse {
	choices: { message: { content: string } }[];
}

export const mistral = {
	chat: {
		async complete(params: {
			model: string;
			maxTokens: number;
			messages: ChatMessage[];
			responseFormat?: { type: string };
		}): Promise<MistralCompletionResponse> {
			const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: params.model,
					max_tokens: params.maxTokens,
					messages: params.messages,
					response_format: params.responseFormat
				}),
				signal: AbortSignal.timeout(30000)
			});

			if (!res.ok) {
				throw new Error(`Mistral API error: ${res.status} ${res.statusText}`);
			}

			return res.json();
		}
	}
};
