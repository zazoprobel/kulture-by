import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoryForm } from "@/components/admin/StoryForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminStoryEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: story }, { data: places }] = await Promise.all([
    supabase
      .from("stories")
      .select("id,title,slug,content,city,likes,place_id,image_url")
      .eq("id", id)
      .single(),
    supabase.from("places").select("id,name").order("name").limit(500),
  ]);

  if (!story) notFound();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Редактировать историю</h1>
      <StoryForm mode="edit" initial={story} places={places ?? []} />
    </div>
  );
}

