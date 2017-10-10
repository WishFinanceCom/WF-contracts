# bmc-contract

## BMC pre-Alpha

> На основе WP http://blackmoonfg.com/bmc_whitepaper

### Структура токена и публичного размещения

Абс. доля | Назначение
--- | ---
50% | Публичное размещение в блокчейн
30% | Резерв Blackmoon Crypto (будущая выручка), блокируется на 36 месяцев
20% | Команда (вестинг 24м, 6м клиф). До 5% может быть потрачено на внешних эдвайзеров (6м клиф, без вестинга)

```
Объем токена: X
+-------------------------------------+-------------------+----------+-------+
| 50%                                 | 30%               | 15%+     | 5%-   |
| ICO                                 | BMC               | Team     | Ext   |
| инвестируемая часть                 | Будущая выр.      | (hold)   | (hold)|
+-------------------------------------+-------------------+----------+-------+
^       50% Публичное размещение      ^            50% Без продажи           ^

```

Этапы публичного размещения:

- pre-order. Сбор средств в любых средствах до старта размещения.
  Собранные средства конвертируются по курсу 1xBMC = 1xUSD, возможна персональная скидка
  
  Средства принимаются в любой валюте:
  Фиат - наличными или на расчетные счета. Записывается в книгу (создается аккаунт инвестора, см. ниже)
  ETH - принимаются на мульти-кошелек
  BTC - принимаются на мульти-кошелек
  LTC - принимаются на мульти-кошелек
  
- distribution. Публичный сбор средств.
  В процессе публичного размещения определяется объем выпуска токенов в соответствии со структурой сбора и объема собранных средств

  Фиат - через обменники в крипту
  ETH - принимаются на общий кошелек ПР (инвестор определяется по адресу, https://www.myetherwallet.com)
  BTC - принимаются на персональный кошелек ПР (минимум $10, https://electrum.org/#home мульти-кошелек)

**Стоимость BMC**

День               | Курс к USD       | Примечание
------------------ | ---------------- | ---
pre-order (01 Aug) | 1 BMC            | 1 BMC = 1.00 USD
day 1-2   (12 Sep) | 1 BMC            | 1 BMC = 1.00 USD
day 3-7            | 0.9523809524 BMC | 1 BMC = 1.05 USD
day 8+             | 0.9090909091 BMC | 1 BMC = 1.10 USD

**Выпуск токенов BMC**

При закрытии публичного размещения выпускается Y = X * 2 токенов BMC, где X - собранный объем средств с учетом повышающих/понижающих коэффициентов.

**Прием средств**

Каждый инвестор регистрируется на blackmooncrypto.com и получает свой аккаунт с holder id.
В кабинете инвестора каждый видит свой адрес для ETH и свой адрес для BTC/LTC.

- BTC/LTC. Мульти-кошелек Electrum со сгенерированными заранее 10К кошельками для приема средств
  Каждому инвестору выдается персональный адрес кошелька из списка, на который он может перечислить средства.

- ETH. Приемный контракт https://cl.ly/1h0X3j3S0c3g (https://github.com/ethereum/dapp-bin/blob/master/wallet/wallet.sol) через https://www.myetherwallet.com

Конвертация пре-ордера в BMC происходит за 6 часов до старта публичного размещения.

Дата/время UTC   | Событие
-----------------|---------
2017-08-01 00:00 | Начало преордера
2017-09-10 13:00 | Окончание преордера
2017-09-12 09:00 | Фиксация курсов валют
2017-09-12 13:00 | Начало ICO
2017-10-13 12:59 | Завершение ICO

### Структура контрактов

#### Platform BMC (-ICO)

- впитывает pre-order административным способом
- впитывает ICO административным способом
- регистрирует holders, выпускает volume токенов
- функционирует как основной токен
- ERC20
- баланс BMC, балансы фондов (=holders)

#### Depositary wallet

- балансы
- rewards
- депозиты (опции ниже нужно дописывать)
    - автоматическая пролонгация вкл/выкл: депозиты без автоматической пролонгации: в конце периода депозита все средства с доходом переводятся обратно на баланс холдера
    - срок год

NB: должна быть возможность вручную закрыть баланс, вывести средства FTx/BMC вручную
NB: депозитные кошельки доступны только continuous contributor'ам (holder'ам BMC)

#### Exchange

- один контракт для всех поддерживаемых валют
- поддерживает BMC и FTx
- настраиваемые рейты для токен/валюта

#### FTx

Fees:

- maintenance fee: блокируется годовая оплата, при каждой транзакции пересчитывается остаток холда, накладные расходы включаются в transaction fee; безусловный пересчет (списание) раз в год за свой счет
- structuring fee: комиссия BMC за создание токена и его обслуживания
- transaction fee: комиссия за транзакцию, покрывающая накладные расходы за gas и за ресурсы/алгоритмы BMC

Attrs:

- roles: owner (BMC Contract), holder
- emmitable yes/no

### Action Plan

+ 24 Jul: ревью плана контрактов и техническое описание
+ 27 Jul: создание BTC и ETH кошельков для pre-order
    - запуск своей eth и btc ноды
    - подключение нод к ico-website
    - стайлинг ico-website под blackmoon
+ битки/eth для разработческих нужд
+ 28 Jul: создание LTC мультикошелька
+ 28 Jul: запуск приватного ico-website для регистрации заявок и переводов
- 20 Aug: ревью ICO-движка от ICO-промо
- решение вопроса с аудитом контрактов
- план по контрактам
- ??: готовые алгоритмы для депозитарных кошельков
- ??: готовые алгоритмы для FTx fees
- 04 Sep: деплой токена платформы (+ICO)
- 12 Sep: запуск ICO
- 13 Oct: завершение ICO

---

# DEV Draft

> Notes
> beta.chronobank.io
>   Infura/Kovan/Mnemonic: convince visa burst sentence donate grief upgrade tape job lens hedgehog thumb

## Contracts references

- BMC
    - references:
        - Platform token (ERC20): https://github.com/ChronoBank, SmartContracts/contracts/ChronoBank*.sol
        - Depositary wallet: 
            - (кошелек)   https://github.com/ChronoBank/SmartContracts/blob/develop/contracts/TimeHolder.sol
            - (дивиденты) https://github.com/ChronoBank/SmartContracts/blob/develop/contracts/Rewards.sol
        - Exchange: https://github.com/ChronoBank/SmartContracts/blob/develop/contracts/Exchange.sol
        - FTx: 
    - objectivites:
        - BMC ECR20 token
        - ICO full stack
            - реализуется вне блокчейн-контракта, чисто организационно традиционными инструментами (sql/webapp/etc)
            - будет в https://github.com/ChronoICO/ (@20Aug)
        - Platform related tasks
            - Exchange - работа с "внешними" блокченйами через eth-события и oracle, реализующего перевод, например, в биткойн

## Apps (except contracts)

- middleware: https://github.com/ChronoBank/Middleware
    - промежуточное кеширование (данных из блокчейна и автоматизация процессов по триггерам)
    - выполнение действий при изменении данных в блокчейне
    - выполнение действий с блокчейном (по внешнему событию будет добавлено): курс валют для контрактов, закрытие отчетных периодов и тп
    - API для работы с фильтрацией данных (quering)
    - bitcoind - нужно будет развернуть заранее до запуска - долго синхронизируется
    - эфирная нода parity - нужно будет развернуть заранее до запуска - долго синхронизируется

- frontend: https://github.com/ChronoBank/ChronoMint
    - react/redux/material UI
    - truffle/redux DAO
    - middleware client plugin
    - UI: backoffice/frontoffice, user-management over Users DAO linked to user manager smart contract (insensitive data stored to IPFS or CDN)

- Arch
    - instance: middleware(+mongodb)[M] + eth node(IPC interconnect via docker stack)[1]
    - VPC: front + eth node(http api)[1]

- Ethereum nodes
    
    - testnetworks Rinkeby, kovan; mainnet and private node
    - docker containers: from Mike
    
    Setup ethereum nodes for testnetworks (Rinkeby, kovan), mainnet and private node (for developers).
    Parity should be used for ropsten, kovan, private and mainnet. Geth should be used for rinkeby.
    Nodes RPC interfaces should be available externally with HTTPS and 443 port by domain name like ropsten.chronobank.io e.t.c. (use nginx to route traffic by domain name between nodes).
    Nodes should be monitored, information about monitoring should be added to this task. support@chronobank.io should be notified in case of any of nodes failure.
    
    Create automatic scenario which will be run smart contract compilation and migration to networks during GitHub commit event with 3 options.

    1 option - automatic smart contracts migration to private ethereum network represented by private parity node in docker container (npm packager type 1 with corresponding version should be created and published, notifications to slack should be send)

    2 option - automatic smart contracts migration to test ethereum network (kovan and Rinkeby) represented by parity node in docker container for Kovan and gets node in docker container for Rinkeby + migration to private ethereum network represented by private parity node in docker container (npm packager type 2 with corresponding version should be created and published, notifications to slack should be send)

    3 option - automatic smart contracts migration to mainnet ethereum network represented by parity node in docker container + migration to test ethereum network (kovan and Rinkeby) represented by parity node in docker container for Kovan and gets node in docker container for Rinkeby + migration to private ethereum network represented by private parity node in docker container (npm packager type 2 with corresponding version should be created and published, notifications to slack should be send)


# DEV Alpha contract (required by ICO)

## BMC token contract (ERC20)

**Конструктор**

- icoUsd, immutable, сколько собрано USD на ICO
- icoEth, immutable, сколько собрано ETH на ICO
- icoBtc, immutable, сколько собрано BTC на ICO
- icoLtc, immutable, сколько собрано LTC на ICO
- icoBmc, immutable, сколько выпустить BMC

* выпускаем totalBmc = icoBmc * 2
* переводим 30% от totalBmc на баланс компании в контракт Lockup36m
* переводим 12% от totalBmc на баланс компании в контракт TeamVesting
* на баланс каждого холдера переводим его купленные BMC
* остальное переводится на баланс компании

**Распределение BMC по эдвайзерам**

* на баланс эдвайзера переводим его количество BMC с баланса компании
* этот баланс эвайзера переводим в контракт Lockup6m

**Дополнительные операции**

- зарегистрировать эдвазера с балансом

## Lockup36m contract (non-ERC20)

Контракт, который блокирует средства в BMC на 36 месяцев.

* принимает BMC на баланс холдера
* не отдает их обратно пока не пройдет 36 месяцев с момента приема

## Lockup6m contract (non-ERC20)

Контракт, который блокирует средства в BMC на 6 месяцев.

* принимает BMC на баланс холдера
* не отдает их обратно пока не пройдет 6 месяцев с момента приема
* termination(address) - метод, который может вызвать только компания. При вызове средства переводятся на баланс компании, запись о холдере в Lockup6m удаляется, баланс в Lockup6m обнуляется

## TeamVesting contract (non-ERC20)

Контракт, который реализует 24-месячный квартальный вестинг с клифом 6 месяцев.

* принимает BMC на баланс компании
* отдает их по условиям вестинга

Месяц | Можно получить обратно от первоначальной суммы
--- | ---
  0 |   0.0%
  3 |   0.0%
  6 |  25.0%
  9 |  37.5%
 12 |  50.0%
 15 |  62.5%
 18 |  75.0%
 21 |  87.5%
 24 | 100.0%

## Bayback contract (non-ERC20)

Контракт покупает BMC за ETH.
Курс BMC: 1 BMC = 0.8 USD по курсу ETH-USD coinmarketcap.com на момент конвертации
    - курсы пушит оракл по расписанию
Компания перечисляет на адрес Bayback объем ETH, которым контракт оперирует при обратном выкупе BMC

* ходер перечисляет BMC на адрес контракта
* ходер получает от контракта ETH согласно курсу
* перевод ETH от контракта должен иметь задержку 60 минут
    - таймаут перевода ETH контролируется ораклом "снаружи"
* контракт должен работать 24 месяца от установленной даты (в конце должен деклайнить любые попытки отправить ему BMC)

- возможность изменения курса BMC-ETH-USD
- возможность вывести ETH с этого контракта


# DEV Beta contract (after alpha)

## FTx contract (ERC20, неэмиттируемый)

Контракт реализует доли участников в фондовом токене.
Роли: харвестер, холдер и continious contributor.
Холдер - покупает токен через ERC20
CC - голосует через оракла своими BMC, которые определяют его долю в распределении дохода от FTx, имеет два баланса FTx:
    - баланс доступный через ERC20
    - баланс, управляемый харвестером
Харвестер - сборщик платежей (* fee)

Параметры контракта:
- объем выпуска
- размер structuring fee
- размер transaction fee
- размер maintenance fee (ежегодная плата, расчитываемая/списываемая с точностью в день)

**ERC20**

При каждом вызове trasfer() и transferFrom() на баланс харвестера должен переводиться transaction fee.

**Харвестер**

Собирает платежи structuring fee и maintenance fee.
Structuring fee собирается один раз при деплое контракта
Maintenance fee собирается каждый раз при вызове harvest()

Методы

- harvestedBalance()
    - возвращает сумму, которая находится на балансе харвестера
- expectedHarvest()
    - возвращает сумму, которая была бы собрана при вызове harvest()
- contributorWithdrawal(address, amount)
    - переводит с баланса контрибьютора, которым управляет харвестер на ERC20-баланс
- registerContributor(address, bmcAmount)
    - компания регистрирует контрибьютора и указывает его баланс в BMC
    - де-регистрация выполняется путем установки нулевого bmcAmount
- harvest()
    - с каждого ERC20-баланса переводит сумму maintenance fee * кол-во дней с прошлого сбора на свой баланс харвестера
    - каждому контрибьютору делает перевод со своего баланса, на харвестер-баланс контрибьютора в соответствии с его долей BMC
        (contributorBMC/totalRegisteredBMC*harvesterBalance)
    - запоминает дату (номер блока) выполненнения harvest()
    - выполняется платформой по расписанию



