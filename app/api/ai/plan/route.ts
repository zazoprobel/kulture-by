import { NextResponse } from "next/server";

type PlannerRequest = {
  city: string;
  days: number;
  budget: string;
  interests: string;
};

function fallbackPlan(payload: PlannerRequest) {
  const days = Math.max(1, Math.min(5, Number(payload.days) || 2));
  const interests = payload.interests
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const interestLine = interests.length > 0 ? interests.join(", ") : "история, прогулки и гастро";

  return {
    summary: `${days}-дневный маршрут по городу ${payload.city} с учетом интересов: ${interestLine}.`,
    dailyPlan: Array.from({ length: days }).map((_, index) => ({
      day: index + 1,
      title: `День ${index + 1}`,
      blocks: [
        `Утро: прогулка и обзор района в ${payload.city}.`,
        `День: посещение мест по теме (${interestLine}).`,
        `Вечер: гастроточка и спокойный маршрут по центру.`,
      ],
    })),
    tips: [
      "Проверяйте часы работы мест перед выездом.",
      "Держите резерв 20-30% бюджета на спонтанные расходы.",
      "Часть маршрута лучше проходить пешком, чтобы увидеть локальные детали.",
    ],
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PlannerRequest;
    if (!payload.city || !payload.days) {
      return NextResponse.json({ error: "Передайте city и days." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackPlan(payload));
    }

    const prompt = `
Составь маршрут путешествия по Беларуси.
Город: ${payload.city}
Дней: ${payload.days}
Бюджет: ${payload.budget || "не указан"}
Интересы: ${payload.interests || "не указаны"}

Верни ТОЛЬКО JSON в формате:
{
  "summary": "краткое описание",
  "dailyPlan": [
    { "day": 1, "title": "Заголовок дня", "blocks": ["утро...", "день...", "вечер..."] }
  ],
  "tips": ["совет 1", "совет 2"]
}
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallbackPlan(payload));
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((item) => item.type === "text")?.text?.trim();
    if (!text) {
      return NextResponse.json(fallbackPlan(payload));
    }

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Не удалось построить маршрут." }, { status: 500 });
  }
}
