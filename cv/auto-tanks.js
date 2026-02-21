class AutoTanks extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.defaultSize = 360;
		this.minSize = 220;
		this.maxSize = 900;

		this.running = false;
		this.rafId = null;
		this.lastTime = 0;

		this.worldUnits = 22;
		this.cell = 12;

		this.enemiesCount = 4;
		this.maxProjectiles = 40;
		this.timeScale = 0.5;

		this.applySize(this.getSizeFromAttribute());
		this.background = this.getBackgroundFromAttribute();
		this.createWorld();
	}

	connectedCallback() {
		this.renderRoot();
		this.ctx = this.canvas.getContext('2d');
		this.running = true;
		this.lastTime = performance.now();
		this.rafId = requestAnimationFrame((t) => this.loop(t));
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
			this.createWorld();
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
		const rawSize = Number.parseInt(this.getAttribute('size') ?? '', 10);
		const normalized = Number.isFinite(rawSize) ? rawSize : this.defaultSize;
		return Math.min(this.maxSize, Math.max(this.minSize, normalized));
	}

	getBackgroundFromAttribute() {
		const value = this.getAttribute('background');
		if (!value || !value.trim()) return '#0f172a';
		return value.trim();
	}

	applySize(size) {
		this.size = size;
		this.cell = Math.max(8, Math.floor(size / this.worldUnits));
		this.width = this.cell * this.worldUnits;
		this.height = this.cell * this.worldUnits;

		this.tankSize = this.cell * 0.94;
		this.halfTank = this.tankSize * 0.5;
		this.tankSpeed = this.cell * 4.4;
		this.tankTurnCooldown = 0.14;
		this.barrelLen = this.tankSize * 0.72;

		this.projectileRadius = Math.max(2, this.cell * 0.19);
		this.projectileSpeed = this.cell * 10.5;
		this.projectileTTL = 2.6;
		this.fireCooldownMin = 0.35;
		this.fireCooldownMax = 0.85;

		this.explosionTTL = 0.2;
	}

	createWorld() {
		this.gridSize = this.worldUnits;
		this.walls = this.generateWalls(this.gridSize);
		this.projectiles = [];
		this.explosions = [];
		this.kills = 0;

		const occupied = new Set();
		this.player = this.createTank('player', occupied, 3, 'player');
		this.enemies = [];
		for (let i = 0; i < this.enemiesCount; i += 1) {
			this.enemies.push(this.createTank(`enemy-${i}`, occupied, 2, 'enemy'));
		}
	}

	generateWalls(gridSize) {
		const walls = [];
		const center = Math.floor(gridSize / 2);
		for (let y = 0; y < gridSize; y += 1) {
			const row = [];
			for (let x = 0; x < gridSize; x += 1) {
				let value = 0;
				const border = x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1;
				if (border) {
					value = 1;
				} else if (x % 2 === 0 && y % 2 === 0 && Math.random() < 0.52) {
					value = 1;
				} else if (Math.random() < 0.11) {
					value = 1;
				}
				row.push(value);
			}
			walls.push(row);
		}

		// Keep a cross-shaped corridor so bots can navigate.
		for (let i = 1; i < gridSize - 1; i += 1) {
			walls[center][i] = 0;
			walls[i][center] = 0;
		}

		return walls;
	}

	getSpawnZone(team) {
		// Игрок появляется внизу, враги — вверху поля.
		const playableTop = 1;
		const playableBottom = this.gridSize - 2;
		if (team === 'player') {
			return {
				minY: Math.max(playableTop, Math.floor(this.gridSize * 0.72)),
				maxY: playableBottom,
				dir: 'up',
			};
		}
		return {
			minY: playableTop,
			maxY: Math.min(playableBottom, Math.floor(this.gridSize * 0.28)),
			dir: 'down',
		};
	}

	randomInt(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	createTank(id, occupied, clearRadius, team = 'enemy') {
		const spawnZone = this.getSpawnZone(team);
		const maxTries = 200;
		for (let i = 0; i < maxTries; i += 1) {
			const gx = 1 + Math.floor(Math.random() * (this.gridSize - 2));
			const gy = this.randomInt(spawnZone.minY, spawnZone.maxY);
			const key = `${gx}:${gy}`;
			if (occupied.has(key)) continue;
			if (!this.isAreaFree(gx, gy, clearRadius)) continue;

			occupied.add(key);
			this.clearArea(gx, gy, clearRadius);

			return {
				id,
				alive: true,
				gx,
				gy,
				x: (gx + 0.5) * this.cell,
				y: (gy + 0.5) * this.cell,
				dir: spawnZone.dir,
				moveDecisionT: 0,
				fireCooldown: this.randomRange(this.fireCooldownMin, this.fireCooldownMax),
				turnCooldown: 0,
				color: id === 'player' ? '#38bdf8' : '#f97316',
			};
		}

		// Fallback deterministic placement.
		const gx = 1 + (occupied.size % (this.gridSize - 2));
		const spawnHeight = Math.max(1, spawnZone.maxY - spawnZone.minY + 1);
		const gy = spawnZone.minY + (Math.floor(occupied.size / (this.gridSize - 2)) % spawnHeight);
		const key = `${gx}:${gy}`;
		occupied.add(key);
		this.clearArea(gx, gy, clearRadius);
		return {
			id,
			alive: true,
			gx,
			gy,
			x: (gx + 0.5) * this.cell,
			y: (gy + 0.5) * this.cell,
			dir: spawnZone.dir,
			moveDecisionT: 0,
			fireCooldown: this.randomRange(this.fireCooldownMin, this.fireCooldownMax),
			turnCooldown: 0,
			color: id === 'player' ? '#38bdf8' : '#f97316',
		};
	}

	isAreaFree(cx, cy, r) {
		for (let y = cy - r; y <= cy + r; y += 1) {
			for (let x = cx - r; x <= cx + r; x += 1) {
				if (!this.inBounds(x, y)) return false;
				if (this.walls[y][x] === 1) return false;
			}
		}
		return true;
	}

	clearArea(cx, cy, r) {
		for (let y = cy - r; y <= cy + r; y += 1) {
			for (let x = cx - r; x <= cx + r; x += 1) {
				if (this.inBounds(x, y)) this.walls[y][x] = 0;
			}
		}
	}

	inBounds(x, y) {
		return x >= 0 && y >= 0 && x < this.gridSize && y < this.gridSize;
	}

	randomDir() {
		const dirs = ['up', 'right', 'down', 'left'];
		return dirs[Math.floor(Math.random() * dirs.length)];
	}

	randomRange(min, max) {
		return min + Math.random() * (max - min);
	}

	dirToVector(dir) {
		if (dir === 'up') return { x: 0, y: -1 };
		if (dir === 'right') return { x: 1, y: 0 };
		if (dir === 'down') return { x: 0, y: 1 };
		return { x: -1, y: 0 };
	}

	tankRectAt(x, y) {
		return {
			left: x - this.halfTank,
			right: x + this.halfTank,
			top: y - this.halfTank,
			bottom: y + this.halfTank,
		};
	}

	gridRect(gx, gy) {
		return {
			left: gx * this.cell,
			right: (gx + 1) * this.cell,
			top: gy * this.cell,
			bottom: (gy + 1) * this.cell,
		};
	}

	rectsOverlap(a, b) {
		return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
	}

	wallCollisionForRect(rect) {
		const minX = Math.floor(rect.left / this.cell);
		const maxX = Math.floor((rect.right - 0.001) / this.cell);
		const minY = Math.floor(rect.top / this.cell);
		const maxY = Math.floor((rect.bottom - 0.001) / this.cell);
		for (let gy = minY; gy <= maxY; gy += 1) {
			for (let gx = minX; gx <= maxX; gx += 1) {
				if (!this.inBounds(gx, gy)) return true;
				if (this.walls[gy][gx] !== 1) continue;
				if (this.rectsOverlap(rect, this.gridRect(gx, gy))) return true;
			}
		}
		return false;
	}

	canMoveTank(tank, nx, ny) {
		const rect = this.tankRectAt(nx, ny);
		if (this.wallCollisionForRect(rect)) return false;

		const others = [this.player, ...this.enemies];
		for (const other of others) {
			if (!other.alive || other.id === tank.id) continue;
			const otherRect = this.tankRectAt(other.x, other.y);
			if (this.rectsOverlap(rect, otherRect)) return false;
		}
		return true;
	}

	tryMoveTank(tank, dt) {
		if (!tank.alive) return false;
		const v = this.dirToVector(tank.dir);
		const step = this.tankSpeed * dt;
		const nx = tank.x + v.x * step;
		const ny = tank.y + v.y * step;
		if (!this.canMoveTank(tank, nx, ny)) return false;

		tank.x = nx;
		tank.y = ny;
		tank.gx = Math.floor(tank.x / this.cell);
		tank.gy = Math.floor(tank.y / this.cell);
		return true;
	}

	shouldShoot(tank, opponents) {
		const v = this.dirToVector(tank.dir);
		const aheadX = tank.x + v.x * this.cell * 0.5;
		const aheadY = tank.y + v.y * this.cell * 0.5;

		// Fire if an opponent is in the same row/column and no wall blocks sight.
		for (const target of opponents) {
			if (!target.alive) continue;
			const dx = target.x - tank.x;
			const dy = target.y - tank.y;

			if (v.x !== 0 && Math.abs(dy) > this.cell * 0.45) continue;
			if (v.y !== 0 && Math.abs(dx) > this.cell * 0.45) continue;
			if (v.x === 1 && dx <= 0) continue;
			if (v.x === -1 && dx >= 0) continue;
			if (v.y === 1 && dy <= 0) continue;
			if (v.y === -1 && dy >= 0) continue;

			if (!this.lineBlockedByWall(tank.x, tank.y, target.x, target.y)) return true;
		}

		// Opportunistic fire to clear wall in front.
		const gx = Math.floor(aheadX / this.cell);
		const gy = Math.floor(aheadY / this.cell);
		return this.inBounds(gx, gy) && this.walls[gy][gx] === 1;
	}

	lineBlockedByWall(x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dist = Math.hypot(dx, dy);
		if (dist < 0.0001) return false;
		const steps = Math.ceil(dist / (this.cell * 0.25));
		for (let i = 1; i < steps; i += 1) {
			const t = i / steps;
			const px = x1 + dx * t;
			const py = y1 + dy * t;
			const gx = Math.floor(px / this.cell);
			const gy = Math.floor(py / this.cell);
			if (!this.inBounds(gx, gy)) return true;
			if (this.walls[gy][gx] === 1) return true;
		}
		return false;
	}

	fireProjectile(tank) {
		if (!tank.alive) return;
		if (this.projectiles.length >= this.maxProjectiles) return;
		const v = this.dirToVector(tank.dir);
		this.projectiles.push({
			x: tank.x + v.x * (this.halfTank + this.projectileRadius + 1),
			y: tank.y + v.y * (this.halfTank + this.projectileRadius + 1),
			vx: v.x * this.projectileSpeed,
			vy: v.y * this.projectileSpeed,
			r: this.projectileRadius,
			ownerId: tank.id,
			ttl: this.projectileTTL,
		});
	}

	chooseDirection(tank, opponents) {
		const dirs = ['up', 'right', 'down', 'left'];
		const candidates = [];
		for (const dir of dirs) {
			const v = this.dirToVector(dir);
			const probeX = tank.x + v.x * this.cell * 0.8;
			const probeY = tank.y + v.y * this.cell * 0.8;
			if (!this.canMoveTank(tank, probeX, probeY)) continue;

			let minDist = Infinity;
			for (const target of opponents) {
				if (!target.alive) continue;
				const d = Math.hypot(target.x - tank.x, target.y - tank.y);
				if (d < minDist) minDist = d;
			}

			candidates.push({ dir, score: minDist + Math.random() * this.cell * 2 });
		}

		if (candidates.length === 0) {
			tank.dir = this.randomDir();
			return;
		}

		candidates.sort((a, b) => a.score - b.score);
		// Keep movement varied but still purposeful.
		const idx = Math.min(candidates.length - 1, Math.floor(Math.random() * Math.min(2, candidates.length)));
		tank.dir = candidates[idx].dir;
	}

	updateTankAI(tank, opponents, dt) {
		if (!tank.alive) return;

		tank.moveDecisionT -= dt;
		tank.turnCooldown = Math.max(0, tank.turnCooldown - dt);
		tank.fireCooldown -= dt;

		if (tank.moveDecisionT <= 0) {
			this.chooseDirection(tank, opponents);
			tank.moveDecisionT = this.randomRange(0.18, 0.52);
		}

		const moved = this.tryMoveTank(tank, dt);
		if (!moved && tank.turnCooldown <= 0) {
			this.chooseDirection(tank, opponents);
			tank.turnCooldown = this.tankTurnCooldown;
		}

		if (tank.fireCooldown <= 0 && this.shouldShoot(tank, opponents)) {
			this.fireProjectile(tank);
			tank.fireCooldown = this.randomRange(this.fireCooldownMin, this.fireCooldownMax);
		}
	}

	projectileHitWall(projectile) {
		const gx = Math.floor(projectile.x / this.cell);
		const gy = Math.floor(projectile.y / this.cell);
		if (!this.inBounds(gx, gy)) return true;
		if (this.walls[gy][gx] !== 1) return false;
		this.walls[gy][gx] = 0;
		this.explosions.push({ x: projectile.x, y: projectile.y, ttl: this.explosionTTL });
		return true;
	}

	projectileHitTank(projectile, tank) {
		if (!tank.alive) return false;
		if (tank.id === projectile.ownerId) return false;
		const rect = this.tankRectAt(tank.x, tank.y);
		const nearestX = Math.max(rect.left, Math.min(projectile.x, rect.right));
		const nearestY = Math.max(rect.top, Math.min(projectile.y, rect.bottom));
		const dx = projectile.x - nearestX;
		const dy = projectile.y - nearestY;
		if (dx * dx + dy * dy > projectile.r * projectile.r) return false;

		tank.alive = false;
		this.explosions.push({ x: tank.x, y: tank.y, ttl: this.explosionTTL * 2 });
		if (projectile.ownerId === this.player.id && tank.id !== this.player.id) this.kills += 1;
		return true;
	}

	handleProjectileVsProjectile() {
		const alive = new Array(this.projectiles.length).fill(true);
		for (let i = 0; i < this.projectiles.length; i += 1) {
			if (!alive[i]) continue;
			for (let j = i + 1; j < this.projectiles.length; j += 1) {
				if (!alive[j]) continue;
				const a = this.projectiles[i];
				const b = this.projectiles[j];
				if (a.ownerId === b.ownerId) continue;
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const rr = a.r + b.r;
				if (dx * dx + dy * dy > rr * rr) continue;
				alive[i] = false;
				alive[j] = false;
				const cx = (a.x + b.x) * 0.5;
				const cy = (a.y + b.y) * 0.5;
				this.explosions.push({ x: cx, y: cy, ttl: this.explosionTTL });
				break;
			}
		}
		this.projectiles = this.projectiles.filter((_, idx) => alive[idx]);
	}

	updateProjectiles(dt) {
		const next = [];
		for (const projectile of this.projectiles) {
			projectile.ttl -= dt;
			if (projectile.ttl <= 0) continue;

			const step = this.cell * 0.18;
			const dist = Math.hypot(projectile.vx * dt, projectile.vy * dt);
			const n = Math.max(1, Math.ceil(dist / step));
			const sx = (projectile.vx * dt) / n;
			const sy = (projectile.vy * dt) / n;

			let destroyed = false;
			for (let i = 0; i < n; i += 1) {
				projectile.x += sx;
				projectile.y += sy;

				if (this.projectileHitWall(projectile)) {
					destroyed = true;
					break;
				}

				const allTanks = [this.player, ...this.enemies];
				for (const tank of allTanks) {
					if (!this.projectileHitTank(projectile, tank)) continue;
					destroyed = true;
					break;
				}
				if (destroyed) break;
			}

			if (!destroyed) next.push(projectile);
		}

		this.projectiles = next;
		this.handleProjectileVsProjectile();
	}

	updateExplosions(dt) {
		for (const explosion of this.explosions) explosion.ttl -= dt;
		this.explosions = this.explosions.filter((e) => e.ttl > 0);
	}

	respawnIfNeeded(dt) {
		this.respawnTimer = (this.respawnTimer ?? 0) - dt;
		if (this.player.alive && this.enemies.some((e) => e.alive)) return;
		if (this.respawnTimer > 0) return;
		this.respawnTimer = 1.2;

		const occupied = new Set();
		if (!this.player.alive) this.player = this.createTank('player', occupied, 3, 'player');
		for (let i = 0; i < this.enemies.length; i += 1) {
			if (this.enemies[i].alive) {
				const gx = Math.floor(this.enemies[i].x / this.cell);
				const gy = Math.floor(this.enemies[i].y / this.cell);
				occupied.add(`${gx}:${gy}`);
				continue;
			}
			this.enemies[i] = this.createTank(`enemy-${i}`, occupied, 2, 'enemy');
		}
	}

	update(dtMs) {
		const dt = Math.max(0.001, Math.min(0.04, (dtMs / 1000) * this.timeScale));

		this.updateTankAI(this.player, this.enemies, dt);
		for (const enemy of this.enemies) {
			this.updateTankAI(enemy, [this.player, ...this.enemies.filter((x) => x.id !== enemy.id)], dt);
		}

		this.updateProjectiles(dt);
		this.updateExplosions(dt);
		this.respawnIfNeeded(dt);
	}

	drawGrid() {
		this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.10)';
		this.ctx.lineWidth = 1;
		for (let i = 1; i < this.gridSize; i += 1) {
			const p = i * this.cell + 0.5;
			this.ctx.beginPath();
			this.ctx.moveTo(p, 0);
			this.ctx.lineTo(p, this.height);
			this.ctx.stroke();
			this.ctx.beginPath();
			this.ctx.moveTo(0, p);
			this.ctx.lineTo(this.width, p);
			this.ctx.stroke();
		}
	}

	drawWalls() {
		this.ctx.fillStyle = '#64748b';
		this.ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
		for (let y = 0; y < this.gridSize; y += 1) {
			for (let x = 0; x < this.gridSize; x += 1) {
				if (this.walls[y][x] !== 1) continue;
				const px = x * this.cell;
				const py = y * this.cell;
				this.ctx.fillRect(px, py, this.cell, this.cell);
				this.ctx.strokeRect(px + 0.5, py + 0.5, this.cell - 1, this.cell - 1);
			}
		}
	}

	drawTank(tank) {
		if (!tank.alive) return;
		this.ctx.fillStyle = tank.color;
		this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
		this.ctx.lineWidth = 1;

		const left = tank.x - this.halfTank;
		const top = tank.y - this.halfTank;
		this.ctx.fillRect(left, top, this.tankSize, this.tankSize);
		this.ctx.strokeRect(left + 0.5, top + 0.5, this.tankSize - 1, this.tankSize - 1);

		this.ctx.fillStyle = tank.id === 'player' ? '#bae6fd' : '#fed7aa';
		this.ctx.beginPath();
		this.ctx.arc(tank.x, tank.y, this.tankSize * 0.2, 0, Math.PI * 2);
		this.ctx.fill();

		const v = this.dirToVector(tank.dir);
		this.ctx.strokeStyle = tank.id === 'player' ? '#e0f2fe' : '#ffedd5';
		this.ctx.lineWidth = Math.max(2, this.cell * 0.16);
		this.ctx.beginPath();
		this.ctx.moveTo(tank.x, tank.y);
		this.ctx.lineTo(tank.x + v.x * this.barrelLen, tank.y + v.y * this.barrelLen);
		this.ctx.stroke();
	}

	drawProjectiles() {
		for (const projectile of this.projectiles) {
			this.ctx.fillStyle = projectile.ownerId === this.player.id ? '#22d3ee' : '#facc15';
			this.ctx.beginPath();
			this.ctx.arc(projectile.x, projectile.y, projectile.r, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	drawExplosions() {
		for (const explosion of this.explosions) {
			const p = explosion.ttl / this.explosionTTL;
			const alpha = Math.max(0, Math.min(1, p));
			const radius = this.cell * (0.2 + (1 - alpha) * 0.8);
			this.ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
			this.ctx.beginPath();
			this.ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	drawHud() {
		const enemiesAlive = this.enemies.filter((e) => e.alive).length;
		this.ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
		this.ctx.fillRect(0, 0, this.width, Math.max(18, this.cell * 1.05));

		this.ctx.fillStyle = '#e2e8f0';
		this.ctx.font = `${Math.max(11, Math.floor(this.cell * 0.6))}px monospace`;
		this.ctx.fillText(
			`AUTO TANKS  K:${this.kills}  P:${this.player.alive ? 'alive' : 'down'}  E:${enemiesAlive}`,
			8,
			Math.max(13, Math.floor(this.cell * 0.78)),
		);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.width, this.height);

		this.drawGrid();
		this.drawWalls();
		this.drawTank(this.player);
		for (const enemy of this.enemies) this.drawTank(enemy);
		this.drawProjectiles();
		this.drawExplosions();
		this.drawHud();
	}

	loop(timestamp) {
		if (!this.running) return;
		const dt = timestamp - this.lastTime;
		this.lastTime = timestamp;
		this.update(dt);
		this.draw();
		this.rafId = requestAnimationFrame((t) => this.loop(t));
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
        }
      </style>
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
	}
}

customElements.define('auto-tanks', AutoTanks);
