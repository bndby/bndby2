# Как сделать дубликат Git-репозитория

Чтобы дублировать репозиторий без его «форка», вы можете запустить специальную команду clone, а затем запушиться в новый репозиторий.

Перед тем, как вы начнете дублировать свой репозиторий, вам нужно создать новый репозиторий.

## Дублирование репозитория

1. Откройте терминал.
2. Создайте пустой клон репозитория

	git clone --bare https://github.com/exampleuser/old-repository.git

3. Сделайте зеркальный пуш в новый репозиторий

	cd old-repository.git
	git push --mirror https://github.com/exampleuser/new-repository.git

4. Удалите временный локальный репозиторий, созданный на втором шаге.

	cd ..
	rm -rf old-repository.git

## Ссылки

[Duplicating a repository](https://help.github.com/articles/duplicating-a-repository/) Github Help
