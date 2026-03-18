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

export function createBubbleSimulation(promptText: string, containerHeight = 360) {
	let cWidth = 600;
	let cHeight = containerHeight;

	// Invisible fixed node at center — participates in collision so bubbles keep distance.
	const centerNode: SimBubble = {
		id: '__center__',
		text: '',
		color: '',
		radius: promptText.length * 16 + 20,
		fx: cWidth / 2,
		fy: cHeight / 2,
		_isCenter: true
	};

	let allNodes: SimBubble[] = $state([centerNode]);
	let tickVersion = $state(0);

	const getCx = () => cWidth / 2;
	const getCy = () => cHeight / 2;

	const simulation = forceSimulation<SimBubble>(allNodes)
		.force('x', forceX<SimBubble>(getCx).strength(0.06))
		.force('y', forceY<SimBubble>(getCy).strength(0.06))
		.force('charge', forceManyBody<SimBubble>().strength(-30))
		.force(
			'collide',
			forceCollide<SimBubble>((d) => d.radius + 4).strength(0.7)
		)
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
			simulation.alpha(0.8).stop();
			for (let i = 0; i < 300; i++) simulation.tick();
			tickVersion++;
		} else {
			simulation.alpha(0.8).restart();
		}
	}

	function settle() {
		simulation.alphaDecay(0.05);
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
		allNodes.length = 0;
		allNodes.push(centerNode);
		simulation.nodes(allNodes);
		simulation.alphaDecay(0.02);
		tickVersion++;
	}

	function resize(width: number, height: number) {
		cWidth = width;
		cHeight = height;
		centerNode.fx = width / 2;
		centerNode.fy = height / 2;
		if (allNodes.length > 1) {
			simulation.alpha(0.3).restart();
		}
	}

	function destroy() {
		simulation.stop();
	}

	return {
		get nodes() {
			void tickVersion;
			return allNodes.filter((n) => !n._isCenter);
		},
		get centerX() { return cWidth / 2; },
		get centerY() { return cHeight / 2; },
		addBubble,
		settle,
		reset,
		resize,
		destroy
	};
}
