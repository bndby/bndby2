// Синтез без сэмплов: свой марш и эффекты, звук выключен, пока его не включат.
const NOTES = {
	G3: 196,
	A3: 220,
	C4: 262,
	D4: 294,
	E4: 330,
	F4: 349,
	G4: 392,
	A4: 440,
	B4: 494,
	C5: 523,
	D5: 587,
	E5: 659,
	F5: 698,
	G5: 784,
	A5: 880,
};

const THEMES = {
	overworld: [
		['C5', 1],
		['E5', 1],
		['G5', 1],
		['C5', 1],
		['F5', 1],
		['A5', 1],
		['G5', 2],
		['E5', 1],
		['D5', 1],
		['C5', 1],
		['D5', 1],
		['E5', 2],
		['G4', 2],
		['A4', 1],
		['C5', 1],
		['E5', 1],
		['D5', 1],
		['C5', 1],
		['D5', 1],
		['E5', 2],
		['G5', 1],
		['E5', 1],
		['C5', 2],
		['D5', 1],
		['F5', 1],
		['E5', 1],
		['D5', 1],
		['C5', 2],
		['G4', 2],
	],
	underground: [
		['A3', 1],
		['C4', 1],
		['E4', 1],
		['A4', 2],
		['G4', 1],
		['E4', 1],
		['D4', 2],
		['C4', 1],
		['D4', 1],
		['F4', 2],
		['E4', 2],
		['C4', 2],
		['A3', 2],
	],
	castle: [
		['G3', 2],
		['C4', 1],
		['G3', 1],
		['D4', 2],
		['A3', 2],
		['E4', 1],
		['D4', 1],
		['C4', 2],
		['G3', 2],
	],
	underwater: [
		['E4', 2],
		['G4', 2],
		['B4', 2],
		['A4', 2],
		['G4', 2],
		['E4', 2],
		['D4', 2],
		['E4', 4],
	],
	athletic: null,
	bridge: null,
};

THEMES.athletic = THEMES.overworld;
THEMES.bridge = THEMES.overworld;

export class MarioAudio {
	constructor() {
		this.enabled = false;
		this.ctx = null;
		this.theme = '';
		this.noteIndex = 0;
		this.nextTime = 0;
	}

	setEnabled(enabled) {
		this.enabled = enabled;
		if (!enabled) {
			if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
			this.theme = '';
			return;
		}
		const ctx = this.ensure();
		if (!ctx) {
			this.enabled = false;
			return;
		}
		if (ctx.state === 'suspended') ctx.resume();
		this.theme = '';
		this.nextTime = ctx.currentTime + 0.04;
	}

	ensure() {
		if (this.ctx) return this.ctx;
		const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
		if (!Ctx) return null;
		this.ctx = new Ctx();
		return this.ctx;
	}

	update(state) {
		if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
		const active =
			state.mode === 'play' ||
			state.mode === 'pole' ||
			state.mode === 'walkoff' ||
			state.mode === 'tally' ||
			state.mode === 'collapse';
		if (!active) {
			this.theme = '';
			return;
		}
		if (state.theme !== this.theme) {
			this.theme = state.theme;
			this.noteIndex = 0;
			this.nextTime = this.ctx.currentTime + 0.02;
		}
		const notes = THEMES[this.theme] ?? THEMES.overworld;
		const beat =
			this.theme === 'underwater'
				? 0.3
				: this.theme === 'castle'
					? 0.2
					: 0.17;
		const wave = this.theme === 'underwater' ? 'sine' : 'square';
		while (this.nextTime < this.ctx.currentTime + 0.28) {
			const [name, dur] = notes[this.noteIndex % notes.length];
			this.tone(
				NOTES[name],
				this.nextTime,
				Math.max(0.05, dur * beat * 0.86),
				wave,
				0.028,
			);
			this.nextTime += dur * beat;
			this.noteIndex += 1;
		}
	}

	play(type) {
		if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
		const now = this.ctx.currentTime;
		if (type === 'jump') this.tone(520, now, 0.08, 'square', 0.04, 180);
		else if (type === 'coin')
			this.tone(988, now, 0.07, 'square', 0.05, 1480);
		else if (type === 'stomp' || type === 'kick')
			this.tone(180, now, 0.07, 'square', 0.05, 70);
		else if (type === 'bump' || type === 'break')
			this.tone(140, now, 0.05, 'square', 0.04, 80);
		else if (type === 'power' || type === 'oneup') {
			[523, 659, 784, 1046].forEach((freq, index) => {
				this.tone(freq, now + index * 0.07, 0.08, 'square', 0.04);
			});
		} else if (type === 'death')
			this.tone(440, now, 0.35, 'square', 0.05, 90);
		else if (type === 'flag' || type === 'clear' || type === 'axe') {
			[523, 659, 784, 1046].forEach((freq, index) => {
				this.tone(freq, now + index * 0.09, 0.1, 'square', 0.04);
			});
		} else if (type === 'fire')
			this.tone(740, now, 0.05, 'square', 0.03, 360);
	}

	tone(freq, when, duration, type, gain, slideTo) {
		if (!freq || !this.ctx) return;
		const osc = this.ctx.createOscillator();
		const amp = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, when);
		if (slideTo) {
			osc.frequency.exponentialRampToValueAtTime(
				Math.max(40, slideTo),
				when + duration,
			);
		}
		amp.gain.setValueAtTime(gain, when);
		amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
		osc.connect(amp);
		amp.connect(this.ctx.destination);
		osc.start(when);
		osc.stop(when + duration + 0.02);
	}

	dispose() {
		this.enabled = false;
		if (this.ctx) {
			this.ctx.close();
			this.ctx = null;
		}
	}
}
