"use client";

import { useMemo, useState } from "react";

export function VenueBookingCard({ basePrice }: { basePrice: number }) {
  const [adults, setAdults] = useState(80);
  const [children, setChildren] = useState(10);

  const total = useMemo(() => {
    return basePrice + (adults + children) * 50 + 200;
  }, [adults, children, basePrice]);

  return (
    <div className="bookingCard">
      <div className="bookingPrice">от {basePrice} BYN</div>
      <div className="bookingPriceNote">за сутки · свободные даты уточняйте</div>

      <label className="bkLbl">Тип мероприятия</label>
      <select className="bkSel" defaultValue="wedding">
        <option value="wedding">Свадьба</option>
        <option value="birthday">День рождения</option>
        <option value="corporate">Корпоратив</option>
      </select>

      <label className="bkLbl">Дата</label>
      <input className="bkInp" type="date" />

      <div className="guestsRow">
        <button type="button" className="cntBtn" onClick={() => setAdults((v) => Math.max(1, v - 1))}>−</button>
        <span className="cntVal">Взрослые: {adults}</span>
        <button type="button" className="cntBtn" onClick={() => setAdults((v) => v + 1)}>+</button>
      </div>
      <div className="guestsRow">
        <button type="button" className="cntBtn" onClick={() => setChildren((v) => Math.max(0, v - 1))}>−</button>
        <span className="cntVal">Дети: {children}</span>
        <button type="button" className="cntBtn" onClick={() => setChildren((v) => v + 1)}>+</button>
      </div>

      <div className="bkTotal">
        <div className="bkTotalRow"><span>Аренда</span><span>{basePrice} BYN</span></div>
        <div className="bkTotalRow"><span>Кейтеринг</span><span>{(adults + children) * 50} BYN</span></div>
        <div className="bkTotalRow"><span>Баня</span><span>200 BYN</span></div>
        <div className="bkTotalRow total"><span>Итого</span><span>{total} BYN</span></div>
      </div>

      <button className="bkBtn" type="button">Оставить заявку →</button>
    </div>
  );
}
