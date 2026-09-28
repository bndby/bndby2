import { IDLE, cloneState, step } from './game.js';
import { GROUND_Y, LEVEL_H, TILE, Tile, idx, isSolid } from './tiles.js';

const ACTIONS = [
	{ dir: 1, run: true, jump: 'none', down: false },
	{ dir: 1, run: true, jump: 'full', down: false },
	{ dir: 1, run: true, jump: 'short', down: false },
	{ dir: 1, run: false, jump: 'full', down: false },
	{ dir: 0, run: false, jump: 'none', down: false },
	{ dir: 0, run: true, jump: 'full', down: false },
	{ dir: -1, run: true, jump: 'none', down: false },
	{ dir: -1, run: true, jump: 'short', down: false },
	{ dir: -1, run: true, jump: 'full', down: false },
];

const HORIZON = 48;

function solid(state, tx, ty) {
	if (ty < 0 || ty >= LEVEL_H || tx < 0 || tx >= state.w) return false;
	return isSolid(state.tiles[idx(tx, ty, state.w)]);
}

function tryEnterPipe(state) {
	const exit = state.exit;
	if (!exit || exit.type !== 'pipe' || exit.mode !== 'down') return null;
	const mario = state.mario;
	if (!mario.onGround) return null;
	const center = mario.x + mario.w * 0.5;
	if (center < exit.x || center > exit.x + exit.w) return null;
	if (mario.y > exit.y + exit.h) return null;
	return { dir: 0, run: false, jump: 'none', down: true };
}

function columnFate(state, tx, fromTy) {
	for (let ty = fromTy; ty < LEVEL_H; ty += 1) {
		if (tx < 0 || tx >= state.w) return 'solid';
		const tile = state.tiles[idx(tx, ty, state.w)];
		if (tile === Tile.Lava) return 'dead';
		if (isSolid(tile)) return 'solid';
	}
	return 'dead';
}

function pitAhead(state) {
	const mario = state.mario;
	if (!mario.onGround || state.theme === 'underwater') return null;
	const fromTy = Math.floor((mario.y + mario.h + 2) / TILE);
	const tx = Math.floor((mario.x + mario.w * 0.5) / TILE);
	if (columnFate(state, tx, fromTy) === 'dead') return null;
	const front = mario.x + mario.w;
	const start = Math.floor(front / TILE);
	for (let col = start; col < start + 5; col += 1) {
		if (liftUnder(state, col * TILE + 4, mario.y + mario.h + 4)) continue;
		if (columnFate(state, col, fromTy) === 'dead')
			return col * TILE - front;
	}
	return null;
}

function pitEdge(state) {
	const mario = state.mario;
	if (!mario.onGround || state.theme === 'underwater' || mario.vx < 1.15) {
		return false;
	}
	const fromTy = Math.floor((mario.y + mario.h + 2) / TILE);
	const feet = mario.y + mario.h + 3;
	const under =
		columnFate(
			state,
			Math.floor((mario.x + mario.w * 0.5) / TILE),
			fromTy,
		) === 'solid';
	const front = mario.x + mario.w + 2;
	const ahead =
		columnFate(state, Math.floor(front / TILE), fromTy) === 'solid' ||
		liftUnder(state, front, feet);
	return under && !ahead;
}

function liftUnder(state, x, y) {
	return state.lifts.some(
		(lift) =>
			x > lift.x &&
			x < lift.x + lift.w &&
			y >= lift.y - 2 &&
			y <= lift.y + lift.h + 6,
	);
}

function pickTarget(state) {
	const mario = state.mario;
	const targets = [];
	const add = (x, y, priority, kind = 'item') => {
		if (x < state.camX - 6) return;
		if (mario.x <= state.camX + 3 && x < mario.x - 2) return;
		if (x < mario.x - 80 && priority < 6) return;
		if (x > mario.x + 280) return;
		const dy = y - (mario.y + mario.h);
		if (dy < -150 || dy > 180) return;
		targets.push({ x, y, priority, kind });
	};

	for (const item of state.items) {
		if (item.alive === false) continue;
		add(item.x, item.y, item.kind === 'coin' ? 4 : 6.5);
	}

	const x0 = Math.max(0, Math.floor((mario.x - 40) / TILE));
	const x1 = Math.min(state.w - 1, Math.floor((mario.x + 250) / TILE));
	for (let ty = 0; ty < LEVEL_H; ty += 1) {
		for (let tx = x0; tx <= x1; tx += 1) {
			const tile = state.tiles[idx(tx, ty, state.w)];
			let priority = 0;
			if (
				tile === Tile.Mushroom ||
				tile === Tile.Star ||
				tile === Tile.HiddenOneUp
			) {
				priority = 6.2;
			} else if (
				tile === Tile.Question ||
				tile === Tile.HiddenCoin ||
				tile === Tile.MultiCoin
			) {
				priority = 3.4;
			}
			if (!priority) continue;
			const bottom = ty * TILE + TILE;
			if (bottom >= mario.y + mario.h - 2) continue;
			add(tx * TILE + 4, ty * TILE, priority);
		}
	}

	for (const enemy of state.enemies) {
		if (enemy.alive === false) continue;
		if (!stompable(enemy.kind)) continue;
		add(enemy.x, enemy.y, 3.3);
	}

	if (state.exit) {
		const y =
			state.exit.type === 'pipe' ? state.exit.y : GROUND_Y * TILE - 8;
		add(state.exit.x, y, 1.5, 'exit');
	}

	let best = null;
	let bestScore = -Infinity;
	for (const target of targets) {
		const dx = target.x - mario.x;
		let priority = target.priority;
		if (dx < 56 && dx > -36) priority += 5;
		const score =
			priority * 190 - Math.hypot(dx, (target.y - mario.y) * 1.25);
		if (score > bestScore) {
			bestScore = score;
			best = target;
		}
	}
	return best;
}

function stompable(kind) {
	return (
		kind === 'goomba' ||
		kind === 'koopa' ||
		kind === 'paratroopa' ||
		kind === 'buzzy' ||
		kind === 'shell' ||
		kind === 'bullet' ||
		kind === 'jumpcheep' ||
		kind === 'hammerbro'
	);
}

function rollout(state, action, target) {
	const sim = cloneState(state);
	let score = 0;
	let holdJump = action.jump !== 'none';
	for (let frame = 0; frame < HORIZON; frame += 1) {
		const coins = sim.coinTotal;
		const kills = sim.kills;
		const power = sim.powerups;
		const lives = sim.lives;
		const form = sim.mario.form;
		const airborne = !sim.mario.onGround;
		const input = holdJump ? action : { ...action, jump: 'none' };
		step(sim, input);
		if (holdJump && airborne && sim.mario.onGround) holdJump = false;
		if (sim.coinTotal > coins) score += 640;
		if (sim.kills > kills) score += 460;
		if (sim.powerups > power) score += 1200;
		if (sim.lives > lives) score += 800;
		if (form !== 'small' && sim.mario.form === 'small') score -= 3200;
		if (sim.mode === 'dead' || sim.mario.dead) return score - 1e9;
		if (sim.mode !== 'play') score += 12000;
	}
	const progressed = sim.mario.x - state.mario.x;
	const gained =
		sim.coinTotal > state.coinTotal ||
		sim.kills > state.kills ||
		sim.powerups > state.powerups ||
		sim.lives > state.lives;
	score += progressed * 2.2;
	if (action.dir < 0 && progressed > -0.4) score -= 520;
	if (Math.abs(progressed) < 0.4 && action.jump === 'none') score -= 70;
	if (progressed < 0.4 && !gained && target?.kind !== 'exit') score -= 90;
	if (action.dir === 0 && action.jump === 'none') score -= 36;
	if (target) {
		const before = Math.hypot(
			target.x - state.mario.x,
			target.y - state.mario.y,
		);
		const after = Math.hypot(
			target.x - sim.mario.x,
			target.y - sim.mario.y,
		);
		const behind = target.x < state.mario.x - 16;
		const exitTarget = target.kind === 'exit';
		const pull = exitTarget || gained ? 7.5 : 1.1;
		score += (before - after) * (behind ? 1.4 : pull);
	}
	if (!sim.mario.onGround && !willLand(sim)) score -= 5000;
	return score;
}

function willLand(state) {
	const mario = state.mario;
	if (mario.onGround) return true;
	let x = mario.x;
	let y = mario.y;
	let vy = mario.vy;
	const vx = mario.vx;
	for (let frame = 0; frame < 90; frame += 1) {
		const prevBottom = y + mario.h;
		vy = Math.min(4.45, vy + (vy < 0 ? 0.2 : 0.34));
		x += vx;
		y += vy;
		if (y > LEVEL_H * TILE) return false;
		const feet = y + mario.h;
		const ty = Math.floor((feet - 0.01) / TILE);
		const tx0 = Math.floor(x / TILE);
		const tx1 = Math.floor((x + mario.w - 0.01) / TILE);
		for (let tx = tx0; tx <= tx1; tx += 1) {
			if (solid(state, tx, ty)) {
				const top = ty * TILE;
				if (prevBottom <= top + 1.5 && feet >= top) return true;
			}
		}
		if (liftUnder(state, x + mario.w * 0.5, feet)) return true;
	}
	return false;
}

export function chooseAction(state, previous = IDLE) {
	if (state.mode !== 'play' || state.mario.dead) return IDLE;
	const pipe = tryEnterPipe(state);
	if (pipe) return pipe;

	const target = pickTarget(state);
	let best = ACTIONS[0];
	let bestScore = -Infinity;
	let bestJump = null;
	let bestJumpScore = -Infinity;
	let alt = null;
	let altScore = -Infinity;
	let altRaw = -Infinity;
	let bestRaw = -Infinity;
	const tense = hazardClose(state) || pitAhead(state) != null;
	for (const action of ACTIONS) {
		const score = rollout(state, action, target);
		const sticky =
			previous &&
			previous.dir === action.dir &&
			previous.jump === action.jump &&
			previous.run === action.run
				? 25
				: 0;
		const total = score + sticky + (tense ? 0 : (Math.random() - 0.5) * 36);
		if (total > bestScore) {
			alt = best;
			altScore = bestScore;
			altRaw = bestRaw;
			bestScore = total;
			bestRaw = score;
			best = action;
		} else if (total > altScore) {
			altScore = total;
			altRaw = score;
			alt = action;
		}
		if (action.dir > 0 && action.jump !== 'none' && total > bestJumpScore) {
			bestJumpScore = total;
			bestJump = action;
		}
	}
	const pitSoon = pitAhead(state);
	if (
		alt &&
		altRaw > -1e8 &&
		bestRaw > -1e8 &&
		pitSoon == null &&
		!hazardClose(state) &&
		bestScore - altScore < 140 &&
		Math.random() < 0.3
	) {
		best = alt;
	}
	const pit = pitAhead(state);
	if (
		pit != null &&
		pit < 56 &&
		best.jump === 'none' &&
		bestJump &&
		bestJumpScore > bestScore
	) {
		return bestJump;
	}
	const above = rewardAbove(state);
	if (above) {
		const aboveScore = rollout(state, above, target);
		if (aboveScore > bestScore) return above;
	}
	if (
		pitEdge(state) &&
		best.jump === 'none' &&
		bestJump &&
		bestJumpScore > bestScore
	) {
		return bestJump;
	}
	const wall = wallGap(state);
	if (wall != null && wall < 58 && best.jump === 'none') {
		if (bestJump && bestJumpScore > bestScore && bestJumpScore > -1e8)
			return bestJump;
		if (wall < 14 && state.mario.x > state.camX + 8) {
			const back = { dir: -1, run: true, jump: 'none', down: false };
			if (rollout(state, back, target) > bestScore) return back;
		}
	}
	return best;
}

export function createDriver() {
	return {
		action: { dir: 1, run: true, jump: 'none', down: false },
		cooldown: 0,
		wasAir: false,
	};
}

export function drive(state, memory) {
	if (state.mode !== 'play' || state.mario.dead) {
		memory.action = IDLE;
		memory.cooldown = 0;
		memory.wasAir = false;
		return memory.action;
	}
	const water = state.theme === 'underwater';
	const grounded = state.mario.onGround;
	if (!water && grounded && memory.wasAir) {
		memory.action = { ...memory.action, jump: 'none' };
		memory.cooldown = 0;
	}
	memory.wasAir = !grounded && !water;
	const boss = bossPlan(state);
	if (boss) {
		memory.action = boss;
		memory.cooldown = 2;
		return memory.action;
	}
	if (memory.cooldown <= 0 && (grounded || water)) {
		memory.action = chooseAction(state, memory.action);
		const hop = memory.action.jump !== 'none' && !water;
		memory.cooldown = (hop ? 36 : 8) + Math.floor(Math.random() * 3);
	}
	memory.cooldown -= 1;
	return memory.action;
}

function hazardClose(state) {
	const mario = state.mario;
	return state.hazards.some((hazard) => {
		if (hazard.kind !== 'firebar' && hazard.kind !== 'podoboo')
			return false;
		return (
			Math.abs(hazard.x - mario.x) < 160 &&
			hazard.y < mario.y + mario.h + 64
		);
	});
}

function hammerBlocks(state) {
	const mario = state.mario;
	const feet = mario.y + mario.h;
	return state.hazards.some((hazard) => {
		if (hazard.kind !== 'hammer' || hazard.alive === false) return false;
		const ahead = hazard.x - (mario.x + mario.w);
		if (ahead < -18 || ahead > 26) return false;
		const bottom = hazard.y + hazard.h;
		return bottom > mario.y - 2 && hazard.y < feet + 4;
	});
}

function bossPlan(state) {
	if (state.theme !== 'castle') return null;
	const bowser = state.enemies.find(
		(enemy) =>
			enemy.alive !== false && enemy.kind === 'bowser' && !enemy.falling,
	);
	if (!bowser) return null;
	const mario = state.mario;
	if (mario.x > bowser.x + bowser.w + 4) return null;
	const dx = bowser.x - (mario.x + mario.w);
	if (dx > 180) return null;
	const clearance = mario.y - (bowser.y + bowser.h);
	if (!bowser.onGround && clearance > 2 && !hammerBlocks(state)) {
		return { dir: 1, run: true, jump: 'none', down: false };
	}
	if (dx < 72 || hammerBlocks(state)) {
		return { dir: -1, run: true, jump: 'none', down: false };
	}
	if (dx > 104) return { dir: 1, run: false, jump: 'none', down: false };
	return { dir: 0, run: false, jump: 'none', down: false };
}

function rewardAbove(state) {
	const mario = state.mario;
	if (!mario.onGround || state.theme === 'underwater') return null;
	const center = mario.x + mario.w * 0.5;
	for (const item of state.items) {
		if (item.alive === false || item.emerge > 0) continue;
		if (item.y > mario.y - 2) continue;
		const dx = item.x + item.w * 0.5 - center;
		if (dx < -18 || dx > 42) continue;
		return {
			dir: dx > 6 ? 1 : dx < -6 ? -1 : 0,
			run: false,
			jump: 'full',
			down: false,
		};
	}
	const tx = Math.floor(center / TILE);
	for (const col of [tx - 1, tx, tx + 1]) {
		if (col < 0 || col >= state.w) continue;
		for (let ty = 0; ty < Math.floor(mario.y / TILE); ty += 1) {
			const tile = state.tiles[idx(col, ty, state.w)];
			const bottom = ty * TILE + TILE;
			const feet = mario.y + mario.h;
			if (bottom >= feet - 4 || feet - bottom > 112) continue;
			if (
				tile === Tile.Question ||
				tile === Tile.Mushroom ||
				tile === Tile.Star ||
				tile === Tile.MultiCoin ||
				tile === Tile.HiddenCoin ||
				tile === Tile.HiddenOneUp
			) {
				return {
					dir: col > tx ? 1 : col < tx ? -1 : 0,
					run: true,
					jump: 'full',
					down: false,
				};
			}
		}
	}
	return null;
}

function wallGap(state) {
	const mario = state.mario;
	if (!mario.onGround || state.theme === 'underwater') return null;
	for (let dx = 1; dx <= 64; dx += 2) {
		const probe = mario.x + mario.w + dx;
		for (const y of [mario.y + 6, mario.y + mario.h * 0.55]) {
			const tx = Math.floor(probe / TILE);
			const ty = Math.floor(y / TILE);
			if (solid(state, tx, ty)) return dx;
		}
	}
	return null;
}
