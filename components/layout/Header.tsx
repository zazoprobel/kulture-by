"use client";

import { useState } from "react";

const navItems = [
  { href: "/places", label: "Места" },
  { href: "/venues", label: "Площадки" },
  { href: "/guide", label: "Путеводитель" },
  { href: "#", label: "О нас" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="h-inner">
          <a href="/" className="logo">
            <div className="logo-mark">🎉</div>
            <div>
              <div className="logo-text">Культура События</div>
              <div className="logo-sub">kulture.by</div>
            </div>
          </a>
          <nav>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="na">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="h-right">
            <button className="btn-ico" type="button">
              ♡
            </button>
            <a className="btn-login" href="/login">
              Войти
            </a>
            <button
              type="button"
              className="h-burger"
              aria-label="Открыть меню"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </header>

      <div className="gsearch">
        <div className="gs-inner">
          <div className="gs-wrap">
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="gs-inp"
              placeholder="Мероприятие, площадка, ведущий…"
            />
          </div>
          <select className="gs-sel" defaultValue="📍 Вся Беларусь">
            <option>📍 Вся Беларусь</option>
            <option>📍 Минск</option>
            <option>📍 Брест</option>
            <option>📍 Гродно</option>
            <option>📍 Витебск</option>
            <option>📍 Гомель</option>
            <option>📍 Могилёв</option>
          </select>
          <button className="gs-btn" type="button">
            Найти →
          </button>
        </div>
      </div>

      <div className="cat-row">
        <button className="cat-b on" type="button">
          <span className="cat-ic">🎭</span>
          <span className="cat-lb">Все</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">🎶</span>
          <span className="cat-lb">Концерты</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">🎪</span>
          <span className="cat-lb">Фестивали</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">🎨</span>
          <span className="cat-lb">Выставки</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">🎬</span>
          <span className="cat-lb">Кино</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">🍽️</span>
          <span className="cat-lb">Гастро</span>
        </button>
        <button className="cat-b" type="button">
          <span className="cat-ic">💃</span>
          <span className="cat-lb">Вечеринки</span>
        </button>
      </div>
    </>
  );
}
