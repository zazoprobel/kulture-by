do $$
declare
  owner_id uuid;
  organizer_id uuid;
begin
  select id into owner_id
  from public.profiles
  order by created_at
  limit 1;

  select id into organizer_id
  from public.profiles
  order by created_at desc
  limit 1;

  if owner_id is null or organizer_id is null then
    raise notice 'Seed skipped: заполните public.profiles (минимум 1 пользователь).';
    return;
  end if;

  insert into public.places (
    name, slug, description, category, city, address, lat, lng, working_hours, entry_price, website, rating, created_by
  ) values
    (
      'Верхний город',
      'verhniy-gorod-minsk',
      'Исторический центр Минска с уютными улицами, храмами и живой атмосферой городских праздников.',
      'history',
      'Минск',
      'пл. Свободы, 1',
      53.903503,
      27.556352,
      '{"mon":"10:00-22:00","tue":"10:00-22:00","wed":"10:00-22:00","thu":"10:00-22:00","fri":"10:00-23:00","sat":"10:00-23:00","sun":"10:00-22:00"}'::jsonb,
      0,
      'https://minsk.gov.by',
      4.8,
      owner_id
    ),
    (
      'Брестская крепость',
      'brestskaya-krepost',
      'Знаковый мемориальный комплекс и музей под открытым небом, важное место исторической памяти.',
      'history',
      'Брест',
      'ул. Героев обороны Брестской крепости, 60',
      52.084266,
      23.656524,
      '{"daily":"09:00-21:00"}'::jsonb,
      12,
      'https://www.brest-fortress.by',
      4.9,
      owner_id
    ),
    (
      'Коложский парк',
      'kolozhskiy-park-grodno',
      'Тихое зеленое место у Немана рядом с древней архитектурой, отлично подходит для семейных прогулок.',
      'nature',
      'Гродно',
      'ул. Коложа, 6',
      53.683447,
      23.834548,
      '{"daily":"08:00-22:00"}'::jsonb,
      0,
      null,
      4.6,
      owner_id
    ),
    (
      'Ратушная площадь',
      'ratushnaya-ploshchad-vitebsk',
      'Сердце старого Витебска с музеями, фестивальной жизнью и удобной прогулочной зоной.',
      'museums',
      'Витебск',
      'ул. Ленина, 36',
      55.190429,
      30.204919,
      '{"mon":"11:00-20:00","tue":"11:00-20:00","wed":"11:00-20:00","thu":"11:00-20:00","fri":"11:00-21:00","sat":"10:00-21:00","sun":"10:00-20:00"}'::jsonb,
      8,
      'https://vitebsk.by',
      4.7,
      owner_id
    ),
    (
      'Дворцово-парковый ансамбль',
      'dvortsovo-parkoviy-ansambl-gomel',
      'Живописный архитектурный комплекс с парком, набережной и насыщенной культурной программой.',
      'history',
      'Гомель',
      'пл. Ленина, 4',
      52.425163,
      31.015039,
      '{"daily":"10:00-20:00"}'::jsonb,
      10,
      'https://palacegomel.by',
      4.8,
      owner_id
    ),
    (
      'Этнопарк «Подниколье»',
      'etnopark-podnikole-mogilev',
      'Пространство для прогулок и семейного отдыха с панорамными видами и фестивальными зонами.',
      'activity',
      'Могилёв',
      'ул. Большая Гражданская, 13',
      53.901662,
      30.336842,
      '{"daily":"08:00-22:00"}'::jsonb,
      0,
      null,
      4.5,
      owner_id
    )
  on conflict (slug) do nothing;

  insert into public.venues (
    name, slug, description, type, city, address, lat, lng, capacity_banquet, capacity_buffet, price_from, rating, created_by
  ) values
    (
      'Лофт «Немига Холл»',
      'loft-nemiga-hall',
      'Современная площадка в центре Минска для концертов, лекций и творческих маркетов.',
      'loft',
      'Минск',
      'ул. Немига, 12',
      53.903831,
      27.549986,
      120,
      180,
      1500,
      4.7,
      owner_id
    ),
    (
      'Ресторан «Буг»',
      'restoran-bug-brest',
      'Просторный зал для свадеб и корпоративов с авторской белорусской кухней.',
      'restaurant',
      'Брест',
      'ул. Советская, 47',
      52.097621,
      23.734051,
      140,
      200,
      90,
      4.5,
      owner_id
    ),
    (
      'Парк-площадка «Неман Open Air»',
      'neman-open-air-grodno',
      'Открытая площадка у реки для летних фестивалей, гастро-ивентов и кино под небом.',
      'outdoor',
      'Гродно',
      'наб. Немана, 3',
      53.677839,
      23.829869,
      250,
      400,
      2500,
      4.6,
      owner_id
    ),
    (
      'Отель «Двина Event Hall»',
      'dvina-event-hall-vitebsk',
      'Конференц-зал при отеле для деловых и культурных мероприятий среднего формата.',
      'hotel',
      'Витебск',
      'пр-т Черняховского, 26',
      55.179383,
      30.208741,
      90,
      130,
      1200,
      4.4,
      owner_id
    ),
    (
      'Банкетный дом «Сож»',
      'banketnyy-dom-sozh-gomel',
      'Элегантный банкетный зал для свадеб, юбилеев и торжественных городских приемов.',
      'banquet',
      'Гомель',
      'ул. Советская, 19',
      52.431256,
      30.993721,
      180,
      240,
      110,
      4.6,
      owner_id
    ),
    (
      'Лофт «Днепр Арт Хаб»',
      'dnepr-art-hub-mogilev',
      'Творческая площадка для выставок, лекций и музыкальных вечеров в индустриальном стиле.',
      'loft',
      'Могилёв',
      'ул. Первомайская, 29',
      53.898108,
      30.332878,
      110,
      160,
      1300,
      4.5,
      owner_id
    )
  on conflict (slug) do nothing;

  insert into public.contractors (
    name, slug, description, category, city, price_from, rating, telegram, email, created_by
  ) values
    (
      'Фотостудия «Светлая Память»',
      'svetlaya-pamyat-photo-minsk',
      'Репортажная и постановочная съемка культурных событий, быстрый отбор и цветокоррекция.',
      'photo',
      'Минск',
      350,
      4.8,
      '@svet_photo_minsk',
      'photo@kultura.by',
      owner_id
    ),
    (
      'Видеопродакшн «Брест Кадр»',
      'brest-kadr-video',
      'Съемка промо-роликов и aftermovie для городских фестивалей и камерных мероприятий.',
      'video',
      'Брест',
      500,
      4.7,
      '@brestkadr',
      'video@brestkadr.by',
      owner_id
    ),
    (
      'Декор-ателье «Гродно Флора»',
      'grodno-flora-decor',
      'Оформление сцен, фотозон и банкетных пространств в классическом и современном стиле.',
      'decor',
      'Гродно',
      280,
      4.6,
      '@grodnoflora',
      'decor@grodnoflora.by',
      owner_id
    ),
    (
      'Шоу-ведущий «Артём Витебский»',
      'artem-vitebskiy-mc',
      'Ведущий с живой подачей для свадеб, городских праздников и корпоративных событий.',
      'mc',
      'Витебск',
      220,
      4.5,
      '@mc_vitebsk',
      'host@vitevent.by',
      owner_id
    ),
    (
      'Звук и свет «Гомель Саунд»',
      'gomel-sound-tech',
      'Техническое сопровождение мероприятий: звук, свет, сцена и поддержка команды на площадке.',
      'sound',
      'Гомель',
      420,
      4.6,
      '@gomelsound',
      'sound@gomel-event.by',
      owner_id
    ),
    (
      'Студия «Могилёв Видео»',
      'mogilev-video-studio',
      'Многокамерная съемка концертов и событий с монтажом highlight-роликов под соцсети.',
      'video',
      'Могилёв',
      460,
      4.5,
      '@mogilev_video',
      'video@mogilevstudio.by',
      owner_id
    )
  on conflict (slug) do nothing;

  insert into public.events (
    name, slug, description, category, city, venue_id, date_start, date_end, price_from, image_url, organizer_id
  ) values
    (
      'Минский фестиваль уличной музыки',
      'minsk-street-music-fest',
      'Большой городской фестиваль с живыми выступлениями, маркетом локальных брендов и фуд-кортом.',
      'music',
      'Минск',
      (select id from public.venues where slug = 'loft-nemiga-hall'),
      now() + interval '14 days',
      now() + interval '14 days 6 hours',
      25,
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
      organizer_id
    ),
    (
      'Брестский гастро-уикенд',
      'brest-gastro-weekend',
      'Тематические ужины, дегустации и мастер-классы от шефов с акцентом на локальные продукты.',
      'gastro',
      'Брест',
      (select id from public.venues where slug = 'restoran-bug-brest'),
      now() + interval '21 days',
      now() + interval '21 days 4 hours',
      40,
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      organizer_id
    ),
    (
      'Неман Open Air: летний кинофест',
      'neman-open-air-cinema',
      'Вечерние показы авторского кино под открытым небом, музыкальные паузы и ярмарка ремесел.',
      'cinema',
      'Гродно',
      (select id from public.venues where slug = 'neman-open-air-grodno'),
      now() + interval '28 days',
      now() + interval '28 days 5 hours',
      18,
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      organizer_id
    ),
    (
      'Витебские истории: лекции и театр',
      'vitebsk-stories-lectures',
      'Серия публичных лекций о культуре региона и камерный театральный показ в финале вечера.',
      'education',
      'Витебск',
      (select id from public.venues where slug = 'dvina-event-hall-vitebsk'),
      now() + interval '35 days',
      now() + interval '35 days 3 hours',
      15,
      'https://images.unsplash.com/photo-1503095396549-807759245b35',
      organizer_id
    ),
    (
      'Гомельский вечер джаза',
      'gomel-jazz-evening',
      'Теплый музыкальный вечер с участием локальных джаз-бэндов и специального гостя из Минска.',
      'music',
      'Гомель',
      (select id from public.venues where slug = 'banketnyy-dom-sozh-gomel'),
      now() + interval '42 days',
      now() + interval '42 days 4 hours',
      22,
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
      organizer_id
    ),
    (
      'Могилёвский арт-уикенд',
      'mogilev-art-weekend',
      'Выставки, лекции и маркет локальных брендов в формате двухдневного городского фестиваля.',
      'art',
      'Могилёв',
      (select id from public.venues where slug = 'dnepr-art-hub-mogilev'),
      now() + interval '49 days',
      now() + interval '49 days 7 hours',
      20,
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
      organizer_id
    )
  on conflict (slug) do nothing;
end;
$$;
