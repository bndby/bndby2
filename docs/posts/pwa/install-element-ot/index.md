---
date: 2026-05-18
description: 'Для установки веб-приложений всегда требовался JavaScript. Когда вы используете событие beforeinstallprompt, весь процесс установки живет в скрипте. Новый элемент install меняет это: добавьте на страницу один HTML-элемент, и браузер сам отрисует надежную кнопку установки без JavaScript'
tags:
    - pwa
    - html
categories:
    - PWA
slug: install-element-ot
---

# Устанавливайте веб-приложения с новым HTML-элементом install

Для установки веб-приложений всегда требовался JavaScript. Когда вы используете событие `beforeinstallprompt`, весь процесс установки живет в скрипте. Новый элемент `<install>` меняет это: добавьте на страницу один HTML-элемент, и браузер сам отрисует надежную кнопку установки без JavaScript.

<!-- more -->

![image](./fig1.png)

Команда Microsoft Edge совместно с командой Chrome реализовала элемент `<install>` в Chromium. Теперь его можно тестировать за флагом в Chrome или Edge начиная с версии 148, а также в рамках [origin trial](https://developer.chrome.com/origintrials#/view_trial/506092008125759489), который доступен в обоих браузерах с версии 148 по 153.

Попробуйте его и посмотрите, как он отличается от императивного [Web Install API](https://blogs.windows.com/msedgedev/2025/11/24/the-web-install-api-is-ready-for-testing/) (`navigator.install()`), у которого есть собственный [origin trial](https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/bcf7d28f-6bdf-45d8-9207-63c97a042407).

## Проблема

Установка веб-приложений фрагментирована. У каждого браузера есть свой набор точек входа, например иконки в адресной строке, пункты меню и подсказки. У разработчиков мало контроля над тем, когда и как пользователю показывается процесс установки.

Создать опыт, похожий на магазин приложений, где пользователи могут устанавливать другие приложения с вашего сайта, сложнее: исторически установка была ограничена текущей страницей.

## Элемент `<install>`

Содержимым и отображением нового HTML-элемента `<install>` управляет браузер. Как и в случае с другими элементами разрешений, например `<geolocation>`, контроль браузера над текстом кнопки, языком и внешним видом означает, что он может считать клик пользователя настоящим сигналом намерения.

Пользователь, который нажимает кнопку с текстом «Установить Wonderful Application», вряд ли удивится появлению диалога установки.

Поскольку кнопку отрисовывает браузер, вы получаете надежный элемент установки с минимальным количеством кода и без необходимости организовывать ритуал `beforeinstallprompt` в JavaScript.

### Установка текущего приложения

Если текущая страница ссылается на манифест, в котором есть поле [`id`](https://developer.mozilla.org/docs/Web/Progressive_web_apps/Manifest/Reference/id), вам достаточно одного элемента:

```html
<install></install>
```

Браузер отрисует кнопку со стандартизированным текстом и иконкой, а когда пользователь нажмет ее, запустится обычный браузерный процесс установки.

### Установка другого приложения

Чтобы установить веб-приложение с другого origin, используйте атрибут `installurl`, который указывает на это приложение:

```html
<install installurl="https://awesome-app.com/"></install>
```

Если страница по адресу <https://awesome-app.com> ссылается на манифест, в котором задано поле `id`, больше ничего делать не нужно.

Если поля `id` нет, используйте атрибут `manifestid`, чтобы передать вычисленный `id` манифеста:

```html
<install
    installurl="https://awesome-app.com/"
    manifestid="https://awesome-app.com/?source=pwa"
>
</install>
```

Чтобы получить вычисленный `id` манифеста:

1. Откройте DevTools.
2. Перейдите на вкладку **Application**.
3. В разделе **Identity** скопируйте значение **Computed App ID**.

Используя кнопку `<install>` для установки приложений с других origin, вы можете создать страницу-каталог, где пользователи смогут устанавливать несколько приложений, каждое со своей кнопкой `<install>`.

## Добавьте fallback-содержимое

Если браузер не поддерживает элемент `<install>`, будет показан HTML, который вы поместили внутрь элемента:

```html
<install installurl="https://awesome-app.com/">
    <a href="https://awesome-app.com/">Открыть Awesome App</a>
</install>
```

## Определение поддержки

Если fallback-содержимого недостаточно для вашего сценария и вы хотите реализовать другой пользовательский опыт в браузерах без поддержки `<install>`, определите поддержку через JavaScript:

```js
if ('HTMLInstallElement' in window) {
    // Элемент <install> поддерживается.
}
```

## Обработка событий

Элемент `<install>` отправляет события, по которым можно отслеживать успешную установку, отклонение диалога и ошибки валидации:

```js
const button = document.querySelector('install');

button.addEventListener('promptaction', () => {
    console.log('Установка успешно завершена');
});

button.addEventListener('promptdismiss', () => {
    console.log('Пользователь закрыл диалог установки');
});

button.addEventListener('validationstatuschanged', (e) => {
    if (e.target.invalidReason === 'install_data_invalid') {
        console.error('Некорректные данные установки:', e.target.invalidReason);
    }
});
```

## Попробуйте уже сейчас

Чтобы попробовать элемент `<install>` уже сейчас, есть два варианта:

- Протестировать элемент локально только на своем устройстве.
- Протестировать элемент в реальных условиях с вашими пользователями, зарегистрировавшись в origin trial.

### Локальное тестирование

Чтобы протестировать элемент на своем устройстве:

1. Используйте Chrome или Edge версии 148 или новее.
2. Откройте `about://flags/#web-app-install-element` в новой вкладке.
3. Установите **Web App Install Element** в значение **Enabled**.
4. Перезапустите браузер.

### Тестирование на рабочем сайте через origin trial

Origin trial позволяет реальным пользователям на вашем production-сайте использовать функцию без предварительного включения флага.

1. Откройте [страницу регистрации origin trial](https://developer.chrome.com/origintrials#/view_trial/506092008125759489) для элемента `<install>`.
2. Войдите в аккаунт.
3. Нажмите **Register**.
4. Укажите origin вашего сайта и заполните остальную часть формы.
5. После отправки формы вы получите строку токена.
6. Добавьте токен на страницы сайта с помощью тега `<meta>`:

```html
<meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE" />
```

Также можно отправлять токен в HTTP-заголовке ответа:

```
Origin-Trial: YOUR_TOKEN_HERE
```

Origin trial доступен в Chrome и Edge с версии 148 по 153, и один и тот же токен будет работать в обоих браузерах. Подробнее об origin trials:

- [Get started with origin trials](https://developer.chrome.com/docs/web-platform/origin-trials) для Chrome.
- [Test experimental APIs and features by using origin trials](https://learn.microsoft.com/microsoft-edge/origin-trials/) для Edge.

## Посмотрите в действии

Посмотрите демо [`<install>` Element Store](https://microsoftedge.github.io/Demos/pwa-install-element/index.html): это каталог PWA, который использует элемент `<install>` для установки нескольких демонстрационных приложений.

## Сравнение с Web Install API

Элемент `<install>` — не единственный экспериментальный подход к улучшению установки приложений в вебе.

Ранее мы экспериментировали с Web Install API (`navigator.install()`) — императивным JavaScript API, который также позволяет сайту запускать установку веб-приложений с того же или другого origin. Подробнее см. в статье [The Web Install API is ready for testing](https://blogs.windows.com/msedgedev/2025/11/24/the-web-install-api-is-ready-for-testing/).

У Web Install API тоже есть собственный [origin trial](https://developer.chrome.com/origintrials#/view_trial/2367204554136616961).

Вот как сравниваются два подхода:

|  | **элемент** | **API `navigator.install()`** |
| --- | --- | --- |
| **Подход** | Декларативный HTML | Императивный JavaScript |
| **Необходимый код** | Один HTML-элемент | JavaScript для вызова `navigator.install()` и обработки возвращенного promise |
| **Доверие браузера** | Высокое: браузер контролирует содержимое и внешний вид кнопки, как у элементов разрешений | Низкое: требуется активация пользователем (клик, касание) как сигнал доверия |
| **Установка с другого origin** | Да, через `installurl` | Да, если передать URL в `navigator.install()` |
| **Кастомизация** | Минимальная: браузер сам решает, как выглядит кнопка | Полная: вы проектируете собственный UI и вызываете API из любого взаимодействия |
| **Fallback** | Встроенный: дочернее содержимое отображается, если элемент не поддерживается | Вы сами пишете определение поддержки и fallback-логику |
| **Лучше всего подходит для** | Готовых кнопок установки с минимумом кода; сценариев, где желателен UI, которому доверяет браузер | Кастомных процессов установки, динамических UI каталогов, интеграции в существующие интерфейсы с большим количеством JavaScript |

## Расскажите, что думаете

Мы активно собираем обратную связь по обоим подходам. В зависимости от ваших потребностей мы можем добавить поддержку элемента `<install>`, API `navigator.install()` или обоих вариантов.

Чтобы поделиться отзывом об элементе `<install>`, [создайте issue в репозитории WICG, посвященном этому предложению](https://github.com/WICG/install-element/issues/new?template=install-element-ot-feedback.md).

Чтобы поделиться отзывом об API `navigator.install()`, добавьте комментарий в issue [Developer Feedback: navigator.install versus `<install>` element](https://github.com/WICG/install-element/issues/new?template=install-element-ot-feedback.md).

## Ресурсы

- [Explainer: элемент `<install>`](https://github.com/WICG/install-element)
- [Демо: магазин на элементе `<install>`](https://microsoftedge.github.io/Demos/pwa-install-element/index.html)
- [Инструкции по использованию и исходный код демо](https://github.com/MicrosoftEdge/Demos/blob/main/pwa-install-element/README.md)
- [Запись в Chrome Platform Status](https://chromestatus.com/feature/5152834368700416)
- [The Web Install API is ready for testing](https://blogs.windows.com/msedgedev/2025/11/24/the-web-install-api-is-ready-for-testing/) (блог Edge)
- [Explainer Web Install API](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/WebInstall/explainer.md)
