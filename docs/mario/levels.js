import { GROUND_Y, LEVEL_H, TILE, Tile, idx, isSolid } from './tiles.js';

const CHAR = {
	'?': Tile.Question,
	M: Tile.Mushroom,
	B: Tile.Brick,
	S: Tile.Star,
	N: Tile.MultiCoin,
	H: Tile.HiddenCoin,
	U: Tile.HiddenOneUp,
	'#': Tile.Solid,
	'=': Tile.Platform,
};

function inPit(pits, x) {
	for (let i = 0; i < pits.length; i += 1) {
		if (x >= pits[i][0] && x < pits[i][1]) return true;
	}
	return false;
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

function actorSize(kind) {
	switch (kind) {
		case 'koopa':
		case 'paratroopa':
		case 'hammerbro':
		case 'piranha':
			return { w: 16, h: 24 };
		case 'bowser':
			return { w: 32, h: 32 };
		case 'lakitu':
			return { w: 20, h: 22 };
		case 'bullet':
			return { w: 16, h: 12 };
		case 'blooper':
		case 'cheep':
		case 'jumpcheep':
			return { w: 16, h: 14 };
		default:
			return { w: 16, h: 16 };
	}
}

function compile(spec) {
	const w = spec.width;
	const tiles = new Uint8Array(w * LEVEL_H);
	const pits = spec.pits ?? [];
	const set = (x, y, tile) => {
		if (x < 0 || y < 0 || x >= w || y >= LEVEL_H) return;
		tiles[idx(x, y, w)] = tile;
	};
	const get = (x, y) => {
		if (x < 0 || y < 0 || x >= w || y >= LEVEL_H) return Tile.Solid;
		return tiles[idx(x, y, w)];
	};

	if (spec.theme !== 'athletic' && spec.theme !== 'bridge') {
		for (let x = 0; x < w; x += 1) {
			if (inPit(pits, x)) continue;
			set(x, GROUND_Y, Tile.Solid);
			set(x, GROUND_Y + 1, Tile.Solid);
		}
	}

	for (const pit of pits) {
		for (let x = pit[0]; x < pit[1]; x += 1) {
			set(x, GROUND_Y, Tile.Empty);
			set(x, GROUND_Y + 1, Tile.Lava);
		}
	}

	for (const stair of spec.stairs ?? []) {
		const [x, steps, dir] = stair;
		for (let i = 0; i < steps; i += 1) {
			const col = x + i;
			const h = dir === 1 ? i + 1 : steps - i;
			for (let k = 0; k < h; k += 1)
				set(col, GROUND_Y - 1 - k, Tile.Solid);
		}
	}

	const pipes = [];
	for (const pipe of spec.pipes ?? []) {
		const [x, h, piranha, exit, warpTo] = pipe;
		const top = GROUND_Y - h;
		const tile = exit ? Tile.ExitPipe : Tile.Pipe;
		for (let col = x; col < x + 2; col += 1) {
			for (let row = top; row < GROUND_Y; row += 1) set(col, row, tile);
		}
		pipes.push({
			x,
			top,
			h,
			piranha: Boolean(piranha),
			exit: Boolean(exit),
			warpTo: warpTo ?? null,
		});
	}

	for (const plat of spec.platforms ?? []) {
		for (let i = 0; i < plat.w; i += 1) {
			const tile = plat.bridge ? Tile.Bridge : Tile.Platform;
			set(plat.x + i, plat.y, tile);
			if (plat.fill) {
				for (let y = plat.y + 1; y < LEVEL_H; y += 1) {
					set(plat.x + i, y, Tile.Solid);
				}
			}
		}
	}

	let coinBudget = 0;
	const blockCoins = [];
	const place = (x, y, tile) => {
		if (x < 0 || y < 0 || x >= w || y >= LEVEL_H) return;
		set(x, y, tile);
		if (tile === Tile.Question || tile === Tile.HiddenCoin) coinBudget += 1;
		if (tile === Tile.MultiCoin) {
			coinBudget += 10;
			blockCoins.push([`${x},${y}`, 10]);
		}
	};

	for (const row of spec.rows ?? []) {
		for (let i = 0; i < row.s.length; i += 1) {
			const tile = CHAR[row.s[i]];
			if (tile) place(row.x + i, row.y, tile);
		}
	}
	for (const hidden of spec.hidden ?? []) {
		const tile =
			hidden.item === 'oneup' ? Tile.HiddenOneUp : Tile.HiddenCoin;
		place(hidden.x, hidden.y, tile);
	}

	const items = [];
	for (const coin of spec.coins ?? []) {
		items.push({
			kind: 'coin',
			x: coin[0] * TILE + 2,
			y: coin[1] * TILE,
			w: 12,
			h: 16,
			vx: 0,
			vy: 0,
			emerge: 0,
			alive: true,
		});
		coinBudget += 1;
	}

	const enemies = [];
	let enemyBudget = 0;
	const finite = new Set([
		'goomba',
		'koopa',
		'paratroopa',
		'buzzy',
		'hammerbro',
		'piranha',
		'bowser',
	]);

	const pushEnemy = (spawn) => {
		enemies.push(spawn);
		if (finite.has(spawn.kind)) enemyBudget += 1;
	};

	for (const enemy of spec.enemies ?? []) {
		const size = actorSize(enemy.kind);
		let surface = enemy.y ?? null;
		if (surface == null) surface = groundSurface(tiles, w, enemy.x);
		if (surface == null) continue;
		const feet = surface * TILE;
		pushEnemy({
			kind: enemy.kind,
			x: enemy.x * TILE,
			y: feet - size.h,
			w: size.w,
			h: size.h,
			dir: enemy.dir ?? -1,
			vx: 0,
			vy: 0,
			red: Boolean(enemy.red),
			speed:
				enemy.kind === 'koopa' || enemy.kind === 'buzzy' ? 0.62 : 0.52,
			phase: enemy.phase ?? 0,
			timer: enemy.timer ?? 0,
			minX: (enemy.minX ?? enemy.x) * TILE,
			maxX: (enemy.maxX ?? enemy.x + 1) * TILE,
			hover: enemy.y != null,
			baseY: feet - size.h,
			alive: true,
		});
	}

	for (const pipe of pipes) {
		if (!pipe.piranha) continue;
		const size = actorSize('piranha');
		pushEnemy({
			kind: 'piranha',
			x: pipe.x * TILE,
			y: pipe.top * TILE,
			w: size.w,
			h: size.h,
			dir: 1,
			vx: 0,
			vy: 0,
			phase: 0,
			top: pipe.top * TILE,
			hideY: pipe.top * TILE + 8,
			speed: 0,
			alive: true,
		});
	}

	const cannons = [];
	for (const cannon of spec.cannons ?? []) {
		const top = GROUND_Y - cannon.h;
		for (let row = top; row < GROUND_Y; row += 1)
			set(cannon.x, row, Tile.Cannon);
		cannons.push({
			kind: 'cannon',
			x: cannon.x * TILE,
			y: top * TILE,
			w: TILE,
			h: cannon.h * TILE,
			timer: 40 + ((cannon.x * 17) % 50),
			alive: true,
		});
	}

	const lifts = (spec.lifts ?? []).map((lift, i) => ({
		x: lift.x * TILE,
		y: lift.y * TILE,
		w: (lift.w ?? 3) * TILE,
		h: 8,
		axis: lift.axis ?? 'y',
		originX: lift.x * TILE,
		originY: lift.y * TILE,
		range: (lift.range ?? 3) * TILE,
		phase: lift.phase ?? i * 1.3,
		speed: lift.speed ?? 0.02,
	}));

	const hazards = [...cannons];
	if (spec.lakitu) {
		hazards.push({
			kind: 'lakitu',
			x: 80,
			y: 28,
			w: 20,
			h: 22,
			timer: 80,
			alive: true,
			respawn: 0,
		});
	}
	for (const bar of spec.firebars ?? []) {
		hazards.push({
			kind: 'firebar',
			x: bar.x * TILE + 8,
			y: bar.y * TILE + 8,
			len: bar.len ?? 4,
			angle: bar.angle ?? 0.4,
			speed: bar.speed ?? 0.045,
			alive: true,
		});
	}
	for (const x of spec.podoboos ?? []) {
		hazards.push({
			kind: 'podoboo',
			x: x * TILE,
			y: (LEVEL_H - 1) * TILE,
			w: 14,
			h: 14,
			vy: 0,
			timer: 30 + ((x * 13) % 80),
			origin: (LEVEL_H - 1) * TILE,
			alive: true,
		});
	}
	if (spec.cheepSpawner) {
		hazards.push({
			kind: 'cheepspawner',
			timer: 20,
			every: spec.cheepEvery ?? 70,
			alive: true,
		});
	}

	if (spec.ceiling) {
		for (let x = 0; x < w; x += 1) {
			for (let y = 0; y < spec.ceiling; y += 1) {
				if (get(x, y) === Tile.Empty) set(x, y, Tile.Solid);
			}
		}
	}

	let exit = null;
	const warps = [];
	if (spec.theme === 'castle') {
		const axe = spec.axe;
		exit = {
			type: 'axe',
			x: axe * TILE,
			y: (GROUND_Y - 3) * TILE,
			w: 16,
			h: 48,
			mode: 'overlap',
		};
		for (let x = spec.bridge[0]; x < spec.bridge[1]; x += 1) {
			set(x, GROUND_Y, Tile.Bridge);
			set(x, GROUND_Y + 1, Tile.Lava);
		}
		const size = actorSize('bowser');
		pushEnemy({
			kind: 'bowser',
			x: spec.bowser * TILE,
			y: GROUND_Y * TILE - size.h,
			w: size.w,
			h: size.h,
			dir: -1,
			vx: 0,
			vy: 0,
			minX: spec.bridge[0] * TILE + 8,
			maxX: (spec.bridge[1] - 3) * TILE,
			timer: 40,
			jumpTimer: 70,
			hits: 0,
			speed: 0.35,
			alive: true,
			falling: false,
		});
	} else if (spec.flag != null) {
		exit = {
			type: 'flag',
			x: spec.flag * TILE + 4,
			y: 2 * TILE,
			w: 10,
			h: (GROUND_Y - 2) * TILE,
			mode: 'overlap',
		};
	}

	for (const pipe of pipes) {
		const sensor = {
			x: pipe.x * TILE,
			y: pipe.top * TILE,
			w: 32,
			h: 16,
		};
		if (pipe.warpTo) {
			warps.push({ ...sensor, to: pipe.warpTo, mode: 'down' });
		}
		if (pipe.exit) {
			const water = spec.theme === 'underwater';
			const top = pipe.top * TILE - (water ? 20 : 2);
			exit = {
				type: 'pipe',
				x: pipe.x * TILE - (water ? 0 : 8),
				y: top,
				w: water ? 32 : 48,
				h: water ? 24 : GROUND_Y * TILE - top + 4,
				mode: water ? 'overlap' : 'down',
			};
		}
	}

	const castleX =
		spec.theme === 'castle'
			? (spec.axe + 7) * TILE
			: spec.flag != null
				? (spec.flag + 8) * TILE
				: (w - 4) * TILE;

	let powerups = 0;
	for (let i = 0; i < tiles.length; i += 1) {
		const tile = tiles[i];
		if (
			tile === Tile.Mushroom ||
			tile === Tile.Star ||
			tile === Tile.HiddenOneUp
		) {
			powerups += 1;
		}
	}

	return {
		id: spec.id,
		world: spec.world,
		stage: spec.stage,
		theme: spec.theme,
		time: spec.time ?? 400,
		w,
		h: LEVEL_H,
		tiles,
		items,
		enemies,
		lifts,
		hazards,
		blockCoins,
		exit,
		warps,
		castleX,
		coinBudget,
		enemyBudget,
		powerups,
		bridge: spec.bridge ?? null,
	};
}

function overworld(spec) {
	return {
		theme: 'overworld',
		time: 400,
		pits: [],
		pipes: [],
		rows: [],
		coins: [],
		stairs: [],
		enemies: [],
		hidden: [],
		cannons: [],
		lifts: [],
		firebars: [],
		podoboos: [],
		...spec,
	};
}

const g = (xs) => xs.map((x) => ({ kind: 'goomba', x }));
const k = (xs, red = false) => xs.map((x) => ({ kind: 'koopa', x, red }));
const bz = (xs) => xs.map((x) => ({ kind: 'buzzy', x, red: true }));

const SPECS = [
	overworld({
		id: '1-1',
		world: 1,
		stage: 1,
		width: 212,
		pits: [
			[69, 71],
			[86, 89],
			[153, 155],
		],
		pipes: [
			[28, 2, false],
			[38, 3, false],
			[46, 4, false],
			[57, 4, false],
		],
		rows: [
			{ x: 16, y: 9, s: '?' },
			{ x: 20, y: 9, s: 'BMBB?' },
			{ x: 22, y: 6, s: '?' },
			{ x: 78, y: 9, s: 'BB?B' },
			{ x: 106, y: 9, s: 'B?B' },
			{ x: 109, y: 5, s: '?' },
			{ x: 129, y: 9, s: 'BBBB' },
		],
		hidden: [{ x: 64, y: 8, item: 'oneup' }],
		coins: [
			[92, 8],
			[93, 7],
			[94, 8],
			[95, 9],
		],
		stairs: [
			[72, 4, 1],
			[76, 4, -1],
			[140, 4, 1],
			[145, 4, -1],
			[188, 8, 1],
		],
		enemies: [
			...g([
				22, 40, 51, 53, 80, 82, 97, 99, 114, 116, 128, 130, 170, 172,
			]),
		],
		flag: 198,
	}),
	overworld({
		id: '1-2',
		world: 1,
		stage: 2,
		theme: 'underground',
		width: 168,
		ceiling: 3,
		pits: [
			[48, 50],
			[96, 99],
		],
		pipes: [
			[24, 2, true],
			[40, 3, false],
			[70, 2, true],
			[118, 2, false, false, '2-1'],
			[124, 2, false, false, '3-1'],
			[130, 2, false, false, '4-1'],
			[152, 2, false, true],
		],
		rows: [
			{ x: 10, y: 9, s: '??M??' },
			{ x: 16, y: 6, s: 'BBB' },
			{ x: 28, y: 9, s: 'NNB?B' },
			{ x: 52, y: 9, s: 'B?B?B?B' },
			{ x: 54, y: 6, s: 'M' },
			{ x: 80, y: 9, s: 'BBBBBBB' },
			{ x: 100, y: 9, s: '?B?B?' },
		],
		coins: [
			[12, 7],
			[13, 7],
			[14, 7],
			[15, 7],
			[16, 7],
			[60, 8],
			[61, 7],
			[62, 6],
			[63, 7],
			[64, 8],
			[104, 8],
			[105, 8],
			[106, 8],
			[107, 8],
		],
		enemies: [...g([18, 33, 58, 84, 108]), ...k([44, 90])],
	}),
	{
		id: '1-3',
		world: 1,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 176,
		platforms: [
			{ x: 0, y: 13, w: 12, fill: true },
			{ x: 16, y: 12, w: 6 },
			{ x: 25, y: 10, w: 5 },
			{ x: 33, y: 12, w: 6 },
			{ x: 42, y: 9, w: 5 },
			{ x: 50, y: 11, w: 7 },
			{ x: 60, y: 13, w: 5 },
			{ x: 68, y: 10, w: 5 },
			{ x: 76, y: 8, w: 6 },
			{ x: 85, y: 11, w: 6 },
			{ x: 94, y: 13, w: 5 },
			{ x: 102, y: 10, w: 7 },
			{ x: 112, y: 12, w: 5 },
			{ x: 120, y: 9, w: 6 },
			{ x: 129, y: 12, w: 6 },
			{ x: 138, y: 13, w: 6 },
			{ x: 152, y: 13, w: 24, fill: true },
		],
		rows: [
			{ x: 18, y: 8, s: 'M' },
			{ x: 52, y: 7, s: '?' },
			{ x: 104, y: 6, s: '??' },
			{ x: 122, y: 5, s: 'S' },
		],
		coins: [
			[26, 8],
			[27, 8],
			[34, 10],
			[35, 10],
			[70, 8],
			[77, 6],
			[78, 6],
			[130, 10],
		],
		enemies: [
			{ kind: 'goomba', x: 17, y: 12 },
			{ kind: 'koopa', x: 34, y: 12 },
			{ kind: 'goomba', x: 51, y: 11 },
			{ kind: 'koopa', x: 69, y: 10, red: true },
			{ kind: 'goomba', x: 86, y: 11 },
			{ kind: 'koopa', x: 104, y: 10 },
			{ kind: 'goomba', x: 121, y: 9 },
			{ kind: 'koopa', x: 140, y: 13, red: true },
		],
		flag: 162,
	},
	{
		id: '1-4',
		world: 1,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 118,
		ceiling: 3,
		pits: [
			[32, 35],
			[60, 63],
		],
		bridge: [78, 100],
		bowser: 88,
		axe: 100,
		firebars: [
			{ x: 22, y: 10, len: 4, speed: 0.04, angle: 0.2 },
			{ x: 48, y: 10, len: 4, speed: -0.05, angle: 1.2 },
		],
		podoboos: [34, 62],
		rows: [{ x: 12, y: 9, s: 'M?' }],
		coins: [
			[16, 8],
			[17, 8],
			[18, 8],
		],
		enemies: [...g([26, 54])],
	},
	overworld({
		id: '2-1',
		world: 2,
		stage: 1,
		width: 210,
		pits: [
			[62, 65],
			[98, 101],
			[146, 149],
		],
		pipes: [
			[26, 2, true],
			[42, 3, true],
			[74, 2, false],
			[112, 4, true],
		],
		rows: [
			{ x: 14, y: 9, s: '?M?' },
			{ x: 18, y: 6, s: 'B?B' },
			{ x: 50, y: 9, s: 'BBB?BBB' },
			{ x: 80, y: 9, s: 'M' },
			{ x: 120, y: 9, s: 'B?S?B' },
			{ x: 160, y: 9, s: '????' },
		],
		coins: [
			[32, 8],
			[33, 7],
			[34, 8],
			[88, 8],
			[89, 8],
			[90, 8],
			[130, 7],
			[131, 6],
			[132, 7],
		],
		stairs: [
			[54, 5, 1],
			[59, 5, -1],
			[134, 4, 1],
			[138, 4, -1],
			[186, 8, 1],
		],
		enemies: [
			...g([20, 36, 52, 84, 108, 124, 156]),
			...k([30, 70, 116, 150], false),
			...k([94, 140], true),
		],
		flag: 196,
	}),
	overworld({
		id: '2-2',
		world: 2,
		stage: 2,
		theme: 'underwater',
		width: 176,
		pits: [],
		pipes: [
			[30, 2, true],
			[58, 3, true],
			[90, 2, false],
			[120, 3, true],
			[158, 2, false, true],
		],
		rows: [
			{ x: 16, y: 9, s: 'M' },
			{ x: 40, y: 6, s: '???' },
			{ x: 70, y: 8, s: 'B?B' },
			{ x: 100, y: 5, s: 'S' },
		],
		coins: [
			[20, 6],
			[21, 5],
			[22, 4],
			[23, 5],
			[24, 6],
			[46, 7],
			[47, 6],
			[48, 7],
			[74, 4],
			[75, 4],
			[76, 5],
			[77, 5],
			[104, 6],
			[105, 5],
			[106, 6],
			[136, 7],
			[137, 6],
			[138, 5],
			[139, 6],
		],
		enemies: [
			{ kind: 'cheep', x: 24, y: 8, dir: -1 },
			{ kind: 'cheep', x: 48, y: 6, dir: -1 },
			{ kind: 'blooper', x: 36, y: 5 },
			{ kind: 'cheep', x: 80, y: 7, dir: -1 },
			{ kind: 'blooper', x: 100, y: 4 },
			{ kind: 'cheep', x: 130, y: 8, dir: -1 },
		],
	}),
	{
		id: '2-3',
		world: 2,
		stage: 3,
		theme: 'bridge',
		time: 400,
		width: 188,
		cheepSpawner: true,
		cheepEvery: 78,
		platforms: [
			{ x: 0, y: 13, w: 14, fill: true },
			{ x: 18, y: 12, w: 8, bridge: true },
			{ x: 30, y: 12, w: 7, bridge: true },
			{ x: 41, y: 11, w: 6, bridge: true },
			{ x: 51, y: 12, w: 8, bridge: true },
			{ x: 63, y: 10, w: 6, bridge: true },
			{ x: 73, y: 12, w: 8, bridge: true },
			{ x: 85, y: 11, w: 7, bridge: true },
			{ x: 96, y: 12, w: 8, bridge: true },
			{ x: 108, y: 10, w: 6, bridge: true },
			{ x: 118, y: 12, w: 8, bridge: true },
			{ x: 130, y: 12, w: 7, bridge: true },
			{ x: 148, y: 13, w: 40, fill: true },
		],
		rows: [
			{ x: 20, y: 8, s: 'M?' },
			{ x: 64, y: 6, s: '??' },
			{ x: 110, y: 6, s: 'S' },
		],
		coins: [
			[32, 9],
			[33, 8],
			[34, 9],
			[52, 9],
			[74, 9],
			[86, 8],
			[120, 9],
			[132, 9],
		],
		enemies: [
			{ kind: 'koopa', x: 20, y: 12, red: true },
			{ kind: 'koopa', x: 53, y: 12 },
			{ kind: 'koopa', x: 98, y: 12, red: true },
		],
		flag: 170,
	},
	{
		id: '2-4',
		world: 2,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 128,
		ceiling: 3,
		pits: [
			[28, 31],
			[48, 51],
			[70, 73],
		],
		bridge: [86, 110],
		bowser: 96,
		axe: 110,
		firebars: [
			{ x: 18, y: 10, len: 4, speed: 0.05 },
			{ x: 36, y: 10, len: 5, speed: -0.04, angle: 1 },
			{ x: 58, y: 10, len: 4, speed: 0.06, angle: 2 },
		],
		podoboos: [28, 48, 70],
		rows: [{ x: 10, y: 9, s: '?M' }],
		coins: [
			[22, 8],
			[23, 8],
			[44, 7],
			[45, 7],
		],
		enemies: [...g([24, 52])],
	},
	overworld({
		id: '3-1',
		world: 3,
		stage: 1,
		width: 220,
		pits: [
			[58, 61],
			[102, 106],
			[156, 160],
		],
		pipes: [
			[22, 2, true],
			[36, 4, true],
			[78, 3, true],
			[128, 2, true],
		],
		rows: [
			{ x: 12, y: 9, s: 'M?B?' },
			{ x: 16, y: 6, s: '?' },
			{ x: 48, y: 9, s: 'BBBB?BB' },
			{ x: 88, y: 9, s: 'M' },
			{ x: 116, y: 9, s: 'B?B?B' },
			{ x: 140, y: 6, s: 'SSS' },
			{ x: 168, y: 9, s: '????' },
		],
		coins: [
			[28, 8],
			[29, 7],
			[30, 8],
			[66, 8],
			[67, 8],
			[92, 6],
			[93, 5],
			[94, 6],
			[148, 8],
			[149, 8],
		],
		stairs: [
			[50, 6, 1],
			[56, 6, -1],
			[132, 5, 1],
			[137, 5, -1],
			[196, 8, 1],
		],
		enemies: [
			...g([18, 32, 46, 70, 84, 110, 122, 146, 164, 178]),
			...k([40, 96, 150]),
			{ kind: 'paratroopa', x: 86, y: 8, red: true },
		],
		flag: 206,
	}),
	overworld({
		id: '3-2',
		world: 3,
		stage: 2,
		width: 200,
		pits: [
			[44, 47],
			[80, 84],
			[124, 128],
		],
		pipes: [
			[20, 3, true],
			[60, 2, true],
			[100, 4, true],
		],
		rows: [
			{ x: 8, y: 9, s: '?M?' },
			{ x: 28, y: 6, s: 'BBB?BBB' },
			{ x: 30, y: 9, s: 'H' },
			{ x: 70, y: 9, s: 'NN?M' },
			{ x: 108, y: 9, s: 'B?B?B' },
			{ x: 140, y: 6, s: '???' },
		],
		hidden: [{ x: 90, y: 8, item: 'oneup' }],
		coins: [
			[14, 7],
			[15, 7],
			[16, 7],
			[50, 8],
			[51, 7],
			[52, 8],
			[92, 8],
			[112, 8],
			[148, 8],
			[149, 7],
			[150, 8],
		],
		stairs: [
			[64, 4, 1],
			[132, 4, 1],
			[136, 4, -1],
			[176, 7, 1],
		],
		enemies: [
			...g([18, 34, 54, 74, 96, 116, 144]),
			...k([26, 88, 136], true),
			{ kind: 'paratroopa', x: 110, y: 7 },
		],
		flag: 186,
	}),
	{
		id: '3-3',
		world: 3,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 188,
		platforms: [
			{ x: 0, y: 13, w: 10, fill: true },
			{ x: 14, y: 11, w: 5 },
			{ x: 22, y: 9, w: 5 },
			{ x: 30, y: 12, w: 5 },
			{ x: 38, y: 8, w: 5 },
			{ x: 46, y: 11, w: 6 },
			{ x: 55, y: 13, w: 4 },
			{ x: 62, y: 10, w: 5 },
			{ x: 70, y: 7, w: 5 },
			{ x: 78, y: 11, w: 5 },
			{ x: 86, y: 9, w: 6 },
			{ x: 95, y: 12, w: 5 },
			{ x: 103, y: 8, w: 5 },
			{ x: 111, y: 11, w: 6 },
			{ x: 120, y: 13, w: 5 },
			{ x: 128, y: 10, w: 6 },
			{ x: 137, y: 8, w: 5 },
			{ x: 156, y: 13, w: 32, fill: true },
		],
		rows: [
			{ x: 16, y: 7, s: 'M' },
			{ x: 48, y: 7, s: '?' },
			{ x: 88, y: 5, s: '??' },
			{ x: 130, y: 6, s: 'S' },
		],
		coins: [
			[23, 7],
			[31, 10],
			[39, 6],
			[63, 8],
			[71, 5],
			[104, 6],
			[138, 6],
		],
		enemies: [
			{ kind: 'paratroopa', x: 24, y: 6, red: true },
			{ kind: 'koopa', x: 47, y: 11, red: true },
			{ kind: 'paratroopa', x: 72, y: 4 },
			{ kind: 'koopa', x: 112, y: 11 },
			{ kind: 'goomba', x: 129, y: 10 },
		],
		flag: 170,
	},
	{
		id: '3-4',
		world: 3,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 136,
		ceiling: 3,
		pits: [
			[26, 29],
			[46, 49],
			[66, 69],
			[86, 89],
		],
		bridge: [96, 120],
		bowser: 106,
		axe: 120,
		firebars: [
			{ x: 16, y: 10, len: 4, speed: 0.05 },
			{ x: 34, y: 9, len: 5, speed: -0.055, angle: 0.8 },
			{ x: 54, y: 10, len: 4, speed: 0.04, angle: 2.1 },
			{ x: 74, y: 9, len: 6, speed: -0.035, angle: 0.3 },
		],
		podoboos: [26, 46, 66, 86],
		rows: [{ x: 8, y: 9, s: 'M?' }],
		coins: [
			[20, 8],
			[40, 7],
			[60, 8],
		],
		enemies: [...k([22, 58])],
	},
	overworld({
		id: '4-1',
		world: 4,
		stage: 1,
		width: 214,
		lakitu: true,
		pits: [
			[70, 74],
			[118, 122],
			[164, 168],
		],
		pipes: [
			[24, 2, true],
			[48, 3, true],
			[96, 2, false],
			[140, 4, true],
		],
		rows: [
			{ x: 12, y: 9, s: '?M?' },
			{ x: 32, y: 9, s: 'BB?BB' },
			{ x: 34, y: 6, s: 'S' },
			{ x: 80, y: 9, s: 'M' },
			{ x: 104, y: 9, s: 'B?B?B' },
			{ x: 150, y: 9, s: '????' },
		],
		coins: [
			[18, 7],
			[19, 7],
			[56, 8],
			[57, 7],
			[58, 8],
			[108, 8],
			[128, 6],
			[129, 6],
			[176, 8],
		],
		stairs: [
			[60, 4, 1],
			[84, 5, 1],
			[89, 5, -1],
			[190, 8, 1],
		],
		enemies: [
			...g([20, 40, 64, 90, 112, 146, 172]),
			...k([36, 100, 156], true),
		],
		flag: 200,
	}),
	overworld({
		id: '4-2',
		world: 4,
		stage: 2,
		theme: 'underground',
		width: 180,
		ceiling: 3,
		pits: [
			[52, 55],
			[110, 114],
		],
		pipes: [
			[18, 2, true],
			[36, 3, true],
			[70, 2, false],
			[90, 2, true],
			[128, 2, false, false, '6-1'],
			[134, 2, false, false, '7-1'],
			[140, 2, false, false, '8-1'],
			[164, 2, false, true],
		],
		rows: [
			{ x: 8, y: 9, s: 'M???' },
			{ x: 24, y: 6, s: 'NNN' },
			{ x: 42, y: 9, s: 'B?B?B' },
			{ x: 78, y: 9, s: '?M?' },
			{ x: 100, y: 6, s: 'BBB?BBB' },
		],
		coins: [
			[10, 7],
			[11, 7],
			[12, 7],
			[13, 6],
			[14, 7],
			[46, 7],
			[47, 6],
			[48, 7],
			[80, 7],
			[81, 7],
			[116, 8],
			[117, 7],
			[118, 8],
			[148, 8],
			[149, 8],
		],
		enemies: [
			...g([16, 44, 74, 104]),
			...k([28, 86, 120]),
			...bz([64, 96]),
		],
	}),
	{
		id: '4-3',
		world: 4,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 196,
		lifts: [
			{ x: 28, y: 8, w: 3, range: 3, speed: 0.02, phase: 0 },
			{ x: 48, y: 10, w: 3, range: 2.5, speed: 0.018, phase: 1.4 },
			{ x: 78, y: 7, w: 3, range: 3, speed: 0.022, phase: 0.6 },
			{ x: 108, y: 9, w: 3, range: 3, speed: 0.02, phase: 2 },
			{ x: 136, y: 8, w: 3, range: 2.5, speed: 0.019, phase: 0.2 },
		],
		platforms: [
			{ x: 0, y: 13, w: 16, fill: true },
			{ x: 20, y: 12, w: 6 },
			{ x: 36, y: 11, w: 6 },
			{ x: 58, y: 12, w: 6 },
			{ x: 68, y: 9, w: 5 },
			{ x: 90, y: 11, w: 6 },
			{ x: 100, y: 13, w: 5 },
			{ x: 118, y: 10, w: 6 },
			{ x: 148, y: 12, w: 6 },
			{ x: 164, y: 13, w: 32, fill: true },
		],
		rows: [
			{ x: 22, y: 8, s: 'M' },
			{ x: 70, y: 5, s: '?' },
			{ x: 120, y: 6, s: 'S?' },
		],
		coins: [
			[38, 9],
			[60, 10],
			[92, 9],
			[150, 10],
		],
		enemies: [
			{ kind: 'koopa', x: 22, y: 12, red: true },
			{ kind: 'paratroopa', x: 70, y: 6, red: true },
			{ kind: 'koopa', x: 120, y: 10 },
		],
		flag: 180,
	},
	{
		id: '4-4',
		world: 4,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 142,
		ceiling: 3,
		pits: [
			[24, 27],
			[42, 45],
			[62, 65],
			[86, 89],
		],
		bridge: [102, 126],
		bowser: 112,
		axe: 126,
		firebars: [
			{ x: 14, y: 10, len: 5, speed: 0.05 },
			{ x: 32, y: 9, len: 4, speed: -0.06, angle: 1.4 },
			{ x: 50, y: 10, len: 6, speed: 0.04, angle: 0.5 },
			{ x: 72, y: 9, len: 4, speed: -0.05, angle: 2 },
		],
		podoboos: [24, 42, 60, 84],
		rows: [{ x: 8, y: 9, s: 'M?' }],
		coins: [
			[18, 8],
			[36, 7],
			[56, 8],
			[76, 7],
		],
		enemies: [...k([20]), ...bz([64])],
	},
	overworld({
		id: '5-1',
		world: 5,
		stage: 1,
		width: 210,
		pits: [
			[66, 69],
			[114, 118],
			[162, 165],
		],
		pipes: [[34, 2, true]],
		cannons: [
			{ x: 48, h: 2 },
			{ x: 86, h: 3 },
			{ x: 130, h: 2 },
			{ x: 148, h: 3 },
		],
		rows: [
			{ x: 12, y: 9, s: 'M??' },
			{ x: 22, y: 6, s: '?' },
			{ x: 56, y: 9, s: 'B?B' },
			{ x: 96, y: 9, s: 'M' },
			{ x: 136, y: 6, s: 'S?' },
		],
		coins: [
			[16, 7],
			[17, 7],
			[18, 7],
			[60, 8],
			[74, 8],
			[100, 7],
			[101, 6],
			[102, 7],
			[170, 8],
		],
		stairs: [
			[72, 4, 1],
			[104, 5, 1],
			[109, 5, -1],
			[188, 7, 1],
		],
		enemies: [...g([20, 40, 74, 108, 156]), ...k([28, 120])],
		flag: 196,
	}),
	overworld({
		id: '5-2',
		world: 5,
		stage: 2,
		width: 206,
		pits: [
			[40, 43],
			[88, 92],
			[140, 144],
		],
		cannons: [
			{ x: 28, h: 2 },
			{ x: 58, h: 3 },
			{ x: 76, h: 2 },
			{ x: 110, h: 4 },
			{ x: 156, h: 3 },
		],
		rows: [
			{ x: 10, y: 9, s: '?M?' },
			{ x: 48, y: 9, s: 'BB?BB' },
			{ x: 96, y: 6, s: 'M' },
			{ x: 120, y: 9, s: 'N?N' },
			{ x: 164, y: 9, s: '???' },
		],
		coins: [
			[14, 7],
			[15, 6],
			[16, 7],
			[50, 7],
			[66, 8],
			[100, 8],
			[124, 7],
			[168, 7],
			[169, 7],
		],
		stairs: [
			[80, 4, 1],
			[132, 4, 1],
			[184, 8, 1],
		],
		enemies: [
			...g([18, 36, 70, 104, 150]),
			...k([46, 116], true),
			...bz([64]),
		],
		flag: 194,
	}),
	{
		id: '5-3',
		world: 5,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 184,
		platforms: [
			{ x: 0, y: 13, w: 11, fill: true },
			{ x: 15, y: 11, w: 5 },
			{ x: 23, y: 8, w: 4 },
			{ x: 30, y: 12, w: 5 },
			{ x: 38, y: 9, w: 4 },
			{ x: 45, y: 6, w: 5 },
			{ x: 53, y: 11, w: 5 },
			{ x: 61, y: 13, w: 4 },
			{ x: 68, y: 9, w: 5 },
			{ x: 76, y: 7, w: 4 },
			{ x: 83, y: 11, w: 5 },
			{ x: 91, y: 8, w: 5 },
			{ x: 99, y: 12, w: 4 },
			{ x: 106, y: 9, w: 5 },
			{ x: 114, y: 6, w: 4 },
			{ x: 121, y: 10, w: 5 },
			{ x: 129, y: 12, w: 5 },
			{ x: 150, y: 13, w: 34, fill: true },
		],
		rows: [
			{ x: 16, y: 7, s: 'M' },
			{ x: 46, y: 3, s: '?' },
			{ x: 92, y: 4, s: 'S' },
			{ x: 122, y: 6, s: '??' },
		],
		coins: [
			[24, 6],
			[31, 10],
			[54, 9],
			[69, 7],
			[107, 7],
			[130, 10],
		],
		enemies: [
			{ kind: 'paratroopa', x: 24, y: 5, red: true },
			{ kind: 'paratroopa', x: 54, y: 8 },
			{ kind: 'koopa', x: 84, y: 11, red: true },
			{ kind: 'paratroopa', x: 115, y: 3, red: true },
		],
		flag: 166,
	},
	{
		id: '5-4',
		world: 5,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 148,
		ceiling: 3,
		pits: [
			[26, 29],
			[46, 49],
			[68, 71],
			[90, 93],
		],
		bridge: [108, 132],
		bowser: 118,
		axe: 132,
		firebars: [
			{ x: 16, y: 10, len: 5, speed: 0.055 },
			{ x: 36, y: 9, len: 4, speed: -0.05, angle: 1 },
			{ x: 56, y: 10, len: 6, speed: 0.04 },
			{ x: 78, y: 9, len: 5, speed: -0.06, angle: 2.2 },
		],
		podoboos: [26, 48, 68, 90],
		rows: [{ x: 8, y: 9, s: '?M' }],
		coins: [
			[20, 8],
			[40, 7],
			[60, 8],
			[82, 7],
		],
		enemies: [...bz([30, 74])],
	},
	overworld({
		id: '6-1',
		world: 6,
		stage: 1,
		width: 208,
		pits: [
			[50, 53],
			[92, 96],
			[138, 142],
		],
		pipes: [
			[18, 2, true],
			[34, 3, true],
			[70, 2, true],
			[112, 4, true],
		],
		rows: [
			{ x: 8, y: 9, s: 'M?' },
			{ x: 24, y: 6, s: 'B?B' },
			{ x: 56, y: 9, s: 'S' },
			{ x: 80, y: 9, s: 'BBM?BB' },
			{ x: 120, y: 9, s: '????' },
			{ x: 156, y: 6, s: 'M' },
		],
		coins: [
			[10, 7],
			[11, 7],
			[12, 6],
			[40, 8],
			[60, 7],
			[84, 7],
			[100, 8],
			[124, 7],
			[160, 8],
			[161, 8],
		],
		stairs: [
			[74, 4, 1],
			[100, 5, 1],
			[105, 5, -1],
			[184, 8, 1],
		],
		enemies: [
			...g([16, 28, 46, 64, 88, 116, 150]),
			...bz([22, 76, 108, 132]),
			...k([40, 96], true),
		],
		flag: 194,
	}),
	overworld({
		id: '6-2',
		world: 6,
		stage: 2,
		width: 200,
		pits: [
			[48, 51],
			[100, 104],
			[152, 156],
		],
		pipes: [
			[14, 2, true],
			[22, 3, true],
			[30, 4, true],
			[60, 2, true],
			[68, 3, true],
			[76, 2, true],
			[112, 4, true],
			[120, 2, true],
			[128, 3, true],
			[164, 2, true],
		],
		rows: [
			{ x: 8, y: 9, s: '?M' },
			{ x: 40, y: 6, s: '???' },
			{ x: 84, y: 9, s: 'BMB' },
			{ x: 136, y: 6, s: 'S?' },
		],
		coins: [
			[36, 8],
			[37, 7],
			[38, 8],
			[88, 7],
			[140, 8],
			[141, 7],
			[142, 8],
			[176, 8],
		],
		stairs: [
			[90, 4, 1],
			[176, 7, 1],
		],
		enemies: [...g([18, 42, 86, 146]), ...k([56, 108, 160], true)],
		flag: 186,
	}),
	{
		id: '6-3',
		world: 6,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 200,
		lifts: [
			{ x: 24, y: 9, w: 3, range: 3, speed: 0.02, phase: 0 },
			{ x: 40, y: 7, w: 3, range: 2.4, speed: 0.024, phase: 1 },
			{ x: 64, y: 10, w: 3, range: 3, speed: 0.018, phase: 0.4 },
			{ x: 88, y: 8, w: 3, range: 3, speed: 0.022, phase: 2 },
			{ x: 112, y: 6, w: 3, range: 2.6, speed: 0.02, phase: 0.8 },
			{ x: 136, y: 9, w: 3, range: 3, speed: 0.021, phase: 1.6 },
		],
		platforms: [
			{ x: 0, y: 13, w: 14, fill: true },
			{ x: 32, y: 12, w: 5 },
			{ x: 52, y: 11, w: 5 },
			{ x: 74, y: 12, w: 5 },
			{ x: 100, y: 10, w: 5 },
			{ x: 124, y: 12, w: 5 },
			{ x: 156, y: 13, w: 44, fill: true },
		],
		rows: [
			{ x: 8, y: 9, s: 'M' },
			{ x: 54, y: 7, s: '?' },
			{ x: 102, y: 6, s: 'S?' },
		],
		coins: [
			[34, 10],
			[76, 10],
			[126, 10],
			[160, 10],
		],
		enemies: [
			{ kind: 'paratroopa', x: 34, y: 8, red: true },
			{ kind: 'koopa', x: 76, y: 12, red: true },
			{ kind: 'paratroopa', x: 126, y: 8 },
		],
		flag: 178,
	},
	{
		id: '6-4',
		world: 6,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 150,
		ceiling: 3,
		pits: [
			[22, 25],
			[40, 43],
			[62, 65],
			[82, 85],
			[100, 103],
		],
		bridge: [112, 136],
		bowser: 122,
		axe: 136,
		firebars: [
			{ x: 14, y: 10, len: 5, speed: 0.05 },
			{ x: 32, y: 9, len: 6, speed: -0.045, angle: 0.7 },
			{ x: 52, y: 10, len: 4, speed: 0.06 },
			{ x: 70, y: 9, len: 5, speed: -0.05, angle: 1.8 },
			{ x: 90, y: 10, len: 4, speed: 0.04, angle: 0.2 },
		],
		podoboos: [24, 44, 64, 84, 100],
		rows: [{ x: 6, y: 9, s: 'M?' }],
		coins: [
			[16, 8],
			[36, 7],
			[56, 8],
			[76, 7],
		],
		enemies: [...bz([20, 60]), { kind: 'hammerbro', x: 48 }],
	},
	overworld({
		id: '7-1',
		world: 7,
		stage: 1,
		width: 214,
		pits: [
			[46, 50],
			[86, 90],
			[130, 134],
			[170, 174],
		],
		pipes: [
			[16, 2, true],
			[28, 3, true],
			[60, 2, true],
			[104, 4, true],
			[148, 3, true],
		],
		rows: [
			{ x: 8, y: 9, s: '?M?' },
			{ x: 20, y: 6, s: 'B?B' },
			{ x: 52, y: 9, s: 'NNM' },
			{ x: 72, y: 6, s: 'S' },
			{ x: 112, y: 9, s: 'B?B?B' },
			{ x: 152, y: 9, s: 'M??' },
		],
		coins: [
			[10, 7],
			[11, 6],
			[12, 7],
			[36, 8],
			[64, 8],
			[94, 7],
			[116, 7],
			[156, 7],
			[180, 8],
		],
		stairs: [
			[74, 5, 1],
			[79, 5, -1],
			[136, 4, 1],
			[190, 8, 1],
		],
		enemies: [
			...g([14, 24, 40, 56, 96, 120, 156]),
			...k([34, 108], true),
			{ kind: 'hammerbro', x: 68 },
			{ kind: 'hammerbro', x: 160 },
			...bz([44, 100]),
		],
		flag: 200,
	}),
	overworld({
		id: '7-2',
		world: 7,
		stage: 2,
		theme: 'underwater',
		width: 188,
		pipes: [
			[20, 2, true],
			[40, 3, true],
			[64, 2, true],
			[88, 3, false],
			[112, 2, true],
			[136, 3, true],
			[170, 2, false, true],
		],
		rows: [
			{ x: 10, y: 8, s: 'M' },
			{ x: 28, y: 5, s: '???' },
			{ x: 52, y: 7, s: 'B?B' },
			{ x: 96, y: 4, s: 'S' },
			{ x: 120, y: 6, s: 'M?' },
		],
		coins: [
			[14, 5],
			[15, 4],
			[16, 5],
			[30, 6],
			[31, 5],
			[32, 6],
			[54, 4],
			[55, 4],
			[70, 6],
			[71, 5],
			[72, 6],
			[100, 6],
			[101, 5],
			[102, 4],
			[124, 7],
			[144, 6],
			[145, 5],
			[146, 6],
		],
		enemies: [
			{ kind: 'cheep', x: 18, y: 7 },
			{ kind: 'cheep', x: 36, y: 5 },
			{ kind: 'blooper', x: 48, y: 4 },
			{ kind: 'cheep', x: 76, y: 8 },
			{ kind: 'blooper', x: 96, y: 6 },
			{ kind: 'cheep', x: 128, y: 7 },
			{ kind: 'blooper', x: 150, y: 5 },
		],
	}),
	{
		id: '7-3',
		world: 7,
		stage: 3,
		theme: 'bridge',
		time: 400,
		width: 196,
		cheepSpawner: true,
		cheepEvery: 64,
		platforms: [
			{ x: 0, y: 13, w: 12, fill: true },
			{ x: 16, y: 12, w: 6, bridge: true },
			{ x: 26, y: 11, w: 5, bridge: true },
			{ x: 35, y: 12, w: 6, bridge: true },
			{ x: 45, y: 10, w: 5, bridge: true },
			{ x: 54, y: 12, w: 6, bridge: true },
			{ x: 64, y: 11, w: 5, bridge: true },
			{ x: 73, y: 9, w: 5, bridge: true },
			{ x: 82, y: 12, w: 6, bridge: true },
			{ x: 92, y: 10, w: 5, bridge: true },
			{ x: 101, y: 12, w: 6, bridge: true },
			{ x: 111, y: 11, w: 5, bridge: true },
			{ x: 120, y: 12, w: 6, bridge: true },
			{ x: 130, y: 10, w: 5, bridge: true },
			{ x: 156, y: 13, w: 40, fill: true },
		],
		rows: [
			{ x: 18, y: 8, s: 'M' },
			{ x: 56, y: 6, s: '??' },
			{ x: 102, y: 8, s: 'S' },
		],
		coins: [
			[28, 9],
			[36, 10],
			[46, 8],
			[74, 7],
			[84, 10],
			[122, 10],
		],
		enemies: [
			{ kind: 'koopa', x: 18, y: 12, red: true },
			{ kind: 'hammerbro', x: 56, y: 12 },
			{ kind: 'koopa', x: 112, y: 11, red: true },
		],
		flag: 176,
	},
	{
		id: '7-4',
		world: 7,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 156,
		ceiling: 3,
		pits: [
			[22, 25],
			[44, 47],
			[64, 67],
			[84, 87],
			[104, 107],
		],
		bridge: [118, 142],
		bowser: 128,
		axe: 142,
		firebars: [
			{ x: 14, y: 10, len: 5, speed: 0.055 },
			{ x: 30, y: 9, len: 6, speed: -0.05, angle: 0.9 },
			{ x: 48, y: 10, len: 4, speed: 0.06 },
			{ x: 66, y: 9, len: 5, speed: -0.045, angle: 1.7 },
			{ x: 86, y: 10, len: 6, speed: 0.04, angle: 0.4 },
		],
		podoboos: [22, 40, 58, 76, 96, 108],
		rows: [{ x: 6, y: 9, s: 'M?' }],
		coins: [
			[16, 8],
			[34, 7],
			[52, 8],
			[70, 7],
			[90, 8],
		],
		enemies: [{ kind: 'hammerbro', x: 36 }, ...bz([24, 74])],
	},
	overworld({
		id: '8-1',
		world: 8,
		stage: 1,
		width: 224,
		lakitu: true,
		pits: [
			[36, 40],
			[72, 76],
			[110, 115],
			[150, 155],
			[186, 190],
		],
		pipes: [
			[18, 3, true],
			[48, 2, true],
			[88, 4, true],
			[128, 3, true],
			[166, 2, true],
		],
		rows: [
			{ x: 8, y: 9, s: 'M??' },
			{ x: 12, y: 6, s: 'S' },
			{ x: 24, y: 9, s: 'BBB' },
			{ x: 56, y: 9, s: '?M?' },
			{ x: 96, y: 6, s: 'B?B' },
			{ x: 132, y: 9, s: 'NN?' },
			{ x: 170, y: 6, s: 'M' },
		],
		hidden: [{ x: 80, y: 8, item: 'oneup' }],
		coins: [
			[10, 7],
			[11, 7],
			[26, 8],
			[42, 8],
			[60, 7],
			[100, 8],
			[136, 7],
			[158, 8],
			[174, 8],
		],
		stairs: [
			[62, 5, 1],
			[100, 4, 1],
			[104, 4, -1],
			[200, 8, 1],
		],
		enemies: [
			...g([14, 28, 44, 60, 84, 104, 124, 146, 172]),
			...k([22, 52, 96, 140], true),
			...bz([32, 108, 160]),
			{ kind: 'hammerbro', x: 68 },
			{ kind: 'paratroopa', x: 120, y: 8, red: true },
		],
		flag: 210,
	}),
	overworld({
		id: '8-2',
		world: 8,
		stage: 2,
		width: 210,
		pits: [
			[42, 46],
			[90, 95],
			[138, 143],
		],
		cannons: [
			{ x: 26, h: 2 },
			{ x: 54, h: 3 },
			{ x: 74, h: 2 },
			{ x: 110, h: 4 },
			{ x: 156, h: 3 },
			{ x: 172, h: 2 },
		],
		rows: [
			{ x: 8, y: 9, s: 'M?' },
			{ x: 16, y: 6, s: '???' },
			{ x: 48, y: 9, s: 'BMB' },
			{ x: 100, y: 6, s: 'S' },
			{ x: 120, y: 9, s: 'N?N' },
			{ x: 180, y: 9, s: '??' },
		],
		coins: [
			[10, 7],
			[18, 4],
			[19, 4],
			[32, 8],
			[64, 8],
			[104, 8],
			[124, 7],
			[164, 8],
		],
		stairs: [
			[80, 4, 1],
			[148, 5, 1],
			[190, 7, 1],
		],
		enemies: [
			...g([14, 36, 66, 104, 150]),
			...bz([20, 60, 116]),
			{ kind: 'hammerbro', x: 84 },
			{ kind: 'hammerbro', x: 128 },
			...k([44, 96], true),
		],
		flag: 198,
	}),
	{
		id: '8-3',
		world: 8,
		stage: 3,
		theme: 'athletic',
		time: 400,
		width: 210,
		lifts: [
			{ x: 22, y: 8, w: 3, range: 3, speed: 0.022, phase: 0 },
			{ x: 38, y: 6, w: 3, range: 2.2, speed: 0.026, phase: 1.1 },
			{ x: 60, y: 9, w: 3, range: 3, speed: 0.02, phase: 0.3 },
			{ x: 84, y: 7, w: 3, range: 2.8, speed: 0.024, phase: 2 },
			{ x: 108, y: 5, w: 3, range: 3, speed: 0.02, phase: 0.7 },
			{ x: 132, y: 8, w: 3, range: 2.5, speed: 0.023, phase: 1.5 },
			{ x: 156, y: 6, w: 3, range: 3, speed: 0.021, phase: 0.5 },
		],
		platforms: [
			{ x: 0, y: 13, w: 12, fill: true },
			{ x: 30, y: 12, w: 4 },
			{ x: 48, y: 10, w: 4 },
			{ x: 70, y: 12, w: 4 },
			{ x: 94, y: 9, w: 4 },
			{ x: 118, y: 11, w: 4 },
			{ x: 142, y: 12, w: 4 },
			{ x: 176, y: 13, w: 34, fill: true },
		],
		rows: [
			{ x: 6, y: 9, s: 'M' },
			{ x: 50, y: 6, s: '?' },
			{ x: 96, y: 5, s: 'S' },
			{ x: 144, y: 8, s: '??' },
		],
		coins: [
			[32, 10],
			[72, 10],
			[120, 9],
			[180, 10],
		],
		enemies: [
			{ kind: 'paratroopa', x: 32, y: 8, red: true },
			{ kind: 'paratroopa', x: 72, y: 8 },
			{ kind: 'hammerbro', x: 96, y: 9 },
			{ kind: 'paratroopa', x: 144, y: 8, red: true },
		],
		flag: 190,
	},
	{
		id: '8-4',
		world: 8,
		stage: 4,
		theme: 'castle',
		time: 400,
		width: 176,
		ceiling: 3,
		pits: [
			[22, 25],
			[40, 43],
			[58, 61],
			[78, 81],
			[96, 99],
			[114, 117],
		],
		bridge: [136, 162],
		bowser: 146,
		axe: 162,
		firebars: [
			{ x: 14, y: 10, len: 5, speed: 0.05 },
			{ x: 30, y: 9, len: 6, speed: -0.055, angle: 0.6 },
			{ x: 48, y: 10, len: 4, speed: 0.06, angle: 1.5 },
			{ x: 66, y: 9, len: 6, speed: -0.04, angle: 0.2 },
			{ x: 84, y: 10, len: 5, speed: 0.05, angle: 2 },
			{ x: 104, y: 9, len: 6, speed: -0.048, angle: 1 },
			{ x: 122, y: 10, len: 4, speed: 0.055, angle: 0.4 },
		],
		podoboos: [22, 40, 58, 76, 94, 112, 128],
		rows: [
			{ x: 6, y: 9, s: 'M?' },
			{ x: 36, y: 9, s: 'B?' },
			{ x: 70, y: 9, s: 'S' },
		],
		coins: [
			[16, 8],
			[32, 7],
			[50, 8],
			[68, 7],
			[88, 8],
			[108, 7],
			[124, 8],
		],
		enemies: [
			{ kind: 'hammerbro', x: 28 },
			{ kind: 'hammerbro', x: 92 },
			...bz([18, 60, 110]),
		],
	},
];

function resolveWarps(levels) {
	const byId = new Map(levels.map((level, index) => [level.id, index]));
	for (const level of levels) {
		level.warps = level.warps.map((warp) => ({
			...warp,
			to: byId.get(warp.to),
		}));
	}
	return levels;
}

export const LEVELS = resolveWarps(SPECS.map(compile));

export function levelById(id) {
	return LEVELS.find((level) => level.id === id) ?? null;
}
