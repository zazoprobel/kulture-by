import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { PlacesCatalogClient, type PlaceItem } from "@/components/places/PlacesCatalogClient";
import { getSiteUrl } from "@/lib/seo/siteUrl";
import { placesCanonicalPath, placesListingDescription, placesListingTitle, PLACES_PAGE_SIZE } from "@/lib/seo/places";

export async function generateMetadata() {
  const supabase = await createClient();
  const { count } = await supabase.from("places").select("*", { count: "exact", head: true });

  const totalCount = count ?? 0;
  const canonicalPath = placesCanonicalPath({ categoryDb: "all", cityDb: null, page: 1 });
  const canonical = `${await getSiteUrl()}${canonicalPath}`;

  return {
    title: placesListingTitle("all", null),
    description: placesListingDescription("all", null),
    robots: { index: totalCount >= 12, follow: true },
    alternates: { canonical },
  };
}

export default async function PlacesPage() {
  const isDev = process.env.NODE_ENV === "development";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const PAGE_SIZE = PLACES_PAGE_SIZE;

  let places: PlaceItem[] = [];
  let totalCount = 0;
  let debugError: string | null = null;

  try {
    if (isDev) {
      console.log("[places] Supabase URL:", supabaseUrl ?? "<empty>");
    }

    const supabase = await createClient();

    const [placesResult, countResult] = await Promise.all([
      supabase
        .from("places")
        .select("id,name,slug,category,city,address,rating,entry_price")
        .order("rating", { ascending: false })
        .limit(PAGE_SIZE),
      supabase.from("places").select("*", { count: "exact", head: true }),
    ]);

    if (placesResult.error || countResult.error) {
      console.error("Places page supabase query error", {
        places: placesResult.error?.message ?? null,
        count: countResult.error?.message ?? null,
      });
      debugError = placesResult.error?.message ?? countResult.error?.message ?? null;
    }

    places = (placesResult.data ?? []) as PlaceItem[];
    totalCount = countResult.count ?? 0;

    if (isDev) {
      console.log("[places] Query result:", {
        placesCount: places.length,
        totalCount,
        sample: places.slice(0, 2),
      });
    }
  } catch (error) {
    console.error("Places page initialization error", error);
    debugError = error instanceof Error ? error.message : "Unknown Supabase error";
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
        :root { --lime:#D2F882; --yellow:#FFF57D; --lavender:#E7D4FF; --peach:#FFBD7B; --mint:#E2F8D0; --bg:#F7F6F2; --white:#FFFFFF; --dark:#181818; --gray:#888; --border:rgba(0,0,0,.08); --r:20px; --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
        *,*::before,*::after{box-sizing:border-box}
        body{font-family:var(--font-b);background:var(--bg);color:var(--dark)}
        :global(.container){max-width:1280px;margin:0 auto;padding:0 40px}
        .section{margin-top:60px}
        .hero{background:var(--lavender);border-radius:20px;padding:34px;display:flex;justify-content:space-between;gap:20px;align-items:flex-end}
        .hero h1{font-family:var(--font-h);font-size:44px;line-height:1.08}
        .hero p{margin-top:8px;color:rgba(0,0,0,.62)}
        .heroCount{font-family:var(--font-h);font-size:44px;line-height:1;text-align:right}
        .heroCountSub{font-size:13px;color:rgba(0,0,0,.55);margin-top:6px}
        .tabs{display:flex;gap:8px;overflow:auto;padding-bottom:6px}
        .tab{height:40px;padding:0 14px;border-radius:99px;border:1px solid var(--border);background:#fff;color:#333;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;white-space:nowrap}
        .tab.active{background:#181818;color:#fff;border-color:#181818}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .card{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;display:flex;flex-direction:column}
        .thumb{height:190px;position:relative;overflow:hidden;background:#ececec}
        .body{padding:16px}
        .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .category{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--gray)}
        .favBtn{width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer}
        .title{font-family:var(--font-h);font-size:16px;line-height:1.25;margin-top:8px}
        .meta{margin-top:8px;color:#555;font-size:14px;line-height:1.4}
        .rating{margin-top:8px;font-size:14px;font-weight:600}
        .empty{padding:26px;border:1px dashed var(--border);border-radius:20px;background:#fff;color:#666}
        @media (max-width: 1024px){
          .grid{grid-template-columns:repeat(2,1fr)}
          .hero h1{font-size:36px}
        }
        @media (max-width: 767px){
          :global(.container){padding:0 20px}
          .section{margin-top:40px}
          .hero{padding:24px;flex-direction:column;align-items:flex-start}
          .hero h1{font-size:30px}
          .heroCount{text-align:left;font-size:36px}
          .grid{grid-template-columns:1fr}
        }
      `}</style>

      <Header />

      <section className="section">
        <Container>
          <div className="hero">
            <div>
              <h1>Интересные места Беларуси</h1>
              <p>Каталог локаций для прогулок, поездок и открытий</p>
            </div>
            <div>
              <div className="heroCount">{totalCount}</div>
              <div className="heroCountSub">мест в каталоге</div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          {isDev && debugError ? (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #f19999",
                background: "#fff1f1",
                color: "#7d1f1f",
                fontSize: "14px",
              }}
            >
              Supabase error: {debugError}
            </div>
          ) : null}
          <PlacesCatalogClient
            initialItems={places}
            totalCount={totalCount}
            initialFilters={{ category: "all", cities: [], entry: "all", ratings: [] }}
            initialPage={1}
          />
        </Container>
      </section>

      <Footer />
    </>
  );
}
