---
date: 2026-02-25
description: Практические советы по созданию устойчивых и надёжных React-компонентов, которые работают в разных средах и сценариях
tags:
    - js
    - react
categories:
    - React
slug: build-bulletproof-react-components
---

# Создание пуленепробиваемых React-компонентов

Большинство компонентов пишутся под «счастливый путь». В таком режиме они работают, но в продакшене быстро проявляются слабые места: серверный рендеринг, гидратация, несколько экземпляров, конкурентный рендеринг, асинхронные `children`, порталы и т.д. Компонент должен корректно работать во всех этих сценариях.

<!-- more -->

Критерий качества не в том, что компонент работает на вашей странице сейчас. Критерий — предсказуемое поведение в чужом окружении и при конфигурациях, которые вы заранее не планировали. Именно там обычно и возникают регрессии.

Ниже — практические приёмы, которые повышают устойчивость компонента.

## Сделайте его устойчивым к серверу

Простой провайдер темы, который читает предпочтения пользователя из `localStorage`:

```js title="Падает в SSR — читает тему из localStorage"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light',
    );

    return <div className={theme}>{children}</div>;
}
```

Но на сервере `localStorage` не существует. В Next.js, Remix или любом другом SSR-фреймворке это ломает сборку. Перенесите обращения к браузерным API в `useEffect`:

```js title="useEffect откладывает работу с localStorage только до клиентской стороны"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        setTheme(localStorage.getItem('theme') || 'light');
    }, []);

    return <div className={theme}>{children}</div>;
}
```

Теперь компонент рендерится на сервере без падения.

## Сделайте его устойчивым к гидратации

Серверобезопасная версия уже работает, но остаётся UX-дефект: видна вспышка неверной темы. Сервер рендерит светлую тему, клиент гидратируется, затем срабатывает эффект и переключает на тёмную:

```js title="Вспышка неверной темы — useEffect запускается после гидратации"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        setTheme(localStorage.getItem('theme') || 'light');
    }, []);

    return <div className={theme}>{children}</div>;
}
```

Вставьте синхронный скрипт, который задаёт корректное значение до того, как браузер отрисует страницу и React начнёт гидратацию. Тогда в DOM уже будет правильный класс в момент, когда React «перехватит управление»:

```js title="Inline-скрипт задаёт тему до отрисовки браузером" hl_lines="5-14"
function ThemeProvider({ children }) {
    return (
        <>
            <div id="theme">{children}</div>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
        try {
          const theme = localStorage.getItem('theme') || 'light'
          document.getElementById('theme').className = theme
        } catch (e) {}
      `,
                }}
            />
        </>
    );
}
```

Итог: нет ни рассинхронизации, ни визуальной вспышки.

## Сделайте его устойчивым к нескольким экземплярам

Версия, устойчивая к гидратации, использует захардкоженный `id="theme"`. Но что, если кто-то использует два `ThemeProvider`?

```js title="Несколько экземпляров — оба скрипта нацелены на один и тот же ID"
function App() {
    return (
        <>
            <ThemeProvider>
                <MainContent />
            </ThemeProvider>
            <AlwaysLightThemeContent />
            <ThemeProvider>
                <Sidebar />
            </ThemeProvider>
        </>
    );
}
```

Оба скрипта будут работать с одним и тем же элементом, что приводит к гонке. Используйте [`useId`](https://reactdev.ru/reference/react/useId/) для стабильного уникального ID на каждый экземпляр:

```js title="useId генерирует уникальные ID для каждого экземпляра"
function ThemeProvider({ children }) {
    const id = useId();
    return (
        <>
            <div id={id}>{children}</div>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
        try {
          const theme = localStorage.getItem('theme') || 'light'
          document.getElementById('${id}').className = theme
        } catch (e) {}
      `,
                }}
            />
        </>
    );
}
```

Итог: несколько экземпляров работают независимо и без конфликтов.

## Сделайте его устойчивым к конкурентному рендерингу

Теперь сделаем тему управляемой сервером. [Серверный компонент](https://reactdev.ru/reference/rsc/server-components/), который получает пользовательские настройки:

```js title="Серверный компонент получает настройки из базы данных" hl_lines="2"
async function ThemeProvider({ children }) {
    const prefs = await db.preferences.get(userId);

    return <div className={prefs.theme}>{children}</div>;
}
```

Если отрендерить компонент в двух местах, вы можете получить два одинаковых запроса в БД. Оберните запрос в [`React.cache`](https://reactdev.ru/reference/react/cache/), чтобы дедуплицировать вызовы в рамках одного серверного запроса:

```js title="React cache() дедуплицирует конкурентные вызовы" hl_lines="3"
import { cache } from 'react';

const getPreferences = cache((userId) => db.preferences.get(userId));

async function ThemeProvider({ children }) {
    const prefs = await getPreferences(userId);

    return <div className={prefs.theme}>{children}</div>;
}
```

Итог: одинаковый запрос, откуда бы он ни вызывался, обращается к базе один раз.

## Сделайте его устойчивым к композиции

Иногда нужно передавать данные детям через пропсы, и традиционно для этого использовали `React.cloneElement`:

```js title="Передаёт тему в children через cloneElement"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    return React.Children.map(children, (child) => {
        return React.cloneElement(child, { theme });
    });
}
```

Но в React Server Components, при [`React.lazy`](https://reactdev.ru/reference/react/lazy/) или `"use cache"`, `children` могут быть `Promise` или [непрозрачной ссылкой](https://react.dev/reference/react/Children#why-is-the-children-prop-not-always-an-array) — `cloneElement` не сработает. Вместо этого используйте контекст:

```js title="Контекст работает везде — сервер, клиент, async" hl_lines="7"
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    );
}
```

`Children` получают тему через `useContext` — без проброса пропсов и без `cloneElement`.

## Сделайте его устойчивым к порталам

Провайдер темы с клавиатурным шорткатом — ++cmd+d++ для переключения тёмной темы:

```js title="Глобальный шорткат для переключения темы"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const toggle = (e) => {
            if (e.metaKey && e.key === 'd') {
                e.preventDefault();
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
            }
        };
        window.addEventListener('keydown', toggle);
        return () => window.removeEventListener('keydown', toggle);
    }, []);

    return <div className={theme}>{children}</div>;
}
```

Но если кто-то рендерит приложение во всплывающем окне, `iframe` или через [`createPortal`](https://reactdev.ru/reference/react-dom/createPortal/), шорткат перестанет работать. Слушатель привязан к родительскому `window`, а не к тому, где живёт компонент. Используйте `ownerDocument.defaultView`:

```js title="ownerDocument.defaultView находит правильный window" hl_lines="6"
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const ref = useRef(null);

    useEffect(() => {
        const win = ref.current?.ownerDocument.defaultView || window;
        const toggle = (e) => {
            if (e.metaKey && e.key === 'd') {
                e.preventDefault();
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
            }
        };
        win.addEventListener('keydown', toggle);
        return () => win.removeEventListener('keydown', toggle);
    }, []);

    return (
        <div ref={ref} className={theme}>
            {children}
        </div>
    );
}
```

Итог: шорткат работает в любом оконном контексте.

## Сделайте его устойчивым к переходам

Панель настроек, которая переключается между простым и расширенным режимами:

```js title="Простое переключение состояния между двумя панелями"
function ThemeSettings() {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <>
            {showAdvanced ? <AdvancedPanel /> : <SimplePanel />}
            <button onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
        </>
    );
}
```

Если обернуть это в `<ViewTransition>` из React 19, анимация не запустится — панели просто мгновенно сменятся. Обновление состояния должно выполняться через `startTransition`:

```js title="startTransition включает анимацию перехода представления" hl_lines="9"
function ThemeSettings() {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <>
            {showAdvanced ? <AdvancedPanel /> : <SimplePanel />}
            <button
                onClick={() =>
                    startTransition(() => setShowAdvanced(!showAdvanced))
                }
            >
                {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
        </>
    );
}
```

Итог: переход анимируется плавно.

## Сделайте его устойчивым к Activity

Тематический компонент, который внедряет CSS-переменные через тег [`<style>`](https://hcdev.ru/html/style/):

```js title="Внедряет глобальные CSS-переменные через тег style"
function DarkTheme({ children }) {
    return (
        <>
            <style>{`
        :root {
          --bg: #000;
          --fg: #fff;
        }
      `}</style>
            {children}
        </>
    );
}
```

Если обернуть компонент в `<Activity>`, тёмная тема будет сохраняться даже в скрытом состоянии. Причина: `<Activity>` сохраняет DOM, а `<style>` создаёт глобальный побочный эффект (меняет переменные `:root`). React не очищает такие эффекты автоматически. Установите `media="not all"`, чтобы отключать эти стили в скрытом состоянии:

```js title="useLayoutEffect устанавливает media='not all' при скрытии и возвращает обратно при показе" hl_lines="4-8"
function DarkTheme({ children }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (!ref.current) return;
        ref.current.media = 'all';
        return () => (ref.current.media = 'not all');
    }, []);

    return (
        <>
            <style ref={ref}>{`
        :root {
          --bg: #000;
          --fg: #fff;
        }
      `}</style>
            {children}
        </>
    );
}
```

Итог: к скрытым компонентам тёмная тема больше не применяется.

## Сделайте его устойчивым к утечкам

Серверный компонент передаёт объект `user` (включая токен сессии) в другой компонент темы. Это валидный кейс — данные нужны на сервере. Вы можете знать, что `UserThemeConfig` — серверный компонент, и что передавать туда эти данные безопасно.

```js title="Dashboard передаёт user (с токеном) в другой компонент"
async function Dashboard() {
    const user = await getUser();

    return <UserThemeConfig user={user} />;
}
```

Однако вы не знаете точного поведения `UserThemeConfig`: что он рендерит сейчас и как может измениться в будущем. Этот компонент не находится под вашим контролем.

Кроме того, поскольку `UserThemeConfig` не создаёт `user`, компонент может не знать, что у `user` есть чувствительное поле `token`. Вы не контролируете этот компонент, поэтому нельзя предполагать, что он нигде в своём дереве не передаст токен в клиентский компонент. Тогда токен будет сериализован и отправлен на клиент. Используйте экспериментальный API React [`taintUniqueValue`](https://reactdev.ru/reference/react/experimental_taintUniqueValue/), чтобы пометить токен как доступный только на сервере. Если это значение попадёт в клиентский компонент, React выбросит ошибку. Чтобы заблокировать целый объект, а не отдельное значение, используйте [`taintObjectReference`](https://reactdev.ru/reference/react/experimental_taintObjectReference/).

```js title="taintUniqueValue блокирует отправку user.token на клиент" hl_lines="6-10"
import { experimental_taintUniqueValue } from 'react';

async function Dashboard() {
    const user = await getUser();

    experimental_taintUniqueValue(
        'Do not pass the user token to the client.',
        user,
        user.token,
    );

    return <UserThemeConfig user={user} />;
}
```

Если код этого компонента (или будущий рефакторинг в команде) попытается передать `user.token` в клиентский компонент, React выбросит ошибку с вашим сообщением. Рабочий сценарий сохраняется, а токен не утекает.

## Сделайте его устойчивым к будущим изменениям\*

_Это принцип проектирования: пишите защитный код там, где это оправдано. Не применяйте его механически везде._

Тема, которая генерирует случайные акцентные цвета при монтировании:

```js title="useMemo кеширует сгенерированные цвета"
function ThemeProvider({ baseTheme, children }) {
    const colors = useMemo(() => getRandomColors(baseTheme), [baseTheme]);

    return <div style={colors}>{children}</div>;
}
```

Но `useMemo` — это [подсказка для производительности, а не семантическая гарантия](https://reactdev.ru/reference/react/useMemo/). React сбрасывает кешированные значения во время HMR и оставляет за собой право делать это для offscreen-компонентов или возможностей, которых ещё не существует. Если React сбросит кеш, тема начнёт мигать разными цветами. Используйте состояние, когда корректность зависит от стабильного хранения значения:

```js title="useState даёт семантическую гарантию сохранения"
function ThemeProvider({ baseTheme, children }) {
    const [colors, setColors] = useState(() => generateAccentColors(baseTheme));
    const [prevTheme, setPrevTheme] = useState(baseTheme);

    if (baseTheme !== prevTheme) {
        setPrevTheme(baseTheme);
        setColors(generateAccentColors(baseTheme));
    }

    return <div style={colors}>{children}</div>;
}
```

Теперь цвета остаются стабильными независимо от внутренних оптимизаций React.

Это уже не «редкие кейсы», а типовые условия современной React-разработки. Если компонент ломается в них, проблема обычно не в случайности, а в неверных инженерных допущениях. Цель — проектировать компоненты под текущие и будущие сценарии выполнения.

<small>Источник: <https://shud.in/thoughts/build-bulletproof-react-components></small>
