import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TourForm } from "@/components/admin/TourForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTourEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tour } = await supabase
    .from("tours")
    .select("id,name,slug,description,city,duration_hours,price,languages,image_url")
    .eq("id", id)
    .single();

  if (!tour) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать тур</h1>
      <TourForm mode="edit" initial={tour} />
    </div>
  );
}

