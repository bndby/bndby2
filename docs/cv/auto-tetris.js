class AutoTetris extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.defaultSize = 300;
		this.minSize = 180;
		this.maxSize = 900;

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
		this.ctx = this.canvas.getContext('2d');
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
			if (this.isConnected) {
				this.renderRoot();
				this.ctx = this.canvas.getContext('2d');
			}
			return;
		}

		if (name === 'background') {
			this.background = this.getBackgroundFromAttribute();
		}
	}

	getSizeFromAttribute() {
		const raw = Number.parseInt(this.getAttribute('size') ?? '', 10);
		const normalized = Number.isFinite(raw) ? raw : this.defaultSize;
		return Math.min(this.maxSize, Math.max(this.minSize, normalized));
	}

	getBackgroundFromAttribute() {
		const value = this.getAttribute('background');
		if (!value || !value.trim()) return '#0b1220';
		return value.trim();
	}

	applySize(size) {
		this.size = size;
		this.cell = Math.max(8, Math.round(size / this.rows));
		this.boardWidth = this.cell * this.cols;
		this.boardHeight = this.cell * this.rows;

		// Делаем внешний размер компонента квадратным, как у остальных демо.
		this.width = this.boardHeight;
		this.height = this.boardHeight;
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
				color: '#38bdf8',
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
				color: '#facc15',
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
				color: '#a78bfa',
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
				color: '#34d399',
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
				color: '#fb7185',
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
				color: '#fb923c',
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

	isValidPosition(piece, rotation = piece.rotation, x = piece.x, y = piece.y) {
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
		if (!this.isValidPosition(this.current, this.current.rotation, nx, ny)) return false;
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
			if (!this.isValidPosition(this.current, nextRotation, nx, this.current.y)) continue;
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
			if (cell.y < 0 || cell.y >= this.totalRows || cell.x < 0 || cell.x >= this.cols) return null;
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
		while (this.isValidPosition(this.current, this.current.rotation, this.current.x, y + 1)) y += 1;
		return y;
	}

	drawCell(x, y, color, alpha = 1) {
		const px = x * this.cell;
		const py = (y - this.hiddenRows) * this.cell;
		if (py < 0 || py >= this.boardHeight) return;

		this.ctx.globalAlpha = alpha;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(px + 1, py + 1, this.cell - 2, this.cell - 2);
		this.ctx.strokeStyle = 'rgba(255,255,255,0.18)';
		this.ctx.strokeRect(px + 1.5, py + 1.5, this.cell - 3, this.cell - 3);
		this.ctx.globalAlpha = 1;
	}

	drawGrid() {
		this.ctx.strokeStyle = 'rgba(148,163,184,0.14)';
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
			for (const cell of ghostCells) this.drawCell(cell.x, cell.y, '#94a3b8', 0.2);
		}

		const cells = this.getCells(this.current);
		for (const cell of cells) this.drawCell(cell.x, cell.y, this.current.color, 1);
	}

	drawPanel() {
		const panelX = this.boardWidth;
		this.ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
		this.ctx.fillRect(panelX, 0, this.panelWidth, this.height);
		this.ctx.strokeStyle = 'rgba(148,163,184,0.35)';
		this.ctx.beginPath();
		this.ctx.moveTo(panelX + 0.5, 0);
		this.ctx.lineTo(panelX + 0.5, this.height);
		this.ctx.stroke();

		this.ctx.fillStyle = '#e2e8f0';
		this.ctx.font = `${this.fontMain}px monospace`;
		this.ctx.fillText('AUTO', panelX + 8, this.fontMain + 6);
		this.ctx.fillText('TETRIS', panelX + 8, this.fontMain * 2 + 7);

		this.ctx.font = `${this.fontSub}px monospace`;
		this.ctx.fillStyle = '#cbd5e1';
		this.ctx.fillText(`Score ${this.score}`, panelX + 8, this.fontMain * 3 + 18);
		this.ctx.fillText(`Lines ${this.lines}`, panelX + 8, this.fontMain * 4 + 20);
		this.ctx.fillText(`Lvl ${this.level}`, panelX + 8, this.fontMain * 5 + 22);
		this.ctx.fillText(`Pc ${this.pieces}`, panelX + 8, this.fontMain * 6 + 24);

	}

	drawGameOver() {
		if (!this.gameOver) return;
		this.ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
		this.ctx.fillRect(0, this.height * 0.42, this.boardWidth, this.cell * 3);
		this.ctx.fillStyle = '#f8fafc';
		this.ctx.font = `${Math.max(13, Math.floor(this.cell * 0.92))}px monospace`;
		this.ctx.fillText('RESTARTING...', Math.max(8, this.cell), this.height * 0.42 + this.cell * 1.8);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.width, this.height);

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
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: ${this.width}px;
          height: ${this.height}px;
          box-sizing: border-box;
        }

        canvas {
          display: block;
          width: ${this.width}px;
          height: ${this.height}px;
          border: 1px solid #334155;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(2, 6, 23, 0.3);
          image-rendering: auto;
        }
      </style>
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
	}
}

customElements.define('auto-tetris', AutoTetris);
