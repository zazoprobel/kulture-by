import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEventEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: venues }] = await Promise.all([
    supabase
      .from("events")
      .select("id,name,slug,description,category,city,venue_id,date_start,date_end,price_from,image_url")
      .eq("id", id)
      .single(),
    supabase.from("venues").select("id,name").order("name").limit(500),
  ]);

  if (!event) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать событие</h1>
      <EventForm mode="edit" initial={event} venues={venues ?? []} />
    </div>
  );
}

