import { createGame, step, LEVELS } from '../docs/mario/game.js';
import { createDriver, drive } from '../docs/mario/ai.js';
import { IDLE } from '../docs/mario/game.js';

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
console.log('physics ok, levels', LEVELS.length);

const focus = ['1-1', '1-2', '1-3', '1-4', '2-2'];
for (const id of focus) {
	const index = LEVELS.findIndex((level) => level.id === id);
	const started = Date.now();
	const result = simulate(index, id === '1-1' ? 9000 : 7000);
	const ms = Date.now() - started;
	const coinPct = Math.round((result.coins / result.budget) * 100);
	console.log(
		`${result.id} cleared=${result.cleared} coins=${result.coins}/${result.budget} (${coinPct}%) kills=${result.kills}/${result.enemies} power=${result.powerups}/${result.powerBudget} deaths=${result.deaths} cause=${result.cause} x=${result.x} mode=${result.mode} ${ms}ms`,
	);
}
