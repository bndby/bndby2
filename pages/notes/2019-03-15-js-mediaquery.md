# Медиа запросы в Javascript

Синтаксис вызова:

	mql = window.matchMedia(mediaQueryString)

Возвращает новый объект `MediaQueryList`, представляющий результаты указанной строки медиа-запроса.

Свойства:

- `MediaQueryList.matches` — `true`, если документ удовлетворяет медиа-запросу
- `MediaQueryList.media` — строка с сериализированным медиа-запросом

События:

- `MediaQueryList.onchange` — функция-обработчик, вызываемая когда срабатывает медиа-запрос

Методы:

- `MediaQueryList.addListener()`
- `MediaQueryList.removeListener()`

## Пример 1

	if (window.matchMedia("(min-width: 400px)").matches) {
		/* вьюпорт больше 400px */
	} else {
		/* вьюпорт меньше 400px */
	}

## Пример 2

	var para = document.querySelector('p');
	var mql = window.matchMedia('(max-width: 600px)');
	function screenTest(e) {
		if (e.matches) {
			/* the viewport is 600 pixels wide or less */
			para.textContent = 'This is a narrow screen — less than 600px wide.';
			document.body.style.backgroundColor = 'red';
		} else {
			/* the viewport is more than than 600 pixels wide */
			para.textContent = 'This is a wide screen — more than 600px wide.';
			document.body.style.backgroundColor = 'blue';
		}
	}
	mql.addListener(screenTest);

## Пример 3

	// media query event handler
	if (matchMedia) {
		const mq = window.matchMedia('(min-width: 500px)');
		mq.addListener(WidthChange);
		WidthChange(mq);
	}
	// media query change
	function WidthChange(mq) {
		if (mq.matches) {
			// window width is at least 500px
		} else {
			// window width is less than 500px
		}
	}

## Поддержка браузерами

Десктопные версии браузеров:

- Chrome 9
- Edge +
- Firefox (Gecko) 6
- Internet Explorer 10
- Opera 12.1
- Safari 5.1

Мобильные версии браузеров:

- Android 3.0
- Edge +
- Firefox Mobile (Gecko) 6.0
- IE Mobile -
- Opera Mobile 12.1
- Safari Mobile 5

## Ссылки

- [CSS Object Model (CSSOM) View Module](https://drafts.csswg.org/cssom-view/#dom-window-matchmedia)
- [Window.matchMedia ()](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- [MediaQueryList](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList)
- [How to use Media Queries in JavaScript](https://www.sitepoint.com/javascript-media-queries/)