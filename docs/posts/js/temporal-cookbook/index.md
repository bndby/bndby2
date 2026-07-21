---
date: 2026-07-21
description: 'Практическая книга рецептов по JavaScript Temporal: даты, время, часовые пояса, календари и типовые операции с примерами кода.'
tags:
    - js
    - temporal
categories:
    - JS
slug: temporal-cookbook
---

# `Temporal` Книга рецептов

Практическая книга рецептов по JavaScript Temporal: даты, время, часовые пояса, календари и типовые операции с примерами кода.

<!-- more -->

## Обзор

`Temporal` — современный API JavaScript для работы с датами, временем, часовыми поясами и календарями. Он помогает безопасно выполнять вычисления и преобразования, избегая неоднозначностей и ошибок старого объекта `Date`.

## Часто задаваемые вопросы

Это некоторые из наиболее распространенных задач, о которых люди задают вопросы в StackOverflow с устаревшим `Date`. Вот как они будут выглядеть при использовании `Temporal`.

### Текущая дата и время

Как получить текущую дату и время в местном часовом поясе?

```javascript
/**
 * Получите текущую дату в JavaScript.
 * Это популярный вопрос о переполнении стека для дат в JS.
 * https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
 *
 */

const date = Temporal.Now.plainDateISO(); //Получает текущую дату
date.toString(); //возвращает дату в формате даты ISO 8601

// Если вам дополнительно нужно время:
Temporal.Now.plainDateTimeISO().toString(); //дата и время в формате ISO 8601
```

Обратите внимание: если вам нужна только дата, а не время, вам следует использовать `Temporal.PlainDate`. Если вам нужно и то, и другое, используйте `Temporal.PlainDateTime`.

### Временная метка Unix

Как получить временную метку Unix?

```javascript
/**
 * Получите временную метку (Unix) в JavaScript.
 * Это вопрос номер один по количеству голосов в Stack Overflow для дат в JS.
 * https://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
 *
 */

const timeStamp = Temporal.Now.instant();

// Временная метка в миллисекундах
timeStamp.epochMilliseconds;

// Временная метка в секундах
Math.floor(timeStamp.epochMilliseconds / 1000);
```

## Преобразование между типами `Temporal` и устаревшим `Date`

### Устаревший `Date` => `Temporal.Instant` и/или `Temporal.ZonedDateTime`

Вот как можно преобразовать устаревший ECMAScript `Date` в экземпляр `Temporal.Instant` или `Temporal.ZonedDateTime`, соответствующий тому же моменту в точное время.

```javascript
const legacyDate = new Date('1970-01-01T00:00:01Z');
const instant = legacyDate.toTemporalInstant();

assert.equal(instant.epochMilliseconds, legacyDate.getTime());
assert.equal(instant.toString(), '1970-01-01T00:00:01Z');

// Если вам нужен ZonedDateTime, используйте toZonedDateTimeISO().
// метод результирующего Instant.
// Вам нужно будет указать часовой пояс, потому что только устаревший Date.
// хранит точное время и не сохраняет часовой пояс.

// При вызове методов в устаревшем экземпляре Date вы должны решить:
// хотите ли вы, чтобы это точное время интерпретировалось как значение UTC
// (используя методы, содержащие «UTC» в своем имени) или в
// текущий часовой пояс системы (другими методами). Это
// сбивает с толку, поэтому у Temporal есть более явный способ сделать это.

// Чтобы использовать местный часовой пояс системы, который соответствует использованию
// устаревшие методы getFullYear(), getMonth() и т. д. Date, передайте
// Temporal.Now.timeZoneId() в качестве часового пояса. В браузере это
// будет часовой пояс пользователя, но на сервере значение может отличаться
// быть тем, что вы ожидаете, поэтому избегайте делать это в контексте сервера.

const zoned = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());

assert.equal(zoned.epochMilliseconds, legacyDate.getTime());

// Вот пример использования определенного часового пояса. Особенно
// в контексте сервера вы получите этот часовой пояс от
// в другом месте данных, которые вы обрабатываете.

const zoned2 = instant.toZonedDateTimeISO('Asia/Shanghai');

assert.equal(zoned2.epochMilliseconds, legacyDate.getTime());
assert.equal(zoned2.timeZoneId, 'Asia/Shanghai');

// (И если доступ к устаревшему экземпляру Date осуществлялся с помощью
// getUTCFullYear(), getUTCMonth() и т. д., рассмотрим только
// используя Instant. Если вам нужно использовать ZonedDateTime, конкретный
// часовой пояс может быть «UTC».)
```

### Значения только для Date: устаревший `Date` => `Temporal.PlainDate`

Распространенная ошибка возникает из-за простого вопроса: какая дата (год, месяц и день) представлена ​​этим `Date`? Проблема: ответ зависит от часового пояса. Тот же `Date` может быть 31 декабря в Сан-Франциско, но 1 января в Лондоне или Токио.

Поэтому очень важно интерпретировать `Date` в контексте правильного часового пояса _прежде_ пытаться извлечь год, месяц или день или перед выполнением вычислений типа «это произошло вчера?» с участием единиц даты. По этой причине `Temporal.Instant` (который является эквивалентом `Temporal` `Date`) не имеет свойств `year`, `month`, `day`. Чтобы получить доступ к единицам даты или времени в `Temporal`, необходимо указать часовой пояс, как описано в примере кода выше.

Другой случай, подверженный ошибкам, — это когда `Date` (ab) используется для хранения значения только даты, например даты рождения пользователя. В `Date` эти значения обычно сохраняются с указанием времени полуночи, но для правильного считывания даты необходимо знать, полночь какого часового пояса использовалась для создания `Date`. Например, `new Date(2000, 0, 1)` использует часовой пояс вызывающего абонента, а `new Date('2000-01-01')` использует UTC.

Чтобы правильно преобразовать `Date` только по дате в `Temporal.PlainDate`, не будучи уязвимым для ошибок с отклонением на один день, вы должны определить, полночь какого часового пояса использовалась для создания `Date`, а затем использовать тот же часовой пояс при преобразовании из `Temporal.Instant` в `Temporal.PlainDate`.

```javascript
// Преобразуйте год/месяц/день `Date` в `Temporal.PlainDate`. Использует часовой пояс вызывающего абонента.
let date = new Date(2000, 0, 1); //=> Суббота, 1 января 2000 г., 00:00:00 GMT-0800 (стандартное тихоокеанское время)
let plainDate = date
    .toTemporalInstant() //=> 2000-01-01T08:00:00Z
    .toZonedDateTimeISO(Temporal.Now.timeZoneId()) //=> 2000-01-01T00:00:00-08:00[Америка/Лос-Анджелес]
    .toPlainDate(); // => 2000-01-01

assert.equal(plainDate.toString(), '2000-01-01');

// Преобразуйте год/месяц/день `Date` в `Temporal.PlainDate`. Использует UTC.
date = new Date(Date.UTC(2000, 0, 1)); //=> Пт, 31 декабря 1999 г., 16:00:00 GMT-0800 (стандартное тихоокеанское время)
date = new Date('2000-01-01T00:00Z'); //=> Пт, 31 декабря 1999 г., 16:00:00 GMT-0800 (стандартное тихоокеанское время)
plainDate = date
    .toTemporalInstant() //=> 2000-01-01T00:00:00Z
    .toZonedDateTimeISO('UTC') //=> 2000-01-01T00:00:00+00:00[UTC]
    .toPlainDate(); // => 2000-01-01

assert.equal(plainDate.toString(), '2000-01-01');
```

### Типы `Temporal` => устаревший `Date`

Устаревший `Date` представляет точное время, поэтому легко преобразовать экземпляр `Temporal.Instant` или `Temporal.ZonedDateTime` в соответствующий ему устаревший экземпляр `Date`.

```javascript
// Чтобы преобразовать Instant в устаревший Date, используйте свойство epochMilliseconds.

const instant = Temporal.Instant.from('2020-01-01T00:00:01.000999Z');
const result = new Date(instant.epochMilliseconds);

assert.equal(result.getTime(), 1577836801000); //мс с эпохи Unix
assert.equal(result.toISOString(), '2020-01-01T00:00:01.000Z');

// То же самое и с ZonedDateTime.
// Обратите внимание, что устаревший Date не сохранит часовой пояс ZonedDateTime.

const zoned = Temporal.ZonedDateTime.from(
    '2020-01-01T00:00:01.001[Asia/Tokyo]',
);
const result2 = new Date(zoned.epochMilliseconds);

assert.equal(result2.getTime(), 1577804401001); //заметьте, другое время
assert.equal(result2.toISOString(), '2019-12-31T15:00:01.001Z');

// Для большинства случаев использования подойдет новый Date(x.epochMilliseconds).
// Возможно, вам придется добавить дополнительный шаг round(), если вам нужны другие
// поведение округления, чем усечение. Например, здесь 999
// микросекунды округляются до 1 миллисекунды.

const result3 = new Date(
    instant.round({ smallestUnit: 'millisecond' }).epochMilliseconds,
);

assert.equal(result3.getTime(), 1577836801001);
assert.equal(result3.toISOString(), '2020-01-01T00:00:01.001Z');
```

## Создание

### Элемент ввода календаря

Вы можете использовать объекты `Temporal` для установки свойств элемента управления «Календарь». Вот пример использования HTML-элемента `<input type="date">`, в котором любой день, кроме «сегодня», отключен и недоступен для выбора.

(Чтобы вернуть объект `Temporal` из элемента управления «Календарь», см. пример [«Сколько дней до будущей даты»](#how-many-days-until-a-future-date).)

<input type="date" id="calendar-input">

<script type="text/javascript">
{
const datePicker = document.getElementById('calendar-input');
const today = Temporal.Now.plainDateISO();
datePicker.max = today;
datePicker.value = today;
}
</script>

```javascript
const datePicker = document.getElementById('calendar-input');
const today = Temporal.Now.plainDateISO();
datePicker.max = today;
datePicker.value = today;
```

## Преобразование между типами

### Полдень определенного дня

Пример объединения календарной даты (`Temporal.PlainDate`) и времени настенных часов (`Temporal.PlainTime`) в `Temporal.PlainDateTime`.

```javascript
const date = Temporal.PlainDate.from('2020-05-14');

const noonOnDate = date.toPlainDateTime(Temporal.PlainTime.from({ hour: 12 }));

assert(noonOnDate instanceof Temporal.PlainDateTime);
assert.equal(noonOnDate.toString(), '2020-05-14T12:00:00');
```

### День рождения в 2030 году

Пример объединения дня календаря (`Temporal.PlainMonthDay`) и года в `Temporal.PlainDate`.

```javascript
const birthday = Temporal.PlainMonthDay.from('12-15');

const birthdayIn2030 = birthday.toPlainDate({ year: 2030 });
birthdayIn2030.dayOfWeek; // => 7

assert(birthdayIn2030 instanceof Temporal.PlainDate);
assert.equal(birthdayIn2030.toString(), '2030-12-15');
```

## Сериализация

### Мгновенное зонирование по мгновенному времени и часовому поясу

Чтобы сериализовать `Temporal.Instant` точного времени в строку, используйте `toString()`. Без каких-либо аргументов вы получите строку во времени UTC.

Если вам нужно, чтобы ваша строка включала смещение UTC, используйте опцию `timeZone` `Temporal.Instant.prototype.toString()`, которая вернет сериализацию строки времени настенных часов в этом часовом поясе, соответствующую точному времени.

При этом теряется информация о том, в каком часовом поясе находилась строка, поскольку сохраняется только смещение UTC от часового пояса в это конкретное время. Если вам нужно, чтобы ваша строка включала имя часового пояса, вместо этого используйте `Temporal.ZonedDateTime`, который сохранит эту информацию.

```javascript
const instant = Temporal.Instant.from('2020-01-03T10:41:51Z');

const result = instant.toString();

assert.equal(result, '2020-01-03T10:41:51Z');
assert(instant.equals(Temporal.Instant.from(result)));

// Включите смещение UTC определенного часового пояса:

const result2 = instant.toString({ timeZone: 'America/Yellowknife' });

assert.equal(result2, '2020-01-03T03:41:51-07:00');
assert(instant.equals(Temporal.Instant.from(result2)));

// Включите смещение UTC, а также сохраните имя часового пояса:

const zoned = instant.toZonedDateTimeISO('Asia/Seoul');
const result3 = zoned.toString();

assert.equal(result3, '2020-01-03T19:41:51+09:00[Asia/Seoul]');
assert(instant.equals(Temporal.Instant.from(result3)));
assert(zoned.equals(Temporal.ZonedDateTime.from(result3)));
```

## Сортировка

Каждый тип `Temporal` имеет статический метод `compare()`, который можно передать в `Array.prototype.sort()` в качестве функции сравнения для сортировки массива типов `Temporal`.

### Сортировка значений PlainDateTime

Отсортируйте список `Temporal.PlainDateTime`, например, чтобы расположить расписание конференций в правильном порядке. Сортировка других типов `Temporal` будет работать точно так же.

```javascript
/**
 * getSortedLocalDateTimes отсортирует массив бесзональных экземпляров Temporal.PlainDateTime по
 * соответствующую местную дату и время суток (например, для построения расписания конференции).
 *
 *
 * @param {Temporal.PlainDateTime[]} dateTimes — это экземпляр DateTime.
 * @param {boolean} [reverse=false] — возврат в обратном порядке
 * @returns {Temporal.PlainDateTime[]} массив из dateTimes, отсортированный
 */
function getSortedLocalDateTimes(dateTimes, reverse = false) {
    let newDateTimes = Array.from(dateTimes).sort(
        Temporal.PlainDateTime.compare,
    );

    return reverse ? newDateTimes.reverse() : newDateTimes;
}

// Сортировка некоторых конференций без часовых поясов, например vue.js Amsterdam 2020
let a = Temporal.PlainDateTime.from({
    year: 2020,
    day: 20,
    month: 2,
    hour: 8,
    minute: 45,
}); //Введение
let b = Temporal.PlainDateTime.from({
    year: 2020,
    day: 21,
    month: 2,
    hour: 13,
    minute: 10,
}); //Обеденный перерыв
let c = Temporal.PlainDateTime.from({
    year: 2020,
    day: 20,
    month: 2,
    hour: 15,
    minute: 30,
}); //Кофе-брейк
const results = getSortedLocalDateTimes([a, b, c]);
assert.deepEqual(
    results.map((x) => x.toString()),
    ['2020-02-20T08:45:00', '2020-02-20T15:30:00', '2020-02-21T13:10:00'],
);
```

### Сортировка строк даты/времени ISO

Сортируйте список строк даты и времени ISO 8601 или RFC 9557, например, чтобы упорядочить записи журнала.

```javascript
/**
 * sortInstantStrings сортирует массив строк (каждая из которых
 * анализируется как Temporal.Instant и может включать или не включать время IANA
 * имя зоны) к соответствующему точному времени (например, для представления глобального
 * регистрировать события последовательно).
 *
 * @param {string[]} strings — массив строк ISO.
 * @param {boolean} [reverse=false] — порядок возрастания или убывания
 * @returns {string[]} массив из отсортированных строк
 */
function sortInstantStrings(strings, reverse = false) {
    const sortedInstants = strings
        .map((v) => [v, Temporal.Instant.from(v)])
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([str]) => str);

    return reverse ? sortedInstants.reverse() : sortedInstants;
}

// простой порядок сравнения строк здесь неверен:
const a = '2020-01-23T17:04:36.491865121-08:00';
const b = '2020-02-10T17:04:36.491865121-08:00';
const c = '2020-04-01T05:01:00-04:00[America/New_York]';
const d = '2020-04-01T10:00:00+01:00[Europe/London]';
const e = '2020-04-01T11:02:00+02:00[Europe/Berlin]';

const results = sortInstantStrings([a, b, c, d, e]);

// результаты будут иметь правильный порядок
assert.deepEqual(results, [
    '2020-01-23T17:04:36.491865121-08:00',
    '2020-02-10T17:04:36.491865121-08:00',
    '2020-04-01T10:00:00+01:00[Europe/London]',
    '2020-04-01T05:01:00-04:00[America/New_York]',
    '2020-04-01T11:02:00+02:00[Europe/Berlin]',
]);
```

## Округление

### Округляем время до целых часов

Используйте метод `round()` каждого типа `Temporal`, если вы хотите округлить поля времени. Вот пример округления времени _вниз_ до предыдущего целого часа:

```javascript
const time = Temporal.PlainTime.from('12:38:28.138818731');

const wholeHour = time.round({ smallestUnit: 'hour', roundingMode: 'floor' });

assert.equal(wholeHour.toString(), '12:00:00');
```

### Округляем дату до ближайшего начала месяца

Округление определено только для полей времени. Округление поля даты может быть неоднозначным, поэтому типы, содержащие только дату, такие как `Temporal.PlainDate`, не имеют метода `round()`. Например, если вам нужно округлить дату до ближайшего месяца, вы должны явно указать, какой тип округления вы хотите. Вот пример округления до ближайшего начала месяца, округления в большую сторону в случае ничьей:

```javascript
const date = Temporal.PlainDate.from('2018-09-16');

const firstOfCurrentMonth = date.with({ day: 1 });
const firstOfNextMonth = firstOfCurrentMonth.add({ months: 1 });

const sinceCurrent = date.since(firstOfCurrentMonth);
const untilNext = date.until(firstOfNextMonth);

const isCloserToNextMonth =
    Temporal.Duration.compare(sinceCurrent, untilNext) >= 0;
const nearestMonth = isCloserToNextMonth
    ? firstOfNextMonth
    : firstOfCurrentMonth;

assert.equal(nearestMonth.toString(), '2018-10-01');
```

См. также раздел [«Отодвинуть дату запуска»](#move-launch-date), чтобы узнать более простой способ безусловного округления до _следующего_ начала месяца.

## Преобразование часового пояса

### Сохранение местного времени

Сопоставьте дату и время дня без зоны с экземпляром `Temporal.Instant`, в котором локальная дата и время суток в указанном часовом поясе соответствуют им. Это легко сделать с помощью `dateTime.toZonedDateTime(timeZone).toInstant()`, но вот пример реализации поведения устранения неоднозначности, отличного от `'compatible'`, `'earlier'`, `'later'` и `'reject'`, встроенных в `Temporal`.

```javascript
/**
 * Получите точное время, соответствующее календарной дате/времени на настенных часах в
 * определенный часовой пояс, то же самое, что и
 * Temporal.PlainDateTime.toZonedDateTimeISO(), но с большей ясностью
 * параметры.
 *
 * А также параметры устранения неоднозначности Temporal по умолчанию «совместимы»,
 * «раньше», «позже» и «отклонить», возможны дополнительные параметры:
 *
 * - «clipEarlier»: эквивалент «раньше» при повороте часов назад, и
 * при переводе часов вперед возвращает время непосредственно перед часами
 * изменения.
 * - «clipLater»: эквивалент «позже» при повороте часов назад и когда
 * перевод часов вперед возвращает точное время перевода часов.
 *
 * @param {Temporal.PlainDateTime} dateTime — дата Calendar и время на настенных часах.
 * конвертировать
 * @param {string} timeZone — IANA идентификатор часового пояса, в котором следует учитывать
 * время настенных часов
 * @param {string} [disambiguation='earlier'] — режим устранения неоднозначности, см. описание.
 * @returns {Temporal.Instant} Абсолютное время в часовом поясе на момент
 * дата календаря и время настенных часов из dateTime
 */
function getInstantWithLocalTimeInZone(
    dateTime,
    timeZone,
    disambiguation = 'earlier',
) {
    // Сначала обработайте встроенные режимы
    if (['compatible', 'earlier', 'later', 'reject'].includes(disambiguation)) {
        return dateTime
            .toZonedDateTime(timeZone, { disambiguation })
            .toInstant();
    }

    const zdts = ['earlier', 'later'].map((disambiguation) =>
        dateTime.toZonedDateTime(timeZone, { disambiguation }),
    );
    const instants = zdts
        .map((zdt) => zdt.toInstant())
        .reduce((a, b) => (a.equals(b) ? [a] : [a, b]));

    // Возможность возврата только в том случае, если устранение неоднозначности не требуется.
    if (instants.length === 1) return instants[0];

    switch (disambiguation) {
        case 'clipEarlier':
            if (zdts[0].toPlainDateTime().equals(dateTime)) {
                return instants[0];
            }
            return zdts[0]
                .getTimeZoneTransition('next')
                .subtract({ nanoseconds: 1 })
                .toInstant();
        case 'clipLater':
            if (zdts[1].toPlainDateTime().equals(dateTime)) {
                return instants[1];
            }
            return zdts[0].getTimeZoneTransition('next').toInstant();
    }
    throw new RangeError(`invalid disambiguation ${disambiguation}`);
}

const nonexistentGermanWallTime =
    Temporal.PlainDateTime.from('2019-03-31T02:45');

const germanResults = {
    earlier: /*     */ '2019-03-31T01:45:00+01:00',
    later: /*       */ '2019-03-31T03:45:00+02:00',
    compatible: /*  */ '2019-03-31T03:45:00+02:00',
    clipEarlier: /* */ '2019-03-31T01:59:59.999999999+01:00',
    clipLater: /*   */ '2019-03-31T03:00:00+02:00',
};
for (const [disambiguation, result] of Object.entries(germanResults)) {
    assert.equal(
        getInstantWithLocalTimeInZone(
            nonexistentGermanWallTime,
            'Europe/Berlin',
            disambiguation,
        ).toString({
            timeZone: 'Europe/Berlin',
        }),
        result,
    );
}

const doubleEasternBrazilianWallTime =
    Temporal.PlainDateTime.from('2019-02-16T23:45');

const brazilianResults = {
    earlier: /*     */ '2019-02-16T23:45:00-02:00',
    later: /*       */ '2019-02-16T23:45:00-03:00',
    compatible: /*  */ '2019-02-16T23:45:00-02:00',
    clipEarlier: /* */ '2019-02-16T23:45:00-02:00',
    clipLater: /*   */ '2019-02-16T23:45:00-03:00',
};
for (const [disambiguation, result] of Object.entries(brazilianResults)) {
    assert.equal(
        getInstantWithLocalTimeInZone(
            doubleEasternBrazilianWallTime,
            'America/Sao_Paulo',
            disambiguation,
        ).toString({
            timeZone: 'America/Sao_Paulo',
        }),
        result,
    );
}
```

### Сохранение точного времени

Сопоставьте зональную дату и время суток с другой зональной датой и временем суток в целевом часовом поясе в соответствующее точное время. Это можно использовать при преобразовании вводимых пользователем значений даты и времени между часовыми поясами.

```javascript
const source = Temporal.ZonedDateTime.from('2020-01-09T00:00[America/Chicago]');

const result = source.withTimeZone('America/Los_Angeles');

// В этот день, когда в Чикаго полночь, в Лос-Анджелесе было 22:00 предыдущего дня.
assert.equal(
    result.toString(),
    '2020-01-08T22:00:00-08:00[America/Los_Angeles]',
);
```

Вот еще один пример, аналогичный предыдущему, с использованием часового пояса для будущих событий. Время и место серии будущих встреч хранятся в виде пары строк: одна для календарной даты и времени настенных часов, а другая для часового пояса. Они не могут быть сохранены как точное время, потому что между настоящим моментом и временем, когда произойдет событие, правила часового пояса для перехода на летнее время могут измениться — например, Бразилия отменила летнее время в 2019 году — но собрание все равно будет проводиться в то же время на настенных часах в этот день. Поэтому, если правила часового пояса изменятся, точное время мероприятия изменится.

В этом примере рассчитывается время начала всех собраний Ecma TC39 в 2019 году по местному времени в Токио.

```javascript
// Даты заседаний ТК39 в 2019 году:
const tc39meetings = [
    {
        dateTime: '2019-01-28T10:00',
        timeZone: 'America/Phoenix',
    },
    {
        dateTime: '2019-03-26T10:00',
        timeZone: 'America/New_York',
    },
    {
        dateTime: '2019-06-04T10:00',
        timeZone: 'Europe/Berlin',
    },
    {
        dateTime: '2019-07-23T10:00',
        timeZone: 'America/Los_Angeles',
    },
    {
        dateTime: '2019-10-01T10:00',
        timeZone: 'America/New_York',
    },
    {
        dateTime: '2019-12-03T10:00',
        timeZone: 'America/Los_Angeles',
    },
];

// Чтобы следить за встречами удаленно из Токио, рассчитайте время, которое вам потребуется
// нужно присоединиться:
const localTimeZone = 'Asia/Tokyo';
const localTimes = tc39meetings.map(({ dateTime, timeZone }) => {
    return Temporal.PlainDateTime.from(dateTime)
        .toZonedDateTime(timeZone, { disambiguation: 'reject' })
        .withTimeZone(localTimeZone)
        .toPlainDateTime();
});

assert.deepEqual(
    localTimes.map((dt) => dt.toString()),
    [
        '2019-01-29T02:00:00',
        '2019-03-26T23:00:00',
        '2019-06-04T17:00:00',
        '2019-07-24T02:00:00',
        '2019-10-01T23:00:00',
        '2019-12-04T03:00:00',
    ],
);
```

### Ежедневное событие по местному времени

Аналогично предыдущему рецепту рассчитайте точное время ежедневных событий, происходящих в определенное местное время в определенном часовом поясе.

```javascript
/**
 * Возвращает итератор точного времени, соответствующего ежедневному происшествию.
 * начиная с определенной даты и происходящего в определенное местное время в
 * конкретный часовой пояс.
 *
 * @param {Temporal.PlainDate} startDate — дата начала.
 * @param {Temporal.PlainTime} plainTime — местное время, когда происходит событие.
 * @param {string} timeZone — часовой пояс, в котором определяется событие.
 */
function* calculateDailyOccurrence(startDate, plainTime, timeZone) {
    for (let date = startDate; ; date = date.add({ days: 1 })) {
        yield date.toZonedDateTime({ plainTime, timeZone }).toInstant();
    }
}

// Ежедневная встреча в 8 утра по калифорнийскому времени.
const startDate = Temporal.PlainDate.from('2017-03-10');
const time = Temporal.PlainTime.from('08:00');
const timeZone = 'America/Los_Angeles';
const iter = calculateDailyOccurrence(startDate, time, timeZone);

assert.equal(iter.next().value.toString(), '2017-03-10T16:00:00Z');
assert.equal(iter.next().value.toString(), '2017-03-11T16:00:00Z');
// Переход на летнее время:
assert.equal(iter.next().value.toString(), '2017-03-12T15:00:00Z');
assert.equal(iter.next().value.toString(), '2017-03-13T15:00:00Z');
```

### Смещение UTC для зонального события в виде строки

Используйте `Temporal.Instant.toZonedDateTimeISO()` и `Temporal.ZonedDateTime.offset`, чтобы сопоставить экземпляр `Temporal.Instant` и часовой пояс со смещением UTC в точное время в этом часовом поясе в виде строки.

```javascript
const instant = Temporal.Instant.from('2020-01-09T00:00Z');

const source = instant.toZonedDateTimeISO('America/New_York');
source.offset; // => '-05:00'
```

### UTC смещение для зонального события в секундах

Аналогичным образом используйте `Temporal.Instant.toZonedDateTimeISO()` и `Temporal.ZonedDateTime.offsetNanoseconds`, чтобы сделать то же самое для смещения в секундах. (Не забудьте разделить на 10<sup>9</sup>, чтобы преобразовать наносекунды в секунды.)

```javascript
const instant = Temporal.Instant.from('2020-01-09T00:00Z');

instant.toZonedDateTimeISO('America/New_York').offsetNanoseconds / 1e9; // => -18000
```

### Смещение между двумя часовыми поясами в точное время

Также, используя `Temporal.Instant.toZonedDateTimeISO()` и `Temporal.ZonedDateTime.offsetNanoseconds`, мы можем сопоставить экземпляр `Temporal.Instant` и два часовых пояса со знаком разницы смещений UTC между этими часовыми поясами в это точное время, выраженное в секундах.

```javascript
/**
 * Возвращает разницу в секундах между двумя смещениями UTC.
 * часовые пояса, в точное время
 *
 * @param {Temporal.Instant} instant — точное время.
 * @param {string} sourceTimeZone — IANA Идентификатор часового пояса для проверки
 * @param {string} targetTimeZone — IANA Идентификатор второго часового пояса для проверки
 * @returns {number} Разница в секундах между часовыми поясами.
 * Смещения UTC
 */
function getUtcOffsetDifferenceSecondsAtInstant(
    instant,
    sourceTimeZone,
    targetTimeZone,
) {
    const sourceOffsetNs =
        instant.toZonedDateTimeISO(sourceTimeZone).offsetNanoseconds;
    const targetOffsetNs =
        instant.toZonedDateTimeISO(targetTimeZone).offsetNanoseconds;
    return (targetOffsetNs - sourceOffsetNs) / 1e9;
}

const instant = Temporal.Instant.from('2020-01-09T00:00Z');

// В это же время Чикаго на 3600 секунд опережает Нью-Йорк.
assert.equal(
    getUtcOffsetDifferenceSecondsAtInstant(
        instant,
        'America/New_York',
        'America/Chicago',
    ),
    -3600,
);
```

### Работа с датами и временем в фиксированном месте

Вот пример использования `Temporal` на графике, показывающий фиктивную активность резервуара-хранилища в фиксированном месте (Стокгольм, Швеция). График всегда начинается в полночь в том месте, где находится резервуар, но метки графика находятся в часовом поясе зрителя.

<script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"></script>

<canvas id="storage-tank" width="600" height="400"></canvas>

<script type="text/javascript">
{
// Генерировать фиктивные «данные»
const start = Temporal.Now.instant().subtract({ hours: 24 });
const blank = Array(24 * 12);
const tankDataX = Array.from(blank, (_, ix) => start.add({ minutes: ix * 5 }));
const tankDataY = Array.from(blank);
tankDataY[0] = 25;
for (let ix = 1; ix < tankDataY.length; ix++) {
  tankDataY[ix] = Math.max(0, tankDataY[ix - 1] + 3 * (Math.random() - 0.5));
}

// TankDataX и TankDataY — данные по осям X и Y за последние 24 часа.
// получено откуда-то еще, например const [tankDataX, TankDataY] = fetchData();
// TankDataX — это массив Temporal.Instant, а TankDataY — это массив чисел.

// Показывать данные, начиная с последней полуночи в месте нахождения резервуара (Стокгольм).
const tankTimeZone = 'Europe/Stockholm';
const labelFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: Temporal.Now.timeZoneId()
});
const browserCalendar = labelFormatter.resolvedOptions().calendar;
const tankMidnight = Temporal.Now.zonedDateTimeISO()
  .withCalendar(browserCalendar)
  .withTimeZone(tankTimeZone)
  .startOfDay()
  .toInstant();
const atOrAfterMidnight = (x) => Temporal.Instant.compare(x, tankMidnight) >= 0;
const dataStartIndex = tankDataX.findIndex(atOrAfterMidnight);
const graphLabels = tankDataX.slice(dataStartIndex).map((x) => labelFormatter.format(x));
const graphPoints = tankDataY.slice(dataStartIndex);

const ctx = document.getElementById('storage-tank').getContext('2d');
// График построен с помощью Chart.js (https://www.chartjs.org/)
new Chart(ctx, {
  type: 'line',
  data: {
    labels: graphLabels,
    datasets: [
      {
        label: 'Fill level',
        data: graphPoints
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Stockholm storage tank'
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  }
});
}
</script>

```javascript
// TankDataX и TankDataY — данные по осям X и Y за последние 24 часа.
// получено откуда-то еще, например const [tankDataX, TankDataY] = fetchData();
// TankDataX — это массив Temporal.Instant, а TankDataY — это массив чисел.

// Показывать данные, начиная с последней полуночи в месте нахождения резервуара (Стокгольм).
const tankTimeZone = 'Europe/Stockholm';
const labelFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: Temporal.Now.timeZoneId(),
});
const browserCalendar = labelFormatter.resolvedOptions().calendar;
const tankMidnight = Temporal.Now.zonedDateTimeISO()
    .withCalendar(browserCalendar)
    .withTimeZone(tankTimeZone)
    .startOfDay()
    .toInstant();
const atOrAfterMidnight = (x) => Temporal.Instant.compare(x, tankMidnight) >= 0;
const dataStartIndex = tankDataX.findIndex(atOrAfterMidnight);
const graphLabels = tankDataX
    .slice(dataStartIndex)
    .map((x) => labelFormatter.format(x));
const graphPoints = tankDataY.slice(dataStartIndex);

const ctx = document.getElementById('storage-tank').getContext('2d');
// График построен с помощью Chart.js (https://www.chartjs.org/)
new Chart(ctx, {
    type: 'line',
    data: {
        labels: graphLabels,
        datasets: [
            {
                label: 'Fill level',
                data: graphPoints,
            },
        ],
    },
    options: {
        title: {
            display: true,
            text: 'Stockholm storage tank',
        },
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
});
```

### Забронируйте встречу в разных часовых поясах

В Интернете существует несколько инструментов для поиска времени встречи, подходящего для часовых поясов всех участников, например [World Time Buddy](https://www.worldtimebuddy.com/), [World Clock Meeting Planner](https://www.timeanddate.com/worldclock/meeting.html), которые встроены в различные календарные программы.

<style>
#meeting-planner {
граница-коллапс: отдельная;
расстояние между границами: 0 10 пикселей;
размер шрифта: 0,6рем;
выравнивание текста: по центру;
  }

/* https://materializecss.com/color.html */
.time-0, .time-1, .time-2, .time-3, .time-4, .time-5,
.time-22, .time-23 {
цвет фона: #ef9a9a;  /* красная подсветка-3 */
цвет границы: #e57373;  /* красный свет-2 */
стиль границы: сплошной;
ширина границы: 0 1px;
  }
.time-6, .time-7, .time-18, .time-19, .time-20, .time-21 {
цвет фона: #fff59d;  /* желтый свет-3 */
цвет границы: #ffd54f;  /* янтарный свет-2 */
стиль границы: сплошной;
ширина границы: 0 1px;
  }
.time-8, .time-9, .time-10, .time-11, .time-12, .time-13,
.time-14, .time-15, .time-16, .time-17 {
цвет фона: #a5d6a7;  /* зеленый свет-3 */
цвет границы: #81c784;  /* зеленый свет-2 */
стиль границы: сплошной;
ширина границы: 0 1px;
  }

.time-0 {
граница-нижний-левый радиус: 12 пикселей;
цвет левой границы: белый;
ширина левой границы: 2 пикселя;
граница-верхний левый радиус: 12 пикселей;
начертание шрифта: жирный;
  }
.time-23 {
граница-нижний-правый-радиус: 12 пикселей;
бордюр-правый-цвет: белый;
ширина границы справа: 2 пикселя;
граница-верхний-правый-радиус: 12 пикселей;
  }

.time-current {
граница: 2 пикселя, сплошная черная;
  }
</style>

<table id="meeting-planner">
</table>

<script type="text/javascript" id="meeting-planner-source">
{
// Отобразить местный часовой пояс и три других
const browserCalendar = new Intl.DateTimeFormat().resolvedOptions().calendar;
const now = Temporal.Now.zonedDateTimeISO().withCalendar(browserCalendar);
const timeZones = [
  { name: 'Here', tz: now.timeZoneId },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'London', tz: 'Europe/London' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' }
];

// Начните стол в полночь по местному времени.
const startTime = now.startOfDay();

// Постройте стол
const table = document.getElementById('meeting-planner');
timeZones.forEach(({ name, tz }) => {
  const row = document.createElement('tr');

  const title = document.createElement('td');
  const startTimeHere = startTime.withTimeZone(tz);
  title.textContent = `${name} (UTC${startTimeHere.offset})`;
  row.appendChild(title);

  for (let hours = 0; hours < 24; hours++) {
    const cell = document.createElement('td');

    const columnTime = startTimeHere.add({ hours });
    cell.className = `time-${columnTime.hour}`;

    // Выделите текущий час в каждой строке
    if (hours === now.hour) cell.className += ' time-current';

    // Показывать дату в полуночных ячейках
    let formatOptions;
    if (columnTime.hour === columnTime.startOfDay().hour) {
      formatOptions = { month: 'short', day: 'numeric' };
    } else {
      formatOptions = { hour: 'numeric' };
    }
    cell.textContent = columnTime.toLocaleString(undefined, formatOptions);
    row.appendChild(cell);
  }

  table.appendChild(row);
});
}
</script>

```javascript
// Отобразить местный часовой пояс и три других
const browserCalendar = new Intl.DateTimeFormat().resolvedOptions().calendar;
const now = Temporal.Now.zonedDateTimeISO().withCalendar(browserCalendar);
const timeZones = [
    { name: 'Here', tz: now.timeZoneId },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
];

// Начните стол в полночь по местному времени.
const startTime = now.startOfDay();

// Постройте стол
const table = document.getElementById('meeting-planner');
timeZones.forEach(({ name, tz }) => {
    const row = document.createElement('tr');

    const title = document.createElement('td');
    const startTimeHere = startTime.withTimeZone(tz);
    title.textContent = `${name} (UTC${startTimeHere.offset})`;
    row.appendChild(title);

    for (let hours = 0; hours < 24; hours++) {
        const cell = document.createElement('td');

        const columnTime = startTimeHere.add({ hours });
        cell.className = `time-${columnTime.hour}`;

        // Выделите текущий час в каждой строке
        if (hours === now.hour) cell.className += ' time-current';

        // Показывать дату в полуночных ячейках
        let formatOptions;
        if (columnTime.hour === columnTime.startOfDay().hour) {
            formatOptions = { month: 'short', day: 'numeric' };
        } else {
            formatOptions = { hour: 'numeric' };
        }
        cell.textContent = columnTime.toLocaleString(undefined, formatOptions);
        row.appendChild(cell);
    }

    table.appendChild(row);
});
```

## Арифметика

### Сколько дней до будущей даты {#how-many-days-until-a-future-date}

Пример HTML-формы, вдохновленный [Days Calculator](https://www.timeanddate.com/date/durationresult.html) на timeanddate.com:

<form action="#how-many-days-until-a-future-date">
<label>
Введите будущую дату:
<input type="date" name="futuredate">
</label>
<button>Отправить</button>
</form>

<div id="futuredate-results"></div>

<script type="text/javascript">
{
  // Выполните инициализацию, которая не обязательно должна быть включена в
  // пример; см. «Входной элемент Calendar»
  const futureDatePicker = document.querySelector('input[name="futuredate"]');
  const browserCalendar = new Intl.DateTimeFormat().resolvedOptions().calendar;
  const today = Temporal.Now.plainDateISO().withCalendar(browserCalendar);
  futureDatePicker.min = today;
  futureDatePicker.value = today.add({ months: 1 });

// Параметры формы
const params = new URL(document.location).searchParams;
const futuredateParam = params.get('futuredate');

// Обходной путь для создания строки, если в браузере нет
// Intl.DurationFormat. Обходной путь работает только на английском языке.
function englishPlural(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}
function formatDays(duration) {
  if (typeof Intl.DurationFormat === 'undefined') {
    return englishPlural(duration.days, 'day', 'days');
  }
  return duration.toLocaleString();
}
function formatMonths(duration) {
  if (typeof Intl.DurationFormat === 'undefined') {
    return (
      `${englishPlural(duration.months, 'month', 'months')}` +
      (duration.days !== 0 ? `, ${englishPlural(duration.days, 'day', 'days')}` : '')
    );
  }
  return duration.toLocaleString();
}

// При публикации данных формы:
if (futuredateParam !== null) {
  const browserCalendar = new Intl.DateTimeFormat().resolvedOptions().calendar;
  const futureDate = Temporal.PlainDate.from(futuredateParam).withCalendar(browserCalendar);
  const today = Temporal.Now.plainDateISO().withCalendar(browserCalendar);
  const until = today.until(futureDate, { largestUnit: 'day' });
  const untilMonths = until.round({ largestUnit: 'month', relativeTo: today });

  const dayString = formatDays(until);
  const results = document.getElementById('futuredate-results');
  results.innerHTML = `
    <p>From and including: <strong>${today.toLocaleString()}</strong></p>
    <p>To but not including: <strong>${futureDate.toLocaleString()}</strong></p>
    <h4>Result: ${dayString}</h4>
    <p>It is ${dayString} from the start date to the end date, but not
    including the end date.</p>
    <p>Or ${formatMonths(untilMonths)} excluding the end date.</p>
  `;
}
}
</script>

```javascript
// Параметры формы
const params = new URL(document.location).searchParams;
const futuredateParam = params.get('futuredate');

// Обходной путь для создания строки, если в браузере нет
// Intl.DurationFormat. Обходной путь работает только на английском языке.
function englishPlural(n, singular, plural) {
    return `${n} ${n === 1 ? singular : plural}`;
}
function formatDays(duration) {
    if (typeof Intl.DurationFormat === 'undefined') {
        return englishPlural(duration.days, 'day', 'days');
    }
    return duration.toLocaleString();
}
function formatMonths(duration) {
    if (typeof Intl.DurationFormat === 'undefined') {
        return (
            `${englishPlural(duration.months, 'month', 'months')}` +
            (duration.days !== 0
                ? `, ${englishPlural(duration.days, 'day', 'days')}`
                : '')
        );
    }
    return duration.toLocaleString();
}

// При публикации данных формы:
if (futuredateParam !== null) {
    const browserCalendar = new Intl.DateTimeFormat().resolvedOptions()
        .calendar;
    const futureDate =
        Temporal.PlainDate.from(futuredateParam).withCalendar(browserCalendar);
    const today = Temporal.Now.plainDateISO().withCalendar(browserCalendar);
    const until = today.until(futureDate, { largestUnit: 'day' });
    const untilMonths = until.round({
        largestUnit: 'month',
        relativeTo: today,
    });

    const dayString = formatDays(until);
    const results = document.getElementById('futuredate-results');
    results.innerHTML = `
    <p>From and including: <strong>${today.toLocaleString()}</strong></p>
    <p>To but not including: <strong>${futureDate.toLocaleString()}</strong></p>
    <h4>Result: ${dayString}</h4>
    <p>It is ${dayString} from the start date to the end date, but not
    including the end date.</p>
    <p>Or ${formatMonths(untilMonths)} excluding the end date.</p>
  `;
}
```

### Продолжительность между настоящим и прошлым/будущим зональным событием ограничена единицей

Возьмите разницу между двумя экземплярами `Temporal.Instant` как экземпляр `Temporal.Duration` (положительный или отрицательный), представляющий продолжительность между двумя моментами без использования единиц измерения, более грубых, чем указано (например, для представления значимого обратного отсчета с использованием месяцев или дней без использования).

```javascript
const result = Temporal.Instant.from('2020-01-09T04:00Z').since(
    Temporal.Instant.from('2020-01-09T00:00Z'),
    {
        largestUnit: 'hour',
    },
);
assert.equal(`${result}`, 'PT4H');

const result2 = Temporal.Instant.from('2020-01-09T00:00Z').until(
    Temporal.Instant.from('2020-01-09T04:00Z'),
    {
        largestUnit: 'minute',
    },
);
assert.equal(`${result2}`, 'PT240M');

// Пример использования в обратном отсчете:

const duration = Temporal.Now.instant().until(
    Temporal.Instant.from('2020-04-01T13:00-07:00[America/Los_Angeles]'),
);
`It's ${duration.toLocaleString()} ${duration.sign < 0 ? 'until' : 'since'} the TC39 Temporal presentation`;
```

### Следующий переход смещения в часовом поясе

Сопоставьте экземпляр `Temporal.ZonedDateTime` с другим экземпляром `Temporal.ZonedDateTime`, представляющим ближайшее следующее точное время, в которое происходит сдвиг смещения в часовом поясе (например, для установки напоминаний).

```javascript
/**
 * Получите ближайшее точное время перехода данного часового пояса.
 * на другое смещение UTC, включающее или исключающее.
 *
 * @param {Temporal.ZonedDateTime} zonedDateTime — точное время и время начала
 * зона для рассмотрения
 * @param {boolean} inclusive — включить или нет время начала
 * @returns {(Temporal.ZonedDateTime|null)} — следующий переход смещения UTC, или
 * ноль, если на данный момент ничего не известно
 */
function getNextOffsetTransitionFromExactTime(zonedDateTime, inclusive) {
    let nearest;
    if (inclusive) {
        // В случае, если сам момент является точным временем перехода:
        nearest = zonedDateTime
            .subtract({ nanoseconds: 1 })
            .getTimeZoneTransition('next');
    } else {
        nearest = zonedDateTime.getTimeZoneTransition('next');
    }
    return nearest;
}

const nycTime = Temporal.ZonedDateTime.from(
    '2019-04-16T21:01Z[America/New_York]',
);

const nextTransition = getNextOffsetTransitionFromExactTime(nycTime, false);
assert.equal(
    nextTransition.toString(),
    '2019-11-03T01:00:00-05:00[America/New_York]',
);

// Инклюзивно
const sameTransition = getNextOffsetTransitionFromExactTime(
    nextTransition,
    true,
);
assert.equal(sameTransition.toString(), nextTransition.toString());

// Нет известных будущих переходов на летнее время в часовом поясе.
const reginaTime = Temporal.ZonedDateTime.from(
    '2019-04-16T21:01Z[America/Regina]',
);
assert.equal(getNextOffsetTransitionFromExactTime(reginaTime), null);
```

### Сравнение точного времени с часами работы

В этом примере берется список времени открытия и закрытия настенных часов для компании, а точное время сопоставляется с индикатором состояния, чувствительным ко времени («скоро открытие», «открытие», «скоро закрытие», «закрыто»).

```javascript
/**
 * Сравните данное точное время с часами работы предприятия, расположенного в
 * определенный часовой пояс и возвращает строку, указывающую, является ли компания
 * открыт, закрыт, скоро откроется или скоро закроется. Длина слова «скоро» может быть
 * управляется с помощью параметра `soonWindow`.
 *
 * @param {Temporal.ZonedDateTime} now — Date и время рассмотрения
 * открыт ли бизнес
 * @param {(Object|null)[]} businessHours — массив длиной 7, указывающий
 * часы работы в будние дни
 * @param {Temporal.PlainTime} businessHours — время, в которое бизнес
 * открывается
 * @param {Temporal.PlainTime} businessHours — время, в которое бизнес
 * закрывается
 * @param {Temporal.Duration} soonWindow — Промежуток времени до открытия
 * или время закрытия, в течение которого бизнес следует считать «открывающимся».
 * скоро» или «скоро закроется»
 * @returns {string} "открыто", "закрыто", "скоро открытие" или "скоро закрытие"
 */
function getBusinessOpenStateText(now, businessHours, soonWindow) {
    const compare = Temporal.ZonedDateTime.compare;
    function inRange(zdt, start, end) {
        return compare(zdt, start) >= 0 && compare(zdt, end) < 0;
    }

    // Поскольку время приближается к полуночи, нам, возможно, придется рассмотреть
    // вчерашние и завтрашние часы тоже
    for (const delta of [-1, 0]) {
        const openDate = now.toPlainDate().add({ days: delta });
        // преобразовать день недели (1..7) в индекс, начинающийся с 0, для массива:
        const index = (openDate.dayOfWeek + 7) % 7;
        if (!businessHours[index]) continue;

        const timeZone = now.timeZoneId;
        const { open: openTime, close: closeTime } = businessHours[index];
        const open = openDate.toZonedDateTime({
            plainTime: openTime,
            timeZone,
        });
        const isWrap = Temporal.PlainTime.compare(closeTime, openTime) < 0;
        const closeDate = isWrap ? openDate.add({ days: 1 }) : openDate;
        const close = closeDate.toZonedDateTime({
            plainTime: closeTime,
            timeZone,
        });

        if (inRange(now, open, close)) {
            return compare(now, close.subtract(soonWindow)) >= 0
                ? 'closing soon'
                : 'open';
        }
        if (inRange(now.add(soonWindow), open, close)) return 'opening soon';
    }
    return 'closed';
}

// Например, часы работы ресторана или бара могут превышать указанное время.
// полночь; убедитесь, что это обрабатывается правильно
const businessHours = [
    /*Солнце */ {
        open: Temporal.PlainTime.from('13:00'),
        close: Temporal.PlainTime.from('20:30'),
    },
    /*Пн */ null, // закрыто по понедельникам
    /*Вт */ {
        open: Temporal.PlainTime.from('11:00'),
        close: Temporal.PlainTime.from('20:30'),
    },
    /*Обвенчались */ {
        open: Temporal.PlainTime.from('11:00'),
        close: Temporal.PlainTime.from('20:30'),
    },
    /*Чт */ {
        open: Temporal.PlainTime.from('11:00'),
        close: Temporal.PlainTime.from('22:00'),
    },
    /*Пт */ {
        open: Temporal.PlainTime.from('11:00'),
        close: Temporal.PlainTime.from('00:00'),
    },
    /*Суббота */ {
        open: Temporal.PlainTime.from('11:00'),
        close: Temporal.PlainTime.from('02:00'),
    },
];

const now = Temporal.ZonedDateTime.from(
    '2019-04-07T00:00+02:00[Europe/Berlin]',
);
const soonWindow = Temporal.Duration.from({ minutes: 30 });
const saturdayNightState = getBusinessOpenStateText(
    now,
    businessHours,
    soonWindow,
);
assert.equal(saturdayNightState, 'open');

const lastCall = now.add({ hours: 1, minutes: 50 });
assert.equal(lastCall.toString(), '2019-04-07T01:50:00+02:00[Europe/Berlin]');
const lastCallState = getBusinessOpenStateText(
    lastCall,
    businessHours,
    soonWindow,
);
assert.equal(lastCallState, 'closing soon');

const tuesdayEarly = now.add({ days: 2, hours: 6 });
const tuesdayEarlyState = getBusinessOpenStateText(
    tuesdayEarly,
    businessHours,
    soonWindow,
);
assert.equal(tuesdayEarlyState, 'closed');
```

### Прибытие/вылет/продолжительность рейса

Сопоставьте время отправления и прибытия локализованной поездки с продолжительностью поездки в единицах, не превышающих часов. (По умолчанию различия между экземплярами ZonedDateTime представляют собой точные различия в единицах времени.)

```javascript
const departure = Temporal.ZonedDateTime.from(
    '2020-03-08T11:55:00+08:00[Asia/Hong_Kong]',
);
const arrival = Temporal.ZonedDateTime.from(
    '2020-03-08T09:50:00-07:00[America/Los_Angeles]',
);

const flightTime = departure.until(arrival);

assert.equal(flightTime.toString(), 'PT12H55M');
```

Учитывая время отправления с часовым поясом и продолжительность полета, получите время прибытия в часовом поясе пункта назначения, используя математические вычисления с учетом часового пояса.

```javascript
const departure = Temporal.ZonedDateTime.from(
    '2020-03-08T11:55:00+08:00[Asia/Hong_Kong]',
);
const flightTime = Temporal.Duration.from({ minutes: 775 });

const arrival = departure.add(flightTime).withTimeZone('America/Los_Angeles');

assert.equal(
    arrival.toString(),
    '2020-03-08T09:50:00-07:00[America/Los_Angeles]',
);
```

### Отодвинуть дату запуска {#move-launch-date}

Добавьте количество дней, которое потребовалось для получения одобрения, и перейдите к началу следующего месяца.

```javascript
/**
 * Возьмите дату, добавьте задержку на несколько дней и округлите до начала следующего.
 * месяц.
 *
 * @param {Temporal.PlainDate} date — исходная дата.
 * @param {number} delayDays
 * @returns {Temporal.PlainDate} — Начало следующего месяца после задержки
 */
function plusAndRoundToMonthStart(date, delayDays) {
    return date
        .add({ days: delayDays })
        .add({ months: 1 }) //при необходимости ограничивается концом месяца, например. 31 января -> 28 февраля
        .with({ day: 1 });
}

const oldLaunchDate = Temporal.PlainDate.from('2019-06-01');

const fifteenDaysDelay = plusAndRoundToMonthStart(oldLaunchDate, 15);
assert.equal(fifteenDaysDelay.toString(), '2019-07-01');

const sixtyDaysDelay = plusAndRoundToMonthStart(oldLaunchDate, 60);
assert.equal(sixtyDaysDelay.toString(), '2019-08-01');
```

### Запланируйте напоминание перед достижением рекордной продолжительности

Рассматривая рекорд (например, личное лучшее время в спорте), вы можете захотеть получить предупреждение непосредственно перед тем, как рекорд вот-вот будет побит. В этом примере используется запись как `Temporal.Duration`, точное время начала текущей попытки как `Temporal.Instant` и еще один `Temporal.Duration`, указывающий, сколько времени осталось до потенциально рекордного точного времени, когда вы хотели бы получить предупреждение. Он возвращает точное время, когда может быть отправлено уведомление, например: «Продолжайте! Еще 5 минут, и это будет ваш личный рекорд!»

Это можно использовать для отслеживания тренировок, гонок (включая гонки на длинные дистанции и, возможно, с пересечением часовых поясов, такие как Bullrun Rally, Iditarod, Self-Transcendence 3100 и Clipper Round The World) или даже для открытых аналогов, таких как ежедневные «полосы» событий.

```javascript
/**
 * Получите точное время, в которое необходимо заранее уведомить о записи, которая
 * потенциально вот-вот сломается.
 *
 * @param {Temporal.Instant} start — точное время начала события.
 * @param {Temporal.Duration} previousRecord — существующий рекорд, который необходимо побить
 * @param {Temporal.Duration} noticeWindow — время предварительного уведомления
 * @returns {Temporal.Instant} Точное время, в которое необходимо заранее уведомить
 * побив рекорд
 */
function getInstantBeforeOldRecord(start, previousRecord, noticeWindow) {
    return start.add(previousRecord).subtract(noticeWindow);
}

// Старт мужского забега на 10 000 метров на Олимпийских играх 2016 года в Рио-де-Жанейро.
const raceStart = Temporal.Instant.from(
    '2016-08-13T21:27-03:00[America/Sao_Paulo]',
);
// Мировой рекорд Кенениса Бекеле установлен в 2005 году.
const record = Temporal.Duration.from({
    minutes: 26,
    seconds: 17,
    milliseconds: 530,
});
const noticeWindow = Temporal.Duration.from({ minutes: 1 });
// Пришло время отправить сообщение: «Поторопитесь, сможете ли вы закончить гонку за 1 минуту?» толкать
// уведомление всем участникам
const reminderAt = getInstantBeforeOldRecord(raceStart, record, noticeWindow);

assert.equal(reminderAt.toString(), '2016-08-14T00:52:17.53Z');
```

### N-й день недели месяца

Пример получения `Temporal.PlainDate`, представляющего первый вторник данного `Temporal.PlainYearMonth`, который можно адаптировать к другим дням недели.

```javascript
/**
 * Получает первый вторник месяца и возвращает его дату.
 *
 * @param {Temporal.PlainYearMonth} queriedMonth — экземпляр YearMonth для запроса
 * @returns {Temporal.PlainDate} Temporal.PlainDate Экземпляр, который выдает первый вторник
 */
function getFirstTuesday(queriedMonth) {
    // Сначала нам нужно преобразовать в дату
    const firstOfMonth = queriedMonth.toPlainDate({ day: 1 });

    // У нас понедельник = 1, воскресенье = 7, и мы хотим добавить положительное число.
    // меньше 7, чтобы попасть в первый вторник.
    // Если у нас уже вторник (2), мы хотим добавить 0.
    // Итак, для первого числа месяца с понедельника по воскресенье дополнения следующие:
    // 1, 0, 6, 5, 4, 3, 2, что определяется этой формулой.
    // Эта таблица поиска облегчает чтение примера, но вы также можете
    // вычислить ответ: (7 + желаемый день недели - firstOfMonth.dayOfWeek) % 7
    return firstOfMonth.add({
        days: [1, 0, 6, 5, 4, 3, 2][firstOfMonth.dayOfWeek - 1],
    });
}

const myMonth = Temporal.PlainYearMonth.from('2020-02');
const firstTuesdayOfMonth = getFirstTuesday(myMonth);
assert.equal(firstTuesdayOfMonth.toString(), '2020-02-04');
assert.equal(firstTuesdayOfMonth.dayOfWeek, 2);

// Аналогично, чтобы получить второй вторник:
const secondWeek = myMonth.toPlainDate({ day: 8 });
const secondTuesday = secondWeek.add({
    days: [1, 0, 6, 5, 4, 3, 2][secondWeek.dayOfWeek - 1],
});
assert.equal(secondTuesday.day, firstTuesdayOfMonth.day + 7);

// И последний вторник:
const lastOfMonth = myMonth.toPlainDate({ day: myMonth.daysInMonth });
const lastTuesday = lastOfMonth.subtract({
    days: [6, 0, 1, 2, 3, 4, 5][lastOfMonth.dayOfWeek - 1],
});
assert.equal(lastTuesday.toString(), '2020-02-25');
assert.equal(lastTuesday.dayOfWeek, 2);
// или:
const lastTuesday2 = lastOfMonth.subtract({
    days: (7 + lastOfMonth.dayOfWeek - 2) % 7,
});
assert.equal(Temporal.PlainDate.compare(lastTuesday, lastTuesday2), 0);
```

Учитывая экземпляр `Temporal.PlainYearMonth` и порядковый номер календарного дня недели ISO 8601 в диапазоне от 1 (понедельник) до 7 (воскресенье), верните хронологически упорядоченный массив экземпляров `Temporal.PlainDate`, соответствующих каждому дню месяца, который является указанным днем ​​недели (которых всегда будет четыре или пять).

```javascript
/**
 * Получает массив Temporal.PlainDates каждого дня заданного месяца, выпадающего на
 * в данный день недели.
 *
 * @param {Temporal.PlainYearMonth} yearMonth
 * @param {number} dayNumberOfTheWeek — день недели, понедельник=1, воскресенье=7.
 * @returns {Temporal.PlainDate[]} Массив дат
 */
function getWeeklyDaysInMonth(yearMonth, dayNumberOfTheWeek) {
    const firstOfMonth = yearMonth.toPlainDate({ day: 1 });
    let nextWeekday = firstOfMonth.add({
        days: (7 + dayNumberOfTheWeek - firstOfMonth.dayOfWeek) % 7,
    });
    const result = [];
    while (nextWeekday.month === yearMonth.month) {
        result.push(nextWeekday);
        nextWeekday = nextWeekday.add({ days: 7 });
    }
    return result;
}

assert.equal(
    getWeeklyDaysInMonth(Temporal.PlainYearMonth.from('2020-02'), 1).join(' '),
    '2020-02-03 2020-02-10 2020-02-17 2020-02-24',
);
assert.equal(
    getWeeklyDaysInMonth(Temporal.PlainYearMonth.from('2020-02'), 6).join(' '),
    '2020-02-01 2020-02-08 2020-02-15 2020-02-22 2020-02-29',
);
```

Учитывая экземпляр `Temporal.PlainDate`, верните количество предыдущих дней в этом месяце, которые совпадают с его днем ​​недели.

```javascript
/**
 * Получает количество предшествующих дней в том же месяце, что и `date`, которые приходятся на
 * тот же день недели, что и `date`.
 *
 * @param {Temporal.PlainDate} date — дата начала.
 * @returns {number} Количество дней
 */
function countPrecedingWeeklyDaysInMonth(date) {
    // На самом деле для этого не требуется Temporal.
    return Math.floor((date.day - 1) / 7);
}

assert.equal(
    countPrecedingWeeklyDaysInMonth(Temporal.PlainDate.from('2020-02-28')),
    3,
);
assert.equal(
    countPrecedingWeeklyDaysInMonth(Temporal.PlainDate.from('2020-02-29')),
    4,
);
```

### Управление днем ​​месяца

Вот несколько примеров использования существующей даты и настройки дня месяца.

```javascript
const date = Temporal.PlainDate.from('2020-05-31');

// Та же дата и время, но в феврале.
// (и используйте последний день, если дата не существует в феврале):

const feb = date.with({ month: 2 });

assert.equal(feb.toString(), '2020-02-29');

// Та же дата и время, но в апреле.
// (и выдать исключение, если дата не существует в апреле):

assert.throws(() => {
    date.with({ month: 4 }, { overflow: 'reject' });
});
```

### Тот же день в другом месяце

Аналогично, вот несколько примеров использования существующей даты и корректировки месяца, но с сохранением дня и года.

В зависимости от желаемого поведения вам нужно будет выбрать правильный параметр `overflow`, но значение по умолчанию `'constrain'` должно быть правильным в большинстве случаев.

```javascript
const date = Temporal.PlainDate.from('2020-05-31');

// Same date and time, but in February
// (and use the last day if the date doesn't exist in February):

const feb = date.with({ month: 2 });

assert.equal(feb.toString(), '2020-02-29');

// Same date and time, but in April
// (and throw an exception if the date doesn't exist in April):

assert.throws(() => {
    date.with({ month: 4 }, { overflow: 'reject' });
});
```

### Следующее событие недели

Из экземпляра `Temporal.ZonedDateTime` получите `Temporal.ZonedDateTime`, представляющий следующее возникновение еженедельного события, запланированного на определенный день недели и время в определенном часовом поясе. (Например, «еженедельно по четвергам в 08:45 по калифорнийскому времени»).

```javascript
/**
 * Возвращает местную дату и время следующего еженедельного события.
 * событие.
 *
 * @param {Temporal.ZonedDateTime} now — отправная точка
 * @param {number} weekday — событие рабочего дня происходит в (понедельник=1, воскресенье=7).
 * @param {Temporal.PlainTime} eventTime — событие времени происходит в
 * @param {string} eventTimeZone — часовой пояс, в котором запланировано событие.
 * @returns {Temporal.ZonedDateTime} Локальная дата и время следующего события
 */
function nextWeeklyOccurrence(now, weekday, eventTime, eventTimeZone) {
    const nowInEventTimeZone = now.withTimeZone(eventTimeZone);
    const nextDate = nowInEventTimeZone
        .toPlainDate()
        .add({ days: (weekday + 7 - nowInEventTimeZone.dayOfWeek) % 7 });
    let nextOccurrence = nextDate.toZonedDateTime({
        plainTime: eventTime,
        timeZone: eventTimeZone,
    });

    // Обработка случая, когда событие произошло сегодня, но уже произошло.
    if (Temporal.ZonedDateTime.compare(now, nextOccurrence) > 0) {
        nextOccurrence = nextOccurrence.add({ weeks: 1 });
    }

    return nextOccurrence.withTimeZone(now.timeZoneId);
}

// «Еженедельно по четвергам в 08:45 по калифорнийскому времени»:
const weekday = 4;
const eventTime = Temporal.PlainTime.from('08:45');
const eventTimeZone = 'America/Los_Angeles';

const rightBefore = Temporal.ZonedDateTime.from(
    '2020-03-26T15:30+00:00[Europe/London]',
);
let next = nextWeeklyOccurrence(rightBefore, weekday, eventTime, eventTimeZone);
assert.equal(next.toString(), '2020-03-26T15:45:00+00:00[Europe/London]');

const rightAfter = Temporal.ZonedDateTime.from(
    '2020-03-26T16:00+00:00[Europe/London]',
);
next = nextWeeklyOccurrence(rightAfter, weekday, eventTime, eventTimeZone);
assert.equal(next.toString(), '2020-04-02T16:45:00+01:00[Europe/London]');
```

### День недели ежегодного события

В некоторых странах, когда государственный праздник приходится на вторник или четверг, в понедельник или пятницу отмечается дополнительный «мостовой» государственный праздник, чтобы дать работникам длинные выходные. В следующем примере это вычисляется.

```javascript
/**
 * Рассчитывает дни, которые необходимо взять с работы, чтобы иметь длительный отпуск.
 * выходные в связи с государственным праздником, «соединяя» праздник, если он выпадает на
 * Вторник или четверг.
 *
 * Праздник @param {Temporal.PlainMonthDay} – дата года в календаре.
 * @param {number} year — год, в котором рассчитывается количество дней моста.
 * @returns {Temporal.PlainDate[]} Список дат, в которые можно не работать
 */
function bridgePublicHolidays(holiday, year) {
    const date = holiday.toPlainDate({ year });
    switch (date.dayOfWeek) {
        case 1: //Пн.
        case 3: //Обвенчались
        case 5: //Пт
            return [date];
        case 2: //Вт; возьми выходной в понедельник
            return [date.subtract({ days: 1 }), date];
        case 4: //Чт; взять выходной в пятницу
            return [date, date.add({ days: 1 })];
        case 6: //Суббота
        case 7: //Солнце
            return [];
    }
}

const labourDay = Temporal.PlainMonthDay.from('05-01');

// День без моста
assert.deepEqual(
    bridgePublicHolidays(labourDay, 2020).map((d) => d.toString()),
    ['2020-05-01'],
);

// День моста
assert.deepEqual(
    bridgePublicHolidays(labourDay, 2018).map((d) => d.toString()),
    ['2018-04-30', '2018-05-01'],
);

// Не повезло, праздник уже на выходных
assert.deepEqual(
    bridgePublicHolidays(labourDay, 2021).map((d) => d.toString()),
    [],
);
```

## Расширенные варианты использования

Ожидается, что они не будут частью обычного использования `Temporal`, но демонстрируют некоторые необычные вещи, которые можно сделать с помощью `Temporal`. Поскольку они обычно больше, чем рецепты кулинарной книги, они находятся на отдельных страницах.

### Дополнительные годы

Расширьте `Temporal` для поддержки лет произвольного размера (например, **+635427810-02-02**) для астрономических целей.

**Пример расширенного года**

Это пример подхода к расширению Temporal для поддержки лет произвольного размера (например, **+635427810-02-02**) для астрономических целей.

Код ниже — это всего лишь пример, показывающий, как это можно сделать. Чтобы сделать это полностью, потребуется добавить поддержку Temporal.Instant и Temporal.ZonedDateTime и переопределить больше методов.

Например, в этом примере арифметика не будет работать правильно.

> **ПРИМЕЧАНИЕ**: Это очень специализированное использование Temporal, и вам обычно не придется это делать. Специальная сторонняя библиотека может быть лучшим решением этой проблемы.

```javascript
function bigIntAbs(n) {
    if (n < 0n) return -n;
    return n;
}

// Годы не ограничены, но для целей вывода мы предполагаем 10 цифр,
// потому что ISO 8601 требует расширенного формата года, чтобы выбрать последовательный
// количество цифр.
function formatExpandedYear(year) {
    let yearString;
    if (year < 0 || year > 9999) {
        let sign = year < 0 ? '-' : '+';
        let yearNumber = bigIntAbs(year);
        yearString = sign + `${yearNumber}`.padStart(10, '0');
    } else {
        yearString = `${year}`.padStart(4, '0');
    }
    return yearString;
}

function isLeapYear(year) {
    const isDiv4 = year % 4n === 0n;
    const isDiv100 = year % 100n === 0n;
    const isDiv400 = year % 400n === 0n;
    return isDiv4 && (!isDiv100 || isDiv400);
}

// Это проверяет, соответствует ли строка ISO нашему 10-значному расширенному году.
// формат, и если да, то возвращает как расширенный год как BigInt, так и новый
// ISO строка с годом в диапазоне, который можно передать в оригинал.
// Temporal Функции анализа строк.
// Годом в диапазоне является 1972 год, если расширенный год является високосным, и
// в противном случае 1970 год, так что правила для 29 февраля остаются верными.
// См. примечание о количестве цифр в formatExpandedYear().
function parseExpandedYear(isoString) {
    const matchExpandedYear = /^[-+\u2212]\d{10}/;
    const result = matchExpandedYear.exec(isoString);
    if (!result) return { isoString };
    const expandedYear = BigInt(result[0]);
    const isoYear = isLeapYear(expandedYear) ? 1972 : 1970;
    return {
        expandedYear,
        isoString: isoString.replace(matchExpandedYear, isoYear.toString()),
    };
}

// Это карта объектов Temporal с указанием их расширенного года (как BigInt).
// Модель данных состоит из объекта Temporal (с установленным годом ISO).
// внутри страны до 1970 или 1972 года) и расширенный год. Эта карта используется для
// связывайте объекты Temporal с их расширенными годами вместо определения
// дополнительные свойства объекта Temporal.
const expandedYears = new WeakMap();

class ExpandedPlainDate extends Temporal.PlainDate {
    // Версии расширенного года типов Temporal ограничены использованием
    // ISO 8601 календарь.
    constructor(year, isoMonth, isoDay) {
        year = BigInt(year);
        const isoYear = isLeapYear(year) ? 1972 : 1970;
        super(isoYear, isoMonth, isoDay, 'iso8601');
        expandedYears.set(this, year);
    }

    static _convert(plainDate, expandedYear) {
        if (plainDate instanceof ExpandedPlainDate) return plainDate;
        const iso = plainDate.withCalendar('iso8601');
        return new ExpandedPlainDate(expandedYear, iso.month, iso.day);
    }

    static from(item) {
        if (typeof item === 'string') {
            const { expandedYear, isoString } = parseExpandedYear(item);
            item = Temporal.PlainDate.from(isoString);
            if (expandedYear) return this._convert(item, expandedYear);
        }
        if (item instanceof Temporal.PlainDate) {
            return this._convert(item, BigInt(item.year));
        }
        const expandedYear = BigInt(item.year);
        const isoYear = isLeapYear(expandedYear) ? 1972 : 1970;
        const result = super.from({ ...item, year: isoYear });
        return this._convert(result, expandedYear);
    }

    // Это переопределяет свойство .year и вместо этого возвращает расширенный год. Если
    // вы делали это с помощью календаря, вместо этого вам нужно было бы создать
    // отдельное поле. (Но у Instant нет календаря, так что решение
    // не сможет полностью раскрыть Temporal.)
    get year() {
        return expandedYears.get(this);
    }

    toString() {
        const year = formatExpandedYear(this.year);
        const iso = this.withCalendar('iso8601');
        const month = `${iso.month}`.padStart(2, '0');
        const day = `${iso.day}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

class ExpandedPlainDateTime extends Temporal.PlainDateTime {
    constructor(
        year,
        isoMonth,
        isoDay,
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond,
    ) {
        year = BigInt(year);
        const isoYear = isLeapYear(year) ? 1972 : 1970;
        super(
            isoYear,
            isoMonth,
            isoDay,
            hour,
            minute,
            second,
            millisecond,
            microsecond,
            nanosecond,
            'iso8601',
        );
        expandedYears.set(this, year);
    }

    static _convert(plainDateTime, expandedYear) {
        if (plainDateTime instanceof ExpandedPlainDateTime)
            return plainDateTime;
        const iso = plainDateTime.withCalendar('iso8601');
        return new ExpandedPlainDateTime(
            expandedYear,
            iso.month,
            iso.day,
            plainDateTime.hour,
            plainDateTime.minute,
            plainDateTime.second,
            plainDateTime.millisecond,
            plainDateTime.microsecond,
            plainDateTime.nanosecond,
        );
    }

    static from(item) {
        if (typeof item === 'string') {
            const { expandedYear, isoString } = parseExpandedYear(item);
            item = Temporal.PlainDateTime.from(isoString);
            if (expandedYear) return this._convert(item, expandedYear);
        }
        if (item instanceof Temporal.PlainDateTime) {
            return this._convert(item, BigInt(item.year));
        }
        const expandedYear = BigInt(item.year);
        const isoYear = isLeapYear(expandedYear) ? 1972 : 1970;
        const result = super.from({ ...item, year: isoYear });
        return this._convert(result, expandedYear);
    }

    get year() {
        return expandedYears.get(this);
    }

    toString(options = {}) {
        const dateString = this.toPlainDate().toString({
            ...options,
            showCalendar: 'never',
        });
        const timeString = this.toPlainTime().toString(options);
        return `${dateString}T${timeString}`;
    }

    toPlainDate() {
        return ExpandedPlainDate._convert(super.toPlainDate(), this.year);
    }
}

function makeExpandedTemporal() {
    return {
        ...Temporal,
        PlainDate: ExpandedPlainDate,
        PlainDateTime: ExpandedPlainDateTime,
    };
}

const ExpandedTemporal = makeExpandedTemporal();

const date = ExpandedTemporal.PlainDate.from({
    year: 635427810,
    month: 2,
    day: 2,
});
assert.equal(date.toString(), '+0635427810-02-02');
const dateFromString = ExpandedTemporal.PlainDateTime.from(
    '-0075529144-02-29T12:53:27.55',
);
assert.equal(dateFromString.year, -75529144n);
```

### Регулируемый календарь Хиджры

Расширьте `Temporal` для поддержки корректирующих дней для календарей Хиджры, которые иногда требуются, когда начало месяца основано на астрономических наблюдениях.

**Изменения в дни Хиджры**

В этом примере демонстрируется подход к настройке отображения дат хиджры в Temporal путем реализации класса `AdjustableHijriTemporal`. Этот класс позволяет сдвигать даты хиджры вперед или назад на указанное количество дней.

Код ниже демонстрирует, как:

1.  Синхронизируйте отображаемые даты хиджры с местными календарями хиджры.
2.  Содействовать использованию альтернативных календарных эпох Хиджры.

Ключевые особенности этой реализации:

- Настраивает отображение дат Хиджры без изменения базовой календарной системы.
- Применяет простую дневную смену без изменения длины месяца или других календарных правил.
- Обеспечивает визуальное выравнивание для различных вариантов календаря Хиджры.

> **ПРИМЕЧАНИЕ**. Этот пример предназначен для базовой корректировки даты Хиджры и визуального выравнивания. Он не реализует комплексную настройку календаря или подробные варианты календаря Хиджры. Для более сложных корректировок или вариантов календаря Хиджры потребуется более сложная реализация.

```javascript
/* eslint-disable no-console */
import * as Temporal from './polyfill/lib/temporal.mjs';

/**
 * AdjustableHijriTemporal: класс для настройки отображения даты Хиджры.
 *
 * Этот класс позволяет корректировать даты Хиджры, сдвигая дни вперед или назад.
 * Он предназначен для:
 * 1. Помогите пользователям синхронизировать отображаемые даты хиджры с местным календарем хиджры.
 * 2. Содействовать использованию альтернативных календарных эпох Хиджры.
 *
 * Ключевые моменты:
 * - Он настраивает отображение дат Хиджры без изменения базовой календарной системы.
 * - Корректировка представляет собой простую дневную смену и не меняет продолжительность месяцев или другие календарные правила.
 * - Этот подход полезен для визуального выравнивания, но не обеспечивает комплексного подхода.
 * настройка календаря или подробные варианты календаря Хиджры.
 *
 * Примечание. Для более сложных корректировок или вариантов календаря Хиджры используйте более сложный
 * реализация будет необходима.
 */

class AdjustableHijriTemporal {
    #temporal;
    #daysToShift;
    #adjustedDate;

    constructor(temporal, calendar = 'islamic-umalqura', daysToShift = 0) {
        this.#temporal = temporal.withCalendar(calendar);
        this.#daysToShift = daysToShift;
        this.#adjustedDate = this.#temporal.add({ days: this.#daysToShift });
    }

    get day() {
        return this.#adjustedDate.day;
    }
    get dayOfWeek() {
        return this.#temporal.dayOfWeek;
    }
    get dayOfYear() {
        return this.#adjustedDate.dayOfYear;
    }
    get daysInMonth() {
        return this.#adjustedDate.daysInMonth;
    }
    get daysInYear() {
        return this.#adjustedDate.daysInYear;
    }
    get month() {
        return this.#adjustedDate.month;
    }
    get monthCode() {
        return this.#adjustedDate.monthCode;
    }
    get monthsInYear() {
        return this.#adjustedDate.monthsInYear;
    }
    get year() {
        return this.#adjustedDate.year;
    }
    get inLeapYear() {
        return this.#adjustedDate.inLeapYear;
    }

    toString(options) {
        return this.#adjustedDate.toString(options);
    }

    toJSON() {
        return this.#adjustedDate.toJSON();
    }

    toLocaleString(locales, options) {
        const formatter = new Intl.DateTimeFormat(locales, options);
        const originalParts = formatter.formatToParts(this.#temporal);
        const adjustedParts = formatter.formatToParts(this.#adjustedDate);
        for (let i = 0; i < adjustedParts.length; i++) {
            if (adjustedParts[i].type === 'weekday') {
                adjustedParts[i].value = originalParts[i].value;
                break;
            }
        }
        return adjustedParts.map((part) => part.value).join('');
    }

    add(durationLike, options) {
        return this.#adjustedDate.add(durationLike, options);
    }

    subtract(durationLike, options) {
        return this.#adjustedDate.subtract(durationLike, options);
    }

    until(other, options) {
        return this.#adjustedDate.until(other, options);
    }

    since(other, options) {
        return this.#adjustedDate.since(other, options);
    }

    with(dateLike, options) {
        return this.#adjustedDate.with(dateLike, options);
    }

    withCalendar(calendar) {
        return this.#adjustedDate.withCalendar(calendar);
    }

    equals(other) {
        if (other instanceof AdjustableHijriTemporal)
            return this.#adjustedDate.equals(other.#adjustedDate);

        return this.#adjustedDate.equals(other);
    }
}

const Hdate = new Temporal.PlainDate(2024, 7, 6, 'islamic-umalqura');
const AHdate = new AdjustableHijriTemporal(Hdate, 'islamic-umalqura', 1);

console.log(
    Hdate.day,
    Hdate.dayOfWeek,
    Hdate.month,
    Hdate.year,
    Hdate.toLocaleString('en-SG', {
        dateStyle: 'full',
        calendar: 'islamic-umalqura',
    }),
); //30 6 12 14:45 Суббота, 30 зуль-хиджа 14:45 хиджры
console.log(
    AHdate.day,
    AHdate.dayOfWeek,
    AHdate.month,
    AHdate.year,
    AHdate.toLocaleString('en-SG', {
        dateStyle: 'full',
        calendar: 'islamic-umalqura',
    }),
); //1 6 1 1446 Суббота, 1 Мухаррам 1446 года хиджры
```

### Непальский календарь

Реализация непальского календаря в пользовательском пространстве. Этот календарь в настоящее время не встроен в среду JS. Это служит примером того, как создать поддержку календарей, которые не получили широкого распространения в браузерах.

Поддержка непальского календаря в настоящее время не встроена в среды JS. В этом примере показано, как реализовать собственный календарь с помощью Temporal, создав для этого календаря класс даты, который работает как PlainDate и может использоваться как пакет свойств PlainDate.

```javascript
/**
 * Эта реализация основана на библиотеке World-Calendars Кейта Вуда:
 * https://github.com/kbwood/world-calendars
 * И мультикалендарные даты, которые изначально реализовали пользовательский Temporal.Calendar:
 * https://github.com/dhis2/multi-calendar-dates/blob/main/src/custom-calendars/nepaliCalendar.ts
 */

/**
 * Сначала немного данных по непальскому календарю. (Просто прокрутите мимо этого.)
 *
 * - Ключевой (1970...) - непальский год.
 * - В первой колонке указано, с какого дня в Пауше начинается год.
 * - Год всегда начинается с Пауша (9-го месяца), но он где-то есть.
 * с 17 по 19 числа Пауша.
 * - Остальные 12 столбцов показывают, сколько дней в каждом месяце.
 *
 * Данные идут с 1970 года (1913 год по календарю ISO) до 2100 года (2044 год по календарю ISO).
 * сокращенный диапазон, реальная реализация календаря должна иметь больше данных.
 */
var NEPALI_CALENDAR_DATA = {
    // Эти данные взяты из http://www.ashesh.com.np.
    1970: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1971: [18, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    1972: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1973: [19, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1974: [19, 31, 31, 32, 30, 31, 31, 30, 29, 30, 29, 30, 30],
    1975: [18, 31, 31, 32, 32, 30, 31, 30, 29, 30, 29, 30, 30],
    1976: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1977: [18, 31, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    1978: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1979: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1980: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1981: [18, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1982: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1983: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1984: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1985: [18, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1986: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1987: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1988: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1989: [18, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1990: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1991: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    // Эти данные взяты из http://nepalicalendar.rat32.com/index.php.
    1992: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1993: [18, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1994: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1995: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1996: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1997: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1998: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1999: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2000: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2001: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2002: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2003: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2004: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2005: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2006: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2007: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2008: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2009: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2010: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2011: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2012: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2013: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2014: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2015: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2016: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2017: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2018: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2019: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2020: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2021: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2022: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2023: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2024: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2025: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2026: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2027: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2028: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2029: [18, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2030: [17, 31, 32, 31, 32, 31, 30, 30, 30, 30, 30, 30, 31],
    2031: [17, 31, 32, 31, 32, 31, 31, 31, 31, 31, 31, 31, 31],
    2032: [17, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32],
    2033: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2034: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2035: [17, 30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2036: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2037: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2038: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2039: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2040: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2041: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2042: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2043: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2044: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2045: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2046: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2047: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2048: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2049: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2050: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2051: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2052: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2053: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2054: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2055: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 29, 30],
    2056: [17, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2057: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2058: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2059: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2060: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2061: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2062: [17, 30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    2063: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2064: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2065: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2066: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2067: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2068: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2069: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2070: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2071: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2072: [17, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2073: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2074: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2075: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2076: [16, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2077: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2078: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2080: [16, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    // Эти данные взяты из http://www.ashesh.com.np/nepali-calendar/.
    2081: [17, 31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2082: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2083: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2084: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2085: [17, 31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
    2086: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2087: [16, 31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    2088: [16, 30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    2089: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2090: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2091: [16, 31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    2092: [16, 31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2093: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2094: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2095: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    2096: [17, 30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2097: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2098: [17, 31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30, 31],
    2099: [17, 31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
    2100: [17, 31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

// Помощники для использования таблицы месяцев
const supportedNepaliYears = Object.keys(NEPALI_CALENDAR_DATA);
const firstSupportedNepaliYear = Number(supportedNepaliYears[0]);
const lastSupportedNepaliYear = Number(
    supportedNepaliYears[supportedNepaliYears.length - 1],
);
function getNepaliYearData(nepaliYear) {
    if (
        nepaliYear < firstSupportedNepaliYear ||
        nepaliYear > lastSupportedNepaliYear
    ) {
        throw new Error(
            `Conversions are only possible between ${firstSupportedNepaliYear}` +
                ` and ${lastSupportedNepaliYear} in Nepali calendar`,
        );
    }
    return NEPALI_CALENDAR_DATA[nepaliYear];
}

class NepaliPlainDate {
    #iso; //Базовый экземпляр Temporal.PlainDate, использующий календарь ISO.
    constructor(isoYear, isoMonth, isoDay) {
        this.#iso = new Temporal.PlainDate(isoYear, isoMonth, isoDay);
    }

    get calendarId() {
        return 'nepali'; //Обратите внимание, что это не встроенный идентификатор календаря.
    }

    // эра и эраГод не реализованы; судя по данным локализации, похоже, что там
    // это эпоха в непальском календаре, но только эта реализация календаря
    // в любом случае поддерживает небольшой диапазон лет.
    get year() {
        return this.#isoToNepali().year;
    }
    get month() {
        return this.#isoToNepali().month;
    }
    get monthCode() {
        return `M${this.month.toString().padStart(2, '0')}`;
    }
    get day() {
        return this.#isoToNepali().day;
    }

    // dayOfWeek делегирует Temporal.PlainDate напрямую. Непальские календари кажутся
    // использовать дни недели ISO с локализованными названиями.
    get dayOfWeek() {
        return this.#iso.dayOfWeek;
    }
    get daysInWeek() {
        return 7;
    }

    get dayOfYear() {
        const { year, month, day } = this.#isoToNepali();
        const yearData = getNepaliYearData(year);
        let result = 0;
        for (let monthCounter = 1; monthCounter < month; monthCounter++) {
            result += yearData[monthCounter];
        }
        result += day;
        return result;
    }
    get weekOfYear() {
        return undefined;
    }
    get yearOfWeek() {
        return undefined;
    }
    get daysInMonth() {
        const { year, month } = this.#isoToNepali();
        const yearData = getNepaliYearData(year);
        return yearData[month];
    }
    get daysInYear() {
        const yearData = getNepaliYearData(this.year);
        let result = 0;
        for (let monthCounter = 1; monthCounter <= 12; monthCounter++) {
            result += yearData[monthCounter];
        }
        return result;
    }
    get monthsInYear() {
        return 12;
    }
    get inLeapYear() {
        return this.daysInYear !== 365;
    }

    // withCalendar делегирован непосредственно Temporal.PlainDate:
    withCalendar(calendar) {
        return this.#iso.withCalendar(calendar);
    }

    equals(other) {
        return other instanceof NepaliPlainDate && this.#iso.equals(other.#iso);
    }

    toString({ showCalendar = 'auto', ...options } = {}) {
        let result = this.#iso.toString({ ...options, showCalendar: 'never' });
        if (showCalendar !== 'never') {
            result += '[u-ca=nepali]';
        }
        return result;
        // Примечание. Если добавлено [u-ca=nepali], строку невозможно десериализовать.
        // Вы должны реализовать десериализацию в from().
    }

    toJSON() {
        return this.#iso.toString({ showCalendar: 'never' }) + '[u-ca=nepali]';
    }

    // Примечание: для краткости десериализация из строки и преобразование из
    // год-месяцКод-день не реализованы.
    static from(fields, { overflow = 'constrain' } = {}) {
        let { year: nepaliYear, month: nepaliMonth, day: nepaliDay } = fields;

        let yearData = getNepaliYearData(nepaliYear);
        const maxDay = yearData[nepaliMonth];
        if (nepaliDay > maxDay) {
            if (overflow === 'reject') {
                throw new RangeError(
                    `month ${nepaliMonth} has ${maxDay} days, not ${nepaliDay}`,
                );
            }
            nepaliDay = maxDay;
        }

        let isoDayOfYear = 0;

        let monthCounter = nepaliMonth;
        const isoYear =
            nepaliYear -
            (nepaliMonth > 9 || (monthCounter === 9 && nepaliDay >= yearData[0])
                ? 56
                : 57);

        // Сначала мы добавляем количество дней в фактическом непальском месяце как день
        // год в ISO, потому что, по крайней мере, эти дни прошли с 1 января.
        if (nepaliMonth !== 9) {
            isoDayOfYear = nepaliDay;
            monthCounter--;
        }

        // Теперь мы перебираем все непальские месяцы и добавляем количество дней к
        // isoDayOfYear. Делаем это, пока не достигнем Пауша (9-й месяц). 1 января
        // всегда выпадает на этот месяц.
        while (monthCounter !== 9) {
            if (monthCounter <= 0) {
                monthCounter = 12;
                nepaliYear--;
                yearData = getNepaliYearData(nepaliYear);
            }
            isoDayOfYear += yearData[monthCounter];
            monthCounter--;
        }

        // Если дата, которую необходимо преобразовать, находится в Пауше (месяц № 9), нам необходимо
        // сделать еще какой-нибудь расчет
        if (nepaliMonth === 9) {
            // Сложите дни, прошедшие с первого дня Пауша, и вычтите
            // количество дней между 1 января и 1 Паушем
            isoDayOfYear += nepaliDay - yearData[0];
            // В первые дни Пауша мы сейчас находимся в отрицательных значениях, потому что в
            // конце года ISO вычитаем 365 или 366 дней
            if (isoDayOfYear < 0) {
                isoDayOfYear += new Temporal.PlainDate(isoYear, 1, 1)
                    .daysInYear;
            }
        } else {
            isoDayOfYear += yearData[9] - yearData[0];
        }

        const isoDate = new Temporal.PlainDate(isoYear, 1, 1).add({
            days: isoDayOfYear,
        });
        return new NepaliPlainDate(isoDate.year, isoDate.month, isoDate.day);
    }

    // Используйте этот метод вместо PlainDate.withCalendar('nepali').
    static fromTemporalPlainDate(plainDate) {
        const iso = plainDate.withCalendar('iso8601');
        return new NepaliPlainDate(iso.year, iso.month, iso.day);
    }

    static compare(one, two) {
        return Temporal.PlainDate.compare(one, two);
    }

    #isoToNepali() {
        const isoDayOfYear = this.#iso.dayOfYear;
        let nepaliYear = this.#iso.year + 56;
        // Это не окончательно, это может быть и +57, но +56 всегда верно для 1 января.
        let yearData = getNepaliYearData(nepaliYear);

        // 1 января всегда приходится на непальский месяц Пауш, девятый месяц непальского языка.
        // календарь.
        let nepaliMonth = 9;

        // Получите непальский день в Пауше (9-й месяц) 1 января.
        const dayOfFirstJanInPaush = yearData[0];
        // Проверьте, сколько дней осталось до Пауша.
        // Дни рассчитываются с 1 января до конца фактического непальского месяца.
        // мы используем это значение, чтобы проверить, соответствует ли дата ISO реальному непальскому месяцу.
        let daysSinceJanFirstToEndOfNepaliMonth =
            yearData[nepaliMonth] - dayOfFirstJanInPaush + 1;

        // Если григорианский день года меньше или равен сумме дней
        // между 1 января и концом фактического непальского месяца у нас есть
        // нашел правильный непальский месяц.
        // Пример:
        // 4 февраля 2011 г. — isoDayOfYear 35 (31 день января + 4).
        // 1 января 2011 года по непальскому 2067 году, где 1 января — это
        // 17-й день Пауша (9-й месяц).
        // В 2067 году у Пауша 30 дней, значит (30-17+1=14) дней 14.
        // с 1 января до конца Пауша (включая 17 января).
        // isoDayOfYear (35) больше 14, поэтому мы проверяем следующий месяц.
        // Следующий непальский месяц (Манг) будет состоять из 29 дней.
        // 29+14=43, это больше, чем isoDayOfYear (35), поэтому мы нашли
        // правильный непальский месяц.
        while (isoDayOfYear > daysSinceJanFirstToEndOfNepaliMonth) {
            nepaliMonth++;
            if (nepaliMonth > 12) {
                nepaliMonth = 1;
                nepaliYear++;
                yearData = getNepaliYearData(nepaliYear);
            }
            daysSinceJanFirstToEndOfNepaliMonth += yearData[nepaliMonth];
        }
        // Последний шаг — вычислить непальский день месяца.
        // Продолжим наш предыдущий пример:
        // мы подсчитали, что с 1 января (17 Паушей) до конца 43 дня.
        // Манг (29 дней). Если мы вычтем из этих 43 дней день года
        // дата ISO (35), мы знаем, как далеко от конца искомый день
        // непальского месяца. Поэтому мы просто вычитаем это число из суммы
        // дней в этом месяце (30).
        const nepaliDayOfMonth =
            yearData[nepaliMonth] -
            (daysSinceJanFirstToEndOfNepaliMonth - isoDayOfYear);

        return { year: nepaliYear, month: nepaliMonth, day: nepaliDayOfMonth };
    }

    // Некоторые методы опущены для краткости:

    // with() может быть реализовано без особых проблем, но разрешение
    // Пара месяц/месяцКод занимает много места и не имеет особого значения
    // к этому примеру
    with(dateLike, { overflow = 'constrain' } = {}) {
        void this.#iso.with(dateLike, { overflow });
        throw new Error('not implemented');
    }

    // toLocaleString() опущен, поскольку я не знаю, как локализовать даты в
    // этот календарь
    toLocaleString(locales = undefined, options = undefined) {
        (void locales, options);
        throw new Error('unimplemented');
    }

    // Методы преобразования опущены. Их можно заставить работать
    // реализация NepaliPlainDateTime и т. д. Это зависит от вашего варианта использования,
    // понадобится вам это или нет.
    toPlainDateTime(plainTime) {
        void plainTime;
        throw new Error('unimplemented');
    }
    toZonedDateTime(options) {
        void options;
        throw new Error('unimplemented');
    }
    toPlainYearMonth() {
        throw new Error('unimplemented');
    }
    toPlainMonthDay() {
        throw new Error('unimplemented');
    }

    // Арифметические методы опущены. В мировых календарях нет даты
    // арифметика, насколько я понимаю. Их может заставить работать кто-то
    // кто знаком с правилами арифметики дат в этом календаре.
    add(duration, { overflow = 'constrain' } = {}) {
        void this.#iso.add(duration, { overflow });
        throw new Error('not implemented');
    }
    subtract(duration, { overflow = 'constrain' } = {}) {
        void this.#iso.subtract(duration, { overflow });
        throw new Error('not implemented');
    }
    until(other, { largestUnit = 'day' } = {}) {
        void this.#iso.until(other.#iso, { largestUnit });
        throw new Error('not implemented');
    }
    since(other, { largestUnit = 'day' } = {}) {
        void this.#iso.since(other.#iso, { largestUnit });
        throw new Error('not implemented');
    }
}

// Здесь мы запускаем ряд тестов, чтобы проверить, что приведенная выше реализация делает
// смысл.

const n = NepaliPlainDate.from({ year: 2081, month: 3, day: 11 });
assert.equal(n.toString(), '2024-06-24[u-ca=nepali]');
assert.equal(n.era, undefined);
assert.equal(n.eraYear, undefined);
assert.equal(n.year, 2081);
assert.equal(n.month, 3);
assert.equal(n.monthCode, 'M03');
assert.equal(n.day, 11);
assert.equal(n.dayOfWeek, 1);
assert.equal(n.daysInWeek, 7);
assert.equal(n.weekOfYear, undefined);
assert.equal(n.yearOfWeek, undefined);
assert.equal(n.daysInMonth, 32);
assert.equal(n.daysInYear, 366);
assert.equal(n.monthsInYear, 12);
assert.equal(n.inLeapYear, true);
const withBuiltinCalendar = n.withCalendar('gregory');
assert.equal(withBuiltinCalendar.toString(), '2024-06-24[u-ca=gregory]');
assert(
    withBuiltinCalendar instanceof Temporal.PlainDate,
    'withCalendar returns real PlainDate',
);
assert(n.equals(n), 'equals self');
assert(n.equals(NepaliPlainDate.from(n)), 'equals new instance of self');
assert(!n.equals(withBuiltinCalendar), 'does not equal real PlainDate');
assert.equal(n.toJSON(), '2024-06-24[u-ca=nepali]');
```

<small>Источник: <https://tc39.es/proposal-temporal/docs/cookbook.html></small>
