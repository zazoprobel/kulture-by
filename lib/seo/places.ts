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
  return categoryDb === "all"
    ? `Интересные места Беларуси для прогулок и поездок | ${brand}`
    : `${catLabel} Беларуси для прогулок и поездок${cityPart} | ${brand}`;
}

export function placesListingDescription(categoryDb: string | "all", cityDb: string | null) {
  const catLabel = categoryDb === "all" ? "места" : PLACES_CATEGORY_LABEL_RU[categoryDb] ?? categoryDb;
  const cityPart = cityDb ? `в ${cityDb}` : "по всей Беларуси";
  return `Красивые ${catLabel} Беларуси ${cityPart}: цены, рейтинг и отзывы. Путеводитель, чтобы выбрать куда сходить и как спланировать маршрут.`;
}

export function placesCanonicalPath(args: {
  categoryDb: string | "all";
  cityDb: string | null;
  page: number;
}): string {
  const { categoryDb, cityDb, page } = args;

  const base = (() => {
    const catSeg = getPlacesCategoryUrlSegment(categoryDb);
    // Per your request: city is not combined alone; city segment only makes sense under a category.
    if (!catSeg) return "/places";
    if (!cityDb) return `/places/${catSeg}`;
    const citySeg = getPlacesCityUrlSegment(cityDb);
    if (!citySeg) return `/places/${catSeg}`;
    return `/places/${catSeg}/${citySeg}`;
  })();

  if (page <= 1) return base;
  return `${base}/page/${page}`;
}

