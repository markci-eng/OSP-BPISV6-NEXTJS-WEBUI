"use client";

// The sign-in screen.
//
// THE FORM IS THE KIT'S; what belongs here is only what happens with the
// credentials. The kit's contract is worth stating, because both halves of it
// were being missed:
//
//   1. The handler prop is `onLogin`, and it is REQUIRED. This file was passing
//      `completeLogin`, which the kit knows nothing about — so the prop it does
//      read arrived undefined and the form had no handler at all. TypeScript was
//      reporting it; it is the error this file was failing the build with.
//
//   2. Rejecting with an `Error` is how a failure reaches the user: the form
//      catches it and shows the message. Returning normally means success. The
//      old handler awaited the request, ignored the response entirely and then
//      reloaded the page — so a rejected sign-in reloaded back to a blank login
//      screen with nothing said, which reads as the button not working.

import { LoginForm } from "osp-ui-kit";

export function LoginPage() {
  /**
   * `username` is the email — the field is labelled for whichever the product
   * calls it, and this API takes an email.
   *
   * THE PASSWORD IS NOT SENT AS TYPED. It is replaced with the seed's one
   * accepted value, which is how this screen has always behaved: every account
   * in `lib/users.ts` shares `DEMO_PASSWORD`, and the route now checks against
   * it. Written as a literal rather than imported so the seed does not have to
   * be bundled into the sign-in screen to get one string out of it — the two
   * must be kept the same by hand.
   *
   * Left explicit rather than tidied away, because the day a real auth API
   * replaces the seed, this line is the reason every sign-in suddenly fails —
   * and passing `password` through is then the whole fix.
   */
  async function onLogin(username: string, _password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password: "splpi" }),
    });

    if (!response.ok) {
      // The route answers `{ error }` on a bad request and on its own failures.
      // Read it if it is there, and fall back to something a user can act on
      // rather than surfacing a status code.
      const message = await response
        .json()
        .then((body: { error?: string }) => body?.error)
        .catch(() => undefined);

      throw new Error(
        message ?? "Could not sign in. Check your email and try again.",
      );
    }

    // The kit reads the name from `localStorage`, not from the session — it
    // cannot see the session at all, which is why it falls back to a hardcoded
    // name otherwise. So hand it the one the route just resolved.
    //
    // THIS OVERWRITES A RENAME, and should: the kit's profile screen writes the
    // same key, and keeping the previous value here would greet whoever signs
    // in next by the last person's name.
    const { user } = (await response.json().catch(() => ({}))) as {
      user?: { name?: string };
    };
    if (user?.name) localStorage.setItem("user-display-name", user.name);

    // A full reload rather than a router push, deliberately: the session is a
    // cookie the SERVER reads to decide the user's role and which routes they
    // may see, and the shell is rendered from that role. Only a fresh document
    // request picks the new cookie up.
    window.location.reload();
  }

  return (
    <LoginForm
      onLogin={onLogin}
      showBiometricLogin={true}
      showGoogleLogin={true}
      onBiometricLogin={() => onLogin("branch@stpeter.com.ph", "1234")}
      onGoogleLogin={() => onLogin("branch@stpeter.com.ph", "1234")}
      onFacebookLogin={() => onLogin("branch@stpeter.com.ph", "1234")}
    />
  );
}
