#!/usr/bin/env node
/**
 * OSM + Wikipedia → Supabase SQL
 * kulture.by — Belarus Places Importer
 * 
 * Запуск: node osm_belarus_scraper_v2.js
 * Результат: belarus_osm_places.sql
 */

const fs = require('fs');
const https = require('https');

// ─── КАТЕГОРИИ ────────────────────────────────────────────────────
const CATEGORY_MAP = {
  'tourism=museum': 'museums', 'amenity=museum': 'museums',
  'tourism=gallery': 'museums', 'amenity=arts_centre': 'museums',
  'tourism=artwork': 'museums',
  'historic=castle': 'castles', 'historic=fort': 'castles',
  'historic=palace': 'castles', 'historic=tower': 'castles',
  'historic=memorial': 'history', 'historic=monument': 'history',
  'historic=ruins': 'history', 'historic=archaeological_site': 'history',
  'historic=battlefield': 'history', 'historic=manor': 'history',
  'historic=monastery': 'history', 'historic=church': 'history',
  'tourism=attraction': 'history', 'tourism=viewpoint': 'nature',
  'leisure=nature_reserve': 'nature', 'leisure=park': 'nature',
  'boundary=national_park': 'nature', 'natural=peak': 'nature',
  'natural=water': 'nature', 'tourism=camp_site': 'nature',
  'leisure=sports_centre': 'activity', 'leisure=stadium': 'activity',
  'leisure=swimming_pool': 'activity', 'sport=skiing': 'activity',
  'leisure=water_park': 'activity', 'leisure=marina': 'activity',
  'tourism=aquarium': 'kids', 'leisure=zoo': 'kids',
  'leisure=theme_park': 'kids',
  'amenity=marketplace': 'gastro', 'craft=brewery': 'gastro',
  'tourism=wine_cellar': 'gastro',
  'amenity=place_of_worship': 'history',
};

const OVERPASS_QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="BY"][admin_level=2]->.belarus;
(
  node["tourism"~"museum|gallery|attraction|viewpoint|artwork|aquarium|theme_park|zoo|wine_cellar|camp_site"](area.belarus);
  way["tourism"~"museum|gallery|attraction|viewpoint|artwork|aquarium|theme_park|zoo|wine_cellar|camp_site"](area.belarus);
  relation["tourism"~"museum|gallery|attraction|viewpoint|artwork|aquarium|theme_park|zoo|wine_cellar|camp_site"](area.belarus);
  node["historic"~"castle|fort|palace|memorial|monument|ruins|archaeological_site|battlefield|manor|estate|monastery|church|tower"](area.belarus);
  way["historic"~"castle|fort|palace|memorial|monument|ruins|archaeological_site|battlefield|manor|estate|monastery|church|tower"](area.belarus);
  relation["historic"~"castle|fort|palace|memorial|monument|ruins|archaeological_site|battlefield|manor|estate|monastery|church|tower"](area.belarus);
  node["leisure"~"nature_reserve|park|sports_centre|stadium|swimming_pool|water_park|marina|zoo|theme_park"](area.belarus);
  way["leisure"~"nature_reserve|park|sports_centre|stadium|swimming_pool|water_park|marina|zoo|theme_park"](area.belarus);
  relation["leisure"~"nature_reserve|park|sports_centre|stadium|swimming_pool|water_park|marina|zoo|theme_park"](area.belarus);
  relation["boundary"~"national_park|protected_area"](area.belarus);
  node["amenity"="place_of_worship"]["name"](area.belarus);
  way["amenity"="place_of_worship"]["name"](area.belarus);
  node["amenity"="marketplace"](area.belarus);
  node["craft"="brewery"](area.belarus);
);
out center tags;
`;

// ─── УТИЛИТЫ ─────────────────────────────────────────────────────
function slugify(text) {
  if (!text) return '';
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
    'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu',
    'я':'ya','і':'i','ў':'u','ґ':'g','є':'ye','ї':'yi',
  };
  return text.toLowerCase()
    .split('').map(c => map[c] || c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function getCategory(tags) {
  for (const [key, value] of Object.entries(tags)) {
    if (CATEGORY_MAP[`${key}=${value}`]) return CATEGORY_MAP[`${key}=${value}`];
  }
  if (tags.tourism) return 'history';
  if (tags.historic) return 'history';
  if (tags.leisure) return 'activity';
  if (tags.natural) return 'nature';
  return 'history';
}

function getCity(tags) {
  return tags['addr:city'] || tags['addr:town'] || 
         tags['addr:village'] || tags['is_in:city'] || null;
}

function getAddress(tags) {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  return parts.join(', ') || null;
}

function getWorkingHours(tags) {
  if (!tags.opening_hours) return null;
  const oh = tags.opening_hours;
  if (oh === '24/7') return JSON.stringify({ daily: '00:00-24:00' });
  const match = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (match && oh.match(/^Mo-Su/i)) return JSON.stringify({ daily: `${match[1]}-${match[2]}` });
  return JSON.stringify({ raw: oh });
}

function getCoordinates(el) {
  if (el.type === 'node') return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return { lat: null, lng: null };
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function getDefaultDescription(name, category) {
  const labels = {
    history: 'историческое место',
    castles: 'замок или дворец',
    museums: 'музей или галерея',
    nature: 'природный объект',
    activity: 'место для активного отдыха',
    gastro: 'гастрономическое место',
    kids: 'место для семейного отдыха',
  };
  return `${name} — ${labels[category] || 'интересное место'} в Беларуси.`;
}

// ─── HTTP HELPER ──────────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'kulture.by/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// ─── WIKIPEDIA API ────────────────────────────────────────────────
async function getWikipediaDescription(wikipediaTag) {
  if (!wikipediaTag) return null;
  
  // Формат: "ru:Название статьи" или "be:Назва артыкула"
  const colonIdx = wikipediaTag.indexOf(':');
  if (colonIdx === -1) return null;
  
  const lang = wikipediaTag.substring(0, colonIdx);
  const title = wikipediaTag.substring(colonIdx + 1);
  
  // Предпочитаем русскую Wikipedia
  const langs = lang === 'ru' ? ['ru'] : [lang, 'ru'];
  
  for (const l of langs) {
    const encodedTitle = encodeURIComponent(title);
    const url = `https://${l}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
    
    const data = await httpGet(url);
    if (data && data.extract && data.extract.length > 50) {
      // Берём первые 500 символов — краткое описание
      let extract = data.extract.substring(0, 600);
      // Обрезаем на последней точке чтобы не резать на полуслове
      const lastDot = extract.lastIndexOf('.');
      if (lastDot > 100) extract = extract.substring(0, lastDot + 1);
      return extract;
    }
  }
  return null;
}

// ─── WIKIDATA API ─────────────────────────────────────────────────
async function getWikidataDescription(wikidataId) {
  if (!wikidataId) return null;
  const url = `https://www.wikidata.org/api/rest_v1/page/summary/${wikidataId}`;
  const data = await httpGet(url);
  if (data && data.description) return data.description;
  return null;
}

// ─── OVERPASS ────────────────────────────────────────────────────
function fetchOverpass(query) {
  return new Promise((resolve, reject) => {
    const body = 'data=' + encodeURIComponent(query);
    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'kulture.by/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── SLEEP ────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── MAIN ─────────────────────────────────────────────────────────
async function main() {
  console.log('🗺  OSM + Wikipedia → kulture.by');
  console.log('━'.repeat(50));

  // 1. Получаем данные из OSM
  console.log('📡 Запрос в Overpass API (только Беларусь)...');
  const osmData = await fetchOverpass(OVERPASS_QUERY);
  console.log(`📦 Получено из OSM: ${osmData.elements.length} элементов`);

  // 2. Фильтруем и подготавливаем
  const seen = new Set();
  const places = [];

  for (const el of osmData.elements) {
    const tags = el.tags || {};
    const name = tags['name:ru'] || tags.name || tags['name:be'];
    if (!name || name.length < 3) continue;

    const coords = getCoordinates(el);
    if (!coords.lat || !coords.lng) continue;

    let baseSlug = slugify(name);
    if (!baseSlug) continue;

    let slug = baseSlug;
    let counter = 1;
    while (seen.has(slug)) slug = `${baseSlug}-${counter++}`;
    seen.add(slug);

    const nameRu = tags['name:ru'] || (name && !name.match(/[a-zA-Z]/) ? name : null);
    const nameBe = tags['name:be'] || null;

    places.push({
      name: nameRu || name, // основное название на русском
      nameRu: nameRu,
      nameBe: nameBe,
      slug,
      category: getCategory(tags),
      city: getCity(tags) || 'Беларусь',
      address: getAddress(tags),
      lat: coords.lat,
      lng: coords.lng,
      workingHours: getWorkingHours(tags),
      entryPrice: tags.fee === 'no' ? 0 : null,
      website: tags.website || tags.url || tags['contact:website'] || null,
      phone: tags.phone || tags['contact:phone'] || null,
      wikipedia: tags.wikipedia || tags['wikipedia:ru'] || tags['wikipedia:be'] || null,
      wikidata: tags.wikidata || null,
      osmDescription: tags['description:ru'] || tags.description || tags['description:be'] || null,
      description: null,
      descriptionBe: null,
    });
  }

  console.log(`✅ После фильтрации: ${places.length} мест`);

  // 3. Обогащаем описаниями из Wikipedia
  const withWiki = places.filter(p => p.wikipedia || p.wikidata);
  console.log(`\n📖 Получаем описания из Wikipedia для ${withWiki.length} мест...`);
  console.log('   (это займёт несколько минут)\n');

  let wikiFound = 0;
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    
    // Прогресс каждые 50 записей
    if (i % 50 === 0) {
      process.stdout.write(`   ${i}/${places.length} обработано, ${wikiFound} с описанием...\r`);
    }

    // Пробуем русскую Wikipedia сначала
    if (place.wikipedia) {
      const ruWiki = place.wikipedia.startsWith('ru:') 
        ? place.wikipedia 
        : `ru:${place.wikipedia.split(':').pop()}`;
      
      const descRu = await getWikipediaDescription(ruWiki);
      if (descRu) {
        place.description = descRu;
        wikiFound++;
      }

      // Пробуем белорусскую Wikipedia
      const beWiki = place.wikipedia.startsWith('be:')
        ? place.wikipedia
        : `be:${place.wikipedia.split(':').pop()}`;
      
      const descBe = await getWikipediaDescription(beWiki);
      if (descBe) place.descriptionBe = descBe;
      
      if (descRu) {
        await sleep(150);
        continue;
      }
    }

    // Пробуем OSM description
    if (place.osmDescription) {
      place.description = place.osmDescription;
      wikiFound++;
      continue;
    }

    // Fallback — генерируем базовое описание
    place.description = getDefaultDescription(place.name, place.category);
    
    await sleep(50);
  }

  console.log(`\n✅ Описаний найдено: ${wikiFound} из ${places.length}`);

  // 4. Генерируем SQL
  const categoryStats = places.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const sql = `-- ============================================================
-- МЕСТА БЕЛАРУСИ: OSM + Wikipedia
-- Дата: ${new Date().toISOString()}
-- Записей: ${places.length}
-- Источник: OpenStreetMap (лицензия ODbL) + Wikipedia (CC BY-SA)
-- ============================================================
-- Статистика по категориям:
${Object.entries(categoryStats).map(([c, n]) => `--   ${c}: ${n}`).join('\n')}
-- ============================================================

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM public.profiles 
  WHERE role = 'admin' ORDER BY created_at LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Нет admin пользователя в profiles';
  END IF;

  INSERT INTO public.places (
    name, slug, description, category, city, address,
    lat, lng, working_hours, entry_price, website, rating, 
    name_ru, name_be, description_be, created_by
  ) VALUES
${places.map((p, i) => `  (
    ${escapeSQL(p.name)},
    ${escapeSQL(p.slug)},
    ${escapeSQL(p.description)},
    ${escapeSQL(p.category)},
    ${escapeSQL(p.city)},
    ${p.address ? escapeSQL(p.address) : 'NULL'},
    ${p.lat},
    ${p.lng},
    ${p.workingHours ? escapeSQL(p.workingHours) + '::jsonb' : 'NULL'},
    ${p.entryPrice !== null && p.entryPrice !== undefined ? p.entryPrice : '0'},
    ${p.website ? escapeSQL(p.website) : 'NULL'},
    4.0,
    ${p.nameRu ? escapeSQL(p.nameRu) : 'NULL'},
    ${p.nameBe ? escapeSQL(p.nameBe) : 'NULL'},
    ${p.descriptionBe ? escapeSQL(p.descriptionBe) : 'NULL'},
    owner_id
  )${i < places.length - 1 ? ',' : ''}`).join('\n')}
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE 'Импорт завершён: ${places.length} записей';
END;
$$;
`;

  const outputFile = 'belarus_osm_places.sql';
  fs.writeFileSync(outputFile, sql, 'utf8');

  console.log('\n━'.repeat(50));
  console.log(`✅ Готово! Файл: ${outputFile}`);
  console.log(`📊 Всего мест: ${places.length}`);
  console.log(`📖 С Wikipedia описанием: ${wikiFound}`);
  console.log('\n📋 Следующий шаг:');
  console.log('   Supabase → SQL Editor → открыть файл → Run');
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
