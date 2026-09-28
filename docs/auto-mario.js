import { createDriver, drive } from './mario/ai.js';
import { MarioAudio } from './mario/audio.js';
import { IDLE, createGame, defeat, step } from './mario/game.js';
import { FIRE_SUIT, PALETTE, drawActor } from './mario/sprites.js';
import {
	GROUND_Y,
	LEVEL_H,
	TILE,
	Tile,
	VIEW_TILES_X,
	VIEW_TILES_Y,
	idx,
	isSolid,
} from './mario/tiles.js';
import {
	FRAME,
	paintBlock,
	paintCabinet,
	paintOrb,
	readBackground,
	roundRectPath,
	shade,
} from './cv/game-frame.js';

const THEMES = {
	overworld: {
		ground: '#1e293b',
		top: '#38bdf8',
		brick: '#475569',
		pipe: '#34d399',
		wash: 'rgba(56, 189, 248, 0.07)',
	},
	athletic: {
		ground: '#1e293b',
		top: '#38bdf8',
		brick: '#475569',
		pipe: '#34d399',
		wash: 'rgba(56, 189, 248, 0.07)',
	},
	bridge: {
		ground: '#1e293b',
		top: '#38bdf8',
		brick: '#475569',
		pipe: '#34d399',
		wash: 'rgba(45, 212, 191, 0.08)',
	},
	underground: {
		ground: '#1e1b4b',
		top: '#a78bfa',
		brick: '#4338ca',
		pipe: '#34d399',
		wash: 'rgba(167, 139, 250, 0.1)',
	},
	castle: {
		ground: '#3f1d24',
		top: '#fb7185',
		brick: '#9f1239',
		pipe: '#fb7185',
		wash: 'rgba(251, 113, 133, 0.08)',
	},
	underwater: {
		ground: '#134e4a',
		top: '#2dd4bf',
		brick: '#0f766e',
		pipe: '#5eead4',
		wash: 'rgba(45, 212, 191, 0.16)',
	},
};

function clampWidth(raw) {
	const parsed = Number.parseInt(raw ?? '', 10);
	const value = Number.isFinite(parsed) ? parsed : 507;
	return Math.min(960, Math.max(360, value));
}

class AutoMario extends HTMLElement {
	static get observedAttributes() {
		return ['size', 'background'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.running = false;
		this.rafId = null;
		this.lastTime = 0;
		this.acc = 0;
		this.driver = createDriver();
		this.stuck = 0;
		this.stuckX = 0;
		this.popups = [];
		this.audio = new MarioAudio();
		this.background = this.getBackground();
		this.applySize(this.getWidth());
		this.state = createGame();
	}

	connectedCallback() {
		this.renderRoot();
		this.running = true;
		this.lastTime = performance.now();
		this.rafId = requestAnimationFrame((time) => this.loop(time));
	}

	disconnectedCallback() {
		this.running = false;
		if (this.rafId) cancelAnimationFrame(this.rafId);
		this.rafId = null;
		this.audio.dispose();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === 'background') {
			this.background = this.getBackground();
			return;
		}
		if (name === 'size') {
			const next = this.getWidth();
			if (next === this.width) return;
			this.applySize(next);
			if (this.isConnected) this.renderRoot();
		}
	}

	getWidth() {
		return clampWidth(this.getAttribute('size'));
	}

	getBackground() {
		return readBackground(this.getAttribute('background'));
	}

	applySize(width) {
		this.width = width;
		this.hudHeight = Math.max(28, Math.round(width * 0.05));
		this.playHeight = Math.round(width * (VIEW_TILES_Y / VIEW_TILES_X));
		this.height = this.playHeight + this.hudHeight;
		this.scale = this.width / (VIEW_TILES_X * TILE);
	}

	renderRoot() {
		const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
		this.dpr = dpr;
		const pressed = this.audio.enabled;
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: min(100%, ${this.width}px);
          aspect-ratio: ${this.width} / ${this.height};
          margin: 0.35rem 0 0.85rem;
          box-sizing: border-box;
        }

        canvas {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: ${FRAME.background};
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          box-shadow:
            0 0 0 1px rgba(148, 163, 184, 0.28),
            0 10px 28px rgba(2, 6, 23, 0.28);
        }

        button.sound {
          position: absolute;
          top: 5px;
          right: 8px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 24px;
          padding: 0 9px 0 7px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.38);
          background: rgba(8, 15, 30, 0.92);
          color: ${FRAME.ink};
          font: 600 11px ${FRAME.font};
          letter-spacing: 0.02em;
          cursor: pointer;
        }

        button.sound[aria-pressed='true'] {
          color: #7dd3fc;
          border-color: rgba(56, 189, 248, 0.75);
        }

        button.sound:focus-visible {
          outline: 2px solid #7dd3fc;
          outline-offset: 2px;
        }

        button.sound svg {
          display: block;
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      </style>
      <canvas width="${Math.round(this.width * dpr)}" height="${Math.round(this.height * dpr)}"></canvas>
      <button type="button" class="sound" aria-pressed="${pressed ? 'true' : 'false'}" aria-label="${pressed ? 'Выключить звук' : 'Включить звук'}">
        ${speakerIcon(pressed)}
        <span>Звук</span>
      </button>
    `;
		this.canvas = this.shadowRoot.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;
		this.button = this.shadowRoot.querySelector('button.sound');
		this.button.addEventListener('click', () => this.toggleSound());
	}

	toggleSound() {
		const next = !this.audio.enabled;
		this.audio.setEnabled(next);
		if (this.button) {
			this.button.setAttribute('aria-pressed', next ? 'true' : 'false');
			this.button.setAttribute(
				'aria-label',
				next ? 'Выключить звук' : 'Включить звук',
			);
			this.button.innerHTML = `${speakerIcon(next)}<span>Звук</span>`;
		}
	}

	loop(time) {
		if (!this.running) return;
		const dt = Math.min(48, time - this.lastTime);
		this.lastTime = time;
		this.acc += dt;
		let guard = 0;
		while (this.acc >= 1000 / 60 && guard < 3) {
			this.acc -= 1000 / 60;
			this.fixedStep();
			guard += 1;
		}
		this.draw();
		this.audio.update(this.state);
		this.rafId = requestAnimationFrame((next) => this.loop(next));
	}

	fixedStep() {
		const state = this.state;
		if (state.mode === 'play') {
			if (state.mario.x <= this.stuckX + 0.4) this.stuck += 1;
			else {
				this.stuck = 0;
				this.stuckX = state.mario.x;
			}
			if (this.stuck === 110) {
				this.driver.action = {
					dir: 1,
					run: true,
					jump: 'full',
					down: false,
				};
				this.driver.cooldown = 30;
			}
			if (this.stuck === 170) {
				this.driver.action = {
					dir: -1,
					run: true,
					jump: 'none',
					down: false,
				};
				this.driver.cooldown = 18;
			}
			if (this.stuck > 520) {
				defeat(state, 'stuck');
				this.stuck = 0;
			}
		} else {
			this.stuck = 0;
		}
		const action = drive(state, this.driver);
		step(state, state.mode === 'play' ? action : IDLE);
		this.consume(state.events);
	}

	consume(events) {
		for (const event of events) {
			this.audio.play(event.type);
			const text =
				event.text ??
				(event.type === 'coin'
					? '200'
					: event.type === 'oneup'
						? '1UP'
						: '');
			if (!text || event.x == null) continue;
			this.popups.push({ x: event.x, y: event.y, text, life: 42 });
		}
	}

	draw() {
		const ctx = this.ctx;
		const state = this.state;
		if (!ctx || !state?.mario) return;
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		paintCabinet(ctx, this.width, this.height, this.background);
		const theme = THEMES[state.theme] ?? THEMES.overworld;
		ctx.fillStyle = theme.wash;
		ctx.fillRect(0, this.hudHeight, this.width, this.playHeight);

		ctx.save();
		ctx.beginPath();
		ctx.rect(0, this.hudHeight, this.width, this.playHeight);
		ctx.clip();
		const scale = this.dpr * this.scale;
		ctx.imageSmoothingEnabled = false;
		ctx.setTransform(
			scale,
			0,
			0,
			scale,
			-Math.round(state.camX * scale),
			Math.round(this.hudHeight * this.dpr),
		);
		this.drawBackdrop(theme);
		this.drawTiles(theme);
		this.drawFlag();
		this.drawActors();
		this.drawPopups();
		ctx.restore();

		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.drawHud();
		this.drawBanner();
	}

	drawBackdrop(theme) {
		const ctx = this.ctx;
		const state = this.state;
		const cam = state.camX;
		if (state.theme === 'castle') return;
		for (let i = 0; i < 6; i += 1) {
			const x = i * 150 - ((cam * 0.35) % 150);
			ctx.fillStyle =
				state.theme === 'underground'
					? 'rgba(167, 139, 250, 0.08)'
					: 'rgba(148, 163, 184, 0.09)';
			ctx.beginPath();
			ctx.ellipse(x, 210, 54, 18, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		if (state.theme !== 'underground') {
			for (let i = 0; i < 5; i += 1) {
				const x = 30 + i * 120 - ((cam * 0.15) % 120);
				roundRectPath(ctx, x, 28 + (i % 3) * 10, 36, 14, 7);
				ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
				ctx.fill();
			}
		}
		if (state.theme === 'bridge' || state.theme === 'underwater') {
			ctx.fillStyle =
				state.theme === 'underwater'
					? 'rgba(45, 212, 191, 0.18)'
					: 'rgba(45, 212, 191, 0.22)';
			ctx.fillRect(cam - 20, 228, VIEW_TILES_X * TILE + 80, 40);
			ctx.fillStyle = theme.top;
			ctx.globalAlpha = 0.35;
			ctx.fillRect(cam - 20, 226, VIEW_TILES_X * TILE + 80, 3);
			ctx.globalAlpha = 1;
		}
	}

	drawTiles(theme) {
		const ctx = this.ctx;
		const state = this.state;
		const x0 = Math.max(0, Math.floor(state.camX / TILE) - 1);
		const x1 = Math.min(state.w - 1, x0 + VIEW_TILES_X + 3);
		for (let ty = 0; ty < LEVEL_H; ty += 1) {
			for (let tx = x0; tx <= x1; tx += 1) {
				const tile = state.tiles[idx(tx, ty, state.w)];
				if (
					tile === Tile.Empty ||
					tile === Tile.HiddenCoin ||
					tile === Tile.HiddenOneUp
				) {
					continue;
				}
				const x = tx * TILE;
				const y = ty * TILE;
				if (tile === Tile.Lava) {
					ctx.fillStyle =
						state.theme === 'bridge' ? '#0f766e' : '#fb7185';
					ctx.globalAlpha =
						0.85 + Math.sin(state.tick / 8 + tx) * 0.1;
					ctx.fillRect(x, y, TILE, TILE);
					ctx.globalAlpha = 1;
					continue;
				}
				if (
					tile === Tile.Question ||
					tile === Tile.Mushroom ||
					tile === Tile.Star ||
					tile === Tile.MultiCoin
				) {
					paintBlock(
						ctx,
						x + 0.5,
						y + 0.5,
						TILE - 1,
						TILE - 1,
						FRAME.gold,
						3,
					);
					ctx.fillStyle = '#0b1220';
					ctx.font = `700 11px ${FRAME.font}`;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(tile === Tile.Star ? '★' : '?', x + 8, y + 9);
					continue;
				}
				if (tile === Tile.Used) {
					paintBlock(
						ctx,
						x + 0.5,
						y + 0.5,
						TILE - 1,
						TILE - 1,
						'#334155',
						3,
					);
					continue;
				}
				if (tile === Tile.Brick) {
					paintBlock(
						ctx,
						x + 0.5,
						y + 0.5,
						TILE - 1,
						TILE - 1,
						theme.brick,
						2,
					);
					continue;
				}
				if (tile === Tile.Pipe || tile === Tile.ExitPipe) {
					const lip =
						ty === 0 ||
						!isSolid(state.tiles[idx(tx, ty - 1, state.w)]);
					paintBlock(
						ctx,
						x + (lip ? 0 : 2),
						y,
						TILE - (lip ? 0 : 4),
						TILE,
						tile === Tile.ExitPipe ? FRAME.player : theme.pipe,
						lip ? 4 : 2,
					);
					continue;
				}
				if (tile === Tile.Cannon) {
					paintBlock(ctx, x + 1, y, TILE - 2, TILE, '#334155', 2);
					ctx.fillStyle = '#0b1220';
					ctx.fillRect(x + 4, y + 5, 8, 6);
					continue;
				}
				if (tile === Tile.Platform || tile === Tile.Bridge) {
					paintBlock(
						ctx,
						x,
						y + 2,
						TILE,
						10,
						tile === Tile.Bridge ? '#7f1d1d' : FRAME.player,
						2,
					);
					continue;
				}
				ctx.fillStyle = theme.ground;
				ctx.fillRect(x, y, TILE, TILE);
				ctx.fillStyle = theme.top;
				ctx.fillRect(x, y, TILE, 3);
				ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
				ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
			}
		}
	}

	drawFlag() {
		const ctx = this.ctx;
		const state = this.state;
		const exit = state.exit;
		if (!exit) return;
		if (exit.type === 'flag') {
			const x = exit.x;
			ctx.strokeStyle = FRAME.ink;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x, 2 * TILE);
			ctx.lineTo(x, GROUND_Y * TILE);
			ctx.stroke();
			const wave = Math.sin(state.tick / 8) * 2;
			const flagY = state.mode === 'pole' ? state.mario.y : 3 * TILE;
			ctx.fillStyle = FRAME.gold;
			ctx.beginPath();
			ctx.moveTo(x, flagY);
			ctx.lineTo(x + 16, flagY + 6 + wave);
			ctx.lineTo(x, flagY + 12);
			ctx.fill();
			paintBlock(
				ctx,
				state.castleX,
				GROUND_Y * TILE - 48,
				36,
				48,
				'#334155',
				3,
			);
			ctx.fillStyle = '#0b1220';
			ctx.fillRect(state.castleX + 12, GROUND_Y * TILE - 22, 12, 22);
			return;
		}
		if (exit.type === 'axe' && !state.exitDone) {
			paintBlock(
				ctx,
				exit.x,
				GROUND_Y * TILE - 32,
				12,
				22,
				FRAME.gold,
				2,
			);
			ctx.fillStyle = shade(FRAME.gold, -0.2);
			ctx.fillRect(exit.x - 6, GROUND_Y * TILE - 36, 24, 6);
		}
	}

	drawActors() {
		const state = this.state;
		for (const lift of state.lifts) {
			paintBlock(this.ctx, lift.x, lift.y, lift.w, lift.h, FRAME.gold, 3);
		}
		for (const item of state.items) this.drawItem(item);
		for (const hazard of state.hazards) this.drawHazard(hazard);
		for (const enemy of state.enemies) this.drawEnemy(enemy);
		for (const shot of state.shots) {
			drawActor(this.ctx, 'fireball', shot);
		}
		this.drawMario();
	}

	drawItem(item) {
		const ctx = this.ctx;
		if (item.kind === 'coin') {
			const spin =
				0.35 + Math.abs(Math.sin(this.state.tick / 7 + item.x)) * 0.65;
			paintOrb(ctx, item.x + 6, item.y + 8, 6 * spin + 1, FRAME.gold);
			return;
		}
		if (item.kind === 'mushroom' || item.kind === 'oneup') {
			drawActor(ctx, 'mushroom', item, {
				replace:
					item.kind === 'oneup'
						? { R: PALETTE.G, r: PALETTE.g }
						: null,
			});
			return;
		}
		if (item.kind === 'flower') {
			drawActor(ctx, 'flower', item);
			return;
		}
		if (item.kind === 'star') {
			drawActor(ctx, 'star', item);
		}
	}

	drawHazard(hazard) {
		const ctx = this.ctx;
		if (hazard.kind === 'firebar') {
			for (let i = 0; i < hazard.len; i += 1) {
				const dist = i * 11;
				paintOrb(
					ctx,
					hazard.x + Math.cos(hazard.angle) * dist,
					hazard.y + Math.sin(hazard.angle) * dist,
					i === 0 ? 5 : 3.5,
					FRAME.amber,
				);
			}
			return;
		}
		if (hazard.kind === 'podoboo' && hazard.y < hazard.origin - 2) {
			drawActor(ctx, 'fireball', hazard);
		}
		if (hazard.kind === 'hammer') {
			drawActor(ctx, 'hammer', hazard, { flip: hazard.vx < 0 });
		}
		if (hazard.kind === 'lakitu' && hazard.respawn <= 0) {
			drawActor(ctx, 'lakitu', hazard);
		}
	}

	drawEnemy(enemy) {
		const ctx = this.ctx;
		const flip = enemy.dir < 0;
		if (enemy.kind === 'goomba') {
			drawActor(ctx, enemy.squish > 0 ? 'goombaFlat' : 'goomba', enemy);
			return;
		}
		if (
			enemy.kind === 'koopa' ||
			enemy.kind === 'buzzy' ||
			enemy.kind === 'paratroopa'
		) {
			if (enemy.kind === 'paratroopa' && enemy.winged !== false) {
				ctx.fillStyle = PALETTE.W;
				ctx.fillRect(enemy.x - 3, enemy.y + 8, 5, 3);
				ctx.fillRect(enemy.x + enemy.w - 2, enemy.y + 8, 5, 3);
			}
			const replace =
				enemy.kind === 'buzzy'
					? { G: '#5a5a5a', g: '#2e2e2e', Y: '#d8d8d8' }
					: enemy.red
						? { G: PALETTE.R, g: PALETTE.r, Y: PALETTE.Y }
						: null;
			drawActor(ctx, 'koopa', enemy, { flip, replace });
			return;
		}
		if (enemy.kind === 'shell') {
			drawActor(ctx, 'shell', enemy);
			return;
		}
		if (enemy.kind === 'piranha' && enemy.exposed) {
			drawActor(ctx, 'piranha', enemy);
			return;
		}
		if (enemy.kind === 'bowser') {
			drawActor(ctx, 'bowser', enemy, { flip: enemy.dir > 0 });
			return;
		}
		if (enemy.kind === 'hammerbro') {
			drawActor(ctx, 'bro', enemy, { flip });
			return;
		}
		if (enemy.kind === 'cheep' || enemy.kind === 'jumpcheep') {
			drawActor(ctx, 'cheep', enemy, {
				flip,
				replace: enemy.kind === 'jumpcheep' ? { R: PALETTE.G } : null,
			});
			return;
		}
		if (enemy.kind === 'blooper') {
			drawActor(ctx, 'blooper', enemy);
			return;
		}
		if (enemy.kind === 'bullet') {
			drawActor(ctx, 'bullet', enemy, { flip });
			return;
		}
		if (enemy.kind === 'spiny' || enemy.kind === 'spinyfly') {
			drawActor(ctx, 'spiny', enemy, { flip });
		}
	}

	drawMario() {
		const ctx = this.ctx;
		const mario = this.state.mario;
		const blink =
			mario.invuln > 0 && Math.floor(this.state.tick / 4) % 2 === 0;
		if (blink && !mario.dead) ctx.globalAlpha = 0.45;
		const tall = mario.form !== 'small';
		const walking =
			!mario.dead &&
			mario.onGround &&
			Math.abs(mario.vx) > 0.2 &&
			Math.floor(this.state.tick / 6) % 2 === 1;
		let replace = null;
		if (mario.star > 0) {
			const cycle = [
				{ R: PALETTE.Y, B: PALETTE.W, H: PALETTE.O },
				{ R: PALETTE.G, B: PALETTE.Y, H: PALETTE.R },
				{ R: '#f8f8f8', B: PALETTE.O, H: PALETTE.B },
			];
			replace = cycle[Math.floor(this.state.tick / 4) % cycle.length];
		} else if (mario.form === 'fire') {
			replace = FIRE_SUIT;
		}
		drawActor(
			ctx,
			tall ? 'marioBig' : 'marioSmall',
			{ ...mario, y: mario.y + (walking ? -1 : 0) },
			{
				flip: mario.dir < 0,
				flipY: Boolean(mario.dead),
				replace,
			},
		);
		if (mario.form === 'fire' && mario.fireCd > 8 && !mario.dead) {
			const left = mario.dir < 0;
			ctx.fillStyle = FIRE_SUIT.R;
			ctx.fillRect(
				Math.round(mario.x + (left ? -4 : mario.w)),
				Math.round(mario.y + mario.h * 0.42),
				4,
				3,
			);
		}
		ctx.globalAlpha = 1;
	}

	drawPopups() {
		const ctx = this.ctx;
		ctx.font = `700 8px ${FRAME.font}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		this.popups = this.popups.filter((popup) => popup.life > 0);
		for (const popup of this.popups) {
			popup.life -= 1;
			popup.y -= 0.35;
			ctx.globalAlpha = Math.max(0, popup.life / 42);
			ctx.fillStyle = FRAME.ink;
			ctx.fillText(popup.text, popup.x, popup.y);
		}
		ctx.globalAlpha = 1;
	}

	drawHud() {
		const ctx = this.ctx;
		const state = this.state;
		const hud = this.hudHeight;
		ctx.fillStyle = FRAME.hud;
		ctx.fillRect(0, 0, this.width, hud);
		ctx.strokeStyle = FRAME.line;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, hud + 0.5);
		ctx.lineTo(this.width, hud + 0.5);
		ctx.stroke();

		const fontSize = Math.max(10, Math.round(hud * 0.42));
		ctx.font = `${fontSize}px ${FRAME.font}`;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		const y = hud * 0.52;
		ctx.fillStyle = '#7dd3fc';
		ctx.fillText('MARIO', 10, y);
		const coins = String(state.coinTotal % 100).padStart(2, '0');
		const narrow = this.width < 560;
		const parts = narrow
			? [
					`${state.world}-${state.stage}`,
					`¤${coins}`,
					`×${state.lives}`,
					`${state.time}`,
				]
			: [
					`W ${state.world}-${state.stage}`,
					`¤ ${coins}`,
					`SCORE ${String(state.score).padStart(6, '0')}`,
					`× ${state.lives}`,
					`TIME ${state.time}`,
				];
		ctx.fillStyle = FRAME.ink;
		let x = 10 + ctx.measureText('MARIO').width + 16;
		const reserve = 78;
		for (const part of parts) {
			const width = ctx.measureText(part).width;
			if (x + width > this.width - reserve) break;
			ctx.fillText(part, x, y);
			x += width + 14;
		}
	}

	drawBanner() {
		const state = this.state;
		const mode = state.mode;
		if (
			mode !== 'card' &&
			mode !== 'gameover' &&
			mode !== 'victory' &&
			mode !== 'clear'
		) {
			return;
		}
		const ctx = this.ctx;
		ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
		ctx.fillRect(0, this.hudHeight, this.width, this.playHeight);
		let title = `WORLD ${state.world}-${state.stage}`;
		let detail = '';
		if (mode === 'gameover') title = 'GAME OVER';
		if (mode === 'victory') {
			title = 'COURSE CLEAR';
			detail = '8-4';
		}
		if (mode === 'clear') title = 'COURSE CLEAR';
		ctx.fillStyle = FRAME.ink;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = `700 ${Math.max(16, Math.round(this.width * 0.04))}px ${FRAME.font}`;
		ctx.fillText(
			title,
			this.width / 2,
			this.hudHeight + this.playHeight * 0.46,
		);
		if (detail) {
			ctx.fillStyle = FRAME.gold;
			ctx.font = `${Math.max(12, Math.round(this.width * 0.028))}px ${FRAME.font}`;
			ctx.fillText(
				detail,
				this.width / 2,
				this.hudHeight + this.playHeight * 0.58,
			);
		}
		ctx.textAlign = 'left';
	}
}

function speakerIcon(on) {
	const slash = on ? '' : '<path d="M3 3l10 10" />';
	return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6.2h2.2L8 3.6v8.8L4.7 9.8H2.5z"/><path d="M10 6.2a2.6 2.6 0 0 1 0 3.6" />${slash}</svg>`;
}

if (!customElements.get('auto-mario')) {
	customElements.define('auto-mario', AutoMario);
}
