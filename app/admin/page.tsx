import Link from "next/link";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [placesCount, venuesCount, usersCount, storiesCount, recentPlaces, recentVenues] = await Promise.all([
    supabase.from("places").select("*", { count: "exact", head: true }),
    supabase.from("venues").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("stories").select("*", { count: "exact", head: true }),
    supabase.from("places").select("id,name,slug,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("venues").select("id,name,slug,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h1 style={{ margin: 0 }}>Дашборд</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
        <Stat title="Места" value={placesCount.count ?? 0} />
        <Stat title="Площадки" value={venuesCount.count ?? 0} />
        <Stat title="Пользователи" value={usersCount.count ?? 0} />
        <Stat title="Истории" value={storiesCount.count ?? 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Последние места</h2>
            <Link href="/admin/places">Открыть</Link>
          </div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
            {(recentPlaces.data ?? []).map((item) => (
              <li key={item.id}><Link href={`/places/${item.slug}`}>{item.name}</Link></li>
            ))}
          </ul>
        </section>
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Последние площадки</h2>
            <Link href="/admin/venues">Открыть</Link>
          </div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
            {(recentVenues.data ?? []).map((item) => (
              <li key={item.id}><Link href={`/venues/${item.slug}`}>{item.name}</Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div style={card}>
      <div style={{ color: "#777", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const card: CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
};

