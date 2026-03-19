import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { VenueBookingCard } from "@/components/venues/VenueBookingCard";

type PageProps = { params: Promise<{ slug: string }> };

type Venue = {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  type: string;
  rating: number | null;
  capacity_banquet: number | null;
  capacity_buffet: number | null;
  price_from: number | null;
};

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: venueData } = await supabase
    .from("venues")
    .select("id,slug,name,city,description,type,rating,capacity_banquet,capacity_buffet,price_from")
    .eq("slug", slug)
    .single();

  const venue = venueData as Venue | null;
  if (!venue) notFound();

  const { data: similarData } = await supabase
    .from("venues")
    .select("id,slug,name,city,rating,price_from")
    .neq("id", venue.id)
    .eq("city", venue.city)
    .limit(3);

  const similar = (similarData ?? []) as Array<{ id: string; slug: string; name: string; city: string; rating: number | null; price_from: number | null }>;

  return (
    <>
      <style>{`
        .wrap{margin-top:22px}
        .gallery{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:300px 150px;gap:10px;border-radius:20px;overflow:hidden}
        .gMain,.gSm{position:relative}
        .gMain{grid-row:span 2}
        .layout{display:grid;grid-template-columns:1fr 360px;gap:30px;margin-top:28px}
        .box{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:22px;margin-bottom:18px}
        .venueName{font-family:"Unbounded",sans-serif;font-size:30px;line-height:1.1}
        .meta{margin-top:10px;color:#666;display:flex;gap:12px;flex-wrap:wrap;font-size:13px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .stat{background:#F7F6F2;border-radius:14px;padding:14px;text-align:center}
        .statN{font-family:"Unbounded",sans-serif;font-size:18px}
        .title{font-family:"Unbounded",sans-serif;font-size:14px;margin-bottom:12px}
        .halls{display:flex;flex-direction:column;gap:10px}
        .hall{border:1px solid rgba(0,0,0,.08);border-radius:12px;padding:12px}
        .packages{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .pkg{border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:14px}
        .similar{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .sCard{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:14px;text-decoration:none;color:inherit}
        .bookingCard{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:22px;position:sticky;top:86px}
        .bookingPrice{font-family:"Unbounded",sans-serif;font-size:24px}
        .bookingPriceNote{font-size:12px;color:#777;margin-bottom:12px}
        .bkLbl{display:block;font-size:11px;text-transform:uppercase;color:#888;margin:10px 0 6px}
        .bkSel,.bkInp{width:100%;height:44px;border-radius:12px;border:1px solid rgba(0,0,0,.12);background:#F7F6F2;padding:0 12px}
        .guestsRow{display:flex;align-items:center;justify-content:space-between;background:#F7F6F2;border:1px solid rgba(0,0,0,.08);border-radius:12px;padding:8px 10px;margin-top:8px}
        .cntBtn{width:28px;height:28px;border-radius:50%;border:1px solid rgba(0,0,0,.1);background:#fff}
        .bkTotal{background:#F7F6F2;border-radius:14px;padding:14px;margin-top:12px}
        .bkTotalRow{display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:7px}
        .bkTotalRow.total{border-top:1px solid rgba(0,0,0,.08);padding-top:8px;margin-top:8px;margin-bottom:0;color:#181818;font-weight:700}
        .bkBtn{width:100%;height:46px;border:none;border-radius:12px;background:#D2F882;margin-top:12px;font-weight:700}
        @media (max-width:1024px){.layout{grid-template-columns:1fr}.packages,.similar,.stats{grid-template-columns:repeat(2,1fr)}.bookingCard{position:static}}
        @media (max-width:767px){.gallery,.stats,.packages,.similar{grid-template-columns:1fr}.gallery{grid-template-rows:220px 120px 120px}.gMain{grid-row:span 1}}
      `}</style>
      <Header />
      <Container>
        <div className="wrap">
          <div style={{ color: "#666", fontSize: "13px" }}>
            <Link href="/">Главная</Link> · <Link href="/venues">Площадки</Link> · <strong>{venue.name}</strong>
          </div>

          <section className="gallery">
            <div className="gMain">
              <Image src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400" alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} />
            </div>
            <div className="gSm">
              <Image src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700" alt={`${venue.name} photo 2`} fill unoptimized style={{ objectFit: "cover" }} />
            </div>
            <div className="gSm">
              <Image src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700" alt={`${venue.name} photo 3`} fill unoptimized style={{ objectFit: "cover" }} />
            </div>
          </section>

          <div className="layout">
            <main>
              <div className="box">
                <h1 className="venueName">{venue.name}</h1>
                <div className="meta">
                  <span>⭐ {venue.rating ?? 0}</span>
                  <span>📍 {venue.city}</span>
                  <span>Тип: {venue.type}</span>
                </div>
              </div>

              <div className="box">
                <div className="stats">
                  <div className="stat"><div className="statN">{venue.capacity_banquet ?? 0}</div><div>Банкет</div></div>
                  <div className="stat"><div className="statN">{venue.capacity_buffet ?? 0}</div><div>Фуршет</div></div>
                  <div className="stat"><div className="statN">{Math.round(venue.price_from ?? 0)}</div><div>от BYN</div></div>
                  <div className="stat"><div className="statN">4.9</div><div>Средний отзыв</div></div>
                </div>
              </div>

              <div className="box">
                <h2 className="title">Об площадке</h2>
                <p style={{ color: "#555", lineHeight: 1.7 }}>{venue.description}</p>
              </div>

              <div className="box">
                <h2 className="title">Залы и пакеты</h2>
                <div className="halls">
                  <div className="hall"><strong>Главный зал</strong><div className="meta"><span>👥 до {venue.capacity_banquet ?? 0}</span><span>🍽️ до {venue.capacity_buffet ?? 0}</span></div></div>
                  <div className="hall"><strong>Летняя веранда</strong><div className="meta"><span>👥 до {Math.max(20, Math.round((venue.capacity_banquet ?? 60) * 0.5))}</span></div></div>
                </div>
                <div className="packages" style={{ marginTop: "12px" }}>
                  <div className="pkg"><strong>Базовый</strong><div className="meta">от {Math.round(venue.price_from ?? 0)} BYN</div></div>
                  <div className="pkg"><strong>Свадебный</strong><div className="meta">от {Math.round((venue.price_from ?? 0) * 2.2)} BYN</div></div>
                  <div className="pkg"><strong>VIP</strong><div className="meta">от {Math.round((venue.price_from ?? 0) * 3.4)} BYN</div></div>
                </div>
              </div>

              <div className="box">
                <h2 className="title">Похожие площадки</h2>
                <div className="similar">
                  {similar.map((item) => (
                    <Link key={item.id} href={`/venues/${item.slug}`} className="sCard">
                      <div style={{ fontFamily: "Unbounded, sans-serif", fontSize: "12px" }}>{item.name}</div>
                      <div className="meta">{item.city}</div>
                      <div className="meta">⭐ {item.rating ?? 0} · от {Math.round(item.price_from ?? 0)} BYN</div>
                    </Link>
                  ))}
                </div>
              </div>
            </main>
            <aside>
              <VenueBookingCard basePrice={Math.round(venue.price_from ?? 0)} />
            </aside>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}
