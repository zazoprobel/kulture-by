import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { VenuesCatalogClient, type VenueItem } from "@/components/venues/VenuesCatalogClient";

export default async function VenuesPage() {
  const PAGE_SIZE = 24;
  const supabase = await createClient();

  const [venuesResult, countResult] = await Promise.all([
    supabase
      .from("venues")
      .select("id,slug,name,city,type,rating,capacity_banquet,capacity_buffet,price_from,is_featured,is_verified")
      .order("is_featured", { ascending: false })
      .order("rating", { ascending: false })
      .limit(PAGE_SIZE),
    supabase.from("venues").select("*", { count: "exact", head: true }),
  ]);

  if (venuesResult.error) console.error("Venues init query error", venuesResult.error.message);
  if (countResult.error) console.error("Venues init count query error", countResult.error.message);

  const venues = (venuesResult.data ?? []) as VenueItem[];
  const totalCount = countResult.count ?? 0;

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
          <div className="pageBanner">
            <div className="pbIcon">🏡</div>
            <div>
              <div className="pbT">Каталог площадок Беларуси</div>
              <div className="pbS">Рестораны, лофты, банкетные залы, загородные площадки и отели для мероприятий.</div>
            </div>
          </div>
          <VenuesCatalogClient initialItems={venues} totalCount={totalCount} />
        </div>
      </Container>
      <Footer />
    </>
  );
}
