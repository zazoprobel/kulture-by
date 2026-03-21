"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createPlaceAction, updatePlaceAction } from "@/app/admin/actions";
import { CITIES, initialActionState, slugify } from "@/lib/admin/shared";
import { ImageUpload } from "./ImageUpload";

type PlaceFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    city: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    working_hours: Record<string, string> | null;
    entry_price: number | null;
    website: string | null;
    rating: number | null;
    image_url: string | null;
  };
};

export function PlaceForm({ mode, initial }: PlaceFormProps) {
  const action = mode === "create" ? createPlaceAction : updatePlaceAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [images, setImages] = useState<string[]>(initial?.image_url ? [initial.image_url] : []);

  useEffect(() => {
    if (!initial?.slug) setSlug(slugify(name));
  }, [name, initial?.slug]);

  const firstImage = useMemo(() => images[0] ?? "", [images]);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="image_url" value={firstImage} />

      <label>
        Название
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        {state.errors?.name ? <span style={err}>{state.errors.name}</span> : null}
      </label>

      <label>
        Slug
        <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} />
        {state.errors?.slug ? <span style={err}>{state.errors.slug}</span> : null}
      </label>

      <label>
        Описание
        <textarea name="description" defaultValue={initial?.description ?? ""} style={{ ...inp, minHeight: 120 }} />
        {state.errors?.description ? <span style={err}>{state.errors.description}</span> : null}
      </label>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <label>
          Категория
          <select name="category" defaultValue={initial?.category ?? "nature"} style={inp}>
            <option value="nature">Природа</option>
            <option value="history">История</option>
            <option value="castles">Замки</option>
            <option value="museums">Музеи</option>
            <option value="gastro">Гастро</option>
            <option value="activity">Активный отдых</option>
            <option value="kids">С детьми</option>
          </select>
          {state.errors?.category ? <span style={err}>{state.errors.category}</span> : null}
        </label>
        <label>
          Город
          <select name="city" defaultValue={initial?.city ?? CITIES[0]} style={inp}>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
      </div>

      <label>Адрес<input name="address" defaultValue={initial?.address ?? ""} style={inp} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <label>Lat<input name="lat" defaultValue={initial?.lat ?? ""} style={inp} /></label>
        <label>Lng<input name="lng" defaultValue={initial?.lng ?? ""} style={inp} /></label>
      </div>
      <label>Часы работы (JSON)<textarea name="working_hours" defaultValue={JSON.stringify(initial?.working_hours ?? {}, null, 2)} style={{ ...inp, minHeight: 110 }} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <label>Цена входа<input name="entry_price" defaultValue={initial?.entry_price ?? ""} style={inp} /></label>
        <label>Сайт<input name="website" defaultValue={initial?.website ?? ""} style={inp} /></label>
        <label>Рейтинг<input name="rating" defaultValue={initial?.rating ?? 0} style={inp} /></label>
      </div>

      <ImageUpload folder="places" slug={slug} value={images} onChange={setImages} />

      {state.message ? <div style={{ color: state.success ? "#1a7f37" : "#c22", fontSize: 13 }}>{state.message}</div> : null}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={pending} style={btnDark}>{pending ? "Сохранение..." : "Сохранить"}</button>
        <Link href="/admin/places" style={btnLight}>Отмена</Link>
      </div>
    </form>
  );
}

const inp: CSSProperties = { width: "100%", marginTop: 6, border: "1px solid #ddd", borderRadius: 10, height: 40, padding: "0 10px", background: "#fff" };
const err: CSSProperties = { display: "block", marginTop: 6, color: "#c22", fontSize: 12 };
const btnDark: CSSProperties = { height: 42, borderRadius: 10, background: "#181818", color: "#fff", border: "none", padding: "0 16px", cursor: "pointer" };
const btnLight: CSSProperties = { height: 42, borderRadius: 10, border: "1px solid #ddd", color: "#181818", padding: "10px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" };

