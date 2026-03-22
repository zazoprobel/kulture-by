"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadLeafletWithClusterFromCdn, type LeafletWithCluster, type MarkerClusterGroup } from "@/lib/maps/loadLeafletCdn";
import { categoryLabelRu, markerColorForCategory } from "@/lib/maps/categoryMapStyle";

type LayerKey = "all" | "nature" | "history" | "castles" | "museums" | "gastro" | "activity";

type MapRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  lat: number;
  lng: number;
  image_url: string | null;
  image_urls: string[] | null;
};

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: "all", label: "Все места" },
  { key: "nature", label: "Природа" },
  { key: "history", label: "История" },
  { key: "castles", label: "Замки" },
  { key: "museums", label: "Музеи" },
  { key: "gastro", label: "Гастро" },
  { key: "activity", label: "Активный отдых" },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchAllMappedPlaces(): Promise<MapRow[]> {
  const supabase = createClient();
  const pageSize = 1000;
  const rows: MapRow[] = [];

  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabase
      .from("places")
      .select("id,slug,name,category,city,lat,lng,image_url,image_urls")
      .not("lat", "is", null)
      .not("lng", "is", null)
      .order("id", { ascending: true })
      .range(start, start + pageSize - 1);

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
        category: String(raw.category ?? ""),
        city: String(raw.city ?? ""),
        lat,
        lng,
        image_url: raw.image_url != null ? String(raw.image_url) : null,
        image_urls: Array.isArray(raw.image_urls) ? (raw.image_urls as string[]) : null,
      });
    }
    if (batch.length < pageSize) break;
  }

  return rows;
}

function thumbFor(p: MapRow): string | null {
  return p.image_url || (p.image_urls && p.image_urls[0]) || null;
}

export function MapsPageClient() {
  const [rows, setRows] = useState<MapRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState<LayerKey>("all");
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [geoHint, setGeoHint] = useState<string | null>(null);

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const leafletRef = useRef<LeafletWithCluster | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllMappedPlaces();
        if (!cancelled) setRows(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError("Не удалось загрузить места.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      if (layer !== "all" && p.category !== layer) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [rows, layer, search]);

  const rebuildMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!L || !map || !cluster) return;

    cluster.clearLayers();

    const bounds = L.latLngBounds([] as [number, number][]);

    const q = search.trim();

    for (const p of filtered) {
      const color = markerColorForCategory(p.category);
      const icon = L.divIcon({
        className: "kb-maps-marker-wrap",
        html: `<span class="kb-maps-marker" style="background:${color}"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const img = thumbFor(p);
      const imgBlock = img
        ? `<div class="kb-maps-pop-img"><img src="${escapeHtml(img)}" alt="" /></div>`
        : "";

      const m = L.marker([p.lat, p.lng], { icon });
      const url = `/places/${encodeURIComponent(p.slug)}`;
      m.bindPopup(
        `${imgBlock}
        <div class="kb-maps-pop">
          <div class="kb-maps-pop-title">${escapeHtml(p.name)}</div>
          <div class="kb-maps-pop-meta">${escapeHtml(p.city)} · ${escapeHtml(categoryLabelRu(p.category))}</div>
          <a class="kb-maps-pop-btn" href="${url}">Подробнее →</a>
        </div>`,
        { className: "kb-maps-popup", maxWidth: 280 },
      );
      cluster.addLayer(m);
      bounds.extend([p.lat, p.lng]);
    }

    if (bounds.isValid() && !q) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    }
  }, [filtered, search]);

  useEffect(() => {
    if (!mapElRef.current || loading) return;

    let cancelled = false;

    const setup = async () => {
      try {
        const L = await loadLeafletWithClusterFromCdn();
        if (cancelled || !mapElRef.current) return;

        leafletRef.current = L;
        const map = L.map(mapElRef.current, { scrollWheelZoom: true }).setView([53.9, 27.57], 7);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        const cluster = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
        });
        cluster.addTo(map);
        clusterRef.current = cluster;

        map.invalidateSize();
        rebuildMarkers();
      } catch (e) {
        console.error(e);
        setLoadError("Карта не загрузилась. Проверьте сеть и обновите страницу.");
      }
    };

    void setup();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      clusterRef.current = null;
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once after loading flag
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || !clusterRef.current) return;
    rebuildMarkers();
  }, [rebuildMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(t);
  }, [panelOpen]);

  const onNearMe = () => {
    setGeoHint(null);
    if (!navigator.geolocation) {
      setGeoHint("Геолокация недоступна в браузере.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current;
        const L = leafletRef.current;
        if (!map || !L) return;
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 12);
        setGeoHint(null);
      },
      () => setGeoHint("Не удалось получить координаты. Разрешите доступ к геолокации."),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  };

  return (
    <div className="mapsRoot">
      <div ref={mapElRef} className="mapsMap" role="presentation" />

      <button type="button" className="mapsLayerFab" onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen}>
        Слои
      </button>

      <aside className={`mapsPanel ${panelOpen ? "open" : ""}`}>
        <div className="mapsPanelInner">
          <h2 className="mapsPanelTitle">Карта мест</h2>
          <p className="mapsPanelSub">{loading ? "Загрузка…" : `${rows.length} точек с координатами`}</p>

          <label className="mapsSearchLabel" htmlFor="maps-search">
            Поиск по названию
          </label>
          <input
            id="maps-search"
            className="mapsSearch"
            type="search"
            placeholder="Например, Несвиж"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />

          <div className="mapsLayerList">
            {LAYERS.map((item) => (
              <label key={item.key} className="mapsLayerOpt">
                <input
                  type="radio"
                  name="maps-layer"
                  checked={layer === item.key}
                  onChange={() => setLayer(item.key)}
                />
                {item.label}
              </label>
            ))}
          </div>

          <button type="button" className="mapsGeoBtn" onClick={onNearMe}>
            Найти рядом
          </button>
          {geoHint ? <p className="mapsHint">{geoHint}</p> : null}
          {loadError ? <p className="mapsErr">{loadError}</p> : null}

          <Link className="mapsBack" href="/places">
            ← К каталогу мест
          </Link>
        </div>
      </aside>

      <div
        className="mapsBackdrop"
        data-open={panelOpen ? "true" : "false"}
        onClick={() => setPanelOpen(false)}
        aria-hidden
      />

      <style jsx global>{`
        .kb-maps-marker-wrap {
          background: transparent !important;
          border: none !important;
        }
        .kb-maps-marker {
          display: block;
          width: 12px;
          height: 12px;
          margin: 2px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }
        .kb-maps-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          padding: 0;
          overflow: hidden;
        }
        .kb-maps-popup .leaflet-popup-content {
          margin: 0;
          min-width: 220px;
        }
        .kb-maps-pop-img {
          height: 120px;
          background: #eee;
          overflow: hidden;
        }
        .kb-maps-pop-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .kb-maps-pop {
          padding: 12px 14px 14px;
        }
        .kb-maps-pop-title {
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .kb-maps-pop-meta {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        .kb-maps-pop-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 36px;
          border-radius: 10px;
          background: #181818;
          color: #fff !important;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>

      <style jsx>{`
        .mapsRoot {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #ddd;
        }
        .mapsMap {
          position: absolute;
          inset: 0;
        }
        .mapsPanel {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: min(300px, 92vw);
          z-index: 1200;
          background: rgba(255, 255, 255, 0.97);
          border-right: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 8px 0 32px rgba(0, 0, 0, 0.06);
          transform: translateX(0);
          transition: transform 0.22s ease;
        }
        .mapsPanelInner {
          padding: 18px 16px 20px;
          height: 100%;
          overflow: auto;
        }
        .mapsPanelTitle {
          font-family: "Unbounded", sans-serif;
          font-size: 16px;
          margin: 0 0 4px;
        }
        .mapsPanelSub {
          margin: 0 0 14px;
          font-size: 12px;
          color: #777;
        }
        .mapsSearchLabel {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 6px;
        }
        .mapsSearch {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 0 12px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .mapsLayerList {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .mapsLayerOpt {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .mapsLayerOpt input {
          width: 16px;
          height: 16px;
          accent-color: #181818;
        }
        .mapsGeoBtn {
          width: 100%;
          height: 42px;
          border: none;
          border-radius: 12px;
          background: #181818;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 8px;
        }
        .mapsHint {
          font-size: 12px;
          color: #a40000;
          margin: 0 0 8px;
        }
        .mapsErr {
          font-size: 12px;
          color: #a40000;
          margin: 0 0 8px;
        }
        .mapsBack {
          display: block;
          margin-top: 12px;
          font-size: 13px;
          color: #444;
        }
        .mapsLayerFab {
          display: none;
        }
        .mapsBackdrop {
          display: none;
        }
        @media (max-width: 900px) {
          .mapsPanel {
            transform: translateX(-105%);
          }
          .mapsPanel.open {
            transform: translateX(0);
          }
          .mapsLayerFab {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: 12px;
            top: 12px;
            z-index: 1100;
            height: 40px;
            padding: 0 14px;
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: #fff;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
          }
          .mapsBackdrop[data-open="true"] {
            display: block;
            position: absolute;
            inset: 0;
            z-index: 900;
            background: rgba(0, 0, 0, 0.35);
          }
        }
      `}</style>
    </div>
  );
}
