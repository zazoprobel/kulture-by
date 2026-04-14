import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { GUIDE_CITIES } from "@/lib/guide/cities";

export default function GuideIndexPage() {
  return (
    <>
      <Header />
      <Container>
        <div style={{ marginTop: "24px", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "Unbounded, sans-serif", fontSize: "32px", marginBottom: "10px" }}>Путеводитель по Беларуси</h1>
          <p style={{ color: "#5f5f5f", maxWidth: "760px", lineHeight: 1.65 }}>
            Практические гайды для путешествий: транспорт, деньги, безопасность, что попробовать и готовые мини-маршруты по городам.
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: "36px" }}>
          {GUIDE_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/guide/${city.slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                background: "#fff",
                border: "1px solid rgba(0,0,0,.09)",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div style={{ fontFamily: "Unbounded, sans-serif", fontSize: "18px", marginBottom: "8px" }}>{city.name}</div>
              <div style={{ color: "#666", lineHeight: 1.55 }}>{city.tagline}</div>
              <div style={{ marginTop: "14px", fontWeight: 600 }}>Открыть гайд →</div>
            </Link>
          ))}
        </div>

        <div style={{ background: "#E7D4FF", borderRadius: "20px", padding: "22px", marginBottom: "48px" }}>
          <div style={{ fontFamily: "Unbounded, sans-serif", fontSize: "18px", marginBottom: "6px" }}>AI-планировщик маршрутов</div>
          <div style={{ color: "#555", marginBottom: "12px" }}>Опишите поездку, и мы соберем маршрут на 1-3 дня с фокусом на ваши интересы.</div>
          <Link href="/planner" style={{ fontWeight: 700, textDecoration: "none", color: "#181818" }}>
            Запустить планировщик →
          </Link>
        </div>
      </Container>
      <Footer />
    </>
  );
}
