---
date: 2025-12-03
description: как можно с помощью чистого JavaScript и стандартных браузерных API сделать простой SPA-роутер
tags:
    - js
    - router
    - webcomponents
categories:
    - JS
slug: build-your-own-router
---

# Создаем свой роутер

Я решил разобрать, как можно с помощью чистого JavaScript и стандартных браузерных API сделать простой SPA-роутер. Мы должны суметь создать компонент, который принимает конфигурацию роутера и рендерит соответствующий компонент в зависимости от текущего URL браузера.

<!-- more -->

`URLPattern` теперь доступен во всех основных браузерах:

- Chrome 95+
- Safari 26+
- Firefox 142+

## Что делает `URLPattern()`?

Условный рендеринг компонентов — не самая сложная часть при создании роутеров. Самое сложное — корректно определить, соответствует ли URL в браузере определенному маршруту, и на основе этого выбрать нужный компонент для отображения. Кроме того, нужно уметь обрабатывать динамические части маршрутов (например, такие как `/posts/{post_id}`).

Итак, вот примеры, показывающие, как проверить, соответствует ли URL заданному шаблону! В дальнейшем этот механизм можно использовать для создания роутера с настраиваемыми маршрутами.

```js
const catUrlPattern = new URLPattern({ pathname: '/cat' });

catUrlPattern.test('http://www.jschof.dev/cat'); // True!
catUrlPattern.test('http://www.jschof.dev/dog'); // False!
catUrlPattern.test({ pathname: '/cat' }); // True!
catUrlPattern.test('http://www.jschof.dev/cat/'); // False!
catUrlPattern.test('http://www.jschof.dev/cat/other-things?yes'); // False!
```

Возможно, вас удивил четвертый пример выше. Здесь есть различие между `/cat` и `/cat/`. Чтобы обработать это, можно сделать завершающий слэш опциональным, поместив его в фигурные скобки и добавив знак вопроса `?`:

```js
const catUrlPattern = new URLPattern({ pathname: '/cat{/}?' });

catUrlPattern.test('http://www.jschof.dev/cat'); // True!
catUrlPattern.test({ pathname: '/cat/' }); // True!
catUrlPattern.test('http://www.jschof.dev/cat/'); // True!
catUrlPattern.test('http://www.jschof.dev/cat/other-things?yes'); // False!
```

Еще один сюрприз! Возможно, вы ожидаете, что после `/cat/` можно будет принимать что-то еще. Для этого используйте звездочку-джокер (\*):

```js
const catUrlPattern = new URLPattern({ pathname: '/cat{/}?*' });

catUrlPattern.test('http://www.jschof.dev/cat'); // True!
catUrlPattern.test({ pathname: '/cat/' }); // True!
catUrlPattern.test('http://www.jschof.dev/cat/'); // True!
catUrlPattern.test('http://www.jschof.dev/cat/other-things?yes'); // True!
```

## С чего начать?

Я собираюсь использовать массив объектов конфигурации, которые связывают URL-маршруты с конкретными веб-компонентами. Это очень похоже на то, как можно создавать роутеры с помощью [`vue-router`](https://router.vuejs.org/guide/#Creating-the-router-instance).

```js
const routerConfig = [
    { pathName: new URLPattern('/home{/}?'), component: 'my-home' },
    { pathName: new URLPattern('/posts{/}?'), component: 'my-posts' },
    { pathName: new URLPattern('/about{/}?'), component: 'my-about' },
];
```

Порядок объектов в конфигурации имеет значение. Мы будем последовательно проверять каждый шаблон, и если найдем совпадение, отрисуем соответствующий веб-компонент.

```js
for (const config of routerConfig) {
    if (config.pathName.test(window.location.href)) {
        // render config.component!

        return;
    }
}

// TODO: Handle 404!
```

Как же происходит отображение компонентов? Этим занимается веб-компонент, в который мы помещаем всю эту логику. Компонент будет смотреть на текущий URL окна, проверять его по всем настройкам маршрутов, которые мы задали с помощью URLPattern, и создавать подходящий веб-компонент в качестве дочернего элемента.

В некоторых фреймворках подобный роутер называют компонентом "outlet" (или "точкой выхода").

```js
const routerConfig = [
    { pathName: new URLPattern('/home{/}?'), component: 'my-home' },
    { pathName: new URLPattern('/posts{/}?'), component: 'my-posts' },
    { pathName: new URLPattern('/about{/}?'), component: 'my-about' },
];

class MyRouter extends HTMLElement {
    constructor() {
        super();

        const matchedComponent = this.getRouteMatch();
        this.renderComponent(matchedComponent);
    }

    getRouteMatch() {
        for (const config of routerConfig) {
            if (config.pathName.test(window.location.href)) {
                return config.component;
            }
        }

        // TODO: handle 404!
    }

    renderComponent(component) {
        this.innerHTML = '';

        const viewElement = document.createElement(component);

        this.appendChild(viewElement);
    }
}

customElements.define('my-router', MyRouter);
```

Конечно, вам также нужно зарегистрировать веб-компоненты `my-home`, `my-posts` и `my-about`.

Вот и всё — у нас теперь есть роутер, который будет отображать соответствующий веб-компонент при загрузке страницы. Но работы ещё много. А что, если пользователь кликнет по ссылке? А если он воспользуется кнопками "вперёд" или "назад" в браузере? Этим тоже нужно управлять, и, к счастью, это не слишком сложно.

## Обработка SPA-навигации и кликов по ссылкам

Важно понимать, что если вы перейдёте на адрес вроде `http://www.myblog.com/some/path`, сервер обычно попытается найти путь `/some/path` на своей стороне. То есть реально будет искать папки "some" и "path". Но в SPA (Single Page Application) таких папок нет — у нас всего один файл index.html, который обрабатывает _виртуальные_ пути. Всё это происходит на стороне клиента с помощью JS! На каком бы пути вы ни находились, по сути серверу нужно всего лишь отдать index-страницу. Дальше клиентский код берёт всё под свой контроль, используя наш `URLPattern`, и отображает необходимые компоненты.

Чтобы настроить Vite для работы в таком режиме, всё очень просто. Можно использовать тип приложения `spa`. Просто обновите ваш конфиг vite:

```js
import { defineConfig } from 'vite';

export default defineConfig({
    appType: 'spa',
});
```

Это работает отлично в локальном сервере Vite. К сожалению, всё зависит от того, где вы деплоите проект и какие другие фреймворки или dev-серверы используете. Например, для netlify нужно прописать правило для редиректов в вашем конфиге netlify. В других случаях придётся погуглить, спросить на Stack Overflow или воспользоваться вашей любимой LLM, чтобы подобрать правильную настройку под ваш конкретный случай.

Когда сервер настроен и редиректы работают как надо, мы можем перейти к обработке кликов!

Нам нужно перехватывать любые клики по ссылкам и не позволять браузеру переходить на новые страницы обычным способом. Для этого мы вызываем `preventDefault()` для всех click-событий, извлекаем адрес из цели ссылки и сравниваем с нашими URL-паттернами. Это позволяет нам понять, какой компонент надо отобразить, а сам адрес мы вручную выставляем тот, на который и указывает ссылка. В итоге кажется, будто переходит на новую страницу — а на самом деле мы просто эмулируем переход.

Поэтому нам нужно навесить обработчик кликов, как только наш компонент-роутер появляется в DOM:

```js
class MyRouter extends HTMLElement {
    //...

    connectedCallback() {
        window.addEventListener('click', this.handleClicks);
    }

    handleClicks = (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            // Don't handle this link like usual!
            event.preventDefault();

            // Set the URL manually
            const toUrl = event.target.getAttribute('href');
            window.history.pushState({}, '', toUrl);

            // Now that the URL is set, do the usual matching
            // and rendering!
            const matchedComponent = this.getRouteMatch();
            this.renderComponent(matchedComponent);
        }
    };

    disconnectedCallback() {
        window.removeEventListener('click', this.handleClicks);
    }
}
```

Конечно, обязательно снимайте эти обработчики событий в методе `disconnectedCallback`!

Пользователь видит изменение URL, плавный переход между страницами и даже новую запись в истории браузера при клике по ссылке. Теперь нам нужно убедиться, что когда кто-то нажимает кнопки «назад» или «вперёд», браузер не просто перемещается сам по себе, а вызывает обработку внутри нашего роутера.

!!!note ""

    В приведённом выше примере мы перехватываем все клики по тегам `<a>`, независимо от того, находятся ли они внутри компонента роутера или нет. Возможно, вам стоит обрабатывать клики только внутри этого компонента роутера, чтобы не брать ответственность за все ссылки на странице.

    Также обратите внимание, что мы даже не рассматривали обработку внешних ссылок. С этим нужно быть особенно осторожным, но данная тема выходит за рамки этого поста.

## Последняя деталь: навигация браузера

Когда пользователь перемещается назад или вперёд — программно (например, с помощью `window.back()`/`forward()`) или нажимая кнопки «назад»/«вперёд» в браузере — происходит событие: `popstate`.

Удобство этого события в том, что сам браузер уже обновляет URL в адресной строке, перемещаясь по истории, которую мы формировали с помощью вызова `window.pushState`. То есть нам нужно всего лишь слушать это событие и реагировать рендером нашего компонента. После нажатия «назад» или «вперёд» адрес уже актуален.

Вот финальный кусочек для нашего минимального маршрутизатора:

```js
class MyRouter extends HTMLElement {
    //...

    connectedCallback() {
        window.addEventListener('click', this.handleClicks);
        window.addEventListener('popstate', this.handlePopState);
    }

    handlePopState = (event) => {
        const matchedComponent = this.getRouteMatch();
        this.renderComponent(matchedComponent);
    };

    disconnectedCallback() {
        window.removeEventListener('click', this.handleClicks);
        window.removeEventListener('popstate', this.handlePopState);
    }
}
```

## Рабочий пример

Если вам интересно посмотреть, как это работает, вот пример, реализованный в StackBlitz.

<embed src="https://stackblitz.com/edit/vitejs-vite-vf79hwkk?embed=1&amp;file=src%2Frouter%2Frouter.ts"></embed>

Есть ещё чем заняться! Вот список вещей, которые я бы предложил изучить:

- Создание динамических сегментов, например `/posts/:id`. [Вот документация](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#fixed_text_and_capture_groups) по работе с динамическими параметрами.
- Обработка query-параметров через `search`.
- Поддержка вложенных или дочерних роутеров.

## Важные моменты...

Мы работаем на довольно низком уровне абстракции. Если делать свой собственный рендерер роутера таким образом, это может привести к XSS-уязвимостям, если оставить возможность пользователям вмешиваться в конфигурацию роутера. Например, если кто-то сможет напрямую задать массив конфигурации в компоненте роутера, он сможет зарегистрировать свой собственный веб-компонент из консоли браузера и перейти по маршруту к своему компоненту — таким образом, вы разрешите запуск чужого кода через ваш роутер!

Именно поэтому, как минимум в рассматриваемом здесь примере, конфигурация роутера хранится в приватной переменной внутри компонента роутера. Если бы это свойство было публичным, злоумышленник мог бы зарегистрировать свой компонент и заставить роутер его показать.

Как этого избежать? Я бы сказал: **никогда не рендерьте компонент только на основании query-параметров или динамических сегментов URL**. Все компоненты, которые реально могут быть отрисованы, должны храниться в статическом списке — скорее всего, в приватной переменной роутера.

Ещё один момент — а стоит ли вообще строить роутер на веб-компонентах? Возможно, и нет. В Lit считают, что [это может быть удобно](https://www.npmjs.com/package/@lit-labs/router). Но вам придётся самостоятельно решать многие нюансы, которые уже учтены во фреймворк-роутерах. Также веб-компоненты добавляют дополнительный уровень нюансов по безопасности и контролю.

Я думаю, что этот подход стоит исследовать и учиться на нём. Важно понимать нативные API, которые появляются и делают нашу жизнь удобнее, если мы полагаемся на средства самой платформы.

<small>Источник: <https://jschof.dev/posts/2025/11/build-your-own-router/></small>
