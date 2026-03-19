"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          name,
          role: "user",
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    } else {
      setSuccess(
        "Проверьте email и подтвердите регистрацию. Профиль будет создан после первого входа.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#181818",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#202020",
          border: "1px solid #2f2f2f",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: "0 0 20px", color: "#D2F882" }}>
          Регистрация
        </h1>

        <form onSubmit={handleRegister}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}
          >
            Имя
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            style={{
              width: "100%",
              marginBottom: "14px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #3a3a3a",
              background: "#121212",
              color: "#ffffff",
              outline: "none",
            }}
          />

          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              marginBottom: "14px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #3a3a3a",
              background: "#121212",
              color: "#ffffff",
              outline: "none",
            }}
          />

          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}
          >
            Пароль
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            style={{
              width: "100%",
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #3a3a3a",
              background: "#121212",
              color: "#ffffff",
              outline: "none",
            }}
          />

          {error ? (
            <p style={{ color: "#ff7a7a", margin: "0 0 12px", fontSize: "14px" }}>
              {error}
            </p>
          ) : null}

          {success ? (
            <p style={{ color: "#D2F882", margin: "0 0 12px", fontSize: "14px" }}>
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#D2F882",
              color: "#181818",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      </section>
    </main>
  );
}
