import { createClient } from "@/lib/supabase/server";

type Stat = {
  value: number;
  label: string;
  bg: string;
};

export async function StatsBlock() {
  const supabase = await createClient();

  const [places, venues, contractors, events] = await Promise.all([
    supabase.from("places").select("*", { count: "exact", head: true }),
    supabase.from("venues").select("*", { count: "exact", head: true }),
    supabase.from("contractors").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ]);

  if (places.error || venues.error || contractors.error || events.error) {
    console.error("Supabase stats fetch error", {
      places: places.error?.message ?? null,
      venues: venues.error?.message ?? null,
      contractors: contractors.error?.message ?? null,
      events: events.error?.message ?? null,
    });
  }

  const stats: Stat[] = [
    { value: events.count ?? 0, label: "Событий в афише", bg: "var(--yellow)" },
    { value: venues.count ?? 0, label: "Площадок по Беларуси", bg: "var(--lavender)" },
    { value: contractors.count ?? 0, label: "Проверенных подрядчиков", bg: "var(--peach)" },
    { value: places.count ?? 0, label: "Интересных мест", bg: "var(--mint)" },
  ];

  return (
    <div className="hero-stat-row">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-box fu" style={{ background: stat.bg }}>
          <div className="stat-n">{stat.value.toLocaleString("ru-RU")}</div>
          <div className="stat-l">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
