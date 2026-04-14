import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { PlannerClient } from "@/components/planner/PlannerClient";

export default function PlannerPage() {
  return (
    <>
      <Header />
      <Container>
        <div style={{ marginTop: "24px" }}>
          <h1 style={{ fontFamily: "Unbounded, sans-serif", fontSize: "32px", marginBottom: "10px" }}>AI-планировщик маршрутов</h1>
          <p style={{ color: "#5d5d5d", maxWidth: "760px", lineHeight: 1.65 }}>
            Расскажите, куда хотите поехать и что любите: замки, музеи, природу или гастрономию. Планировщик соберет маршрут по дням и подскажет практичные шаги.
          </p>
        </div>
        <PlannerClient />
      </Container>
      <Footer />
    </>
  );
}
