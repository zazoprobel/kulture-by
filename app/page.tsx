import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { VenuesSlider } from "@/components/home/VenuesSlider";

type Place = { id: string; slug: string; name: string; city: string; category: string; rating: number | null };
type Venue = {
  id: string;
  slug: string;
  name: string;
  city: string;
  type: string;
  rating: number | null;
  capacity_banquet: number | null;
  price_from: number | null;
};

const cities = ["Минск", "Гродно", "Брест", "Витебск", "Гомель", "Могилёв"] as const;

export default async function HomePage() {
  let places: Place[] = [];
  let venues: Venue[] = [];
  let placesCount = 0;
  let venuesCount = 0;
  let cityRows: Array<{ city: string | null }> = [];

  try {
    const supabase = await createClient();
    const [placesQuery, venuesQuery, placesCountQuery, venuesCountQuery, citiesQuery] = await Promise.all([
      supabase.from("places").select("id,slug,name,city,category,rating").order("rating", { ascending: false }).limit(4),
      supabase
        .from("venues")
        .select("id,slug,name,city,type,rating,capacity_banquet,price_from")
        .order("rating", { ascending: false })
        .limit(8),
      supabase.from("places").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("places").select("city"),
    ]);

    places = (placesQuery.data ?? []) as Place[];
    venues = (venuesQuery.data ?? []) as Venue[];
    placesCount = placesCountQuery.count ?? 0;
    venuesCount = venuesCountQuery.count ?? 0;
    cityRows = citiesQuery.data ?? [];
  } catch (error) {
    console.error("Home data error", error);
  }

  const cityCounts = cities.map((city) => ({ city, count: cityRows.filter((row) => row.city === city).length }));
  const categoryCards = [
    ["nature", "🌿", "Природа"],
    ["history", "🏛️", "История"],
    ["castles", "🏰", "Замки"],
    ["museums", "🖼️", "Музеи"],
    ["gastro", "🍽️", "Гастро"],
    ["activity", "🚴", "Активный отдых"],
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
        :root{--lime:#D2F882;--yellow:#FFF57D;--lavender:#E7D4FF;--peach:#FFBD7B;--mint:#E2F8D0;--sky:#D1E4F8;--bg:#F7F6F2;--dark:#181818;--gray:#888;--border:rgba(0,0,0,.08)}
        .hero{margin-top:24px;display:grid;grid-template-columns:1.1fr 1fr;gap:16px}
        .heroMain{background:var(--lime);border-radius:20px;padding:42px}
        .heroH{font-family:var(--font-h,'Unbounded',sans-serif);font-size:42px;line-height:1.06}
        .heroP{margin-top:14px;color:rgba(0,0,0,.6)}
        .heroCta{margin-top:20px;display:inline-flex;background:#181818;color:#fff;border-radius:99px;padding:12px 24px;text-decoration:none}
        .heroStats{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .stat{background:#fff;border-radius:20px;padding:24px}
        .statN{font-family:var(--font-h,'Unbounded',sans-serif);font-size:30px}
        .sec{margin-top:52px}
        .secH{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
        .secT{font-family:var(--font-h,'Unbounded',sans-serif);font-size:26px}
        .cats{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
        .cat{background:#fff;border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;text-decoration:none;color:inherit;transition:transform .2s ease}
        .cat:hover{transform:translateY(-3px)}
        .catIco{font-size:30px}
        .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:16px}
        .title{font-family:var(--font-h,'Unbounded',sans-serif);font-size:14px;line-height:1.3}
        .meta{margin-top:6px;color:#666;font-size:13px}
        .regions{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
        .region{border-radius:16px;padding:18px 10px;text-align:center;background:#fff;border:1px solid var(--border)}
        .how{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .howCard{background:#FFF5E4;border-radius:20px;padding:24px}
        .reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .rev{background:#181818;color:#fff;border-radius:20px;padding:22px}
        .newsletter{background:var(--mint);border-radius:20px;padding:36px;display:flex;justify-content:space-between;gap:20px;align-items:center}
        .newsletter input{height:48px;border-radius:12px;border:1px solid rgba(0,0,0,.15);padding:0 14px}
        .newsletter button{height:48px;border:none;border-radius:12px;background:#181818;color:#fff;padding:0 18px}
        @media (max-width:1024px){.hero,.cards,.how,.reviews{grid-template-columns:1fr 1fr}.cats{grid-template-columns:repeat(3,1fr)}.regions{grid-template-columns:repeat(3,1fr)}}
        @media (max-width:767px){.hero,.cards,.how,.reviews{grid-template-columns:1fr}.newsletter{flex-direction:column;align-items:stretch}.cats{grid-template-columns:repeat(2,1fr)}.regions{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <Header />

      <Container>
        <section className="hero">
          <div className="heroMain">
            <h1 className="heroH">Беларусь — это культура, маршруты и открытия</h1>
            <p className="heroP">Места, площадки и путеводитель по городам Беларуси.</p>
            <Link href="/places" className="heroCta">Открыть места →</Link>
          </div>
          <div className="heroStats">
            <div className="stat"><div className="statN">{placesCount}+</div><div>мест в каталоге</div></div>
            <div className="stat"><div className="statN">{venuesCount}+</div><div>площадок</div></div>
            <div className="stat"><div className="statN">6</div><div>городов в путеводителе</div></div>
            <div className="stat"><div className="statN">24</div><div>маршрута и истории</div></div>
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Популярные места</h2><Link href="/places">Все места →</Link></div>
          <div className="cards">
            {places.map((place) => (
              <Link key={place.id} href={`/places/${place.slug}`} className="card">
                <div className="title">{place.name}</div>
                <div className="meta">{place.city} · {place.category} · ⭐ {place.rating ?? 0}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Категории мест</h2></div>
          <div className="cats">
            {categoryCards.map(([key, icon, label]) => (
              <Link key={key} href={`/places?category=${key}`} className="cat">
                <div className="catIco">{icon}</div>
                <div>{label}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Популярные площадки</h2><Link href="/venues">Все площадки →</Link></div>
          <VenuesSlider venues={venues} />
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">По регионам</h2></div>
          <div className="regions">
            {cityCounts.map((item) => (
              <div key={item.city} className="region">
                <div>{item.city}</div>
                <div className="meta">{item.count} мест</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Как это работает</h2></div>
          <div className="how">
            <div className="howCard"><strong>01</strong><p>Выберите город и формат отдыха.</p></div>
            <div className="howCard" style={{ background: "var(--lavender)" }}><strong>02</strong><p>Изучите места и площадки.</p></div>
            <div className="howCard" style={{ background: "var(--lime)" }}><strong>03</strong><p>Соберите маршрут или отправьте заявку.</p></div>
            <div className="howCard" style={{ background: "var(--yellow)" }}><strong>04</strong><p>Поделитесь историей и отзывом.</p></div>
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Отзывы</h2></div>
          <div className="reviews">
            <div className="rev">Отличный каталог мест по Беларуси, удобно планировать поездку.</div>
            <div className="rev" style={{ background: "var(--lavender)", color: "#181818" }}>Нашли площадку быстро, фильтры действительно помогают.</div>
            <div className="rev">Добавили свой маршрут и получили обратную связь от пользователей.</div>
          </div>
        </section>

        <section className="sec">
          <div className="newsletter">
            <div>
              <h3 className="secT">Подписка на новые места</h3>
              <p className="meta">Получайте подборки и новые маршруты каждую неделю.</p>
            </div>
            <form style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input type="email" placeholder="Ваш email" />
              <button type="button">Подписаться →</button>
            </form>
          </div>
        </section>
      </Container>

      <Footer />
    </>
  );
}
