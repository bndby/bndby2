---
date: 2026-05-18
description: 'Prompt API в Chrome позволяет взаимодействовать с LLM через высокоуровневый браузерный API window.LanguageModel. Однако поддержка пока ограничена, а реализация остается сложным процессом'
tags:
    - ai
    - chrome
    - webapi
    - javascript
categories:
    - AI
slug: propmp-api-polyfill
---

# Экспериментальный полифилл для Prompt API

Prompt API в Chrome позволяет взаимодействовать с LLM через [высокоуровневый браузерный API](https://developer.chrome.com/docs/ai/prompt-api) `window.LanguageModel`. Однако поддержка пока ограничена, а реализация остается сложным процессом.

<!-- more -->

| Браузер | Поддерживаемые ОС | Неподдерживаемые ОС | Статус |
| --- | --- | --- | --- |
| **Chrome** | [Windows, macOS, Linux, ChromeOS (Chromebook Plus)](https://developer.chrome.com/docs/ai/prompt-api#hardware-requirements) | Android, iOS | ✅ Поддерживается |
| **Edge** | [Windows, macOS](https://learn.microsoft.com/microsoft-edge/web-platform/prompt-api#hardware-requirements) | Android, iOS | ✅ Поддерживается |
| **Safari** | --- | --- | [📋 Позиция определена](https://github.com/WebKit/standards-positions/issues/495) |
| **Firefox** | --- | --- | [📋 Позиция определена](https://github.com/mozilla/standards-positions/issues/1213) |

В то же время разработчики из [программы раннего доступа](https://developer.chrome.com/docs/ai/join-epp) уже поделились своим интересом к Prompt API. Доступность API создает проблему совместимости на обозримое будущее.

### Решение

Именно поэтому мы выпускаем экспериментальный [полифилл Prompt API](https://www.npmjs.com/package/prompt-api-polyfill), соответствующий спецификации (исходный код доступен [на GitHub](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-polyfill)). Он точно реализует Prompt API поверх настраиваемых облачных бэкендов, а также поверх локального бэкенда на базе [Transformers.js](https://huggingface.co/docs/transformers.js/index).

!!!note "Примечание:"

    Для production-использования мы рекомендуем напрямую применять [Firebase AI Logic Hybrid SDK](https://developer.chrome.com/docs/ai/firebase-ai-logic).

## Использование полифилла

Чтобы использовать полифилл:

1. Установите [полифилл из npm](https://www.npmjs.com/package/prompt-api-polyfill):

    ```sh
    npm install prompt-api-polyfill
    ```

2. Выберите облачный или локальный бэкенд:
    - **Облачный бэкенд:** пользовательские данные отправляются в облако для удаленной обработки, зато не нужно ждать доступности локальной модели. Вы отвечаете за возможные расходы согласно тарифам вашего облачного провайдера.
    - **Локальный бэкенд:** пользовательские данные остаются в браузере и обрабатываются локально, но нужно скачать модель. В отличие от настоящего Prompt API, такую модель нельзя разделять между разными origin. При локальной обработке расходов нет.

### Облачный бэкенд

Выберите один из облачных бэкендов и получите API-ключ, а при необходимости и дополнительные учетные данные.

Когда API-ключ готов, укажите данные в конфигурационном файле `.env.json`. Если не задать `modelName`, полифилл будет использовать модель по умолчанию для выбранного бэкенда. Если задать `modelName`, можно выбрать одну из поддерживаемых моделей этого бэкенда.

    {
      "apiKey": "y0ur-Api-k3Y",
      "modelName": "model-name"
    }

!!!warning "Предупреждение:"

    [Firebase AI Logic Hybrid SDK с App Check](https://firebase.google.com/docs/ai-logic/app-check?api=dev) — самый безопасный способ обеспечить работу Prompt API. Только App Check защищает ваш API-ключ от несанкционированного использования. Не раскрывайте напрямую ключи Gemini или OpenAI API.

### Локальный бэкенд

Если вы выбираете локальный бэкенд на базе Transformers.js, достаточно фиктивного API-ключа. При этом можно настроить устройство, которое будет использовать Transformers.js. Выберите `"webgpu"` для максимальной производительности и `"wasm"` для максимальной совместимости. Настройки по умолчанию можно изменить. Также можно выбрать другую модель из [каталога совместимых моделей Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending). Для некоторых моделей доступны разные варианты квантизации через параметр `dtype`.

    {
      "apiKey": "dummy",
      "device": "webgpu",
      "dtype": "q4f16",
      "modelName": "onnx-community/gemma-3-1b-it-ONNX-GQA"
    };

### Настройка полифилла

После создания конфигурационного файла можно использовать полифилл в приложении.

1. Импортируйте конфигурационный файл и присвойте его глобальной переменной с подходящим именем, где `$BACKEND` — выбранный бэкенд: `window.$BACKEND_CONFIG`.
2. Используйте динамический импорт, чтобы загружать полифилл только если браузер не поддерживает Prompt API.
3. [Вызывайте функции Prompt API](https://developer.chrome.com/docs/ai/prompt-api).

    ```js
    import config from './.env.json' with { type: 'json' };

    // Установите $BACKEND_CONFIG, чтобы выбрать бэкенд
    window.$BACKEND_CONFIG = config;

    if (!('LanguageModel' in window)) {
        await import('prompt-api-polyfill');
    }

    const session = await LanguageModel.create({
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
    });
    await session.prompt('Tell me a joke!');
    ```

Полифилл поддерживает [структурированный вывод](https://developer.chrome.com/docs/ai/structured-output-for-prompt-api), кроме бэкенда Transformers.js, работает с [мультимодальным вводом](https://developer.chrome.com/docs/ai/prompt-api#multimodal_capabilities), кроме бэкенда OpenAI, который не поддерживает аудио и изображение вместе, только по отдельности, и тестируется на полном наборе [Web Platform Tests](https://github.com/web-platform-tests/wpt/tree/master/ai/language-model) для `LanguageModel`.

Дополнительные сведения, подробности использования и исходный код смотрите в [`README` в GitHub-репозитории](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/prompt-api-polyfill#readme).

## Отличия от браузерного Prompt API

Если полифилл работает через облачные модели, часть [преимуществ клиентского выполнения](https://developer.chrome.com/docs/ai/built-in#benefits-on-device) больше не действует. В частности, вы уже не можете гарантировать локальную обработку чувствительных данных, хотя политики конфиденциальности вашего бэкенд-провайдера по-прежнему применяются. Кроме того, приложение больше не сможет использовать AI, когда пользователь офлайн. Чтобы определить состояние подключения, можно слушать соответствующие события.

```js
window.addEventListener('offline', (e) => {
    console.log('offline');
});

window.addEventListener('online', (e) => {
    console.log('online');
});
```

Если AI-инференс выполняется на модели в облаке, локальную модель скачивать не нужно. Полифилл имитирует события `downloadprogress`, поэтому для приложения будет выглядеть так, будто встроенная модель уже скачана. Это означает два события: одно со значением `loaded` равным `0`, второе — `1`, как и требует спецификация.

При облачном инференсе, в отличие от выполнения на устройстве, вызовы API выбранного бэкенд-провайдера могут стоить денег. Проверьте тарифы, например [цены Gemini API](https://ai.google.dev/gemini-api/docs/pricing). Если вы знаете стоимость одного токена, можно использовать информацию `contextUsage` из Prompt API для расчета расходов.

```js
const COST_PER_TOKEN = 123;
const COST_LIMIT = 456;

let costSoFar = 0;

const session = await LanguageModel.create(options);

/* ... */

if (costSoFar < COST_LIMIT) {
    await session.prompt('Tell me a joke.');
    costSoFar = session.contextUsage * COST_PER_TOKEN;
} else {
    // Показать промо премиального AI-тарифа.
}
```

Когда облачный API вызывается напрямую из мобильного или веб-приложения, например API для доступа к генеративным AI-моделям, API-ключ уязвим для злоупотреблений со стороны неавторизованных клиентов. Чтобы защитить такие API, при использовании Firebase AI Logic Hybrid SDK следует применять [Firebase App Check](https://firebase.google.com/docs/ai-logic/app-check?api=dev), который проверяет, что все входящие API-вызовы действительно исходят от вашего приложения. У некоторых облачных провайдеров, например Google, также можно включить строгую проверку origin, чтобы API могли использовать [только разрешенные сайты](https://docs.cloud.google.com/docs/authentication/api-keys#websites).

Вместо ограничений Prompt API, например для `contextWindow` сессии, применяются ограничения бэкенд-провайдера. Для `contextWindow` они обычно намного выше, чем на устройстве, а в облаке можно обрабатывать большие объемы данных. Поэтому важно понимать разницу, но на практике вы, скорее всего, не столкнетесь с проблемами.

## Создание собственного бэкенда

Чтобы добавить собственного бэкенд-провайдера, выполните следующие шаги.

### Расширьте базовый класс бэкенда

Создайте новый файл в директории `backends/`, например `backends/custom-backend.js`. Нужно расширить класс `PolyfillBackend` и реализовать основные методы, соответствующие ожидаемому интерфейсу.

```js
import PolyfillBackend from './base.js';
import { DEFAULT_MODELS } from './defaults.js';

export default class CustomBackend extends PolyfillBackend {
    constructor(config) {
        // config обычно берется из глобального объекта window,
        // например window.CUSTOM_CONFIG
        super(config.modelName || DEFAULT_MODELS.custom.modelName);
    }

    // Проверяет, настроен ли бэкенд, например есть ли API-ключ,
    // поддерживаются ли заданные комбинации modelName и options,
    // или, для локальной модели, доступна ли модель.
    static availability(options) {
        return window.CUSTOM_CONFIG?.apiKey ? 'available' : 'unavailable';
    }

    // Инициализирует нижележащий SDK или API-клиент. Для локальных моделей
    // используйте monitorTarget, чтобы сообщать полифиллу
    // о прогрессе скачивания модели.
    createSession(options, sessionParams, monitorTarget) {
        // Вернуть инициализированную сессию или экземпляр клиента
    }

    // Выполнение prompt без стриминга
    async generateContent(contents) {
        // contents: Array of { role: 'user'|'model', parts: [{ text: string }] }
        // Return: { text: string, usage: number }
    }

    // Выполнение prompt со стримингом
    async generateContentStream(contents) {
        // Return: AsyncIterable yielding chunks
    }

    // Подсчет токенов для отслеживания квот и использования
    async countTokens(contents) {
        // Return: total token count (number)
    }
}
```

### Зарегистрируйте бэкенд

Полифилл использует стратегию First-Match Priority на основе глобальной конфигурации. Нужно зарегистрировать бэкенд в файле `prompt-api-polyfill.js`, добавив его в статический массив `#backends`:

```js
// prompt-api-polyfill.js
static #backends = [
    // ... существующие бэкенды
    {
    config: 'CUSTOM_CONFIG', // Глобальный объект, который нужно искать в `window`
    path: './backends/custom-backend.js',
    },
];
```

### Задайте модель по умолчанию

Определите резервный идентификатор модели в `backends/defaults.js`. Он используется, когда пользователь инициализирует сессию без конкретного `modelName`.

```js
// backends/defaults.js
export const DEFAULT_MODELS = {
    // ...
    custom: 'custom-model-pro-v1',
};
```

### Включите локальную разработку и тестирование

Проект использует discovery-скрипт `scripts/list-backends.js` для генерации тестовых матриц. Чтобы включить новый бэкенд в тестовый раннер, создайте файл `.env-[name].json`, например `.env-custom.json`, в корне проекта:

```js
{
    "apiKey": "your-api-key-here",
    "modelName": "custom-model-pro-v1"
}
```

### Проверьте через Web Platform Tests (WPT)

Последний шаг — убедиться в соответствии спецификации. Поскольку полифилл основан на спецификации, любой новый бэкенд должен проходить официальные или предварительные Web Platform Tests:

```sh
npm run test:wpt
```

Эта проверка гарантирует, что ваш бэкенд корректно обрабатывает `AbortSignal`, системные prompt и форматирование истории именно так, как ожидает спецификация Prompt API.

## Заключение

Полифилл помогает использовать Prompt API на всех платформах и устройствах. Разрабатывая поверх [четко определенного API](https://webmachinelearning.github.io/prompt-api/) Prompt API, вы становитесь более независимыми от облачных провайдеров и остаетесь максимально близко к платформе.

На устройствах, которые поддерживают Prompt API, полифилл вообще не загружается, поэтому пользователям не приходится скачивать код, который не будет выполняться. Если у вас есть обратная связь или вы столкнулись с ошибкой, [создайте Issue](https://github.com/GoogleChromeLabs/web-ai-demos/issues) на GitHub. Удачного prompting!

<small>Источник: <https://developer.chrome.com/docs/ai/prompt-api-polyfill></small>
