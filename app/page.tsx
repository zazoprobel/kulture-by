import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StatsBlock } from "@/components/home/StatsBlock";

export default async function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600;700&display=swap');
        :root { --lime:#D2F882; --yellow:#FFF57D; --lavender:#E7D4FF; --peach:#FFBD7B; --mint:#E2F8D0; --sky:#D1E4F8; --cream:#FFF5E4; --bg:#F7F6F2; --white:#FFFFFF; --dark:#181818; --gray:#888; --lgray:#C8C8C8; --border:rgba(0,0,0,.08); --r:20px; --trans:.2s cubic-bezier(.4,0,.2,1); --font-h:'Unbounded',sans-serif; --font-b:'Onest',sans-serif; }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:var(--font-b);background:var(--bg);color:var(--dark);overflow-x:hidden;-webkit-font-smoothing:antialiased}
        a{color:inherit;text-decoration:none}
        button{font-family:var(--font-b);cursor:pointer}
        .site-header{position:sticky;top:0;z-index:200;background:rgba(247,246,242,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
        .h-inner{max-width:1320px;margin:0 auto;padding:0 32px;height:64px;display:flex;align-items:center;gap:36px}
        .logo{display:flex;align-items:center;gap:10px;flex-shrink:0}.logo-mark{width:38px;height:38px;background:var(--dark);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}.logo-text{font-family:var(--font-h);font-weight:800;font-size:14px;line-height:1.1}.logo-sub{font-size:9px;font-weight:400;color:var(--gray);letter-spacing:.05em;display:block;margin-top:1px}
        nav{display:flex;align-items:center;gap:2px;flex:1}.na{font-size:13.5px;font-weight:500;padding:7px 13px;border-radius:99px;transition:background var(--trans)}.na:hover{background:rgba(0,0,0,.06)}.na.on{background:var(--dark);color:#fff}
        .h-right{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}.btn-ico{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--border);background:transparent;display:flex;align-items:center;justify-content:center;font-size:15px;transition:background var(--trans)}.btn-ico:hover{background:rgba(0,0,0,.06)}.btn-login{height:36px;padding:0 16px;border-radius:99px;border:1.5px solid var(--border);background:transparent;font-size:13px;font-weight:500;transition:background var(--trans);display:flex;align-items:center}.btn-login:hover{background:rgba(0,0,0,.06)}
        .gsearch{background:var(--dark);padding:18px 32px}.gs-inner{max-width:1320px;margin:0 auto;display:flex;gap:10px;align-items:center}.gs-wrap{flex:1;position:relative}.gs-wrap svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.4)}.gs-inp{width:100%;height:50px;border-radius:13px;border:none;background:rgba(255,255,255,.1);color:#fff;font-family:var(--font-b);font-size:14px;padding:0 18px 0 44px;outline:none;transition:background var(--trans)}.gs-inp::placeholder{color:rgba(255,255,255,.38)}.gs-inp:focus{background:rgba(255,255,255,.15)}.gs-sel{height:50px;padding:0 36px 0 14px;border-radius:13px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;font-family:var(--font-b);font-size:13px;appearance:none;cursor:pointer;outline:none;transition:border-color var(--trans);min-width:140px}.gs-btn{height:50px;padding:0 26px;border-radius:13px;border:none;background:var(--lime);color:var(--dark);font-family:var(--font-b);font-size:14px;font-weight:700;transition:opacity var(--trans);white-space:nowrap}
        .cat-row{max-width:1320px;margin:0 auto;padding:22px 32px 0;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.cat-row::-webkit-scrollbar{display:none}.cat-b{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 16px;border-radius:14px;border:1.5px solid transparent;background:transparent;cursor:pointer;white-space:nowrap;transition:all var(--trans);min-width:72px}.cat-b:hover{background:rgba(0,0,0,.04)}.cat-b.on{background:var(--dark);color:#fff}.cat-ic{font-size:20px}.cat-lb{font-size:11px;font-weight:500;text-align:center;line-height:1.2}
        .hero{max-width:1320px;margin:24px auto 0;padding:0 32px;display:grid;grid-template-columns:1.1fr 1fr;gap:16px}.hero-main{background:var(--lime);border-radius:var(--r);padding:44px 44px 0;overflow:hidden;min-height:400px;display:flex;flex-direction:column;position:relative}.hero-label{display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,.08);border-radius:99px;padding:5px 14px 5px 5px;font-size:12px;font-weight:600;margin-bottom:18px;width:fit-content}.hero-label-dot{width:22px;height:22px;background:var(--dark);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}.hero-h{font-family:var(--font-h);font-size:34px;font-weight:900;line-height:1.08;margin-bottom:16px}.hero-p{font-size:15px;color:rgba(0,0,0,.58);line-height:1.55;margin-bottom:28px;max-width:360px}.hero-cta{display:inline-flex;align-items:center;gap:10px;background:var(--dark);color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:99px;border:none;cursor:pointer;transition:opacity var(--trans);width:fit-content}.hero-img-row{margin-top:auto;display:flex;gap:12px;padding-bottom:0}.hero-photo{flex:1;height:160px;border-radius:14px 14px 0 0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:48px}
        .hero-right{display:flex;flex-direction:column;gap:16px}.hero-stat-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.stat-box{border-radius:var(--r);padding:28px 24px;display:flex;flex-direction:column;gap:6px}.stat-n{font-family:var(--font-h);font-size:30px;font-weight:900;line-height:1}.stat-l{font-size:12px;color:rgba(0,0,0,.5);line-height:1.3}.hero-banner{border-radius:var(--r);padding:24px 28px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:opacity var(--trans)}.banner-icon{font-size:32px;flex-shrink:0}.banner-t{font-family:var(--font-h);font-size:14px;font-weight:700;margin-bottom:3px;line-height:1.2}.banner-s{font-size:12px;opacity:.55}.banner-arr{margin-left:auto;font-size:18px;opacity:.4;flex-shrink:0}
        .sec{max-width:1320px;margin:52px auto 0;padding:0 32px}.sec-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}.sec-t{font-family:var(--font-h);font-size:21px;font-weight:700}
        .afisha-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.af-card{border-radius:var(--r);overflow:hidden;background:var(--white);border:1.5px solid var(--border);display:block}.af-thumb{width:100%;height:170px;position:relative;display:flex;align-items:center;justify-content:center;font-size:44px}.af-date{position:absolute;top:10px;left:10px;background:rgba(255,255,255,.92);border-radius:10px;padding:5px 10px;font-family:var(--font-h);font-size:11px;font-weight:700;line-height:1.1;text-align:center}.af-date span{display:block;font-family:var(--font-b);font-size:11px;font-weight:500;color:var(--gray)}.af-badge{position:absolute;bottom:10px;left:10px;border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700}.af-fav{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.88);border:none;display:flex;align-items:center;justify-content:center;font-size:13px}.af-body{padding:14px}.af-cat{font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}.af-title{font-family:var(--font-h);font-size:13px;font-weight:700;line-height:1.3;margin-bottom:5px}.af-loc{font-size:12px;color:var(--gray);margin-bottom:8px}
        .occ-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.occ-c{border-radius:var(--r);padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center}.occ-ico{font-size:34px}.occ-t{font-family:var(--font-h);font-size:12px;font-weight:700}.occ-n{font-size:11px;color:rgba(0,0,0,.42)}
        .contr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.contr-c{border-radius:var(--r);padding:28px 24px;display:block}.contr-ico{font-size:36px;margin-bottom:14px}.contr-t{font-family:var(--font-h);font-size:14px;font-weight:700;margin-bottom:6px}.contr-d{font-size:12px;color:rgba(0,0,0,.5);line-height:1.4;margin-bottom:14px}.contr-cnt{font-size:12px;font-weight:700;color:rgba(0,0,0,.45)}
        .map-promo{background:var(--lavender);border-radius:var(--r);padding:40px 48px;display:flex;align-items:center;gap:48px;overflow:hidden}.map-t{font-family:var(--font-h);font-size:24px;font-weight:800;margin-bottom:10px}.map-s{font-size:14px;color:rgba(0,0,0,.5);line-height:1.55;margin-bottom:22px;max-width:380px}.map-btn{display:inline-flex;align-items:center;gap:8px;background:var(--dark);color:#fff;font-size:14px;font-weight:600;padding:13px 24px;border-radius:99px;border:none}
        .reg-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.reg-c{border-radius:16px;padding:18px 10px;text-align:center}.reg-ico{font-size:26px;margin-bottom:7px}.reg-n{font-size:12px;font-weight:700}.reg-cnt{font-size:10px;color:rgba(0,0,0,.4);margin-top:2px}
        .how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.how-c{background:var(--cream);border-radius:var(--r);padding:28px 24px}.how-num{font-family:var(--font-h);font-size:44px;font-weight:900;color:rgba(0,0,0,.06);line-height:1;margin-bottom:12px}.how-ico{font-size:28px;margin-bottom:10px}.how-t{font-family:var(--font-h);font-size:13px;font-weight:700;margin-bottom:7px}.how-d{font-size:12px;color:rgba(0,0,0,.48);line-height:1.5}
        .rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.rev-c{background:var(--dark);border-radius:var(--r);padding:24px;color:#fff}.rev-h{display:flex;align-items:center;gap:12px;margin-bottom:14px}.rev-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}.rev-name{font-weight:600;font-size:14px}.rev-date{font-size:11px;color:rgba(255,255,255,.38);margin-top:2px}.rev-stars{color:var(--yellow);font-size:12px;margin-bottom:9px}.rev-txt{font-size:13px;color:rgba(255,255,255,.72);line-height:1.6}
        .nl-card{background:var(--mint);border-radius:var(--r);padding:40px 48px;display:flex;align-items:center;gap:40px}.nl-t{font-family:var(--font-h);font-size:22px;font-weight:800;margin-bottom:6px}.nl-s{font-size:14px;color:rgba(0,0,0,.48)}.nl-form{display:flex;gap:10px}.nl-inp{height:48px;width:260px;border-radius:12px;border:1.5px solid rgba(0,0,0,.1);background:rgba(255,255,255,.6);font-size:13px;padding:0 16px}.nl-btn{height:48px;padding:0 22px;border-radius:12px;border:none;background:var(--dark);color:#fff;font-size:13px;font-weight:700}
        .site-footer{background:var(--dark);color:#fff;margin-top:64px;padding:48px 0 28px}.fi{max-width:1320px;margin:0 auto;padding:0 32px}.fg{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;margin-bottom:38px}.fb-about{font-size:13px;color:rgba(255,255,255,.38);margin-top:12px;line-height:1.65;max-width:210px}.f-contact{font-size:13px;color:rgba(255,255,255,.5);margin-top:10px;display:flex;align-items:center;gap:6px}.f-contact a{color:var(--lime)}.f-soc{display:flex;gap:8px;margin-top:16px}.fsoc{width:34px;height:34px;border-radius:9px;border:1.5px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}.fc h4{font-family:var(--font-h);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px}.fc ul{list-style:none;display:flex;flex-direction:column;gap:9px}.fc ul li a{font-size:13px;color:rgba(255,255,255,.55)}.fbot{padding-top:22px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.25)}.flegal{display:flex;gap:16px}
      `}</style>

      <Header />

      <div className="hero">
        <div className="hero-main">
          <div className="hero-label">
            <div className="hero-label-dot">✨</div>
            Главный портал праздников Беларуси
          </div>
          <h1 className="hero-h">
            Беларусь —<br />
            это праздник
            <br />
            каждый день
          </h1>
          <p className="hero-p">
            Афиша событий, лучшие площадки, проверенные подрядчики. Всё для
            незабываемого торжества.
          </p>
          <a href="/afisha" className="hero-cta">
            Открыть афишу →
          </a>
          <div className="hero-img-row">
            <div className="hero-photo">🏰</div>
            <div className="hero-photo">🎊</div>
          </div>
        </div>
        <div className="hero-right">
          <StatsBlock />
          <a href="#" className="hero-banner" style={{ background: "var(--peach)" }}>
            <div className="banner-icon">📸</div>
            <div>
              <div className="banner-t">Фотографы и видеографы</div>
              <div className="banner-s">340 проверенных подрядчиков</div>
            </div>
            <div className="banner-arr">→</div>
          </a>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h">
          <h2 className="sec-t">Ближайшие события</h2>
        </div>
        <div className="afisha-row">
          <a href="#" className="af-card">
            <div className="af-thumb" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}>
              <span>🎶</span>
              <div className="af-date">22<span>МАР</span></div>
              <div className="af-badge" style={{ background: "var(--lime)", color: "var(--dark)" }}>от 25 BYN</div>
              <button className="af-fav" type="button">♡</button>
            </div>
            <div className="af-body">
              <div className="af-cat">Концерт · Минск</div>
              <div className="af-title">Ляпис 98 — Воссоединение</div>
              <div className="af-loc">📍 Falcon Club, пр. Победителей</div>
            </div>
          </a>
          <a href="#" className="af-card">
            <div className="af-thumb" style={{ background: "linear-gradient(135deg,#e8f5e9,#a5d6a7)" }}>
              <span>🎨</span>
              <div className="af-date">23<span>МАР</span></div>
              <div className="af-badge" style={{ background: "var(--mint)", color: "var(--dark)" }}>Бесплатно</div>
              <button className="af-fav" type="button">♡</button>
            </div>
            <div className="af-body">
              <div className="af-cat">Выставка · Минск</div>
              <div className="af-title">Беларусь в объективе</div>
              <div className="af-loc">📍 Галерея Ў, ул. Октябрьская</div>
            </div>
          </a>
          <a href="#" className="af-card">
            <div className="af-thumb" style={{ background: "linear-gradient(135deg,#fff8e1,#ffecb3)" }}>
              <span>🍷</span>
              <div className="af-date">29<span>МАР</span></div>
              <div className="af-badge" style={{ background: "var(--peach)", color: "var(--dark)" }}>от 45 BYN</div>
              <button className="af-fav" type="button">♡</button>
            </div>
            <div className="af-body">
              <div className="af-cat">Гастрофест · Минск</div>
              <div className="af-title">Минский фестиваль вина 2025</div>
              <div className="af-loc">📍 Атриум, пл. Независимости</div>
            </div>
          </a>
          <a href="#" className="af-card">
            <div className="af-thumb" style={{ background: "linear-gradient(135deg,#fce4ec,#f8bbd0)" }}>
              <span>💃</span>
              <div className="af-date">5<span>АПР</span></div>
              <div className="af-badge" style={{ background: "var(--lavender)", color: "var(--dark)" }}>от 15 BYN</div>
              <button className="af-fav" type="button">♡</button>
            </div>
            <div className="af-body">
              <div className="af-cat">Вечеринка · Минск</div>
              <div className="af-title">Ретро-вечеринка 80-е снова в моде</div>
              <div className="af-loc">📍 клуб Re:Public, ул. Жилуновича</div>
            </div>
          </a>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2 className="sec-t">Найти площадку для праздника</h2></div>
        <div className="occ-grid">
          <a href="#" className="occ-c" style={{ background: "var(--lavender)" }}><div className="occ-ico">💍</div><div className="occ-t">Свадьба</div><div className="occ-n">148 площадок</div></a>
          <a href="#" className="occ-c" style={{ background: "var(--lime)" }}><div className="occ-ico">🎂</div><div className="occ-t">День рождения</div><div className="occ-n">294 площадки</div></a>
          <a href="#" className="occ-c" style={{ background: "var(--yellow)" }}><div className="occ-ico">🏢</div><div className="occ-t">Корпоратив</div><div className="occ-n">201 площадка</div></a>
          <a href="#" className="occ-c" style={{ background: "var(--peach)" }}><div className="occ-ico">🎓</div><div className="occ-t">Выпускной</div><div className="occ-n">89 площадок</div></a>
          <a href="#" className="occ-c" style={{ background: "var(--mint)" }}><div className="occ-ico">🧸</div><div className="occ-t">Детский праздник</div><div className="occ-n">128 площадок</div></a>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2 className="sec-t">Подрядчики для праздника</h2></div>
        <div className="contr-grid">
          <a href="#" className="contr-c" style={{ background: "var(--yellow)" }}><div className="contr-ico">📸</div><div className="contr-t">Фотографы</div><div className="contr-d">Свадебная, репортажная и портретная съемка</div><div className="contr-cnt">186 специалистов</div></a>
          <a href="#" className="contr-c" style={{ background: "var(--lavender)" }}><div className="contr-ico">🎬</div><div className="contr-t">Видеографы</div><div className="contr-d">Свадебное и корпоративное видео, клипы</div><div className="contr-cnt">94 специалиста</div></a>
          <a href="#" className="contr-c" style={{ background: "var(--peach)" }}><div className="contr-ico">💐</div><div className="contr-t">Декораторы</div><div className="contr-d">Оформление зала, фотозоны, флористика</div><div className="contr-cnt">143 специалиста</div></a>
          <a href="#" className="contr-c" style={{ background: "var(--lime)" }}><div className="contr-ico">🎙️</div><div className="contr-t">Ведущие и DJ</div><div className="contr-d">Профессионалы для любого формата</div><div className="contr-cnt">221 специалист</div></a>
        </div>
      </div>

      <div className="sec">
        <div className="map-promo">
          <div style={{ flex: 1 }}>
            <h2 className="map-t">Все площадки на одной карте</h2>
            <p className="map-s">
              Смотрите расположение заведений, оценивайте удаленность и стройте
              маршрут.
            </p>
            <button className="map-btn" type="button">
              Открыть карту →
            </button>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2 className="sec-t">По регионам</h2></div>
        <div className="reg-grid">
          <div className="reg-c" style={{ background: "var(--lime)" }}><div className="reg-ico">🏙️</div><div className="reg-n">Минск</div><div className="reg-cnt">218 мест</div></div>
          <div className="reg-c" style={{ background: "var(--lavender)" }}><div className="reg-ico">🏰</div><div className="reg-n">Гродно</div><div className="reg-cnt">47 мест</div></div>
          <div className="reg-c" style={{ background: "var(--yellow)" }}><div className="reg-ico">🌊</div><div className="reg-n">Брест</div><div className="reg-cnt">38 мест</div></div>
          <div className="reg-c" style={{ background: "var(--peach)" }}><div className="reg-ico">🎨</div><div className="reg-n">Витебск</div><div className="reg-cnt">29 мест</div></div>
          <div className="reg-c" style={{ background: "var(--mint)" }}><div className="reg-ico">🏭</div><div className="reg-n">Гомель</div><div className="reg-cnt">33 места</div></div>
          <div className="reg-c" style={{ background: "var(--sky)" }}><div className="reg-ico">🌳</div><div className="reg-n">Могилев</div><div className="reg-cnt">25 мест</div></div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2 className="sec-t">Как это работает</h2></div>
        <div className="how-grid">
          <div className="how-c"><div className="how-num">01</div><div className="how-ico">🔍</div><div className="how-t">Выберите параметры</div><div className="how-d">Укажите формат, гостей и бюджет.</div></div>
          <div className="how-c" style={{ background: "var(--lavender)" }}><div className="how-num">02</div><div className="how-ico">👀</div><div className="how-t">Изучите карточки и отзывы</div><div className="how-d">Смотрите фото и реальные оценки.</div></div>
          <div className="how-c" style={{ background: "var(--lime)" }}><div className="how-num">03</div><div className="how-ico">📅</div><div className="how-t">Забронируйте дату</div><div className="how-d">Подтверждение придет на email.</div></div>
          <div className="how-c" style={{ background: "var(--yellow)" }}><div className="how-num">04</div><div className="how-ico">🎉</div><div className="how-t">Проведите праздник</div><div className="how-d">Наслаждайтесь событием без стресса.</div></div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2 className="sec-t">Отзывы</h2></div>
        <div className="rev-grid">
          <div className="rev-c"><div className="rev-h"><div className="rev-av" style={{ background: "var(--lime)", color: "var(--dark)" }}>👩</div><div><div className="rev-name">Анна Ковалева</div><div className="rev-date">14 февраля 2025</div></div></div><div className="rev-stars">★★★★★</div><div className="rev-txt">Отмечали свадьбу в усадьбе, все прошло безупречно.</div></div>
          <div className="rev-c" style={{ background: "var(--lavender)", color: "var(--dark)" }}><div className="rev-h"><div className="rev-av" style={{ background: "var(--dark)", color: "#fff" }}>👨</div><div><div className="rev-name">Дмитрий Лукьянов</div><div className="rev-date">3 января 2025</div></div></div><div className="rev-stars" style={{ color: "#7c3aed" }}>★★★★★</div><div className="rev-txt" style={{ color: "rgba(0,0,0,.72)" }}>Корпоратив в лофте прошел отлично, удобно и быстро нашли место.</div></div>
          <div className="rev-c"><div className="rev-h"><div className="rev-av" style={{ background: "var(--peach)", color: "var(--dark)" }}>👩</div><div><div className="rev-name">Марина Соколова</div><div className="rev-date">20 декабря 2024</div></div></div><div className="rev-stars">★★★★★</div><div className="rev-txt">Фотограф через сайт оказался идеальным выбором.</div></div>
        </div>
      </div>

      <div className="sec" style={{ marginBottom: 0 }}>
        <div className="nl-card">
          <div style={{ flex: 1 }}>
            <div className="nl-t">Узнавайте первым о событиях и акциях</div>
            <div className="nl-s">
              Подпишитесь и получайте лучшие предложения раньше всех.
            </div>
          </div>
          <div className="nl-form">
            <input type="email" className="nl-inp" placeholder="Ваш email" />
            <button className="nl-btn" type="button">
              Подписаться →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
