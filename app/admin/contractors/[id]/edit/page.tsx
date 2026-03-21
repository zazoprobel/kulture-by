import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContractorForm } from "@/components/admin/ContractorForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminContractorEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contractors")
    .select("id,name,slug,description,category,city,price_from,rating,telegram,email,image_url")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать подрядчика</h1>
      <ContractorForm mode="edit" initial={data} />
    </div>
  );
}

