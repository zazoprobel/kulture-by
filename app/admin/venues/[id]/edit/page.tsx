import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VenueForm } from "@/components/admin/VenueForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminVenueEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("id,name,slug,description,type,city,address,lat,lng,capacity_banquet,capacity_buffet,price_from,rating,image_url")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать площадку</h1>
      <VenueForm mode="edit" initial={data} />
    </div>
  );
}

