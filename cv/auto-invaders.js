class AutoInvaders extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.defaultSize = 320;
		this.minSize = 200;
		this.maxSize = 900;

		this.running = false;
		this.rafId = null;
		this.lastTime = 0;
		this.logicTimeScale = 1 / 1.5;

		this.applySize(this.getSizeFromAttribute());
		this.background = this.getBackgroundFromAttribute();
		this.initGame();
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
		if (!value || !value.trim()) return '#080d1a';
		return value.trim();
	}

	applySize(size) {
		this.size = size;
		this.width = size;
		this.height = size;

		this.padding = Math.max(8, Math.round(size * 0.03));
		this.hudHeight = Math.max(26, Math.round(size * 0.11));
		this.playTop = this.hudHeight + Math.max(4, Math.round(size * 0.01));
		this.playBottom = this.height - this.padding;

		this.playerWidth = Math.max(20, Math.round(size * 0.08));
		this.playerHeight = Math.max(10, Math.round(size * 0.03));
		this.playerSpeed = size * 0.55;
		this.playerY = this.playBottom - this.playerHeight - Math.max(8, Math.round(size * 0.03));

		this.bulletRadius = Math.max(2, Math.round(size * 0.008));
		this.playerBulletSpeed = size * 0.9;
		this.enemyBulletSpeed = this.playerBulletSpeed * 0.5;

		this.invaderWidth = Math.max(11, Math.round(size * 0.042));
		this.invaderHeight = Math.max(8, Math.round(size * 0.027));
		this.invaderGapX = Math.max(6, Math.round(size * 0.021));
		this.invaderGapY = Math.max(7, Math.round(size * 0.022));
		this.invaderStepX = Math.max(8, Math.round(size * 0.022));
		this.invaderStepY = Math.max(10, Math.round(size * 0.025));

		this.fontMain = Math.max(10, Math.round(size * 0.038));
	}

	initGame() {
		this.score = 0;
		this.wave = 1;
		this.lives = 3;
		this.gameOver = false;
		this.restartTimer = 0;

		this.player = {
			x: this.width * 0.5,
			targetX: this.width * 0.5,
			fireCooldown: 0,
			hitCooldown: 0,
		};

		this.bullets = [];
		this.explosions = [];
		this.stars = this.createStars();
		this.initWave();
	}

	initWave() {
		this.invaders = this.createInvaders();
		this.invaderDir = 1;
		this.invaderMoveAccum = 0;
		this.invaderShotAccum = 0;
		this.shields = [];
		this.bullets = [];
	}

	createStars() {
		const stars = [];
		const count = Math.max(24, Math.round(this.size * 0.16));
		for (let i = 0; i < count; i += 1) {
			stars.push({
				x: Math.random() * this.width,
				y: Math.random() * this.height,
				r: Math.random() * 1.2 + 0.4,
				a: Math.random() * 0.45 + 0.25,
			});
		}
		return stars;
	}

	createInvaders() {
		const cols = 10;
		const rows = 3;
		const formationWidth = cols * this.invaderWidth + (cols - 1) * this.invaderGapX;
		const startX = (this.width - formationWidth) * 0.5;
		const startY = this.playTop + Math.max(10, Math.round(this.size * 0.045));
		const palette = ['#9ae6b4', '#67e8f9', '#fcd34d', '#fdba74', '#fda4af'];

		const invaders = [];
		let id = 0;
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				invaders.push({
					id,
					alive: true,
					x: startX + col * (this.invaderWidth + this.invaderGapX),
					y: startY + row * (this.invaderHeight + this.invaderGapY),
					type: row % 3,
					color: palette[row],
				});
				id += 1;
			}
		}
		return invaders;
	}

	createShields() {
		const shieldCount = 4;
		const shieldCell = Math.max(3, Math.round(this.size * 0.013));
		const cols = 10;
		const rows = 6;
		const totalWidth = shieldCount * cols * shieldCell;
		const gap = Math.max(8, Math.round((this.width - totalWidth) / (shieldCount + 1)));
		const baselineY = this.playerY - Math.max(24, Math.round(this.size * 0.12));

		const pattern = [
			[0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
			[1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
			[1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
		];

		const shields = [];
		for (let i = 0; i < shieldCount; i += 1) {
			const originX = gap + i * (cols * shieldCell + gap);
			const cells = [];
			for (let y = 0; y < rows; y += 1) {
				for (let x = 0; x < cols; x += 1) {
					if (pattern[y][x] === 0) continue;
					cells.push({
						x: originX + x * shieldCell,
						y: baselineY + y * shieldCell,
						w: shieldCell,
						h: shieldCell,
						hp: 3,
					});
				}
			}
			shields.push(cells);
		}
		return shields;
	}

	getAliveInvaders() {
		return this.invaders.filter((invader) => invader.alive);
	}

	getInvaderMoveInterval() {
		const alive = this.getAliveInvaders().length;
		const speedUp = Math.max(0, 50 - alive) * 3;
		const waveBoost = (this.wave - 1) * 10;
		return Math.max(55, 420 - speedUp - waveBoost);
	}

	getInvaderBounds() {
		let left = Infinity;
		let right = -Infinity;
		let bottom = -Infinity;

		for (const invader of this.invaders) {
			if (!invader.alive) continue;
			left = Math.min(left, invader.x);
			right = Math.max(right, invader.x + this.invaderWidth);
			bottom = Math.max(bottom, invader.y + this.invaderHeight);
		}

		if (!Number.isFinite(left)) {
			return { left: 0, right: 0, bottom: 0 };
		}
		return { left, right, bottom };
	}

	updateAutopilot(dtSec) {
		if (this.gameOver) return;

		const target = this.selectTargetInvader();
		const dodgeTargetX = this.getDodgeTargetX();
		if (dodgeTargetX !== null) {
			this.player.targetX = dodgeTargetX;
		} else if (target) {
			this.player.targetX = target.x + this.invaderWidth * 0.5;
		} else {
			this.player.targetX = this.width * 0.5;
		}

		const margin = this.playerWidth * 0.5 + 4;
		this.player.targetX = Math.max(margin, Math.min(this.width - margin, this.player.targetX));
		const delta = this.player.targetX - this.player.x;
		const step = this.playerSpeed * dtSec;
		if (Math.abs(delta) > step) {
			this.player.x += Math.sign(delta) * step;
		} else {
			this.player.x += delta;
		}

		this.player.fireCooldown -= dtSec;
		this.player.hitCooldown = Math.max(0, this.player.hitCooldown - dtSec);

		// Во время уклонения приоритет — выживание, а не огонь.
		if (this.player.fireCooldown <= 0 && dodgeTargetX === null && this.shouldFire(target)) {
			this.spawnPlayerBullet();
			const baseCooldown = 0.22 - (this.wave - 1) * 0.01;
			this.player.fireCooldown = Math.max(0.12, baseCooldown + Math.random() * 0.06);
		}
	}

	selectTargetInvader() {
		const alive = this.getAliveInvaders();
		if (alive.length === 0) return null;

		// Берем наиболее близкого к игроку снизу и по горизонтали.
		const playerX = this.player.x;
		let best = null;
		for (const invader of alive) {
			const dx = Math.abs(invader.x + this.invaderWidth * 0.5 - playerX);
			const threat = invader.y * 0.8 + (this.height - dx) * 0.2;
			if (!best || threat > best.threat) {
				best = { invader, threat };
			}
		}
		return best?.invader ?? null;
	}

	getDodgeTargetX() {
		const playerHalf = this.playerWidth * 0.5;
		const margin = playerHalf + 4;
		const bulletDangerRadius = playerHalf + this.bulletRadius + Math.max(6, this.size * 0.02);
		const bullets = this.bullets.filter((bullet) => bullet.type === 'enemy' && bullet.vy > 0);
		if (bullets.length === 0) return null;

		let mostDangerous = null;
		for (const bullet of bullets) {
			const timeToPlayerY = (this.playerY - bullet.y) / bullet.vy;
			// Интересуют пули, которые скоро пересекут линию танка.
			if (timeToPlayerY < 0 || timeToPlayerY > 0.9) continue;

			const predictedX = bullet.x + bullet.vx * timeToPlayerY;
			const dx = Math.abs(predictedX - this.player.x);
			if (dx > bulletDangerRadius) continue;

			const dangerScore = (1 - timeToPlayerY / 0.9) * 0.75 + (1 - dx / bulletDangerRadius) * 0.25;
			if (!mostDangerous || dangerScore > mostDangerous.dangerScore) {
				mostDangerous = { bullet, predictedX, dangerScore };
			}
		}

		if (!mostDangerous) return null;

		// Выбираем сторону с большим запасом и отступаем от траектории.
		const dodgeDistance = this.playerWidth * 1.35 + this.bulletRadius * 2;
		const goRightX = Math.min(this.width - margin, mostDangerous.predictedX + dodgeDistance);
		const goLeftX = Math.max(margin, mostDangerous.predictedX - dodgeDistance);
		const leftClearance = goLeftX - margin;
		const rightClearance = this.width - margin - goRightX;

		if (rightClearance > leftClearance) return goRightX;
		if (leftClearance > rightClearance) return goLeftX;
		return this.player.x <= mostDangerous.predictedX ? goLeftX : goRightX;
	}

	shouldFire(target) {
		if (!target) return false;
		const existingPlayerBullets = this.bullets.filter((b) => b.type === 'player').length;
		if (existingPlayerBullets >= 2) return false;
		const targetX = target.x + this.invaderWidth * 0.5;
		const aligned = Math.abs(targetX - this.player.x) <= this.playerWidth * 0.45;
		return aligned || Math.random() < 0.12;
	}

	spawnPlayerBullet() {
		this.bullets.push({
			type: 'player',
			x: this.player.x,
			y: this.playerY,
			vx: 0,
			vy: -this.playerBulletSpeed,
			r: this.bulletRadius,
		});
	}

	spawnEnemyBullet() {
		const shooters = this.getBottomInvadersPerColumn();
		if (shooters.length === 0) return;
		const shooter = shooters[Math.floor(Math.random() * shooters.length)];
		this.bullets.push({
			type: 'enemy',
			x: shooter.x + this.invaderWidth * 0.5,
			y: shooter.y + this.invaderHeight,
			vx: (Math.random() - 0.5) * this.enemyBulletSpeed * 0.12,
			vy: this.enemyBulletSpeed * (0.9 + Math.random() * 0.18),
			r: this.bulletRadius,
		});
	}

	getBottomInvadersPerColumn() {
		const byCol = new Map();
		for (const invader of this.invaders) {
			if (!invader.alive) continue;
			const col = Math.round(invader.x / (this.invaderWidth + this.invaderGapX));
			const current = byCol.get(col);
			if (!current || invader.y > current.y) byCol.set(col, invader);
		}
		return [...byCol.values()];
	}

	updateInvaders(dtMs) {
		if (this.gameOver) return;

		this.invaderMoveAccum += dtMs;
		const interval = this.getInvaderMoveInterval();
		while (this.invaderMoveAccum >= interval) {
			this.invaderMoveAccum -= interval;
			this.stepInvaders();
		}

		this.invaderShotAccum += dtMs;
		const shotInterval = Math.max(190, 680 - this.wave * 45);
		if (this.invaderShotAccum >= shotInterval) {
			this.invaderShotAccum = 0;
			if (Math.random() < 0.78) this.spawnEnemyBullet();
		}

		const bounds = this.getInvaderBounds();
		if (bounds.bottom >= this.playerY - this.playerHeight * 0.4) {
			this.loseLife();
		}
	}

	stepInvaders() {
		const bounds = this.getInvaderBounds();
		if (bounds.right <= bounds.left) return;

		const hitRight = bounds.right + this.invaderStepX >= this.width - this.padding;
		const hitLeft = bounds.left - this.invaderStepX <= this.padding;
		if ((this.invaderDir > 0 && hitRight) || (this.invaderDir < 0 && hitLeft)) {
			this.invaderDir *= -1;
			for (const invader of this.invaders) {
				if (!invader.alive) continue;
				invader.y += this.invaderStepY;
			}
			return;
		}

		for (const invader of this.invaders) {
			if (!invader.alive) continue;
			invader.x += this.invaderStepX * this.invaderDir;
		}
	}

	updateBullets(dtSec) {
		const nextBullets = [];
		for (const bullet of this.bullets) {
			bullet.x += bullet.vx * dtSec;
			bullet.y += bullet.vy * dtSec;

			if (
				bullet.y < this.playTop - 24 ||
				bullet.y > this.height + 24 ||
				bullet.x < -24 ||
				bullet.x > this.width + 24
			) {
				continue;
			}

			if (bullet.type === 'player') {
				if (this.hitInvaderByBullet(bullet)) continue;
			} else if (this.hitPlayerByBullet(bullet)) {
				continue;
			}

			nextBullets.push(bullet);
		}

		this.bullets = this.resolveBulletVsBullet(nextBullets);
	}

	resolveBulletVsBullet(bullets) {
		const alive = new Array(bullets.length).fill(true);
		for (let i = 0; i < bullets.length; i += 1) {
			if (!alive[i]) continue;
			for (let j = i + 1; j < bullets.length; j += 1) {
				if (!alive[j]) continue;
				const a = bullets[i];
				const b = bullets[j];
				if (a.type === b.type) continue;
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const rr = a.r + b.r;
				if (dx * dx + dy * dy > rr * rr) continue;
				alive[i] = false;
				alive[j] = false;
				this.explosions.push({ x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5, ttl: 0.16 });
				break;
			}
		}
		return bullets.filter((_, idx) => alive[idx]);
	}

	hitInvaderByBullet(bullet) {
		for (const invader of this.invaders) {
			if (!invader.alive) continue;
			if (
				bullet.x + bullet.r < invader.x ||
				bullet.x - bullet.r > invader.x + this.invaderWidth ||
				bullet.y + bullet.r < invader.y ||
				bullet.y - bullet.r > invader.y + this.invaderHeight
			) {
				continue;
			}
			invader.alive = false;
			this.score += 10 + this.wave * 2;
			this.explosions.push({
				x: invader.x + this.invaderWidth * 0.5,
				y: invader.y + this.invaderHeight * 0.5,
				ttl: 0.24,
			});
			return true;
		}
		return false;
	}

	hitPlayerByBullet(bullet) {
		if (this.player.hitCooldown > 0) return false;

		const px = this.player.x - this.playerWidth * 0.5;
		const py = this.playerY;
		if (
			bullet.x + bullet.r < px ||
			bullet.x - bullet.r > px + this.playerWidth ||
			bullet.y + bullet.r < py ||
			bullet.y - bullet.r > py + this.playerHeight
		) {
			return false;
		}
		this.loseLife();
		return true;
	}

	hitShieldByBullet(bullet) {
		for (const shield of this.shields) {
			for (let i = shield.length - 1; i >= 0; i -= 1) {
				const cell = shield[i];
				if (
					bullet.x + bullet.r < cell.x ||
					bullet.x - bullet.r > cell.x + cell.w ||
					bullet.y + bullet.r < cell.y ||
					bullet.y - bullet.r > cell.y + cell.h
				) {
					continue;
				}
				cell.hp -= bullet.type === 'player' ? 2 : 1;
				if (cell.hp <= 0) shield.splice(i, 1);
				this.explosions.push({ x: bullet.x, y: bullet.y, ttl: 0.1 });
				return true;
			}
		}
		return false;
	}

	loseLife() {
		if (this.gameOver || this.player.hitCooldown > 0) return;
		this.lives -= 1;
		this.player.hitCooldown = 0.65;
		this.explosions.push({
			x: this.player.x,
			y: this.playerY + this.playerHeight * 0.5,
			ttl: 0.35,
		});

		this.bullets = this.bullets.filter((b) => b.type === 'player');
		this.player.x = this.width * 0.5;
		this.player.targetX = this.player.x;

		if (this.lives <= 0) {
			this.gameOver = true;
			this.restartTimer = 1800;
		}
	}

	updateExplosions(dtSec) {
		for (const explosion of this.explosions) {
			explosion.ttl -= dtSec;
		}
		this.explosions = this.explosions.filter((explosion) => explosion.ttl > 0);
	}

	update(dtMs) {
		const scaledDtMs = dtMs * this.logicTimeScale;
		const dtSec = Math.max(0.001, Math.min(0.05, scaledDtMs / 1000));

		if (this.gameOver) {
			this.restartTimer -= scaledDtMs;
			if (this.restartTimer <= 0) this.initGame();
			this.updateExplosions(dtSec);
			return;
		}

		this.updateAutopilot(dtSec);
		this.updateInvaders(scaledDtMs);
		this.updateBullets(dtSec);
		this.updateExplosions(dtSec);

		if (this.getAliveInvaders().length === 0) {
			this.wave += 1;
			this.score += 100;
			this.initWave();
		}
	}

	drawBackground() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.width, this.height);

		for (const star of this.stars) {
			this.ctx.fillStyle = `rgba(191, 219, 254, ${star.a})`;
			this.ctx.beginPath();
			this.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	drawHud() {
		this.ctx.fillStyle = 'rgba(8, 15, 30, 0.72)';
		this.ctx.fillRect(0, 0, this.width, this.hudHeight);
		this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.24)';
		this.ctx.beginPath();
		this.ctx.moveTo(0, this.hudHeight + 0.5);
		this.ctx.lineTo(this.width, this.hudHeight + 0.5);
		this.ctx.stroke();

		this.ctx.fillStyle = '#dbeafe';
		this.ctx.font = `${this.fontMain}px monospace`;
		this.ctx.fillText(
			`AUTO INVADERS  SCORE:${this.score}  W:${this.wave}  L:${Math.max(0, this.lives)}`,
			8,
			Math.max(15, this.hudHeight - 8),
		);
	}

	drawInvaders() {
		const frame = Math.floor(performance.now() / 220) % 2;
		for (const invader of this.invaders) {
			if (!invader.alive) continue;

			this.ctx.fillStyle = invader.color;
			this.ctx.fillRect(invader.x, invader.y, this.invaderWidth, this.invaderHeight);

			// Упрощенный "пиксельный" силуэт с анимацией ног.
			const eyeW = Math.max(2, Math.round(this.invaderWidth * 0.16));
			const eyeY = invader.y + Math.max(2, Math.round(this.invaderHeight * 0.24));
			this.ctx.fillStyle = '#0b1220';
			this.ctx.fillRect(invader.x + eyeW, eyeY, eyeW, eyeW);
			this.ctx.fillRect(invader.x + this.invaderWidth - eyeW * 2, eyeY, eyeW, eyeW);

			this.ctx.fillStyle = invader.color;
			const legY = invader.y + this.invaderHeight;
			const legW = Math.max(2, Math.round(this.invaderWidth * 0.14));
			const leftLegX = invader.x + (frame ? legW : 0);
			const rightLegX = invader.x + this.invaderWidth - legW - (frame ? 0 : legW);
			this.ctx.fillRect(leftLegX, legY, legW, legW);
			this.ctx.fillRect(rightLegX, legY, legW, legW);
		}
	}

	drawPlayer() {
		const x = this.player.x - this.playerWidth * 0.5;
		const y = this.playerY;
		const blink = this.player.hitCooldown > 0 && Math.floor(performance.now() / 80) % 2 === 0;
		if (blink) return;

		this.ctx.fillStyle = '#34d399';
		this.ctx.fillRect(x, y, this.playerWidth, this.playerHeight);
		const turretW = Math.max(4, Math.round(this.playerWidth * 0.22));
		const turretH = Math.max(5, Math.round(this.playerHeight * 0.8));
		this.ctx.fillRect(this.player.x - turretW * 0.5, y - turretH, turretW, turretH);
	}

	drawShields() {
		for (const shield of this.shields) {
			for (const cell of shield) {
				if (cell.hp >= 3) this.ctx.fillStyle = '#4ade80';
				else if (cell.hp === 2) this.ctx.fillStyle = '#86efac';
				else this.ctx.fillStyle = '#bbf7d0';
				this.ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
			}
		}
	}

	drawBullets() {
		for (const bullet of this.bullets) {
			this.ctx.fillStyle = bullet.type === 'player' ? '#93c5fd' : '#fca5a5';
			this.ctx.beginPath();
			this.ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	drawExplosions() {
		for (const explosion of this.explosions) {
			const life = Math.max(0, Math.min(1, explosion.ttl / 0.35));
			const alpha = Math.max(0.1, life);
			const radius = Math.max(2, (1 - life) * this.size * 0.03 + 2);
			this.ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
			this.ctx.beginPath();
			this.ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	drawGameOver() {
		if (!this.gameOver) return;
		this.ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
		const h = Math.max(42, Math.round(this.size * 0.15));
		const y = this.height * 0.45;
		this.ctx.fillRect(0, y, this.width, h);
		this.ctx.fillStyle = '#f8fafc';
		this.ctx.font = `${Math.max(12, Math.round(this.size * 0.043))}px monospace`;
		this.ctx.fillText('GAME OVER  RESTARTING...', Math.max(8, this.size * 0.07), y + h * 0.62);
	}

	draw() {
		this.drawBackground();
		this.drawHud();
		this.drawInvaders();
		this.drawPlayer();
		this.drawBullets();
		this.drawExplosions();
		this.drawGameOver();
	}

	loop(timestamp) {
		if (!this.running) return;
		const dt = Math.max(0, Math.min(100, timestamp - this.lastTime));
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
          image-rendering: auto;
        }
      </style>
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
	}
}

customElements.define('auto-invaders', AutoInvaders);
