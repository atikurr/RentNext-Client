"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY =
  "property-rental-theme";

const DEFAULT_THEME = "system";

const VALID_THEMES = [
  "light",
  "dark",
  "system",
];

/* =========================================================
   HELPERS
========================================================= */

function getStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (
      VALID_THEMES.includes(stored)
    ) {
      return stored;
    }
  } catch (error) {
    console.error(
      "Failed to read theme:",
      error
    );
  }

  return DEFAULT_THEME;
}

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function getActiveTheme(theme) {
  if (theme === "system") {
    return getSystemTheme();
  }

  return theme;
}

/* =========================================================
   EXTERNAL THEME STORE
========================================================= */

let currentTheme = DEFAULT_THEME;

const listeners = new Set();

let initialized = false;

function initializeThemeStore() {
  if (
    initialized ||
    typeof window === "undefined"
  ) {
    return;
  }

  initialized = true;

  currentTheme =
    getStoredTheme();
}

function subscribe(callback) {
  initializeThemeStore();

  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function getThemeSnapshot() {
  initializeThemeStore();

  return currentTheme;
}

function getServerThemeSnapshot() {
  return DEFAULT_THEME;
}

function changeTheme(
  newTheme
) {
  if (
    !VALID_THEMES.includes(
      newTheme
    )
  ) {
    console.error(
      "Invalid theme:",
      newTheme
    );

    return;
  }

  currentTheme = newTheme;

  if (
    typeof window !== "undefined"
  ) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        newTheme
      );
    } catch (error) {
      console.error(
        "Failed to save theme:",
        error
      );
    }
  }

  listeners.forEach(
    (listener) => {
      listener();
    }
  );
}

/* =========================================================
   APPLY THEME TO HTML
========================================================= */

function applyTheme(theme) {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  const root =
    document.documentElement;

  const activeTheme =
    getActiveTheme(theme);

  root.classList.remove(
    "light",
    "dark"
  );

  root.classList.add(
    activeTheme
  );

  root.setAttribute(
    "data-theme",
    activeTheme
  );

  root.style.colorScheme =
    activeTheme;
}

/* =========================================================
   CONTEXT
========================================================= */

const ThemeContext =
  createContext(null);

/* =========================================================
   THEME PROVIDER
========================================================= */

export function ThemeProvider({
  children,
}) {
  const theme =
    useSyncExternalStore(
      subscribe,
      getThemeSnapshot,
      getServerThemeSnapshot
    );

  /* =======================================================
     APPLY CURRENT THEME
  ======================================================= */

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* =======================================================
     SYSTEM THEME LISTENER
  ======================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    if (theme !== "system") {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemThemeChange =
      () => {
        applyTheme("system");
      };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* =========================================================
   USE THEME
========================================================= */

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}