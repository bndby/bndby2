class AutoDragon extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.defaultSize = 360;
		this.minSize = 220;
		this.maxSize = 960;

		this.running = false;
		this.rafId = null;
		this.lastTime = 0;

		this.applySize(this.getSizeFromAttribute());
		this.background = this.getBackgroundFromAttribute();
		this.resetLevel();
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
			this.resetLevel();
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
		if (!value || !value.trim()) return '#091326';
		return value.trim();
	}

	applySize(size) {
		this.size = size;
		this.width = size;
		this.height = Math.round(size * 0.62);

		this.dragonX = this.width * 0.28;
		this.dragonRadius = Math.max(8, this.size * 0.03);
		this.dragonMaxSpeedY = this.size * 0.92;
		this.dragonMaxAccel = this.size * 5.6;

		this.baseSpeed = this.size * 0.57;
		this.levelLength = this.size * 18;
		this.segmentWidthMin = Math.max(28, this.size * 0.09);
		this.segmentWidthMax = Math.max(52, this.size * 0.19);
	}

	randomRange(min, max) {
		return min + Math.random() * (max - min);
	}

	clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	resetLevel() {
		this.elapsed = 0;
		this.timePenalty = 0;
		this.worldDistance = 0;
		this.hits = 0;
		this.finished = false;
		this.finishTimer = 0;
		this.lastResultTime = null;
		this.bestTime = this.bestTime ?? null;

		this.speed = this.baseSpeed;
		this.slowdownTimer = 0;
		this.collisionCooldown = 0;
		this.collisionFlash = 0;

		this.dragonY = this.height * 0.5;
		this.dragonVY = 0;
		this.wingPhase = 0;
		this.flamePhase = 0;
		this.targetY = this.dragonY;

		this.segments = [];
		this.mountains = [];
		this.birds = [];
		this.nextBirdSpawn = this.randomRange(1.3, 2.5);

		this.lastGapCenter = this.height * 0.5;
		this.nextSegmentX = 0;
		this.generateSegmentsUntil(this.width + this.segmentWidthMax * 2);
	}

	getDifficulty() {
		const progress = this.clamp(this.worldDistance / this.levelLength, 0, 1);
		return progress;
	}

	generateSegmentsUntil(targetX) {
		const cavePadding = this.height * 0.08;
		while (this.nextSegmentX < targetX) {
			const difficulty = this.getDifficulty();
			const width = this.randomRange(this.segmentWidthMin, this.segmentWidthMax);
			const gapHeight = this.height * (0.4 - difficulty * 0.13) + this.randomRange(-4, 6);
			const minCenter = cavePadding + gapHeight * 0.5;
			const maxCenter = this.height - cavePadding - gapHeight * 0.5;
			const drift = this.randomRange(-this.height * 0.09, this.height * 0.09);
			const center = this.clamp(this.lastGapCenter + drift, minCenter, maxCenter);
			const top = center - gapHeight * 0.5;
			const bottom = center + gapHeight * 0.5;

			this.segments.push({
				x: this.nextSegmentX,
				w: width,
				top,
				bottom,
			});

			// Выступы (горы) появляются внутри прохода: и сверху, и снизу.
			if (difficulty > 0.1 && Math.random() < 0.42 && gapHeight > this.height * 0.22) {
				const mountainW = width * this.randomRange(0.4, 0.9);
				const mountainX = this.nextSegmentX + width * this.randomRange(0.05, 0.7);
				const side = Math.random() < 0.5 ? 'bottom' : 'top';
				const intrusion = gapHeight * this.randomRange(0.36, 0.62);
				const tipY = side === 'bottom' ? bottom - intrusion : top + intrusion;
				this.mountains.push({
					x: mountainX,
					w: mountainW,
					side,
					tipY,
				});
			}

			this.lastGapCenter = center;
			this.nextSegmentX += width;
		}
	}

	findSegmentAtX(x) {
		for (const segment of this.segments) {
			if (x >= segment.x && x <= segment.x + segment.w) {
				return segment;
			}
		}
		return null;
	}

	findUpcomingSegments(x, maxCount = 3) {
		const list = [];
		for (const segment of this.segments) {
			if (segment.x + segment.w < x) continue;
			list.push(segment);
			if (list.length >= maxCount) break;
		}
		return list;
	}

	spawnBirdIfNeeded(dt) {
		this.nextBirdSpawn -= dt;
		if (this.nextBirdSpawn > 0) return;

		const difficulty = this.getDifficulty();
		const currentSegment = this.findSegmentAtX(this.width * 0.92);
		if (currentSegment) {
			const center = (currentSegment.top + currentSegment.bottom) * 0.5;
			const gap = currentSegment.bottom - currentSegment.top;
			const r = Math.max(7, this.size * 0.021);
			const y = this.clamp(
				center + this.randomRange(-gap * 0.32, gap * 0.32),
				currentSegment.top + r + 4,
				currentSegment.bottom - r - 4,
			);

			this.birds.push({
				x: this.width + r + this.randomRange(4, this.width * 0.08),
				y,
				baseY: y,
				r,
				phase: Math.random() * Math.PI * 2,
				oscAmp: this.randomRange(2, 9),
				oscSpeed: this.randomRange(2.5, 5.8),
				speedFactor: this.randomRange(0.88, 1.22 + difficulty * 0.35),
			});
		}

		this.nextBirdSpawn = this.randomRange(
			Math.max(0.55, 1.9 - difficulty * 1.1),
			Math.max(1.1, 3.0 - difficulty * 1.3),
		);
	}

	updateAutopilot(dt) {
		const lookX = this.dragonX + this.width * 0.3;
		const upcoming = this.findUpcomingSegments(lookX, 3);

		let target = this.height * 0.5;
		if (upcoming.length > 0) {
			let weightSum = 0;
			let centerSum = 0;
			for (let i = 0; i < upcoming.length; i += 1) {
				const segment = upcoming[i];
				const center = (segment.top + segment.bottom) * 0.5;
				const weight = 1 / (1 + i * 0.85);
				centerSum += center * weight;
				weightSum += weight;
			}
			target = centerSum / weightSum;
		}

		// Локальное уклонение от птиц по высоте.
		for (const bird of this.birds) {
			const dx = bird.x - this.dragonX;
			if (dx < -bird.r || dx > this.width * 0.25) continue;
			const safeBand = bird.r * 2.5 + this.dragonRadius;
			const dy = target - bird.y;
			if (Math.abs(dy) < safeBand) {
				target += dy <= 0 ? -safeBand : safeBand;
			}
		}

		// Если впереди выступ, уводим цель от него (вверх/вниз в зависимости от стороны).
		for (const mountain of this.mountains) {
			const mRight = mountain.x + mountain.w;
			const dx = mRight - this.dragonX;
			if (dx < -8 || dx > this.width * 0.22) continue;
			if (mountain.side === 'bottom') {
				target = Math.min(target, mountain.tipY - this.dragonRadius * 1.9);
			} else {
				target = Math.max(target, mountain.tipY + this.dragonRadius * 1.9);
			}
		}

		const currentSegment = this.findSegmentAtX(this.dragonX);
		if (currentSegment) {
			const minY = currentSegment.top + this.dragonRadius + 5;
			const maxY = currentSegment.bottom - this.dragonRadius - 5;
			target = this.clamp(target, minY, maxY);
		}

		this.targetY = this.clamp(target, this.dragonRadius + 6, this.height - this.dragonRadius - 6);

		const error = this.targetY - this.dragonY;
		const desiredAccel = this.clamp(
			error * 6.2 - this.dragonVY * 3.4,
			-this.dragonMaxAccel,
			this.dragonMaxAccel,
		);

		this.dragonVY += desiredAccel * dt;
		this.dragonVY = this.clamp(this.dragonVY, -this.dragonMaxSpeedY, this.dragonMaxSpeedY);
		this.dragonY += this.dragonVY * dt;

		if (this.dragonY < this.dragonRadius + 2) {
			this.dragonY = this.dragonRadius + 2;
			this.dragonVY *= -0.35;
		}
		if (this.dragonY > this.height - this.dragonRadius - 2) {
			this.dragonY = this.height - this.dragonRadius - 2;
			this.dragonVY *= -0.35;
		}
	}

	getMountainLerpAt(mountain, x) {
		if (x < mountain.x || x > mountain.x + mountain.w) return 0;
		const halfW = mountain.w * 0.5;
		const centerX = mountain.x + halfW;
		return Math.max(0, 1 - Math.abs(x - centerX) / halfW);
	}

	applyCollision(pushDirection = 0) {
		if (this.collisionCooldown > 0) return;
		this.collisionCooldown = 0.25;
		this.collisionFlash = 0.24;
		this.slowdownTimer = Math.max(this.slowdownTimer, 1.6);
		this.timePenalty += 1.2;
		this.hits += 1;

		// После удара подталкиваем дракона обратно в проход.
		const recoveryImpulse = this.size * 0.32;
		if (pushDirection < 0) {
			// Удар о верх: толкаем вниз.
			this.dragonVY = Math.max(this.dragonVY, recoveryImpulse);
		} else if (pushDirection > 0) {
			// Удар о низ: толкаем вверх.
			this.dragonVY = Math.min(this.dragonVY, -recoveryImpulse);
		} else {
			this.dragonVY += (Math.random() < 0.5 ? -1 : 1) * recoveryImpulse * 0.7;
		}
	}

	checkCollisions() {
		const segment = this.findSegmentAtX(this.dragonX);
		if (segment) {
			if (this.dragonY - this.dragonRadius < segment.top + 2) this.applyCollision(-1);
			if (this.dragonY + this.dragonRadius > segment.bottom - 2) this.applyCollision(1);
		}

		for (const mountain of this.mountains) {
			if (this.dragonX + this.dragonRadius < mountain.x) continue;
			if (this.dragonX - this.dragonRadius > mountain.x + mountain.w) continue;

			const lerp = this.getMountainLerpAt(mountain, this.dragonX);
			if (lerp <= 0) continue;

			if (mountain.side === 'bottom') {
				const mountainY = this.height + (mountain.tipY - this.height) * lerp;
				if (this.dragonY + this.dragonRadius > mountainY) this.applyCollision(1);
			} else {
				const mountainY = mountain.tipY * lerp;
				if (this.dragonY - this.dragonRadius < mountainY) this.applyCollision(-1);
			}
		}

		for (const bird of this.birds) {
			const dx = this.dragonX - bird.x;
			const dy = this.dragonY - bird.y;
			const minDist = this.dragonRadius + bird.r;
			if (dx * dx + dy * dy <= minDist * minDist) {
				this.applyCollision(dy < 0 ? -1 : 1);
				// Птица после столкновения улетает.
				bird.x = -1000;
			}
		}
	}

	updateWorld(dt) {
		const slowdownFactor = this.slowdownTimer > 0 ? 0.58 : 1;
		const desiredSpeed = this.baseSpeed * slowdownFactor;
		const speedLerp = 1 - Math.exp(-dt * 8);
		this.speed += (desiredSpeed - this.speed) * speedLerp;

		const dx = this.speed * dt;
		this.worldDistance += dx;

		for (const segment of this.segments) segment.x -= dx;
		for (const mountain of this.mountains) mountain.x -= dx;
		// Держим "хвост" генератора в тех же экранных координатах, что и сегменты.
		this.nextSegmentX -= dx;
		for (const bird of this.birds) {
			bird.x -= dx * bird.speedFactor;
			bird.phase += bird.oscSpeed * dt;
			bird.y = bird.baseY + Math.sin(bird.phase) * bird.oscAmp;
		}

		this.segments = this.segments.filter((s) => s.x + s.w > -4);
		this.mountains = this.mountains.filter((m) => m.x + m.w > -4);
		this.birds = this.birds.filter((b) => b.x + b.r > -4 && b.x - b.r < this.width + 12);
		this.generateSegmentsUntil(this.width + this.segmentWidthMax * 2);
	}

	update(dtMs) {
		const dt = this.clamp(dtMs / 1000, 0.001, 0.033);
		if (this.finished) {
			this.finishTimer += dt;
			if (this.finishTimer > 2.4) this.resetLevel();
			return;
		}

		this.elapsed += dt;
		this.wingPhase += dt * 12;
		this.flamePhase += dt * 20;

		if (this.collisionFlash > 0) this.collisionFlash = Math.max(0, this.collisionFlash - dt);
		if (this.collisionCooldown > 0) this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
		if (this.slowdownTimer > 0) this.slowdownTimer = Math.max(0, this.slowdownTimer - dt);

		this.spawnBirdIfNeeded(dt);
		this.updateAutopilot(dt);
		this.updateWorld(dt);
		this.checkCollisions();

		if (this.worldDistance >= this.levelLength) {
			this.finished = true;
			this.lastResultTime = this.elapsed + this.timePenalty;
			if (this.bestTime === null || this.lastResultTime < this.bestTime) {
				this.bestTime = this.lastResultTime;
			}
		}
	}

	drawSky() {
		const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
		gradient.addColorStop(0, this.background);
		gradient.addColorStop(0.55, '#10223f');
		gradient.addColorStop(1, '#1a2f52');
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	drawCave() {
		this.ctx.fillStyle = '#2e3f57';
		for (const segment of this.segments) {
			this.ctx.fillRect(segment.x, 0, segment.w + 1, segment.top);
			this.ctx.fillRect(segment.x, segment.bottom, segment.w + 1, this.height - segment.bottom);
		}

		this.ctx.fillStyle = '#3c536f';
		for (const segment of this.segments) {
			this.ctx.fillRect(segment.x, segment.top - 4, segment.w + 1, 4);
			this.ctx.fillRect(segment.x, segment.bottom, segment.w + 1, 4);
		}
	}

	drawMountains() {
		this.ctx.fillStyle = '#5b4a3a';
		for (const mountain of this.mountains) {
			this.ctx.beginPath();
			if (mountain.side === 'bottom') {
				this.ctx.moveTo(mountain.x, this.height);
				this.ctx.lineTo(mountain.x + mountain.w * 0.5, mountain.tipY);
				this.ctx.lineTo(mountain.x + mountain.w, this.height);
			} else {
				this.ctx.moveTo(mountain.x, 0);
				this.ctx.lineTo(mountain.x + mountain.w * 0.5, mountain.tipY);
				this.ctx.lineTo(mountain.x + mountain.w, 0);
			}
			this.ctx.closePath();
			this.ctx.fill();
		}
	}

	drawBirds() {
		for (const bird of this.birds) {
			this.ctx.save();
			this.ctx.translate(bird.x, bird.y);
			const flap = Math.sin(bird.phase * 2.2) * bird.r * 0.52;
			this.ctx.strokeStyle = '#f1f5f9';
			this.ctx.lineWidth = Math.max(1.3, bird.r * 0.23);
			this.ctx.beginPath();
			this.ctx.moveTo(-bird.r, 0);
			this.ctx.quadraticCurveTo(-bird.r * 0.35, -flap, 0, 0);
			this.ctx.quadraticCurveTo(bird.r * 0.35, -flap, bird.r, 0);
			this.ctx.stroke();
			this.ctx.restore();
		}
	}

	drawDragon() {
		const x = this.dragonX;
		const y = this.dragonY;
		const r = this.dragonRadius;
		const wing = Math.sin(this.wingPhase) * r * 0.85;
		const pitch = this.clamp(this.dragonVY / this.dragonMaxSpeedY, -1, 1);
		const angle = pitch * 0.35;

		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.rotate(angle);

		// Крылья.
		this.ctx.fillStyle = '#ef4444';
		this.ctx.beginPath();
		this.ctx.moveTo(-r * 0.3, -r * 0.1);
		this.ctx.quadraticCurveTo(-r * 1.45, -r * 1.25 - wing, -r * 0.2, -r * 0.75);
		this.ctx.quadraticCurveTo(r * 0.26, -r * 0.45, -r * 0.3, -r * 0.1);
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.moveTo(-r * 0.3, r * 0.2);
		this.ctx.quadraticCurveTo(-r * 1.45, r * 1.05 + wing * 0.7, -r * 0.3, r * 0.82);
		this.ctx.quadraticCurveTo(r * 0.26, r * 0.45, -r * 0.3, r * 0.2);
		this.ctx.fill();

		// Тело.
		this.ctx.fillStyle = '#f97316';
		this.ctx.beginPath();
		this.ctx.ellipse(0, 0, r * 1.1, r * 0.72, 0, 0, Math.PI * 2);
		this.ctx.fill();

		// Голова.
		this.ctx.beginPath();
		this.ctx.arc(r * 0.92, -r * 0.1, r * 0.43, 0, Math.PI * 2);
		this.ctx.fill();

		// Глаз.
		this.ctx.fillStyle = '#f8fafc';
		this.ctx.beginPath();
		this.ctx.arc(r * 1.02, -r * 0.2, r * 0.12, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.fillStyle = '#0f172a';
		this.ctx.beginPath();
		this.ctx.arc(r * 1.03, -r * 0.2, r * 0.05, 0, Math.PI * 2);
		this.ctx.fill();

		// Хвост и пламя.
		this.ctx.strokeStyle = '#b45309';
		this.ctx.lineWidth = Math.max(1.6, r * 0.2);
		this.ctx.beginPath();
		this.ctx.moveTo(-r * 1.02, 0);
		this.ctx.quadraticCurveTo(-r * 1.6, -r * 0.14, -r * 2.05, r * 0.1);
		this.ctx.stroke();

		const flame = Math.sin(this.flamePhase) * r * 0.35;
		this.ctx.fillStyle = '#fde047';
		this.ctx.beginPath();
		this.ctx.moveTo(-r * 1.9, r * 0.1);
		this.ctx.lineTo(-r * 2.52 - flame, 0);
		this.ctx.lineTo(-r * 1.9, -r * 0.12);
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.restore();
	}

	drawHud() {
		const totalTime = this.elapsed + this.timePenalty;
		const remaining = Math.max(0, this.levelLength - this.worldDistance);
		const progress = this.clamp(this.worldDistance / this.levelLength, 0, 1);

		this.ctx.fillStyle = 'rgba(3, 8, 20, 0.45)';
		this.ctx.fillRect(0, 0, this.width, 24);

		this.ctx.fillStyle = '#e2e8f0';
		this.ctx.font = `${Math.max(10, Math.round(this.size * 0.034))}px monospace`;
		const speedPercent = (this.speed / this.baseSpeed) * 100;
		this.ctx.fillText(
			`DRAGON AUTO  t:${totalTime.toFixed(1)}s  rem:${Math.round(remaining)}m  v:${speedPercent.toFixed(0)}%  hit:${this.hits}`,
			8,
			16,
		);

		const barW = this.width * 0.32;
		const barH = 5;
		const barX = this.width - barW - 10;
		const barY = 10;
		this.ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
		this.ctx.fillRect(barX, barY, barW, barH);
		this.ctx.fillStyle = '#22c55e';
		this.ctx.fillRect(barX, barY, barW * progress, barH);
	}

	drawFinishOverlay() {
		if (!this.finished) return;
		this.ctx.fillStyle = 'rgba(2, 6, 23, 0.56)';
		this.ctx.fillRect(0, 0, this.width, this.height);

		const result = this.lastResultTime ?? 0;
		const best = this.bestTime ?? result;

		this.ctx.fillStyle = '#f8fafc';
		this.ctx.textAlign = 'center';
		this.ctx.font = `${Math.max(14, Math.round(this.size * 0.06))}px sans-serif`;
		this.ctx.fillText('Уровень пройден!', this.width * 0.5, this.height * 0.42);

		this.ctx.font = `${Math.max(11, Math.round(this.size * 0.04))}px monospace`;
		this.ctx.fillText(`Время: ${result.toFixed(2)}s`, this.width * 0.5, this.height * 0.54);
		this.ctx.fillText(`Лучшее: ${best.toFixed(2)}s`, this.width * 0.5, this.height * 0.63);
		this.ctx.textAlign = 'start';
	}

	drawHitFlash() {
		if (this.collisionFlash <= 0) return;
		const alpha = this.collisionFlash / 0.24;
		this.ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.35})`;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	drawTargetGuide() {
		const currentSegment = this.findSegmentAtX(this.dragonX);
		if (!currentSegment) return;
		this.ctx.strokeStyle = 'rgba(125, 211, 252, 0.25)';
		this.ctx.setLineDash([4, 3]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.dragonX - 14, this.targetY);
		this.ctx.lineTo(this.dragonX + 20, this.targetY);
		this.ctx.stroke();
		this.ctx.setLineDash([]);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawSky();
		this.drawCave();
		this.drawMountains();
		this.drawBirds();
		this.drawTargetGuide();
		this.drawDragon();
		this.drawHud();
		this.drawHitFlash();
		this.drawFinishOverlay();
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
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(2, 6, 23, 0.35);
        }
      </style>
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
	}
}

customElements.define('auto-dragon', AutoDragon);
