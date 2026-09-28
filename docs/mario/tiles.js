// Сетка и коды тайлов. Физика живёт в пикселях, карта — в клетках 16×16.
export const TILE = 16;
export const LEVEL_H = 15;
export const GROUND_Y = 13;
export const VIEW_TILES_X = 22;
export const VIEW_TILES_Y = 15;

export const Tile = {
	Empty: 0,
	Solid: 1,
	Brick: 2,
	Question: 3,
	Mushroom: 4,
	Star: 5,
	HiddenCoin: 6,
	HiddenOneUp: 7,
	MultiCoin: 8,
	Used: 9,
	Pipe: 10,
	Platform: 11,
	Bridge: 12,
	Cannon: 13,
	Lava: 14,
	ExitPipe: 15,
};

const SOLID = new Set([
	Tile.Solid,
	Tile.Brick,
	Tile.Question,
	Tile.Mushroom,
	Tile.Star,
	Tile.MultiCoin,
	Tile.Used,
	Tile.Pipe,
	Tile.Platform,
	Tile.Bridge,
	Tile.Cannon,
	Tile.ExitPipe,
]);

export function isSolid(tile) {
	return SOLID.has(tile);
}

export function isHeadBlock(tile) {
	return (
		tile === Tile.Brick ||
		tile === Tile.Question ||
		tile === Tile.Mushroom ||
		tile === Tile.Star ||
		tile === Tile.MultiCoin ||
		tile === Tile.HiddenCoin ||
		tile === Tile.HiddenOneUp
	);
}

export function idx(x, y, w) {
	return y * w + x;
}
