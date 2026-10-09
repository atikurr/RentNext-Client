"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

/* =========================================================
   TENANT NAVIGATION
========================================================= */

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard/tenant",
    icon: LayoutDashboard,
  },
  {
    label: "My Bookings",
    href: "/dashboard/tenant/bookings",
    icon: CalendarCheck2,
  },
  {
    label: "Favorites",
    href: "/dashboard/tenant/favorites",
    icon: Heart,
  },
];

/* =========================================================
   THEME TOGGLE
========================================================= */

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      className={`
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        transition-all
        duration-200

        ${
          isDark
            ? `
              border-orange-500/30
              bg-orange-500/10
              text-orange-400
              hover:bg-orange-500/20
            `
            : `
              border-slate-200
              bg-white
              text-orange-500
              shadow-sm
              hover:border-orange-300
              hover:bg-orange-50
            `
        }
      `}
    >
      {/* 
        LIGHT  = SUN
        DARK   = MOON
      */}
      {isDark ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <Sun className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

/* =========================================================
   TENANT DASHBOARD LAYOUT
========================================================= */

export default function TenantDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* =======================================================
     THEME

     IMPORTANT:
     false = LIGHT
     true  = DARK

     Every fresh dashboard visit starts LIGHT.
  ======================================================= */

  const [isDark, setIsDark] = useState(false);

  /* =======================================================
     AUTH CHECK
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        const session = await authClient.getSession();

        if (!mounted) return;

        const currentUser = session?.data?.user;

        /* -----------------------------------------------
           NO USER
        ------------------------------------------------ */

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        /* -----------------------------------------------
           USER ROLE
        ------------------------------------------------ */

        const role = currentUser?.role?.toLowerCase();

        /* -----------------------------------------------
           TENANT ONLY
        ------------------------------------------------ */

        if (role !== "tenant") {
          if (role === "admin") {
            router.replace("/dashboard/admin");
          } else if (role === "owner") {
            router.replace("/dashboard/owner");
          } else {
            router.replace("/");
          }

          return;
        }

        /* -----------------------------------------------
           SET TENANT
        ------------------------------------------------ */

        setUser(currentUser);
      } catch (error) {
        console.error("Tenant authentication error:", error);

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     THEME

     Light -> Dark
     Dark  -> Light
  ======================================================= */

  const toggleTheme = () => {
    setIsDark((currentTheme) => !currentTheme);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      /* Always reset dashboard theme */

      setIsDark(false);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const isActive = (href) => {
    if (href === "/dashboard/tenant") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  const getPageTitle = () => {
    if (pathname.includes("bookings")) {
      return "My Bookings";
    }

    if (pathname.includes("favorites")) {
      return "Favorites";
    }

    if (pathname.includes("profile")) {
      return "Profile";
    }

    if (pathname.includes("settings")) {
      return "Settings";
    }

    return "Dashboard";
  };

  /* =======================================================
     USER DATA
  ======================================================= */

  const tenantInitial =
    user?.name?.charAt(0)?.toUpperCase() || "T";

  const tenantPhoto = user?.photo || user?.image || "";

  /* =======================================================
     LOADING
  ======================================================= */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Checking account access...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NO USER
  ======================================================= */

  if (!user) {
    return null;
  }

  /* =======================================================
     MAIN TENANT DASHBOARD

     IMPORTANT:
     `dark` class exists ONLY inside tenant dashboard.
     Therefore public website is NOT affected.
  ======================================================= */

  return (
    <div
      className={`
        ${isDark ? "dark" : ""}

        min-h-screen
        font-sans
        transition-colors
        duration-300

        ${
          isDark
            ? "bg-[#09090b] text-zinc-100"
            : "bg-[#f7f5ef] text-slate-900"
        }
      `}
    >
      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          border-r
          transition-all
          duration-300
          lg:flex
          lg:flex-col

          ${
            isDark
              ? "border-zinc-800 bg-[#101012]"
              : "border-slate-200 bg-white"
          }

          ${collapsed ? "w-[78px]" : "w-[255px]"}
        `}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className={`
            flex
            h-[76px]
            shrink-0
            items-center
            border-b
            px-4

            ${
              isDark
                ? "border-zinc-800"
                : "border-slate-100"
            }
          `}
        >
          <Link
            href="/dashboard/tenant"
            className={`
              flex
              min-w-0
              items-center
              gap-3

              ${collapsed ? "w-full justify-center" : ""}
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
              RN
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p
                  className={`
                    truncate
                    text-[15px]
                    font-bold

                    ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  `}
                >
                  Rent
                  <span className="text-orange-500">
                    Nest
                  </span>
                </p>

                <p
                  className={`
                    text-[10px]

                    ${
                      isDark
                        ? "text-zinc-500"
                        : "text-slate-400"
                    }
                  `}
                >
                  Tenant Portal
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* =================================================
            SIDEBAR NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p
              className={`
                mb-3
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]

                ${
                  isDark
                    ? "text-zinc-600"
                    : "text-slate-400"
                }
              `}
            >
              Main Menu
            </p>
          )}

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group
                    flex
                    h-11
                    items-center
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all

                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3"
                    }

                    ${
                      active
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                        : isDark
                        ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* =================================================
              EXPLORE
          ================================================= */}

          {!collapsed && (
            <div className="mt-9">
              <p
                className={`
                  mb-3
                  px-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]

                  ${
                    isDark
                      ? "text-zinc-600"
                      : "text-slate-400"
                  }
                `}
              >
                Explore
              </p>

              <Link
                href="/properties"
                className={`
                  flex
                  h-11
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  text-sm
                  font-medium
                  transition

                  ${
                    isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                  }
                `}
              >
                <Search className="h-[18px] w-[18px]" />
                Browse Properties
              </Link>

              <Link
                href="/"
                className={`
                  mt-1.5
                  flex
                  h-11
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  text-sm
                  font-medium
                  transition

                  ${
                    isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                  }
                `}
              >
                <Home className="h-[18px] w-[18px]" />
                Back to Home
              </Link>
            </div>
          )}

          {/* =================================================
              ACCOUNT
          ================================================= */}

          {!collapsed && (
            <div className="mt-9">
              <p
                className={`
                  mb-3
                  px-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]

                  ${
                    isDark
                      ? "text-zinc-600"
                      : "text-slate-400"
                  }
                `}
              >
                Account
              </p>

              <Link
                href="/dashboard/tenant/profile"
                className={`
                  flex
                  h-11
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  text-sm
                  font-medium
                  transition

                  ${
                    pathname ===
                    "/dashboard/tenant/profile"
                      ? "bg-orange-500 text-white"
                      : isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                  }
                `}
              >
                <CircleUserRound className="h-[18px] w-[18px]" />
                Profile
              </Link>

              <Link
                href="/dashboard/tenant/settings"
                className={`
                  mt-1.5
                  flex
                  h-11
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  text-sm
                  font-medium
                  transition

                  ${
                    pathname ===
                    "/dashboard/tenant/settings"
                      ? "bg-orange-500 text-white"
                      : isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                  }
                `}
              >
                <Settings className="h-[18px] w-[18px]" />
                Settings
              </Link>
            </div>
          )}
        </nav>

        {/* =================================================
            USER CARD
        ================================================= */}

        <div
          className={`
            shrink-0
            border-t
            p-3

            ${
              isDark
                ? "border-zinc-800"
                : "border-slate-100"
            }
          `}
        >
          <div
            className={`
              flex
              items-center
              rounded-xl
              p-2

              ${collapsed ? "justify-center" : "gap-3"}

              ${isDark ? "bg-zinc-900" : "bg-slate-50"}
            `}
          >
            <div
              className={`
                relative
                h-9
                w-9
                shrink-0
                overflow-hidden
                rounded-full

                ${
                  isDark
                    ? "bg-zinc-800"
                    : "bg-orange-100"
                }
              `}
            >
              {tenantPhoto ? (
                <Image
                  src={tenantPhoto}
                  alt={user?.name || "Tenant"}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-orange-600">
                  {tenantInitial}
                </div>
              )}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p
                    className={`
                      truncate
                      text-xs
                      font-semibold

                      ${
                        isDark
                          ? "text-white"
                          : "text-slate-900"
                      }
                    `}
                  >
                    {user?.name || "Tenant"}
                  </p>

                  <p
                    className={`
                      text-[10px]

                      ${
                        isDark
                          ? "text-zinc-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Tenant Account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg

                    ${
                      isDark
                        ? "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                        : "text-slate-400 hover:bg-white hover:text-red-500"
                    }
                  `}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* =================================================
            COLLAPSE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`
            absolute
            -right-3
            top-[78px]
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            border
            shadow-sm

            ${
              isDark
                ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-orange-50"
            }
          `}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===================================================
          MOBILE SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[70]
          flex
          w-[275px]
          flex-col
          shadow-2xl
          transition-transform
          duration-300
          lg:hidden

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          ${isDark ? "bg-[#101012]" : "bg-white"}
        `}
      >
        {/* MOBILE BRAND */}

        <div
          className={`
            flex
            h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            px-4

            ${
              isDark
                ? "border-zinc-800"
                : "border-slate-100"
            }
          `}
        >
          <Link
            href="/dashboard/tenant"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
              RN
            </div>

            <div>
              <p
                className={`
                  text-sm
                  font-bold

                  ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                Rent
                <span className="text-orange-500">
                  Nest
                </span>
              </p>

              <p
                className={`
                  text-[10px]

                  ${
                    isDark
                      ? "text-zinc-500"
                      : "text-slate-400"
                  }
                `}
              >
                Tenant Portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg

              ${
                isDark
                  ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MOBILE NAV */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p
            className={`
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]

              ${
                isDark
                  ? "text-zinc-600"
                  : "text-slate-400"
              }
            `}
          >
            Main Menu
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex
                    h-11
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    text-sm
                    font-medium

                    ${
                      active
                        ? "bg-orange-500 text-white"
                        : isDark
                        ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* MOBILE EXPLORE */}

          <div className="mt-9">
            <p
              className={`
                mb-3
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]

                ${
                  isDark
                    ? "text-zinc-600"
                    : "text-slate-400"
                }
              `}
            >
              Explore
            </p>

            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className={`
                flex
                h-11
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium

                ${
                  isDark
                    ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              <Search className="h-[18px] w-[18px]" />
              Browse Properties
            </Link>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`
                mt-1.5
                flex
                h-11
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium

                ${
                  isDark
                    ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              <Home className="h-[18px] w-[18px]" />
              Back to Home
            </Link>
          </div>

          {/* MOBILE ACCOUNT */}

          <div className="mt-9">
            <p
              className={`
                mb-3
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]

                ${
                  isDark
                    ? "text-zinc-600"
                    : "text-slate-400"
                }
              `}
            >
              Account
            </p>

            <Link
              href="/dashboard/tenant/profile"
              onClick={() => setMobileOpen(false)}
              className={`
                flex
                h-11
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium

                ${
                  pathname === "/dashboard/tenant/profile"
                    ? "bg-orange-500 text-white"
                    : isDark
                    ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              <CircleUserRound className="h-[18px] w-[18px]" />
              Profile
            </Link>

            <Link
              href="/dashboard/tenant/settings"
              onClick={() => setMobileOpen(false)}
              className={`
                mt-1.5
                flex
                h-11
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium

                ${
                  pathname === "/dashboard/tenant/settings"
                    ? "bg-orange-500 text-white"
                    : isDark
                    ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              <Settings className="h-[18px] w-[18px]" />
              Settings
            </Link>
          </div>
        </nav>

        {/* MOBILE LOGOUT */}

        <div
          className={`
            border-t
            p-3

            ${
              isDark
                ? "border-zinc-800"
                : "border-slate-100"
            }
          `}
        >
          <button
            type="button"
            onClick={handleLogout}
            className={`
              flex
              h-11
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-medium

              ${
                isDark
                  ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  : "text-slate-500 hover:bg-red-50 hover:text-red-500"
              }
            `}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-300

          ${
            collapsed
              ? "lg:pl-[78px]"
              : "lg:pl-[255px]"
          }
        `}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className={`
            sticky
            top-0
            z-40
            flex
            h-[72px]
            items-center
            justify-between
            border-b
            px-4
            backdrop-blur-xl
            transition-colors
            duration-300

            sm:px-6
            lg:px-8

            ${
              isDark
                ? "border-zinc-800 bg-[#09090b]/95"
                : "border-slate-200 bg-[#f7f5ef]/95"
            }
          `}
        >
          {/* HEADER LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                lg:hidden

                ${
                  isDark
                    ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                    : "border-slate-200 bg-white text-slate-600"
                }
              `}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* SEARCH */}

            <div
              className={`
                hidden
                h-10
                w-[280px]
                items-center
                gap-2
                rounded-xl
                border
                px-3
                sm:flex

                ${
                  isDark
                    ? "border-zinc-700 bg-zinc-900"
                    : "border-slate-200 bg-white"
                }
              `}
            >
              <Search
                size={17}
                className={
                  isDark
                    ? "text-zinc-500"
                    : "text-slate-400"
                }
              />

              <span
                className={`
                  text-xs

                  ${
                    isDark
                      ? "text-zinc-500"
                      : "text-slate-400"
                  }
                `}
              >
                Search dashboard...
              </span>
            </div>

            {/* MOBILE PAGE TITLE */}

            <div className="sm:hidden">
              <p
                className={`
                  text-sm
                  font-semibold

                  ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                {getPageTitle()}
              </p>
            </div>
          </div>

          {/* HEADER RIGHT */}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* BROWSE */}

            <Link
              href="/properties"
              className={`
                hidden
                items-center
                gap-2
                rounded-xl
                px-4
                py-2.5
                text-xs
                font-semibold
                transition
                md:flex

                ${
                  isDark
                    ? "bg-white text-slate-950 hover:bg-zinc-200"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }
              `}
            >
              <Search size={15} />
              Browse
            </Link>

            {/* THEME TOGGLE */}

            <ThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />

            {/* USER NAME */}

            <div className="hidden text-right sm:block">
              <p
                className={`
                  max-w-[150px]
                  truncate
                  text-xs
                  font-semibold

                  ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                {user?.name || "Tenant"}
              </p>

              <p
                className={`
                  text-[10px]

                  ${
                    isDark
                      ? "text-zinc-500"
                      : "text-slate-400"
                  }
                `}
              >
                Tenant
              </p>
            </div>

            {/* USER AVATAR */}

            <div
              className={`
                relative
                h-9
                w-9
                overflow-hidden
                rounded-full
                border

                ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-slate-200 bg-white"
                }
              `}
            >
              {tenantPhoto ? (
                <Image
                  src={tenantPhoto}
                  alt={user?.name || "Tenant"}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-semibold text-orange-600">
                    {tenantInitial}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className={`
            min-h-[calc(100vh-72px)]
            w-full
            overflow-x-hidden
            transition-colors
            duration-300

            ${
              isDark
                ? "bg-[#09090b]"
                : "bg-[#f7f5ef]"
            }
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}