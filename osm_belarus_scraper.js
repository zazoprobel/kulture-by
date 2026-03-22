#!/usr/bin/env node
/**
 * OpenStreetMap Overpass API → Supabase SQL
 * Выгружает все туристические места Беларуси
 * 
 * Запуск: node osm_belarus_scraper.js
 * Результат: belarus_osm_places.sql
 */

const fs = require('fs');
const https = require('https');

// ─── КАТЕГОРИИ OSM → kulture.by ──────────────────────────────────
const CATEGORY_MAP = {
  // Природа
  'natural=peak': 'nature',
  'natural=water': 'nature',
  'natural=wood': 'nature',
  'natural=wetland': 'nature',
  'natural=beach': 'nature',
  'leisure=nature_reserve': 'nature',
  'leisure=park': 'nature',
  'boundary=national_park': 'nature',
  'boundary=protected_area': 'nature',

  // История
  'historic=memorial': 'history',
  'historic=monument': 'history',
  'historic=ruins': 'history',
  'historic=archaeological_site': 'history',
  'historic=battlefield': 'history',
  'historic=manor': 'history',
  'historic=estate': 'history',
  'tourism=museum': 'museums',
  'tourism=gallery': 'museums',
  'amenity=museum': 'museums',
  'amenity=theatre': 'history',
  'amenity=arts_centre': 'museums',

  // Замки
  'historic=castle': 'castles',
  'historic=fort': 'castles',
  'historic=palace': 'castles',
  'historic=tower': 'castles',

  // Религия
  'amenity=place_of_worship': 'history',
  'historic=monastery': 'history',
  'historic=church': 'history',

  // Гастро
  'tourism=wine_cellar': 'gastro',
  'craft=brewery': 'gastro',
  'amenity=marketplace': 'gastro',
  'shop=farm': 'gastro',

  // Активный отдых
  'leisure=sports_centre': 'activity',
  'leisure=stadium': 'activity',
  'leisure=swimming_pool': 'activity',
  'leisure=track': 'activity',
  'sport=skiing': 'activity',
  'leisure=water_park': 'activity',
  'tourism=camp_site': 'activity',
  'leisure=marina': 'activity',

  // С детьми
  'leisure=zoo': 'kids',
  'leisure=theme_park': 'kids',
  'leisure=playground': 'kids',
  'tourism=aquarium': 'kids',
  'amenity=cinema': 'kids',

  // Туризм общее
  'tourism=attraction': 'history',
  'tourism=viewpoint': 'nature',
  'tourism=artwork': 'museums',
};

// ─── OVERPASS ЗАПРОС ─────────────────────────────────────────────
// Беларусь: bbox = 51.2,23.2,56.2,32.8
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
  return text
    .toLowerCase()
    .replace(/[аа]/g, 'a').replace(/[бб]/g, 'b').replace(/[вв]/g, 'v')
    .replace(/[гг]/g, 'g').replace(/[дд]/g, 'd').replace(/[ее]/g, 'e')
    .replace(/[ёё]/g, 'yo').replace(/[жж]/g, 'zh').replace(/[зз]/g, 'z')
    .replace(/[ии]/g, 'i').replace(/[йй]/g, 'y').replace(/[кк]/g, 'k')
    .replace(/[лл]/g, 'l').replace(/[мм]/g, 'm').replace(/[нн]/g, 'n')
    .replace(/[оо]/g, 'o').replace(/[пп]/g, 'p').replace(/[рр]/g, 'r')
    .replace(/[сс]/g, 's').replace(/[тт]/g, 't').replace(/[уу]/g, 'u')
    .replace(/[фф]/g, 'f').replace(/[хх]/g, 'kh').replace(/[цц]/g, 'ts')
    .replace(/[чч]/g, 'ch').replace(/[шш]/g, 'sh').replace(/[щщ]/g, 'shch')
    .replace(/[ъъ]/g, '').replace(/[ыы]/g, 'y').replace(/[ьь]/g, '')
    .replace(/[ээ]/g, 'e').replace(/[юю]/g, 'yu').replace(/[яя]/g, 'ya')
    // Ukrainian/Belarusian specific
    .replace(/[іі]/g, 'i').replace(/[єє]/g, 'ye').replace(/[її]/g, 'yi')
    .replace(/[ўў]/g, 'u').replace(/[ґґ]/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function getCategory(tags) {
  for (const [key, value] of Object.entries(tags)) {
    const combined = `${key}=${value}`;
    if (CATEGORY_MAP[combined]) return CATEGORY_MAP[combined];
  }
  // Fallback по отдельным ключам
  if (tags.tourism) return 'history';
  if (tags.historic) return 'history';
  if (tags.leisure) return 'activity';
  if (tags.natural) return 'nature';
  return 'history';
}

function getCity(tags) {
  return tags['addr:city'] || 
         tags['addr:town'] || 
         tags['addr:village'] || 
         tags['is_in:city'] ||
         tags['addr:district'] ||
         null;
}

function getAddress(tags) {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  return parts.length > 0 ? parts.join(', ') : null;
}

function getWorkingHours(tags) {
  if (!tags.opening_hours) return null;
  // Пробуем распарсить простые форматы
  const oh = tags.opening_hours;
  try {
    // Mo-Su 09:00-18:00 → {"daily":"09:00-18:00"}
    if (oh.match(/^(Mo-Su|24\/7)/i)) {
      if (oh === '24/7') return JSON.stringify({ daily: '00:00-24:00' });
      const match = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
      if (match) return JSON.stringify({ daily: `${match[1]}-${match[2]}` });
    }
    // Просто сохраняем как строку в raw поле
    return JSON.stringify({ raw: oh });
  } catch {
    return JSON.stringify({ raw: oh });
  }
}

function getWebsite(tags) {
  return tags.website || tags.url || tags['contact:website'] || null;
}

function getPhone(tags) {
  return tags.phone || tags['contact:phone'] || null;
}

function getWikidata(tags) {
  return tags.wikidata || null;
}

function getWikipedia(tags) {
  return tags.wikipedia || null;
}

function escapeSQL(str) {
  if (!str) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function getCoordinates(element) {
  if (element.type === 'node') {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return { lat: null, lng: null };
}

// ─── FETCH OVERPASS ───────────────────────────────────────────────
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
        'User-Agent': 'kulture.by/1.0 (data collection for tourism portal)'
      }
    };

    console.log('📡 Отправляем запрос в Overpass API...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Ошибка парсинга JSON: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── ГЕНЕРАЦИЯ SQL ────────────────────────────────────────────────
function generateSQL(elements) {
  const seen = new Set();
  const rows = [];
  let skipped = 0;

  for (const el of elements) {
    const tags = el.tags || {};
    
    // Пропускаем без имени
    const name = tags.name || tags['name:ru'] || tags['name:be'];
    if (!name) { skipped++; continue; }
    
    // Пропускаем слишком короткие названия
    if (name.length < 3) { skipped++; continue; }

    const coords = getCoordinates(el);
    if (!coords.lat || !coords.lng) { skipped++; continue; }

    // Генерируем уникальный slug
    let baseSlug = slugify(name);
    if (!baseSlug) { skipped++; continue; }
    
    let slug = baseSlug;
    let counter = 1;
    while (seen.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    seen.add(slug);

    const category = getCategory(tags);
    const city = getCity(tags);
    const address = getAddress(tags);
    const workingHours = getWorkingHours(tags);
    const website = getWebsite(tags);
    const description = tags.description || tags['description:ru'] || 
                       tags['description:be'] || 
                       `${name} — ${category === 'history' ? 'историческое место' : 
                         category === 'nature' ? 'природный объект' :
                         category === 'castles' ? 'замок или дворец' :
                         category === 'museums' ? 'музей или галерея' :
                         category === 'gastro' ? 'гастрономическое место' :
                         category === 'activity' ? 'место для активного отдыха' :
                         category === 'kids' ? 'место для семейного отдыха' :
                         'интересное место'} в Беларуси.`;

    // Entry price
    let entryPrice = 0;
    if (tags.fee === 'yes') entryPrice = null; // неизвестная цена
    if (tags.fee === 'no') entryPrice = 0;
    if (tags['charge']) {
      const match = String(tags['charge']).match(/(\d+)/);
      if (match) entryPrice = parseInt(match[1]);
    }

    // OSM ID для референса
    const osmId = `${el.type}/${el.id}`;

    rows.push({
      name, slug, description, category,
      city: city || 'Беларусь',
      address,
      lat: coords.lat,
      lng: coords.lng,
      workingHours,
      entryPrice,
      website,
      osmId,
      wikidata: getWikidata(tags),
      wikipedia: getWikipedia(tags),
      phone: getPhone(tags),
      nameRu: tags['name:ru'] || null,
      nameBe: tags['name:be'] || null,
    });
  }

  console.log(`✅ Обработано: ${rows.length} мест, пропущено: ${skipped}`);

  // Генерируем SQL
  const sql = `-- ============================================================
-- МЕСТА БЕЛАРУСИ ИЗ OPENSTREETMAP
-- Сгенерировано: ${new Date().toISOString()}
-- Количество записей: ${rows.length}
-- Источник: OpenStreetMap (openstreetmap.org) — лицензия ODbL
-- ============================================================

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM public.profiles 
  WHERE role = 'admin' 
  ORDER BY created_at 
  LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Не найден admin пользователь в profiles';
  END IF;

  INSERT INTO public.places (
    name, slug, description, category, city, address,
    lat, lng, working_hours, entry_price, website, rating, created_by
  ) VALUES
${rows.map((r, i) => `  (
    ${escapeSQL(r.name)},
    ${escapeSQL(r.slug)},
    ${escapeSQL(r.description)},
    ${escapeSQL(r.category)},
    ${escapeSQL(r.city)},
    ${r.address ? escapeSQL(r.address) : 'NULL'},
    ${r.lat},
    ${r.lng},
    ${r.workingHours ? escapeSQL(r.workingHours) + '::jsonb' : 'NULL'},
    ${r.entryPrice !== null && r.entryPrice !== undefined ? r.entryPrice : 'NULL'},
    ${r.website ? escapeSQL(r.website) : 'NULL'},
    4.0,
    owner_id
  )${i < rows.length - 1 ? ',' : ''}`).join('\n')}
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE 'Импорт завершён: % записей', ${rows.length};
END;
$$;

-- ============================================================
-- СПРАВКА ПО ИМПОРТУ
-- Всего мест: ${rows.length}
-- Категории:
${Object.entries(rows.reduce((acc, r) => {
  acc[r.category] = (acc[r.category] || 0) + 1;
  return acc;
}, {})).map(([cat, count]) => `--   ${cat}: ${count}`).join('\n')}
-- ============================================================
`;

  return sql;
}

// ─── MAIN ─────────────────────────────────────────────────────────
async function main() {
  try {
    console.log('🗺  OSM Belarus Places Scraper для kulture.by');
    console.log('━'.repeat(50));
    
    const data = await fetchOverpass(OVERPASS_QUERY);
    
    if (!data.elements || data.elements.length === 0) {
      console.error('❌ Overpass вернул пустой результат');
      process.exit(1);
    }

    console.log(`📦 Получено элементов из OSM: ${data.elements.length}`);
    
    const sql = generateSQL(data.elements);
    
    const outputFile = 'belarus_osm_places.sql';
    fs.writeFileSync(outputFile, sql, 'utf8');
    
    console.log('━'.repeat(50));
    console.log(`✅ SQL файл сохранён: ${outputFile}`);
    console.log('');
    console.log('📋 Следующий шаг:');
    console.log('   Supabase → SQL Editor → открыть файл → Run');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
