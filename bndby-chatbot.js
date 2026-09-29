const DEFAULT_SYSTEM_PROMPT =
	'Ты лаконичный и вежливый ассистент. Отвечай на русском языке.';

const MODEL_OPTIONS = {
	expectedInputs: [{ type: 'text', languages: ['en'] }],
	expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
      height: 100%;
      max-height: 600px;
      color-scheme: dark;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: #eaeaea;
    }

    * {
      box-sizing: border-box;
    }

    .chat-app {
      width: 100%;
      max-width: 100%;
      height: min(600px, 100dvh);
      max-height: 600px;
      background: #1b1b1b;
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      padding: 16px;
      display: grid;
      grid-template-rows: auto 1fr auto auto auto;
      gap: 12px;
    }

    .metrics-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .metrics-title {
      margin: 0;
      font-size: 0.68rem;
      color: #8e8e8e;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid #2f2f2f;
      background: #151515;
      line-height: 1.15;
    }

    .metric-key {
      font-size: 0.68rem;
      color: #a0a0a0;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .metric-value {
      font-size: 0.78rem;
      color: #e9f3ff;
      font-weight: 600;
    }

    .metrics-details {
      border: 1px solid #2f2f2f;
      border-radius: 10px;
      background: #151515;
      padding: 6px 8px;
    }

    .metrics-details > summary {
      cursor: pointer;
      user-select: none;
      font-size: 0.8rem;
      color: #d3d3d3;
    }

    .metrics-content {
      margin-top: 8px;
      display: grid;
      gap: 8px;
    }

    .hidden {
      display: none !important;
    }

    .availability {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid #3b3b3b;
      font-size: 0.82rem;
    }

    .availability.available {
      color: #8ff3b2;
      border-color: #2e7d48;
      background: #163222;
    }

    .availability.downloadable,
    .availability.downloading,
    .availability.checking {
      color: #ffd98a;
      border-color: #876116;
      background: #362b16;
    }

    .availability.unavailable,
    .availability.unsupported,
    .availability.error,
    .availability.unknown {
      color: #ffb0b0;
      border-color: #8a2c2c;
      background: #371b1b;
    }

    .download-panel {
      border: 1px solid #3a3a3a;
      border-radius: 12px;
      background: #171717;
      padding: 10px;
      display: grid;
      gap: 8px;
    }

    .download-hint {
      margin: 0;
      color: #d4d4d4;
      font-size: 0.92rem;
    }

    .download-progress {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .download-progress progress {
      width: 220px;
      height: 10px;
    }

    .download-progress span {
      font-size: 0.9rem;
      color: #c6e2ff;
    }

    .download-btn {
      width: fit-content;
    }

    .messages {
      min-height: 0;
      overflow-y: auto;
      border: 1px solid #303030;
      border-radius: 12px;
      background: #101010;
      padding: 12px;
      display: grid;
      align-content: start;
      gap: 8px;
    }

    .message {
      max-width: 88%;
      padding: 10px 12px;
      border-radius: 12px;
      line-height: 1.35;
      white-space: pre-wrap;
    }

    .message.user {
      justify-self: end;
      background: #254870;
    }

    .message.model {
      justify-self: start;
      background: #2d2d2d;
      white-space: normal;
    }

    .message.model p {
      margin: 0.3rem 0;
    }

    .message.model pre {
      margin: 0.5rem 0;
      overflow-x: auto;
      padding: 8px;
      border-radius: 8px;
      background: #141414;
      border: 1px solid #3a3a3a;
    }

    .message.model code {
      font-family: Consolas, "Courier New", monospace;
    }

    .message.model a {
      color: #8ec8ff;
    }

    .chat-form {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
    }

    .status-line {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 22px;
      white-space: nowrap;
      overflow: hidden;
      font-size: 0.84rem;
    }

    .status-label {
      color: #b8b8b8;
      flex: 0 0 auto;
    }

    .status {
      color: #a9d3ff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.84rem;
    }

    input,
    button {
      border-radius: 10px;
      border: 1px solid #3a3a3a;
      background: #161616;
      color: #f0f0f0;
      font-size: 1rem;
    }

    input {
      padding: 11px 12px;
    }

    button {
      padding: 11px 16px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  </style>

  <main class="chat-app">
    <details class="metrics-details">
      <summary>Метрики</summary>
      <div class="metrics-content">
        <p class="metrics-title">Текущий ответ</p>
        <section class="metrics-bar" aria-live="polite">
          <span class="metric-chip" title="Время генерации текущего ответа (мс)" aria-label="Время генерации текущего ответа"><span class="metric-key">t</span><strong id="metric-latency" class="metric-value">—</strong></span>
          <span class="metric-chip" title="Токены во входном запросе текущего ответа" aria-label="Токены входа текущего ответа"><span class="metric-key">in</span><strong id="metric-input-tokens" class="metric-value">—</strong></span>
          <span class="metric-chip" title="Токены в ответе модели для текущего запроса" aria-label="Токены выхода текущего ответа"><span class="metric-key">out</span><strong id="metric-output-tokens" class="metric-value">—</strong></span>
          <span class="metric-chip" title="Суммарные токены текущего запроса (вход + выход)" aria-label="Суммарные токены текущего ответа"><span class="metric-key">sum</span><strong id="metric-total-tokens" class="metric-value">—</strong></span>
          <span class="metric-chip" title="Текущая занятость контекста сессии: использовано / доступно" aria-label="Текущий размер контекста сессии"><span class="metric-key">ctx</span><strong id="metric-context" class="metric-value">—</strong></span>
        </section>
        <p class="metrics-title">Сессия</p>
        <section class="metrics-bar" aria-live="polite">
          <span class="metric-chip" title="Количество запросов в текущей сессии" aria-label="Число запросов сессии"><span class="metric-key">req</span><strong id="session-metric-requests" class="metric-value">0</strong></span>
          <span class="metric-chip" title="Суммарное время генерации всех ответов в сессии (мс)" aria-label="Суммарное время генерации сессии"><span class="metric-key">Σt</span><strong id="session-metric-latency" class="metric-value">0 мс</strong></span>
          <span class="metric-chip" title="Суммарные входные токены за всю сессию" aria-label="Суммарные входные токены сессии"><span class="metric-key">Σin</span><strong id="session-metric-input-tokens" class="metric-value">0</strong></span>
          <span class="metric-chip" title="Суммарные выходные токены за всю сессию" aria-label="Суммарные выходные токены сессии"><span class="metric-key">Σout</span><strong id="session-metric-output-tokens" class="metric-value">0</strong></span>
          <span class="metric-chip" title="Сумма входных и выходных токенов за всю сессию" aria-label="Суммарные токены сессии"><span class="metric-key">Σsum</span><strong id="session-metric-total-tokens" class="metric-value">0</strong></span>
        </section>
      </div>
    </details>

    <section id="messages" class="messages" aria-live="polite"></section>

    <form id="chat-form" class="chat-form">
      <label for="prompt-input" class="sr-only">Ваше сообщение</label>
      <input id="prompt-input" type="text" placeholder="Напишите вопрос..." autocomplete="off" required />
      <button id="send-btn" type="submit" disabled>Отправить</button>
      <button id="reset-session-btn" type="button" disabled>Сброс сессии</button>
    </form>

    <section class="status-line">
      <span class="status-label">Модель:</span>
      <strong id="model-availability" class="availability unknown">проверка...</strong>
      <span id="status" class="status">Проверка поддержки API...</span>
    </section>

    <section id="download-panel" class="download-panel hidden">
      <p id="download-hint" class="download-hint"></p>
      <div id="download-progress-wrap" class="download-progress hidden">
        <progress id="download-progress" value="0" max="100"></progress>
        <span id="download-progress-text">0%</span>
      </div>
      <button id="download-btn" type="button" class="download-btn hidden">Скачать модель</button>
    </section>
  </main>
`;

class BndbyChatbot extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.session = null;
		this.downloadPercent = 0;
		this.progressTickerId = null;
		this.lastProgressAt = 0;
		this.sessionTotals = {
			requests: 0,
			latencyMs: 0,
			inputTokens: 0,
			outputTokens: 0,
			totalTokens: 0,
			inputApproximate: false,
			outputApproximate: false,
			totalApproximate: false,
		};

		this.marked = null;
		this.domPurify = null;

		this.onDownloadClick = this.onDownloadClick.bind(this);
		this.onChatSubmit = this.onChatSubmit.bind(this);
		this.onResetSessionClick = this.onResetSessionClick.bind(this);
	}

	connectedCallback() {
		this.render();
		this.cacheElements();
		this.bindEvents();
		this.loadMarkdownDeps();
		this.init();
	}

	disconnectedCallback() {
		this.unbindEvents();
		this.stopProgressTicker();
		this.destroySession();
	}

	get systemPrompt() {
		return this.getAttribute('system-prompt') || DEFAULT_SYSTEM_PROMPT;
	}

	render() {
		this.shadowRoot.innerHTML = '';
		this.shadowRoot.append(template.content.cloneNode(true));
	}

	cacheElements() {
		this.statusEl = this.shadowRoot.getElementById('status');
		this.messagesEl = this.shadowRoot.getElementById('messages');
		this.chatForm = this.shadowRoot.getElementById('chat-form');
		this.inputEl = this.shadowRoot.getElementById('prompt-input');
		this.sendBtn = this.shadowRoot.getElementById('send-btn');
		this.availabilityEl =
			this.shadowRoot.getElementById('model-availability');
		this.downloadPanelEl = this.shadowRoot.getElementById('download-panel');
		this.downloadHintEl = this.shadowRoot.getElementById('download-hint');
		this.downloadBtn = this.shadowRoot.getElementById('download-btn');
		this.downloadProgressWrapEl = this.shadowRoot.getElementById(
			'download-progress-wrap',
		);
		this.downloadProgressEl =
			this.shadowRoot.getElementById('download-progress');
		this.downloadProgressTextEl = this.shadowRoot.getElementById(
			'download-progress-text',
		);
		this.metricLatencyEl = this.shadowRoot.getElementById('metric-latency');
		this.metricInputTokensEl = this.shadowRoot.getElementById(
			'metric-input-tokens',
		);
		this.metricOutputTokensEl = this.shadowRoot.getElementById(
			'metric-output-tokens',
		);
		this.metricTotalTokensEl = this.shadowRoot.getElementById(
			'metric-total-tokens',
		);
		this.metricContextEl = this.shadowRoot.getElementById('metric-context');
		this.sessionMetricRequestsEl = this.shadowRoot.getElementById(
			'session-metric-requests',
		);
		this.sessionMetricLatencyEl = this.shadowRoot.getElementById(
			'session-metric-latency',
		);
		this.sessionMetricInputTokensEl = this.shadowRoot.getElementById(
			'session-metric-input-tokens',
		);
		this.sessionMetricOutputTokensEl = this.shadowRoot.getElementById(
			'session-metric-output-tokens',
		);
		this.sessionMetricTotalTokensEl = this.shadowRoot.getElementById(
			'session-metric-total-tokens',
		);
		this.resetSessionBtn =
			this.shadowRoot.getElementById('reset-session-btn');
		this.resetCurrentMetrics();
		this.updateSessionMetricsView();
	}

	bindEvents() {
		this.downloadBtn.addEventListener('click', this.onDownloadClick);
		this.chatForm.addEventListener('submit', this.onChatSubmit);
		this.resetSessionBtn.addEventListener(
			'click',
			this.onResetSessionClick,
		);
	}

	unbindEvents() {
		this.downloadBtn.removeEventListener('click', this.onDownloadClick);
		this.chatForm.removeEventListener('submit', this.onChatSubmit);
		this.resetSessionBtn.removeEventListener(
			'click',
			this.onResetSessionClick,
		);
	}

	async loadMarkdownDeps() {
		try {
			const [{ marked }, domPurifyModule] = await Promise.all([
				import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'),
				import(
					'https://cdn.jsdelivr.net/npm/dompurify/dist/purify.es.mjs'
				),
			]);

			marked.setOptions({ gfm: true, breaks: true });
			this.marked = marked;

			const exported = domPurifyModule.default ?? domPurifyModule;
			this.domPurify =
				typeof exported === 'function' ? exported(window) : exported;
		} catch (error) {
			this.marked = null;
			this.domPurify = null;
		}
	}

	escapeHtml(text) {
		return text
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}

	renderModelMarkdown(text) {
		if (this.marked && this.domPurify) {
			try {
				const rawHtml = this.marked.parse(text);
				return this.domPurify.sanitize(rawHtml);
			} catch (error) {
				return this.domPurify.sanitize(this.escapeHtml(text));
			}
		}

		return this.escapeHtml(text).replaceAll('\n', '<br>');
	}

	setHidden(element, hidden) {
		element.classList.toggle('hidden', hidden);
	}

	setMessageContent(message, role, text) {
		if (role === 'model') {
			message.innerHTML = this.renderModelMarkdown(text);
		} else {
			message.textContent = text;
		}
		this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
	}

	appendMessage(role, text) {
		const message = document.createElement('article');
		message.className = `message ${role}`;
		this.setMessageContent(message, role, text);
		this.messagesEl.append(message);
		return message;
	}

	setUiEnabled(enabled) {
		this.inputEl.disabled = !enabled;
		this.sendBtn.disabled = !enabled;
	}

	setAvailability(status, text) {
		this.availabilityEl.className = `availability ${status}`;
		this.availabilityEl.textContent = text;
	}

	updateProgressView() {
		const clamped = Math.max(0, Math.min(100, this.downloadPercent));
		const rounded = Math.floor(clamped);
		this.downloadProgressEl.value = rounded;

		if (!this.lastProgressAt) {
			this.downloadProgressTextEl.textContent = `${rounded}%`;
			return;
		}

		const secondsAgo = Math.floor(
			(Date.now() - this.lastProgressAt) / 1000,
		);
		this.downloadProgressTextEl.textContent = `${rounded}% · обновлено ${secondsAgo}с назад`;
	}

	startProgressTicker() {
		this.stopProgressTicker();
		this.progressTickerId = window.setInterval(
			() => this.updateProgressView(),
			1000,
		);
	}

	stopProgressTicker() {
		if (!this.progressTickerId) return;
		window.clearInterval(this.progressTickerId);
		this.progressTickerId = null;
	}

	normalizeProgressPercent(event) {
		if (typeof event.total === 'number' && event.total > 0) {
			return (event.loaded / event.total) * 100;
		}
		if (typeof event.loaded === 'number' && event.loaded <= 1) {
			return event.loaded * 100;
		}
		if (typeof event.loaded === 'number') {
			return event.loaded;
		}
		return 0;
	}

	normalizeStreamChunk(chunk) {
		if (typeof chunk === 'string') return chunk;
		if (typeof chunk === 'object' && chunk !== null) {
			if (typeof chunk.text === 'string') return chunk.text;
			if (typeof chunk.content === 'string') return chunk.content;
		}
		return String(chunk ?? '');
	}

	estimateTokenCount(text) {
		if (!text) return 0;
		return Math.max(1, Math.round(String(text).length / 4));
	}

	getSessionContextUsage() {
		if (!this.session) return null;
		const raw = this.session.contextUsage ?? this.session.inputUsage;
		return typeof raw === 'number' ? raw : null;
	}

	getSessionContextWindow() {
		if (!this.session) return null;
		const raw = this.session.contextWindow ?? this.session.inputQuota;
		return typeof raw === 'number' ? raw : null;
	}

	async measurePromptTokens(prompt) {
		if (!this.session) {
			return {
				value: this.estimateTokenCount(prompt),
				approximate: true,
			};
		}

		const measureMethod =
			this.session.measureContextUsage ?? this.session.measureInputUsage;

		if (typeof measureMethod === 'function') {
			try {
				const measured = await measureMethod.call(this.session, prompt);
				if (typeof measured === 'number' && Number.isFinite(measured)) {
					return { value: measured, approximate: false };
				}
			} catch (error) {
				// Fall back to heuristic below.
			}
		}

		return { value: this.estimateTokenCount(prompt), approximate: true };
	}

	formatMetricNumber(value, approximate = false) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
		const rounded = Math.max(0, Math.round(value));
		return `${approximate ? '≈' : ''}${rounded}`;
	}

	formatContextMetric(usage, windowSize, approximate = false) {
		if (
			typeof usage !== 'number' ||
			!Number.isFinite(usage) ||
			typeof windowSize !== 'number' ||
			!Number.isFinite(windowSize) ||
			windowSize <= 0
		) {
			return '—';
		}

		const ratio = Math.min(
			100,
			Math.max(0, Math.round((usage / windowSize) * 100)),
		);
		return `${approximate ? '≈' : ''}${Math.round(usage)} / ${Math.round(windowSize)} (${ratio}%)`;
	}

	setContextMetric(usage, windowSize, approximate = false) {
		this.metricContextEl.textContent = this.formatContextMetric(
			usage,
			windowSize,
			approximate,
		);
	}

	updateMetrics({
		latencyMs,
		inputTokens,
		inputApproximate = false,
		outputTokens,
		outputApproximate = false,
		totalTokens,
		totalApproximate = false,
		contextUsage,
		contextWindow,
		contextApproximate = false,
	} = {}) {
		if (latencyMs !== undefined) {
			this.metricLatencyEl.textContent =
				typeof latencyMs === 'number' && Number.isFinite(latencyMs)
					? `${Math.max(0, Math.round(latencyMs))} мс`
					: '—';
		}

		if (inputTokens !== undefined) {
			this.metricInputTokensEl.textContent = this.formatMetricNumber(
				inputTokens,
				inputApproximate,
			);
		}
		if (outputTokens !== undefined) {
			this.metricOutputTokensEl.textContent = this.formatMetricNumber(
				outputTokens,
				outputApproximate,
			);
		}
		if (totalTokens !== undefined) {
			this.metricTotalTokensEl.textContent = this.formatMetricNumber(
				totalTokens,
				totalApproximate,
			);
		}
		if (contextUsage !== undefined && contextWindow !== undefined) {
			this.setContextMetric(
				contextUsage,
				contextWindow,
				contextApproximate,
			);
		}
	}

	resetCurrentMetrics() {
		this.updateMetrics({
			latencyMs: null,
			inputTokens: null,
			outputTokens: null,
			totalTokens: null,
			contextUsage: this.getSessionContextUsage(),
			contextWindow: this.getSessionContextWindow(),
		});
	}

	resetSessionTotals() {
		this.sessionTotals = {
			requests: 0,
			latencyMs: 0,
			inputTokens: 0,
			outputTokens: 0,
			totalTokens: 0,
			inputApproximate: false,
			outputApproximate: false,
			totalApproximate: false,
		};
		this.updateSessionMetricsView();
	}

	updateSessionMetricsView() {
		const totals = this.sessionTotals;
		this.sessionMetricRequestsEl.textContent = String(totals.requests);
		this.sessionMetricLatencyEl.textContent = `${Math.max(0, Math.round(totals.latencyMs))} мс`;
		this.sessionMetricInputTokensEl.textContent = this.formatMetricNumber(
			totals.inputTokens,
			totals.inputApproximate,
		);
		this.sessionMetricOutputTokensEl.textContent = this.formatMetricNumber(
			totals.outputTokens,
			totals.outputApproximate,
		);
		this.sessionMetricTotalTokensEl.textContent = this.formatMetricNumber(
			totals.totalTokens,
			totals.totalApproximate,
		);
	}

	applyResponseToSessionTotals(responseMetrics) {
		const totals = this.sessionTotals;
		totals.requests += 1;
		totals.latencyMs += responseMetrics.latencyMs;
		totals.inputTokens += responseMetrics.inputTokens;
		totals.outputTokens += responseMetrics.outputTokens;
		totals.totalTokens += responseMetrics.totalTokens;
		totals.inputApproximate ||= responseMetrics.inputApproximate;
		totals.outputApproximate ||= responseMetrics.outputApproximate;
		totals.totalApproximate ||= responseMetrics.totalApproximate;
		this.updateSessionMetricsView();
	}

	async destroySession() {
		if (!this.session) return;
		const currentSession = this.session;
		this.session = null;

		if (typeof currentSession.destroy === 'function') {
			try {
				await currentSession.destroy();
			} catch (error) {
				// Ignore cleanup errors.
			}
		}
	}

	updateLiveGenerationMetrics({
		startedAt,
		inputTokens,
		inputApproximate,
		beforeContextUsage,
		generatedText,
	}) {
		const outputTokens = this.estimateTokenCount(generatedText);
		const totalTokens = inputTokens + outputTokens;

		const contextWindow = this.getSessionContextWindow();
		const sessionContextUsage = this.getSessionContextUsage();

		let contextUsage = sessionContextUsage;
		let contextApproximate = false;

		if (
			contextUsage === null &&
			typeof beforeContextUsage === 'number' &&
			typeof inputTokens === 'number'
		) {
			contextUsage = beforeContextUsage + inputTokens + outputTokens;
			contextApproximate = true;
		}

		this.updateMetrics({
			latencyMs: performance.now() - startedAt,
			inputTokens,
			inputApproximate,
			outputTokens,
			outputApproximate: true,
			totalTokens,
			totalApproximate: true,
			contextUsage,
			contextWindow,
			contextApproximate,
		});
	}

	async updateResponseMetrics({
		prompt,
		answerText,
		startedAt,
		beforeContextUsage,
	}) {
		const latencyMs = performance.now() - startedAt;
		const { value: measuredInputTokens, approximate: inputApproximate } =
			await this.measurePromptTokens(prompt);
		const afterContextUsage = this.getSessionContextUsage();
		const contextWindow = this.getSessionContextWindow();

		let outputTokens = null;
		let outputApproximate = true;
		if (
			typeof beforeContextUsage === 'number' &&
			typeof afterContextUsage === 'number' &&
			typeof measuredInputTokens === 'number'
		) {
			const delta = afterContextUsage - beforeContextUsage;
			const calculatedOutput = delta - measuredInputTokens;
			if (calculatedOutput >= 0) {
				outputTokens = calculatedOutput;
				outputApproximate = false;
			}
		}

		if (outputTokens === null) {
			outputTokens = this.estimateTokenCount(answerText);
			outputApproximate = true;
		}

		const totalTokens = measuredInputTokens + outputTokens;
		const totalApproximate = inputApproximate || outputApproximate;

		let contextUsage = afterContextUsage;
		let contextApproximate = false;
		if (
			contextUsage === null &&
			typeof beforeContextUsage === 'number' &&
			typeof measuredInputTokens === 'number'
		) {
			contextUsage =
				beforeContextUsage + measuredInputTokens + outputTokens;
			contextApproximate = true;
		}

		const responseMetrics = {
			latencyMs,
			inputTokens: measuredInputTokens,
			inputApproximate,
			outputTokens,
			outputApproximate,
			totalTokens,
			totalApproximate,
			contextUsage,
			contextWindow,
			contextApproximate,
		};

		this.updateMetrics(responseMetrics);
		return responseMetrics;
	}

	refreshContextMetric() {
		this.setContextMetric(
			this.getSessionContextUsage(),
			this.getSessionContextWindow(),
		);
	}

	showDownloadGuidance(availability) {
		if (availability === 'downloadable') {
			this.setHidden(this.downloadPanelEl, false);
			this.setHidden(this.downloadBtn, false);
			this.setHidden(this.downloadProgressWrapEl, true);
			this.downloadBtn.disabled = false;
			this.downloadBtn.textContent = 'Скачать модель';
			this.downloadHintEl.textContent =
				'Модель еще не загружена. Нажмите «Скачать модель», чтобы запустить загрузку.';
			return;
		}

		if (availability === 'downloading') {
			this.setHidden(this.downloadPanelEl, false);
			this.setHidden(this.downloadBtn, false);
			this.setHidden(this.downloadProgressWrapEl, false);
			this.downloadBtn.disabled = false;
			this.downloadBtn.textContent = 'Отслеживать загрузку';
			this.downloadHintEl.textContent =
				'Модель уже скачивается. Нажмите кнопку, чтобы запустить инициализацию и увидеть прогресс в процентах.';
			this.updateProgressView();
			return;
		}

		this.setHidden(this.downloadPanelEl, true);
	}

	async checkAvailability() {
		if (
			!('LanguageModel' in window) ||
			typeof window.LanguageModel.availability !== 'function'
		) {
			this.setAvailability('unsupported', 'не поддерживается');
			this.showDownloadGuidance('unsupported');
			return 'unsupported';
		}

		try {
			this.setAvailability('checking', 'проверка...');
			const availability =
				await window.LanguageModel.availability(MODEL_OPTIONS);

			const labels = {
				available: 'доступна',
				downloadable: 'нужно скачать',
				downloading: 'загружается',
				unavailable: 'недоступна',
			};

			this.setAvailability(
				availability,
				labels[availability] ?? availability,
			);
			this.showDownloadGuidance(availability);
			return availability;
		} catch (error) {
			this.setAvailability('error', 'ошибка проверки');
			this.showDownloadGuidance('error');
			throw error;
		}
	}

	async createModelSession({ withMonitor = false } = {}) {
		if (
			!('LanguageModel' in window) ||
			typeof window.LanguageModel.create !== 'function'
		) {
			throw new Error(
				'В этом браузере нет Prompt API. Откройте страницу в актуальном Chrome с включенным Built-in AI.',
			);
		}

		const availability =
			await window.LanguageModel.availability(MODEL_OPTIONS);
		if (availability === 'unavailable' || availability === 'unsupported') {
			throw new Error(
				`Модель сейчас недоступна (status: ${availability}). Проверьте настройки Built-in AI в Chrome.`,
			);
		}

		const createOptions = {
			...MODEL_OPTIONS,
			systemPrompt: this.systemPrompt,
		};

		if (withMonitor) {
			createOptions.monitor = (monitor) => {
				this.setHidden(this.downloadPanelEl, false);
				this.setHidden(this.downloadProgressWrapEl, false);
				this.setHidden(this.downloadBtn, true);
				this.downloadHintEl.textContent = 'Идет загрузка модели...';
				this.startProgressTicker();

				monitor.addEventListener('downloadprogress', (event) => {
					const nextPercent = this.normalizeProgressPercent(event);
					this.downloadPercent = Math.max(
						this.downloadPercent,
						nextPercent,
					);
					this.lastProgressAt = Date.now();
					this.updateProgressView();
					this.statusEl.textContent = `Загрузка модели: ${Math.floor(this.downloadPercent)}%`;
				});
			};
		}

		return window.LanguageModel.create(createOptions);
	}

	async startDownloadAndInit() {
		this.setUiEnabled(false);
		this.downloadBtn.disabled = true;
		this.downloadPercent = 0;
		this.lastProgressAt = Date.now();
		this.setHidden(this.downloadPanelEl, false);
		this.setHidden(this.downloadProgressWrapEl, false);
		this.downloadHintEl.textContent = 'Подготовка загрузки модели...';
		this.updateProgressView();
		this.statusEl.textContent = 'Запуск загрузки модели...';

		try {
			this.session = await this.createModelSession({ withMonitor: true });
			this.downloadPercent = 100;
			this.lastProgressAt = Date.now();
			this.updateProgressView();
			this.stopProgressTicker();

			this.setAvailability('available', 'доступна');
			this.showDownloadGuidance('available');
			this.statusEl.textContent = 'Готово. Можете писать сообщение.';
			this.setUiEnabled(true);
			this.resetSessionBtn.disabled = false;
			this.refreshContextMetric();
			this.inputEl.focus();
		} catch (error) {
			this.stopProgressTicker();
			const availability = await this.checkAvailability();
			this.showDownloadGuidance(availability);
			this.statusEl.textContent =
				error instanceof Error
					? error.message
					: 'Не удалось завершить загрузку модели.';
			this.downloadBtn.disabled = false;
		}
	}

	async init() {
		this.setUiEnabled(false);
		this.setHidden(this.downloadPanelEl, true);
		try {
			this.statusEl.textContent = 'Проверка доступности модели...';
			const availability = await this.checkAvailability();

			if (availability === 'downloadable') {
				this.statusEl.textContent =
					'Модель нужно скачать. Нажмите «Скачать модель», чтобы запустить загрузку.';
				return;
			}

			if (availability === 'downloading') {
				this.statusEl.textContent =
					'Модель скачивается. Нажмите «Отслеживать загрузку», чтобы увидеть прогресс и завершить инициализацию.';
				return;
			}

			if (availability !== 'available') {
				this.statusEl.textContent = `Модель недоступна (status: ${availability}).`;
				return;
			}

			this.statusEl.textContent = 'Инициализация модели...';
			this.session = await this.createModelSession();
			this.statusEl.textContent = 'Готово. Можете писать сообщение.';
			this.setUiEnabled(true);
			this.resetSessionBtn.disabled = false;
			this.refreshContextMetric();
			this.inputEl.focus();
		} catch (error) {
			this.statusEl.textContent =
				error instanceof Error ? error.message : String(error);
		}
	}

	async onResetSessionClick() {
		this.setUiEnabled(false);
		this.resetSessionBtn.disabled = true;
		this.statusEl.textContent = 'Очистка сессии...';
		this.messagesEl.innerHTML = '';
		this.resetCurrentMetrics();
		this.resetSessionTotals();

		try {
			await this.destroySession();
			const availability = await this.checkAvailability();

			if (availability === 'downloadable') {
				this.statusEl.textContent =
					'Сессия очищена. Модель нужно скачать. Нажмите «Скачать модель».';
				return;
			}

			if (availability === 'downloading') {
				this.statusEl.textContent =
					'Сессия очищена. Модель скачивается. Нажмите «Отслеживать загрузку».';
				return;
			}

			if (availability !== 'available') {
				this.statusEl.textContent = `Сессия очищена. Модель недоступна (status: ${availability}).`;
				return;
			}

			this.statusEl.textContent = 'Инициализация новой сессии...';
			this.session = await this.createModelSession();
			this.statusEl.textContent =
				'Сессия очищена. Можете писать сообщение.';
			this.setUiEnabled(true);
			this.refreshContextMetric();
			this.inputEl.focus();
		} catch (error) {
			this.statusEl.textContent =
				error instanceof Error
					? error.message
					: 'Не удалось очистить сессию.';
		} finally {
			this.resetSessionBtn.disabled = false;
		}
	}

	onDownloadClick() {
		this.startDownloadAndInit();
	}

	async onChatSubmit(event) {
		event.preventDefault();

		const prompt = this.inputEl.value.trim();
		if (!prompt || !this.session) return;

		this.appendMessage('user', prompt);
		this.inputEl.value = '';
		this.setUiEnabled(false);
		this.resetSessionBtn.disabled = true;
		this.statusEl.textContent = 'Модель печатает...';
		const modelMessage = this.appendMessage('model', '');
		const startedAt = performance.now();
		const beforeContextUsage = this.getSessionContextUsage();
		const { value: inputTokens, approximate: inputApproximate } =
			await this.measurePromptTokens(prompt);
		this.updateLiveGenerationMetrics({
			startedAt,
			inputTokens,
			inputApproximate,
			beforeContextUsage,
			generatedText: '',
		});
		let answerText = '';

		try {
			if (typeof this.session.promptStreaming === 'function') {
				let streamedText = '';
				let lastMetricsAt = 0;
				for await (const chunk of this.session.promptStreaming(
					prompt,
				)) {
					streamedText += this.normalizeStreamChunk(chunk);
					this.setMessageContent(modelMessage, 'model', streamedText);
					const now = performance.now();
					if (now - lastMetricsAt >= 120) {
						this.updateLiveGenerationMetrics({
							startedAt,
							inputTokens,
							inputApproximate,
							beforeContextUsage,
							generatedText: streamedText,
						});
						lastMetricsAt = now;
					}
				}
				this.updateLiveGenerationMetrics({
					startedAt,
					inputTokens,
					inputApproximate,
					beforeContextUsage,
					generatedText: streamedText,
				});
				answerText = streamedText;
			} else {
				const latencyTimerId = window.setInterval(() => {
					this.updateLiveGenerationMetrics({
						startedAt,
						inputTokens,
						inputApproximate,
						beforeContextUsage,
						generatedText: answerText,
					});
				}, 150);
				try {
					const result = await this.session.prompt(prompt);
					this.setMessageContent(modelMessage, 'model', result);
					answerText = result;
				} finally {
					window.clearInterval(latencyTimerId);
				}
			}

			const responseMetrics = await this.updateResponseMetrics({
				prompt,
				answerText,
				startedAt,
				beforeContextUsage,
			});
			this.applyResponseToSessionTotals(responseMetrics);
			this.statusEl.textContent =
				'Готово. Можете отправить новое сообщение.';
		} catch (error) {
			this.setMessageContent(
				modelMessage,
				'model',
				`Ошибка генерации: ${error instanceof Error ? error.message : String(error)}`,
			);
			this.updateMetrics({ latencyMs: performance.now() - startedAt });
			this.setContextMetric(
				this.getSessionContextUsage(),
				this.getSessionContextWindow(),
			);
			this.statusEl.textContent = 'Произошла ошибка во время генерации.';
		} finally {
			this.setUiEnabled(true);
			this.resetSessionBtn.disabled = false;
			this.inputEl.focus();
		}
	}
}

if (!customElements.get('bndby-chatbot')) {
	customElements.define('bndby-chatbot', BndbyChatbot);
}
