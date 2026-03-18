import {
	forceSimulation,
	forceX,
	forceY,
	forceManyBody,
	forceCollide,
	type SimulationNodeDatum
} from 'd3-force';
import { prefersReducedMotion } from 'svelte/motion';

export interface SimBubble extends SimulationNodeDatum {
	id: string;
	text: string;
	color: string;
	radius: number;
	/** Internal flag — true for the invisible center anchor node. */
	_isCenter?: boolean;
}

/** Approximate half-width of a bubble from its text length. */
function estimateRadius(text: string): number {
	return Math.max(30, text.length * 4.5 + 14);
}

export function createBubbleSimulation(centerX: number, centerY: number, promptText: string, containerWidth = 600, containerHeight = 360) {
	// Invisible fixed node at center — participates in collision so bubbles orbit around it.
	const centerNode: SimBubble = {
		id: '__center__',
		text: '',
		color: '',
		radius: estimateRadius(promptText) + 10,
		fx: centerX,
		fy: centerY,
		_isCenter: true
	};

	let allNodes: SimBubble[] = $state([centerNode]);
	let tickVersion = $state(0);

	const simulation = forceSimulation<SimBubble>(allNodes)
		.force('x', forceX<SimBubble>(centerX).strength(0.03))
		.force('y', forceY<SimBubble>(centerY).strength(0.03))
		.force('charge', forceManyBody<SimBubble>().strength(-20))
		.force(
			'collide',
			forceCollide<SimBubble>((d) => d.radius + 4).strength(0.5)
		)
		.alphaDecay(0.005)
		.velocityDecay(0.15)
		.on('tick', () => {
			// Boundary clamping (skip the fixed center node)
			for (const n of allNodes) {
				if (n._isCenter) continue;
				const r = n.radius;
				n.x = Math.max(r, Math.min(containerWidth - r, n.x!));
				n.y = Math.max(r, Math.min(containerHeight - r, n.y!));
			}
			tickVersion++;
		});

	// Stop — no visible nodes yet
	simulation.stop();

	function addBubble(id: string, text: string, color: string, startX: number, startY: number) {
		const bubble: SimBubble = {
			id,
			text,
			color,
			radius: estimateRadius(text),
			x: startX,
			y: startY,
			vx: 0,
			vy: 0
		};
		allNodes.push(bubble);
		simulation.nodes(allNodes);

		if (prefersReducedMotion.current) {
			simulation.alpha(0.5).stop();
			for (let i = 0; i < 300; i++) simulation.tick();
			tickVersion++;
		} else {
			simulation.alpha(0.5).restart();
		}
	}

	function settle() {
		simulation.alphaDecay(0.1);
		if (prefersReducedMotion.current) {
			simulation.alpha(0.3).stop();
			for (let i = 0; i < 300; i++) simulation.tick();
			tickVersion++;
		} else {
			simulation.alpha(0.3).restart();
		}
	}

	function reset() {
		simulation.stop();
		// Keep only the center anchor
		allNodes.length = 0;
		allNodes.push(centerNode);
		simulation.nodes(allNodes);
		tickVersion++;
	}

	function destroy() {
		simulation.stop();
	}

	return {
		get nodes() {
			// Reading tickVersion makes this reactive — filter out the center anchor
			void tickVersion;
			return allNodes.filter((n) => !n._isCenter);
		},
		addBubble,
		settle,
		reset,
		destroy
	};
}
