#!/usr/bin/env node
import fs from "node:fs";

const CITIES = [
  { ru: "Минск", overpassName: "Minsk" },
  { ru: "Брест", overpassName: "Brest" },
  { ru: "Гродно", overpassName: "Grodno" },
  { ru: "Витебск", overpassName: "Vitebsk" },
  { ru: "Гомель", overpassName: "Gomel" },
  { ru: "Могилёв", overpassName: "Mogilev" },
];

const TYPE_IMAGES = {
  restaurant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
  outdoor: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200",
  banquet: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
  loft: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
};

function slugify(text) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", і: "i", ў: "u",
  };
  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function parseType(tags) {
  if (tags.tourism === "hotel" || tags.tourism === "guest_house") return "hotel";
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "restaurant";
  if (tags.leisure === "park" || tags.leisure === "garden") return "outdoor";
  if (tags.amenity === "event_venue") return "banquet";
  if (tags.shop === "mall") return "loft";
  return "restaurant";
}

function randomCapacity(seed) {
  const base = 70 + (seed % 110);
  return { banquet: base, buffet: Math.round(base * 1.4) };
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOverpass(query) {
  let lastError = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "kulture.by/1.0" },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (response.ok) return response.json();
      lastError = new Error(`${endpoint} failed: ${response.status}`);

      if (response.status === 429 || response.status >= 500) {
        await sleep(2500 * attempt);
        continue;
      }
      break;
    }
  }
  throw lastError ?? new Error("Overpass request failed");
}

function queryForCity(name) {
  return `
[out:json][timeout:180];
area["name"="${name}"]["admin_level"~"6|8"]->.city;
(
  node["amenity"~"restaurant|cafe|fast_food"](area.city);
  way["amenity"~"restaurant|cafe|fast_food"](area.city);
  node["tourism"~"hotel|guest_house"](area.city);
  way["tourism"~"hotel|guest_house"](area.city);
  node["amenity"="event_venue"](area.city);
  way["amenity"="event_venue"](area.city);
  node["leisure"~"park|garden"](area.city);
  way["leisure"~"park|garden"](area.city);
);
out center tags;
`;
}

async function main() {
  const seen = new Set();
  const venues = [];

  for (const city of CITIES) {
    const data = await fetchOverpass(queryForCity(city.overpassName));
    const elements = data.elements ?? [];
    let addedForCity = 0;

    for (const el of elements) {
      const tags = el.tags ?? {};
      const name = tags["name:ru"] || tags.name;
      if (!name || name.length < 3) continue;

      const type = parseType(tags);
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) continue;

      const baseSlug = slugify(`${name}-${city.ru}`);
      if (!baseSlug) continue;
      let slug = baseSlug;
      let i = 2;
      while (seen.has(slug)) slug = `${baseSlug}-${i++}`;
      seen.add(slug);

      const caps = randomCapacity(venues.length + 11);
      const priceFrom = type === "hotel" ? 180 : type === "outdoor" ? 2200 : 90 + (venues.length % 140);

      venues.push({
        name,
        slug,
        description: `${name} — площадка в городе ${city.ru} для событий, гастрономии и городского отдыха.`,
        type,
        city: city.ru,
        address: tags["addr:street"] ? `${tags["addr:street"]}${tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : ""}` : null,
        lat,
        lng,
        capacityBanquet: caps.banquet,
        capacityBuffet: caps.buffet,
        priceFrom,
        rating: 4.2 + ((venues.length % 7) / 10),
        imageUrl: TYPE_IMAGES[type],
      });

      addedForCity += 1;
      if (addedForCity >= 45) break;
    }
    await sleep(1200);
  }

  const sql = `-- Belarus venues import from OSM (restaurants/hotels/outdoor/event venues)
-- Generated at ${new Date().toISOString()}
-- Rows: ${venues.length}
DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM public.profiles WHERE role='admin' ORDER BY created_at LIMIT 1;
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No admin in profiles';
  END IF;
  INSERT INTO public.venues (
    name, slug, description, type, city, address, lat, lng, capacity_banquet, capacity_buffet, price_from, rating, image_url, created_by
  ) VALUES
${venues.map((v, idx) => `  (
    ${escapeSql(v.name)},
    ${escapeSql(v.slug)},
    ${escapeSql(v.description)},
    ${escapeSql(v.type)},
    ${escapeSql(v.city)},
    ${escapeSql(v.address)},
    ${v.lat},
    ${v.lng},
    ${v.capacityBanquet},
    ${v.capacityBuffet},
    ${v.priceFrom},
    ${Number(v.rating).toFixed(1)},
    ${escapeSql(v.imageUrl)},
    owner_id
  )${idx < venues.length - 1 ? "," : ""}`).join("\n")}
  ON CONFLICT (slug) DO NOTHING;
  RAISE NOTICE 'Venues import done: ${venues.length}';
END $$;
`;

  fs.writeFileSync("belarus_osm_venues.sql", sql, "utf8");
  console.log(`Done. Generated belarus_osm_venues.sql with ${venues.length} rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
