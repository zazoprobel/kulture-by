"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type VenueSlide = {
  id: string;
  slug: string;
  name: string;
  city: string;
  type: string;
  rating: number | null;
  capacity_banquet: number | null;
  price_from: number | null;
};

const venueImages: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  banquet: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
  loft: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
  outdoor: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
};

const typeLabel: Record<string, string> = {
  restaurant: "Ресторан",
  banquet: "Банкетный зал",
  loft: "Лофт",
  outdoor: "На природе",
  hotel: "Отель",
};

export function VenuesSlider({ venues }: { venues: VenueSlide[] }) {
  const [index, setIndex] = useState(0);
  const safeVenues = venues.slice(0, 12);
  const pages = Math.max(1, safeVenues.length);
  const current = useMemo(() => safeVenues, [safeVenues]);

  if (current.length === 0) {
    return <div className="emptyCard">Площадки появятся после добавления данных.</div>;
  }

  return (
    <>
      <div className="sliderOuter">
        <div
          className="sliderTr"
          style={{ transform: `translateX(calc(-${index} * (25% + 4px)))` }}
        >
          {safeVenues.map((venue) => (
            <div className="slideItem" key={venue.id}>
              <Link href={`/venues/${venue.slug}`} className="vCard">
                <div className="vThumb">
                  <Image
                    src={venueImages[venue.type] ?? venueImages.outdoor}
                    alt={venue.name}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="vBadge">от {Math.round(venue.price_from ?? 0)} BYN</div>
                </div>
                <div className="vBody">
                  <div className="vTags">
                    <span className="vtag">{typeLabel[venue.type] ?? venue.type}</span>
                    <span className="vtag">{venue.city}</span>
                  </div>
                  <div className="vTitle">{venue.name}</div>
                  <div className="vLoc">📍 {venue.city}</div>
                  <div className="vFoot">
                    <div>⭐ {venue.rating ?? 0}</div>
                    <div>👥 до {venue.capacity_banquet ?? 0}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="sliderCtrl">
        <button
          className="sBtn"
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + pages) % pages)}
          aria-label="Предыдущая площадка"
        >
          ←
        </button>
        <span className="sPage">
          {index + 1} / {pages}
        </span>
        <button
          className="sBtn"
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % pages)}
          aria-label="Следующая площадка"
        >
          →
        </button>
      </div>
      <style jsx>{`
        .emptyCard{border:1px solid rgba(0,0,0,.1);background:#fff;padding:18px;border-radius:16px}
        .sliderOuter{overflow:hidden}
        .sliderTr{display:flex;gap:16px;transition:transform .4s cubic-bezier(.4,0,.2,1)}
        .slideItem{min-width:calc(25% - 12px);flex-shrink:0}
        .vCard{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}
        .vCard:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(0,0,0,.11)}
        .vThumb{height:230px;position:relative}
        .vBadge{position:absolute;bottom:10px;left:10px;border-radius:99px;padding:5px 10px;background:#D2F882;font-size:12px;font-weight:700}
        .vBody{padding:16px}
        .vTags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
        .vtag{font-size:11px;background:rgba(0,0,0,.06);border-radius:6px;padding:3px 8px;color:#666}
        .vTitle{font-family:"Unbounded",sans-serif;font-size:14px;line-height:1.3}
        .vLoc{margin-top:6px;color:#666;font-size:13px}
        .vFoot{display:flex;justify-content:space-between;margin-top:10px;font-size:13px}
        .sliderCtrl{display:flex;align-items:center;gap:10px;margin-top:14px}
        .sBtn{width:38px;height:38px;border-radius:50%;border:1px solid rgba(0,0,0,.1);background:#fff}
        .sPage{font-size:13px;color:#666}
        @media (max-width:1024px){.slideItem{min-width:calc(50% - 8px)}}
        @media (max-width:767px){.slideItem{min-width:100%}}
      `}</style>
    </>
  );
}
