"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTourAction, updateTourAction } from "@/app/admin/actions";
import { CITIES, initialActionState, slugify } from "@/lib/admin/shared";
import { ImageUpload } from "./ImageUpload";

type TourFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    city: string;
    duration_hours: number;
    price: number;
    languages: string[];
    image_url: string | null;
  };
};

export function TourForm({ mode, initial }: TourFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createTourAction : updateTourAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [images, setImages] = useState<string[]>(initial?.image_url ? [initial.image_url] : []);

  useEffect(() => {
    if (!initial?.slug) setSlug(slugify(name));
  }, [name, initial?.slug]);

  const firstImage = useMemo(() => images[0] ?? "", [images]);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? "");
      setSlug(initial.slug ?? "");
      setImages(initial.image_url ? [initial.image_url] : []);
    }
  }, [initial]);

  useEffect(() => {
    if (state.success) router.push("/admin/tours?saved=1");
  }, [state.success, router]);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="image_url" value={firstImage} />
      <label>Название<input name="name" value={name} onChange={(e) => setName(e.target.value)} style={inp} /></label>
      <label>Slug<input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} /></label>
      <label>Описание<textarea name="description" defaultValue={initial?.description ?? ""} style={{ ...inp, minHeight: 120 }} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <label>
          Город
          <select name="city" defaultValue={initial?.city ?? CITIES[0]} style={inp}>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>Длительность (ч)<input name="duration_hours" defaultValue={initial?.duration_hours ?? 2} style={inp} /></label>
        <label>Цена<input name="price" defaultValue={initial?.price ?? 0} style={inp} /></label>
        <label>Языки (через запятую)<input name="languages" defaultValue={initial?.languages?.join(", ") ?? ""} style={inp} /></label>
      </div>
      <ImageUpload folder="tours" slug={slug} value={images} onChange={setImages} />
      {state.message ? <div style={{ color: state.success ? "#1a7f37" : "#c22", fontSize: 13 }}>{state.message}</div> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={pending} style={btnDark}>{pending ? "Сохранение..." : "Сохранить"}</button>
        <Link href="/admin/tours" style={btnLight}>Отмена</Link>
      </div>
    </form>
  );
}

const inp: CSSProperties = { width: "100%", marginTop: 6, border: "1px solid #ddd", borderRadius: 10, height: 40, padding: "0 10px", background: "#fff" };
const btnDark: CSSProperties = { height: 42, borderRadius: 10, background: "#181818", color: "#fff", border: "none", padding: "0 16px", cursor: "pointer" };
const btnLight: CSSProperties = { height: 42, borderRadius: 10, border: "1px solid #ddd", color: "#181818", padding: "10px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" };

