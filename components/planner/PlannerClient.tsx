"use client";

import { useState } from "react";

type PlanResponse = {
  summary: string;
  dailyPlan: Array<{ day: number; title: string; blocks: string[] }>;
  tips: string[];
};

export function PlannerClient() {
  const [city, setCity] = useState("Гродно");
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState("средний");
  const [interests, setInterests] = useState("замки, местная еда");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  const runPlanner = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city, days, budget, interests }),
      });
      const data = (await res.json()) as PlanResponse | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("Не удалось получить маршрут.");
      }
      setPlan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при построении маршрута.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "22px", marginBottom: "52px" }}>
      <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" style={inputStyle} />
        <input value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} type="number" min={1} max={5} placeholder="Дней" style={inputStyle} />
        <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Бюджет" style={inputStyle} />
        <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Интересы через запятую" style={inputStyle} />
      </div>

      <button type="button" onClick={runPlanner} style={buttonStyle} disabled={loading}>
        {loading ? "Строим маршрут..." : "Сгенерировать маршрут"}
      </button>
      {error ? <div style={{ color: "#b91c1c", marginTop: "8px" }}>{error}</div> : null}

      {plan ? (
        <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
          <div style={cardStyle}>
            <div style={{ fontFamily: "Unbounded, sans-serif", marginBottom: "6px" }}>Коротко о плане</div>
            <div style={{ color: "#555" }}>{plan.summary}</div>
          </div>
          {plan.dailyPlan.map((day) => (
            <div key={day.day} style={cardStyle}>
              <div style={{ fontFamily: "Unbounded, sans-serif", marginBottom: "6px" }}>
                День {day.day}: {day.title}
              </div>
              <ul style={{ paddingLeft: "18px", color: "#555", lineHeight: 1.6 }}>
                {day.blocks.map((block) => (
                  <li key={block}>{block}</li>
                ))}
              </ul>
            </div>
          ))}
          <div style={cardStyle}>
            <div style={{ fontFamily: "Unbounded, sans-serif", marginBottom: "6px" }}>Практические советы</div>
            <ul style={{ paddingLeft: "18px", color: "#555", lineHeight: 1.6 }}>
              {plan.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,.12)",
  background: "#fff",
  padding: "0 12px",
};

const buttonStyle = {
  marginTop: "12px",
  height: "44px",
  borderRadius: "12px",
  border: "none",
  background: "#181818",
  color: "#fff",
  padding: "0 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,.08)",
  borderRadius: "16px",
  padding: "16px",
};
