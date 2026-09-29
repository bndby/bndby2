import {
	FRAME,
	clampSize,
	paintBanner,
	paintBlock,
	paintCabinet,
	readBackground,
	renderFrame,
} from './game-frame.js';

class AutoTetris extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.cols = 10;
		this.rows = 20;
		this.hiddenRows = 2;
		this.totalRows = this.rows + this.hiddenRows;

		this.running = false;
		this.rafId = null;
		this.lastTime = 0;

		this.gravityIntervalMs = 460;
		this.aiStepIntervalMs = 112;
		this.lockDelayMs = 120;
		this.restartDelayMs = 900;
		this.pendingRestartMs = 0;

		this.applySize(this.getSizeFromAttribute());
		this.background = this.getBackgroundFromAttribute();
		this.initGame();
	}

	connectedCallback() {
		this.renderRoot();
		this.running = true;
		this.lastTime = performance.now();
		this.rafId = requestAnimationFrame((ts) => this.loop(ts));
	}

	disconnectedCallback() {
		this.running = false;
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		if (name === 'size') {
			const nextSize = this.getSizeFromAttribute();
			if (nextSize === this.size) return;
			this.applySize(nextSize);
			this.initGame();
			if (this.isConnected) this.renderRoot();
			return;
		}

		if (name === 'background') {
			this.background = this.getBackgroundFromAttribute();
		}
	}

	getSizeFromAttribute() {
		return clampSize(this.getAttribute('size'));
	}

	getBackgroundFromAttribute() {
		return readBackground(this.getAttribute('background'));
	}

	applySize(size) {
		this.size = size;
		this.width = size;
		this.height = size;
		this.cell = size / this.rows;
		this.boardWidth = this.cell * this.cols;
		this.boardHeight = size;
		this.panelWidth = this.width - this.boardWidth;

		this.fontMain = Math.max(11, Math.floor(this.cell * 0.72));
		this.fontSub = Math.max(10, Math.floor(this.cell * 0.58));
	}

	initGame() {
		this.grid = this.createGrid();
		this.lines = 0;
		this.score = 0;
		this.level = 1;
		this.pieces = 0;
		this.gameOver = false;

		this.gravityAccum = 0;
		this.aiAccum = 0;
		this.lockAccum = 0;
		this.pendingRestartMs = 0;

		this.bag = [];
		this.current = null;
		this.next = this.pickFromBag();
		this.aiPlan = null;

		this.spawnPiece();
	}

	createGrid() {
		const grid = [];
		for (let y = 0; y < this.totalRows; y += 1) {
			const row = new Array(this.cols).fill(0);
			grid.push(row);
		}
		return grid;
	}

	getPieceCatalog() {
		return {
			I: {
				color: FRAME.player,
				rotations: [
					[
						[0, 1],
						[1, 1],
						[2, 1],
						[3, 1],
					],
					[
						[2, 0],
						[2, 1],
						[2, 2],
						[2, 3],
					],
					[
						[0, 2],
						[1, 2],
						[2, 2],
						[3, 2],
					],
					[
						[1, 0],
						[1, 1],
						[1, 2],
						[1, 3],
					],
				],
			},
			O: {
				color: FRAME.gold,
				rotations: [
					[
						[1, 0],
						[2, 0],
						[1, 1],
						[2, 1],
					],
				],
			},
			T: {
				color: FRAME.violet,
				rotations: [
					[
						[1, 0],
						[0, 1],
						[1, 1],
						[2, 1],
					],
					[
						[1, 0],
						[1, 1],
						[2, 1],
						[1, 2],
					],
					[
						[0, 1],
						[1, 1],
						[2, 1],
						[1, 2],
					],
					[
						[1, 0],
						[0, 1],
						[1, 1],
						[1, 2],
					],
				],
			},
			S: {
				color: FRAME.mint,
				rotations: [
					[
						[1, 0],
						[2, 0],
						[0, 1],
						[1, 1],
					],
					[
						[1, 0],
						[1, 1],
						[2, 1],
						[2, 2],
					],
					[
						[1, 1],
						[2, 1],
						[0, 2],
						[1, 2],
					],
					[
						[0, 0],
						[0, 1],
						[1, 1],
						[1, 2],
					],
				],
			},
			Z: {
				color: FRAME.enemy,
				rotations: [
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[2, 1],
					],
					[
						[2, 0],
						[1, 1],
						[2, 1],
						[1, 2],
					],
					[
						[0, 1],
						[1, 1],
						[1, 2],
						[2, 2],
					],
					[
						[1, 0],
						[0, 1],
						[1, 1],
						[0, 2],
					],
				],
			},
			J: {
				color: '#60a5fa',
				rotations: [
					[
						[0, 0],
						[0, 1],
						[1, 1],
						[2, 1],
					],
					[
						[1, 0],
						[2, 0],
						[1, 1],
						[1, 2],
					],
					[
						[0, 1],
						[1, 1],
						[2, 1],
						[2, 2],
					],
					[
						[1, 0],
						[1, 1],
						[0, 2],
						[1, 2],
					],
				],
			},
			L: {
				color: FRAME.amber,
				rotations: [
					[
						[2, 0],
						[0, 1],
						[1, 1],
						[2, 1],
					],
					[
						[1, 0],
						[1, 1],
						[1, 2],
						[2, 2],
					],
					[
						[0, 1],
						[1, 1],
						[2, 1],
						[0, 2],
					],
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[1, 2],
					],
				],
			},
		};
	}

	pickFromBag() {
		if (!this.catalog) this.catalog = this.getPieceCatalog();
		if (this.bag.length === 0) {
			this.bag = Object.keys(this.catalog);
			for (let i = this.bag.length - 1; i > 0; i -= 1) {
				const j = Math.floor(Math.random() * (i + 1));
				const tmp = this.bag[i];
				this.bag[i] = this.bag[j];
				this.bag[j] = tmp;
			}
		}
		return this.bag.pop();
	}

	createPiece(type) {
		const blueprint = this.catalog[type];
		return {
			type,
			color: blueprint.color,
			rotation: 0,
			x: 3,
			y: 0,
		};
	}

	getCells(piece, rotation = piece.rotation, x = piece.x, y = piece.y) {
		const rotations = this.catalog[piece.type].rotations;
		const shape = rotations[rotation % rotations.length];
		return shape.map(([dx, dy]) => ({ x: x + dx, y: y + dy }));
	}

	isValidPosition(
		piece,
		rotation = piece.rotation,
		x = piece.x,
		y = piece.y,
	) {
		const cells = this.getCells(piece, rotation, x, y);
		for (const cell of cells) {
			if (cell.x < 0 || cell.x >= this.cols) return false;
			if (cell.y >= this.totalRows) return false;
			if (cell.y >= 0 && this.grid[cell.y][cell.x]) return false;
		}
		return true;
	}

	tryMove(dx, dy) {
		if (!this.current) return false;
		const nx = this.current.x + dx;
		const ny = this.current.y + dy;
		if (!this.isValidPosition(this.current, this.current.rotation, nx, ny))
			return false;
		this.current.x = nx;
		this.current.y = ny;
		return true;
	}

	tryRotate() {
		if (!this.current) return false;
		const total = this.catalog[this.current.type].rotations.length;
		const nextRotation = (this.current.rotation + 1) % total;
		const kicks = [0, -1, 1, -2, 2];
		for (const kick of kicks) {
			const nx = this.current.x + kick;
			if (
				!this.isValidPosition(
					this.current,
					nextRotation,
					nx,
					this.current.y,
				)
			)
				continue;
			this.current.rotation = nextRotation;
			this.current.x = nx;
			return true;
		}
		return false;
	}

	hardDrop() {
		if (!this.current) return;
		while (this.tryMove(0, 1)) {
			// empty
		}
		this.lockPiece();
	}

	lockPiece() {
		if (!this.current) return;
		const cells = this.getCells(this.current);
		for (const cell of cells) {
			if (cell.y < 0) {
				this.gameOver = true;
				this.pendingRestartMs = this.restartDelayMs;
				return;
			}
			this.grid[cell.y][cell.x] = this.current.color;
		}

		const cleared = this.clearLines();
		this.pieces += 1;
		this.score += this.getLineScore(cleared);
		this.lines += cleared;
		this.level = 1 + Math.floor(this.lines / 10);
		this.gravityIntervalMs = Math.max(144, 460 - (this.level - 1) * 22);

		this.spawnPiece();
	}

	getLineScore(lines) {
		if (lines === 1) return 100;
		if (lines === 2) return 300;
		if (lines === 3) return 500;
		if (lines >= 4) return 800;
		return 0;
	}

	clearLines() {
		let cleared = 0;
		for (let y = this.totalRows - 1; y >= 0; y -= 1) {
			let full = true;
			for (let x = 0; x < this.cols; x += 1) {
				if (this.grid[y][x]) continue;
				full = false;
				break;
			}
			if (!full) continue;
			this.grid.splice(y, 1);
			this.grid.unshift(new Array(this.cols).fill(0));
			cleared += 1;
			y += 1;
		}
		return cleared;
	}

	spawnPiece() {
		const nextType = this.next ?? this.pickFromBag();
		this.current = this.createPiece(nextType);
		this.next = this.pickFromBag();
		this.aiPlan = this.buildAiPlan();
		this.lockAccum = 0;

		if (!this.isValidPosition(this.current)) {
			this.gameOver = true;
			this.pendingRestartMs = this.restartDelayMs;
		}
	}

	buildAiPlan() {
		if (!this.current) return null;
		const piece = this.current;
		const rotations = this.catalog[piece.type].rotations.length;
		let best = null;

		for (let rot = 0; rot < rotations; rot += 1) {
			for (let x = -2; x < this.cols + 2; x += 1) {
				let y = -3;
				if (!this.isValidPosition(piece, rot, x, y)) continue;
				while (this.isValidPosition(piece, rot, x, y + 1)) y += 1;
				const evalResult = this.evaluatePlacement(piece, rot, x, y);
				if (!evalResult) continue;
				if (!best || evalResult.score > best.score) {
					best = {
						score: evalResult.score,
						targetX: x,
						targetRotation: rot,
						dropY: y,
					};
				}
			}
		}

		if (!best) {
			return {
				targetX: piece.x,
				targetRotation: piece.rotation,
				dropY: piece.y,
			};
		}
		return best;
	}

	evaluatePlacement(piece, rotation, x, y) {
		const sim = this.grid.map((row) => row.slice());
		const cells = this.getCells(piece, rotation, x, y);
		for (const cell of cells) {
			if (
				cell.y < 0 ||
				cell.y >= this.totalRows ||
				cell.x < 0 ||
				cell.x >= this.cols
			)
				return null;
			sim[cell.y][cell.x] = piece.color;
		}

		let lines = 0;
		for (let row = this.totalRows - 1; row >= 0; row -= 1) {
			let full = true;
			for (let col = 0; col < this.cols; col += 1) {
				if (sim[row][col]) continue;
				full = false;
				break;
			}
			if (!full) continue;
			sim.splice(row, 1);
			sim.unshift(new Array(this.cols).fill(0));
			lines += 1;
			row += 1;
		}

		let aggregateHeight = 0;
		let holes = 0;
		let bumpiness = 0;
		let maxHeight = 0;
		let prevHeight = null;

		for (let xCol = 0; xCol < this.cols; xCol += 1) {
			let top = this.totalRows;
			for (let yRow = 0; yRow < this.totalRows; yRow += 1) {
				if (!sim[yRow][xCol]) continue;
				top = yRow;
				break;
			}
			const height = this.totalRows - top;
			aggregateHeight += height;
			if (height > maxHeight) maxHeight = height;

			if (top < this.totalRows) {
				for (let yRow = top + 1; yRow < this.totalRows; yRow += 1) {
					if (sim[yRow][xCol]) continue;
					holes += 1;
				}
			}

			if (prevHeight !== null) bumpiness += Math.abs(height - prevHeight);
			prevHeight = height;
		}

		// Классическая оценка с акцентом на линии и минимизацию дыр.
		const score =
			lines * 1.35 -
			aggregateHeight * 0.06 -
			holes * 0.75 -
			bumpiness * 0.21 -
			maxHeight * 0.03;
		return { score };
	}

	updateAiStep() {
		if (!this.current || this.gameOver) return;
		if (!this.aiPlan) {
			this.aiPlan = this.buildAiPlan();
			if (!this.aiPlan) return;
		}

		if (this.current.rotation !== this.aiPlan.targetRotation) {
			this.tryRotate();
			return;
		}

		if (this.current.x < this.aiPlan.targetX) {
			this.tryMove(1, 0);
			return;
		}
		if (this.current.x > this.aiPlan.targetX) {
			this.tryMove(-1, 0);
			return;
		}

		// После выравнивания по позиции просто ждем естественного падения.
	}

	updateGravity(dtMs) {
		if (!this.current || this.gameOver) return;
		this.gravityAccum += dtMs;
		while (this.gravityAccum >= this.gravityIntervalMs) {
			this.gravityAccum -= this.gravityIntervalMs;
			if (this.tryMove(0, 1)) {
				this.lockAccum = 0;
				continue;
			}
			this.lockAccum += this.gravityIntervalMs;
			if (this.lockAccum >= this.lockDelayMs) {
				this.lockPiece();
				this.lockAccum = 0;
				break;
			}
		}
	}

	update(dtMs) {
		if (this.gameOver) {
			this.pendingRestartMs -= dtMs;
			if (this.pendingRestartMs <= 0) this.initGame();
			return;
		}

		this.aiAccum += dtMs;
		while (this.aiAccum >= this.aiStepIntervalMs) {
			this.aiAccum -= this.aiStepIntervalMs;
			this.updateAiStep();
			if (this.gameOver) return;
		}

		this.updateGravity(dtMs);
	}

	getGhostY() {
		if (!this.current) return null;
		let y = this.current.y;
		while (
			this.isValidPosition(
				this.current,
				this.current.rotation,
				this.current.x,
				y + 1,
			)
		)
			y += 1;
		return y;
	}

	paintCell(px, py, size, color, alpha = 1) {
		const pad = Math.max(0.6, size * 0.08);
		this.ctx.save();
		this.ctx.globalAlpha = alpha;
		paintBlock(
			this.ctx,
			px + pad,
			py + pad,
			size - pad * 2,
			size - pad * 2,
			color,
			Math.max(1.5, size * 0.16),
		);
		this.ctx.restore();
	}

	drawCell(x, y, color, alpha = 1) {
		const px = x * this.cell;
		const py = (y - this.hiddenRows) * this.cell;
		if (py + this.cell <= 0 || py >= this.boardHeight) return;
		this.paintCell(px, py, this.cell, color, alpha);
	}

	drawGrid() {
		this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
		this.ctx.lineWidth = 1;
		for (let x = 1; x < this.cols; x += 1) {
			const px = x * this.cell + 0.5;
			this.ctx.beginPath();
			this.ctx.moveTo(px, 0);
			this.ctx.lineTo(px, this.boardHeight);
			this.ctx.stroke();
		}
		for (let y = 1; y < this.rows; y += 1) {
			const py = y * this.cell + 0.5;
			this.ctx.beginPath();
			this.ctx.moveTo(0, py);
			this.ctx.lineTo(this.boardWidth, py);
			this.ctx.stroke();
		}
	}

	drawBoard() {
		for (let y = this.hiddenRows; y < this.totalRows; y += 1) {
			for (let x = 0; x < this.cols; x += 1) {
				const color = this.grid[y][x];
				if (!color) continue;
				this.drawCell(x, y, color, 1);
			}
		}
	}

	drawCurrentPiece() {
		if (!this.current) return;

		const ghostY = this.getGhostY();
		if (ghostY !== null) {
			const ghostCells = this.getCells(
				this.current,
				this.current.rotation,
				this.current.x,
				ghostY,
			);
			for (const cell of ghostCells)
				this.drawCell(cell.x, cell.y, '#94a3b8', 0.2);
		}

		const cells = this.getCells(this.current);
		for (const cell of cells)
			this.drawCell(cell.x, cell.y, this.current.color, 1);
	}

	drawPanel() {
		const panelX = this.boardWidth;
		this.ctx.fillStyle = 'rgba(8, 15, 30, 0.72)';
		this.ctx.fillRect(panelX, 0, this.panelWidth, this.height);
		this.ctx.strokeStyle = FRAME.line;
		this.ctx.beginPath();
		this.ctx.moveTo(panelX + 0.5, 0);
		this.ctx.lineTo(panelX + 0.5, this.height);
		this.ctx.stroke();

		const pad = Math.max(8, this.cell * 0.7);
		this.ctx.fillStyle = '#7dd3fc';
		this.ctx.font = `${this.fontMain}px ${FRAME.font}`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'alphabetic';
		this.ctx.fillText('TETRIS', panelX + pad, this.fontMain + pad);

		this.ctx.font = `${this.fontSub}px ${FRAME.font}`;
		this.ctx.fillStyle = FRAME.ink;
		const stats = [
			`Score ${this.score}`,
			`Lines ${this.lines}`,
			`Lvl ${this.level}`,
			`Pcs ${this.pieces}`,
		];
		stats.forEach((line, index) => {
			this.ctx.fillText(
				line,
				panelX + pad,
				this.fontMain + pad + this.fontSub * (index + 1) * 1.45 + 8,
			);
		});

		this.ctx.fillStyle = FRAME.muted;
		this.ctx.fillText(
			'NEXT',
			panelX + pad,
			this.height - this.cell * 4.2,
		);
		this.drawNextPiece();
	}

	drawNextPiece() {
		if (!this.next || !this.catalog) return;
		const shape = this.catalog[this.next].rotations[0];
		const color = this.catalog[this.next].color;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const [x, y] of shape) {
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
		const cols = maxX - minX + 1;
		const rows = maxY - minY + 1;
		const cell = Math.min(this.cell * 0.78, (this.panelWidth - 16) / 4);
		const originX = this.boardWidth + (this.panelWidth - cols * cell) / 2;
		const originY = this.height - (rows + 0.7) * cell;
		for (const [x, y] of shape) {
			this.paintCell(
				originX + (x - minX) * cell,
				originY + (y - minY) * cell,
				cell,
				color,
				1,
			);
		}
	}

	drawGameOver() {
		if (!this.gameOver) return;
		const h = this.cell * 2.4;
		paintBanner(
			this.ctx,
			this.boardWidth,
			this.height * 0.42,
			h,
			'RESTARTING',
		);
	}

	draw() {
		paintCabinet(this.ctx, this.width, this.height, this.background);
		this.drawGrid();
		this.drawBoard();
		this.drawCurrentPiece();
		this.drawPanel();
		this.drawGameOver();
	}

	loop(timestamp) {
		if (!this.running) return;
		const dt = Math.max(0, Math.min(100, timestamp - this.lastTime));
		this.lastTime = timestamp;
		this.update(dt);
		this.draw();
		this.rafId = requestAnimationFrame((ts) => this.loop(ts));
	}

	renderRoot() {
		const view = renderFrame(this.shadowRoot, this.width, this.height);
		this.canvas = view.canvas;
		this.ctx = view.ctx;
	}
}

customElements.define('auto-tetris', AutoTetris);
