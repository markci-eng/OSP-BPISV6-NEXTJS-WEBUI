"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPage } from "./new-login-page";
import { LoginForm } from "./new-login-page-v2";

interface ApiResponse {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [users, setUsers] = useState<ApiResponse[] | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const result: ApiResponse[] = await response.json();
          setUsers(result);
        }
      } catch {
        // External users API unavailable — sign-up duplicate check will be skipped
      }
    };
    loadUsers();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setLoginError(data.error ?? "Login failed. Please try again.");
        return;
      }

      const data = await response.json();
      const roleRoutes: Record<string, string> = {
        claims: "/claims",
        amd: "/accounts-management",
      };
      router.push(roleRoutes[data.role] ?? "/");
      router.refresh();
    } catch {
      setLoginError("Network error. Please try again.");
    }
  };

  // return <LoginPage onLogin={handleSignIn} />;
  return <LoginForm/>
}
