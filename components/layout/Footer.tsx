export function Footer() {
  return (
    <footer className="footer">
      <div className="inner">
        <div className="grid">
          <div className="brand">
            <a href="/" className="logo">
              <div className="logoMark">🎉</div>
              <div>
                <div className="logoText">Культура События</div>
                <div className="logoSub">kulture.by</div>
              </div>
            </a>
            <p className="about">
              Главный портал интересных мест, площадок и маршрутов по всей
              Беларуси.
            </p>
          </div>
          <div className="col">
            <h4>Площадки</h4>
            <ul>
              <li>
                <a href="#">Рестораны и кафе</a>
              </li>
              <li>
                <a href="#">Загородные усадьбы</a>
              </li>
              <li>
                <a href="#">Банкетные залы</a>
              </li>
              <li>
                <a href="#">Лофты и арт-пространства</a>
              </li>
            </ul>
          </div>
          <div className="col">
            <h4>Города</h4>
            <ul>
              <li>
                <a href="#">Минск</a>
              </li>
              <li>
                <a href="#">Брест</a>
              </li>
              <li>
                <a href="#">Гродно</a>
              </li>
              <li>
                <a href="#">Витебск</a>
              </li>
              <li>
                <a href="#">Гомель</a>
              </li>
              <li>
                <a href="#">Могилёв</a>
              </li>
            </ul>
          </div>
          <div className="col">
            <h4>О нас</h4>
            <ul>
              <li>
                <a href="#">О проекте</a>
              </li>
              <li>
                <a href="#">Блог</a>
              </li>
              <li>
                <a href="#">Партнерам</a>
              </li>
              <li>
                <a href="mailto:hello@kulture.by">Написать нам</a>
              </li>
            </ul>
          </div>
          <div className="contacts">
            <h4>Контакты</h4>
            <a href="mailto:hello@kulture.by">✉️ hello@kulture.by</a>
            <a href="https://t.me/kultureby_bot">✈️ @kultureby_bot</a>
          </div>
        </div>
        <div className="bottom">
          <span>© 2025 Культура События — портал мест и площадок Беларуси</span>
          <div className="legal">
            <a href="#">Конфиденциальность</a>
            <a href="#">Правила</a>
            <a href="#">Карта сайта</a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .footer { margin-top: 64px; background: #181818; color: #fff; }
        .inner { max-width: 1320px; margin: 0 auto; padding: 44px 20px 28px; }
        .grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 28px; }
        .logo { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; }
        .logoMark { width: 40px; height: 40px; border-radius: 10px; background: #fff; color: #181818; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .logoText { font-family: "Unbounded", sans-serif; font-size: 16px; font-weight: 700; line-height: 1.1; }
        .logoSub { color: rgba(255,255,255,.68); font-size: 11px; margin-top: 2px; }
        .about { margin-top: 12px; color: rgba(255,255,255,.62); line-height: 1.6; max-width: 260px; }
        .col h4, .contacts h4 { font-family: "Unbounded", sans-serif; font-size: 11px; color: rgba(255,255,255,.42); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 12px; }
        .col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .col a { color: rgba(255,255,255,.8); text-decoration: none; }
        .col a:hover, .contacts a:hover { color: #fff; }
        .contacts { display: flex; flex-direction: column; gap: 9px; }
        .contacts a { color: rgba(255,255,255,.85); text-decoration: none; }
        .bottom { margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.1); display: flex; justify-content: space-between; gap: 12px; color: rgba(255,255,255,.5); font-size: 12px; }
        .legal { display: flex; gap: 14px; }
        .legal a { color: rgba(255,255,255,.55); text-decoration: none; }
        @media (max-width: 1024px) {
          .grid { grid-template-columns: 1fr 1fr; }
          .brand { grid-column: 1 / -1; }
        }
        @media (max-width: 700px) {
          .grid { grid-template-columns: 1fr; }
          .bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}
