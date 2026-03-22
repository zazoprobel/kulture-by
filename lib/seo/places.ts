export const PLACES_PAGE_SIZE = 24;

// URL segments (CHPU) -> DB values
// We keep these transliterations stable for SEO.
export const PLACES_CATEGORY_URL_TO_DB: Record<string, string> = {
  priroda: "nature",
  istorija: "history",
  zamki: "castles",
  muzei: "museums",
  gastro: "gastro",
  "aktivnyj-otdyh": "activity",
  "s-detmi": "kids",
};

export const PLACES_DB_TO_CATEGORY_URL: Record<string, string> = Object.fromEntries(
  Object.entries(PLACES_CATEGORY_URL_TO_DB).map(([url, db]) => [db, url])
);

export const PLACES_CITY_URL_TO_DB: Record<string, string> = {
  minsk: "Минск",
  brest: "Брест",
  grodno: "Гродно",
  vitebsk: "Витебск",
  gomel: "Гомель",
  mogilev: "Могилёв",
};

export const PLACES_DB_TO_CITY_URL: Record<string, string> = Object.fromEntries(
  Object.entries(PLACES_CITY_URL_TO_DB).map(([url, db]) => [db, url])
);

export const PLACES_CATEGORY_LABEL_RU: Record<string, string> = {
  nature: "Природа",
  history: "История",
  castles: "Замки",
  museums: "Музеи",
  gastro: "Гастро",
  activity: "Активный отдых",
  kids: "С детьми",
};

export function getPlacesCategoryUrlSegment(categoryDb: string | "all"): string | null {
  if (categoryDb === "all") return null;
  return PLACES_DB_TO_CATEGORY_URL[categoryDb] ?? null;
}

export function getPlacesCityUrlSegment(cityDb: string): string | null {
  return PLACES_DB_TO_CITY_URL[cityDb] ?? null;
}

export function getPlacesCategoryDbFromUrlSegment(slug: string): string | null {
  return PLACES_CATEGORY_URL_TO_DB[slug] ?? null;
}

export function getPlacesCityDbFromUrlSegment(slug: string): string | null {
  return PLACES_CITY_URL_TO_DB[slug] ?? null;
}

export function placesListingTitle(categoryDb: string | "all", cityDb: string | null) {
  const catLabel = categoryDb === "all" ? "Интересные места" : PLACES_CATEGORY_LABEL_RU[categoryDb] ?? categoryDb;
  const cityPart = cityDb ? ` ${cityDb}` : "";
  const brand = "kulture.by";
  // Keep title short enough for SERP.
  if (categoryDb === "all") {
    return cityDb
      ? `Интересные места ${cityDb} — Беларусь | ${brand}`
      : `Интересные места Беларуси для прогулок и поездок | ${brand}`;
  }
  return `${catLabel} Беларуси для прогулок и поездок${cityPart} | ${brand}`;
}

export function placesListingDescription(categoryDb: string | "all", cityDb: string | null) {
  const catLabel = categoryDb === "all" ? "места" : PLACES_CATEGORY_LABEL_RU[categoryDb] ?? categoryDb;
  const cityPart = cityDb ? `в ${cityDb}` : "по всей Беларуси";
  return `Красивые ${catLabel} Беларуси ${cityPart}: цены, рейтинг и отзывы. Путеводитель, чтобы выбрать куда сходить и как спланировать маршрут.`;
}

/** Client/server: ЧПУ списка мест; «все категории + город» → /places/minsk, /places/minsk/page/2 */
export function buildPlacesListingPath(
  filters: { category: string; cities: string[] },
  page: number,
): string {
  const catSeg = getPlacesCategoryUrlSegment(filters.category);
  const cityDb = filters.cities.length > 0 ? filters.cities[0] : null;
  const citySeg = cityDb ? getPlacesCityUrlSegment(cityDb) : null;

  if (!catSeg) {
    if (page > 1) {
      return citySeg ? `/places/${citySeg}/page/${page}` : `/places/page/${page}`;
    }
    return citySeg ? `/places/${citySeg}` : "/places";
  }

  const base = citySeg ? `/places/${catSeg}/${citySeg}` : `/places/${catSeg}`;
  if (page <= 1) return base;
  return citySeg ? `${base}/page/${page}` : `/places/${catSeg}/page/${page}`;
}

export function placesCanonicalPath(args: {
  categoryDb: string | "all";
  cityDb: string | null;
  page: number;
}): string {
  const { categoryDb, cityDb, page } = args;
  const catSeg = getPlacesCategoryUrlSegment(categoryDb);

  if (!catSeg) {
    const citySeg = cityDb ? getPlacesCityUrlSegment(cityDb) : null;
    if (page > 1) {
      return citySeg ? `/places/${citySeg}/page/${page}` : `/places/page/${page}`;
    }
    return citySeg ? `/places/${citySeg}` : "/places";
  }

  if (!cityDb) {
    const base = `/places/${catSeg}`;
    return page <= 1 ? base : `/places/${catSeg}/page/${page}`;
  }

  const citySeg = getPlacesCityUrlSegment(cityDb);
  if (!citySeg) {
    const base = `/places/${catSeg}`;
    return page <= 1 ? base : `/places/${catSeg}/page/${page}`;
  }

  const base = `/places/${catSeg}/${citySeg}`;
  return page <= 1 ? base : `${base}/page/${page}`;
}

