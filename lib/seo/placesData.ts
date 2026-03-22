import { createClient } from "@/lib/supabase/server";
import { PLACES_PAGE_SIZE } from "./places";

export type PlacesListingItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string | null;
  rating: number | null;
  entry_price: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
};

export async function fetchPlacesListing(args: {
  categoryDb: string | "all";
  cityDb: string | null;
  page: number;
}): Promise<{ items: PlacesListingItem[]; totalCount: number }> {
  const { categoryDb, cityDb, page } = args;
  const supabase = await createClient();

  const from = (page - 1) * PLACES_PAGE_SIZE;
  const to = from + PLACES_PAGE_SIZE - 1;

  let query = supabase
    .from("places")
    .select("id,slug,name,category,city,address,rating,entry_price,image_url,image_urls", { count: "exact" })
    .order("rating", { ascending: false });

  if (categoryDb !== "all") query = query.eq("category", categoryDb);
  if (cityDb) query = query.ilike("city", `%${cityDb}%`);

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    items: (data ?? []) as PlacesListingItem[],
    totalCount: count ?? 0,
  };
}

export async function fetchPlacesListingCount(args: {
  categoryDb: string | "all";
  cityDb: string | null;
}): Promise<number> {
  const { categoryDb, cityDb } = args;
  const supabase = await createClient();

  let query = supabase.from("places").select("*", { count: "exact", head: true });
  if (categoryDb !== "all") query = query.eq("category", categoryDb);
  if (cityDb) query = query.ilike("city", `%${cityDb}%`);

  const { count } = await query;
  return count ?? 0;
}

