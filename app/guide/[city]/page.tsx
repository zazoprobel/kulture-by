import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { GUIDE_CITY_BY_SLUG, GUIDE_CITIES } from "@/lib/guide/cities";

type GuideCityPageProps = {
  params: Promise<{ city: string }>;
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={{ background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: "16px", padding: "18px" }}>
      <h2 style={{ fontFamily: "Unbounded, sans-serif", fontSize: "16px", marginBottom: "10px" }}>{title}</h2>
      <ul style={{ paddingLeft: "18px", color: "#555", lineHeight: 1.65 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export async function generateStaticParams() {
  return GUIDE_CITIES.map((city) => ({ city: city.slug }));
}

export default async function GuideCityPage({ params }: GuideCityPageProps) {
  const { city } = await params;
  const guide = GUIDE_CITY_BY_SLUG[city];
  if (!guide) notFound();

  return (
    <>
      <Header />
      <Container>
        <div style={{ marginTop: "22px", marginBottom: "16px", fontSize: "13px", color: "#767676" }}>
          <Link href="/" style={{ color: "#767676", textDecoration: "none" }}>
            Главная
          </Link>{" "}
          /{" "}
          <Link href="/guide" style={{ color: "#767676", textDecoration: "none" }}>
            Путеводитель
          </Link>{" "}
          / <strong style={{ color: "#1f1f1f" }}>{guide.name}</strong>
        </div>

        <section style={{ background: "#D2F882", borderRadius: "20px", padding: "24px", marginBottom: "18px" }}>
          <h1 style={{ fontFamily: "Unbounded, sans-serif", fontSize: "32px", marginBottom: "8px" }}>{guide.name}: practical guide</h1>
          <p style={{ color: "#404040", lineHeight: 1.65, maxWidth: "820px" }}>{guide.hero}</p>
        </section>

        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <ListBlock title="Транспорт" items={guide.transport} />
          <ListBlock title="Въезд и безвиз" items={guide.borderAndVisa} />
          <ListBlock title="Деньги и расходы" items={guide.money} />
          <ListBlock title="Еда и локальная кухня" items={guide.food} />
          <ListBlock title="Безопасность" items={guide.safety} />
          <ListBlock title="Чек-лист перед поездкой" items={guide.checklist} />
        </div>

        <section style={{ marginTop: "20px", background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: "16px", padding: "18px" }}>
          <h2 style={{ fontFamily: "Unbounded, sans-serif", fontSize: "16px", marginBottom: "10px" }}>Быстрый план на 2 дня</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {guide.quickPlan.map((item) => (
              <div key={item.title} style={{ background: "#F7F6F2", borderRadius: "12px", padding: "12px" }}>
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>{item.title}</div>
                <div style={{ color: "#555" }}>{item.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "20px", background: "#E7D4FF", borderRadius: "16px", padding: "18px", marginBottom: "48px" }}>
          <div style={{ fontFamily: "Unbounded, sans-serif", fontSize: "16px", marginBottom: "8px" }}>Хотите персональный маршрут?</div>
          <div style={{ color: "#555", marginBottom: "10px" }}>AI подберет маршрут по интересам, бюджету и количеству дней.</div>
          <Link href="/planner" style={{ fontWeight: 700, color: "#181818", textDecoration: "none" }}>
            Перейти в AI-планировщик →
          </Link>
        </section>
      </Container>
      <Footer />
    </>
  );
}
