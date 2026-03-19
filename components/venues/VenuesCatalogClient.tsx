"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type VenueItem = {
  id: string;
  slug: string;
  name: string;
  city: string;
  type: string;
  rating: number | null;
  capacity_banquet: number | null;
  capacity_buffet: number | null;
  price_from: number | null;
};

type Filters = {
  type: string;
  guestsFrom: string;
  guestsTo: string;
  budgetFrom: string;
  budgetTo: string;
  city: string;
  ratingFrom: string;
};

const typeOptions = [
  { value: "all", label: "Все" },
  { value: "restaurant", label: "Рестораны" },
  { value: "banquet", label: "Банкетные залы" },
  { value: "loft", label: "Лофты" },
  { value: "estate", label: "Загородные усадьбы" },
  { value: "hotel", label: "Отели" },
  { value: "outdoor", label: "На природе" },
] as const;

const cityOptions = ["Минск", "Брест", "Гродно", "Витебск", "Гомель", "Могилёв"] as const;
const ratingOptions = ["4.0", "4.5", "4.8"] as const;

const imageByType: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900",
  banquet: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900",
  loft: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900",
  estate: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
  outdoor: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
};

const initialFilters: Filters = {
  type: "all",
  guestsFrom: "",
  guestsTo: "",
  budgetFrom: "",
  budgetTo: "",
  city: "all",
  ratingFrom: "",
};

export function VenuesCatalogClient({ initialItems }: { initialItems: VenueItem[] }) {
  const [items, setItems] = useState<VenueItem[]>(initialItems);
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
          .from("venues")
          .select("id,slug,name,city,type,rating,capacity_banquet,capacity_buffet,price_from");

        if (filters.type !== "all") {
          if (filters.type === "estate") {
            query = query.eq("type", "outdoor");
          } else {
            query = query.eq("type", filters.type);
          }
        }
        if (filters.guestsFrom) query = query.gte("capacity_banquet", Number(filters.guestsFrom));
        if (filters.guestsTo) query = query.lte("capacity_banquet", Number(filters.guestsTo));
        if (filters.budgetFrom) query = query.gte("price_from", Number(filters.budgetFrom));
        if (filters.budgetTo) query = query.lte("price_from", Number(filters.budgetTo));
        if (filters.city !== "all") query = query.eq("city", filters.city);
        if (filters.ratingFrom) query = query.gte("rating", Number(filters.ratingFrom));

        query = sortBy === "price" ? query.order("price_from", { ascending: true }) : query.order("rating", { ascending: false });
        const { data, error } = await query.limit(100);
        if (error) throw error;

        if (!isCancelled) {
          setItems((data ?? []) as VenueItem[]);
        }
      } catch (error) {
        console.error("venues filter error", error);
        if (!isCancelled) setItems([]);
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
    if (filters.type !== "all") list.push({ key: "type", label: `Тип: ${typeOptions.find((x) => x.value === filters.type)?.label ?? filters.type}` });
    if (filters.guestsFrom) list.push({ key: "guestsFrom", label: `Гостей от: ${filters.guestsFrom}` });
    if (filters.guestsTo) list.push({ key: "guestsTo", label: `Гостей до: ${filters.guestsTo}` });
    if (filters.budgetFrom) list.push({ key: "budgetFrom", label: `Бюджет от: ${filters.budgetFrom}` });
    if (filters.budgetTo) list.push({ key: "budgetTo", label: `Бюджет до: ${filters.budgetTo}` });
    if (filters.city !== "all") list.push({ key: "city", label: `Город: ${filters.city}` });
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
        <div className="sbLabel">Тип</div>
        <select className="field" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
          {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Количество гостей</div>
        <div className="fieldRow">
          <input className="field" placeholder="от" value={filters.guestsFrom} onChange={(e) => setFilters((p) => ({ ...p, guestsFrom: e.target.value }))} />
          <input className="field" placeholder="до" value={filters.guestsTo} onChange={(e) => setFilters((p) => ({ ...p, guestsTo: e.target.value }))} />
        </div>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Бюджет (BYN)</div>
        <div className="fieldRow">
          <input className="field" placeholder="от" value={filters.budgetFrom} onChange={(e) => setFilters((p) => ({ ...p, budgetFrom: e.target.value }))} />
          <input className="field" placeholder="до" value={filters.budgetTo} onChange={(e) => setFilters((p) => ({ ...p, budgetTo: e.target.value }))} />
        </div>
      </div>

      <div className="sbGroup">
        <div className="sbLabel">Город</div>
        <select className="field" value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
          <option value="all">Все</option>
          {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      <div className="sbGroup" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
        <div className="sbLabel">Рейтинг</div>
        <select className="field" value={filters.ratingFrom} onChange={(e) => setFilters((p) => ({ ...p, ratingFrom: e.target.value }))}>
          <option value="">Все</option>
          {ratingOptions.map((rating) => <option key={rating} value={rating}>от {rating}</option>)}
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
            <div className="count">Найдено <strong>{items.length}</strong></div>
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
          {!loading && items.length === 0 ? <div className="empty">По выбранным фильтрам площадок не найдено.</div> : null}

          {!loading && items.length > 0 && view === "grid" ? (
            <div className="grid">
              {items.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="card">
                  <div className="thumb">
                    <Image src={imageByType[venue.type] ?? imageByType.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="badge">от {Math.round(venue.price_from ?? 0)} BYN</div>
                  </div>
                  <div className="body">
                    <div className="title">{venue.name}</div>
                    <div className="meta">📍 {venue.city}</div>
                    <div className="meta">⭐ {venue.rating ?? 0} · 👥 {venue.capacity_banquet ?? 0}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && items.length > 0 && view === "list" ? (
            <div className="list">
              {items.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="listCard">
                  <div className="listThumb">
                    <Image src={imageByType[venue.type] ?? imageByType.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} />
                  </div>
                  <div className="listBody">
                    <div className="title">{venue.name}</div>
                    <div className="meta">📍 {venue.city}</div>
                    <div className="meta">⭐ {venue.rating ?? 0} · Банкет: {venue.capacity_banquet ?? 0} · Фуршет: {venue.capacity_buffet ?? 0}</div>
                    <div className="price">от {Math.round(venue.price_from ?? 0)} BYN</div>
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
        .sidebar{background:#fff;border:1.5px solid rgba(0,0,0,.08);border-radius:20px;padding:24px;position:sticky;top:86px}
        .sbTitleRow{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
        .sbTitle{font-family:"Unbounded",sans-serif;font-size:14px;font-weight:700}
        .resetBtn{background:none;border:none;color:#888;font-size:12px;font-weight:500;cursor:pointer}
        .resetBtn:hover{color:#181818}
        .sbGroup{margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(0,0,0,.08)}
        .sbLabel{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#888;margin-bottom:10px}
        .fieldRow{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .field{width:100%;height:38px;border-radius:9px;border:1.5px solid rgba(0,0,0,.1);padding:0 10px;background:#fff;font-size:12px}
        .field:focus{outline:none;border-color:rgba(0,0,0,.3)}
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
        .badge{position:absolute;left:10px;bottom:10px;background:#D2F882;border-radius:99px;padding:5px 10px;font-size:11px;font-weight:700}
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
        .mobileFiltersBtn{height:38px;padding:0 14px;border-radius:10px;border:1.5px solid rgba(0,0,0,.1);background:#fff;font-weight:600}
          .grid,.listCard{grid-template-columns:1fr}
          .listThumb{height:200px}
        }
      `}</style>
    </>
  );
}
