"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction, updateStoryAction } from "@/app/admin/actions";
import { CITIES, initialActionState, slugify } from "@/lib/admin/shared";
import { ImageUpload } from "./ImageUpload";

type StoryFormProps = {
  mode: "create" | "edit";
  places: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    city: string;
    likes: number | null;
    place_id: string | null;
    image_url: string | null;
  };
};

export function StoryForm({ mode, places, initial }: StoryFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createStoryAction : updateStoryAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [images, setImages] = useState<string[]>(initial?.image_url ? [initial.image_url] : []);

  useEffect(() => {
    if (!initial?.slug) setSlug(slugify(title));
  }, [title, initial?.slug]);

  const firstImage = useMemo(() => images[0] ?? "", [images]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setSlug(initial.slug ?? "");
      setImages(initial.image_url ? [initial.image_url] : []);
    }
  }, [initial]);

  useEffect(() => {
    if (state.success) router.push("/admin/stories?saved=1");
  }, [state.success, router]);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="image_url" value={firstImage} />
      <label>Заголовок<input name="title" value={title} onChange={(e) => setTitle(e.target.value)} style={inp} /></label>
      <label>Slug<input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} /></label>
      <label>Текст<textarea name="content" defaultValue={initial?.content ?? ""} style={{ ...inp, minHeight: 150 }} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <label>
          Город
          <select name="city" defaultValue={initial?.city ?? CITIES[0]} style={inp}>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          Место
          <select name="place_id" defaultValue={initial?.place_id ?? ""} style={inp}>
            <option value="">Не выбрано</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>Лайки<input name="likes" defaultValue={initial?.likes ?? 0} style={inp} /></label>
      </div>
      <ImageUpload folder="stories" slug={slug} value={images} onChange={setImages} />
      {state.message ? <div style={{ color: state.success ? "#1a7f37" : "#c22", fontSize: 13 }}>{state.message}</div> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={pending} style={btnDark}>{pending ? "Сохранение..." : "Сохранить"}</button>
        <Link href="/admin/stories" style={btnLight}>Отмена</Link>
      </div>
    </form>
  );
}

const inp: CSSProperties = { width: "100%", marginTop: 6, border: "1px solid #ddd", borderRadius: 10, height: 40, padding: "0 10px", background: "#fff" };
const btnDark: CSSProperties = { height: 42, borderRadius: 10, background: "#181818", color: "#fff", border: "none", padding: "0 16px", cursor: "pointer" };
const btnLight: CSSProperties = { height: 42, borderRadius: 10, border: "1px solid #ddd", color: "#181818", padding: "10px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" };

