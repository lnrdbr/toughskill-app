import type { Course } from '$lib/types/course';

/**
 * Creativity — 30-lesson journey.
 *
 * Four narrative acts (not encoded structurally — purely for authoring clarity):
 *   1. Awakening (1–7)   — what creativity is, escape autopilot
 *   2. Unblocking (8–15) — constraints, new angles, tools
 *   3. Practice (16–22)  — real-life application
 *   4. Integration (23–30) — habit, identity, daily ritual
 *
 * Each lesson is a short (~2 min) single-module beat. Journey modules render
 * via ModuleRunner's direct branches; exercise modules render via the
 * component-registry path and use `compact: true` to skip the reflection phase.
 *
 * Memorable quotes planted for later recall:
 *   - Lesson 1 → "Creativity is noticing what others walk past."   (recalled 5, finished 11)
 *   - Lesson 12 → "Limits don't cage creativity. They shape it."   (finished 27)
 */
export const creativity: Course = {
	id: 'creativity',
	title: 'Creativity',
	slug: 'creativity',
	description:
		'A 30-day journey that turns creativity from a talent you either have or don\'t into a way of paying attention.',
	icon: 'mdi:lightbulb',
	color: 'primary',
	lessons: [
		// ─── Act 1: Awakening (1–7) ──────────────────────────────────────────
		{
			id: 'lesson-01-what-is-creativity',
			title: 'What is creativity?',
			slug: 'what-is-creativity',
			description: 'Set the premise in a single line.',
			icon: 'mdi:lightbulb-on-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'intro',
					id: 'mod-01-intro',
					title: 'What is creativity?',
					estimatedMinutes: 2,
					body: 'Creativity is noticing what others walk past.'
				}
			]
		},
		{
			id: 'lesson-02-myth-of-the-creative',
			title: 'The myth of "the creative"',
			slug: 'myth-of-the-creative',
			description: 'Creativity isn\'t reserved for artists.',
			icon: 'mdi:account-question-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'choice',
					id: 'mod-02-choice',
					title: 'Who counts as creative?',
					estimatedMinutes: 2,
					prompt: 'Which of these people is being creative?',
					options: [
						{
							id: 'painter',
							label: 'A painter finishing a portrait',
							body: 'Yes — and so are the rest. Creativity shows up wherever someone gets unstuck in a way that wasn\'t obvious.'
						},
						{
							id: 'engineer',
							label: 'An engineer finding a workaround',
							body: 'Yes — and so are the rest. Creativity shows up wherever someone gets unstuck in a way that wasn\'t obvious.'
						},
						{
							id: 'parent',
							label: 'A parent inventing a bedtime story',
							body: 'Yes — and so are the rest. Creativity shows up wherever someone gets unstuck in a way that wasn\'t obvious.'
						},
						{
							id: 'cook',
							label: 'A cook improvising with what\'s in the fridge',
							body: 'Yes — and so are the rest. Creativity shows up wherever someone gets unstuck in a way that wasn\'t obvious.'
						}
					]
				}
			]
		},
		{
			id: 'lesson-03-first-creative-memory',
			title: 'Your first creative memory',
			slug: 'first-creative-memory',
			description: 'Anchor creativity in your own history.',
			icon: 'mdi:history',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-03-reflection',
					title: 'A first memory',
					estimatedMinutes: 2,
					prompt:
						'What\'s the earliest thing you remember making or inventing? It doesn\'t have to be "art" — a game, a hiding spot, a made-up word all count.',
					minLength: 40
				}
			]
		},
		{
			id: 'lesson-04-notice-creative-thing',
			title: 'Notice one creative thing',
			slug: 'notice-creative-thing',
			description: 'A tiny field task.',
			icon: 'mdi:eye-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'real_life_task',
					id: 'mod-04-task',
					title: 'Notice one creative thing',
					estimatedMinutes: 2,
					instruction:
						'In the next hour, notice one thing someone made creatively. A sign, a song, a snack, a workaround — anything.',
					feedbackPrompt: 'What did you notice? What made it creative to you?',
					returnAfterMinutes: 0
				}
			]
		},
		{
			id: 'lesson-05-remember-what-is-creativity',
			title: 'Remember: what is creativity?',
			slug: 'remember-what-is-creativity',
			description: 'Callback to lesson 1.',
			icon: 'mdi:refresh',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'recall',
					id: 'mod-05-recall',
					title: 'Remember: what is creativity?',
					estimatedMinutes: 2,
					mode: 'open-recall',
					referenceLessonSlug: 'what-is-creativity',
					prompt:
						'In the first lesson we said creativity is something very specific. In your own words — what was it?',
					expected: 'noticing what others walk past'
				}
			]
		},
		{
			id: 'lesson-06-two-minute-pause',
			title: 'A 2-minute pause',
			slug: 'two-minute-pause',
			description: 'First taste of stillness.',
			icon: 'mdi:meditation',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'meditation',
					id: 'mod-06-meditation',
					title: 'A 2-minute pause',
					estimatedMinutes: 2,
					durationSeconds: 120,
					style: 'breathing'
				}
			]
		},
		{
			id: 'lesson-07-paperclip-test',
			title: 'The paperclip test',
			slug: 'paperclip-test',
			description: 'A classic divergent-thinking warm-up, shortened.',
			icon: 'mdi:paperclip',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'exercise',
					id: 'mod-07-paperclip',
					title: 'The paperclip test',
					componentId: 'DivergentThinking',
					estimatedMinutes: 2,
					config: {
						prompt: 'Paperclip',
						instruction: 'How many uses can you think of for a paperclip? Go quickly.',
						timerDuration: 90,
						compact: true
					}
				}
			]
		},

		// ─── Act 2: Unblocking (8–15) ────────────────────────────────────────
		{
			id: 'lesson-08-phone-attention',
			title: 'Your phone, your attention',
			slug: 'phone-attention',
			description: 'Notice how attention gets eaten.',
			icon: 'mdi:cellphone',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-08-reflection',
					title: 'Where does your attention go?',
					estimatedMinutes: 2,
					prompt:
						'Think about the last hour. What grabbed your attention — and did you choose it, or did it choose you?',
					minLength: 40
				}
			]
		},
		{
			id: 'lesson-09-phone-free-minute',
			title: 'A phone-free minute',
			slug: 'phone-free-minute',
			description: 'One minute, phone down.',
			icon: 'mdi:cellphone-off',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'phone_free',
					id: 'mod-09-phone-free',
					title: 'A phone-free minute',
					estimatedMinutes: 2,
					durationSeconds: 60
				}
			]
		},
		{
			id: 'lesson-10-hidden-detail',
			title: 'The hidden detail',
			slug: 'hidden-detail',
			description: 'Photograph something ordinary.',
			icon: 'mdi:camera-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'photo',
					id: 'mod-10-photo',
					title: 'The hidden detail',
					estimatedMinutes: 2,
					prompt:
						'Find something completely ordinary within arm\'s reach. Look at it like you\'ve never seen one before. Photograph it.',
					captionPrompt: 'What did you suddenly notice?'
				}
			]
		},
		{
			id: 'lesson-11-finish-the-quote',
			title: 'Finish the quote',
			slug: 'finish-the-quote',
			description: 'Callback to lesson 1.',
			icon: 'mdi:format-quote-close',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'recall',
					id: 'mod-11-recall',
					title: 'Finish the quote',
					estimatedMinutes: 2,
					mode: 'finish-quote',
					referenceLessonSlug: 'what-is-creativity',
					prompt: 'Creativity is noticing what ___',
					expected: 'others walk past'
				}
			]
		},
		{
			id: 'lesson-12-why-limits-help',
			title: 'Why limits help',
			slug: 'why-limits-help',
			description: 'Introduce constraints.',
			icon: 'mdi:fence',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'intro',
					id: 'mod-12-intro',
					title: 'Why limits help',
					estimatedMinutes: 2,
					body: 'Limits don\'t cage creativity. They shape it.'
				}
			]
		},
		{
			id: 'lesson-13-one-rule',
			title: 'Write with one rule',
			slug: 'one-rule',
			description: 'A single constraint, one round.',
			icon: 'mdi:pencil-ruler',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'exercise',
					id: 'mod-13-one-rule',
					title: 'Write with one rule',
					componentId: 'ConstraintChallenge',
					estimatedMinutes: 2,
					config: {
						prompt: 'Describe your morning.',
						constraints: ['You cannot use the letter E.'],
						instruction: 'Write a few sentences — the rule will force every word to matter.',
						compact: true
					}
				}
			]
		},
		{
			id: 'lesson-14-take-a-new-path',
			title: 'Take a new path',
			slug: 'take-a-new-path',
			description: 'Walk a route you\'ve never taken.',
			icon: 'mdi:walk',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'real_life_task',
					id: 'mod-14-task',
					title: 'Take a new path',
					estimatedMinutes: 2,
					instruction:
						'Next time you leave the house, take a route you\'ve never taken. Even a small detour counts. Pay attention.',
					feedbackPrompt: 'What did you see on the new path that you\'d never noticed before?',
					returnAfterMinutes: 0
				}
			]
		},
		{
			id: 'lesson-15-two-minutes-no-editing',
			title: 'Two minutes, no editing',
			slug: 'two-minutes-no-editing',
			description: 'Free-write without judgment.',
			icon: 'mdi:timer-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-15-reflection',
					title: 'Two minutes, no editing',
					estimatedMinutes: 2,
					prompt:
						'Write for two minutes without stopping, without editing, without reading back. Any topic. Just keep the words moving.',
					minLength: 80
				}
			]
		},

		// ─── Act 3: Practice (16–22) ─────────────────────────────────────────
		{
			id: 'lesson-16-remember-paperclip',
			title: 'Remember the paperclip?',
			slug: 'remember-paperclip',
			description: 'Callback to lesson 7.',
			icon: 'mdi:refresh',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'recall',
					id: 'mod-16-recall',
					title: 'Remember the paperclip?',
					estimatedMinutes: 2,
					mode: 'open-recall',
					referenceLessonSlug: 'paperclip-test',
					prompt:
						'A few days ago you brainstormed uses for a paperclip. What\'s one idea of yours you still remember?'
				}
			]
		},
		{
			id: 'lesson-17-this-is-like-that',
			title: 'This is like that',
			slug: 'this-is-like-that',
			description: 'A single analogy.',
			icon: 'mdi:swap-horizontal',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'exercise',
					id: 'mod-17-analogy',
					title: 'This is like that',
					componentId: 'AnalogySprint',
					estimatedMinutes: 2,
					config: {
						concept: 'Learning a new skill',
						domains: ['cooking'],
						instruction: 'Finish the analogy. Push past the first answer.',
						timerDuration: 90,
						compact: true
					}
				}
			]
		},
		{
			id: 'lesson-18-combine-two-things',
			title: 'Combine two unrelated things',
			slug: 'combine-two-things',
			description: 'Pick any two. Imagine the result.',
			icon: 'mdi:merge',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'choice',
					id: 'mod-18-choice',
					title: 'Combine two unrelated things',
					estimatedMinutes: 2,
					allowMultiple: true,
					prompt: 'Pick any two. Imagine what they could become together.',
					options: [
						{ id: 'umbrella', label: 'Umbrella' },
						{ id: 'dictionary', label: 'Dictionary' },
						{ id: 'bicycle', label: 'Bicycle' },
						{ id: 'jellyfish', label: 'Jellyfish' },
						{ id: 'coffee-cup', label: 'Coffee cup' },
						{ id: 'guitar', label: 'Guitar' }
					]
				}
			]
		},
		{
			id: 'lesson-19-silence-as-fuel',
			title: 'Silence as fuel',
			slug: 'silence-as-fuel',
			description: 'Two minutes, no sound.',
			icon: 'mdi:volume-off',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'meditation',
					id: 'mod-19-meditation',
					title: 'Silence as fuel',
					estimatedMinutes: 2,
					durationSeconds: 120,
					style: 'silence'
				}
			]
		},
		{
			id: 'lesson-20-creative-act-for-someone',
			title: 'A creative act for someone',
			slug: 'creative-act-for-someone',
			description: 'Something small, for another person.',
			icon: 'mdi:hand-heart',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'real_life_task',
					id: 'mod-20-task',
					title: 'A creative act for someone',
					estimatedMinutes: 2,
					instruction:
						'Today, do one small creative thing for someone else. A doodle, a weird compliment, a song recommendation with a note. Tiny counts.',
					feedbackPrompt: 'What did you do? How did they react?',
					returnAfterMinutes: 0
				}
			]
		},
		{
			id: 'lesson-21-who-inspires-you',
			title: 'Who inspires you?',
			slug: 'who-inspires-you',
			description: 'Name a person and why.',
			icon: 'mdi:account-star-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-21-reflection',
					title: 'Who inspires you?',
					estimatedMinutes: 2,
					prompt:
						'Name one person whose creativity you admire — alive or not, famous or not. What about them sticks with you?',
					minLength: 40
				}
			]
		},
		{
			id: 'lesson-22-photo-story',
			title: 'From a photo, a story',
			slug: 'photo-story',
			description: 'A short story seeded by your own photo.',
			icon: 'mdi:image-text',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'exercise',
					id: 'mod-22-story',
					title: 'From a photo, a story',
					componentId: 'StoryBuilder',
					estimatedMinutes: 2,
					config: {
						prompt:
							'Look at the photo you took earlier in the journey. Write a tiny story that starts with that object.',
						instruction: 'One short paragraph. No editing as you go.',
						compact: true
					}
				}
			]
		},

		// ─── Act 4: Integration (23–30) ──────────────────────────────────────
		{
			id: 'lesson-23-how-far-youve-come',
			title: 'How far you\'ve come',
			slug: 'how-far-youve-come',
			description: 'Check in on what you\'ve tried.',
			icon: 'mdi:map-marker-path',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'recall',
					id: 'mod-23-recall',
					title: 'How far you\'ve come',
					estimatedMinutes: 2,
					mode: 'multi-check',
					prompt: 'Which of these have you actually done?',
					options: [
						'Noticed something creative in the world',
						'Took a new route',
						'Did a phone-free minute',
						'Wrote without editing',
						'Photographed something ordinary',
						'Did something creative for someone'
					]
				}
			]
		},
		{
			id: 'lesson-24-be-bored',
			title: 'Be bored for two minutes',
			slug: 'be-bored',
			description: 'No phone, no activity.',
			icon: 'mdi:hourglass-empty',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'phone_free',
					id: 'mod-24-phone-free',
					title: 'Be bored for two minutes',
					estimatedMinutes: 2,
					durationSeconds: 120
				}
			]
		},
		{
			id: 'lesson-25-design-tiny-ritual',
			title: 'Design your tiny ritual',
			slug: 'design-tiny-ritual',
			description: 'Invent a 30-second daily creative ritual.',
			icon: 'mdi:hammer-wrench',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-25-reflection',
					title: 'Design your tiny ritual',
					estimatedMinutes: 2,
					prompt:
						'Invent a 30-second creative ritual you could realistically do every day. What is it? When does it happen?',
					minLength: 50
				}
			]
		},
		{
			id: 'lesson-26-do-your-ritual',
			title: 'Do your ritual today',
			slug: 'do-your-ritual',
			description: 'Execute the ritual you designed.',
			icon: 'mdi:check-decagram-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'real_life_task',
					id: 'mod-26-task',
					title: 'Do your ritual today',
					estimatedMinutes: 2,
					instruction:
						'Do the 30-second ritual you designed in the last lesson. Right now if you can.',
					feedbackPrompt: 'How did it feel? Would you do it again tomorrow?',
					returnAfterMinutes: 0
				}
			]
		},
		{
			id: 'lesson-27-finish-older-quote',
			title: 'Finish this older quote',
			slug: 'finish-older-quote',
			description: 'Callback to lesson 12.',
			icon: 'mdi:format-quote-close-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'recall',
					id: 'mod-27-recall',
					title: 'Finish this older quote',
					estimatedMinutes: 2,
					mode: 'finish-quote',
					referenceLessonSlug: 'why-limits-help',
					prompt: 'Limits don\'t cage creativity. They ___',
					expected: 'shape it'
				}
			]
		},
		{
			id: 'lesson-28-how-would-you-share',
			title: 'How would you share?',
			slug: 'how-would-you-share',
			description: 'Low-stakes framing for sharing creative work.',
			icon: 'mdi:share-variant',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'choice',
					id: 'mod-28-choice',
					title: 'How would you share?',
					estimatedMinutes: 2,
					prompt:
						'If you made something creative today, how would you want to share it?',
					options: [
						{
							id: 'one-friend',
							label: 'Just one friend',
							body: 'That\'s enough. Sharing with one person is still sharing.'
						},
						{
							id: 'small-group',
							label: 'A small group',
							body: 'Small rooms are where most creative work gets its first real feedback.'
						},
						{
							id: 'online',
							label: 'Online, loudly',
							body: 'If that feels right — go. The internet is a room too.'
						},
						{
							id: 'private',
							label: 'Keep it for myself',
							body: 'Also fine. Not everything has to be shown to count.'
						}
					]
				}
			]
		},
		{
			id: 'lesson-29-letter-past-self',
			title: 'A letter to your past self',
			slug: 'letter-past-self',
			description: 'An integration moment.',
			icon: 'mdi:email-outline',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'reflection',
					id: 'mod-29-reflection',
					title: 'A letter to your past self',
					estimatedMinutes: 2,
					prompt:
						'Write a short letter to the version of you who started this journey. What do you want them to know?',
					minLength: 80
				}
			]
		},
		{
			id: 'lesson-30-journey-continues',
			title: 'The journey continues',
			slug: 'journey-continues',
			description: 'Close the arc. Hand off to practice.',
			icon: 'mdi:flag-checkered',
			estimatedMinutes: 2,
			modules: [
				{
					type: 'intro',
					id: 'mod-30-intro',
					title: 'The journey continues',
					estimatedMinutes: 2,
					body:
						'The journey ends here — but creativity doesn\'t. From now on, it lives in how you look at everything.'
				}
			]
		}
	]
};
