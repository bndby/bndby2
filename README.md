# Сборка документации

Для сборки справочника используется [ProperDocs](https://properdocs.dev/).

## Linux

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install -r ./requirements.txt
```

## Windows

```sh
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r ./requirements.txt
```

Сборка проекта выполняется из корня репозитория:

```sh
properdocs build
```

Локальный сервер разработки с автоматической пересборкой:

```sh
properdocs serve
```

После запуска сайт доступен по адресу [http://127.0.0.1:8000/](http://127.0.0.1:8000/).
