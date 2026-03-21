"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionState, contractorSchema, eventSchema, placeSchema, storySchema, tourSchema, venueSchema } from "@/lib/admin/shared";

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
    const { supabase } = await requireAdmin();
    const parsed = placeSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };

    const workingHours = parsed.working_hours ? JSON.parse(parsed.working_hours) : {};
    const payload = {
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
    };

    console.log("[admin][updatePlaceAction][payload]", {
      id: parsed.id,
      payload,
      formData: Object.fromEntries(formData.entries()),
    });

    const { data: updatedRows, error } = await supabase
      .from("places")
      .update(payload)
      .eq("id", parsed.id)
      .select("id");

    if (error) {
      console.error("[admin][updatePlaceAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
    if (!updatedRows || updatedRows.length === 0) {
      console.error("[admin][updatePlaceAction] no rows updated", { id: parsed.id });
      return { success: false, message: "Запись не обновлена (RLS или неверный ID)." };
    }
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
    if (error) {
      console.error("[admin][updateVenueAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
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

export async function createContractorAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = contractorSchema.parse(Object.fromEntries(formData.entries()));
    const { error } = await supabase.from("contractors").insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      category: parsed.category,
      city: parsed.city,
      price_from: parsed.price_from ?? null,
      rating: parsed.rating,
      telegram: parsed.telegram || null,
      email: parsed.email || null,
      image_url: parsed.image_url || null,
      created_by: userId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/contractors");
    return { success: true, message: "Подрядчик добавлен" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updateContractorAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = contractorSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("contractors")
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        category: parsed.category,
        city: parsed.city,
        price_from: parsed.price_from ?? null,
        rating: parsed.rating,
        telegram: parsed.telegram || null,
        email: parsed.email || null,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);
    if (error) {
      console.error("[admin][updateContractorAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
    revalidatePath("/admin/contractors");
    return { success: true, message: "Подрядчик обновлён" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deleteContractorAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("contractors").delete().eq("id", id);
  revalidatePath("/admin/contractors");
}

export async function createStoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = storySchema.parse(Object.fromEntries(formData.entries()));
    const { error } = await supabase.from("stories").insert({
      title: parsed.title,
      slug: parsed.slug,
      content: parsed.content,
      city: parsed.city,
      likes: parsed.likes ?? 0,
      place_id: parsed.place_id || null,
      image_url: parsed.image_url || null,
      author_id: userId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/stories");
    return { success: true, message: "История добавлена" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updateStoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = storySchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("stories")
      .update({
        title: parsed.title,
        slug: parsed.slug,
        content: parsed.content,
        city: parsed.city,
        likes: parsed.likes ?? 0,
        place_id: parsed.place_id || null,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);
    if (error) {
      console.error("[admin][updateStoryAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
    revalidatePath("/admin/stories");
    return { success: true, message: "История обновлена" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deleteStoryAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("stories").delete().eq("id", id);
  revalidatePath("/admin/stories");
}

export async function createEventAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = eventSchema.parse(Object.fromEntries(formData.entries()));
    const { error } = await supabase.from("events").insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      category: parsed.category,
      city: parsed.city,
      venue_id: parsed.venue_id || null,
      date_start: parsed.date_start,
      date_end: parsed.date_end || null,
      price_from: parsed.price_from ?? null,
      image_url: parsed.image_url || null,
      organizer_id: userId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/events");
    return { success: true, message: "Событие добавлено" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updateEventAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = eventSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("events")
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        category: parsed.category,
        city: parsed.city,
        venue_id: parsed.venue_id || null,
        date_start: parsed.date_start,
        date_end: parsed.date_end || null,
        price_from: parsed.price_from ?? null,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);
    if (error) {
      console.error("[admin][updateEventAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
    revalidatePath("/admin/events");
    return { success: true, message: "Событие обновлено" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deleteEventAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
}

export async function createTourAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = tourSchema.parse(Object.fromEntries(formData.entries()));
    const langs = (parsed.languages ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const { error } = await supabase.from("tours").insert({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      city: parsed.city,
      duration_hours: parsed.duration_hours,
      price: parsed.price,
      languages: langs,
      image_url: parsed.image_url || null,
      guide_id: userId,
    });
    if (error) return { success: false, message: error.message };
    revalidatePath("/admin/tours");
    return { success: true, message: "Тур добавлен" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function updateTourAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = tourSchema.parse(Object.fromEntries(formData.entries()));
    if (!parsed.id) return { success: false, message: "Не найден ID записи" };
    const langs = (parsed.languages ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const supabase = await createClient();
    const { error } = await supabase
      .from("tours")
      .update({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        city: parsed.city,
        duration_hours: parsed.duration_hours,
        price: parsed.price,
        languages: langs,
        image_url: parsed.image_url || null,
      })
      .eq("id", parsed.id);
    if (error) {
      console.error("[admin][updateTourAction]", { id: parsed.id, error: error.message });
      return { success: false, message: error.message };
    }
    revalidatePath("/admin/tours");
    return { success: true, message: "Тур обновлён" };
  } catch (error) {
    return { success: false, message: "Ошибка валидации", errors: mapZodErrors(error) };
  }
}

export async function deleteTourAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("tours").delete().eq("id", id);
  revalidatePath("/admin/tours");
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

    console.log("[admin][uploadImageAction][incoming]", {
      fileType: file instanceof File ? file.type : typeof file,
      fileSize: file instanceof File ? file.size : null,
      folder,
      slug,
      index,
    });

    if (!(file instanceof File)) return { success: false, message: "Файл не выбран" };
    if (!ALLOWED_TYPES.has(file.type)) return { success: false, message: "Допустимы jpg/png/webp/heic" };
    if (file.size > MAX_SIZE_BYTES) return { success: false, message: "Максимальный размер 10MB" };
    if (!folder || !slug) return { success: false, message: "Не указан путь загрузки" };

    const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("[admin][uploadImageAction] listBuckets error", bucketError.message);
      return { success: false, message: bucketError.message };
    }
    const mediaBucket = (bucketList ?? []).find((b) => b.id === BUCKET);
    if (!mediaBucket) {
      console.error("[admin][uploadImageAction] bucket missing", { bucket: BUCKET });
      return { success: false, message: `Bucket ${BUCKET} не найден` };
    }
    if (!mediaBucket.public) {
      console.error("[admin][uploadImageAction] bucket not public", { bucket: BUCKET });
    }

    const arrayBuffer = await file.arrayBuffer();
    const source = Buffer.from(arrayBuffer);
    const ts = Date.now();
    const safeSlug = slug.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    const baseName = `${safeSlug}-${index}-${ts}`;
    const originalPath = `${folder}/${safeSlug}/${baseName}.webp`;
    const thumbPath = `${folder}/${safeSlug}/${baseName}-thumb.webp`;
    console.log("[admin][uploadImageAction][paths]", {
      folder,
      slug: safeSlug,
      originalPath,
      thumbPath,
    });

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

