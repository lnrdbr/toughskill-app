<script lang="ts">
	import {
		forceSimulation,
		forceX,
		forceY,
		forceManyBody,
		forceCollide,
		type SimulationNodeDatum,
		type Force
	} from 'd3-force';
	import { prefersReducedMotion } from 'svelte/motion';
	import { SvelteSet } from 'svelte/reactivity';
	import Bubble from './Bubble.svelte';
	import type { BubbleData } from './types.ts';

	interface SimBubble extends SimulationNodeDatum {
		id: string;
		text: string;
		color: string;
		radius: number;
		_isCenter?: boolean;
	}

	let {
		prompt,
		bubbles = [],
		settled = false
	}: { prompt: string; bubbles?: BubbleData[]; settled?: boolean } = $props();

	const CLOUD_HEIGHT = 360;
	const FORCE_FIELD_RADIUS = 120; // repulsion zone around the prompt
	const FORCE_FIELD_STRENGTH = 8; // how hard bubbles are pushed out

	function estimateRadius(text: string): number {
		return Math.max(30, text.length * 4.5 + 14);
	}

	// --- simulation state ---
	let cWidth = $state(600);
	let cHeight = CLOUD_HEIGHT;
	let tickVersion = $state(0);

	const centerNode: SimBubble = {
		id: '__center__',
		text: '',
		color: '',
		radius: FORCE_FIELD_RADIUS,
		fx: 300,
		fy: CLOUD_HEIGHT / 2,
		_isCenter: true
	};

	let allNodes: SimBubble[] = $state([centerNode]);

	const getCx = () => cWidth / 2;
	const getCy = () => cHeight / 2;

	/** Custom force: radial repulsion from center point. */
	function forceFieldFromCenter() {
		let nodes: SimBubble[] = [];
		const cx = () => cWidth / 2;
		const cy = () => cHeight / 2;

		function force(alpha: number) {
			for (const n of nodes) {
				if (n._isCenter) continue;
				const dx = (n.x ?? 0) - cx();
				const dy = (n.y ?? 0) - cy();
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;

				if (dist < FORCE_FIELD_RADIUS + n.radius) {
					const push =
						((FORCE_FIELD_RADIUS + n.radius - dist) / dist) * FORCE_FIELD_STRENGTH * alpha;
					n.vx! += dx * push;
					n.vy! += dy * push;
				}
			}
		}

		force.initialize = (n: SimBubble[]) => {
			nodes = n;
		};
		return force;
	}

	const simulation = forceSimulation<SimBubble>(allNodes)
		.force('x', forceX<SimBubble>(getCx).strength(0.06))
		.force('y', forceY<SimBubble>(getCy).strength(0.06))
		.force('charge', forceManyBody<SimBubble>().strength(-30))
		.force('collide', forceCollide<SimBubble>((d) => d.radius + 4).strength(0.7))
		.force('forceField', forceFieldFromCenter() as Force<SimBubble, undefined>)
		.alphaDecay(0.02)
		.velocityDecay(0.3)
		.on('tick', () => {
			for (const n of allNodes) {
				if (n._isCenter) continue;
				const r = n.radius;
				n.x = Math.max(r, Math.min(cWidth - r, n.x!));
				n.y = Math.max(r, Math.min(cHeight - r, n.y!));
			}
			tickVersion++;
		});

	simulation.stop();

	// --- public-facing reactive nodes ---
	function visibleNodes(): SimBubble[] {
		void tickVersion;
		return allNodes.filter((n) => !n._isCenter);
	}

	// --- bubble tracking ---
	const knownIds = new SvelteSet<string>();

	$effect(() => {
		if (cWidth > 0) {
			cHeight = CLOUD_HEIGHT;
			centerNode.fx = cWidth / 2;
			centerNode.fy = cHeight / 2;
			if (allNodes.length > 1) {
				simulation.alpha(0.3).restart();
			}
		}
	});

	$effect(() => {
		for (const b of bubbles) {
			if (!knownIds.has(b.id)) {
				knownIds.add(b.id);
				const bubble: SimBubble = {
					id: b.id,
					text: b.text,
					color: b.color,
					radius: estimateRadius(b.text),
					x: cWidth / 2,
					y: CLOUD_HEIGHT,
					vx: 0,
					vy: 0
				};
				allNodes.push(bubble);
				simulation.nodes(allNodes);

				if (prefersReducedMotion.current) {
					simulation.alpha(0.8).stop();
					for (let i = 0; i < 300; i++) simulation.tick();
					tickVersion++;
				} else {
					simulation.alpha(0.8).restart();
				}
			}
		}
	});

	// Settle on phase change
	let wasSettled = false;
	$effect(() => {
		if (settled && !wasSettled) {
			simulation.alphaDecay(0.05);
			if (prefersReducedMotion.current) {
				simulation.alpha(0.3).stop();
				for (let i = 0; i < 300; i++) simulation.tick();
				tickVersion++;
			} else {
				simulation.alpha(0.3).restart();
			}
		}
		wasSettled = settled;
	});

	// Reset when bubbles are cleared
	$effect(() => {
		if (bubbles.length === 0 && knownIds.size > 0) {
			knownIds.clear();
			simulation.stop();
			allNodes.length = 0;
			allNodes.push(centerNode);
			simulation.nodes(allNodes);
			simulation.alphaDecay(0.02);
			tickVersion++;
		}
	});

	$effect(() => () => simulation.stop());
</script>

<div class="cloud" bind:clientWidth={cWidth}>
	<div class="prompt" class:settled>
		{prompt}
	</div>

	{#each visibleNodes() as bubble (bubble.id)}
		<Bubble text={bubble.text} x={bubble.x ?? 0} y={bubble.y ?? 0} color={bubble.color} />
	{/each}
</div>

<style>
	.cloud {
		position: relative;
		width: 100%;
		height: 360px;
		overflow: hidden;
	}

	.prompt {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: var(--font-display);
		font-size: 3rem;
		color: var(--color-foreground);
		text-align: center;
		pointer-events: none;
		transition: opacity 0.3s;
	}

	.prompt.settled {
		opacity: 0.4;
	}
</style>
