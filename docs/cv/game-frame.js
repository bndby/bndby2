// Общая визуальная рамка мини-игр на странице резюме.
export const FRAME = {
	defaultSize: 220,
	minSize: 176,
	maxSize: 880,
	background: '#0b1220',
	ink: '#e2e8f0',
	muted: '#94a3b8',
	line: 'rgba(148, 163, 184, 0.22)',
	hud: 'rgba(8, 15, 30, 0.78)',
	player: '#38bdf8',
	enemy: '#fb7185',
	gold: '#fbbf24',
	mint: '#34d399',
	violet: '#a78bfa',
	amber: '#fb923c',
	font: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

export function clampSize(raw, fallback = FRAME.defaultSize) {
	const parsed = Number.parseInt(raw ?? '', 10);
	const value = Number.isFinite(parsed) ? parsed : fallback;
	return Math.min(FRAME.maxSize, Math.max(FRAME.minSize, value));
}

export function readBackground(value, fallback = FRAME.background) {
	if (!value || !value.trim()) return fallback;
	return value.trim();
}

export function renderFrame(shadowRoot, width, height) {
	const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
	const pixelWidth = Math.max(1, Math.round(width * dpr));
	const pixelHeight = Math.max(1, Math.round(height * dpr));

	shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width}px;
          height: ${height}px;
          margin: 0.35rem 0 0.85rem;
          box-sizing: border-box;
        }

        canvas {
          display: block;
          width: ${width}px;
          height: ${height}px;
          border-radius: 12px;
          background: ${FRAME.background};
          box-shadow:
            0 0 0 1px rgba(148, 163, 184, 0.28),
            0 10px 28px rgba(2, 6, 23, 0.28);
        }
      </style>
      <canvas width="${pixelWidth}" height="${pixelHeight}"></canvas>
    `;

	const canvas = shadowRoot.querySelector('canvas');
	const ctx = canvas.getContext('2d');
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.imageSmoothingEnabled = true;
	return { canvas, ctx };
}

export function roundRectPath(ctx, x, y, w, h, r) {
	const radius = Math.max(0, Math.min(r, w / 2, h / 2));
	ctx.beginPath();
	if (radius <= 0) {
		ctx.rect(x, y, w, h);
		return;
	}
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}

export function shade(hex, amount) {
	const raw = String(hex).replace('#', '');
	const normalized =
		raw.length === 3
			? raw
					.split('')
					.map((char) => char + char)
					.join('')
			: raw;
	const num = Number.parseInt(normalized, 16);
	if (!Number.isFinite(num)) return hex;
	const channel = (shift) => {
		const value = (num >> shift) & 255;
		return Math.max(0, Math.min(255, value + Math.round(255 * amount)));
	};
	return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

export function paintCabinet(ctx, width, height, background) {
	ctx.clearRect(0, 0, width, height);
	if (!background || background === 'transparent') return;

	ctx.fillStyle = background;
	ctx.fillRect(0, 0, width, height);

	if (background !== FRAME.background) return;

	const glow = ctx.createRadialGradient(
		width * 0.5,
		height * 0.18,
		width * 0.04,
		width * 0.5,
		height * 0.42,
		width * 0.78,
	);
	glow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
	glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, width, height);

	const floor = ctx.createLinearGradient(0, height * 0.55, 0, height);
	floor.addColorStop(0, 'rgba(2, 6, 23, 0)');
	floor.addColorStop(1, 'rgba(2, 6, 23, 0.35)');
	ctx.fillStyle = floor;
	ctx.fillRect(0, 0, width, height);
}

export function paintBlock(ctx, x, y, w, h, color, radius) {
	if (w <= 0 || h <= 0) return;
	const r = radius ?? Math.min(w, h) * 0.18;
	const gradient = ctx.createLinearGradient(x, y, x, y + h);
	gradient.addColorStop(0, shade(color, 0.26));
	gradient.addColorStop(0.45, color);
	gradient.addColorStop(1, shade(color, -0.24));
	roundRectPath(ctx, x, y, w, h, r);
	ctx.fillStyle = gradient;
	ctx.fill();

	ctx.save();
	roundRectPath(ctx, x, y, w, h, r);
	ctx.clip();
	ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
	ctx.fillRect(x, y, w, Math.max(1, h * 0.2));
	ctx.restore();
}

export function paintOrb(ctx, x, y, r, color) {
	const gradient = ctx.createRadialGradient(
		x - r * 0.35,
		y - r * 0.4,
		r * 0.1,
		x,
		y,
		r,
	);
	gradient.addColorStop(0, '#ffffff');
	gradient.addColorStop(0.35, shade(color, 0.12));
	gradient.addColorStop(1, shade(color, -0.28));
	ctx.beginPath();
	ctx.fillStyle = gradient;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}

export function paintHud(ctx, width, barHeight, title, detail) {
	ctx.fillStyle = FRAME.hud;
	ctx.fillRect(0, 0, width, barHeight);
	ctx.strokeStyle = FRAME.line;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, barHeight + 0.5);
	ctx.lineTo(width, barHeight + 0.5);
	ctx.stroke();

	const fontSize = Math.max(11, Math.round(barHeight * 0.46));
	ctx.font = `${fontSize}px ${FRAME.font}`;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillStyle = '#7dd3fc';
	ctx.fillText(title, 10, barHeight * 0.52);
	const titleWidth = ctx.measureText(title).width;
	ctx.fillStyle = FRAME.ink;
	ctx.fillText(detail, 18 + titleWidth, barHeight * 0.52);
	ctx.textBaseline = 'alphabetic';
}

export function paintBanner(ctx, width, y, h, text) {
	ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
	ctx.fillRect(0, y, width, h);
	ctx.fillStyle = FRAME.ink;
	ctx.font = `${Math.max(12, Math.round(h * 0.36))}px ${FRAME.font}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, width / 2, y + h / 2);
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
}
