"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteImageAction, uploadImageAction } from "@/app/admin/actions";

type Props = {
  folder: "places" | "venues" | "contractors" | "avatars" | "stories";
  slug: string;
  value: string[];
  onChange: (next: string[]) => void;
};

export function ImageUpload({ folder, slug, value, onChange }: Props) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);

  const preview = useMemo(() => value[0] ?? "", [value]);

  const handleFiles = (files: FileList | null) => {
    if (!files || !slug) return;
    if (value.length >= 10) {
      setError("Максимум 10 фото");
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Файл должен быть изображением");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер больше 10MB");
      return;
    }

    setError("");
    setProgress(10);

    startTransition(async () => {
      const timer = setInterval(() => {
        setProgress((p) => Math.min(90, p + 10));
      }, 120);

      const form = new FormData();
      form.set("file", file);
      form.set("folder", folder);
      form.set("slug", slug);
      form.set("index", String(value.length + 1));

      const result = await uploadImageAction({ success: false, message: "" }, form);
      clearInterval(timer);
      setProgress(100);

      if (!result.success || !result.imageUrl) {
        setError(result.message || "Ошибка загрузки");
        setProgress(0);
        return;
      }

      onChange([...value, result.imageUrl]);
      setTimeout(() => setProgress(0), 500);
    });
  };

  const remove = (url: string) => {
    startTransition(async () => {
      const path = url.split("/object/public/kulture-media/")[1] ?? "";
      if (path) await deleteImageAction(path);
      onChange(value.filter((x) => x !== url));
    });
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: "1.5px dashed #bbb",
          borderRadius: 12,
          padding: 16,
          background: drag ? "#f6f6f6" : "#fff",
        }}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(e) => handleFiles(e.target.files)} />
        <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>Drag & drop или выберите фото (до 10MB)</div>
      </div>

      {progress > 0 ? (
        <div style={{ height: 8, borderRadius: 99, background: "#eee", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#181818", transition: "width .15s" }} />
        </div>
      ) : null}

      {preview ? (
        <img src={preview} alt="preview" style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #ddd" }} />
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        {value.map((url) => (
          <div key={url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#333", fontSize: 12, textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {url}
            </a>
            <button type="button" disabled={pending} onClick={() => remove(url)} style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: "4px 10px", cursor: "pointer" }}>
              Удалить
            </button>
          </div>
        ))}
      </div>

      {error ? <div style={{ color: "#c22", fontSize: 12 }}>{error}</div> : null}
    </div>
  );
}

