import type { Preview } from '@storybook/sveltekit';
import '../src/routes/layout.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		a11y: {
			// 'error' fails Vitest runs on violations; 'todo' surfaces them without failing.
			test: 'error',
			options: {
				runOnly: {
					type: 'tag',
					values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
				},
				// Page-scope rules that don't apply to isolated component stories.
				rules: {
					'landmark-one-main': { enabled: false },
					'page-has-heading-one': { enabled: false },
					region: { enabled: false },
					bypass: { enabled: false },
					'document-title': { enabled: false },
					'html-has-lang': { enabled: false },
					'html-lang-valid': { enabled: false },
					'landmark-no-duplicate-banner': { enabled: false },
					'landmark-no-duplicate-contentinfo': { enabled: false },
					'landmark-no-duplicate-main': { enabled: false },
					'landmark-unique': { enabled: false }
				}
			}
		}
	}
};

export default preview;
