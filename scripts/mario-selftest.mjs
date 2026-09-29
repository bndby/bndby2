import { createGame, step, LEVELS } from '../docs/mario/game.js';
import { createDriver, drive } from '../docs/mario/ai.js';
import { IDLE } from '../docs/mario/game.js';
import { TILE, Tile, idx } from '../docs/mario/tiles.js';

function assert(cond, message) {
	if (!cond) throw new Error(message);
}

function physics() {
	const state = createGame({ skipCard: true });
	const y0 = state.mario.y;
	for (let i = 0; i < 40; i += 1) step(state, IDLE);
	assert(
		Math.abs(state.mario.y - y0) < 1.2,
		`стоит на земле: ${state.mario.y} vs ${y0}`,
	);
	assert(state.mode === 'play', 'режим play');

	for (let i = 0; i < 24; i += 1) {
		step(state, { dir: 1, run: true, jump: 'none', down: false });
	}
	const before = state.mario.y;
	for (let i = 0; i < 18; i += 1) {
		step(state, { dir: 1, run: true, jump: 'full', down: false });
	}
	assert(
		state.mario.y < before - 40,
		`прыжок недостаточно высокий: ${before - state.mario.y}`,
	);
}

function simulate(index, maxFrames) {
	const state = createGame({ levelIndex: index, skipCard: true });
	const startCoins = state.coinTotal;
	const driver = createDriver();
	let deaths = 0;
	let lastCause = '';
	for (let frame = 0; frame < maxFrames; frame += 1) {
		const action = drive(state, driver);
		const before = state.mode;
		step(state, state.mode === 'play' ? action : IDLE);
		if (state.mode === 'dead' && before !== 'dead') {
			deaths += 1;
			lastCause = state.deathCause;
		}
		const finishing =
			state.mode === 'victory' ||
			state.mode === 'pole' ||
			state.mode === 'tally' ||
			state.mode === 'walkoff' ||
			state.mode === 'clear' ||
			state.mode === 'collapse';
		if (finishing && state.levelIndex === index) {
			return report(state, index, startCoins, deaths, lastCause, true);
		}
		if (
			state.mode === 'gameover' ||
			(state.levelIndex !== index && state.mode === 'card')
		) {
			return report(state, index, startCoins, deaths, lastCause, false);
		}
	}
	return report(state, index, startCoins, deaths, lastCause, false);
}

function report(state, index, startCoins, deaths, cause, cleared) {
	const level = LEVELS[index];
	const coins = state.coinTotal - startCoins;
	return {
		id: level.id,
		cleared,
		coins,
		budget: level.coinBudget,
		kills: state.kills,
		enemies: level.enemyBudget,
		powerups: state.powerups,
		powerBudget: level.powerups,
		deaths,
		cause,
		x: Math.round(state.mario.x),
		mode: state.mode,
	};
}

const ids = new Set();
assert(LEVELS.length === 32, `уровней ${LEVELS.length}, ожидалось 32`);
for (const level of LEVELS) {
	assert(!ids.has(level.id), `дубль ${level.id}`);
	ids.add(level.id);
	assert(level.exit, `${level.id} без выхода`);
	assert(level.coinBudget > 0, `${level.id} без монет`);
	assert(level.powerups > 0, `${level.id} без гриба/звезды`);
	assert(level.w > 24, `${level.id} слишком короткий`);
}

physics();
powerChain();
console.log('physics ok, levels', LEVELS.length);

function giveMushroom(state) {
	const mario = state.mario;
	state.items.push({
		kind: 'mushroom',
		x: mario.x,
		y: mario.y + mario.h - 16,
		w: 16,
		h: 16,
		vx: 0,
		vy: 0,
		emerge: 0,
		dir: 1,
		alive: true,
	});
}

function powerChain() {
	const state = createGame({ skipCard: true });
	const lives = state.lives;
	assert(state.mario.form === 'small', 'старт маленький');
	giveMushroom(state);
	step(state, IDLE);
	assert(
		state.mario.form === 'big',
		`первый гриб растит, сейчас ${state.mario.form}`,
	);
	assert(state.mario.h === 32, `высокий рост ${state.mario.h}`);
	assert(state.lives === lives, 'жизнь после гриба');
	step(state, { dir: 1, run: true, jump: 'none', down: false });
	assert(state.shots.length === 0, 'большой ещё не стреляет');

	giveMushroom(state);
	step(state, IDLE);
	assert(
		state.mario.form === 'fire',
		`второй гриб даёт огонь, сейчас ${state.mario.form}`,
	);
	assert(state.mario.h === 32, 'огонь остаётся высоким');
	const beforeShots = state.shots.length;
	step(state, { dir: 1, run: true, jump: 'none', down: false });
	assert(state.shots.length > beforeShots, 'огненный стреляет');

	state.mario.vy = 0;
	state.mario.vx = 0;
	state.mario.onGround = true;
	state.shots = [];
	state.enemies.push({
		kind: 'goomba',
		x: state.mario.x + 2,
		y: state.mario.y + state.mario.h - 16,
		w: 16,
		h: 16,
		vx: 0,
		vy: 0,
		alive: true,
		dir: 1,
		speed: 0.2,
	});
	step(state, IDLE);
	assert(
		state.mario.form === 'small',
		`первый удар уменьшает, сейчас ${state.mario.form}`,
	);
	assert(state.mario.h === 16, `после удара рост ${state.mario.h}`);
	assert(state.lives === lives, 'первый удар не забирает жизнь');
	assert(state.mode === 'play', `после удара режим ${state.mode}`);

	state.mario.invuln = 1;
	const enemy = state.enemies.find(
		(actor) => actor.alive && actor.kind === 'goomba',
	);
	assert(enemy, 'гумба на месте');
	enemy.x = state.mario.x;
	enemy.y = state.mario.y;
	step(state, IDLE);
	assert(
		state.lives === lives - 1,
		`второй удар забирает жизнь: ${state.lives}`,
	);
	assert(
		state.mario.dead || state.mode === 'dead',
		`второй удар смертелен: ${state.mode}`,
	);
}

function placeBeforePit(state, tileX) {
	const mario = state.mario;
	mario.x = tileX * 16 - mario.w - 1;
	mario.y = 13 * 16 - mario.h;
	mario.vx = 0;
	mario.vy = 0;
	mario.onGround = true;
	mario.dead = false;
	state.mode = 'play';
	state.camX = Math.max(0, mario.x - 80);
}

function pitAndStairs() {
	const index = LEVELS.findIndex((level) => level.id === '1-2');
	const dropped = createGame({ levelIndex: index, skipCard: true });
	placeBeforePit(dropped, 48);
	let cause = '';
	for (let i = 0; i < 80; i += 1) {
		step(dropped, { dir: 1, run: true, jump: 'none', down: false });
		if (dropped.mario.dead || dropped.mode === 'dead') {
			cause = dropped.deathCause;
			break;
		}
	}
	assert(
		cause === 'lava' || cause === 'pit',
		`узкая пропасть убивает, сейчас ${cause || dropped.mode} y=${dropped.mario.y.toFixed(1)}`,
	);

	const wide = createGame({ levelIndex: index, skipCard: true });
	placeBeforePit(wide, 96);
	cause = '';
	for (let i = 0; i < 80; i += 1) {
		step(wide, { dir: 1, run: true, jump: 'none', down: false });
		if (wide.mario.dead || wide.mode === 'dead') {
			cause = wide.deathCause;
			break;
		}
	}
	assert(
		cause === 'lava' || cause === 'pit',
		`широкая пропасть убивает, сейчас ${cause || wide.mode}`,
	);

	const jumped = createGame({ levelIndex: index, skipCard: true });
	placeBeforePit(jumped, 48);
	for (let i = 0; i < 70; i += 1) {
		step(jumped, { dir: 1, run: true, jump: 'full', down: false });
	}
	assert(
		!jumped.mario.dead && jumped.mode === 'play',
		`прыжок через пропасть выживает, сейчас ${jumped.deathCause || jumped.mode}`,
	);
	assert(
		jumped.mario.x > 50 * 16,
		`прыжок переносит за пропасть, x=${jumped.mario.x.toFixed(1)}`,
	);

	const lip = createGame({ levelIndex: index, skipCard: true });
	placeBeforePit(lip, 48);
	for (let i = 0; i < 8; i += 1) step(lip, IDLE);
	assert(!lip.mario.dead, 'стояние у края пропасти безопасно');

	const stairs = createGame({ skipCard: true });
	stairs.mario.x = 72 * 16 - stairs.mario.w - 2;
	stairs.mario.y = 13 * 16 - stairs.mario.h;
	stairs.mario.onGround = true;
	stairs.mario.vx = 0;
	stairs.mario.vy = 0;
	const ground = stairs.mario.y;
	for (let i = 0; i < 40; i += 1) {
		step(stairs, { dir: 1, run: true, jump: 'none', down: false });
	}
	assert(
		stairs.mario.y < ground - 10,
		`ступенька поднимает, y=${stairs.mario.y.toFixed(1)} vs ${ground}`,
	);
	assert(!stairs.mario.dead, 'ступенька не убивает');
}

pitAndStairs();
console.log('pits ok');

function hitOverhead(tileX, tile, form) {
	const state = createGame({ skipCard: true });
	state.tiles[idx(tileX, 9, state.w)] = tile;
	state.mario.form = form;
	state.mario.h = form === 'small' ? 16 : 32;
	state.mario.x = tileX * TILE;
	state.mario.y = 10 * TILE;
	state.mario.vy = -4;
	state.mario.vx = 0;
	state.mario.onGround = false;
	step(state, { dir: 0, run: false, jump: 'full', down: false });
	return state;
}

function blockFx() {
	const coin = hitOverhead(16, Tile.Question, 'small');
	assert(
		coin.fx.some((fx) => fx.kind === 'coin'),
		'из вопросика вылетает монетка',
	);
	assert(
		coin.tiles[idx(16, 9, coin.w)] === Tile.Used,
		'вопросик становится пустым',
	);
	const brick = hitOverhead(20, Tile.Brick, 'big');
	const shards = brick.fx.filter((fx) => fx.kind === 'shard');
	assert(shards.length >= 4, `осколков кирпича ${shards.length}`);
	assert(brick.tiles[idx(20, 9, brick.w)] === Tile.Empty, 'кирпич исчезает');
}

blockFx();
console.log('blocks ok');

function escapeBricks() {
	const index = LEVELS.findIndex((level) => level.id === '2-1');
	const state = createGame({ levelIndex: index, skipCard: true });
	state.mario.form = 'small';
	state.mario.h = 16;
	state.mario.x = 884;
	state.mario.y = 160;
	state.mario.vx = 0;
	state.mario.vy = 0;
	state.mario.onGround = true;
	state.camX = 750;
	state.camMax = 750;
	for (const enemy of state.enemies) {
		if (enemy.x > 640 && enemy.x < 960) enemy.alive = false;
	}
	const driver = createDriver();
	let mounted = false;
	let minX = state.mario.x;
	for (let frame = 0; frame < 700; frame += 1) {
		const action = drive(state, driver);
		step(state, state.mode === 'play' ? action : IDLE);
		if (state.mario.x < minX) minX = state.mario.x;
		const feet = state.mario.y + state.mario.h;
		if (
			state.mario.onGround &&
			feet <= 9 * TILE + 1 &&
			state.mario.x >= 49 * TILE
		) {
			mounted = true;
			break;
		}
		if (state.mode !== 'play') break;
	}
	assert(
		mounted,
		`2-1 не забрался на кирпичи x=${Math.round(state.mario.x)} y=${Math.round(state.mario.y)} mode=${state.mode}`,
	);
	assert(
		minX > 38 * TILE,
		`2-1 отступил слишком далеко: ${Math.round(minX)}`,
	);
}

escapeBricks();
console.log('escape ok');

function crossGap() {
	const index = LEVELS.findIndex((level) => level.id === '1-3');
	const state = createGame({ levelIndex: index, skipCard: true });
	for (const enemy of state.enemies) {
		if (enemy.x > 400 && enemy.x < 900) enemy.alive = false;
	}
	state.mario.form = 'big';
	state.mario.h = 32;
	state.mario.x = 552;
	state.mario.y = 160;
	state.mario.vx = 0;
	state.mario.vy = 0;
	state.mario.onGround = true;
	state.camX = 418;
	state.camMax = 418;
	const driver = createDriver();
	for (let frame = 0; frame < 500; frame += 1) {
		const action = drive(state, driver);
		step(state, state.mode === 'play' ? action : IDLE);
		if (state.mario.x > 700 && state.mode === 'play') return;
	}
	assert(
		false,
		`1-3 не перепрыгнул разрыв x=${Math.round(state.mario.x)} y=${Math.round(state.mario.y)} mode=${state.mode}`,
	);
}

crossGap();
console.log('gap ok');

const focus = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2'];
for (const id of focus) {
	const index = LEVELS.findIndex((level) => level.id === id);
	const started = Date.now();
	const result = simulate(index, id === '1-1' || id === '2-1' ? 9000 : 7000);
	const ms = Date.now() - started;
	const coinPct = Math.round((result.coins / result.budget) * 100);
	console.log(
		`${result.id} cleared=${result.cleared} coins=${result.coins}/${result.budget} (${coinPct}%) kills=${result.kills}/${result.enemies} power=${result.powerups}/${result.powerBudget} deaths=${result.deaths} cause=${result.cause} x=${result.x} mode=${result.mode} ${ms}ms`,
	);
	if (id === '1-1' || id === '1-2' || id === '1-4' || id === '2-2') {
		assert(
			result.cleared,
			`${id} не пройден: ${result.mode} ${result.cause}`,
		);
	}
	if (id === '2-1' && !result.cleared) {
		const inTunnel = result.x > 49 * TILE && result.x < 58 * TILE;
		assert(!inTunnel, `2-1 застрял под кирпичами x=${result.x}`);
	}
}
