import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { signOutAdminAction } from "./actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#f6f6f6" }}>
      <aside style={{ background: "#181818", color: "#fff", padding: 20, display: "grid", alignContent: "start", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>kulture.by admin</div>
        <Link href="/admin" style={nav}>Дашборд</Link>
        <Link href="/admin/places" style={nav}>Места</Link>
        <Link href="/admin/venues" style={nav}>Площадки</Link>
        <Link href="/admin/contractors" style={nav}>Подрядчики</Link>
        <Link href="/admin/stories" style={nav}>Истории</Link>
        <Link href="/admin/events" style={nav}>События</Link>
        <Link href="/admin/tours" style={nav}>Туры</Link>
        <Link href="/admin/users" style={nav}>Пользователи</Link>
        <form action={signOutAdminAction}>
          <button type="submit" style={{ ...navBtn, marginTop: 16 }}>Выйти</button>
        </form>
      </aside>
      <main style={{ background: "#fff", padding: 24 }}>{children}</main>
    </div>
  );
}

const nav: CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  opacity: 0.92,
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
};

const navBtn: CSSProperties = {
  width: "100%",
  color: "#fff",
  textAlign: "left",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

