"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Browser-e Vercel-er nijer origin use hobe (proxy diye backend-e jabe),
// server-side render-e env theke nibe, na thakle localhost.
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,

  fetchOptions: {
    credentials: "include",
  },

  plugins: [jwtClient()],
});