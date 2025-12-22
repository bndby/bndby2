---
date: 2025-12-22
description: Протокол RSC — это формат, в котором React-деревья (и расширенный вариант JSON) сериализуются и десериализуются React. React предоставляет инструменты записи и чтения для протокола RSC, которые версионируются и развиваются синхронно друг с другом
tags:
    - js
    - react
    - rsc
categories:
    - React
slug: introducing-rsc-explorer
---

# Представляем RSC Explorer

*Автор: Dan Abramov*

За последние несколько недель, с момента раскрытия [критической уязвимости безопасности в React Server Components (RSC)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), наблюдается большой интерес к протоколу RSC.

Протокол RSC — это формат, в котором React-деревья (и [расширенный вариант JSON](https://github.com/facebook/react/issues/25687)) сериализуются и десериализуются React. React предоставляет инструментарий чтения и записи для протокола RSC, которые версионируются и развиваются синхронно друг с другом.

<!-- more -->

Поскольку протокол RSC является *деталью реализации* React, он явно не документирован за пределами исходного кода. Преимущество такого подхода в том, что у React есть большая свобода для улучшения формата и добавления новых функций и оптимизаций.

Однако недостаток в том, что даже люди, активно создающие приложения с React Server Components, часто не имеют интуитивного понимания того, как это работает под капотом.

Несколько месяцев назад я написал [Progressive JSON](https://overreacted.io/progressive-json/), чтобы объяснить некоторые идеи, используемые протоколом RSC. Хотя вам не «нужно» их знать для использования RSC, я думаю, это один из тех случаев, когда заглянуть под капот действительно интересно и поучительно.

Мне бы хотелось, чтобы обстоятельства возросшего интереса сейчас были другими, но в любом случае **этот интерес вдохновил меня создать новый небольшой инструмент**, чтобы показать, как это работает.

Я называю его **RSC Explorer**, и вы можете найти его по адресу <https://rscexplorer.dev/>.

Разумеется, он [с открытым исходным кодом](https://github.com/gaearon/rscexplorer).

## Hello World

«Показывай, а не рассказывай», как говорится. Ну вот он, встроенный пример.

Давайте начнём с Hello World:

<iframe style="width:100%;height:500px;border:1px solid #eee;border-radius:8px" src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiA8aDE+SGVsbG8gV29ybGQ8L2gxPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50JyJ9"></iframe>

Обратите внимание на жёлтую выделенную строку, которая содержит что-то загадочное. Если присмотреться, это `<h1>Hello</h1>`, представленный в виде фрагмента JSON. Эта строка — часть RSC-потока с сервера. **Так React общается сам с собой по сети.**

**Теперь нажмите большую жёлтую кнопку «step»!**

Обратите внимание, что `<h1>Hello</h1>` теперь появился справа. Это JSX, который *клиент* восстанавливает после чтения этой строки. Мы только что увидели, как простой фрагмент JSX — тег `<h1>Hello</h1>` — пересёк сеть и был воссоздан на другой стороне.

Ну, не *совсем* «пересёк сеть».

Одна классная особенность RSC Explorer в том, что это одностраничное приложение, то есть **оно полностью работает в вашем браузере** (точнее, серверная часть работает в воркере). Поэтому, если вы проверите вкладку Network, вы не увидите никаких запросов. Так что в некотором смысле это симуляция.

Тем не менее, RSC Explorer построен с использованием тех же самых пакетов, которые React предоставляет для чтения и записи протокола RSC, поэтому каждая строка вывода реальна.

## Асинхронный компонент

Давайте попробуем что-то немного более интересное, чтобы увидеть *стриминг* в действии.

Возьмите этот пример и нажмите большую жёлтую кнопку «step» **ровно два раза**:

<iframe style="width:100%;height:800px;border:1px solid #eee;border-radius:8px" src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBTdXNwZW5zZSB9IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxoMT5Bc3luYyBDb21wb25lbnQ8L2gxPlxuICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8cD5Mb2FkaW5nLi4uPC9wPn0%2BXG4gICAgICAgIDxTbG93Q29tcG9uZW50IC8%2BXG4gICAgICA8L1N1c3BlbnNlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIFNsb3dDb21wb25lbnQoKSB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDApKVxuICByZXR1cm4gPHA%2BRGF0YSBsb2FkZWQhPC9wPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50JyJ9"></iframe>

(Если вы сбились со счёта, нажмите «restart» слева, а затем «step» два раза снова.)

Посмотрите на верхнюю правую панель. Вы видите три чанка в формате протокола RSC (который, опять же, вам технически не нужно читать — и который меняется между версиями). Справа вы видите, что клиентский React восстановил *на данный момент*.

**Обратите внимание на «дыру» в середине переданного дерева, визуализированную как пилюля «Pending».**

По умолчанию React не показывал бы несогласованный UI с «дырами». Однако, поскольку вы объявили состояние загрузки с помощью `<Suspense>`, частично завершённый UI теперь может быть отображён (заметьте, что `<h1>` уже виден, но `<Suspense>` показывает fallback-контент, потому что `<SlowComponent />` ещё не был передан).

Нажмите кнопку «step» ещё раз, и «дыра» будет заполнена.

## Счётчик

До сих пор мы отправляли только *данные* клиенту; теперь давайте также отправим немного *кода*.

Давайте используем счётчик как классический пример.

Нажмите большую жёлтую кнопку «step» дважды:

<iframe style="width:100%;height:800px;border:1px solid #eee;border-radius:8px" src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBDb3VudGVyIH0gZnJvbSAnLi9jbGllbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGgxPkNvdW50ZXI8L2gxPlxuICAgICAgPENvdW50ZXIgaW5pdGlhbENvdW50PXswfSAvPlxuICAgIDwvZGl2PlxuICApXG59IiwiY2xpZW50IjoiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmV4cG9ydCBmdW5jdGlvbiBDb3VudGVyKHsgaW5pdGlhbENvdW50IH0pIHtcbiAgY29uc3QgW2NvdW50LCBzZXRDb3VudF0gPSB1c2VTdGF0ZShpbml0aWFsQ291bnQpXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPHA%2BQ291bnQ6IHtjb3VudH08L3A%2BXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0%2BIHNldENvdW50KGMgPT4gYyAtIDEpfT7iiJI8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRDb3VudChjID0%2BIGMgKyAxKX0%2BKzwvYnV0dG9uPlxuICAgICAgPC9kaXY%2BXG4gICAgPC9kaXY%2BXG4gIClcbn0ifQ%3D%3D"></iframe>

Это просто старый добрый счётчик, ничего особо интересного.

Или есть?

Посмотрите на полезную нагрузку протокола. Её немного сложно читать, но обратите внимание, что мы не отправляем строку `"Count: 0"` или `<button>`-ы, или какой-либо HTML. Мы отправляем **сам `<Counter initialCount={0} />` — «виртуальный DOM»**. Конечно, его можно потом превратить в HTML, как и любой JSX, но это не обязательно.

Это как будто мы возвращаем React-деревья из API-маршрутов.

Обратите внимание, как ссылка на `Counter` становится `["client",[],"Counter"]` в протоколе RSC, что означает «возьми экспорт `Counter` из модуля `client`». В реальном фреймворке это делается бандлером, поэтому RSC интегрируется с бандлерами. Если вы знакомы с webpack, это похоже на чтение из кеша require webpack. (На самом деле, [именно так](https://github.com/gaearon/rscexplorer/blob/58cee712d9223675d2c0e2c5b828b499150c2269/src/shared/webpack-shim.ts) RSC Explorer это и реализует.)

## Form Action

Мы только что видели, как сервер *ссылается* на фрагмент кода, предоставленный клиентом.

Теперь давайте посмотрим, как клиент *ссылается* на фрагмент кода, предоставленный сервером.

Здесь `greet` — это *Server Action*, доступный через `'use server'` как эндпоинт. Он передаётся как проп клиентскому компоненту `Form`, который видит его как `async` функцию.

Нажмите большую жёлтую кнопку «step» три раза:

<iframe style="width:100%;height:900px;border:1px solid #eee;border-radius:8px" src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBGb3JtIH0gZnJvbSAnLi9jbGllbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGgxPkZvcm0gQWN0aW9uPC9oMT5cbiAgICAgIDxGb3JtIGdyZWV0QWN0aW9uPXtncmVldH0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiBncmVldChwcmV2U3RhdGUsIGZvcm1EYXRhKSB7XG4gICd1c2Ugc2VydmVyJ1xuICBhd2FpdCBuZXcgUHJvbWlzZShyID0%2BIHNldFRpbWVvdXQociwgNTAwKSlcbiAgY29uc3QgbmFtZSA9IGZvcm1EYXRhLmdldCgnbmFtZScpXG4gIGlmICghbmFtZSkgcmV0dXJuIHsgbWVzc2FnZTogbnVsbCwgZXJyb3I6ICdQbGVhc2UgZW50ZXIgYSBuYW1lJyB9XG4gIHJldHVybiB7IG1lc3NhZ2U6IGBIZWxsbywgJHtuYW1lfSFgLCBlcnJvcjogbnVsbCB9XG59IiwiY2xpZW50IjoiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IHVzZUFjdGlvblN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtKHsgZ3JlZXRBY3Rpb24gfSkge1xuICBjb25zdCBbc3RhdGUsIGZvcm1BY3Rpb24sIGlzUGVuZGluZ10gPSB1c2VBY3Rpb25TdGF0ZShncmVldEFjdGlvbiwge1xuICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgZXJyb3I6IG51bGxcbiAgfSlcblxuICByZXR1cm4gKFxuICAgIDxmb3JtIGFjdGlvbj17Zm9ybUFjdGlvbn0%2BXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICBuYW1lPVwibmFtZVwiXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciB5b3VyIG5hbWVcIlxuICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTJweCcsIGJvcmRlclJhZGl1czogNCwgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnIH19XG4gICAgICAgIC8%2BXG4gICAgICAgIDxidXR0b24gZGlzYWJsZWQ9e2lzUGVuZGluZ30%2BXG4gICAgICAgICAge2lzUGVuZGluZyA%2FICdTZW5kaW5nLi4uJyA6ICdHcmVldCd9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY%2BXG4gICAgICB7c3RhdGUuZXJyb3IgJiYgPHAgc3R5bGU9e3sgY29sb3I6ICdyZWQnLCBtYXJnaW5Ub3A6IDggfX0%2Be3N0YXRlLmVycm9yfTwvcD59XG4gICAgICB7c3RhdGUubWVzc2FnZSAmJiA8cCBzdHlsZT17eyBjb2xvcjogJ2dyZWVuJywgbWFyZ2luVG9wOiA4IH19PntzdGF0ZS5tZXNzYWdlfTwvcD59XG4gICAgPC9mb3JtPlxuICApXG59In0%3D"></iframe>

Теперь введите своё имя в панели Preview и нажмите «Greet». Отладчик RSC Explorer «приостановится» снова, показывая, что мы обратились к Server Action `greet` с запросом. Нажмите жёлтую кнопку «step», чтобы увидеть ответ, возвращённый клиенту.

## Router Refresh

RSC часто преподаётся вместе с фреймворком, но это скрывает то, что происходит. Например, как фреймворк обновляет серверный контент? Как работает роутер?

RSC Explorer показывает **RSC без фреймворка**. Здесь нет `router.refresh` — но вы можете реализовать свой собственный Server Action `refresh` и компонент `Router`.

Нажимайте кнопку «step» повторно, чтобы получить весь начальный UI на экране:

<iframe style="width:100%;height:800px;border:1px solid #eee;border-radius:8px" src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBTdXNwZW5zZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgVGltZXIsIFJvdXRlciB9IGZyb20gJy4vY2xpZW50J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxoMT5Sb3V0ZXIgUmVmcmVzaDwvaDE%2BXG4gICAgICA8cCBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDEyLCBjb2xvcjogJyM2NjYnIH19PlxuICAgICAgICBDbGllbnQgc3RhdGUgcGVyc2lzdHMgYWNyb3NzIHNlcnZlciBuYXZpZ2F0aW9uc1xuICAgICAgPC9wPlxuICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8cD5Mb2FkaW5nLi4uPC9wPn0%2BXG4gICAgICAgIDxSb3V0ZXIgaW5pdGlhbD17cmVuZGVyUGFnZSgpfSByZWZyZXNoQWN0aW9uPXtyZW5kZXJQYWdlfSAvPlxuICAgICAgPC9TdXNwZW5zZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiByZW5kZXJQYWdlKCkge1xuICAndXNlIHNlcnZlcidcbiAgcmV0dXJuIDxDb2xvclRpbWVyIC8%2BXG59XG5cbmFzeW5jIGZ1bmN0aW9uIENvbG9yVGltZXIoKSB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAzMDApKVxuICBjb25zdCBodWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApXG4gIHJldHVybiA8VGltZXIgY29sb3I9e2Boc2woJHtodWV9LCA3MCUsIDg1JSlgfSAvPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VUcmFuc2l0aW9uLCB1c2UgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRpbWVyKHsgY29sb3IgfSkge1xuICBjb25zdCBbc2Vjb25kcywgc2V0U2Vjb25kc10gPSB1c2VTdGF0ZSgwKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRTZWNvbmRzKHMgPT4gcyArIDEpLCAxMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGlkKVxuICB9LCBbXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgcGFkZGluZzogMjQsXG4gICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gICAgfX0%2BXG4gICAgICA8cCBzdHlsZT17eyBmb250RmFtaWx5OiAnbW9ub3NwYWNlJywgZm9udFNpemU6IDMyLCBtYXJnaW46IDAgfX0%2BVGltZXI6IHtzZWNvbmRzfXM8L3A%2BXG4gICAgPC9kaXY%2BXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlcih7IGluaXRpYWwsIHJlZnJlc2hBY3Rpb24gfSkge1xuICBjb25zdCBbY29udGVudFByb21pc2UsIHNldENvbnRlbnRQcm9taXNlXSA9IHVzZVN0YXRlKGluaXRpYWwpXG4gIGNvbnN0IFtpc1BlbmRpbmcsIHN0YXJ0VHJhbnNpdGlvbl0gPSB1c2VUcmFuc2l0aW9uKClcbiAgY29uc3QgY29udGVudCA9IHVzZShjb250ZW50UHJvbWlzZSlcblxuICBjb25zdCByZWZyZXNoID0gKCkgPT4ge1xuICAgIHN0YXJ0VHJhbnNpdGlvbigoKSA9PiB7XG4gICAgICBzZXRDb250ZW50UHJvbWlzZShyZWZyZXNoQWN0aW9uKCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17eyBvcGFjaXR5OiBpc1BlbmRpbmcgPyAwLjcgOiAxIH19PlxuICAgICAge2NvbnRlbnR9XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9e3JlZnJlc2h9IGRpc2FibGVkPXtpc1BlbmRpbmd9IHN0eWxlPXt7IG1hcmdpblRvcDogMTIgfX0%2BXG4gICAgICAgIHtpc1BlbmRpbmcgPyAnUmVmZXRjaGluZy4uLicgOiAnUmVmZXRjaCd9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufSJ9"></iframe>

Посмотрите на тикающий таймер. Обратите внимание, как серверный компонент `ColorTimer` передал случайный цвет клиентскому компоненту `Timer`. Опять же, сервер *вернул* `<Timer color="hsl(96, 70%, 85%)" />` (или что-то подобное).

**Теперь нажмите кнопку Refetch прямо под таймером.**

Не вникая в код, «пошагово» пройдите через ответ сервера и посмотрите, что происходит. Вы должны увидеть постоянно тикающий `Timer`, *получающий новые пропсы с сервера*. **Его фоновый цвет изменится, но его состояние сохранится!**

В некотором смысле это похоже на повторную загрузку HTML с использованием чего-то вроде [htmx](https://htmx.org/), за исключением того, что это обычное React-обновление «виртуального DOM», поэтому оно не уничтожает состояние. Он просто получает новые пропсы… с сервера. Нажмите «Refetch» несколько раз и пошагово пройдите через это.

Если вы хотите посмотреть, как это работает под капотом, прокрутите вниз обе части — Server и Client. Вкратце, клиентский `Router` хранит Promise на серверный JSX, который возвращается `renderPage()`. Изначально `renderPage()` вызывается на сервере (для первого рендеринга), а позже вызывается с клиента (для обновлений).

Эта техника, в сочетании с сопоставлением URL и вложенностью, — это примерно то, как RSC-фреймворки обрабатывают маршрутизацию. Я думаю, это довольно крутой пример!

## Что ещё?

Я сделал ещё несколько примеров для любопытных:

- [Пагинация](https://rscexplorer.dev/?s=pagination)
- [Обработка ошибок](https://rscexplorer.dev/?s=errors)
- [Client Reference](https://rscexplorer.dev/?s=clientref)
- [Bound Actions](https://rscexplorer.dev/?s=bound)
- [Kitchen Sink](https://rscexplorer.dev/?s=kitchensink)

И, конечно, печально известный:

- [CVE-2025-55182](https://rscexplorer.dev/?s=cve)

(Как и следовало ожидать, этот пример работает только на уязвимых версиях, поэтому вам нужно выбрать 19.2.0 в правом верхнем углу, чтобы он действительно заработал.)

Я бы хотел увидеть больше классных примеров RSC, созданных сообществом.

RSC Explorer позволяет встраивать фрагменты кода на другие страницы (как я сделал в этом посте) и создавать ссылки для обмена, если сам код не превышает лимит URL. Инструмент полностью клиентский, и я намерен сохранить его таким для простоты.

Вы можете свободно просматривать его исходный код на [Tangled](https://tangled.org/danabra.mov/rscexplorer) или [GitHub](https://github.com/gaearon/rscexplorer). Это хобби-проект, поэтому я ничего конкретного не обещаю, но надеюсь, что он полезен.

Спасибо, что заглянули!

<small>Источник: <https://overreacted.io/introducing-rsc-explorer/></small>
