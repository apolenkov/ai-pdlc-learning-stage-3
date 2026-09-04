# OpenSpec Store

- Корневой `openspec/config.yaml` подключает Store `sdd-credit-calculator-product-meta`; общие specs и Changes не копируйте в этот репозиторий.
- Перед OpenSpec-командами зарегистрируйте соседний checkout Store и проверьте `npm exec openspec -- doctor`.
- Реализацию выполняйте в отдельной feature-ветке этого репозитория. Store и сервис имеют разные Git-коммиты и проходят разные ревью.
- Каталоги `03-openspec` и `03-ai` — самостоятельные учебные снимки с локальными OpenSpec-корнями. Меняйте их только когда принятый Change прямо включает их в охват.
- После merge передайте полный итоговый SHA владельцу Store; `services.lock.yaml` обновляется в метарепозитории, не здесь.
