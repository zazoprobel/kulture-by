import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";

type Place = {
  id: string;
  name: string;
  city: string;
  category: string;
  rating: number | null;
};

type Venue = {
  id: string;
  name: string;
  city: string;
  type: string;
  rating: number | null;
};

const guideCities = ["Минск", "Гродно", "Брест", "Витебск", "Гомель", "Могилёв"] as const;

export default async function HomePage() {
  const supabase = await createClient();

  const [placesQuery, venuesQuery, placesCountQuery, venuesCountQuery, citiesQuery] =
    await Promise.all([
      supabase
        .from("places")
        .select("id,name,city,category,rating")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("venues")
        .select("id,name,city,type,rating")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("places").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("places").select("city"),
    ]);

  if (
    placesQuery.error ||
    venuesQuery.error ||
    placesCountQuery.error ||
    venuesCountQuery.error ||
    citiesQuery.error
  ) {
    console.error("Supabase home data error", {
      places: placesQuery.error?.message ?? null,
      venues: venuesQuery.error?.message ?? null,
      placesCount: placesCountQuery.error?.message ?? null,
      venuesCount: venuesCountQuery.error?.message ?? null,
      cities: citiesQuery.error?.message ?? null,
    });
  }

  const places = (placesQuery.data ?? []) as Place[];
  const venues = (venuesQuery.data ?? []) as Venue[];
  const cityRows = citiesQuery.data ?? [];

  const cityCounts = guideCities.map((city) => ({
    city,
    count: cityRows.filter((row) => row.city === city).length,
  }));

  const stats = [
    { label: "Места", value: placesCountQuery.count ?? 0, color: "var(--yellow)" },
    { label: "Площадки", value: venuesCountQuery.count ?? 0, color: "var(--lavender)" },
    { label: "Города", value: guideCities.length, color: "var(--mint)" },
    { label: "Маршруты", value: 24, color: "var(--peach)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
        :root { --lime:#D2F882; --yellow:#FFF57D; --lavender:#E7D4FF; --peach:#FFBD7B; --mint:#E2F8D0; --bg:#F7F6F2; --white:#FFFFFF; --dark:#181818; --gray:#888; --border:rgba(0,0,0,.08); --r:20px; --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:var(--font-b);background:var(--bg);color:var(--dark);font-size:16px;line-height:1.45}
        :global(.container){max-width:1280px;margin:0 auto;padding:0 40px}
        .hero{padding-top:24px;display:grid;grid-template-columns:3fr 2fr;gap:16px}
        .hero-main{background:var(--lime);border-radius:20px;padding:42px;overflow:hidden}
        .hero-h{font-family:var(--font-h);font-size:56px;line-height:1.04;margin-bottom:14px}
        .hero-p{font-size:20px;color:rgba(0,0,0,.62);margin-bottom:24px}
        .hero-cta{display:inline-flex;align-items:center;background:var(--dark);color:#fff;border-radius:99px;padding:15px 30px;font-size:18px;font-weight:700;text-decoration:none}
        .hero-right{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .stat-box{border-radius:20px;padding:24px}
        .stat-n{font-family:var(--font-h);font-size:36px;line-height:1}
        .stat-l{margin-top:6px;color:rgba(0,0,0,.58);font-size:14px}
        .guide-wide{grid-column:1 / -1;border-radius:20px;background:var(--dark);color:#fff;padding:26px;text-decoration:none}
        .guide-wide h3{font-family:var(--font-h);font-size:26px;margin-bottom:8px}
        .guide-wide p{color:rgba(255,255,255,.66)}
        .section{margin-top:60px}
        .sec-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}
        .sec-t{font-family:var(--font-h);font-size:36px;line-height:1.1}
        .place-cats{display:grid;grid-template-columns:repeat(7,1fr);gap:12px}
        .cat-item{background:#fff;border:1px solid var(--border);border-radius:16px;padding:16px;text-align:center}
        .cat-item span{font-size:30px;display:block;margin-bottom:8px}
        .cards-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .cards-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .cards-6{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
        .cities-scroll{overflow:visible}
        .card{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden}
        .thumb{height:170px;background:linear-gradient(135deg,#2c2c2c,#575757);display:flex;align-items:center;justify-content:center;font-size:44px;color:#fff}
        .card-b{padding:16px}
        .kicker{font-size:12px;color:var(--gray);text-transform:uppercase;letter-spacing:.04em}
        .title{font-family:var(--font-h);font-size:16px;margin-top:6px;line-height:1.25}
        .meta{font-size:14px;color:#555;margin-top:6px}
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .step{background:#fff;border-radius:20px;padding:24px;border:1px solid var(--border)}
        .step h3{font-family:var(--font-h);font-size:20px;margin-bottom:8px}
        .sub{background:var(--mint);border-radius:20px;padding:34px;display:flex;justify-content:space-between;gap:20px;align-items:center}
        .sub h3{font-family:var(--font-h);font-size:30px}
        .sub p{margin-top:6px}
        .sub form{display:flex;gap:10px}
        .sub input{height:50px;border-radius:12px;border:1px solid rgba(0,0,0,.15);padding:0 14px;width:280px}
        .sub button{height:50px;border-radius:12px;border:none;background:var(--dark);color:#fff;padding:0 20px;font-weight:700}
        @media (max-width: 1024px){
          .hero{grid-template-columns:1fr}
          .cards-4,.cards-3{grid-template-columns:repeat(2,1fr)}
          .cards-6{grid-template-columns:repeat(6,1fr)}
          .place-cats{grid-template-columns:repeat(4,1fr)}
          .sub{flex-direction:column;align-items:flex-start}
        }
        @media (max-width: 767px){
          :global(.container){padding:0 20px}
          .hero-h{font-size:36px}
          .hero-p{font-size:16px}
          .hero-main{padding:26px}
          .hero-right{grid-template-columns:1fr 1fr}
          .sec-t{font-size:30px}
          .cards-4,.cards-3,.steps{grid-template-columns:1fr}
          .place-cats{grid-template-columns:repeat(2,1fr)}
          .cities-scroll{overflow-x:auto;padding-bottom:6px}
          .cards-6{display:flex;gap:12px;min-width:max-content}
          .cards-6 .card{min-width:180px}
          .section{margin-top:40px}
          .sub h3{font-size:24px}
          .sub form{width:100%;flex-direction:column}
          .sub input,.sub button{width:100%}
        }
      `}</style>

      <Header />

      <Container>
        <div className="hero">
          <div className="hero-main">
            <h1 className="hero-h">
              Беларусь — это вдохновение
              <br />в каждом городе
            </h1>
            <p className="hero-p">
              Интересные места, маршруты и площадки по всей стране
            </p>
            <a href="/places" className="hero-cta">
              Смотреть места
            </a>
          </div>
          <div className="hero-right">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-box" style={{ background: stat.color }}>
                <div className="stat-n">{stat.value}</div>
                <div className="stat-l">{stat.label}</div>
              </div>
            ))}
            <a href="/guide" className="guide-wide">
              <h3>Путеводитель по городам</h3>
              <p>Лучшие идеи маршрутов для Минска, Гродно, Бреста и других городов</p>
            </a>
          </div>
        </div>
      </Container>

      <section className="section">
        <Container>
          <div className="sec-h">
            <h2 className="sec-t">Категории мест</h2>
          </div>
          <div className="place-cats">
            {[
              ["🌿", "Природа"],
              ["🏛️", "История"],
              ["🏰", "Замки"],
              ["🖼️", "Музеи"],
              ["🍽️", "Гастро"],
              ["🚴", "Активный отдых"],
              ["🧸", "С детьми"],
            ].map(([icon, label]) => (
              <div key={label} className="cat-item">
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="sec-h">
            <h2 className="sec-t">Интересные места</h2>
          </div>
          <div className="cards-4">
            {places.map((place) => (
              <article key={place.id} className="card">
                <div className="thumb">📍</div>
                <div className="card-b">
                  <div className="kicker">{place.category}</div>
                  <div className="title">{place.name}</div>
                  <div className="meta">
                    {place.city} · Рейтинг {place.rating ?? 0}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="sec-h">
            <h2 className="sec-t">Путеводитель по городам</h2>
          </div>
          <div className="cities-scroll">
            <div className="cards-6">
              {cityCounts.map((item) => (
                <article key={item.city} className="card">
                  <div className="card-b">
                    <div className="title">{item.city}</div>
                    <div className="meta">{item.count} мест</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="sec-h">
            <h2 className="sec-t">Площадки для мероприятий</h2>
          </div>
          <div className="cards-3">
            {venues.map((venue) => (
              <article key={venue.id} className="card">
                <div className="thumb">🏛️</div>
                <div className="card-b">
                  <div className="kicker">{venue.type}</div>
                  <div className="title">{venue.name}</div>
                  <div className="meta">
                    {venue.city} · Рейтинг {venue.rating ?? 0}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="sec-h">
            <h2 className="sec-t">Как это работает</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Выбери город</h3>
              <p>Открой путеводитель по региону, который хочешь исследовать.</p>
            </div>
            <div className="step">
              <h3>Найди место</h3>
              <p>Выбери природные, исторические и культурные точки на карте.</p>
            </div>
            <div className="step">
              <h3>Поделись историей</h3>
              <p>Добавь впечатления и помоги другим открыть Беларусь по-новому.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="sub">
            <div>
              <h3>Узнавай о новых местах первым</h3>
              <p>Подписка на лучшие локации, маршруты и идеи для поездок.</p>
            </div>
            <form>
              <input type="email" placeholder="Ваш email" />
              <button type="button">Подписаться</button>
            </form>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}
