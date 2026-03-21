"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction, updateEventAction } from "@/app/admin/actions";
import { CITIES, initialActionState, slugify } from "@/lib/admin/shared";
import { ImageUpload } from "./ImageUpload";

type EventFormProps = {
  mode: "create" | "edit";
  venues: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    city: string;
    venue_id: string | null;
    date_start: string;
    date_end: string | null;
    price_from: number | null;
    image_url: string | null;
  };
};

export function EventForm({ mode, venues, initial }: EventFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createEventAction : updateEventAction;
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
    if (state.success) router.push("/admin/events?saved=1");
  }, [state.success, router]);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="image_url" value={firstImage} />
      <label>Название<input name="name" value={name} onChange={(e) => setName(e.target.value)} style={inp} /></label>
      <label>Slug<input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} /></label>
      <label>Описание<textarea name="description" defaultValue={initial?.description ?? ""} style={{ ...inp, minHeight: 120 }} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <label>Категория<input name="category" defaultValue={initial?.category ?? "event"} style={inp} /></label>
        <label>
          Город
          <select name="city" defaultValue={initial?.city ?? CITIES[0]} style={inp}>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          Площадка
          <select name="venue_id" defaultValue={initial?.venue_id ?? ""} style={inp}>
            <option value="">Не выбрано</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <label>Дата начала<input type="datetime-local" name="date_start" defaultValue={initial?.date_start?.slice(0, 16) ?? ""} style={inp} /></label>
        <label>Дата конца<input type="datetime-local" name="date_end" defaultValue={initial?.date_end?.slice(0, 16) ?? ""} style={inp} /></label>
        <label>Цена от<input name="price_from" defaultValue={initial?.price_from ?? ""} style={inp} /></label>
      </div>
      <ImageUpload folder="events" slug={slug} value={images} onChange={setImages} />
      {state.message ? <div style={{ color: state.success ? "#1a7f37" : "#c22", fontSize: 13 }}>{state.message}</div> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={pending} style={btnDark}>{pending ? "Сохранение..." : "Сохранить"}</button>
        <Link href="/admin/events" style={btnLight}>Отмена</Link>
      </div>
    </form>
  );
}

const inp: CSSProperties = { width: "100%", marginTop: 6, border: "1px solid #ddd", borderRadius: 10, height: 40, padding: "0 10px", background: "#fff" };
const btnDark: CSSProperties = { height: 42, borderRadius: 10, background: "#181818", color: "#fff", border: "none", padding: "0 16px", cursor: "pointer" };
const btnLight: CSSProperties = { height: 42, borderRadius: 10, border: "1px solid #ddd", color: "#181818", padding: "10px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" };

