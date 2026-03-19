"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";

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
      <header className="topHeader">
        <Container>
          <div className="inner">
            <a href="/" className="logo">
              <div className="logoMark">🎉</div>
              <div>
                <div className="logoText">Культура События</div>
                <div className="logoSub">kulture.by</div>
              </div>
            </a>
            <nav className="nav">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="navLink">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="right">
              <button className="iconBtn" type="button" aria-label="Избранное">
                ♡
              </button>
              <a className="loginBtn" href="/login">
                Войти
              </a>
              <button
                type="button"
                className="burger"
                aria-label="Открыть меню"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </Container>
        <div className={`mobileNav ${isMenuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="mobileNavLink"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </header>

      <div className="searchBar">
        <Container>
          <div className="searchInner">
            <div className="searchWrap">
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
                className="searchInput"
                placeholder="Найти место, город, маршрут..."
              />
            </div>
            <select className="searchSelect" defaultValue="📍 Вся Беларусь">
              <option>📍 Вся Беларусь</option>
              <option>📍 Минск</option>
              <option>📍 Брест</option>
              <option>📍 Гродно</option>
              <option>📍 Витебск</option>
              <option>📍 Гомель</option>
              <option>📍 Могилёв</option>
            </select>
            <button className="searchBtn" type="button">
              Найти →
            </button>
          </div>
        </Container>
      </div>
      <style jsx>{`
        .topHeader { background: #181818; color: #fff; border-bottom: 1px solid rgba(255,255,255,.12); }
        :global(.container){max-width:1280px;margin:0 auto;padding:0 40px;}
        .inner { height: 78px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 24px; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
        .logoMark { width: 42px; height: 42px; border-radius: 10px; background: #fff; color: #181818; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .logoText { font-family: "Unbounded", sans-serif; font-size: 16px; font-weight: 700; line-height: 1.1; }
        .logoSub { font-size: 11px; color: rgba(255,255,255,.7); margin-top: 2px; }
        .nav { display: flex; justify-content: center; gap: 8px; }
        .navLink { padding: 9px 14px; border-radius: 99px; font-size: 15px; color: #fff; text-decoration: none; }
        .navLink:hover { background: rgba(255,255,255,.12); }
        .right { display: flex; align-items: center; gap: 8px; }
        .iconBtn, .loginBtn { height: 38px; border-radius: 99px; border: 1px solid rgba(255,255,255,.2); background: transparent; color: #fff; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
        .iconBtn { width: 38px; font-size: 16px; }
        .loginBtn { padding: 0 14px; font-size: 14px; }
        .iconBtn:hover, .loginBtn:hover { background: rgba(255,255,255,.12); }
        .burger { display: none; width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,255,255,.2); background: transparent; color: #fff; font-size: 18px; }
        .mobileNav { display: none; }
        .searchBar { background: #181818; padding: 14px 0 18px; }
        .searchInner { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; }
        .searchWrap { position: relative; }
        .searchWrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,.5); }
        .searchInput { width: 100%; height: 48px; border-radius: 12px; border: none; background: rgba(255,255,255,.12); color: #fff; padding: 0 14px 0 42px; }
        .searchInput::placeholder { color: rgba(255,255,255,.58); }
        .searchSelect { height: 48px; border-radius: 12px; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,.08); color: #fff; padding: 0 12px; }
        .searchBtn { height: 48px; border: none; border-radius: 12px; background: #D2F882; color: #181818; padding: 0 22px; font-weight: 700; }
        @media (max-width: 900px) {
          :global(.container){padding:0 20px;}
          .nav, .iconBtn, .loginBtn { display: none; }
          .burger { display: inline-flex; align-items: center; justify-content: center; }
          .inner { grid-template-columns: 1fr auto; }
          .mobileNav.open { display: flex; flex-direction: column; gap: 6px; padding: 10px 20px 16px; border-top: 1px solid rgba(255,255,255,.12); }
          .mobileNavLink { color: #fff; text-decoration: none; padding: 10px 12px; border-radius: 10px; }
          .mobileNavLink:hover { background: rgba(255,255,255,.1); }
          .searchInner { grid-template-columns: 1fr auto; }
          .searchWrap { grid-column: 1 / -1; }
        }
      `}</style>
    </>
  );
}
