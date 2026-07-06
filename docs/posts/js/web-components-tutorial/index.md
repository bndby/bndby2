---
date: 2026-07-06
description: Подробный практический туториал по Web Components для начинающих: Custom Elements, Shadow DOM, атрибуты и свойства, lifecycle callbacks, кастомные события и сборка собственного dropdown-компонента.
tags:
    - js
    - webcomponents
    - custom-elements
categories:
    - JS
slug: web-components-tutorial
---

# Web Components для начинающих: подробный туториал

В этой статье разберем Web Components с нуля и реализуем два полноценных компонента: `my-button` и `my-dropdown`. По пути разберем, как работают `Custom Elements`, `Shadow DOM`, передача данных через атрибуты и свойства, lifecycle callbacks и кастомные события.

<!-- more -->

Веб-компоненты позволяют создавать переиспользуемые UI-элементы на чистых браузерных API, без привязки к React, Vue или Angular. Внутри одного кастомного HTML-тега можно инкапсулировать:

- структуру (`HTML`)
- стили (`CSS`)
- поведение (`JavaScript`)

Итоговая цель статьи — получить компонент, который можно использовать так:

```html
<my-dropdown
    label="Dropdown"
    option="option2"
    options='{ "option1": { "label": "Option 1" }, "option2": { "label": "Option 2" } }'
></my-dropdown>
```

А еще лучше — передавать сложные данные как свойства:

```html
<my-dropdown label="Dropdown" option="option2"></my-dropdown>

<script>
    document.querySelector('my-dropdown').options = {
        option1: { label: 'Option 1' },
        option2: { label: 'Option 2' },
    };
</script>
```

## Зачем вообще Web Components

Типичный сценарий: в компании несколько команд, у каждой свой стек (например, React и Angular), а UI-библиотека нужна общая. Если писать одни и те же компоненты в каждом фреймворке отдельно, реализации быстро расходятся по внешнему виду и поведению.

Web Components решают эту проблему: одна команда реализует универсальные элементы (`Dropdown`, `Button`, `Table`) на нативном веб-стеке, а остальные команды используют их в своих приложениях, независимо от фреймворка.

## Базовый Web Component: кнопка

Начнем с простого `my-button`, чтобы понять фундамент.

```js
const template = document.createElement('template');

template.innerHTML = `
  <style>
    .container {
      padding: 8px;
    }

    button {
      display: block;
      overflow: hidden;
      position: relative;
      padding: 0 16px;
      font-size: 16px;
      font-weight: bold;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      outline: none;

      width: 100%;
      height: 40px;

      box-sizing: border-box;
      border: 1px solid #a1a1a1;
      background: #ffffff;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 2px 8px 0 rgba(161, 161, 161, 0.4);
      color: #363636;
    }
  </style>

  <div class="container">
    <button>Label</button>
  </div>
`;

class Button extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

window.customElements.define('my-button', Button);
```

Что здесь важно:

- `class Button extends HTMLElement` — кастомный элемент всегда строится на `HTMLElement`.
- `attachShadow({ mode: 'open' })` — создаем `Shadow DOM` для инкапсуляции структуры и стилей.
- `template` — удобный способ хранить и переиспользовать разметку компонента.
- `customElements.define('my-button', Button)` — регистрируем новый HTML-тег. Имя обязательно должно содержать дефис.

Использование:

```html
<my-button></my-button>
```

## Передача атрибутов в Web Components

Пока кнопка всегда показывает `Label`. Добавим атрибут:

```html
<my-button label="Нажми меня"></my-button>
```

Чтобы компонент реагировал на изменение атрибута, используем `observedAttributes` и `attributeChangedCallback`:

```js
class Button extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$button = this._shadowRoot.querySelector('button');
    }

    static get observedAttributes() {
        return ['label'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        this.$button.innerHTML = this.label;
    }
}
```

Теперь добавим отражение атрибута в свойство:

```js
class Button extends HTMLElement {
    // ...

    get label() {
        return this.getAttribute('label');
    }

    set label(value) {
        this.setAttribute('label', value);
    }

    static get observedAttributes() {
        return ['label'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        this.$button.innerHTML = this.label;
    }
}
```

Теперь компонент можно обновлять и через HTML-атрибуты, и через JS-свойства:

```html
<my-button></my-button>

<script>
    const element = document.querySelector('my-button');
    element.label = 'Нажми меня';
</script>
```

## События: как отдавать информацию наружу

Добавим обработчик клика внутри компонента:

```js
class Button extends HTMLElement {
    constructor() {
        super();
        // ...

        this.$button.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('onClick', {
                    detail: 'Привет из Web Component',
                })
            );
        });
    }
}
```

Снаружи слушаем событие как обычный DOM event:

```html
<my-button label="Нажми меня"></my-button>

<script>
    document
        .querySelector('my-button')
        .addEventListener('onClick', (event) => console.log(event.detail));
</script>
```

Это делает API компонента удобным для интеграции и в обычный JS, и в фреймворки.

## Lifecycle callbacks в Web Components

Добавим `connectedCallback`, чтобы менять поведение кнопки в зависимости от контекста:

```js
class Button extends HTMLElement {
    constructor() {
        super();
        // ...

        this.$container = this._shadowRoot.querySelector('.container');
    }

    connectedCallback() {
        if (this.hasAttribute('as-atom')) {
            this.$container.style.padding = '0px';
        }
    }
}
```

`connectedCallback` вызывается, когда элемент добавлен в DOM. Аналогично, при удалении срабатывает `disconnectedCallback`.

## Вложенные Web Components: строим `my-dropdown`

Теперь используем `my-button` внутри нового компонента `my-dropdown`.

```js
const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      font-family: sans-serif;
    }

    .dropdown {
      padding: 3px 8px 8px;
    }

    .label {
      display: block;
      margin-bottom: 5px;
      color: #000000;
      font-size: 16px;
      line-height: 16px;
    }

    .dropdown-list-container {
      position: relative;
    }

    .dropdown-list {
      position: absolute;
      width: 100%;
      display: none;
      max-height: 192px;
      overflow-y: auto;
      margin: 4px 0 0;
      padding: 0;
      background-color: #ffffff;
      border: 1px solid #a1a1a1;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 2px 8px 0 rgba(161, 161, 161, 0.4);
      list-style: none;
    }

    .dropdown.open .dropdown-list {
      display: flex;
      flex-direction: column;
    }

    .dropdown-list li {
      display: flex;
      align-items: center;
      margin: 4px 0;
      padding: 0 7px;
      font-size: 16px;
      height: 40px;
      cursor: pointer;
    }

    .dropdown-list li.selected {
      font-weight: 600;
    }
  </style>

  <div class="dropdown">
    <span class="label">Label</span>
    <my-button as-atom>Content</my-button>
    <div class="dropdown-list-container">
      <ul class="dropdown-list"></ul>
    </div>
  </div>
`;

class Dropdown extends HTMLElement {
    constructor() {
        super();

        this._sR = this.attachShadow({ mode: 'open' });
        this._sR.appendChild(template.content.cloneNode(true));

        this.open = false;

        this.$label = this._sR.querySelector('.label');
        this.$button = this._sR.querySelector('my-button');
        this.$dropdown = this._sR.querySelector('.dropdown');
        this.$dropdownList = this._sR.querySelector('.dropdown-list');

        this.$button.addEventListener('onClick', this.toggleOpen.bind(this));
    }

    static get observedAttributes() {
        return ['label', 'option', 'options'];
    }

    get label() {
        return this.getAttribute('label');
    }

    set label(value) {
        this.setAttribute('label', value);
    }

    get option() {
        return this.getAttribute('option');
    }

    set option(value) {
        this.setAttribute('option', value);
    }

    get options() {
        return JSON.parse(this.getAttribute('options'));
    }

    set options(value) {
        this.setAttribute('options', JSON.stringify(value));
    }

    attributeChangedCallback() {
        this.render();
    }

    toggleOpen() {
        this.open = !this.open;

        this.open
            ? this.$dropdown.classList.add('open')
            : this.$dropdown.classList.remove('open');
    }

    render() {
        this.$label.innerHTML = this.label || '';

        if (this.options && this.options[this.option]) {
            this.$button.setAttribute('label', this.options[this.option].label);
        } else {
            this.$button.setAttribute('label', 'Select Option');
        }

        this.$dropdownList.innerHTML = '';

        Object.keys(this.options || {}).forEach((key) => {
            const option = this.options[key];
            const $option = document.createElement('li');
            $option.innerHTML = option.label;

            if (this.option && this.option === key) {
                $option.classList.add('selected');
            }

            $option.addEventListener('click', () => {
                this.option = key;
                this.toggleOpen();

                this.dispatchEvent(
                    new CustomEvent('onChange', {
                        detail: key,
                    })
                );

                this.render();
            });

            this.$dropdownList.appendChild($option);
        });
    }
}

window.customElements.define('my-dropdown', Dropdown);
```

Использование компонента:

```html
<my-dropdown label="Dropdown" option="option2"></my-dropdown>

<script>
    document.querySelector('my-dropdown').options = {
        option1: { label: 'Option 1' },
        option2: { label: 'Option 2' },
    };

    document
        .querySelector('my-dropdown')
        .addEventListener('onChange', (event) => {
            console.log('Выбран ключ:', event.detail);
        });
</script>
```

## На что обратить внимание в реальных проектах

- API компонента лучше делать через свойства для сложных структур (объекты/массивы) и через атрибуты для простых значений.
- Всегда продумывайте контракт событий (`onChange`, `onClick`) и что именно лежит в `detail`.
- Учитывайте, что в чистом Web Components много шаблонного кода (геттеры/сеттеры/рендеринг). Для сокращения бойлерплейта часто используют библиотеки поверх стандарта (например, Lit).

## Итоги

Вы собрали полностью инкапсулированные веб-компоненты с собственной структурой, стилями и поведением. Это и есть главное преимущество Web Components: переносимая UI-логика, независимая от конкретного фреймворка.

Если захотите продолжить, следующий шаг — добавить:

- клавиатурную навигацию и ARIA-атрибуты для доступности
- закрытие списка по клику вне компонента
- валидацию входных данных и защиту от некорректного `options`

---

Оригинальная статья: [Web Components Tutorial for Beginners \[2019\]](https://www.robinwieruch.de/web-components-tutorial/)
