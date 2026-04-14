"use client";

import { useMemo, useState } from "react";

type VenueBookingCardProps = {
  basePrice: number;
  venueId: string;
  city: string;
};

export function VenueBookingCard({ basePrice, venueId, city }: VenueBookingCardProps) {
  const [adults, setAdults] = useState(80);
  const [children, setChildren] = useState(10);
  const [eventType, setEventType] = useState("wedding");
  const [dateRequested, setDateRequested] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = useMemo(() => {
    return basePrice + (adults + children) * 50 + 200;
  }, [adults, children, basePrice]);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          venueId,
          city,
          eventType,
          dateRequested,
          guests: adults + children,
          budget: total,
          customerName,
          customerEmail,
          customerPhone,
          comment,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Ошибка при отправке");
      }
      setMessage("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setComment("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось отправить заявку.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookingCard">
      <div className="bookingPrice">от {basePrice} BYN</div>
      <div className="bookingPriceNote">за сутки · свободные даты уточняйте</div>

      <label className="bkLbl">Тип мероприятия</label>
      <select className="bkSel" value={eventType} onChange={(e) => setEventType(e.target.value)}>
        <option value="wedding">Свадьба</option>
        <option value="birthday">День рождения</option>
        <option value="corporate">Корпоратив</option>
      </select>

      <label className="bkLbl">Дата</label>
      <input className="bkInp" type="date" value={dateRequested} onChange={(e) => setDateRequested(e.target.value)} />

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

      <label className="bkLbl">Ваше имя</label>
      <input className="bkInp" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Имя" />

      <label className="bkLbl">Email</label>
      <input className="bkInp" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" />

      <label className="bkLbl">Телефон</label>
      <input className="bkInp" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+375..." />

      <label className="bkLbl">Комментарий</label>
      <textarea
        className="bkInp"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Пожелания по площадке"
        style={{ height: "90px", paddingTop: "10px", resize: "vertical" }}
      />

      <button className="bkBtn" type="button" onClick={handleSubmit} disabled={loading || !customerName || !customerEmail}>
        {loading ? "Отправляем..." : "Оставить заявку →"}
      </button>
      {message ? <div style={{ marginTop: "8px", fontSize: "12px", color: "#444" }}>{message}</div> : null}
    </div>
  );
}
