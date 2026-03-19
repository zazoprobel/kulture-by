"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type VenueCard = {
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

const typeLabel: Record<string, string> = {
  restaurant: "Ресторан",
  banquet: "Банкетный зал",
  loft: "Лофт",
  outdoor: "На природе",
  hotel: "Отель",
};

const venueImages: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900",
  banquet: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900",
  loft: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900",
  outdoor: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
};

export function VenuesResults({ venues }: { venues: VenueCard[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const rows = useMemo(() => venues, [venues]);

  return (
    <>
      <div className="caHead">
        <div className="caCount">
          Найдено <strong>{rows.length} площадок</strong>
        </div>
        <div className="viewBtns">
          <button className={`vBtn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")} type="button">⊞</button>
          <button className={`vBtn ${view === "list" ? "on" : ""}`} onClick={() => setView("list")} type="button">≡</button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="venuesGrid">
          {rows.map((venue) => (
            <Link key={venue.id} href={`/venues/${venue.slug}`} className="vCard">
              <div className="vThumb">
                <Image src={venueImages[venue.type] ?? venueImages.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} />
                <div className="vBadge">от {Math.round(venue.price_from ?? 0)} BYN</div>
              </div>
              <div className="vBody">
                <div className="vTags">
                  <span className="vtag">{typeLabel[venue.type] ?? venue.type}</span>
                </div>
                <div className="vTitle">{venue.name}</div>
                <div className="vLoc">📍 {venue.city}</div>
                <div className="vFoot">
                  <div>⭐ {venue.rating ?? 0}</div>
                  <div>👥 до {venue.capacity_banquet ?? 0}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="venuesList">
          {rows.map((venue) => (
            <Link key={venue.id} href={`/venues/${venue.slug}`} className="vlCard">
              <div className="vlThumb">
                <Image src={venueImages[venue.type] ?? venueImages.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} />
              </div>
              <div className="vlBody">
                <div className="vlTitle">{venue.name}</div>
                <div className="vlLoc">📍 {venue.city}</div>
                <div className="vlMeta">
                  <span>⭐ {venue.rating ?? 0}</span>
                  <span>Банкет: {venue.capacity_banquet ?? 0}</span>
                  <span>Фуршет: {venue.capacity_buffet ?? 0}</span>
                  <strong>от {Math.round(venue.price_from ?? 0)} BYN</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
