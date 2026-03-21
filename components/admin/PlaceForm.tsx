"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    image_urls?: string[] | null;
  };
};

export function PlaceForm({ mode, initial }: PlaceFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createPlaceAction : updatePlaceAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "nature");
  const [city, setCity] = useState(initial?.city ?? CITIES[0]);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [lat, setLat] = useState(initial?.lat?.toString() ?? "");
  const [lng, setLng] = useState(initial?.lng?.toString() ?? "");
  const [workingHours, setWorkingHours] = useState(JSON.stringify(initial?.working_hours ?? {}, null, 2));
  const [entryPrice, setEntryPrice] = useState(initial?.entry_price?.toString() ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [rating, setRating] = useState((initial?.rating ?? 0).toString());
  const [images, setImages] = useState<string[]>(initial?.image_url ? [initial.image_url] : []);

  useEffect(() => {
    if (!initial?.slug) setSlug(slugify(name));
  }, [name, initial?.slug]);

  const firstImage = useMemo(() => images[0] ?? "", [images]);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? "");
      setSlug(initial.slug ?? "");
      setDescription(initial.description ?? "");
      setCategory(initial.category ?? "nature");
      setCity(initial.city ?? CITIES[0]);
      setAddress(initial.address ?? "");
      setLat(initial.lat?.toString() ?? "");
      setLng(initial.lng?.toString() ?? "");
      setWorkingHours(JSON.stringify(initial.working_hours ?? {}, null, 2));
      setEntryPrice(initial.entry_price?.toString() ?? "");
      setWebsite(initial.website ?? "");
      setRating((initial.rating ?? 0).toString());
      setImages(initial.image_urls && initial.image_urls.length > 0 ? initial.image_urls : initial.image_url ? [initial.image_url] : []);
    }
  }, [initial]);

  useEffect(() => {
    if (state.success) router.push("/admin/places?saved=1");
  }, [state.success, router]);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="image_url" value={firstImage} />
      <input type="hidden" name="image_urls" value={JSON.stringify(images)} />

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
        <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, minHeight: 120 }} />
        {state.errors?.description ? <span style={err}>{state.errors.description}</span> : null}
      </label>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <label>
          Категория
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
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
          <select name="city" value={city} onChange={(e) => setCity(e.target.value)} style={inp}>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
      </div>

      <label>Адрес<input name="address" value={address} onChange={(e) => setAddress(e.target.value)} style={inp} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <label>Lat<input name="lat" value={lat} onChange={(e) => setLat(e.target.value)} style={inp} /></label>
        <label>Lng<input name="lng" value={lng} onChange={(e) => setLng(e.target.value)} style={inp} /></label>
      </div>
      <label>Часы работы (JSON)<textarea name="working_hours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} style={{ ...inp, minHeight: 110 }} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <label>Цена входа<input name="entry_price" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} style={inp} /></label>
        <label>Сайт<input name="website" value={website} onChange={(e) => setWebsite(e.target.value)} style={inp} /></label>
        <label>Рейтинг<input name="rating" value={rating} onChange={(e) => setRating(e.target.value)} style={inp} /></label>
      </div>

      <ImageUpload
        folder="places"
        slug={slug}
        value={images}
        initialImages={initial?.image_urls && initial.image_urls.length > 0 ? initial.image_urls : initial?.image_url ? [initial.image_url] : []}
        onChange={setImages}
      />

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

