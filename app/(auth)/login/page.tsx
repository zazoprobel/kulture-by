"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"password" | "otp" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signInWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading("password");
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(null);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const signInWithMagicLink = async () => {
    setError("");
    setSuccess("");
    setLoading("otp");
    const supabase = createClient();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(null);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setSuccess("Ссылка для входа отправлена на email.");
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
          Вход
        </h1>

        <form onSubmit={signInWithPassword}>
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
            disabled={loading !== null}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#D2F882",
              color: "#181818",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "10px",
            }}
          >
            {loading === "password" ? "Вход..." : "Войти"}
          </button>

          <button
            type="button"
            disabled={!email || loading !== null}
            onClick={signInWithMagicLink}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #D2F882",
              background: "transparent",
              color: "#D2F882",
              fontWeight: 700,
              cursor: !email || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading === "otp" ? "Отправка..." : "Войти по ссылке на email"}
          </button>
        </form>
      </section>
    </main>
  );
}
