import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type BookingPayload = {
  venueId?: string;
  city?: string;
  eventType?: string;
  dateRequested?: string;
  guests?: number;
  budget?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  comment?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    if (!payload.customerName || !payload.customerEmail) {
      return NextResponse.json({ error: "Имя и email обязательны." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("booking_requests").insert({
      source: "venue-card",
      status: "new",
      venue_id: payload.venueId ?? null,
      city: payload.city ?? null,
      event_type: payload.eventType ?? null,
      date_requested: payload.dateRequested || null,
      guests: payload.guests ?? null,
      budget: payload.budget ?? null,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone ?? null,
      customer_email: payload.customerEmail,
      comment: payload.comment ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось отправить заявку." }, { status: 500 });
  }
}
