# Сборка справочника

Для сборки справочника нужно [установить MKDocs](https://www.mkdocs.org/#installation),
[расширения PyMdown](https://facelessuser.github.io/pymdown-extensions/installation/) и тему [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/):

```sh
python -m venv venv
source venv/bin/activate
pip3 install -r ./requirements.txt
```

Сборка проекта:

```sh
mkdocs build
```

Режим разработчика:

```sh
mkdocs serve --dirtyreload
```
