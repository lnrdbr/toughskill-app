import type { Course } from '$lib/types/course';

export const creativity: Course = {
	id: 'creativity',
	title: 'Creativity',
	slug: 'creativity',
	description:
		'Develop your creative thinking through divergent thinking exercises and real-world challenges.',
	icon: 'mdi:lightbulb',
	color: 'primary',
	lessons: [
		{
			id: 'creativity-preparation',
			title: 'Preparation',
			slug: 'preparation',
			description: 'Warm up your creative muscles with classic divergent thinking challenges.',
			icon: 'mdi:dumbbell',
			modules: [
				{
					type: 'learning',
					id: 'intro-reading',
					title: 'Before You Begin',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Try this first challenge with no preparation. There are no wrong answers — just generate as many ideas as you can, as quickly as you can.'
					}
				},
				{
					type: 'exercise',
					id: 'paperclip-challenge',
					title: 'Paperclip Challenge',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {
						prompt: 'Paperclip',
						instruction: 'How many uses can you think of for a paperclip?',
						timerDuration: null
					}
				},
				{
					type: 'learning',
					id: 'dt-reading-1',
					title: 'What is Divergent Thinking?',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'What you just did is called **divergent thinking** — generating many possible solutions to an open-ended problem. Researchers measure it across three dimensions: **fluency** (how many ideas), **flexibility** (how many different categories), and **originality** (how unusual each idea is).'
					}
				},
				{
					type: 'learning',
					id: 'dt-reading-2',
					title: 'Pushing Past the Obvious',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'The key to improving is to push past your first obvious answers. Most people stop after the easy ideas. Try to think across categories — what if the object were a different size? A different material? Used by someone in a completely different context?'
					}
				},
				{
					type: 'results',
					id: 'paperclip-results',
					title: 'Paperclip Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'paperclip-challenge',
					config: {
						sourceExerciseId: 'paperclip-challenge'
					}
				},
				{
					type: 'learning',
					id: 'brick-intro',
					title: 'Try Again',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Now apply those strategies. This time, deliberately push into unusual categories — think about size, weight, texture, shape, context. See how your results compare to the first challenge.'
					}
				},
				{
					type: 'exercise',
					id: 'brick-challenge',
					title: 'Brick Challenge',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {
						prompt: 'Brick',
						instruction: 'How many uses can you think of for a brick?',
						timerDuration: 0
					}
				},
				{
					type: 'results',
					id: 'brick-results',
					title: 'Brick Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'brick-challenge',
					config: {
						sourceExerciseId: 'brick-challenge'
					}
				},
				{
					type: 'learning',
					id: 'brick-reflection',
					title: 'What Changed?',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Did you find yourself thinking more broadly the second time? That shift — from obvious to unexpected — is exactly what divergent thinking practice builds. Next, you will learn a structured framework that makes this shift deliberate.'
					}
				}
			],
			estimatedMinutes: 15
		},
		{
			id: 'creativity-scamper',
			title: 'SCAMPER',
			slug: 'scamper',
			description:
				'Apply structured creative lenses to transform everyday objects into something new.',
			icon: 'mdi:shape-outline',
			modules: [
				{
					type: 'learning',
					id: 'scamper-intro-1',
					title: 'From Free to Structured',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'In the previous lesson, you brainstormed freely. That works, but it is easy to get stuck. **SCAMPER** gives you a structured framework — seven lenses that force your thinking in different directions.'
					}
				},
				{
					type: 'learning',
					id: 'scamper-intro-2',
					title: 'The Seven Lenses',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'- **S**ubstitute — What could you swap out?\n- **C**ombine — What could you merge together?\n- **A**dapt — What could you borrow from elsewhere?\n- **M**odify — What could you change, enlarge, or shrink?\n- **P**ut to Other Uses — What else could it be used for?\n- **E**liminate — What could you remove or simplify?\n- **R**everse — What could you flip or rearrange?'
					}
				},
				{
					type: 'learning',
					id: 'scamper-intro-3',
					title: 'How to Use SCAMPER',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Work through each lens one at a time. You do not need to have ideas for every lens — some will click and others will not. That is part of the exercise. The goal is to try each perspective, not to fill every one equally.'
					}
				},
				{
					type: 'exercise',
					id: 'scamper-paperclip',
					title: 'SCAMPER: Paperclip',
					componentId: 'Scamper',
					estimatedMinutes: 10,
					config: {
						prompt: 'Paperclip',
						instruction:
							'Apply each SCAMPER lens to reimagine the humble paperclip. There are no wrong answers — explore freely.',
						timerDuration: 0,
						showIntro: true
					}
				},
				{
					type: 'results',
					id: 'scamper-paperclip-results',
					title: 'SCAMPER Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'scamper-paperclip',
					config: {
						sourceExerciseId: 'scamper-paperclip'
					}
				},
				{
					type: 'learning',
					id: 'scamper-reflection',
					title: 'Structured vs Free',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Compare your SCAMPER results to the free brainstorming from Lesson 1. Did the lenses push you into categories you would not have explored on your own? That structure is the tool — next, you will combine it with other techniques.'
					}
				}
			],
			estimatedMinutes: 13
		},
		{
			id: 'creativity-connections',
			title: 'Creative Connections',
			slug: 'connections',
			description:
				'Associative thinking — connecting unrelated concepts to spark novel ideas.',
			icon: 'mdi:vector-link',
			modules: [
				{
					type: 'learning',
					id: 'connections-reading-1',
					title: 'Building on What You Know',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'You have practised generating ideas freely (Lesson 1) and through structured lenses (Lesson 2). Now you will learn a third approach: **forcing connections between unrelated things.**'
					}
				},
				{
					type: 'learning',
					id: 'connections-reading-2',
					title: 'Cross-Domain Thinking',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Velcro came from connecting burrs to fabric fasteners. The smartphone merged a phone, camera, and computer. Neither invention came from thinking harder within one domain — they came from thinking *across* domains.'
					}
				},
				{
					type: 'learning',
					id: 'connections-reading-3',
					title: 'Why Constraints Help',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Open-ended brainstorming often produces generic results. But when you are told to combine two specific, unrelated objects, your brain is forced to find unexpected bridges. That constraint is the creative engine.'
					}
				},
				{
					type: 'exercise',
					id: 'forced-connections',
					title: 'Forced Connections',
					componentId: 'DivergentThinking',
					estimatedMinutes: 4,
					config: {
						prompt: 'You have a bicycle and a bookshelf. Generate as many product ideas, services, or concepts that combine elements of both.',
						instruction:
							'Think about materials, functions, users, contexts — force unexpected connections.',
						timerDuration: 180
					}
				},
				{
					type: 'results',
					id: 'forced-connections-results',
					title: 'Forced Connections Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'forced-connections',
					config: {
						sourceExerciseId: 'forced-connections'
					}
				},
				{
					type: 'learning',
					id: 'analogy-reading-1',
					title: 'Analogies as Creative Tools',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'When you say "software testing is like detective work," you import an entire framework — clues, suspects, evidence, deduction — into a domain where those concepts do not naturally live. That is the power of analogy.'
					}
				},
				{
					type: 'learning',
					id: 'analogy-reading-2',
					title: 'The Distant Analogy Principle',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'**Distant analogies** produce more original insights than near ones. "Biology → software" generates more novel ideas than "Java → Python." The further the conceptual distance, the more creative the bridge. Push beyond the first comparison that comes to mind.'
					}
				},
				{
					type: 'exercise',
					id: 'analogy-exercise',
					title: 'Analogy Sprint',
					componentId: 'AnalogySprint',
					estimatedMinutes: 4,
					config: {
						concept: 'Software testing',
						domains: ['cooking', 'nature', 'detective work', 'sports', 'music'],
						instruction:
							"For each domain, complete: 'Software testing is like _____ because _____.' Push beyond the obvious.",
						timerDuration: 240
					}
				},
				{
					type: 'results',
					id: 'analogy-results',
					title: 'Analogy Sprint Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'analogy-exercise',
					config: {
						sourceExerciseId: 'analogy-exercise'
					}
				}
			],
			estimatedMinutes: 14
		},
		{
			id: 'creativity-constraints',
			title: 'Thinking Under Constraints',
			slug: 'constraints',
			description:
				'Constraints as creative fuel — how limitations force original thinking.',
			icon: 'mdi:lock-outline',
			modules: [
				{
					type: 'learning',
					id: 'constraints-reading-1',
					title: 'The Constraint Paradox',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'You have practised free brainstorming, structured lenses, and forced connections. Now you will discover something counterintuitive: **more freedom often means less creativity.** When anything is possible, the brain defaults to the familiar.'
					}
				},
				{
					type: 'learning',
					id: 'constraints-reading-2',
					title: 'Constraints in Action',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Dr. Seuss wrote *Green Eggs and Ham* on a bet he could not use more than 50 words. Twitter\'s 140-character limit spawned entirely new writing forms. A painter limited to two colours, a chef with five ingredients — each constraint forces decisions that open unexpected paths.'
					}
				},
				{
					type: 'learning',
					id: 'constraints-reading-3',
					title: 'Your Challenge',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'You will solve the same problem three times, each time with tighter constraints. Watch how your thinking changes as the walls close in.'
					}
				},
				{
					type: 'exercise',
					id: 'constraint-exercise',
					title: 'Constraint Challenge',
					componentId: 'ConstraintChallenge',
					estimatedMinutes: 5,
					config: {
						prompt: 'Design a way to teach someone a new skill.',
						constraints: [
							'You cannot use any screen or digital device',
							'The learner only has 10 minutes per day',
							'The teaching method must work for any skill, not just one'
						],
						instruction:
							'Write a concrete solution for each round. Be specific about how it works.'
					}
				},
				{
					type: 'results',
					id: 'constraint-results',
					title: 'Constraint Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'constraint-exercise',
					config: {
						sourceExerciseId: 'constraint-exercise'
					}
				},
				{
					type: 'learning',
					id: 'reframe-reading-1',
					title: 'Reverse Thinking',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Here is another constraint technique. Instead of asking "how do I solve X?", ask "how do I make X worse?" — then invert each answer. This bypasses **functional fixedness**, the tendency to see things only in their usual role.'
					}
				},
				{
					type: 'learning',
					id: 'reframe-reading-2',
					title: 'Reverse Thinking Example',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'"How to make a restaurant terrible" → *rude staff, cold food, no menu, filthy tables.* Invert each point → *warm greeting, food served hot, clear menu, spotless dining area.* The reversal tells you which factors matter most.'
					}
				},
				{
					type: 'exercise',
					id: 'reverse-challenge',
					title: 'Reverse Thinking Challenge',
					componentId: 'DivergentThinking',
					estimatedMinutes: 4,
					config: {
						prompt: 'How would you design the worst possible mobile app for learning a new language?',
						instruction:
							'Think about UX, content, notifications, progression — make it as awful as possible. Be specific and creative.',
						timerDuration: 180
					}
				},
				{
					type: 'results',
					id: 'reverse-results',
					title: 'Reverse Thinking Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'reverse-challenge',
					config: {
						sourceExerciseId: 'reverse-challenge'
					}
				}
			],
			estimatedMinutes: 13
		},
		{
			id: 'creativity-narrative',
			title: 'Narrative Creativity',
			slug: 'narrative',
			description:
				'Storytelling as a creative skill — constructing meaning, building worlds, finding voice.',
			icon: 'mdi:feather',
			modules: [
				{
					type: 'learning',
					id: 'narrative-reading-1',
					title: 'A New Kind of Exercise',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'So far you have generated lists of ideas. Now you will write prose. Storytelling is a creative skill that combines everything you have practised — originality, structure, and perspective-shifting — into a single output.'
					}
				},
				{
					type: 'learning',
					id: 'narrative-reading-2',
					title: 'The Story Spine',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Pixar uses a story spine for every film: *"Once upon a time... Every day... Until one day... Because of that... Until finally..."* This structure works because it mirrors how humans process information — situation, disruption, consequence, resolution.'
					}
				},
				{
					type: 'learning',
					id: 'narrative-reading-3',
					title: 'What You Will Practise',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Creative writing builds three skills at once: **originality** (finding an unexpected angle), **detail** (making the reader see and feel), and **coherence** (holding the narrative together logically).'
					}
				},
				{
					type: 'exercise',
					id: 'story-seed',
					title: 'Story Seed',
					componentId: 'StoryBuilder',
					estimatedMinutes: 5,
					config: {
						prompt: 'A city where everyone can hear each other\'s thoughts wakes up one morning to complete silence.',
						instruction:
							'Continue this story in 100–200 words. Focus on one character\'s experience. Use specific sensory details — what do they see, feel, do?',
						minWords: 80,
						maxWords: 200
					}
				},
				{
					type: 'results',
					id: 'story-seed-results',
					title: 'Story Seed Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'story-seed',
					config: {
						sourceExerciseId: 'story-seed'
					}
				},
				{
					type: 'learning',
					id: 'perspective-reading-1',
					title: 'Perspective Shifting',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'The same event told by different characters produces completely different stories. A rainstorm is an inconvenience to a commuter, a relief to a farmer, and an adventure to a child.'
					}
				},
				{
					type: 'learning',
					id: 'perspective-reading-2',
					title: 'Writing from Unusual Angles',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'This is the same skill as SCAMPER\'s "Put to Other Uses" lens, applied to narrative. When you write from an unusual perspective — an object, an animal, a bystander — you see the world through unfamiliar eyes. Try it now.'
					}
				},
				{
					type: 'exercise',
					id: 'perspective-story',
					title: 'Perspective Story',
					componentId: 'StoryBuilder',
					estimatedMinutes: 5,
					config: {
						prompt: 'A vending machine in a hospital lobby has been watching people for 15 years.',
						instruction:
							'Write from the vending machine\'s perspective. What has it observed? What patterns has it noticed? What does it understand about humans that humans don\'t understand about themselves? 100–200 words.',
						minWords: 80,
						maxWords: 200
					}
				},
				{
					type: 'results',
					id: 'perspective-results',
					title: 'Perspective Story Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'perspective-story',
					config: {
						sourceExerciseId: 'perspective-story'
					}
				}
			],
			estimatedMinutes: 15
		},
		{
			id: 'creativity-synthesis',
			title: 'Synthesis',
			slug: 'synthesis',
			description:
				'Combining all creative thinking techniques in a single complex challenge.',
			icon: 'mdi:atom',
			modules: [
				{
					type: 'learning',
					id: 'synthesis-reading-1',
					title: 'Your Creative Toolkit',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Creative thinking is not one skill but a toolkit. You have built five tools: divergent thinking (volume), SCAMPER (structure), forced connections (cross-domain), constraints (originality under pressure), and storytelling (meaning).'
					}
				},
				{
					type: 'learning',
					id: 'synthesis-reading-2',
					title: 'Combining Techniques',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'The best creative work combines multiple modes. A product designer might brainstorm freely, apply SCAMPER to the best ideas, test them under real-world constraints, then pitch the result as a compelling narrative. This lesson puts it all together.'
					}
				},
				{
					type: 'exercise',
					id: 'synthesis-scamper',
					title: 'SCAMPER: The Classroom',
					componentId: 'Scamper',
					estimatedMinutes: 5,
					config: {
						prompt: 'The traditional school classroom',
						instruction:
							'Apply SCAMPER to completely reimagine what a classroom looks like, feels like, and does in 2035. Draw on everything you have practised in this course.',
						timerDuration: 0,
						showIntro: false
					}
				},
				{
					type: 'results',
					id: 'synthesis-scamper-results',
					title: 'SCAMPER Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'synthesis-scamper',
					config: {
						sourceExerciseId: 'synthesis-scamper'
					}
				},
				{
					type: 'exercise',
					id: 'synthesis-constraint',
					title: 'Design a Learning Experience',
					componentId: 'ConstraintChallenge',
					estimatedMinutes: 5,
					config: {
						prompt: 'Design a learning experience that teaches creativity itself.',
						constraints: [
							'No screens allowed',
							'Must work for a group of 20 strangers who just met',
							'The entire experience lasts exactly 30 minutes'
						],
						instruction:
							'Draw on techniques from this course: forced connections, reverse thinking, SCAMPER, storytelling. Be specific about activities, timing, and materials.'
					}
				},
				{
					type: 'results',
					id: 'synthesis-constraint-results',
					title: 'Constraint Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'synthesis-constraint',
					config: {
						sourceExerciseId: 'synthesis-constraint'
					}
				},
				{
					type: 'exercise',
					id: 'final-story',
					title: 'Course Reflection',
					componentId: 'StoryBuilder',
					estimatedMinutes: 3,
					config: {
						prompt: 'Write a short reflection (100–150 words) on how your creative thinking has changed during this course. What technique surprised you most? What will you use in your daily life?',
						instruction:
							'Be honest and specific. This is not graded — it is for you.',
						minWords: 80,
						maxWords: 200
					}
				},
				{
					type: 'results',
					id: 'final-story-results',
					title: 'Reflection Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'final-story',
					config: {
						sourceExerciseId: 'final-story'
					}
				}
			],
			estimatedMinutes: 16
		}
	]
};
