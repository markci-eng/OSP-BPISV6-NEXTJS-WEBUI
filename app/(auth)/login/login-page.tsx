"use client";
import { LoginForm } from "osp-ui-kit";

export function LoginPage() {
  async function onLogin(email: string, password: string) {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "splpi" }),
    });

    window.location.reload();
  }

  return <LoginForm completeLogin={onLogin} />;
}
