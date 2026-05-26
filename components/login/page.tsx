"use client";
// import {LoginPage} from "osp-chakra-reusable-components";
// import { LoginPage } from "@splpi/operations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPage } from "./LoginPage";
// import { LoginPage } from "./LoginPage";

interface ApiResponse {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  password: string;
}

function base64UrlToUint8Array(base64UrlString: string) {
  const padding = "=".repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export default function Login() {
  const router = useRouter();
  const [users, setUsers] = useState<ApiResponse[] | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result: ApiResponse[] = await response.json();
      setUsers(result);

      const storedCred = localStorage.getItem("webauthn_response");
      if (!storedCred) return;
      const parsedCred = JSON.parse(storedCred);
      console.log("Parsed Credential:", parsedCred.rawId);
      const data = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
          allowCredentials: [
            { type: "public-key", id: base64UrlToUint8Array(parsedCred.rawId) },
          ],
          rpId: location.hostname,
        },
      });

      console.log("dataaaa", data);
      router.push("/plan-management");
    };

    fetchData();
  }, []);

  const handleSignUp = async (
    email: string,
    password: string,
    firstname: string,
    middlename: string,
    lastname: string,
    contactnumber: string,
  ) => {
    //Validate email if already exists before sending to API
    try {
      const filteredItems =
        Array.isArray(users) && users.length > 0
          ? users.filter((user) => user.email?.toLowerCase().includes(email))
          : []; // Return an empty array if validation fails

      if (filteredItems.length > 0) {
        alert("User with this email already exists.");
        return;
      }
    } catch (error) {
      console.error("Error checking existing users:", error);
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          firstName: firstname,
          middleName: middlename,
          lastName: lastname,
          contactNumber: contactnumber,
        }),
      });
      const newItem = await response.json();
      console.log("Added user:", newItem);
      alert("User registered successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const user =
      email == "branch@stpeter.com.ph"
        ? "branch"
        : email == "bm@stpeter.com.ph" || email == "stl@stpeter.com.ph"
          ? "bmstl"
          : "sales-agent";
    localStorage.setItem("user", user);
    window.location.href = "/";
  };

  return <LoginPage onLogin={handleSignIn} onSignUp={handleSignUp} />;
}
