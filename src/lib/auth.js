"use client";

import { authClient } from "@/lib/auth-client";

export async function getCurrentUser() {
  try {
    const { data, error } =
      await authClient.getSession();

    if (error) {
      console.error("Session error:", error);
      return null;
    }

    return data?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function logout() {
  try {
    const { error } =
      await authClient.signOut();

    if (error) {
      throw new Error(
        error.message || "Logout failed"
      );
    }

    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}