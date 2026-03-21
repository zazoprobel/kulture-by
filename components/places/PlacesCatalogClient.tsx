"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getPlacesCategoryUrlSegment, getPlacesCityUrlSegment } from "@/lib/seo/places";

export type PlaceItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string | null;
  rating: number | null;
  entry_price: number | null;
  image_url?: string | null;
};

type Filters = {
  category: string;
  cities: string[];
  entry: "all" | "free" | "paid";
  ratings: string[];
};

const categories = [
  { value: "all", label: "Все" },
  { value: "nature", label: "Природа" },
  { value: "history", label: "История" },
  { value: "castles", label: "Замки" },
  { value: "museums", label: "Музеи" },
  { value: "gastro", label: "Гастро" },
  { value: "activity", label: "Активный отдых" },
  { value: "kids", label: "С детьми" },
] as const;

const cities = ["Минск", "Брест", "Гродно", "Витебск", "Гомель", "Могилёв"] as const;
const ratings = ["4.5", "4.0"] as const;

const placeImageByCategory: Record<string, string> = {
  history: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900",
  nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900",
  castles: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900",
  museums: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900",
  gastro: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900",
  activity: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900",
};

const initialFilters: Filters = {
  category: "all",
  cities: [],
  entry: "all",
  ratings: [],
};

const PAGE_SIZE = 24; // 4 карточки * 6 рядов

export function PlacesCatalogClient({
  initialItems,
  totalCount,
  initialFilters: initialFiltersFromSeo,
  initialPage,
}: {
  initialItems: PlaceItem[];
  totalCount: number;
  initialFilters?: Filters;
  initialPage?: number;
}) {
  const [items, setItems] = useState<PlaceItem[]>(initialItems);
  const [count, setCount] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [filters, setFilters] = useState<Filters>(initialFiltersFromSeo ?? initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(initialPage ?? 1);

  const router = useRouter();
  const skipPageResetRef = useRef(false);
  const didMountOnceRef = useRef(false);

  const stripNonSeoFilters = (f: Filters): Filters => ({
    ...f,
    entry: "all",
    ratings: [],
  });

  const buildSeoBasePath = (f: Filters): string => {
    const catSeg = getPlacesCategoryUrlSegment(f.category);
    if (!catSeg) return "/places";

    const cityDb = f.cities.length > 0 ? f.cities[0] : null;
    if (!cityDb) return `/places/${catSeg}`;

    const citySeg = getPlacesCityUrlSegment(cityDb);
    return citySeg ? `/places/${catSeg}/${citySeg}` : `/places/${catSeg}`;
  };

  const navToSeoPage = (nextFilters: Filters, nextPage: number) => {
    const seoFilters = stripNonSeoFilters(nextFilters);
    const basePath = buildSeoBasePath(seoFilters);
    const href = nextPage <= 1 ? basePath : `${basePath}/page/${nextPage}`;

    skipPageResetRef.current = true;
    setFilters(seoFilters);
    setPage(nextPage);
    router.push(href);
  };

  // При изменении фильтров/сортировки всегда возвращаемся на 1 страницу.
  useEffect(() => {
    if (!didMountOnceRef.current) {
      didMountOnceRef.current = true;
      return;
    }
    if (skipPageResetRef.current) {
      skipPageResetRef.current = false;
      return;
    }
    setPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from("places")
          .select("id,slug,name,category,city,address,rating,entry_price,image_url", { count: "exact" });

        if (filters.category !== "all") query = query.eq("category", filters.category);
        if (filters.cities.length > 0) query = query.in("city", filters.cities);
        if (filters.entry === "free") query = query.or("entry_price.is.null,entry_price.eq.0");
        if (filters.entry === "paid") query = query.gt("entry_price", 0);
        if (filters.ratings.length > 0) query = query.gte("rating", Math.min(...filters.ratings.map(Number)));

        query = sortBy === "price" ? query.order("entry_price", { ascending: true, nullsFirst: true }) : query.order("rating", { ascending: false });
        const { data, error, count: nextCount } = await query.range(from, to);
        if (error) throw error;

        if (!isCancelled) {
          setItems((data ?? []) as PlaceItem[]);
          setCount(nextCount ?? 0);
        }
      } catch (error) {
        console.error("places filter error", error);
        if (!isCancelled) {
          setItems([]);
          setCount(0);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [filters, sortBy, page]);

  const chips = useMemo(() => {
    const list: Array<{ key: keyof Filters; label: string }> = [];
    if (filters.category !== "all") list.push({ key: "category", label: `Категория: ${categories.find((x) => x.value === filters.category)?.label ?? filters.category}` });
    if (filters.cities.length > 0) list.push({ key: "cities", label: `Город: ${filters.cities.length}` });
    if (filters.entry !== "all") list.push({ key: "entry", label: `Вход: ${filters.entry === "free" ? "Бесплатно" : "Платно"}` });
    if (filters.ratings.length > 0) list.push({ key: "ratings", label: `Рейтинг: ${filters.ratings.join(", ")}` });
    return list;
  }, [filters]);

  const pageCount = Math.ceil(count / PAGE_SIZE);
  const canPrev = page > 1;
  const canNext = pageCount > 0 && page < pageCount;

  const visiblePages = (() => {
    if (pageCount <= 1) return [] as number[];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(pageCount, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  })();

  const resetOne = (key: keyof Filters) => {
    const next: Filters = { ...filters, [key]: initialFilters[key] } as Filters;
    if (key === "category" || key === "cities") {
      navToSeoPage(next, 1);
      return;
    }
    setFilters(next);
  };

  const sidebar = (
    <aside className="sidebar">
      <div className="sbTitleRow">
        <div className="sb-title">Фильтры</div>
        <button type="button" className="sb-reset" onClick={() => navToSeoPage(initialFilters, 1)}>Сбросить всё</button>
      </div>

      <div className="sb-group">
        <div className="sb-label">Категория</div>
        {categories.map((item) => (
          <label className="sb-opt" key={item.value}>
            <input
              type="radio"
              name="place-category"
              checked={filters.category === item.value}
              onChange={() =>
                navToSeoPage(
                  {
                    ...filters,
                    category: item.value,
                    cities: item.value === "all" ? [] : filters.cities,
                  },
                  1,
                )
              }
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="sb-group">
        <div className="sb-label">Город</div>
        {cities.map((city) => (
          <label className="sb-opt" key={city}>
            <input
              type="checkbox"
              checked={filters.cities.includes(city)}
              onChange={(e) =>
                navToSeoPage(
                  {
                    ...filters,
                    cities: filters.category === "all" ? [] : e.target.checked ? [city] : [],
                    category: filters.category,
                  },
                  1,
                )
              }
            />
            {city}
          </label>
        ))}
      </div>

      <div className="sb-group">
        <div className="sb-label">Вход</div>
        <label className="sb-opt">
          <input type="radio" name="place-entry" checked={filters.entry === "all"} onChange={() => setFilters((p) => ({ ...p, entry: "all" }))} />
          Все
        </label>
        <label className="sb-opt">
          <input type="radio" name="place-entry" checked={filters.entry === "free"} onChange={() => setFilters((p) => ({ ...p, entry: "free" }))} />
          Бесплатно
        </label>
        <label className="sb-opt">
          <input type="radio" name="place-entry" checked={filters.entry === "paid"} onChange={() => setFilters((p) => ({ ...p, entry: "paid" }))} />
          Платно
        </label>
      </div>

      <div className="sb-group">
        <div className="sb-label">Рейтинг</div>
        {ratings.map((rating) => (
          <label className="sb-opt" key={rating}>
            <input
              type="checkbox"
              checked={filters.ratings.includes(rating)}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  ratings: e.target.checked ? [...p.ratings, rating] : p.ratings.filter((v) => v !== rating),
                }))
              }
            />
            {rating} и выше
          </label>
        ))}
      </div>
      <button type="button" className="sb-apply">Применить фильтры</button>
    </aside>
  );

  return (
    <div className="placesCatalog">
      <div className="page-layout">
        <div className="desktopOnly">{sidebar}</div>

        <main className="content">
          <div className="topRow">
            <div className="count">Найдено <strong>{count}</strong></div>
            <div className="controls">
              <select className="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as "rating" | "price")}>
                <option value="rating">По рейтингу</option>
                <option value="price">По цене</option>
              </select>
              <div className="viewBtns">
                <button type="button" className={`vBtn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")}>⊞</button>
                <button type="button" className={`vBtn ${view === "list" ? "on" : ""}`} onClick={() => setView("list")}>≡</button>
              </div>
            </div>
          </div>

          <div className="active-chips">
            {chips.map((chip) => (
              <button key={chip.label} type="button" className="act-chip" onClick={() => resetOne(chip.key)}>
                {chip.label} <span>×</span>
              </button>
            ))}
          </div>

          {loading ? <div className="empty">Загрузка...</div> : null}
          {!loading && items.length === 0 ? <div className="empty">По выбранным фильтрам мест не найдено.</div> : null}

          {!loading && items.length > 0 && view === "grid" ? (
            <div className="grid">
              {items.map((place) => (
                <Link key={place.id} href={`/places/${place.slug}`} className="card">
                  <div className="thumb">
                    <Image src={place.image_url || placeImageByCategory[place.category] || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900"} alt={place.name} fill unoptimized style={{ objectFit: "cover" }} sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  </div>
                  <div className="body">
                    <div className="title">{place.name}</div>
                    <div className="meta">{place.city}{place.address ? ` · ${place.address}` : ""}</div>
                    <div className="meta">⭐ {place.rating ?? 0} · {place.entry_price && place.entry_price > 0 ? `от ${Math.round(place.entry_price)} BYN` : "Бесплатно"}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && items.length > 0 && view === "list" ? (
            <div className="list">
              {items.map((place) => (
                <Link key={place.id} href={`/places/${place.slug}`} className="listCard">
                  <div className="listThumb">
                    <Image src={place.image_url || placeImageByCategory[place.category] || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900"} alt={place.name} fill unoptimized style={{ objectFit: "cover" }} />
                  </div>
                  <div className="listBody">
                    <div className="title">{place.name}</div>
                    <div className="meta">{place.city}{place.address ? ` · ${place.address}` : ""}</div>
                    <div className="meta">Категория: {place.category} · ⭐ {place.rating ?? 0}</div>
                    <div className="price">{place.entry_price && place.entry_price > 0 ? `от ${Math.round(place.entry_price)} BYN` : "Бесплатно"}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && items.length > 0 && pageCount > 1 ? (
            <div className="pagination">
              <div className="pagesInfo">
                Страница <strong>{page}</strong> из <strong>{pageCount}</strong>
              </div>
              <div className="pageBtns">
                <button
                  type="button"
                  className="pBtn"
                  disabled={!canPrev}
                  onClick={() => navToSeoPage(filters, Math.max(1, page - 1))}
                >
                  ‹
                </button>
                {visiblePages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`pBtn ${p === page ? "on" : ""}`}
                    disabled={p === page}
                    onClick={() => navToSeoPage(filters, p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="pBtn"
                  disabled={!canNext}
                  onClick={() => navToSeoPage(filters, Math.min(pageCount, page + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <button type="button" className="mobile-filters-fixed" onClick={() => setMobileFiltersOpen(true)}>
        Фильтры
      </button>

      {mobileFiltersOpen ? (
        <div className="drawerBack" onClick={() => setMobileFiltersOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerHandle" />
            <button
              type="button"
              className="drawerClose"
              aria-label="Закрыть фильтры"
              onClick={() => setMobileFiltersOpen(false)}
            >
              ✕
            </button>
            {sidebar}
            <button type="button" className="applyBtn" onClick={() => setMobileFiltersOpen(false)}>Применить</button>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .placesCatalog .page-layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; margin-top: 28px; align-items: start; }
        .placesCatalog .content{min-width:0}
        .placesCatalog .sidebar { background: white; border-radius: 20px; border: 1.5px solid rgba(0,0,0,0.08); padding: 24px; position: sticky; top: 80px; }
        .placesCatalog .sbTitleRow{display:flex;align-items:center;justify-content:space-between}
        .placesCatalog .sb-title { font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .placesCatalog .sb-reset { font-size: 12px; font-weight: 500; color: #888; cursor: pointer; background: none; border: none; }
        .placesCatalog .sb-group { margin-bottom: 22px; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 22px; }
        .placesCatalog .sb-group:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .placesCatalog .sb-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #888; margin-bottom: 12px; }
        .placesCatalog .sb-opt { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; font-size: 13px; }
        .placesCatalog .sb-opt input { width: 16px; height: 16px; accent-color: #181818; cursor: pointer; }
        .placesCatalog .sb-apply { width: 100%; height: 42px; border-radius: 12px; border: none; background: #181818; color: white; font-size: 13px; font-weight: 700; margin-top: 18px; cursor: pointer; }
        .placesCatalog .topRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
        .placesCatalog .count{font-size:14px;color:#666}
        .placesCatalog .controls{display:flex;align-items:center;gap:8px}
        .placesCatalog .sort{height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.1);padding:0 10px;background:#fff}
        .placesCatalog .viewBtns{display:flex;gap:4px}
        .placesCatalog .vBtn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,.1);background:#fff}
        .placesCatalog .vBtn.on{background:#181818;color:#fff}
        .placesCatalog .active-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
        .placesCatalog .act-chip { display: flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 99px; background: rgba(0,0,0,0.07); font-size: 12px; border: none; cursor: pointer; }
        .placesCatalog .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .placesCatalog .pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px}
        .placesCatalog .pagesInfo{font-size:13px;color:#666}
        .placesCatalog .pageBtns{display:flex;gap:8px;align-items:center}
        .placesCatalog .pBtn{min-width:34px;height:34px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:#fff;color:#181818;font-weight:700;cursor:pointer;padding:0 12px}
        .placesCatalog .pBtn.on{background:#181818;color:#fff}
        .placesCatalog .pBtn:disabled{opacity:.55;cursor:not-allowed}
        .placesCatalog .card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .placesCatalog .thumb{height:180px;position:relative}
        .placesCatalog .body{padding:16px}
        .placesCatalog .title{font-family:"Unbounded",sans-serif;font-size:13px;line-height:1.3}
        .placesCatalog .meta{margin-top:6px;color:#666;font-size:12px}
        .placesCatalog .price{margin-top:8px;font-weight:700}
        .placesCatalog .list{display:flex;flex-direction:column;gap:14px}
        .placesCatalog .listCard{display:grid;grid-template-columns:240px 1fr;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .placesCatalog .listThumb{height:180px;position:relative}
        .placesCatalog .listBody{padding:16px}
        .placesCatalog .empty{padding:24px;border-radius:16px;background:#fff;border:1px dashed rgba(0,0,0,.15);color:#666}
        .placesCatalog .mobile-filters-fixed{display:none}
        .placesCatalog .drawerBack{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1200;display:flex;align-items:flex-end}
        .placesCatalog .drawer{position:relative;width:100%;max-height:85vh;background:#F7F6F2;border-radius:18px 18px 0 0;padding:10px 16px 18px;overflow:auto}
        .placesCatalog .drawerHandle{width:52px;height:5px;border-radius:99px;background:rgba(0,0,0,.22);margin:0 auto 10px}
        .placesCatalog .drawerClose{position:absolute;right:16px;top:12px;width:34px;height:34px;border:none;border-radius:10px;background:#fff;font-size:18px;line-height:1;cursor:pointer}
        .placesCatalog .applyBtn{width:100%;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;margin-top:10px}
        @media (max-width:1024px){.placesCatalog .grid{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:767px){
          .placesCatalog .page-layout{grid-template-columns:1fr;margin-top:0}
          .placesCatalog .desktopOnly{display:none}
          .placesCatalog .mobile-filters-fixed{display:block;position:fixed;left:16px;right:16px;bottom:16px;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;font-weight:700;z-index:1100}
          .placesCatalog .grid,.placesCatalog .listCard{grid-template-columns:1fr}
          .placesCatalog .listThumb{height:200px}
        }
      `}</style>
    </div>
  );
}
