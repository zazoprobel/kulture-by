"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  placeName: string;
};

export function PlaceGallery({ images, placeName }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const visible = useMemo(() => images.slice(0, 3), [images]);
  const extraCount = Math.max(0, images.length - 3);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setActive((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  const openAt = (idx: number) => {
    setActive(idx);
    setOpen(true);
  };

  const next = () => setActive((p) => (p + 1) % images.length);
  const prev = () => setActive((p) => (p - 1 + images.length) % images.length);

  return (
    <>
      <section className="gallery">
        <button type="button" className="gMain gBtnReset" onClick={() => openAt(0)} aria-label="Открыть фото 1">
          <Image src={visible[0]} alt={placeName} fill unoptimized style={{ objectFit: "cover" }} />
          {extraCount > 0 ? (
            <button
              type="button"
              className="extraBadge"
              onClick={(e) => {
                e.stopPropagation();
                openAt(0);
              }}
            >
              +{extraCount} фото
            </button>
          ) : null}
        </button>
        <button type="button" className="gSm gBtnReset" onClick={() => openAt(1)} aria-label="Открыть фото 2">
          <Image src={visible[1]} alt={`${placeName} photo 2`} fill unoptimized style={{ objectFit: "cover" }} />
        </button>
        <button type="button" className="gSm gBtnReset" onClick={() => openAt(2)} aria-label="Открыть фото 3">
          <Image src={visible[2]} alt={`${placeName} photo 3`} fill unoptimized style={{ objectFit: "cover" }} />
        </button>
      </section>

      {open ? (
        <div className="glModalBack" onClick={() => setOpen(false)}>
          <div className="glModal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="glClose" onClick={() => setOpen(false)} aria-label="Закрыть">
              ✕
            </button>
            {images.length > 1 ? (
              <button type="button" className="glNav glPrev" onClick={prev} aria-label="Предыдущее фото">
                ‹
              </button>
            ) : null}
            <div className="glImageWrap">
              <Image src={images[active]} alt={`${placeName} ${active + 1}`} fill unoptimized style={{ objectFit: "contain" }} />
            </div>
            {images.length > 1 ? (
              <button type="button" className="glNav glNext" onClick={next} aria-label="Следующее фото">
                ›
              </button>
            ) : null}
            <div className="glCounter">
              {active + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .gallery{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:300px 150px;gap:10px;border-radius:20px;overflow:hidden}
        .gMain,.gSm{position:relative}
        .gMain{grid-row:span 2}
        .gBtnReset{border:none;padding:0;background:transparent;cursor:pointer}
        .extraBadge{position:absolute;right:10px;top:10px;height:32px;border:none;border-radius:999px;background:rgba(24,24,24,.88);color:#fff;padding:0 12px;font-size:12px;font-weight:700;cursor:pointer}
        .glModalBack{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px}
        .glModal{position:relative;width:min(1200px,100%);height:min(88vh,900px)}
        .glImageWrap{position:relative;width:100%;height:100%}
        .glClose{position:absolute;right:0;top:-44px;width:36px;height:36px;border:none;border-radius:10px;background:rgba(255,255,255,.2);color:#fff;cursor:pointer;z-index:2}
        .glNav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border:none;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:30px;line-height:1;cursor:pointer;z-index:2}
        .glPrev{left:12px}
        .glNext{right:12px}
        .glCounter{position:absolute;left:50%;transform:translateX(-50%);bottom:-38px;color:#fff;font-size:13px}
        @media (max-width:767px){
          .gallery{grid-template-columns:1fr;grid-template-rows:220px 120px 120px}
          .gMain{grid-row:span 1}
          .glModalBack{padding:12px}
          .glModal{height:78vh}
          .glClose{top:8px;right:8px}
          .glCounter{bottom:8px;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:999px}
        }
      `}</style>
    </>
  );
}

