import Link from "next/link";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteEventAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ q?: string; page?: string; sort?: "asc" | "desc"; saved?: string }> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const { q = "", page = "1", sort = "desc", saved } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const limit = 20;
  const from = (pageNum - 1) * limit;
  const to = from + limit - 1;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("id,name,slug,category,city,date_start,created_at", { count: "exact" })
    .order("created_at", { ascending: sort === "asc" });
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, count } = await query.range(from, to);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / limit));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {saved === "1" ? <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eaf8ea", color: "#1f6a1f", border: "1px solid #b8e3b8" }}>Сохранено успешно</div> : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>События</h1>
        <Link href="/admin/events/new" style={btn}>+ Добавить</Link>
      </div>
      <form style={{ display: "flex", gap: 8 }}>
        <input name="q" defaultValue={q} placeholder="Поиск по названию" style={input} />
        <select name="sort" defaultValue={sort} style={input}>
          <option value="desc">Сначала новые</option>
          <option value="asc">Сначала старые</option>
        </select>
        <button style={btn}>Применить</button>
      </form>
      <table style={table}>
        <thead><tr><th>Название</th><th>Категория</th><th>Город</th><th>Старт</th><th /></tr></thead>
        <tbody>
          {(data ?? []).map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td><td>{item.category}</td><td>{item.city}</td><td>{new Date(item.date_start).toLocaleString("ru-RU")}</td>
              <td style={{ whiteSpace: "nowrap", display: "flex", gap: 8 }}>
                <Link href={`/admin/events/${item.id}/edit`}>Редактировать</Link>
                <form action={async () => { "use server"; await deleteEventAction(item.id); }}>
                  <button style={linkBtn}>Удалить</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link href={`/admin/events?q=${encodeURIComponent(q)}&sort=${sort}&page=${Math.max(1, pageNum - 1)}`}>←</Link>
        <span>Страница {pageNum} / {totalPages}</span>
        <Link href={`/admin/events?q=${encodeURIComponent(q)}&sort=${sort}&page=${Math.min(totalPages, pageNum + 1)}`}>→</Link>
      </div>
    </div>
  );
}

const input: CSSProperties = { height: 38, border: "1px solid #ddd", borderRadius: 10, padding: "0 10px" };
const btn: CSSProperties = { height: 38, border: "1px solid #181818", background: "#181818", color: "#fff", borderRadius: 10, padding: "0 12px", textDecoration: "none", display: "inline-flex", alignItems: "center" };
const linkBtn: CSSProperties = { border: "none", background: "transparent", color: "#b11", cursor: "pointer", padding: 0 };
const table: CSSProperties = { width: "100%", borderCollapse: "collapse" };

