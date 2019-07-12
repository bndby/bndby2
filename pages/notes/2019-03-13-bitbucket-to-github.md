# Как перейти с Bitbucket на GitHub

С января 2019 года Гитхаб ввел бесплатные приватные репозитории.

## 1. Создаем Гитхаб репозиторий

Важно оставить репозиторий полностью пустым, т. е. снять отметку с параметра _Initialize this repository with a README_

## 2. Переносим существующий контент

2.1. Check out существующий репозиторий с Bitbucket:

	$ git clone https://USER@bitbucket.org/USER/PROJECT.git

2.2. Добавляем ссылку на новый репозиторий на Гихабе

	$ cd PROJECT
	$ git remote add upstream https://github.com:USER/PROJECT.git

2.3. Push все ветки

	$ git push upstream master
	$ git push --tags upstream
