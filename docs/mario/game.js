import { LEVELS } from './levels.js';
import {
	GROUND_Y,
	LEVEL_H,
	TILE,
	Tile,
	VIEW_TILES_X,
	VIEW_TILES_Y,
	idx,
	isHeadBlock,
	isSolid,
} from './tiles.js';

export const IDLE = { dir: 0, run: false, jump: 'none', down: false };

const VIEW_W = VIEW_TILES_X * TILE;
const JUMP_WALK = -5.15;
const JUMP_RUN = -6.25;
const MAX_WALK = 1.45;
const MAX_RUN = 2.55;
const STOMP = -3.7;
const CHAIN = [100, 200, 400, 800, 1000, 2000, 4000, 8000];

export function createGame(options = {}) {
	const state = blankState();
	loadLevel(state, options.levelIndex ?? 0, {
		score: 0,
		coinTotal: 0,
		lives: options.lives ?? 3,
		form: 'small',
		skipCard: Boolean(options.skipCard),
	});
	return state;
}

function blankState() {
	return {
		tick: 0,
		mode: 'card',
		modeTime: 0,
		score: 0,
		coinTotal: 0,
		lives: 3,
		levelIndex: 0,
		time: 400,
		timeAcc: 0,
		camX: 0,
		events: [],
		tiles: new Uint8Array(0),
		enemies: [],
		items: [],
		shots: [],
		lifts: [],
		hazards: [],
		bridges: [],
		blockCoins: new Map(),
		mario: null,
		exitDone: false,
		deathCause: '',
		kills: 0,
		powerups: 0,
	};
}

export function loadLevel(state, index, carry = {}) {
	const level = LEVELS[index];
	state.levelIndex = index;
	state.world = level.world;
	state.stage = level.stage;
	state.theme = level.theme;
	state.levelId = level.id;
	state.w = level.w;
	state.h = level.h;
	state.time = level.time;
	state.timeAcc = 0;
	state.camX = 0;
	state.tiles = level.tiles.slice();
	state.enemies = level.enemies.map((enemy) => ({ ...enemy }));
	state.items = level.items.map((item) => ({ ...item }));
	state.shots = [];
	state.lifts = level.lifts.map((lift) => ({ ...lift }));
	state.hazards = level.hazards.map((hazard) => ({ ...hazard }));
	state.bridges = [];
	state.blockCoins = new Map(level.blockCoins);
	state.exit = level.exit ? { ...level.exit } : null;
	state.warps = level.warps.map((warp) => ({ ...warp }));
	state.castleX = level.castleX;
	state.coinBudget = level.coinBudget;
	state.enemyBudget = level.enemyBudget;
	state.exitDone = false;
	state.deathCause = '';
	state.bridgeLeft = level.bridge ? level.bridge[0] : 0;
	state.score = carry.score ?? state.score ?? 0;
	state.coinTotal = carry.coinTotal ?? state.coinTotal ?? 0;
	state.lives = carry.lives ?? state.lives ?? 3;
	state.kills = 0;
	state.powerups = 0;
	state.coinsAtStart = state.coinTotal;
	state.mario = makeMario(level, carry.form ?? 'small');
	state.mode = carry.skipCard ? 'play' : 'card';
	state.modeTime = 0;
	state.events = [];
}

function makeMario(level, form) {
	const h = form === 'small' ? 16 : 32;
	const surface = groundSurface(level.tiles, level.w, 3) ?? GROUND_Y;
	return {
		x: 3 * TILE,
		y: surface * TILE - h,
		w: 12,
		h,
		vx: 0,
		vy: 0,
		dir: 1,
		onGround: true,
		form,
		star: 0,
		invuln: 0,
		jumpTime: 0,
		rising: false,
		dead: false,
		fireCd: 0,
		combo: 0,
	};
}

function groundSurface(tiles, w, tx) {
	let saw = false;
	for (let ty = LEVEL_H - 1; ty >= 0; ty -= 1) {
		const solid = tx >= 0 && tx < w && isSolid(tiles[idx(tx, ty, w)]);
		if (solid) saw = true;
		else if (saw) return ty + 1;
	}
	return saw ? 0 : null;
}

export function cloneState(state) {
	return {
		...state,
		mario: { ...state.mario },
		tiles: state.tiles.slice(),
		enemies: state.enemies.map((actor) => ({ ...actor })),
		items: state.items.map((actor) => ({ ...actor })),
		shots: state.shots.map((actor) => ({ ...actor })),
		lifts: state.lifts.map((actor) => ({ ...actor })),
		hazards: state.hazards.map((actor) => ({ ...actor })),
		bridges: state.bridges.map((actor) => ({ ...actor })),
		blockCoins: new Map(state.blockCoins),
		exit: state.exit ? { ...state.exit } : null,
		events: [],
	};
}

export function step(state, input = IDLE) {
	state.tick += 1;
	state.events = [];
	const mode = state.mode;

	if (mode === 'card') {
		state.modeTime += 1;
		if (state.modeTime > 70) state.mode = 'play';
		return;
	}
	if (mode === 'gameover' || mode === 'victory') {
		state.modeTime += 1;
		if (state.modeTime > 130) {
			loadLevel(state, 0, {
				score: 0,
				coinTotal: 0,
				lives: 3,
				form: 'small',
			});
		}
		return;
	}
	if (mode === 'clear') {
		state.modeTime += 1;
		if (state.modeTime > 46) advance(state);
		return;
	}
	if (mode === 'dead') {
		const mario = state.mario;
		state.modeTime += 1;
		mario.vy = Math.min(4.6, mario.vy + 0.22);
		mario.y += mario.vy;
		if (state.modeTime > 100) {
			if (state.lives <= 0) {
				state.mode = 'gameover';
				state.modeTime = 0;
			} else {
				loadLevel(state, state.levelIndex, {
					score: state.score,
					coinTotal: state.coinTotal,
					lives: state.lives,
					form: 'small',
				});
			}
		}
		return;
	}
	if (mode === 'tally') {
		if (state.time > 0) {
			const chunk = Math.min(5, state.time);
			state.time -= chunk;
			state.score += chunk * 50;
			if (state.tick % 4 === 0) state.events.push({ type: 'blip' });
		} else {
			state.mode = 'clear';
			state.modeTime = 0;
			state.events.push({ type: 'clear' });
		}
		return;
	}
	if (mode === 'pole') {
		const mario = state.mario;
		mario.y += 2.1;
		mario.vx = 0;
		if (mario.y + mario.h >= GROUND_Y * TILE) {
			mario.y = GROUND_Y * TILE - mario.h;
			state.mode = 'walkoff';
		}
		updateCamera(state);
		return;
	}
	if (mode === 'walkoff') {
		const mario = state.mario;
		mario.x += 1.35;
		mario.dir = 1;
		mario.y = GROUND_Y * TILE - mario.h;
		updateCamera(state);
		if (mario.x >= state.castleX - 10) {
			state.mode = 'tally';
		}
		return;
	}
	if (mode === 'collapse') {
		updateCollapse(state);
		return;
	}

	playFrame(state, input);
}

function advance(state) {
	if (state.levelIndex + 1 >= LEVELS.length) {
		state.mode = 'victory';
		state.modeTime = 0;
		state.events.push({ type: 'win' });
		return;
	}
	loadLevel(state, state.levelIndex + 1, {
		score: state.score,
		coinTotal: state.coinTotal,
		lives: state.lives,
		form: state.mario.form,
	});
}

function playFrame(state, input) {
	const mario = state.mario;
	if (mario.onGround && mario.vy >= 0) mario.combo = 0;
	if (mario.star > 0) mario.star -= 1;
	if (mario.invuln > 0) mario.invuln -= 1;
	if (mario.fireCd > 0) mario.fireCd -= 1;

	updateLifts(state);
	updateEnemies(state);
	updateHazards(state);
	updateItems(state);
	updateShots(state);
	controlMario(state, input);
	collectItems(state);
	collideEnemies(state);
	collideHazards(state);
	checkSensors(state, input);
	updateTime(state);
	updateCamera(state);
	state.enemies = state.enemies.filter((enemy) => enemy.alive !== false);
	state.items = state.items.filter((item) => item.alive !== false);
	state.shots = state.shots.filter((shot) => shot.alive !== false);
}

function updateTime(state) {
	if (state.mode !== 'play') return;
	state.timeAcc += 1;
	if (state.timeAcc < 24) return;
	state.timeAcc = 0;
	state.time -= 1;
	if (state.time <= 0) defeat(state, 'time');
}

function controlMario(state, input) {
	const mario = state.mario;
	if (state.theme === 'underwater') {
		swim(state, input);
		return;
	}

	const max = input.run ? MAX_RUN : MAX_WALK;
	const acc = input.run ? 0.095 : 0.058;
	if (input.dir !== 0) {
		const turning = mario.vx * input.dir < 0;
		mario.vx += input.dir * acc * (turning ? 2.3 : 1);
		mario.dir = input.dir;
	} else {
		mario.vx *= 0.8;
		if (Math.abs(mario.vx) < 0.05) mario.vx = 0;
	}
	mario.vx = clamp(mario.vx, -max, max);

	const wantJump = input.jump === 'full' || input.jump === 'short';
	const hold =
		input.jump === 'full' ||
		(input.jump === 'short' && mario.jumpTime < 10);
	moveX(mario, state);

	if (wantJump && mario.onGround) {
		const fast = Math.abs(mario.vx) > 1.15;
		mario.vy = fast ? JUMP_RUN : JUMP_WALK;
		mario.onGround = false;
		mario.rising = true;
		mario.jumpTime = 0;
		state.events.push({ type: 'jump' });
	} else {
		if (mario.rising && !hold && mario.vy < 0) {
			mario.vy *= 0.48;
			mario.rising = false;
		}
		const gravity = mario.vy < 0 && hold ? 0.145 : 0.34;
		mario.vy = Math.min(4.45, mario.vy + gravity);
	}
	mario.jumpTime += 1;
	moveY(mario, state, true);

	if (mario.y > LEVEL_H * TILE) defeat(state, 'pit');

	if (
		input.run &&
		mario.form === 'fire' &&
		mario.fireCd <= 0 &&
		state.shots.length < 2 &&
		state.mode === 'play'
	) {
		state.shots.push({
			x: mario.x + (mario.dir > 0 ? mario.w : -8),
			y: mario.y + mario.h * 0.45,
			w: 8,
			h: 8,
			vx: mario.dir * 3.4,
			vy: 0.4,
			bounces: 0,
			alive: true,
		});
		mario.fireCd = 18;
		state.events.push({ type: 'fire' });
	}
}

function swim(state, input) {
	const mario = state.mario;
	if (input.dir !== 0) {
		mario.vx += input.dir * 0.045;
		mario.dir = input.dir;
	} else {
		mario.vx *= 0.9;
	}
	mario.vx = clamp(mario.vx, -1.15, 1.15);
	const wantJump = input.jump === 'full' || input.jump === 'short';
	if (wantJump && mario.jumpTime % 14 === 0) {
		mario.vy = -1.45;
		state.events.push({ type: 'jump' });
	}
	mario.jumpTime += 1;
	mario.vy = Math.min(1.25, mario.vy + 0.04);
	moveX(mario, state);
	moveY(mario, state, true);
	if (mario.y < 4) mario.y = 4;
	if (mario.y > LEVEL_H * TILE) defeat(state, 'pit');
}

function moveX(body, state) {
	body.x += body.vx;
	for (let pass = 0; pass < 3; pass += 1) {
		const hits = [];
		for (const [tx, ty] of cells(body)) {
			if (solidAt(state, tx, ty)) hits.push([tx, ty]);
		}
		if (hits.length === 0) break;
		const feet = body.y + body.h;
		const stepUp =
			body.vy >= 0 &&
			hits.every(([, ty]) => {
				const top = ty * TILE;
				return feet >= top && feet - top <= TILE;
			});
		if (stepUp) {
			const stand = Math.min(...hits.map(([, ty]) => ty * TILE));
			const raised = {
				x: body.x,
				y: stand - body.h,
				w: body.w,
				h: body.h,
			};
			let blocked = false;
			for (const [tx, ty] of cells(raised)) {
				if (solidAt(state, tx, ty)) blocked = true;
			}
			if (!blocked) {
				body.y = raised.y;
				body.onGround = true;
				continue;
			}
		}
		let tx = hits[0][0];
		if (body.vx > 0) tx = Math.max(...hits.map(([col]) => col));
		if (body.vx < 0) tx = Math.min(...hits.map(([col]) => col));
		if (body.vx >= 0) body.x = tx * TILE - body.w;
		else body.x = tx * TILE + TILE;
		body.vx = 0;
		break;
	}
	if (body.x < 0) {
		body.x = 0;
		body.vx = 0;
	}
	const maxX = state.w * TILE - body.w;
	if (body.x > maxX) {
		body.x = maxX;
		body.vx = 0;
	}
}

function moveY(body, state, canHitBlocks) {
	const prevY = body.y;
	body.y += body.vy;
	body.onGround = false;
	const headHits = [];

	if (body.vy >= 0) {
		for (const [tx, ty] of cells(body)) {
			if (!solidAt(state, tx, ty)) continue;
			const top = ty * TILE;
			if (prevY + body.h <= top + 0.8) {
				body.y = top - body.h;
				body.vy = 0;
				body.onGround = true;
			}
		}
		landOnLifts(body, state, prevY + body.h);
	} else {
		for (const [tx, ty] of cells(body)) {
			const tile = tileAt(state, tx, ty);
			const solid = isSolid(tile);
			const hidden =
				canHitBlocks &&
				(tile === Tile.HiddenCoin || tile === Tile.HiddenOneUp);
			if (!solid && !hidden) continue;
			const bottom = ty * TILE + TILE;
			if (prevY >= bottom - 0.8) headHits.push([tx, ty]);
		}
		if (headHits.length > 0) {
			const bottom = Math.max(
				...headHits.map(([, ty]) => ty * TILE + TILE),
			);
			body.y = bottom;
			body.vy = 0;
			body.rising = false;
			if (canHitBlocks) {
				for (const [tx, ty] of headHits) triggerBlock(state, tx, ty);
			}
		}
	}
}

function landOnLifts(body, state, prevBottom) {
	if (body.vy < 0) return;
	for (const lift of state.lifts) {
		const overlapX =
			body.x + body.w > lift.x + 1 && body.x < lift.x + lift.w - 1;
		if (!overlapX) continue;
		const top = lift.y;
		if (prevBottom <= top + 1.5 && body.y + body.h >= top) {
			body.y = top - body.h;
			body.vy = 0;
			body.onGround = true;
		}
	}
}

function cells(body) {
	const x0 = Math.floor(body.x / TILE);
	const x1 = Math.floor((body.x + body.w - 0.01) / TILE);
	const y0 = Math.floor(body.y / TILE);
	const y1 = Math.floor((body.y + body.h - 0.01) / TILE);
	const out = [];
	for (let ty = y0; ty <= y1; ty += 1) {
		for (let tx = x0; tx <= x1; tx += 1) out.push([tx, ty]);
	}
	return out;
}

function tileAt(state, tx, ty) {
	if (ty < 0 || ty >= state.h) return Tile.Empty;
	if (tx < 0 || tx >= state.w) return Tile.Solid;
	return state.tiles[idx(tx, ty, state.w)];
}

function setTile(state, tx, ty, tile) {
	if (tx < 0 || ty < 0 || tx >= state.w || ty >= state.h) return;
	state.tiles[idx(tx, ty, state.w)] = tile;
}

function solidAt(state, tx, ty) {
	return isSolid(tileAt(state, tx, ty));
}

function triggerBlock(state, tx, ty) {
	const tile = tileAt(state, tx, ty);
	if (
		!isHeadBlock(tile) &&
		tile !== Tile.HiddenCoin &&
		tile !== Tile.HiddenOneUp
	) {
		return;
	}
	const x = tx * TILE + 4;
	const y = ty * TILE;
	if (tile === Tile.Question || tile === Tile.HiddenCoin) {
		addCoin(state, x, y);
		setTile(state, tx, ty, Tile.Used);
		state.events.push({ type: 'bump' });
		return;
	}
	if (tile === Tile.MultiCoin) {
		const key = `${tx},${ty}`;
		const left = (state.blockCoins.get(key) ?? 1) - 1;
		addCoin(state, x, y);
		if (left <= 0) {
			state.blockCoins.delete(key);
			setTile(state, tx, ty, Tile.Used);
		} else {
			state.blockCoins.set(key, left);
		}
		state.events.push({ type: 'bump' });
		return;
	}
	if (tile === Tile.Mushroom) {
		const kind = state.mario.form === 'small' ? 'mushroom' : 'flower';
		spawnItem(state, tx, ty, kind);
		setTile(state, tx, ty, Tile.Used);
		state.events.push({ type: 'bump' });
		return;
	}
	if (tile === Tile.Star) {
		spawnItem(state, tx, ty, 'star');
		setTile(state, tx, ty, Tile.Used);
		state.events.push({ type: 'bump' });
		return;
	}
	if (tile === Tile.HiddenOneUp) {
		spawnItem(state, tx, ty, 'oneup');
		setTile(state, tx, ty, Tile.Used);
		state.events.push({ type: 'bump' });
		return;
	}
	if (tile === Tile.Brick) {
		if (state.mario.form === 'small') {
			state.events.push({ type: 'bump' });
		} else {
			setTile(state, tx, ty, Tile.Empty);
			addScore(state, 50, x, y, '50');
			state.events.push({ type: 'break' });
		}
	}
}

function spawnItem(state, tx, ty, kind) {
	state.items.push({
		kind,
		x: tx * TILE,
		y: ty * TILE - 1,
		w: 16,
		h: 16,
		vx: kind === 'flower' ? 0 : kind === 'star' ? 1.15 : 0.75,
		vy: 0,
		emerge: 16,
		dir: 1,
		alive: true,
		bounces: 0,
	});
}

function updateItems(state) {
	for (const item of state.items) {
		if (item.kind === 'coin') continue;
		if (item.emerge > 0) {
			item.y -= 1;
			item.emerge -= 1;
			if (item.emerge === 0 && item.kind === 'star') item.vy = -3.3;
			continue;
		}
		if (item.kind === 'flower') {
			item.vy = Math.min(3, item.vy + 0.3);
			moveX(item, state);
			moveY(item, state, false);
			continue;
		}
		if (item.kind === 'star') {
			item.vy = Math.min(4, item.vy + 0.28);
			moveX(item, state);
			if (item.vx === 0) item.vx = item.dir * 1.15;
			const prevY = item.y;
			moveY(item, state, false);
			if (item.onGround) item.vy = -3.2;
			if (item.y === prevY && item.vy < 0) item.vy = 0;
			continue;
		}
		item.vx = item.dir * 0.72;
		const before = item.vx;
		moveX(item, state);
		if (item.vx === 0 && before !== 0) {
			item.dir *= -1;
			item.vx = item.dir * 0.72;
		}
		item.vy = Math.min(4, item.vy + 0.28);
		moveY(item, state, false);
		if (item.y > LEVEL_H * TILE + 20) item.alive = false;
	}
}

function collectItems(state) {
	const mario = state.mario;
	if (state.mode !== 'play') return;
	for (const item of state.items) {
		if (item.alive === false || item.emerge > 0) continue;
		if (!overlap(mario, item)) continue;
		item.alive = false;
		if (item.kind === 'coin') {
			addCoin(state, item.x, item.y);
			continue;
		}
		if (item.kind === 'mushroom') {
			if (mario.form === 'small') grow(state);
			addScore(state, 1000, item.x, item.y, '1000');
			state.powerups += 1;
			state.events.push({ type: 'power' });
			continue;
		}
		if (item.kind === 'flower') {
			if (mario.form === 'small') grow(state);
			mario.form = 'fire';
			state.powerups += 1;
			addScore(state, 1000, item.x, item.y, '1000');
			state.events.push({ type: 'power' });
			continue;
		}
		if (item.kind === 'star') {
			mario.star = 640;
			state.powerups += 1;
			addScore(state, 1000, item.x, item.y, '1000');
			state.events.push({ type: 'power' });
			continue;
		}
		if (item.kind === 'oneup') {
			state.lives += 1;
			state.powerups += 1;
			state.events.push({ type: 'oneup', x: item.x, y: item.y });
			addScore(state, 0, item.x, item.y, '1UP');
		}
	}
}

function grow(state) {
	const mario = state.mario;
	mario.form = 'big';
	mario.y -= 16;
	mario.h = 32;
	if (mario.y < 0) mario.y = 0;
}

function updateEnemies(state) {
	for (const enemy of state.enemies) {
		if (!enemy.alive) continue;
		if (enemy.kind === 'piranha') {
			updatePiranha(state, enemy);
			continue;
		}
		if (enemy.kind === 'bowser') {
			updateBowser(state, enemy);
			continue;
		}
		if (enemy.kind === 'paratroopa' && enemy.winged !== false) {
			updateParatroopa(state, enemy);
			continue;
		}
		if (enemy.kind === 'cheep' || enemy.kind === 'blooper') {
			updateSwimmer(state, enemy);
			continue;
		}
		if (
			enemy.kind === 'jumpcheep' ||
			enemy.kind === 'bullet' ||
			enemy.kind === 'spinyfly'
		) {
			updateFlyer(state, enemy);
			continue;
		}
		if (enemy.kind === 'hammerbro') {
			updateHammerBro(state, enemy);
			continue;
		}
		if (enemy.squish > 0) {
			enemy.squish -= 1;
			if (enemy.squish <= 0) enemy.alive = false;
			continue;
		}
		updateWalker(state, enemy);
	}
}

function updateWalker(state, enemy) {
	if (enemy.red) {
		const ahead = enemy.x + (enemy.dir > 0 ? enemy.w + 2 : -2);
		const tx = Math.floor(ahead / TILE);
		const foot = Math.floor((enemy.y + enemy.h + 2) / TILE);
		if (!solidAt(state, tx, foot) && !solidAt(state, tx, foot + 1)) {
			enemy.dir *= -1;
		}
	}
	enemy.vx = enemy.dir * (enemy.speed || 0.52);
	const before = enemy.vx;
	moveX(enemy, state);
	if (enemy.vx === 0 && before !== 0) enemy.dir *= -1;
	enemy.vy = Math.min(4.2, enemy.vy + 0.28);
	moveY(enemy, state, false);
	if (enemy.y > LEVEL_H * TILE + 24) enemy.alive = false;
}

function updateParatroopa(state, enemy) {
	enemy.phase += 0.04;
	if (enemy.red) {
		enemy.y = enemy.baseY + Math.sin(enemy.phase) * 28;
		enemy.vx = 0;
		return;
	}
	enemy.timer -= 1;
	if (enemy.onGround && enemy.timer <= 0) {
		enemy.vy = -4.2;
		enemy.timer = 50;
		enemy.onGround = false;
	}
	enemy.vx = enemy.dir * 0.45;
	moveX(enemy, state);
	enemy.vy = Math.min(3.5, enemy.vy + 0.18);
	moveY(enemy, state, false);
}

function updateSwimmer(state, enemy) {
	if (enemy.kind === 'blooper') {
		enemy.timer -= 1;
		if (enemy.timer <= 0) {
			enemy.timer = 42;
			enemy.vx = Math.sign(state.mario.x - enemy.x) * 0.65 || -0.65;
			enemy.vy = state.mario.y > enemy.y ? 0.35 : -0.85;
		}
		enemy.vy += 0.02;
		enemy.x += enemy.vx;
		enemy.y += enemy.vy;
	} else {
		enemy.phase += 0.06;
		enemy.x += enemy.dir * 0.55;
		enemy.y += Math.sin(enemy.phase) * 0.45;
		if (enemy.x < state.camX - 30) enemy.x = state.camX + VIEW_W + 16;
	}
	enemy.y = clamp(enemy.y, 20, GROUND_Y * TILE - enemy.h - 4);
}

function updateFlyer(state, enemy) {
	if (enemy.kind === 'spinyfly') {
		enemy.vy = Math.min(4, enemy.vy + 0.22);
		moveX(enemy, state);
		moveY(enemy, state, false);
		if (enemy.onGround) {
			enemy.kind = 'spiny';
			enemy.dir = state.mario.x < enemy.x ? -1 : 1;
			enemy.speed = 0.5;
		}
		return;
	}
	enemy.x += enemy.vx;
	enemy.y += enemy.vy;
	if (enemy.kind === 'jumpcheep') {
		enemy.vy = Math.min(4, enemy.vy + 0.12);
		if (enemy.y > LEVEL_H * TILE + 10) enemy.alive = false;
	}
	if (
		enemy.kind === 'bullet' &&
		(enemy.x < state.camX - 40 || enemy.x > state.camX + VIEW_W + 80)
	) {
		enemy.alive = false;
	}
}

function updateHammerBro(state, enemy) {
	enemy.timer -= 1;
	enemy.jumpTimer = (enemy.jumpTimer ?? 90) - 1;
	if (enemy.x < enemy.minX) enemy.dir = 1;
	if (enemy.x > enemy.maxX) enemy.dir = -1;
	enemy.vx = enemy.dir * 0.4;
	if (enemy.onGround && enemy.jumpTimer <= 0) {
		enemy.vy = -4.6;
		enemy.jumpTimer = 110;
		enemy.onGround = false;
	}
	moveX(enemy, state);
	enemy.vy = Math.min(4, enemy.vy + 0.28);
	moveY(enemy, state, false);
	if (enemy.timer <= 0) {
		enemy.timer = 95;
		state.hazards.push({
			kind: 'hammer',
			x: enemy.x,
			y: enemy.y,
			w: 12,
			h: 12,
			vx: enemy.dir * 1.1,
			vy: -3.4,
			alive: true,
		});
	}
}

function updatePiranha(state, enemy) {
	const center = enemy.x + 8;
	const close = Math.abs(state.mario.x + state.mario.w / 2 - center) < 28;
	if (!(close && enemy.phase < 8)) enemy.phase = (enemy.phase + 1) % 190;
	const phase = enemy.phase;
	let extend = 0;
	if (phase >= 70 && phase < 90) extend = (phase - 70) / 20;
	else if (phase >= 90 && phase < 150) extend = 1;
	else if (phase >= 150 && phase < 170) extend = 1 - (phase - 150) / 20;
	enemy.y = enemy.hideY - extend * (enemy.h + 2);
	enemy.exposed = extend > 0.45;
}

function updateBowser(state, enemy) {
	if (enemy.falling) {
		enemy.vy = Math.min(4.5, enemy.vy + 0.28);
		enemy.y += enemy.vy;
		if (enemy.y > LEVEL_H * TILE) enemy.alive = false;
		return;
	}
	if (enemy.x < enemy.minX) enemy.dir = 1;
	if (enemy.x + enemy.w > enemy.maxX) enemy.dir = -1;
	enemy.vx = enemy.dir * enemy.speed;
	enemy.x += enemy.vx;
	enemy.jumpTimer -= 1;
	if (enemy.onGround && enemy.jumpTimer <= 0) {
		enemy.vy = -6.4;
		enemy.onGround = false;
		enemy.jumpTimer = 100;
	}
	enemy.vy = Math.min(4.2, enemy.vy + 0.24);
	moveY(enemy, state, false);
	enemy.timer -= 1;
	if (enemy.timer <= 0) {
		enemy.timer = 78;
		state.hazards.push({
			kind: 'hammer',
			x: enemy.x + 4,
			y: enemy.y + 8,
			w: 12,
			h: 12,
			vx: -1.35,
			vy: -3.1,
			alive: true,
		});
	}
}

function updateHazards(state) {
	const next = [];
	for (const hazard of state.hazards) {
		if (hazard.kind === 'firebar') {
			hazard.angle += hazard.speed;
			next.push(hazard);
			continue;
		}
		if (hazard.kind === 'podoboo') {
			hazard.timer -= 1;
			if (hazard.timer <= 0 && hazard.y >= hazard.origin - 2) {
				hazard.vy = -6.2;
				hazard.timer = 130;
			}
			hazard.vy = Math.min(5, hazard.vy + 0.16);
			hazard.y += hazard.vy;
			if (hazard.y > hazard.origin) {
				hazard.y = hazard.origin;
				hazard.vy = 0;
			}
			next.push(hazard);
			continue;
		}
		if (hazard.kind === 'hammer') {
			hazard.vy = Math.min(4, hazard.vy + 0.18);
			hazard.x += hazard.vx;
			hazard.y += hazard.vy;
			if (hazard.y < LEVEL_H * TILE + 10) next.push(hazard);
			continue;
		}
		if (hazard.kind === 'cannon') {
			hazard.timer -= 1;
			const dx = Math.abs(state.mario.x - hazard.x);
			if (hazard.timer <= 0 && dx > 48 && dx < 220) {
				hazard.timer = 130;
				const dir = state.mario.x < hazard.x ? -1 : 1;
				state.enemies.push({
					kind: 'bullet',
					x: hazard.x,
					y: hazard.y + 2,
					w: 16,
					h: 12,
					vx: dir * 1.7,
					vy: 0,
					alive: true,
					dir,
				});
			}
			next.push(hazard);
			continue;
		}
		if (hazard.kind === 'lakitu') {
			updateLakitu(state, hazard);
			if (hazard.alive) next.push(hazard);
			continue;
		}
		if (hazard.kind === 'cheepspawner') {
			hazard.timer -= 1;
			const flying = state.enemies.filter(
				(enemy) => enemy.kind === 'jumpcheep',
			).length;
			if (hazard.timer <= 0 && flying < 3) {
				hazard.timer = hazard.every;
				state.enemies.push({
					kind: 'jumpcheep',
					x: state.mario.x + 90 + (state.tick % 40),
					y: LEVEL_H * TILE - 8,
					w: 16,
					h: 14,
					vx: -0.85,
					vy: -5.6,
					alive: true,
				});
			}
			next.push(hazard);
			continue;
		}
		next.push(hazard);
	}
	state.hazards = next;
}

function updateLakitu(state, hazard) {
	if (hazard.respawn > 0) {
		hazard.respawn -= 1;
		hazard.alive = hazard.respawn <= 0;
		return;
	}
	const goal = state.mario.x - 10;
	hazard.x += Math.sign(goal - hazard.x) * 0.85;
	hazard.y = 26;
	hazard.timer -= 1;
	const spinies = state.enemies.filter(
		(enemy) => enemy.kind === 'spiny' || enemy.kind === 'spinyfly',
	).length;
	if (hazard.timer <= 0 && spinies < 3) {
		hazard.timer = 150;
		state.enemies.push({
			kind: 'spinyfly',
			x: hazard.x,
			y: hazard.y + 10,
			w: 16,
			h: 16,
			vx: 0,
			vy: 0.4,
			alive: true,
			dir: -1,
			speed: 0.5,
		});
	}
}

function updateLifts(state) {
	const mario = state.mario;
	for (const lift of state.lifts) {
		const prevX = lift.x;
		const prevY = lift.y;
		lift.phase += lift.speed;
		const offset = Math.sin(lift.phase) * lift.range;
		if (lift.axis === 'x') {
			lift.x = lift.originX + offset;
		} else {
			lift.y = lift.originY + offset;
		}
		const dx = lift.x - prevX;
		const dy = lift.y - prevY;
		const feet = mario.y + mario.h;
		const riding =
			mario.vy >= 0 &&
			Math.abs(feet - prevY) < 2.5 &&
			mario.x + mario.w > prevX &&
			mario.x < prevX + lift.w;
		if (riding && state.mode === 'play') {
			mario.x += dx;
			mario.y += dy;
			mario.onGround = true;
		}
	}
}

function updateShots(state) {
	for (const shot of state.shots) {
		shot.vy = Math.min(3.4, shot.vy + 0.2);
		moveX(shot, state);
		if (shot.vx === 0) {
			shot.alive = false;
			continue;
		}
		moveY(shot, state, false);
		if (shot.onGround) {
			shot.vy = -2.5;
			shot.bounces += 1;
			if (shot.bounces > 4) shot.alive = false;
		}
		for (const enemy of state.enemies) {
			if (!enemy.alive || !overlap(shot, enemy)) continue;
			if (enemy.kind === 'buzzy') {
				shot.alive = false;
				break;
			}
			if (enemy.kind === 'bowser') {
				enemy.hits = (enemy.hits ?? 0) + 1;
				shot.alive = false;
				if (enemy.hits >= 5) removeEnemy(state, enemy, false);
				break;
			}
			removeEnemy(state, enemy, false);
			shot.alive = false;
			break;
		}
	}
}

function collideEnemies(state) {
	const mario = state.mario;
	if (state.mode !== 'play' || mario.dead) return;
	const prevBottom = mario.y - mario.vy + mario.h;
	for (const enemy of state.enemies) {
		if (!enemy.alive) continue;
		if (enemy.kind === 'piranha' && !enemy.exposed) continue;
		if (enemy.squish > 0) continue;
		if (!overlap(mario, enemy)) continue;

		const falling = mario.vy > 0 && prevBottom <= enemy.y + 8;
		if (falling && canStomp(enemy)) {
			stomp(state, enemy);
			continue;
		}
		if (falling && (enemy.kind === 'spiny' || enemy.kind === 'piranha')) {
			hurt(state);
			continue;
		}
		if (mario.star > 0) {
			if (enemy.kind === 'bowser') {
				enemy.hits = (enemy.hits ?? 0) + 1;
				if (enemy.hits >= 5) removeEnemy(state, enemy, false);
			} else {
				removeEnemy(state, enemy, false);
			}
			continue;
		}
		if (enemy.kind === 'shell' && Math.abs(enemy.vx) < 0.2) {
			kickShell(state, enemy);
			continue;
		}
		hurt(state);
	}

	for (const shell of state.enemies) {
		if (shell.kind !== 'shell' || !shell.alive || Math.abs(shell.vx) < 0.4)
			continue;
		for (const enemy of state.enemies) {
			if (enemy === shell || !enemy.alive) continue;
			if (!overlap(shell, enemy)) continue;
			if (enemy.kind === 'bowser') {
				enemy.hits = (enemy.hits ?? 0) + 1;
				if (enemy.hits >= 5) removeEnemy(state, enemy, true);
			} else if (enemy.kind !== 'shell') {
				removeEnemy(state, enemy, true);
			}
		}
	}
}

function canStomp(enemy) {
	return (
		enemy.kind === 'goomba' ||
		enemy.kind === 'koopa' ||
		enemy.kind === 'paratroopa' ||
		enemy.kind === 'buzzy' ||
		enemy.kind === 'shell' ||
		enemy.kind === 'bullet' ||
		enemy.kind === 'jumpcheep' ||
		enemy.kind === 'hammerbro' ||
		enemy.kind === 'lakitu'
	);
}

function stomp(state, enemy) {
	const mario = state.mario;
	mario.vy = STOMP;
	mario.onGround = false;
	mario.rising = false;
	mario.combo += 1;
	const points = CHAIN[Math.min(CHAIN.length - 1, mario.combo - 1)];
	if (mario.combo >= 8) state.lives += 1;
	addScore(state, points, enemy.x, enemy.y, String(points));
	state.events.push({ type: 'stomp' });

	if (
		enemy.kind === 'goomba' ||
		enemy.kind === 'bullet' ||
		enemy.kind === 'jumpcheep' ||
		enemy.kind === 'hammerbro'
	) {
		enemy.squish = enemy.kind === 'goomba' ? 14 : 0;
		enemy.vx = 0;
		enemy.vy = 0;
		if (enemy.kind !== 'goomba') enemy.alive = false;
		state.kills += 1;
		return;
	}
	if (enemy.kind === 'paratroopa') {
		enemy.kind = 'koopa';
		enemy.winged = false;
		enemy.h = 24;
		enemy.speed = 0.62;
		return;
	}
	if (enemy.kind === 'koopa' || enemy.kind === 'buzzy') {
		becomeShell(enemy);
		return;
	}
	if (enemy.kind === 'shell') {
		if (Math.abs(enemy.vx) > 0.3) {
			enemy.vx = 0;
			enemy.speed = 0;
		} else kickShell(state, enemy);
		return;
	}
	if (enemy.kind === 'lakitu') {
		enemy.alive = false;
		state.kills += 1;
		const lakitu = state.hazards.find((hazard) => hazard.kind === 'lakitu');
		if (lakitu) {
			lakitu.respawn = 220;
			lakitu.alive = false;
		}
	}
}

function becomeShell(enemy) {
	enemy.kind = 'shell';
	enemy.y += enemy.h - 14;
	enemy.h = 14;
	enemy.vx = 0;
	enemy.speed = 0;
	enemy.red = false;
}

function kickShell(state, shell) {
	const dir =
		state.mario.x + state.mario.w / 2 < shell.x + shell.w / 2 ? 1 : -1;
	shell.vx = dir * 3.15;
	shell.dir = dir;
	shell.speed = 3.15;
	state.events.push({ type: 'kick' });
}

function removeEnemy(state, enemy, chain) {
	enemy.alive = false;
	state.kills += 1;
	if (chain) {
		state.mario.combo += 1;
		const points = CHAIN[Math.min(CHAIN.length - 1, state.mario.combo - 1)];
		addScore(state, points, enemy.x, enemy.y, String(points));
	} else {
		addScore(state, 100, enemy.x, enemy.y, '100');
	}
	state.events.push({ type: 'stomp' });
}

function collideHazards(state) {
	const mario = state.mario;
	if (state.mode !== 'play' || mario.dead) return;
	for (
		let ty = Math.floor(mario.y / TILE);
		ty <= Math.floor((mario.y + mario.h) / TILE);
		ty += 1
	) {
		for (
			let tx = Math.floor(mario.x / TILE);
			tx <= Math.floor((mario.x + mario.w) / TILE);
			tx += 1
		) {
			if (tileAt(state, tx, ty) === Tile.Lava) {
				defeat(state, 'lava');
				return;
			}
		}
	}
	for (const hazard of state.hazards) {
		if (hazard.kind === 'firebar') {
			for (let i = 0; i < hazard.len; i += 1) {
				const dist = i * 11;
				const x = hazard.x + Math.cos(hazard.angle) * dist;
				const y = hazard.y + Math.sin(hazard.angle) * dist;
				if (circleHit(mario, x, y, 5)) {
					if (mario.star <= 0) hurt(state);
					return;
				}
			}
		} else if (hazard.kind === 'podoboo') {
			if (hazard.vy !== 0 && overlap(mario, hazard)) {
				if (mario.star <= 0) hurt(state);
				return;
			}
		} else if (hazard.kind === 'hammer') {
			if (overlap(mario, hazard)) {
				if (mario.star > 0) hazard.alive = false;
				else hurt(state);
			}
		}
	}
	state.hazards = state.hazards.filter((hazard) => hazard.alive !== false);
}

function checkSensors(state, input) {
	if (state.mode !== 'play') return;
	const mario = state.mario;
	const exit = state.exit;
	if (exit && !state.exitDone && overlap(mario, exit)) {
		if (exit.type === 'flag') {
			grabFlag(state);
			return;
		}
		if (exit.type === 'axe') {
			state.exitDone = true;
			state.mode = 'collapse';
			state.modeTime = 0;
			state.bridges = collectBridges(state);
			state.events.push({ type: 'axe' });
			for (const enemy of state.enemies) {
				if (enemy.kind === 'bowser') enemy.falling = true;
			}
			return;
		}
		if (exit.type === 'pipe' && exit.mode === 'overlap') {
			finishLevel(state);
			return;
		}
	}
	if (input.down && mario.onGround) {
		if (
			exit?.type === 'pipe' &&
			exit.mode === 'down' &&
			overlap(mario, exitPad(exit))
		) {
			finishLevel(state);
			return;
		}
		for (const warp of state.warps) {
			if (overlap(mario, exitPad(warp))) {
				loadLevel(state, warp.to, {
					score: state.score,
					coinTotal: state.coinTotal,
					lives: state.lives,
					form: mario.form,
				});
				state.events.push({ type: 'warp' });
				return;
			}
		}
	}
}

function exitPad(sensor) {
	return {
		x: sensor.x - 2,
		y: sensor.y - 6,
		w: sensor.w + 4,
		h: sensor.h + 10,
	};
}

function grabFlag(state) {
	const mario = state.mario;
	const tilesUp = (GROUND_Y * TILE - (mario.y + mario.h)) / TILE;
	let points = 100;
	if (tilesUp > 8) points = 5000;
	else if (tilesUp > 6) points = 2000;
	else if (tilesUp > 4) points = 800;
	else if (tilesUp > 2) points = 400;
	else if (tilesUp > 1) points = 200;
	addScore(state, points, mario.x, mario.y, String(points));
	mario.x = state.exit.x - mario.w + 2;
	mario.vx = 0;
	mario.vy = 0;
	state.mode = 'pole';
	state.events.push({ type: 'flag' });
}

function finishLevel(state) {
	state.exitDone = true;
	state.mode = 'tally';
	state.events.push({ type: 'flag' });
}

function collectBridges(state) {
	const list = [];
	for (let ty = 0; ty < state.h; ty += 1) {
		for (let tx = 0; tx < state.w; tx += 1) {
			if (state.tiles[idx(tx, ty, state.w)] === Tile.Bridge)
				list.push({ tx, ty });
		}
	}
	list.sort((a, b) => b.tx - a.tx);
	return list;
}

function updateCollapse(state) {
	state.modeTime += 1;
	if (state.modeTime % 3 === 0 && state.bridges.length > 0) {
		const tile = state.bridges.pop();
		setTile(state, tile.tx, tile.ty, Tile.Empty);
	}
	for (const enemy of state.enemies) {
		if (enemy.kind === 'bowser' && enemy.falling) {
			enemy.vy = Math.min(4.5, enemy.vy + 0.28);
			enemy.y += enemy.vy;
		}
	}
	const bowserGone = state.enemies.every(
		(enemy) => enemy.kind !== 'bowser' || enemy.y > LEVEL_H * TILE,
	);
	if ((state.bridges.length === 0 && bowserGone) || state.modeTime > 160) {
		state.mario.y = GROUND_Y * TILE - state.mario.h;
		state.mode = 'walkoff';
	}
}

function updateCamera(state) {
	const maxCam = Math.max(0, state.w * TILE - VIEW_W);
	const desired = state.mario.x - VIEW_W * 0.38;
	if (desired > state.camX) state.camX = Math.min(maxCam, desired);
	if (state.mode === 'play' && state.mario.x < state.camX + 1) {
		state.mario.x = state.camX + 1;
		if (state.mario.vx < 0) state.mario.vx = 0;
	}
}

export function defeat(state, cause) {
	if (state.mode !== 'play') return;
	if (state.mario.dead) return;
	state.mario.dead = true;
	state.mario.vy = -4.6;
	state.mario.vx = 0;
	state.mode = 'dead';
	state.modeTime = 0;
	state.deathCause = cause;
	state.lives -= 1;
	state.events.push({ type: 'death' });
}

function hurt(state) {
	const mario = state.mario;
	if (mario.star > 0 || mario.invuln > 0 || mario.dead) return;
	if (mario.form === 'small') {
		defeat(state, 'enemy');
		return;
	}
	mario.form = 'small';
	mario.y += mario.h - 16;
	mario.h = 16;
	mario.invuln = 120;
	state.events.push({ type: 'hurt' });
}

function addCoin(state, x, y) {
	state.coinTotal += 1;
	state.score += 200;
	if (state.coinTotal % 100 === 0) {
		state.lives += 1;
		state.events.push({ type: 'oneup', x, y });
	}
	state.events.push({ type: 'coin', x, y, text: '200' });
}

function addScore(state, points, x, y, text) {
	state.score += points;
	if (text) state.events.push({ type: 'popup', x, y, text });
}

function overlap(a, b) {
	return (
		a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
	);
}

function circleHit(body, x, y, r) {
	const cx = clamp(x, body.x, body.x + body.w);
	const cy = clamp(y, body.y, body.y + body.h);
	const dx = cx - x;
	const dy = cy - y;
	return dx * dx + dy * dy <= r * r;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export { LEVELS, TILE, VIEW_TILES_X, VIEW_TILES_Y, GROUND_Y };
