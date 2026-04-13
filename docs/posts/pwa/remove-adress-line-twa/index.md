---
date: 2026-04-13
description: Как убрать адресную строку в Trusted Web Activity через корректную настройку Digital Asset Links
tags:
    - pwa
    - twa
    - android
    - google-play
categories:
    - PWA
slug: remove-adress-line-twa
---

# Как убрать адресную строку в Trusted Web Activity

Если в Android-приложении на базе `Trusted Web Activity` отображается адресная строка, значит запуск произошёл не в режиме TWA, а в режиме `Custom Tabs`. Причина почти всегда одна: не пройдена проверка `Digital Asset Links`.

<!-- more -->

Ни `display: standalone` в `manifest.json`, ни повторная публикация сайта сами по себе не убирают browser UI в TWA. Полноэкранный режим включается только после двусторонней верификации между сайтом и Android-приложением.

## Когда TWA показывает адресную строку

`Trusted Web Activity` открывает сайт без browser UI только при выполнении двух условий:

1.  Android-приложение доверяет домену.
2.  Домен подтверждает право приложения обрабатывать свои URL.

Если хотя бы одно условие не выполнено, браузер делает fallback в `Custom Tabs`. В этом режиме сверху появляется адресная строка, даже если приложение собрано корректно.

## Что должно быть настроено

Минимальный набор:

- сайт доступен по `HTTPS`
- файл `assetlinks.json` опубликован по точному пути `/.well-known/assetlinks.json`
- в файле указан правильный `package_name`
- в файле указан правильный `sha256_cert_fingerprints`
- Android-приложение содержит `asset_statements`, ссылающиеся на домен
- приложение подписано тем же сертификатом, отпечаток которого указан в `assetlinks.json`

Для публикации через Google Play это особенно важно: если включён `Play App Signing`, использовать нужно не локальный upload key, а сертификат подписи приложения из Play Console.

## Шаг 1. Опубликовать `assetlinks.json`

Файл должен находиться строго по адресу:

```text
https://example.com/.well-known/assetlinks.json
```

Пример содержимого:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": [
        "12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF"
      ]
    }
  }
]
```

Поля:

- `relation`: для TWA используется `delegate_permission/common.handle_all_urls`
- `package_name`: package name Android-приложения
- `sha256_cert_fingerprints`: SHA-256 сертификата, которым подписан production build

Технические требования к публикации файла:

- URL без редиректов
- ответ сервера с `200 OK`
- `Content-Type: application/json`
- файл доступен публично извне
- размещение только в `/.well-known/assetlinks.json`, другие пути не валидны

## Шаг 2. Добавить `asset_statements` в Android-приложение

Приложение должно явно декларировать связь с сайтом.

Пример `res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">Example</string>
    <string name="asset_statements" translatable="false">
        [{\"relation\":[\"delegate_permission/common.handle_all_urls\"],\"target\":{\"namespace\":\"web\",\"site\":\"https://example.com\"}}]
    </string>
</resources>
```

Пример `AndroidManifest.xml`:

```xml
<application
    ...>
    <meta-data
        android:name="asset_statements"
        android:resource="@string/asset_statements" />
</application>
```

Если проект собран через `Bubblewrap` или `PWABuilder`, эти данные часто генерируются автоматически, но итоговую конфигурацию всё равно нужно проверить вручную.

## Шаг 3. Взять правильный SHA-256

Наиболее частая ошибка в TWA-конфигурации: в `assetlinks.json` указывается отпечаток не того сертификата.

Сценарии:

- локальная отладка: нужен SHA-256 debug или release keystore, которым реально подписан APK
- публикация через `Google Play App Signing`: нужен SHA-256 из раздела подписи приложения в Play Console

Если в Play Console включён `App Signing`, Google переподписывает распространяемый build своим app signing key. В этом случае отпечаток локального upload key не подойдёт для production-версии TWA.

## Шаг 4. Проверить, что браузер действительно проходит верификацию

Проверять нужно не только файл, но и полный сценарий валидации:

1.  Открыть `https://example.com/.well-known/assetlinks.json` в браузере и убедиться, что возвращается JSON без редиректов.
2.  Проверить синтаксис файла через валидатор `Digital Asset Links`.
3.  Убедиться, что `package_name` совпадает с package name установленного приложения.
4.  Убедиться, что SHA-256 соответствует сертификату установленного или публикуемого build.
5.  Проверить, что на устройстве приложение открывается через браузер с поддержкой TWA.

Если верификация не проходит, приложение продолжит открываться как `Custom Tabs`.

## `manifest.json` сайта не решает проблему TWA

Параметр:

```json
{
  "display": "standalone"
}
```

влияет на поведение установленного PWA, но не заменяет `Digital Asset Links` для `Trusted Web Activity`.

Практически:

- для PWA, установленного из браузера, `display: standalone` убирает часть browser UI
- для TWA, опубликованной как Android-приложение, отсутствие адресной строки зависит от успешной DAL-верификации

Это разные механизмы.

## Multi-origin: если используются поддомены

Если приложение открывает не только основной домен, но и поддомены или другие origin'ы, подтверждение нужно настроить для каждого origin отдельно.

Типовые примеры:

- `https://example.com`
- `https://www.example.com`
- `https://app.example.com`

Если TWA стартует на одном домене, а затем переводит пользователя на другой origin без отдельной верификации, браузер снова покажет UI.

## Частые причины, почему строка не исчезает

- `assetlinks.json` лежит не в `/.well-known/`
- сервер отдаёт `301` или `302`
- неверный `Content-Type`
- указан SHA-256 upload key вместо app signing key
- указан SHA-256 debug keystore для production build
- `package_name` не совпадает с фактическим package name
- приложение открывает другой домен, не включённый в настройки
- на устройстве используется браузер без корректной поддержки TWA
- после изменения конфигурации проверяется старый закэшированный результат

## Минимальный чек-лист

Перед отладкой TWA имеет смысл пройтись по этому списку:

- `https://domain/.well-known/assetlinks.json` открывается напрямую
- JSON валиден
- в JSON правильные `package_name` и `sha256_cert_fingerprints`
- Android-приложение содержит `asset_statements`
- домен в `asset_statements` совпадает с реальным origin
- production SHA-256 взят из Play Console, если используется `Google Play App Signing`
- все дополнительные origin'ы подтверждены отдельно

## Вывод

Чтобы убрать адресную строку в `Trusted Web Activity`, нужно не менять визуальные настройки PWA, а обеспечить успешную проверку `Digital Asset Links`. Ключевые точки проверки: правильный `assetlinks.json`, корректный SHA-256 сертификата подписи приложения и совпадение доменов между сайтом и Android-конфигурацией.

Если после этого TWA всё ещё показывает адресную строку, значит браузер не подтвердил связь между приложением и сайтом и открыл страницу в `Custom Tabs`.

## Источники

1.  [Как убрать адресную строку в приложении TWA с гугл маркет](https://bdseo.ru/kak-ubrat-adresnuyu-stroku-v-prilozhenii-twa-s-gugl-market)
2.  [Trusted Web Activities Quick Start Guide](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2)
3.  [Trusted Web Activities Overview](https://developer.chrome.com/docs/android/trusted-web-activity)
4.  [Multi-Origin Trusted Web Activities](https://developer.chrome.com/docs/android/trusted-web-activity/multi-origin)
5.  [Digital Asset Links: Getting Started](https://developers.google.com/digital-asset-links/v1/getting-started)
