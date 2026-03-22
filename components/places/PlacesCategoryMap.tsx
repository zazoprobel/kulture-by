"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadLeafletFromCdn } from "@/lib/maps/loadLeafletCdn";
import { markerColorForCategory } from "@/lib/maps/categoryMapStyle";

export type MapPlaceRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  category: string;
  lat: number;
  lng: number;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchPlacesForCategoryMap(args: {
  category: string;
  cityContains: string | null;
}): Promise<MapPlaceRow[]> {
  const supabase = createClient();
  const pageSize = 1000;
  const rows: MapPlaceRow[] = [];

  for (let start = 0; ; start += pageSize) {
    let q = supabase
      .from("places")
      .select("id,slug,name,category,city,lat,lng")
      .eq("category", args.category)
      .not("lat", "is", null)
      .not("lng", "is", null)
      .order("id", { ascending: true })
      .range(start, start + pageSize - 1);

    if (args.cityContains) {
      q = q.ilike("city", `%${args.cityContains}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    const batch = data ?? [];
    for (const raw of batch) {
      const lat = Number(raw.lat);
      const lng = Number(raw.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      rows.push({
        id: String(raw.id),
        slug: String(raw.slug),
        name: String(raw.name ?? ""),
        city: String(raw.city ?? ""),
        category: String(raw.category ?? ""),
        lat,
        lng,
      });
    }
    if (batch.length < pageSize) break;
  }

  return rows;
}

type Props = {
  category: string;
  /** DB city label (e.g. «Минск») — fuzzy match via ilike */
  cityContains: string | null;
};

export function PlacesCategoryMap({ category, cityContains }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<MapPlaceRow[]>([]);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPlacesForCategoryMap({ category, cityContains });
      setPlaces(list);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить точки для карты.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [category, cityContains]);

  useEffect(() => {
    if (!open) return;
    void loadData();
  }, [open, loadData]);

  useEffect(() => {
    if (!open || !mapElRef.current || places.length === 0) return;

    let cancelled = false;

    const run = async () => {
      const L = await loadLeafletFromCdn();
      if (cancelled || !mapElRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }

      const map = L.map(mapElRef.current, { scrollWheelZoom: true }).setView([53.9, 27.57], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;

      const bounds = L.latLngBounds([] as [number, number][]);

      for (const p of places) {
        const color = markerColorForCategory(p.category);
        const icon = L.divIcon({
          className: "kb-cat-marker-wrap",
          html: `<span class="kb-cat-marker" style="background:${color}"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const m = L.marker([p.lat, p.lng], { icon });
        const url = `/places/${encodeURIComponent(p.slug)}`;
        m.bindPopup(
          `<div class="kb-pop">
            <div class="kb-pop-title">${escapeHtml(p.name)}</div>
            <div class="kb-pop-meta">${escapeHtml(p.city)}</div>
            <a class="kb-pop-btn" href="${url}">Открыть</a>
          </div>`,
          { className: "kb-leaflet-popup" },
        );
        m.addTo(group);
        bounds.extend([p.lat, p.lng]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [open, places]);

  return (
    <div className="pcm">
      <div className="pcmHead">
        <button type="button" className="pcmToggle" onClick={() => setOpen((v) => !v)}>
          {open ? "Скрыть карту" : "Показать карту 🗺"}
        </button>
        {loading ? <span className="pcmHint">Загрузка меток…</span> : null}
        {error ? <span className="pcmErr">{error}</span> : null}
      </div>
      {open ? (
        <div className="pcmMapWrap">
          <div ref={mapElRef} className="pcmMap" role="presentation" />
        </div>
      ) : null}
      <p className="pcmNote">
        На карте только объекты с координатами в базе. Нет точки — проверьте данные в админке.
      </p>

      <style jsx global>{`
        .kb-cat-marker-wrap {
          background: transparent !important;
          border: none !important;
        }
        .kb-cat-marker {
          display: block;
          width: 14px;
          height: 14px;
          margin: 2px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }
        .kb-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
        }
        .kb-pop-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .kb-pop-meta {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        .kb-pop-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 34px;
          border-radius: 10px;
          background: #181818;
          color: #fff !important;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>
      <style jsx>{`
        .pcm {
          margin-bottom: 18px;
        }
        .pcmHead {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .pcmToggle {
          height: 40px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
        }
        .pcmHint {
          font-size: 13px;
          color: #666;
        }
        .pcmErr {
          font-size: 13px;
          color: #a40000;
        }
        .pcmMapWrap {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #e8e8e8;
        }
        .pcmMap {
          height: 420px;
          width: 100%;
        }
        .pcmNote {
          margin: 8px 0 0;
          font-size: 12px;
          color: #888;
        }
      `}</style>
    </div>
  );
}
