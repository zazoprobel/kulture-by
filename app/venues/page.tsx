import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { VenuesResults, type VenueCard } from "@/components/venues/VenuesResults";

type PageProps = {
  searchParams: Promise<{
    type?: string;
    minGuests?: string;
    maxPrice?: string;
    amenities?: string;
  }>;
};

export default async function VenuesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select("id,slug,name,city,type,rating,capacity_banquet,capacity_buffet,price_from")
    .order("rating", { ascending: false });

  if (params.type) query = query.eq("type", params.type);
  if (params.minGuests) query = query.gte("capacity_banquet", Number(params.minGuests));
  if (params.maxPrice) query = query.lte("price_from", Number(params.maxPrice));

  const { data, error } = await query.limit(60);
  if (error) console.error("Venues query error", error.message);
  const venues = (data ?? []) as VenueCard[];

  const chips = [
    params.type ? `Тип: ${params.type}` : null,
    params.minGuests ? `Гостей от: ${params.minGuests}` : null,
    params.maxPrice ? `Бюджет до: ${params.maxPrice}` : null,
    params.amenities ? `Удобства: ${params.amenities}` : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <style>{`
        .wrap{margin-top:20px}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:13px;color:#888;padding:0 0 14px}
        .breadcrumb a{color:#888;text-decoration:none}
        .pageBanner{background:#E7D4FF;border-radius:20px;padding:32px 40px;display:flex;align-items:center;gap:32px;margin-bottom:20px}
        .pbIcon{font-size:56px;flex-shrink:0}
        .pbT{font-family:"Unbounded",sans-serif;font-size:22px;margin-bottom:6px}
        .pbS{font-size:14px;color:rgba(0,0,0,.5);line-height:1.5}
        .typeChips{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}
        .typeChip{display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:99px;background:rgba(0,0,0,.07);font-size:12px}
        .layout{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
        .sidebar{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:24px;position:sticky;top:86px}
        .sbTitle{font-family:"Unbounded",sans-serif;font-size:14px;margin-bottom:16px}
        .sbGroup{margin-bottom:18px;border-bottom:1px solid rgba(0,0,0,.08);padding-bottom:18px}
        .sbLabel{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:10px}
        .sbLink{display:block;padding:6px 0;color:#222;text-decoration:none;font-size:14px}
        .chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
        .chip{height:30px;padding:0 12px;border-radius:99px;background:rgba(0,0,0,.07);display:inline-flex;align-items:center;font-size:12px}
        .content{min-width:0}
        .caHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .caCount{color:#666}
        .viewBtns{display:flex;gap:4px}
        .vBtn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,.1);background:#fff}
        .vBtn.on{background:#181818;color:#fff}
        .venuesGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .vCard{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .vThumb{height:180px;position:relative}
        .vBadge{position:absolute;bottom:10px;left:10px;background:#D2F882;border-radius:99px;padding:5px 10px;font-size:11px;font-weight:700}
        .vBody{padding:16px}
        .vTags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
        .vtag{font-size:10px;background:rgba(0,0,0,.06);padding:3px 8px;border-radius:6px;color:#666}
        .vTitle{font-family:"Unbounded",sans-serif;font-size:13px;line-height:1.3}
        .vLoc{color:#666;font-size:12px;margin-top:6px}
        .vFoot{display:flex;justify-content:space-between;margin-top:10px;font-size:12px}
        .venuesList{display:flex;flex-direction:column;gap:14px}
        .vlCard{display:grid;grid-template-columns:240px 1fr;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .vlThumb{height:180px;position:relative}
        .vlBody{padding:18px}
        .vlTitle{font-family:"Unbounded",sans-serif;font-size:14px}
        .vlLoc{margin-top:6px;color:#666;font-size:13px}
        .vlMeta{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#555}
        @media (max-width:1024px){.layout{grid-template-columns:1fr}.sidebar{position:static}.venuesGrid{grid-template-columns:repeat(2,1fr)}.pageBanner{padding:24px}}
        @media (max-width:767px){.venuesGrid,.vlCard{grid-template-columns:1fr}.vlThumb{height:200px}}
      `}</style>

      <Header />
      <Container>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Главная</Link> <span>›</span> <strong>Площадки</strong>
          </div>

          <div className="pageBanner">
            <div className="pbIcon">🏡</div>
            <div>
              <div className="pbT">Каталог площадок Беларуси</div>
              <div className="pbS">Рестораны, лофты, банкетные залы, загородные площадки и отели для мероприятий.</div>
            </div>
          </div>

          <div className="typeChips">
            <span className="typeChip" style={{ background: "#181818", color: "#fff" }}>🏡 Все</span>
            <span className="typeChip">🍽️ Рестораны</span>
            <span className="typeChip">🏛️ Банкетные залы</span>
            <span className="typeChip">🖼️ Лофты</span>
            <span className="typeChip">🏨 Отели</span>
            <span className="typeChip">🌲 На природе</span>
          </div>

          <div className="layout">
            <aside className="sidebar">
              <div className="sbTitle">Фильтры</div>
              <div className="sbGroup">
                <div className="sbLabel">Тип</div>
                <Link className="sbLink" href="/venues?type=restaurant">Рестораны</Link>
                <Link className="sbLink" href="/venues?type=banquet">Банкетные залы</Link>
                <Link className="sbLink" href="/venues?type=loft">Лофты</Link>
                <Link className="sbLink" href="/venues?type=outdoor">На природе</Link>
                <Link className="sbLink" href="/venues?type=hotel">Отели</Link>
              </div>
              <div className="sbGroup">
                <div className="sbLabel">Гости</div>
                <Link className="sbLink" href="/venues?minGuests=20">до 20</Link>
                <Link className="sbLink" href="/venues?minGuests=50">50+</Link>
                <Link className="sbLink" href="/venues?minGuests=100">100+</Link>
              </div>
              <div className="sbGroup">
                <div className="sbLabel">Бюджет</div>
                <Link className="sbLink" href="/venues?maxPrice=500">до 500 BYN</Link>
                <Link className="sbLink" href="/venues?maxPrice=1000">до 1000 BYN</Link>
                <Link className="sbLink" href="/venues?maxPrice=2500">до 2500 BYN</Link>
              </div>
              <div className="sbGroup" style={{ marginBottom: 0 }}>
                <div className="sbLabel">Удобства</div>
                <Link className="sbLink" href="/venues?amenities=parking">Парковка</Link>
                <Link className="sbLink" href="/venues?amenities=accommodation">Ночёвка</Link>
                <Link className="sbLink" href="/venues?amenities=outdoor">Территория</Link>
              </div>
            </aside>
            <main className="content">
              <div className="chips">
                {chips.length === 0 ? <span className="chip">Все площадки</span> : chips.map((chip) => <span key={chip} className="chip">{chip}</span>)}
              </div>
              <VenuesResults venues={venues} />
            </main>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}
