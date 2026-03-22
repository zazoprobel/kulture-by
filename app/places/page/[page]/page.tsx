import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import {
  getPlacesCityDbFromUrlSegment,
  placesCanonicalPath,
  placesListingDescription,
  placesListingTitle,
} from "@/lib/seo/places";
import { getSiteUrl } from "@/lib/seo/siteUrl";
import { fetchPlacesListing, fetchPlacesListingCount, type PlacesListingItem } from "@/lib/seo/placesData";
import { PlacesCatalogClient } from "@/components/places/PlacesCatalogClient";

type PageProps = {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ city?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const citySlug = typeof sp.city === "string" ? sp.city : undefined;
  const cityDb = citySlug ? getPlacesCityDbFromUrlSegment(citySlug) : null;

  const totalCount = await fetchPlacesListingCount({ categoryDb: "all", cityDb });
  const canonicalPath = placesCanonicalPath({ categoryDb: "all", cityDb, page: pageNum });
  const canonical = `${await getSiteUrl()}${canonicalPath}`;

  return {
    title: placesListingTitle("all", cityDb),
    description: placesListingDescription("all", cityDb),
    robots: { index: totalCount >= 12, follow: true },
    alternates: { canonical },
  };
}

export default async function PlacesPageByNumber({ params, searchParams }: PageProps) {
  const { page } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const citySlug = typeof sp.city === "string" ? sp.city : undefined;
  const cityDb = citySlug ? getPlacesCityDbFromUrlSegment(citySlug) : null;

  const { items, totalCount } = await fetchPlacesListing({
    categoryDb: "all",
    cityDb,
    page: pageNum,
  });

  const heroTitle = cityDb ? `Интересные места: ${cityDb}` : "Интересные места Беларуси";
  const heroSubtitle = "Каталог локаций для прогулок, поездок и открытий";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
        :root { --lavender:#E7D4FF; --bg:#F7F6F2; --dark:#181818; --border:rgba(0,0,0,.08); --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
        body{font-family:var(--font-b);background:var(--bg);color:var(--dark)}
        :global(.container){max-width:1280px;margin:0 auto;padding:0 40px}
        .section{margin-top:60px}
        .hero{background:var(--lavender);border-radius:20px;padding:34px;display:flex;justify-content:space-between;gap:20px;align-items:flex-end}
        .hero h1{font-family:var(--font-h);font-size:44px;line-height:1.08}
        .heroCount{font-family:var(--font-h);font-size:44px;line-height:1;text-align:right}
        .heroCountSub{font-size:13px;color:rgba(0,0,0,.55);margin-top:6px}
        @media (max-width: 1024px){.hero h1{font-size:36px}}
        @media (max-width: 767px){
          :global(.container){padding:0 20px}
          .section{margin-top:40px}
          .hero{padding:24px;flex-direction:column;align-items:flex-start}
          .hero h1{font-size:30px}
          .heroCount{text-align:left;font-size:36px}
        }
      `}</style>
      <Header />
      <section className="section">
        <Container>
          <div className="hero">
            <div>
              <h1>{heroTitle}</h1>
              <p>{heroSubtitle}</p>
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
          <PlacesCatalogClient
            key={`catalog-all-${cityDb ?? "none"}-${pageNum}`}
            initialItems={items as PlacesListingItem[]}
            totalCount={totalCount}
            initialFilters={{
              category: "all",
              cities: cityDb ? [cityDb] : [],
              entry: "all",
              ratings: [],
            }}
            initialPage={pageNum}
          />
        </Container>
      </section>
      <Footer />
    </>
  );
}
