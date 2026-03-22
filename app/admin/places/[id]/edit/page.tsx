import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaceForm } from "@/components/admin/PlaceForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPlaceEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("places")
    .select("id,name,name_ru,name_be,slug,description,category,city,address,lat,lng,working_hours,entry_price,website,rating,image_url,image_urls")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать место</h1>
      <PlaceForm mode="edit" initial={data} />
    </div>
  );
}

