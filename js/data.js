/*
 * Данные сайта «Колбасы Приуралья».
 * Всё, что может меняться (контакты, режим работы, ассортимент, цены), редактируется здесь.
 * ВНИМАНИЕ: цены и часть позиций ассортимента — ориентировочные (демо). Перед запуском
 * сверьте их с актуальным прайсом предприятия.
 */
window.KP = {
  config: {
    company: 'ТОО «Колбасы Приуралья»',
    city: 'Уральск',
    address: 'ул. Григория Потанина, 1Н',
    addressFull: 'г. Уральск, ул. Григория Потанина, 1Н',
    phones: [
      { label: '+7 747 711-23-39', href: 'tel:+77477112339' },
      { label: '+7 705 567-06-01', href: 'tel:+77055670601' }
    ],
    // Номер для заказов в WhatsApp (только цифры, с кодом страны)
    whatsapp: '77477112339',
    instagram: 'https://www.instagram.com/kolbasy_priuralya/',
    gis: 'https://2gis.kz/uralsk/firm/70000001076541529',
    yandex: 'https://yandex.kz/maps/?pt=51.400602,51.232635&z=17&l=map',
    // Часовой пояс Уральска: UTC+5
    utcOffset: 5,
    // Режим работы фирменного магазина: [открытие, закрытие] в часах, null — выходной
    // 0 — воскресенье, 1 — понедельник … 6 — суббота
    hours: {
      0: null,
      1: [8, 17],
      2: [8, 17],
      3: [8, 17],
      4: [8, 17],
      5: [8, 17],
      6: [8, 13]
    }
  },

  categories: [
    { id: 'boiled', name: 'Варёные колбасы', short: 'Варёные', img: 'assets/img/boiled.jpg' },
    { id: 'franks', name: 'Сосиски и сардельки', short: 'Сосиски', img: 'assets/img/franks.jpg' },
    { id: 'semismoked', name: 'Полукопчёные', short: 'Полукопчёные', img: 'assets/img/semismoked.jpg' },
    { id: 'smoked', name: 'Варёно-копчёные', short: 'Варёно-копчёные', img: 'assets/img/cervelat.jpg' },
    { id: 'horse', name: 'Из конины', short: 'Конина', img: 'assets/img/kazy.jpg' },
    { id: 'poultry', name: 'Из птицы', short: 'Птица', img: 'assets/img/turkey.jpg' },
    { id: 'deli', name: 'Деликатесы', short: 'Деликатесы', img: 'assets/img/deli.jpg' },
    { id: 'semi', name: 'Полуфабрикаты', short: 'Полуфабрикаты', img: 'assets/img/pelmeni.jpg' }
  ],

  /*
   * unit: 'кг' — весовой товар (шаг 0,5 кг), 'шт' — штучный/упаковка.
   * tags: 'hit' — хит продаж, 'new' — новинка.
   */
  products: [
    // Варёные
    { id: 'musulmanskaya', cat: 'boiled', name: 'Колбаса «Мусульманская»', meat: 'Говядина', pack: 'Батон ~1 кг', unit: 'кг', price: 3200, img: 'assets/img/boiled.jpg', tags: ['hit'],
      desc: 'Классическая варёная колбаса из говядины с мягким сливочным вкусом. Без свинины и свиного жира.' },
    { id: 'doktorskaya', cat: 'boiled', name: 'Колбаса «Докторская» халал', meat: 'Говядина', pack: 'Батон ~1 кг', unit: 'кг', price: 3100, img: 'assets/img/boiled.jpg', tags: [],
      desc: 'Нежная однородная колбаса по классической рецептуре, адаптированной под стандарт халал.' },
    { id: 'molochnaya', cat: 'boiled', name: 'Колбаса «Молочная»', meat: 'Говядина, птица', pack: 'Батон ~0,8 кг', unit: 'кг', price: 2900, img: 'assets/img/boiled.jpg', tags: [],
      desc: 'Лёгкая варёная колбаса с добавлением молока — для завтраков и детского меню.' },
    { id: 'govyazhya', cat: 'boiled', name: 'Колбаса «Говяжья»', meat: 'Говядина', pack: 'Батон ~1 кг', unit: 'кг', price: 3400, img: 'assets/img/boiled.jpg', tags: [],
      desc: 'Выраженный мясной вкус, плотная текстура, умеренно солёная.' },

    // Сосиски и сардельки
    { id: 'sosiski-halal', cat: 'franks', name: 'Сосиски «Халал»', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3300, img: 'assets/img/franks.jpg', tags: ['hit'],
      desc: 'Сочные говяжьи сосиски в натуральной оболочке. Варить 3–5 минут или обжарить.' },
    { id: 'sosiski-musulmanskie', cat: 'franks', name: 'Сосиски «Мусульманские»', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3200, img: 'assets/img/franks.jpg', tags: [],
      desc: 'Мягкие сосиски с деликатным вкусом специй.' },
    { id: 'sosiski-kroha', cat: 'franks', name: 'Сосиски «Кроха»', meat: 'Говядина, птица', pack: 'Упаковка 400 г', unit: 'шт', price: 1450, img: 'assets/img/franks.jpg', tags: [],
      desc: 'Небольшие нежные сосиски для детей — без острых специй.' },
    { id: 'sosiski-bavarskie', cat: 'franks', name: 'Сосиски «Баварские»', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3500, img: 'assets/img/franks.jpg', tags: ['new'],
      desc: 'Сосиски с крупным помолом и копчёным ароматом — хороши на гриле.' },
    { id: 'sosiski-gost', cat: 'franks', name: 'Сосиски говяжьи ГОСТ', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3600, img: 'assets/img/franks.jpg', tags: [],
      desc: 'Сосиски по ГОСТ-рецептуре: только говядина, специи и натуральная оболочка.' },
    { id: 'sardelki', cat: 'franks', name: 'Сардельки говяжьи', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3400, img: 'assets/img/franks.jpg', tags: ['hit'],
      desc: 'Толстые сочные сардельки — для варки, жарки и запекания.' },

    // Полукопчёные
    { id: 'krakovskaya', cat: 'semismoked', name: 'Колбаса «Краковская» халал', meat: 'Говядина', pack: 'Подкова ~0,5 кг', unit: 'кг', price: 4300, img: 'assets/img/semismoked.jpg', tags: ['hit'],
      desc: 'Полукопчёная колбаса с чесноком и чёрным перцем, копчение на натуральной щепе.' },
    { id: 'tatarskaya', cat: 'semismoked', name: 'Колбаса «Татарская»', meat: 'Говядина', pack: 'Батон ~0,5 кг', unit: 'кг', price: 4100, img: 'assets/img/semismoked.jpg', tags: [],
      desc: 'Насыщенный вкус, плотная структура, мягкий дымный аромат.' },
    { id: 'kazakhskaya', cat: 'semismoked', name: 'Колбаса «Казахская»', meat: 'Говядина, конина', pack: 'Подкова ~0,5 кг', unit: 'кг', price: 4600, img: 'assets/img/semismoked.jpg', tags: [],
      desc: 'Полукопчёная колбаса с добавлением конины и традиционных специй.' },
    { id: 'okhotnichi', cat: 'semismoked', name: 'Колбаски «Охотничьи»', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 4400, img: 'assets/img/semismoked.jpg', tags: ['new'],
      desc: 'Тонкие копчёные колбаски — закуска в дорогу и на природу.' },

    // Варёно-копчёные
    { id: 'servelat', cat: 'smoked', name: 'Сервелат халал', meat: 'Говядина', pack: 'Батон ~0,4 кг', unit: 'кг', price: 5600, img: 'assets/img/cervelat.jpg', tags: ['hit'],
      desc: 'Варёно-копчёный сервелат с мелким рисунком на срезе. Для бутербродов и нарезки.' },
    { id: 'salyami', cat: 'smoked', name: 'Салями говяжья', meat: 'Говядина', pack: 'Батон ~0,4 кг', unit: 'кг', price: 5900, img: 'assets/img/cervelat.jpg', tags: [],
      desc: 'Плотная салями с пикантными специями и выраженным ароматом копчения.' },
    { id: 'moskovskaya', cat: 'smoked', name: 'Колбаса «Московская»', meat: 'Говядина', pack: 'Батон ~0,4 кг', unit: 'кг', price: 5700, img: 'assets/img/cervelat.jpg', tags: [],
      desc: 'Классическая варёно-копчёная колбаса по традиционной рецептуре.' },

    // Конина
    { id: 'kazy', cat: 'horse', name: 'Казы', meat: 'Конина', pack: 'Весовой', unit: 'кг', price: 9800, img: 'assets/img/kazy.jpg', tags: ['hit'],
      desc: 'Традиционный казахский деликатес из конины с прослойкой жира. Для дастархана и праздничного стола.' },
    { id: 'shuzhuk', cat: 'horse', name: 'Шужук', meat: 'Конина', pack: 'Весовой', unit: 'кг', price: 8900, img: 'assets/img/kazy.jpg', tags: [],
      desc: 'Колбаса из рубленой конины в натуральной оболочке.' },
    { id: 'konskaya-pk', cat: 'horse', name: 'Колбаса конская полукопчёная', meat: 'Конина, говядина', pack: 'Батон ~0,5 кг', unit: 'кг', price: 6200, img: 'assets/img/kazy.jpg', tags: [],
      desc: 'Полукопчёная колбаса с кониной — насыщенный вкус и плотная текстура.' },

    // Птица
    { id: 'indeyka-syr', cat: 'poultry', name: 'Индейка с сыром', meat: 'Индейка', pack: 'Батон ~0,6 кг', unit: 'кг', price: 4200, img: 'assets/img/turkey.jpg', tags: ['hit'],
      desc: 'Нежный рулет из индейки с кусочками сыра. Один из самых популярных продуктов цеха.' },
    { id: 'rulet-kuriny', cat: 'poultry', name: 'Рулет куриный', meat: 'Курица', pack: 'Батон ~0,6 кг', unit: 'кг', price: 3600, img: 'assets/img/turkey.jpg', tags: [],
      desc: 'Сочный рулет из куриного мяса — для лёгких бутербродов и салатов.' },
    { id: 'vetchina-indeyka', cat: 'poultry', name: 'Ветчина из индейки', meat: 'Индейка', pack: 'Батон ~0,8 кг', unit: 'кг', price: 3900, img: 'assets/img/turkey.jpg', tags: ['new'],
      desc: 'Диетическая ветчина с мягким вкусом.' },
    { id: 'okorochka', cat: 'poultry', name: 'Окорочка копчёные', meat: 'Курица', pack: 'Весовые', unit: 'кг', price: 2900, img: 'assets/img/smoked-chicken.jpg', tags: [],
      desc: 'Варёно-копчёные куриные окорочка с золотистой корочкой. Готовы к употреблению.' },

    // Деликатесы
    { id: 'buzhenina', cat: 'deli', name: 'Буженина говяжья', meat: 'Говядина', pack: 'Весовая', unit: 'кг', price: 7400, img: 'assets/img/deli.jpg', tags: ['hit'],
      desc: 'Запечённая говядина цельным куском — для нарезки и праздничного стола.' },
    { id: 'kurdyuk', cat: 'deli', name: 'Курдюк копчёный', meat: 'Баранина', pack: 'Весовой', unit: 'кг', price: 5200, img: 'assets/img/kurdyuk.jpg', tags: [],
      desc: 'Копчёный курдюк с ароматом дыма. Подают тонкой нарезкой.' },
    { id: 'grudinka', cat: 'deli', name: 'Грудинка говяжья копчёная', meat: 'Говядина', pack: 'Весовая', unit: 'кг', price: 6800, img: 'assets/img/deli.jpg', tags: [],
      desc: 'Варёно-копчёная говяжья грудинка с мясными прослойками.' },

    // Полуфабрикаты
    { id: 'pelmeni', cat: 'semi', name: 'Пельмени говяжьи', meat: 'Говядина', pack: 'Весовые', unit: 'кг', price: 3000, img: 'assets/img/pelmeni.jpg', tags: [],
      desc: 'Пельмени ручной лепки с начинкой из говядины. Замороженные.' },
    { id: 'manty', cat: 'semi', name: 'Манты', meat: 'Говядина, баранина', pack: 'Весовые', unit: 'кг', price: 3200, img: 'assets/img/pelmeni.jpg', tags: [],
      desc: 'Крупные манты с рубленым мясом и луком. Замороженные, готовятся на пару 40 минут.' }
  ]
};

