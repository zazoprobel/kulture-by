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
        :root{--lime:#D2F882;--yellow:#FFF57D;--lavender:#E7D4FF;--peach:#FFBD7B;--mint:#E2F8D0;--sky:#D1E4F8;--cream:#FFF5E4;--bg:#F7F6F2;--dark:#181818;--gray:#888;--border:rgba(0,0,0,.08)}
        .hero{margin-top:24px;display:grid;grid-template-columns:1.1fr 1fr;gap:16px}
        .heroMain{background:var(--lime);border-radius:20px;padding:44px 44px 0;overflow:hidden;min-height:400px;display:flex;flex-direction:column}
        .heroLabel{display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,.08);border-radius:99px;padding:5px 14px 5px 5px;font-size:12px;font-weight:600;margin-bottom:18px;width:fit-content}
        .heroLabelDot{width:22px;height:22px;background:#181818;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px}
        .heroH{font-family:"Unbounded",sans-serif;font-size:34px;font-weight:900;line-height:1.08;margin-bottom:16px}
        .heroP{font-size:15px;color:rgba(0,0,0,.58);line-height:1.55;margin-bottom:28px;max-width:420px}
        .heroCta{display:inline-flex;align-items:center;gap:10px;background:#181818;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:99px;text-decoration:none;width:fit-content}
        .heroImgRow{margin-top:auto;display:flex;gap:12px}
        .heroPhoto{flex:1;height:160px;border-radius:14px 14px 0 0;display:flex;align-items:center;justify-content:center;font-size:48px}
        .heroRight{display:flex;flex-direction:column;gap:16px}
        .heroStatRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .stat{border-radius:20px;padding:28px 24px}
        .statN{font-family:"Unbounded",sans-serif;font-size:30px;font-weight:900}
        .statL{font-size:12px;color:rgba(0,0,0,.5)}
        .heroBanner{border-radius:20px;padding:24px 28px;display:flex;align-items:center;gap:14px;text-decoration:none;color:inherit;transition:opacity .2s}
        .heroBanner:hover{opacity:.88}
        .bannerIcon{font-size:32px}
        .bannerT{font-family:"Unbounded",sans-serif;font-size:14px;font-weight:700;margin-bottom:3px}
        .bannerS{font-size:12px;opacity:.55}
        .bannerArr{margin-left:auto;font-size:18px;opacity:.4}
        .sec{margin-top:52px}
        .secH{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}
        .secT{font-family:"Unbounded",sans-serif;font-size:21px}
        .chips{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
        .chip{height:32px;padding:0 13px;border-radius:99px;border:1.5px solid var(--border);background:transparent;color:#666;font-size:12px}
        .chip.on{background:#181818;color:#fff;border-color:#181818}
        .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .card{background:#fff;border-radius:20px;border:1.5px solid var(--border);overflow:hidden;transition:transform .2s,box-shadow .2s;text-decoration:none;color:inherit}
        .card:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(0,0,0,.11)}
        .thumb{height:170px;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;justify-content:center;font-size:44px}
        .cardB{padding:14px}
        .cat{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
        .title{font-family:"Unbounded",sans-serif;font-size:13px;line-height:1.3;margin-bottom:5px}
        .meta{font-size:12px;color:#666}
        .occGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .occ{border-radius:20px;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}
        .occ:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,0,0,.09)}
        .occIco{font-size:34px}
        .occT{font-family:"Unbounded",sans-serif;font-size:12px}
        .occN{font-size:11px;color:rgba(0,0,0,.42)}
        .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .bentoW{grid-column:span 2}
        .bentoT{grid-row:span 2}
        .bentoC{border-radius:20px;padding:26px;min-height:190px;display:flex;flex-direction:column;text-decoration:none;color:inherit}
        .bentoEm{font-size:36px;margin-bottom:10px}
        .bentoT2{font-family:"Unbounded",sans-serif;font-size:16px;margin-bottom:6px}
        .bentoS{font-size:12px;opacity:.55;line-height:1.4;flex:1}
        .bentoA{margin-top:16px;font-size:12px;font-weight:600;opacity:.7}
        .mapPromo{background:var(--lavender);border-radius:20px;padding:40px 48px;display:flex;align-items:center;gap:48px}
        .mapT{font-family:"Unbounded",sans-serif;font-size:24px;margin-bottom:10px}
        .mapS{font-size:14px;color:rgba(0,0,0,.5);line-height:1.55;max-width:420px}
        .mapVis{width:340px;height:190px;border-radius:16px;background:rgba(255,255,255,.45);position:relative;display:flex;align-items:center;justify-content:center;font-size:72px}
        .mpin{position:absolute;font-size:24px;animation:bounce 2s ease-in-out infinite}
        .mpin:nth-child(1){top:28%;left:38%}.mpin:nth-child(2){top:52%;left:60%;animation-delay:.5s}.mpin:nth-child(3){top:18%;left:68%;animation-delay:1s}.mpin:nth-child(4){top:68%;left:22%;animation-delay:1.5s}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .regions{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
        .region{border-radius:16px;padding:18px 10px;text-align:center;transition:transform .2s}
        .region:hover{transform:translateY(-3px)}
        .how{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .howCard{background:var(--cream);border-radius:20px;padding:28px 24px}
        .howNum{font-family:"Unbounded",sans-serif;font-size:44px;color:rgba(0,0,0,.06);line-height:1;margin-bottom:12px}
        .howIco{font-size:28px;margin-bottom:10px}
        .howT{font-family:"Unbounded",sans-serif;font-size:13px;margin-bottom:7px}
        .howD{font-size:12px;color:rgba(0,0,0,.48);line-height:1.5}
        .reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .rev{background:#181818;border-radius:20px;padding:24px;color:#fff}
        .revStars{color:var(--yellow);font-size:12px;margin-bottom:9px}
        .revTxt{font-size:13px;color:rgba(255,255,255,.72);line-height:1.6}
        .newsletter{background:var(--mint);border-radius:20px;padding:40px 48px;display:flex;align-items:center;gap:40px}
        .nlT{font-family:"Unbounded",sans-serif;font-size:22px;margin-bottom:6px}
        .nlS{font-size:14px;color:rgba(0,0,0,.48)}
        .nlForm{display:flex;gap:10px}
        .nlForm input{height:48px;width:260px;border-radius:12px;border:1.5px solid rgba(0,0,0,.1);background:rgba(255,255,255,.6);padding:0 16px}
        .nlForm button{height:48px;padding:0 22px;border-radius:12px;border:none;background:#181818;color:#fff;font-weight:700}
        @media (max-width:1024px){.hero,.cards,.reviews,.how{grid-template-columns:1fr 1fr}.occGrid{grid-template-columns:repeat(3,1fr)}.regions{grid-template-columns:repeat(3,1fr)}.bento{grid-template-columns:1fr 1fr}.bentoT{grid-row:span 1}.mapPromo{flex-direction:column;align-items:flex-start}}
        @media (max-width:767px){.hero,.cards,.reviews,.how,.bento,.occGrid{grid-template-columns:1fr}.heroMain{padding:26px 26px 0}.heroH{font-size:28px}.regions{grid-template-columns:repeat(2,1fr)}.newsletter{flex-direction:column;align-items:stretch;padding:28px}.nlForm{flex-direction:column}.nlForm input{width:100%}}
      `}</style>

      <Header />

      <Container>
        <section className="hero">
          <div className="heroMain">
            <div className="heroLabel"><span className="heroLabelDot">✨</span>Главный гид по местам Беларуси</div>
            <h1 className="heroH">Беларусь — это культура и открытия каждый день</h1>
            <p className="heroP">Интересные места, маршруты и площадки. Планируй поездки, сохраняй любимые точки и открывай страну по-новому.</p>
            <Link href="/places" className="heroCta">Открыть места →</Link>
            <div className="heroImgRow">
              <div className="heroPhoto" style={{ background: "linear-gradient(135deg,rgba(0,0,0,.15),rgba(0,0,0,.08))", flex: 1.4 }}>🏰</div>
              <div className="heroPhoto" style={{ background: "linear-gradient(135deg,rgba(0,0,0,.12),rgba(0,0,0,.06))", flex: 1 }}>🗺️</div>
            </div>
          </div>
          <div className="heroRight">
            <div className="heroStatRow">
              <div className="stat" style={{ background: "var(--yellow)" }}><div className="statN">{placesCount}+</div><div className="statL">Мест в каталоге</div></div>
              <div className="stat" style={{ background: "var(--lavender)" }}><div className="statN">{venuesCount}+</div><div className="statL">Площадок по Беларуси</div></div>
            </div>
            <Link href="/guide" className="heroBanner" style={{ background: "var(--peach)" }}>
              <div className="bannerIcon">🧭</div>
              <div><div className="bannerT">Путеводитель по городам</div><div className="bannerS">Маршруты и советы по регионам</div></div>
              <div className="bannerArr">→</div>
            </Link>
            <Link href="/places" className="heroBanner" style={{ background: "var(--mint)" }}>
              <div className="bannerIcon">📍</div>
              <div><div className="bannerT">Интересные места</div><div className="bannerS">Природа, история, музеи и гастро</div></div>
              <div className="bannerArr">→</div>
            </Link>
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Популярные места</h2><Link href="/places">Все места →</Link></div>
          <div className="chips">
            <button className="chip on" type="button">Сегодня</button>
            <button className="chip" type="button">Выходные</button>
            <button className="chip" type="button">Эта неделя</button>
            <button className="chip" type="button">С детьми</button>
          </div>
          <div className="cards">
            {places.map((place) => (
              <Link key={place.id} href={`/places/${place.slug}`} className="card">
                <div className="thumb">📍</div>
                <div className="cardB">
                  <div className="cat">{place.category} · {place.city}</div>
                  <div className="title">{place.name}</div>
                  <div className="meta">⭐ {place.rating ?? 0}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Категории мест</h2></div>
          <div className="occGrid">
            {categoryCards.map(([key, icon, label]) => (
              <Link key={key} href={`/places?category=${key}`} className="occ" style={{ background: key === "nature" ? "var(--lavender)" : key === "history" ? "var(--lime)" : key === "castles" ? "var(--yellow)" : key === "museums" ? "var(--peach)" : key === "gastro" ? "var(--mint)" : "var(--sky)" }}>
                <div className="occIco">{icon}</div>
                <div className="occT">{label}</div>
                <div className="occN">Смотреть подборку</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Популярные площадки</h2><Link href="/venues">Все площадки →</Link></div>
          <VenuesSlider venues={venues} />
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Подборки</h2><Link href="/places">Все подборки →</Link></div>
          <div className="bento">
            <Link href="/places?category=nature" className="bentoC bentoW" style={{ background: "var(--lime)" }}>
              <div className="bentoEm">🌿</div><div className="bentoT2">Природные места Беларуси</div><div className="bentoS">Озёра, леса, парки и смотровые точки.</div><div className="bentoA">Смотреть подборку →</div>
            </Link>
            <Link href="/guide" className="bentoC bentoT" style={{ background: "var(--dark)", color: "#fff" }}>
              <div className="bentoEm">🌙</div><div className="bentoT2">Маршруты выходного дня</div><div className="bentoS" style={{ color: "rgba(255,255,255,.5)" }}>Готовые идеи коротких поездок.</div><div className="bentoA">Найти →</div>
            </Link>
            <Link href="/places?category=history" className="bentoC" style={{ background: "var(--yellow)" }}>
              <div className="bentoEm">🏛️</div><div className="bentoT2">Исторические места</div><div className="bentoS">Замки, усадьбы и памятники.</div><div className="bentoA">Смотреть →</div>
            </Link>
            <Link href="/places?category=kids" className="bentoC" style={{ background: "var(--lavender)" }}>
              <div className="bentoEm">👶</div><div className="bentoT2">С детьми</div><div className="bentoS">Локации для семейных поездок.</div><div className="bentoA">Смотреть →</div>
            </Link>
            <Link href="/places?category=gastro" className="bentoC" style={{ background: "var(--peach)" }}>
              <div className="bentoEm">🍷</div><div className="bentoT2">Гастрономические точки</div><div className="bentoS">Рестораны, фермы и локальная кухня.</div><div className="bentoA">Смотреть →</div>
            </Link>
          </div>
        </section>

        <section className="sec">
          <div className="mapPromo">
            <div style={{ flex: 1 }}>
              <h2 className="mapT">Все места на карте</h2>
              <p className="mapS">Смотри расположение точек, оценивай расстояния и строй маршрут.</p>
              <Link href="/maps" className="heroCta">Открыть карту →</Link>
            </div>
            <div className="mapVis">
              <div className="mpin">📍</div><div className="mpin">🏛️</div><div className="mpin">🍽️</div><div className="mpin">🏡</div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">По регионам</h2></div>
          <div className="regions">
            {cityCounts.map((item) => (
              <div key={item.city} className="region" style={{ background: item.city === "Минск" ? "var(--lime)" : item.city === "Гродно" ? "var(--yellow)" : item.city === "Брест" ? "var(--peach)" : item.city === "Витебск" ? "var(--mint)" : item.city === "Гомель" ? "var(--sky)" : "var(--lavender)" }}>
                <div>{item.city}</div>
                <div className="meta">{item.count} мест</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Как это работает</h2></div>
          <div className="how">
            <div className="howCard"><div className="howNum">01</div><div className="howIco">🔍</div><div className="howT">Выберите город и категорию</div><div className="howD">Настройте фильтры по формату поездки.</div></div>
            <div className="howCard" style={{ background: "var(--lavender)" }}><div className="howNum">02</div><div className="howIco">👀</div><div className="howT">Изучите карточки</div><div className="howD">Фото, описания, рейтинг и советы.</div></div>
            <div className="howCard" style={{ background: "var(--lime)" }}><div className="howNum">03</div><div className="howIco">🗺️</div><div className="howT">Соберите маршрут</div><div className="howD">Сохраните точки и план поездки.</div></div>
            <div className="howCard" style={{ background: "var(--yellow)" }}><div className="howNum">04</div><div className="howIco">🎉</div><div className="howT">Поделитесь впечатлениями</div><div className="howD">Опубликуйте историю после поездки.</div></div>
          </div>
        </section>

        <section className="sec">
          <div className="secH"><h2 className="secT">Отзывы</h2></div>
          <div className="reviews">
            <div className="rev"><div className="revStars">★★★★★</div><div className="revTxt">Отличный каталог мест по Беларуси, удобно планировать поездку.</div></div>
            <div className="rev" style={{ background: "var(--lavender)", color: "#181818" }}><div className="revStars" style={{ color: "#7c3aed" }}>★★★★★</div><div className="revTxt" style={{ color: "rgba(0,0,0,.72)" }}>Фильтры и подборки реально ускоряют поиск.</div></div>
            <div className="rev"><div className="revStars">★★★★★</div><div className="revTxt">Добавили свой маршрут и получили фидбек от других пользователей.</div></div>
          </div>
        </section>

        <section className="sec">
          <div className="newsletter">
            <div>
              <div className="nlT">Узнавайте первыми о новых местах</div>
              <div className="nlS">Подписка на лучшие точки, маршруты и подборки.</div>
            </div>
            <form className="nlForm">
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
