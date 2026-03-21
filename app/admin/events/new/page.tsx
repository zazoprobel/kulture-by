import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";

export default async function AdminEventNewPage() {
  const supabase = await createClient();
  const { data: venues } = await supabase.from("venues").select("id,name").order("name").limit(500);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новое событие</h1>
      <EventForm mode="create" venues={venues ?? []} />
    </div>
  );
}

