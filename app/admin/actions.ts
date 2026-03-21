"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionState, placeSchema, venueSchema } from "@/lib/admin/shared";

const BUCKET = "kulture-media";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Не авторизован");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Недостаточно прав");
  }

  return { supabase, userId: user.id };
}

function mapZodErrors(error: unknown): Record<string, string> {
  if (!(error instanceof Error) || !("issues" in error)) return {};
  const zodError = error as { issues: Array<{ path: Array<string | number>; message: string }> };
  const out: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] = issue.message;
  }
  return out;
}

export async function createPlaceAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = placeSchema.parse(Object.fromEntries(formData.entries()));

    const workingHours = parsed.working_hours ? JSON.parse(parsed.working_hours) : {};

    const { error } = await supabase.from("places").insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      category: parsed.category,
      city: parsed.city,
      address: parsed.address || null,
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
      working_hours: workingHours,
      entry_price: parsed.entry_price ?? null,
      website: parsed.website || null,
      rating: parsed.rating,
      image_url: parsed.image_url || null,
      created_by: userId,
    });

    if (error) return { success: false, message: error.message };
    revalidatePath("/admin");
    revalidatePath("/admin/places");
    revalidatePath("/places");
    return { success: true, message: "Место добавлено" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updatePlaceAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = placeSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };

    const supabase = await createClient();
    const workingHours = parsed.working_hours ? JSON.parse(parsed.working_hours) : {};
    const { error } = await supabase
      .from("places")
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        category: parsed.category,
        city: parsed.city,
        address: parsed.address || null,
        lat: parsed.lat ?? null,
        lng: parsed.lng ?? null,
        working_hours: workingHours,
        entry_price: parsed.entry_price ?? null,
        website: parsed.website || null,
        rating: parsed.rating,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);

    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/places");
    revalidatePath(`/places/${parsed.slug}`);
    return { success: true, message: "Место обновлено" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deletePlaceAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("places").delete().eq("id", id);
  revalidatePath("/admin/places");
}

export async function createVenueAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = venueSchema.parse(Object.fromEntries(formData.entries()));
    const { error } = await supabase.from("venues").insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      type: parsed.type,
      city: parsed.city,
      address: parsed.address || null,
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
      capacity_banquet: parsed.capacity_banquet ?? null,
      capacity_buffet: parsed.capacity_buffet ?? null,
      price_from: parsed.price_from ?? null,
      rating: parsed.rating,
      image_url: parsed.image_url || null,
      created_by: userId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/venues");
    revalidatePath("/venues");
    return { success: true, message: "Площадка добавлена" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updateVenueAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = venueSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("venues")
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        type: parsed.type,
        city: parsed.city,
        address: parsed.address || null,
        lat: parsed.lat ?? null,
        lng: parsed.lng ?? null,
        capacity_banquet: parsed.capacity_banquet ?? null,
        capacity_buffet: parsed.capacity_buffet ?? null,
        price_from: parsed.price_from ?? null,
        rating: parsed.rating,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/venues");
    revalidatePath(`/venues/${parsed.slug}`);
    return { success: true, message: "Площадка обновлена" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deleteVenueAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("venues").delete().eq("id", id);
  revalidatePath("/admin/venues");
}

export async function signOutAdminAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function uploadImageAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "");
    const slug = String(formData.get("slug") ?? "").trim();
    const index = Number(formData.get("index") ?? "1");

    if (!(file instanceof File)) return { success: false, message: "Файл не выбран" };
    if (!ALLOWED_TYPES.has(file.type)) return { success: false, message: "Допустимы jpg/png/webp/heic" };
    if (file.size > MAX_SIZE_BYTES) return { success: false, message: "Максимальный размер 10MB" };
    if (!folder || !slug) return { success: false, message: "Не указан путь загрузки" };

    const arrayBuffer = await file.arrayBuffer();
    const source = Buffer.from(arrayBuffer);
    const ts = Date.now();
    const safeSlug = slug.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    const baseName = `${safeSlug}-${index}-${ts}`;
    const originalPath = `${folder}/${safeSlug}/${baseName}.webp`;
    const thumbPath = `${folder}/${safeSlug}/${baseName}-thumb.webp`;

    const fullBuffer = await sharp(source)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const thumbBuffer = await sharp(source)
      .rotate()
      .resize({ width: 400, height: 300, fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const uploadOriginal = await supabase.storage.from(BUCKET).upload(originalPath, fullBuffer, {
      contentType: "image/webp",
      upsert: false,
    });
    if (uploadOriginal.error) return { success: false, message: uploadOriginal.error.message };

    const uploadThumb = await supabase.storage.from(BUCKET).upload(thumbPath, thumbBuffer, {
      contentType: "image/webp",
      upsert: false,
    });
    if (uploadThumb.error) return { success: false, message: uploadThumb.error.message };

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(originalPath);
    return { success: true, message: "Загрузка завершена", imageUrl: publicData.publicUrl };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Ошибка загрузки" };
  }
}

export async function deleteImageAction(path: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const thumbPath = path.replace(/\.webp$/i, "-thumb.webp");
    const { error } = await supabase.storage.from(BUCKET).remove([path, thumbPath]);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Фото удалено" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Ошибка удаления" };
  }
}

