class AutoArkanoid extends HTMLElement {
	// Публичные параметры веб-компонента:
	// - size: размер игрового поля в px (квадрат), по умолчанию 300, диапазон 180..800.
	// - background: цвет фона canvas (любой CSS color), по умолчанию transparent.
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		// Базовые параметры сетки кирпичей.
		this.brickRows = 5;
		this.brickCols = 7;
		this.defaultSize = 300;
		this.minSize = 180;
		this.maxSize = 800;

		// Флаги и тайминг анимации.
		this.running = false;
		this.animationFrame = null;
		this.lastTime = 0;

		// Текущее состояние кирпичей.
		this.applyFieldSize(this.getFieldSizeFromAttribute());
		this.background = this.getBackgroundFromAttribute();
		this.score = 0;
		this.bricks = this.createBricks();
		this.resetRound();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		if (name === 'size') {
			const nextSize = this.getFieldSizeFromAttribute();
			if (nextSize === this.width) return;

			this.applyFieldSize(nextSize);
			this.restartGame();

			if (!this.isConnected) return;
			this.renderRoot();
			this.ctx = this.canvas.getContext('2d');
			return;
		}

		if (name === 'background') {
			this.background = this.getBackgroundFromAttribute();
		}
	}

	getFieldSizeFromAttribute() {
		// Читаем параметр size из атрибута:
		// <auto-arkanoid size="360"></auto-arkanoid>
		const rawSize = Number.parseInt(this.getAttribute('size') ?? '', 10);
		const normalizedSize = Number.isFinite(rawSize) ? rawSize : this.defaultSize;
		return Math.min(this.maxSize, Math.max(this.minSize, normalizedSize));
	}

	getBackgroundFromAttribute() {
		// Читаем параметр background из атрибута:
		// <auto-arkanoid background="#101522"></auto-arkanoid>
		// Если значение не задано, оставляем прозрачный фон.
		const background = this.getAttribute('background');
		if (!background || !background.trim()) return 'transparent';
		return background.trim();
	}

	applyFieldSize(size) {
		this.width = size;
		this.height = size;

		// Параметры счета и сетки кирпичей.
		this.brickPadding = Math.max(2, Math.round(size * 0.013));
		this.brickHeight = Math.max(10, Math.round(size * 0.047));
		this.brickOffsetTop = Math.max(20, Math.round(size * 0.1));
		this.brickOffsetLeft = Math.max(8, Math.round(size * 0.033));
		this.brickWidth =
			(this.width -
				this.brickOffsetLeft * 2 -
				this.brickPadding * (this.brickCols - 1)) /
			this.brickCols;

		// Параметры платформы.
		this.paddleWidth = Math.max(44, Math.round(size * 0.193));
		this.paddleHeight = Math.max(6, Math.round(size * 0.027));
		this.paddleY = this.height - Math.max(14, Math.round(size * 0.06));
		this.paddleX = (this.width - this.paddleWidth) / 2;
		this.paddleSpeed = size * 0.014;

		// Параметры мяча и стартовая скорость.
		this.ballRadius = Math.max(4, Math.round(size * 0.017));
		this.ballSpeed = size * 0.0093;
		this.ballStartOffset = Math.max(24, Math.round(size * 0.117));
		this.scoreFontSize = Math.max(12, Math.round(size * 0.04));
	}

	connectedCallback() {
		this.renderRoot();
		this.ctx = this.canvas.getContext('2d');
		this.running = true;
		this.lastTime = performance.now();
		this.animationFrame = requestAnimationFrame((t) => this.loop(t));
	}

	disconnectedCallback() {
		this.running = false;
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	createBricks() {
		// Создаем двумерный массив кирпичей.
		const rows = [];
		for (let r = 0; r < this.brickRows; r += 1) {
			const row = [];
			for (let c = 0; c < this.brickCols; c += 1) {
				row.push({
					x:
						this.brickOffsetLeft +
						c * (this.brickWidth + this.brickPadding),
					y:
						this.brickOffsetTop +
						r * (this.brickHeight + this.brickPadding),
					alive: true,
				});
			}
			rows.push(row);
		}
		return rows;
	}

	resetRound() {
		// Перезапуск только текущей попытки (без сброса очков/кирпичей).
		this.ballX = this.width / 2;
		this.ballY = this.height - this.ballStartOffset;
		this.ballVX = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1) * 0.9;
		this.ballVY = -this.ballSpeed;
		this.paddleX = (this.width - this.paddleWidth) / 2;
	}

	restartGame() {
		// Полный рестарт после очистки всех кирпичей.
		this.score = 0;
		this.bricks = this.createBricks();
		this.resetRound();
	}

	getAliveBricksCount() {
		// Подсчет оставшихся кирпичей.
		let count = 0;
		for (let r = 0; r < this.brickRows; r += 1) {
			for (let c = 0; c < this.brickCols; c += 1) {
				if (this.bricks[r][c].alive) count += 1;
			}
		}
		return count;
	}

	updateAutopilot(dtFactor) {
		let targetX = this.ballX;

		// Прогнозируем X-точку, где мяч достигнет линии платформы.
		if (this.ballVY > 0) {
			const dy = this.paddleY - this.ballY;
			const t = dy / this.ballVY;
			if (t > 0) {
				targetX = this.ballX + this.ballVX * t;

				// Учитываем отражения прогноза от боковых стен.
				const span = this.width - this.ballRadius * 2;
				let normalized = targetX - this.ballRadius;
				while (normalized < 0 || normalized > span) {
					if (normalized < 0) normalized = -normalized;
					if (normalized > span) normalized = span * 2 - normalized;
				}
				targetX = normalized + this.ballRadius;
			}
		}

		const paddleCenter = this.paddleX + this.paddleWidth / 2;
		const delta = targetX - paddleCenter;
		const step = this.paddleSpeed * dtFactor;

		if (Math.abs(delta) > step) {
			this.paddleX += step * Math.sign(delta);
		} else {
			this.paddleX += delta;
		}

		if (this.paddleX < 0) this.paddleX = 0;
		if (this.paddleX + this.paddleWidth > this.width) {
			this.paddleX = this.width - this.paddleWidth;
		}
	}

	handleWallCollisions() {
		if (this.ballX - this.ballRadius <= 0 && this.ballVX < 0) {
			this.ballX = this.ballRadius;
			this.ballVX = -this.ballVX;
		}
		if (this.ballX + this.ballRadius >= this.width && this.ballVX > 0) {
			this.ballX = this.width - this.ballRadius;
			this.ballVX = -this.ballVX;
		}
		if (this.ballY - this.ballRadius <= 0 && this.ballVY < 0) {
			this.ballY = this.ballRadius;
			this.ballVY = -this.ballVY;
		}
	}

	handlePaddleCollision() {
		const paddleTop = this.paddleY;
		const paddleBottom = this.paddleY + this.paddleHeight;
		const paddleLeft = this.paddleX;
		const paddleRight = this.paddleX + this.paddleWidth;

		const hitY =
			this.ballY + this.ballRadius >= paddleTop &&
			this.ballY - this.ballRadius <= paddleBottom;
		const hitX =
			this.ballX + this.ballRadius >= paddleLeft &&
			this.ballX - this.ballRadius <= paddleRight;

		if (hitX && hitY && this.ballVY > 0) {
			this.ballY = paddleTop - this.ballRadius;

			// Угол отскока зависит от точки попадания по платформе.
			const hitPos =
				(this.ballX - (paddleLeft + this.paddleWidth / 2)) /
				(this.paddleWidth / 2);
			const clamped = Math.max(-1, Math.min(1, hitPos));
			const maxBounce = 1.1; // radians
			const randomJitter = (Math.random() - 0.5) * 0.16; // Небольшая случайная вариация угла.
			const angle = clamped * maxBounce + randomJitter;
			const speed = Math.hypot(this.ballVX, this.ballVY);

			this.ballVX = speed * Math.sin(angle);
			this.ballVY = -Math.abs(speed * Math.cos(angle));

			// Защита от почти вертикальной траектории (иначе возможен "вечный" цикл).
			const minHorizontal = speed * 0.16;
			if (Math.abs(this.ballVX) < minHorizontal) {
				this.ballVX = minHorizontal * (Math.random() > 0.5 ? 1 : -1);
				this.ballVY = -Math.sqrt(
					Math.max(0.01, speed * speed - this.ballVX * this.ballVX),
				);
			}
		}
	}

	handleBrickCollisions() {
		for (let r = 0; r < this.brickRows; r += 1) {
			for (let c = 0; c < this.brickCols; c += 1) {
				const brick = this.bricks[r][c];
				if (!brick.alive) continue;

				const bx = brick.x;
				const by = brick.y;
				const bw = this.brickWidth;
				const bh = this.brickHeight;

				const closestX = Math.max(bx, Math.min(this.ballX, bx + bw));
				const closestY = Math.max(by, Math.min(this.ballY, by + bh));
				const dx = this.ballX - closestX;
				const dy = this.ballY - closestY;

				if (dx * dx + dy * dy <= this.ballRadius * this.ballRadius) {
					brick.alive = false;
					this.score += 10;

					// Выбираем ось отскока по минимальной глубине пересечения.
					const overlapLeft = this.ballX + this.ballRadius - bx;
					const overlapRight =
						bx + bw - (this.ballX - this.ballRadius);
					const overlapTop = this.ballY + this.ballRadius - by;
					const overlapBottom =
						by + bh - (this.ballY - this.ballRadius);
					const minX = Math.min(overlapLeft, overlapRight);
					const minY = Math.min(overlapTop, overlapBottom);

					if (minX < minY) {
						this.ballVX = -this.ballVX;
					} else {
						this.ballVY = -this.ballVY;
					}

					return;
				}
			}
		}
	}

	update(dt) {
		// Нормализация шага обновления к 60 FPS для стабильной физики.
		const dtFactor = dt / (1000 / 60);
		const clampedFactor = Math.max(0.6, Math.min(1.8, dtFactor));

		this.updateAutopilot(clampedFactor);

		this.ballX += this.ballVX * clampedFactor;
		this.ballY += this.ballVY * clampedFactor;

		this.handleWallCollisions();
		this.handlePaddleCollision();
		this.handleBrickCollisions();

		if (this.ballY - this.ballRadius > this.height) {
			// Если мяч упал ниже экрана, начинаем новую попытку.
			this.resetRound();
		}

		if (this.getAliveBricksCount() === 0) {
			// Когда все кирпичи уничтожены, запускаем новый цикл игры.
			this.restartGame();
		}
	}

	drawBackground() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		if (this.background === 'transparent') return;
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	drawBricks() {
		this.ctx.fillStyle = '#59d4ff';
		for (let r = 0; r < this.brickRows; r += 1) {
			for (let c = 0; c < this.brickCols; c += 1) {
				const brick = this.bricks[r][c];
				if (!brick.alive) continue;
				this.ctx.fillRect(
					brick.x,
					brick.y,
					this.brickWidth,
					this.brickHeight,
				);
			}
		}
	}

	drawPaddle() {
		this.ctx.fillStyle = '#ffd166';
		this.ctx.fillRect(
			this.paddleX,
			this.paddleY,
			this.paddleWidth,
			this.paddleHeight,
		);
	}

	drawBall() {
		this.ctx.fillStyle = '#ef476f';
		this.ctx.beginPath();
		this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
		this.ctx.fill();
	}

	drawScore() {
		this.ctx.fillStyle = '#ffffff';
		this.ctx.font = `${this.scoreFontSize}px monospace`;
		this.ctx.fillText(`Score: ${this.score}`, 10, this.scoreFontSize + 2);
	}

	draw() {
		this.drawBackground();
		this.drawBricks();
		this.drawPaddle();
		this.drawBall();
		this.drawScore();
	}

	loop(timestamp) {
		// Главный цикл: обновление состояния и отрисовка кадра.
		if (!this.running) return;
		const dt = timestamp - this.lastTime;
		this.lastTime = timestamp;

		this.update(dt);
		this.draw();

		this.animationFrame = requestAnimationFrame((t) => this.loop(t));
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
          border: 1px solid #2d3447;
          border-radius: 8px;
          image-rendering: auto;
        }
      </style>
      <canvas width="${this.width}" height="${this.height}"></canvas>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
	}
}

customElements.define('auto-arkanoid', AutoArkanoid);
