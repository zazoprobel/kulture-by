import { createClient } from "@/lib/supabase/server";
import { StoryForm } from "@/components/admin/StoryForm";

export default async function AdminStoryNewPage() {
  const supabase = await createClient();
  const { data: places } = await supabase.from("places").select("id,name").order("name").limit(500);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новая история</h1>
      <StoryForm mode="create" places={places ?? []} />
    </div>
  );
}

