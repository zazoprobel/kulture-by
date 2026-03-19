export function Footer() {
  return (
    <footer className="site-footer">
      <div className="fi">
        <div className="fg">
          <div>
            <a href="/" className="logo">
              <div className="logo-mark">🎉</div>
              <div>
                <div className="logo-text" style={{ color: "#fff" }}>
                  Культура События
                </div>
                <div className="logo-sub">kulture.by</div>
              </div>
            </a>
            <p className="fb-about">
              Главный портал интересных мест, площадок и маршрутов по всей
              Беларуси.
            </p>
            <p className="f-contact">
              ✉️ <a href="mailto:hello@kulture.by">hello@kulture.by</a>
            </p>
            <p className="f-contact">
              ✈️ <a href="https://t.me/kultureby_bot">@kultureby_bot</a>
            </p>
            <div className="f-soc">
              <a href="#" className="fsoc">
                VK
              </a>
              <a href="#" className="fsoc">
                TG
              </a>
              <a href="#" className="fsoc">
                IG
              </a>
              <a href="#" className="fsoc">
                YT
              </a>
            </div>
          </div>
          <div className="fc">
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
          <div className="fc">
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
          <div className="fc">
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
        </div>
        <div className="fbot">
          <span>© 2025 Культура События — Маркетплейс праздничных площадок</span>
          <div className="flegal">
            <a href="#">Конфиденциальность</a>
            <a href="#">Правила</a>
            <a href="#">Карта сайта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
