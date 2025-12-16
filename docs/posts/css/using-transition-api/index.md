---
date: 2025-12-16
description: В этой статье объясняется теория работы View Transition API, как создавать переходы представлений и настраивать анимации переходов, а также как управлять активными переходами
tags:
    - css
    - js
categories:
    - CSS
slug: using-transition-api
---

# Использование View Transition API

В этой статье объясняется теория работы [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), как создавать переходы представлений и настраивать анимации переходов, а также как управлять активными переходами. Здесь рассматриваются переходы представлений как для обновлений состояния DOM в одностраничных приложениях (SPA), так и для навигации между документами в многостраничных приложениях (MPA).

<!-- more -->

## Процесс перехода представления

Рассмотрим процесс работы перехода представления:

1.  Переход представления запускается. Способ запуска зависит от типа перехода:
    - В случае переходов внутри документа (SPA) переход запускается путём передачи функции, которая вызывает обновление DOM, в качестве колбэка методу [`document.startViewTransition()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition).

    - В случае межстраничных переходов (MPA) переход запускается инициацией навигации к новому документу. И текущий, и целевой документы навигации должны находиться на одном источнике (origin) и включить поддержку перехода через at-правило [`@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition) в их CSS с дескриптором `navigation` со значением `auto`.

    !!!note "Объект ViewTransition"

        Активный переход представления имеет связанный экземпляр [ViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition) (например, возвращаемый методом `startViewTransition()` в случае переходов внутри документа (SPA)). Объект `ViewTransition` включает несколько промисов, позволяющих выполнять код в ответ на достижение различных этапов процесса перехода. См. раздел [Управление переходами с помощью JavaScript](#controlling_view_transitions_with_javascript) для получения дополнительной информации.

2.  На текущем (старом) представлении API захватывает статические **снимки** элементов, у которых объявлено свойство [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name).

3.  Происходит изменение представления:
    - В случае переходов внутри документа (SPA) вызывается колбэк, переданный в `startViewTransition()`, что приводит к изменению DOM.

        Когда колбэк успешно выполнен, промис [`ViewTransition.updateCallbackDone`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/updateCallbackDone) выполняется, позволяя вам реагировать на обновление DOM.

    - В случае межстраничных переходов (MPA) происходит навигация между текущим и целевым документами.

4.  API захватывает «живые» снимки (то есть интерактивные области DOM) нового представления.

    На этом этапе переход представления готов к запуску, и промис [`ViewTransition.ready`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/ready) выполняется, позволяя вам реагировать, например, запуском пользовательской JavaScript-анимации вместо стандартной.

5.  Снимки старой страницы анимируются «наружу», а снимки нового представления анимируются «внутрь». По умолчанию снимки старого представления анимируются от [`opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/opacity) 1 до 0, а снимки нового представления — от `opacity` 0 до 1, что создаёт эффект перекрёстного затухания.

6.  Когда анимации перехода достигают конечных состояний, промис [`ViewTransition.finished`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished) выполняется, позволяя вам реагировать.

!!!note "Видимость страницы"

    Если [состояние видимости страницы](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) документа равно `hidden` (например, если документ скрыт окном, браузер свёрнут или активна другая вкладка браузера) во время вызова [`document.startViewTransition()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition), переход представления полностью пропускается.

### О снимках

Стоит отметить, что когда мы говорим о переходах представлений, мы обычно используем термин _снимок_ для обозначения части страницы, у которой объявлено свойство `view-transition-name`. Эти секции будут анимироваться отдельно от других частей страницы с другими значениями `view-transition-name`. Хотя процесс анимации снимка через переход представления фактически включает два отдельных снимка — один старого и один нового состояния UI — мы используем слово «снимок» для обозначения всей области страницы для простоты.

Снимок старого состояния UI — это статическое изображение, поэтому пользователь не может взаимодействовать с ним во время анимации «наружу».

Снимок нового состояния UI — это интерактивная область DOM, поэтому пользователь может начать взаимодействовать с новым контентом, пока он анимируется «внутрь».

### Дерево псевдоэлементов перехода представления

Для создания исходящей и входящей анимаций переходов API создаёт дерево псевдоэлементов следующей структуры:

```plain
::view-transition
└─ ::view-transition-group(root)
  └─ ::view-transition-image-pair(root)
      ├─ ::view-transition-old(root)
      └─ ::view-transition-new(root)
```

В случае переходов внутри документа (SPA) дерево псевдоэлементов становится доступным в документе. В случае межстраничных переходов (MPA) дерево псевдоэлементов становится доступным только в целевом документе.

Наиболее интересные части структуры дерева:

- [`::view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition) — это корень оверлея переходов представлений, который содержит все группы переходов и располагается поверх всего остального содержимого страницы.
- [`::view-transition-group()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-group) выступает контейнером для каждого снимка перехода представления. Аргумент `root` указывает на снимок по умолчанию — анимация перехода будет применена к снимку, чей `view-transition-name` равен `root`. По умолчанию это снимок элемента [`:root`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:root), так как стандартные стили браузера определяют:

    ```css
    :root {
        view-transition-name: root;
    }
    ```

    Однако имейте в виду, что авторы страниц могут изменить это, отменив вышеуказанное и установив `view-transition-name: root` на другой элемент.

- [`::view-transition-old()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-old) нацелен на статический снимок старого элемента страницы, а [`::view-transition-new()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-new) — на живой снимок нового элемента страницы. Оба отрисовываются как замещаемый контент, аналогично [`img`](https://hcdev.ru/html/img) или [`video`](https://hcdev.ru/html/video), что означает, что их можно стилизовать с помощью таких свойств, как [`object-fit`](https://hcdev.ru/css/object-fit) и [`object-position`](https://hcdev.ru/css/object-position).

!!!note "Индивидуальные переходы"

    Можно нацеливать разные элементы DOM с разными пользовательскими анимациями переходов, устанавливая разные значения [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name) на каждом из них. В таких случаях для каждого создаётся отдельный `::view-transition-group()`. См. раздел [Разные анимации для разных элементов](#different_animations_for_different_elements) для примера.

!!!note "Настройка анимаций"

    Как вы увидите далее, для настройки исходящей и входящей анимаций нужно нацеливать псевдоэлементы [`::view-transition-old()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-old) и [`::view-transition-new()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-new) с вашими анимациями соответственно.

## Создание базового перехода представления

В этом разделе показано, как создать базовый переход представления в случаях SPA и MPA.

### Базовый переход в SPA

SPA может включать функциональность для получения нового контента и обновления DOM в ответ на какое-либо событие, например, клик по навигационной ссылке или получение обновления с сервера.

Наше [демо View Transitions SPA](https://mdn.github.io/dom-examples/view-transitions/spa/) — это базовая галерея изображений. У нас есть набор элементов [`a`](https://hcdev.ru/html/a), содержащих миниатюры [`img`](https://hcdev.ru/html/img), динамически сгенерированных с помощью JavaScript. Также есть элемент [`figure`](https://hcdev.ru/html/figure), содержащий [`figcaption`](https://hcdev.ru/html/figcaption) и `<img>`, который отображает полноразмерные изображения галереи.

При клике на миниатюру выполняется функция `displayNewImage()` через [`Document.startViewTransition()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition), которая отображает полноразмерное изображение и связанную с ним подпись внутри `<figure>`. Мы обернули это в функцию `updateView()`, которая вызывает View Transition API только если браузер его поддерживает:

```js
function updateView(event) {
    // Обрабатываем разницу в том, на <a> или на <img> сработало событие
    const targetIdentifier = event.target.firstChild || event.target;

    const displayNewImage = () => {
        const mainSrc = `${targetIdentifier.src.split('_th.jpg')[0]}.jpg`;
        galleryImg.src = mainSrc;
        galleryCaption.textContent = targetIdentifier.alt;
    };

    // Запасной вариант для браузеров, не поддерживающих View Transitions:
    if (!document.startViewTransition) {
        displayNewImage();
        return;
    }

    // С View Transitions:
    const transition = document.startViewTransition(() => displayNewImage());
}
```

Этого кода достаточно для обработки перехода между отображаемыми изображениями. Поддерживающие браузеры покажут изменение от старых к новым изображениям и подписям как плавное перекрёстное затухание (переход по умолчанию). В неподдерживающих браузерах код всё равно будет работать, но без красивой анимации.

### Базовый переход в MPA

При создании межстраничного (MPA) перехода процесс ещё проще, чем для SPA. JavaScript не требуется, так как обновление представления запускается межстраничной навигацией с того же источника, а не инициированным JavaScript изменением DOM. Чтобы включить базовый MPA-переход, нужно указать at-правило [`@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition) в CSS как текущего, так и целевого документов:

```css
@view-transition {
    navigation: auto;
}
```

Наше [демо View Transitions MPA](https://mdn.github.io/dom-examples/view-transitions/mpa/) показывает это at-правило в действии, а также демонстрирует, как [настроить исходящую и входящую анимации](#customizing_your_animations) перехода представления.

!!!note "Ограничение same-origin"

    В настоящее время MPA-переходы можно создавать только между документами с одного источника, но это ограничение может быть ослаблено в будущих реализациях.

## Настройка анимаций {#customizing_your_animations}

Псевдоэлементы View Transitions имеют стандартные [CSS-анимации](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations), применяемые по умолчанию (подробности на [справочных страницах](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API#pseudo-elements)).

Большинству переходов внешнего вида задаётся плавная анимация перекрёстного затухания, как упоминалось выше. Есть несколько исключений:

- Переходы `height` и `width` получают плавную анимацию масштабирования.
- Переходы `position` и `transform` получают плавную анимацию перемещения.

Вы можете изменять стандартные анимации любым способом с помощью обычного CSS — нацеливайте анимацию «из» с помощью [`::view-transition-old()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-old), а анимацию «в» — с помощью [`::view-transition-new()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::view-transition-new).

Например, чтобы изменить скорость обеих:

```css
::view-transition-old(root),
::view-transition-new(root) {
    animation-duration: 0.5s;
}
```

Рекомендуется нацеливать `::view-transition-group()` с такими стилями в случаях, когда вы хотите применить их к `::view-transition-old()` и `::view-transition-new()`. Из-за иерархии псевдоэлементов и стандартных стилей user-agent стили будут унаследованы обоими. Например:

```css
::view-transition-group(root) {
    animation-duration: 0.5s;
}
```

!!!note "Согласованность анимаций"

    Это также хороший вариант для защиты вашего кода — `::view-transition-group()` тоже анимируется, и вы можете получить разные длительности для псевдоэлементов `group`/`image-pair` в сравнении с псевдоэлементами `old` и `new`.

В случае межстраничных (MPA) переходов псевдоэлементы должны быть включены только в целевой документ для работы перехода. Если вы хотите использовать переход в обоих направлениях, вам нужно включить их в оба документа.

Наше [демо View Transitions MPA](https://mdn.github.io/dom-examples/view-transitions/mpa/) включает указанный выше CSS, но идёт дальше в настройке, определяя пользовательские анимации и применяя их к псевдоэлементам `::view-transition-old(root)` и `::view-transition-new(root)`. В результате стандартный переход перекрёстного затухания заменяется на переход «сдвиг вверх» при навигации:

```css
/* Создаём пользовательскую анимацию */

@keyframes move-out {
    from {
        transform: translateY(0%);
    }

    to {
        transform: translateY(-100%);
    }
}

@keyframes move-in {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0%);
    }
}

/* Применяем пользовательскую анимацию к старому и новому состояниям страницы */

::view-transition-old(root) {
    animation: 0.4s ease-in both move-out;
}

::view-transition-new(root) {
    animation: 0.4s ease-in both move-in;
}
```

## Разные анимации для разных элементов {#different_animations_for_different_elements}

По умолчанию все различные элементы, которые изменяются во время обновления представления, переходят с использованием одной и той же анимации. Если вы хотите, чтобы некоторые элементы анимировались иначе, чем стандартная анимация `root`, вы можете выделить их с помощью свойства [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name). Например, в нашем [демо View Transitions SPA](https://mdn.github.io/dom-examples/view-transitions/spa/) элементам [`figcaption`](https://hcdev.ru/html/figcaption) задаётся `view-transition-name` со значением `figure-caption`, чтобы отделить их от остальной части страницы в плане переходов представлений:

```css
figcaption {
    view-transition-name: figure-caption;
}
```

С применением этого CSS сгенерированное дерево псевдоэлементов теперь будет выглядеть так:

```plain
::view-transition
├─ ::view-transition-group(root)
│ └─ ::view-transition-image-pair(root)
│     ├─ ::view-transition-old(root)
│     └─ ::view-transition-new(root)
└─ ::view-transition-group(figure-caption)
  └─ ::view-transition-image-pair(figure-caption)
      ├─ ::view-transition-old(figure-caption)
      └─ ::view-transition-new(figure-caption)
```

Существование второго набора псевдоэлементов позволяет применять отдельные стили перехода представления только к `<figcaption>`. Разные захваты старого и нового представлений обрабатываются независимо друг от друга.

Следующий код применяет пользовательскую анимацию только к `<figcaption>`:

```css
@keyframes grow-x {
    from {
        transform: scaleX(0);
    }
    to {
        transform: scaleX(1);
    }
}

@keyframes shrink-x {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}

::view-transition-group(figure-caption) {
    height: auto;
    right: 0;
    left: auto;
    transform-origin: right center;
}

::view-transition-old(figure-caption) {
    animation: 0.25s linear both shrink-x;
}

::view-transition-new(figure-caption) {
    animation: 0.25s 0.25s linear both grow-x;
}
```

Здесь мы создали пользовательскую CSS-анимацию и применили её к псевдоэлементам `::view-transition-old(figure-caption)` и `::view-transition-new(figure-caption)`. Мы также добавили ряд других стилей к обоим, чтобы сохранить их на месте и предотвратить влияние стандартных стилей на наши пользовательские анимации.

!!!note "Универсальный селектор"

    Вы можете использовать `*` в качестве идентификатора в псевдоэлементе для нацеливания на все псевдоэлементы снимков, независимо от их имени. Например:

    ```css
    ::view-transition-group(*) {
        animation-duration: 2s;
    }
    ```

### Допустимые значения `view-transition-name`

Свойство `view-transition-name` может принимать уникальное значение [`custom-ident`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/custom-ident), которое может быть любым идентификатором, который не будет ошибочно интерпретирован как ключевое слово. Значение `view-transition-name` для каждого отрисованного элемента должно быть уникальным. Если два отрисованных элемента имеют одинаковый `view-transition-name` одновременно, [`ViewTransition.ready`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/ready) будет отклонён и переход будет пропущен.

Также допустимы ключевые значения:

- `none`: Элемент не участвует в отдельном снимке, если только у него нет родительского элемента с установленным `view-transition-name`, в этом случае он будет захвачен как часть этого элемента.
- `match-element`: Автоматически устанавливает уникальные значения `view-transition-name` на всех выбранных элементах.

### Использование преимуществ стандартных стилей анимации

Обратите внимание, что мы также обнаружили другой вариант перехода, который проще и даёт более красивый результат, чем приведённый выше. Наш окончательный переход представления `<figcaption>` выглядит так:

```css
figcaption {
    view-transition-name: figure-caption;
}

::view-transition-group(figure-caption) {
    height: 100%;
}
```

Это работает, потому что по умолчанию `::view-transition-group()` плавно переходит `width` и `height` между старым и новым представлениями с плавным масштабированием. Нам просто нужно было установить фиксированную `height` для обоих состояний, чтобы это заработало.

!!!note "Дополнительные примеры"

    [Плавные переходы с View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions/) содержит несколько других примеров настройки.

## Управление переходами с помощью JavaScript {#controlling_view_transitions_with_javascript}

Переход представления имеет связанный экземпляр объекта [`ViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition), который содержит несколько членов-промисов, позволяющих выполнять JavaScript в ответ на достижение различных состояний перехода. Например, [`ViewTransition.ready`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/ready) выполняется, когда дерево псевдоэлементов создано и анимация вот-вот начнётся, тогда как [`ViewTransition.finished`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished) выполняется, когда анимация завершена и новое представление страницы видимо и интерактивно для пользователя.

Доступ к `ViewTransition` можно получить следующими способами:

1.  Через свойство {{domxref("Document.activeViewTransition")}}. Это обеспечивает согласованный способ доступа к активному переходу представления в любом контексте, без необходимости сохранять его для лёгкого доступа позже.

2.  В случае переходов внутри документа (SPA) метод {{domxref("Document.startViewTransition()", "document.startViewTransition()")}} возвращает `ViewTransition`, связанный с переходом.

3.  В случае межстраничных (MPA) переходов:
    - Событие [`pageswap`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageswap_event) срабатывает, когда документ вот-вот будет выгружен из-за навигации. Его объект события ([`PageSwapEvent`](https://developer.mozilla.org/en-US/docs/Web/API/PageSwapEvent)) предоставляет доступ к `ViewTransition` через свойство [`PageSwapEvent.viewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/PageSwapEvent/viewTransition), а также к [`NavigationActivation`](https://developer.mozilla.org/en-US/docs/Web/API/NavigationActivation) через [`PageSwapEvent.activation`](https://developer.mozilla.org/en-US/docs/Web/API/PageSwapEvent/activation), содержащему тип навигации и записи истории текущего и целевого документов.

    !!!note "Cross-origin редиректы"

        Если навигация имеет URL с другого источника в любом месте цепочки перенаправлений, свойство `activation` возвращает `null`.

    - Событие [`pagereveal`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagereveal_event) срабатывает при первой отрисовке документа, будь то загрузка свежего документа из сети или активация документа (либо из [кэша back/forward](https://developer.mozilla.org/en-US/docs/Glossary/bfcache) (bfcache), либо при [предварительной отрисовке](https://developer.mozilla.org/en-US/docs/Glossary/Prerender)). Его объект события ([`PageRevealEvent`](https://developer.mozilla.org/en-US/docs/Web/API/PageRevealEvent)) предоставляет доступ к `ViewTransition` через свойство [`PageRevealEvent.viewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/PageRevealEvent/viewTransition).

Рассмотрим несколько примеров кода, показывающих, как эти функции можно использовать.

### Пользовательский переход внутри документа (SPA) на JavaScript

Следующий JavaScript можно использовать для создания кругового перехода представления, раскрывающегося от позиции курсора пользователя при клике, с анимацией, предоставляемой [`Web Animations API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

```js
// Сохраняем последнее событие клика
let lastClick;
addEventListener('click', (event) => (lastClick = event));

function spaNavigate(data) {
    // Запасной вариант для браузеров, не поддерживающих этот API:
    if (!document.startViewTransition) {
        updateTheDOMSomehow(data);
        return;
    }

    // Получаем позицию клика или используем центр экрана по умолчанию
    const x = lastClick?.clientX ?? innerWidth / 2;
    const y = lastClick?.clientY ?? innerHeight / 2;
    // Получаем расстояние до самого дальнего угла
    const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
    );

    // Создаём переход:
    const transition = document.startViewTransition(() => {
        updateTheDOMSomehow(data);
    });

    // Ждём создания псевдоэлементов:
    transition.ready.then(() => {
        // Анимируем новое представление корневого элемента
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0 at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 500,
                easing: 'ease-in',
                // Указываем, какой псевдоэлемент анимировать
                pseudoElement: '::view-transition-new(root)',
            },
        );
    });
}
```

Эта анимация также требует следующего CSS, чтобы отключить стандартную CSS-анимацию и предотвратить смешивание старого и нового состояний представлений (новое состояние «вытирает» прямо поверх старого, а не плавно переходит):

```css
::view-transition-image-pair(root) {
    isolation: auto;
}

::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    display: block;
}
```

### Пользовательский межстраничный переход (MPA) на JavaScript

[Демо со списком членов команды Chrome DevRel](https://view-transitions.chrome.dev/profiles/mpa/) представляет базовый набор страниц профилей команды и демонстрирует, как использовать события [`pageswap`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageswap_event) и [`pagereveal`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagereveal_event) для настройки исходящей и входящей анимаций межстраничного перехода представления на основе URL-адресов «откуда» и «куда».

Обработчик события [`pageswap`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageswap_event) выглядит следующим образом. Он устанавливает имена переходов представлений на элементах исходящей страницы, которые ведут на страницы профилей. При навигации с главной страницы на страницу профиля пользовательские анимации предоставляются _только_ для нажатого элемента ссылки в каждом случае.

```js
window.addEventListener('pageswap', async (e) => {
    // Выполняем только при наличии активного перехода представления
    if (e.viewTransition) {
        const currentUrl = e.activation.from?.url
            ? new URL(e.activation.from.url)
            : null;
        const targetUrl = new URL(e.activation.entry.url);

        // Переход со страницы профиля на главную
        // ~> Большое изображение и заголовок — наши цели!
        if (isProfilePage(currentUrl) && isHomePage(targetUrl)) {
            // Устанавливаем значения view-transition-name на элементах для анимации
            document.querySelector(`#detail main h1`).style.viewTransitionName =
                'name';
            document.querySelector(
                `#detail main img`,
            ).style.viewTransitionName = 'avatar';

            // Удаляем view-transition-names после захвата снимков
            // Предотвращаем конфликты имён из-за сохранения состояния страницы в BFCache
            await e.viewTransition.finished;
            document.querySelector(`#detail main h1`).style.viewTransitionName =
                'none';
            document.querySelector(
                `#detail main img`,
            ).style.viewTransitionName = 'none';
        }

        // Переход на страницу профиля
        // ~> Нажатые элементы — наши цели!
        if (isProfilePage(targetUrl)) {
            const profile = extractProfileNameFromUrl(targetUrl);

            // Устанавливаем значения view-transition-name на элементах для анимации
            document.querySelector(
                `#${profile} span`,
            ).style.viewTransitionName = 'name';
            document.querySelector(`#${profile} img`).style.viewTransitionName =
                'avatar';

            // Удаляем view-transition-names после захвата снимков
            // Предотвращаем конфликты имён из-за сохранения состояния страницы в BFCache
            await e.viewTransition.finished;
            document.querySelector(
                `#${profile} span`,
            ).style.viewTransitionName = 'none';
            document.querySelector(`#${profile} img`).style.viewTransitionName =
                'none';
        }
    }
});
```

!!!note "Очистка имён"

    Мы удаляем значения `view-transition-name` после захвата снимков в каждом случае. Если оставить их установленными, они сохранятся в состоянии страницы, сохранённом в [bfcache](https://developer.mozilla.org/en-US/docs/Glossary/bfcache) при навигации. Если затем нажать кнопку «Назад», обработчик события `pagereveal` страницы, на которую возвращаемся, попытается установить те же значения `view-transition-name` на других элементах. Если несколько элементов имеют одинаковый установленный `view-transition-name`, переход представления пропускается.

Обработчик события [`pagereveal`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagereveal_event) выглядит следующим образом. Он работает аналогично обработчику события `pageswap`, но имейте в виду, что здесь мы настраиваем анимацию «в» для элементов страницы на новой странице.

```js
window.addEventListener('pagereveal', async (e) => {
    // Если запись истории «откуда» не существует, выходим
    if (!navigation.activation.from) return;

    // Выполняем только при наличии активного перехода представления
    if (e.viewTransition) {
        const fromUrl = new URL(navigation.activation.from.url);
        const currentUrl = new URL(navigation.activation.entry.url);

        // Перешли со страницы профиля на главную
        // ~> Устанавливаем VT-имена на соответствующем элементе списка
        if (isProfilePage(fromUrl) && isHomePage(currentUrl)) {
            const profile = extractProfileNameFromUrl(fromUrl);

            // Устанавливаем значения view-transition-name на элементах для анимации
            document.querySelector(
                `#${profile} span`,
            ).style.viewTransitionName = 'name';
            document.querySelector(`#${profile} img`).style.viewTransitionName =
                'avatar';

            // Удаляем имена после захвата снимков,
            // чтобы быть готовыми к следующей навигации
            await e.viewTransition.ready;
            document.querySelector(
                `#${profile} span`,
            ).style.viewTransitionName = 'none';
            document.querySelector(`#${profile} img`).style.viewTransitionName =
                'none';
        }

        // Перешли на страницу профиля
        // ~> Устанавливаем VT-имена на главном заголовке и изображении
        if (isProfilePage(currentUrl)) {
            // Устанавливаем значения view-transition-name на элементах для анимации
            document.querySelector(`#detail main h1`).style.viewTransitionName =
                'name';
            document.querySelector(
                `#detail main img`,
            ).style.viewTransitionName = 'avatar';

            // Удаляем имена после захвата снимков,
            // чтобы быть готовыми к следующей навигации
            await e.viewTransition.ready;
            document.querySelector(`#detail main h1`).style.viewTransitionName =
                'none';
            document.querySelector(
                `#detail main img`,
            ).style.viewTransitionName = 'none';
        }
    }
});
```

## Стабилизация состояния страницы для согласованных межстраничных переходов

Перед запуском межстраничного перехода вы в идеале хотите дождаться стабилизации состояния страницы, полагаясь на [блокировку рендеринга](https://developer.mozilla.org/en-US/docs/Glossary/Render_blocking), чтобы убедиться, что:

1.  Критические стили загружены и применены.
2.  Критические скрипты загружены и выполнены.
3.  HTML, видимый для начального представления пользователя, был разобран, поэтому он отрисовывается согласованно.

Стили блокируют рендеринг по умолчанию, если они не добавлены в документ динамически через скрипт. И скрипты, и динамически добавленные стили можно заблокировать от рендеринга с помощью атрибута [`blocking="render"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script#blocking).

Чтобы убедиться, что ваш начальный HTML был разобран и всегда будет отрисовываться согласованно перед запуском анимации перехода, вы можете использовать [`<link rel="expect">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#expect). В этом элементе вы включаете следующие атрибуты:

- `rel="expect"` для указания, что вы хотите использовать этот элемент `<link>` для блокировки рендеринга некоторого HTML на странице.
- `href="#element-id"` для указания ID элемента, который вы хотите заблокировать от рендеринга.
- `blocking="render"` для блокировки рендеринга указанного HTML.

!!!note "Размещение в head"

    Для блокировки рендеринга элементы `script`, `link` и `style` с `blocking="render"` должны находиться в `head` документа.

Рассмотрим это на примере HTML-документа:

```html
<!doctype html>
<html lang="ru">
    <head>
        <!-- Это будет блокировать рендеринг по умолчанию -->
        <link rel="stylesheet" href="style.css" />

        <!-- Пометка критических скриптов как блокирующих рендеринг
         гарантирует, что они выполнятся до активации перехода представления -->
        <script async src="layout.js" blocking="render"></script>

        <!-- Используем rel="expect" и blocking="render", чтобы убедиться,
         что элемент #lead-content виден и полностью разобран
         перед активацией перехода -->
        <link rel="expect" href="#lead-content" blocking="render" />
    </head>
    <body>
        <h1>Заголовок страницы</h1>
        <nav>...</nav>
        <div id="lead-content">
            <section id="first-section">Первая секция</section>
            <section>Вторая секция</section>
        </div>
    </body>
</html>
```

В результате рендеринг документа блокируется до тех пор, пока `<div>` с основным контентом не будет разобран, что обеспечивает согласованный переход представления.

Вы также можете указать атрибут [`media`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link#media) на элементах `<link rel="expect">`. Например, вы можете захотеть заблокировать рендеринг меньшего количества контента при загрузке страницы на устройстве с узким экраном, чем на устройстве с широким экраном. Это имеет смысл — на мобильном устройстве при первой загрузке страницы будет видно меньше контента, чем на десктопе.

Это можно реализовать следующим HTML:

```html
<link
    rel="expect"
    href="#lead-content"
    blocking="render"
    media="screen and (width > 640px)"
/>
<link
    rel="expect"
    href="#first-section"
    blocking="render"
    media="screen and (width <= 640px)"
/>
```

<small>Источник: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using></small>
