import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { PlacesCatalogClient, type PlaceItem } from "@/components/places/PlacesCatalogClient";
import { PlaceGallery } from "@/components/places/PlaceGallery";
import { fetchPlacesListing, fetchPlacesListingCount } from "@/lib/seo/placesData";
import { getSiteUrl } from "@/lib/seo/siteUrl";
import {
  getPlacesCategoryDbFromUrlSegment,
  getPlacesCityDbFromUrlSegment,
  placesCanonicalPath,
  placesListingDescription,
  placesListingTitle,
  PLACES_CATEGORY_LABEL_RU,
} from "@/lib/seo/places";

type PageProps = { params: Promise<{ slug: string }> };

type Place = {
  id: string;
  slug: string;
  name: string;
  name_ru?: string | null;
  name_be?: string | null;
  description: string;
  category: string;
  city: string;
  address: string | null;
  rating: number | null;
  entry_price: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
  website: string | null;
  working_hours: Record<string, string> | null;
};

const categoryLabel: Record<string, string> = {
  nature: "Природа",
  history: "История",
  castles: "Замки",
  museums: "Музеи",
  gastro: "Гастро",
  activity: "Активный отдых",
  kids: "С детьми",
};

const imageByCategory: Record<string, string> = {
  history: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400",
  nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400",
  castles: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1400",
  museums: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1400",
  gastro: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400",
  activity: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1400",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400",
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: placeData } = await supabase
    .from("places")
    .select("id,slug,name,name_ru,name_be,description,category,city,image_url,image_urls")
    .eq("slug", slug)
    .single();

  const place = placeData as Place | null;

  if (place) {
    const canonical = `${await getSiteUrl()}/places/${place.slug}`;
    return {
      title: `${place.name} — места Беларуси | kulture.by`,
      description: place.description?.slice(0, 160) ?? place.name,
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  const categoryDb = getPlacesCategoryDbFromUrlSegment(slug);
  if (categoryDb) {
    const totalCount = await fetchPlacesListingCount({ categoryDb, cityDb: null });
    const canonicalPath = placesCanonicalPath({ categoryDb, cityDb: null, page: 1 });
    const canonical = `${await getSiteUrl()}${canonicalPath}`;

    return {
      title: placesListingTitle(categoryDb, null),
      description: placesListingDescription(categoryDb, null),
      robots: { index: totalCount >= 12, follow: true },
      alternates: { canonical },
    };
  }

  const cityDbMeta = getPlacesCityDbFromUrlSegment(slug);
  if (cityDbMeta) {
    const totalCount = await fetchPlacesListingCount({ categoryDb: "all", cityDb: cityDbMeta });
    const canonicalPath = placesCanonicalPath({ categoryDb: "all", cityDb: cityDbMeta, page: 1 });
    const canonical = `${await getSiteUrl()}${canonicalPath}`;

    return {
      title: placesListingTitle("all", cityDbMeta),
      description: placesListingDescription("all", cityDbMeta),
      robots: { index: totalCount >= 12, follow: true },
      alternates: { canonical },
    };
  }

  return {};
}

export default async function PlacePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: placeData } = await supabase
    .from("places")
    .select("id,slug,name,name_ru,name_be,description,category,city,address,rating,entry_price,image_url,image_urls,website,working_hours")
    .eq("slug", slug)
    .single();

  const place = placeData as Place | null;
  if (!place) {
    const categoryDb = getPlacesCategoryDbFromUrlSegment(slug);
    if (categoryDb) {
      const { items, totalCount } = await fetchPlacesListing({
        categoryDb,
        cityDb: null,
        page: 1,
      });

      const heroTitle = PLACES_CATEGORY_LABEL_RU[categoryDb] ?? categoryDb;
      const heroSubtitle = "Каталог локаций для прогулок, поездок и открытий";

      return (
        <>
          <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
          :root { --lavender:#E7D4FF; --bg:#F7F6F2; --dark:#181818; --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
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
                  <h1>{heroTitle} Беларуси</h1>
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
                key={`catalog-cat-${categoryDb}-1`}
                initialItems={items as PlaceItem[]}
                totalCount={totalCount}
                initialFilters={{ category: categoryDb, cities: [], entry: "all", ratings: [] }}
                initialPage={1}
              />
            </Container>
          </section>
          <Footer />
        </>
      );
    }

    const cityDb = getPlacesCityDbFromUrlSegment(slug);
    if (!cityDb) notFound();

    const { items, totalCount } = await fetchPlacesListing({
      categoryDb: "all",
      cityDb,
      page: 1,
    });

    const heroTitle = `Интересные места: ${cityDb}`;
    const heroSubtitle = "Каталог локаций для прогулок, поездок и открытий";

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
          :root { --lavender:#E7D4FF; --bg:#F7F6F2; --dark:#181818; --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
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
              key={`catalog-city-${slug}-1`}
              initialItems={items as PlaceItem[]}
              totalCount={totalCount}
              initialFilters={{
                category: "all",
                cities: [cityDb],
                entry: "all",
                ratings: [],
              }}
              initialPage={1}
            />
          </Container>
        </section>
        <Footer />
      </>
    );
  }

  const { data: similarData } = await supabase
    .from("places")
    .select("id,slug,name,city,category,rating,entry_price")
    .neq("id", place.id)
    .or(`city.eq.${place.city},category.eq.${place.category}`)
    .limit(3);

  const similar = (similarData ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
    city: string;
    category: string;
    rating: number | null;
    entry_price: number | null;
  }>;

  const gallery = place.image_urls && place.image_urls.length > 0
    ? place.image_urls
    : place.image_url
      ? [place.image_url]
      : [];
  const primaryImage = gallery[0] || imageByCategory[place.category] || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400";
  const secondImage = gallery[1] || "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=700";
  const thirdImage = gallery[2] || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700";
  const galleryImages = [primaryImage, secondImage, thirdImage, ...gallery.slice(3)];
  const shortMeta = `${categoryLabel[place.category] ?? place.category} · ${place.city}`;
  const entryPriceText = place.entry_price && place.entry_price > 0 ? `от ${Math.round(place.entry_price)} BYN` : "Бесплатно";
  const workingHoursText = place.working_hours && Object.keys(place.working_hours).length > 0 ? "По расписанию" : "Круглосуточно";
  const placeNameRu = place.name_ru || place.name;
  const placeNameBe = place.name_be || "";

  return (
    <>
      <style>{`
        .wrap{margin-top:22px}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:13px;color:#888;padding:0 0 14px;flex-wrap:wrap}
        .breadcrumb a{color:#888;text-decoration:none}
        .gallery{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:300px 150px;gap:10px;border-radius:20px;overflow:hidden}
        .gMain,.gSm{position:relative}
        .gMain{grid-row:span 2}
        .layout{display:grid;grid-template-columns:1fr 340px;gap:30px;margin-top:28px}
        .box{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:22px;margin-bottom:18px}
        .placeName{font-family:"Unbounded",sans-serif;font-size:30px;line-height:1.1}
        .placeNameBe{margin-top:8px;color:#8b8b8b;font-size:14px}
        .meta{margin-top:10px;color:#666;display:flex;gap:12px;flex-wrap:wrap;font-size:13px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .stat{background:#F7F6F2;border-radius:14px;padding:14px;text-align:center}
        .statN{font-family:"Unbounded",sans-serif;font-size:18px}
        .title{font-family:"Unbounded",sans-serif;font-size:15px;margin-bottom:12px}
        .chips{display:flex;gap:8px;flex-wrap:wrap}
        .chip{font-size:12px;background:#f1f1f1;padding:5px 10px;border-radius:999px}
        .similar{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .sCard{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:14px;text-decoration:none;color:inherit}
        .sideCard{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;padding:22px;position:sticky;top:86px}
        .price{font-family:"Unbounded",sans-serif;font-size:24px}
        .small{font-size:12px;color:#777;margin-top:4px}
        .sideList{display:flex;flex-direction:column;gap:8px;margin-top:16px}
        .sideItem{background:#F7F6F2;border-radius:10px;padding:10px 12px;font-size:13px;color:#444}
        .cta{margin-top:14px;width:100%;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;font-weight:700}
        .linkBtn{display:inline-flex;align-items:center;justify-content:center;width:100%;height:42px;border-radius:12px;border:1px solid rgba(0,0,0,.12);margin-top:10px;text-decoration:none;color:#181818}
        @media (max-width:1024px){.layout{grid-template-columns:1fr}.stats,.similar{grid-template-columns:repeat(2,1fr)}.sideCard{position:static}}
        @media (max-width:767px){.gallery,.stats,.similar{grid-template-columns:1fr}.gallery{grid-template-rows:220px 120px 120px}.gMain{grid-row:span 1}}
      `}</style>

      <Header />
      <Container>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>›</span>
            <Link href="/places">Места</Link>
            <span>›</span>
            <strong>{placeNameRu}</strong>
          </div>

          <PlaceGallery images={galleryImages} placeName={placeNameRu} />

          <div className="layout">
            <main>
              <div className="box">
                <h1 className="placeName">{placeNameRu}</h1>
                {placeNameBe ? <div className="placeNameBe">{placeNameBe}</div> : null}
                <div className="meta">
                  <span>⭐ {place.rating ?? 0}</span>
                  <span>📍 {place.city}</span>
                  <span>{categoryLabel[place.category] ?? place.category}</span>
                </div>
              </div>

              <div className="box">
                <div className="stats">
                  <div className="stat"><div className="statN">{place.rating ?? 0}</div><div>Рейтинг</div></div>
                  <div className="stat"><div className="statN">{entryPriceText === "Бесплатно" ? "0" : Math.round(place.entry_price ?? 0)}</div><div>Вход BYN</div></div>
                  <div className="stat"><div className="statN">{place.city}</div><div>Город</div></div>
                  <div className="stat"><div className="statN">{workingHoursText === "Круглосуточно" ? "24/7" : "Расписание"}</div><div>Режим</div></div>
                </div>
              </div>

              <div className="box">
                <h2 className="title">Описание</h2>
                <p style={{ color: "#555", lineHeight: 1.7 }}>{place.description}</p>
              </div>

              <div className="box">
                <h2 className="title">Теги места</h2>
                <div className="chips">
                  <span className="chip">{categoryLabel[place.category] ?? place.category}</span>
                  <span className="chip">{place.city}</span>
                  <span className="chip">{entryPriceText}</span>
                </div>
              </div>

              <div className="box">
                <h2 className="title">Похожие места</h2>
                <div className="similar">
                  {similar.map((item) => (
                    <Link key={item.id} href={`/places/${item.slug}`} className="sCard">
                      <div style={{ fontFamily: "Unbounded, sans-serif", fontSize: "12px" }}>{item.name}</div>
                      <div className="meta">{item.city} · {categoryLabel[item.category] ?? item.category}</div>
                      <div className="meta">⭐ {item.rating ?? 0} · {item.entry_price && item.entry_price > 0 ? `от ${Math.round(item.entry_price)} BYN` : "Бесплатно"}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </main>

            <aside>
              <div className="sideCard">
                <div className="price">{entryPriceText}</div>
                <div className="small">Стоимость посещения</div>
                <div className="sideList">
                  <div className="sideItem">📍 {place.address ?? place.city}</div>
                  <div className="sideItem">🕒 {workingHoursText}</div>
                  <div className="sideItem">⭐ Рейтинг: {place.rating ?? 0}</div>
                </div>
                <button type="button" className="cta">Добавить в маршрут</button>
                {place.website ? (
                  <a href={place.website} target="_blank" rel="noreferrer" className="linkBtn">
                    Открыть сайт
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}
