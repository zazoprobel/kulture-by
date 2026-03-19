"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type PlaceItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string | null;
  rating: number | null;
  entry_price: number | null;
};

type Filters = {
  category: string;
  city: string;
  entry: "all" | "free" | "paid";
  ratingFrom: string;
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
const ratings = ["4.0", "4.5", "4.8"] as const;

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
  city: "all",
  entry: "all",
  ratingFrom: "",
};

export function PlacesCatalogClient({
  initialItems,
  totalCount,
}: {
  initialItems: PlaceItem[];
  totalCount: number;
}) {
  const [items, setItems] = useState<PlaceItem[]>(initialItems);
  const [count, setCount] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        let query = supabase
          .from("places")
          .select("id,slug,name,category,city,address,rating,entry_price", { count: "exact" });

        if (filters.category !== "all") query = query.eq("category", filters.category);
        if (filters.city !== "all") query = query.eq("city", filters.city);
        if (filters.entry === "free") query = query.or("entry_price.is.null,entry_price.eq.0");
        if (filters.entry === "paid") query = query.gt("entry_price", 0);
        if (filters.ratingFrom) query = query.gte("rating", Number(filters.ratingFrom));

        query = sortBy === "price" ? query.order("entry_price", { ascending: true, nullsFirst: true }) : query.order("rating", { ascending: false });
        const { data, error, count: nextCount } = await query.limit(100);
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
  }, [filters, sortBy]);

  const chips = useMemo(() => {
    const list: Array<{ key: keyof Filters; label: string }> = [];
    if (filters.category !== "all") list.push({ key: "category", label: `Категория: ${categories.find((x) => x.value === filters.category)?.label ?? filters.category}` });
    if (filters.city !== "all") list.push({ key: "city", label: `Город: ${filters.city}` });
    if (filters.entry !== "all") list.push({ key: "entry", label: `Вход: ${filters.entry === "free" ? "Бесплатно" : "Платно"}` });
    if (filters.ratingFrom) list.push({ key: "ratingFrom", label: `Рейтинг от: ${filters.ratingFrom}` });
    return list;
  }, [filters]);

  const resetOne = (key: keyof Filters) => setFilters((prev) => ({ ...prev, [key]: initialFilters[key] }));

  const sidebar = (
    <aside className="sidebar">
      <div className="sbTitleRow">
        <div className="sbTitle">Фильтры</div>
        <button type="button" className="resetBtn" onClick={() => setFilters(initialFilters)}>Сбросить всё</button>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Категория</div>
        <select className="field" value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
          {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Город</div>
        <select className="field" value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
          <option value="all">Все</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Вход</div>
        <select className="field" value={filters.entry} onChange={(e) => setFilters((p) => ({ ...p, entry: e.target.value as Filters["entry"] }))}>
          <option value="all">Все</option>
          <option value="free">Бесплатно</option>
          <option value="paid">Платно</option>
        </select>
      </div>

      <div className="sbGroup" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
        <div className="sbLabel">Рейтинг</div>
        <select className="field" value={filters.ratingFrom} onChange={(e) => setFilters((p) => ({ ...p, ratingFrom: e.target.value }))}>
          <option value="">Все</option>
          {ratings.map((rating) => <option key={rating} value={rating}>от {rating}</option>)}
        </select>
      </div>
    </aside>
  );

  return (
    <>
      <div className="mobileFiltersTriggerWrap">
        <button type="button" className="mobileFiltersBtn" onClick={() => setMobileFiltersOpen(true)}>Фильтры</button>
      </div>

      <div className="layout">
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

          <div className="chips">
            {chips.map((chip) => (
              <button key={chip.label} type="button" className="chip" onClick={() => resetOne(chip.key)}>
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
                    <Image src={placeImageByCategory[place.category] ?? "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900"} alt={place.name} fill unoptimized style={{ objectFit: "cover" }} sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw" />
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
                    <Image src={placeImageByCategory[place.category] ?? "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900"} alt={place.name} fill unoptimized style={{ objectFit: "cover" }} />
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
        </main>
      </div>

      {mobileFiltersOpen ? (
        <div className="drawerBack" onClick={() => setMobileFiltersOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerHandle" />
            {sidebar}
            <button type="button" className="applyBtn" onClick={() => setMobileFiltersOpen(false)}>Применить</button>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .layout{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
        .content{min-width:0}
        .sidebar{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:24px;position:sticky;top:86px}
        .sbTitleRow{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sbTitle{font-family:"Unbounded",sans-serif;font-size:14px}
        .resetBtn{background:none;border:none;color:#666;font-size:12px}
        .sbGroup{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(0,0,0,.08)}
        .sbLabel{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px}
        .field{width:100%;height:38px;border-radius:10px;border:1px solid rgba(0,0,0,.1);padding:0 10px;background:#fff}
        .topRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
        .count{font-size:14px;color:#666}
        .controls{display:flex;align-items:center;gap:8px}
        .sort{height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.1);padding:0 10px;background:#fff}
        .viewBtns{display:flex;gap:4px}
        .vBtn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,.1);background:#fff}
        .vBtn.on{background:#181818;color:#fff}
        .chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
        .chip{height:30px;padding:0 12px;border-radius:99px;border:none;background:rgba(0,0,0,.07);display:inline-flex;align-items:center;gap:6px;font-size:12px}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .thumb{height:180px;position:relative}
        .body{padding:16px}
        .title{font-family:"Unbounded",sans-serif;font-size:13px;line-height:1.3}
        .meta{margin-top:6px;color:#666;font-size:12px}
        .price{margin-top:8px;font-weight:700}
        .list{display:flex;flex-direction:column;gap:14px}
        .listCard{display:grid;grid-template-columns:240px 1fr;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .listThumb{height:180px;position:relative}
        .listBody{padding:16px}
        .empty{padding:24px;border-radius:16px;background:#fff;border:1px dashed rgba(0,0,0,.15);color:#666}
        .mobileFiltersTriggerWrap{display:none}
        .drawerBack{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1200;display:flex;align-items:flex-end}
        .drawer{width:100%;max-height:85vh;background:#F7F6F2;border-radius:18px 18px 0 0;padding:10px 16px 18px;overflow:auto}
        .drawerHandle{width:52px;height:5px;border-radius:99px;background:rgba(0,0,0,.22);margin:0 auto 10px}
        .applyBtn{width:100%;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;margin-top:10px}
        @media (max-width:1024px){.grid{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:767px){
          .layout{grid-template-columns:1fr}
          .desktopOnly{display:none}
          .mobileFiltersTriggerWrap{display:flex;justify-content:flex-end;margin-bottom:10px}
          .mobileFiltersBtn{height:38px;padding:0 14px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:#fff}
          .grid,.listCard{grid-template-columns:1fr}
          .listThumb{height:200px}
        }
      `}</style>
    </>
  );
}
