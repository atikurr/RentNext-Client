"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Building2,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "All Properties",
    href: "/dashboard/admin/properties",
    icon: Building2,
  },
  {
    label: "All Bookings",
    href: "/dashboard/admin/bookings",
    icon: CalendarCheck2,
  },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: WalletCards,
  },
];

/*
|--------------------------------------------------------------------------
| THEME TOGGLE
|--------------------------------------------------------------------------
*/

function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;

    const isDark =
      root.classList.contains("dark");

    const nextTheme = isDark
      ? "light"
      : "dark";

    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");

      root.setAttribute(
        "data-theme",
        "dark"
      );

      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");

      root.setAttribute(
        "data-theme",
        "light"
      );

      root.style.colorScheme = "light";
    }

    localStorage.setItem(
      "property-rental-theme",
      nextTheme
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className="
        group
        relative
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        text-slate-600
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:bg-slate-50
        hover:text-slate-950
        active:translate-y-0
        dark:border-zinc-700
        dark:bg-zinc-900
        dark:text-zinc-300
        dark:hover:border-zinc-600
        dark:hover:bg-zinc-800
        dark:hover:text-white
      "
    >
      <Sun
        className="
          absolute
          h-[18px]
          w-[18px]
          rotate-0
          scale-100
          transition-all
          duration-300
          dark:-rotate-90
          dark:scale-0
        "
      />

      <Moon
        className="
          absolute
          h-[18px]
          w-[18px]
          rotate-90
          scale-0
          transition-all
          duration-300
          dark:rotate-0
          dark:scale-100
        "
      />

      <span className="sr-only">
        Toggle light and dark mode
      </span>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD LAYOUT
|--------------------------------------------------------------------------
*/

export default function AdminDashboardLayout({
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | ADMIN AUTHORIZATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        const session =
          await authClient.getSession();

        if (!mounted) {
          return;
        }

        const currentUser =
          session?.data?.user;

        /*
        |--------------------------------------------------------------------------
        | NOT LOGGED IN
        |--------------------------------------------------------------------------
        */

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROLE CHECK
        |--------------------------------------------------------------------------
        */

        if (
          currentUser.role !== "admin"
        ) {
          if (
            currentUser.role === "owner"
          ) {
            router.replace(
              "/dashboard/owner"
            );
          } else {
            router.replace(
              "/dashboard/tenant"
            );
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Admin authorization error:",
          error
        );

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | LOAD SAVED THEME
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem(
          "property-rental-theme"
        );

      const root =
        document.documentElement;

      if (savedTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");

        root.setAttribute(
          "data-theme",
          "dark"
        );

        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");

        root.setAttribute(
          "data-theme",
          "light"
        );

        root.style.colorScheme = "light";
      }
    } catch (error) {
      console.error(
        "Theme initialization error:",
        error
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ACTIVE NAVIGATION
  |--------------------------------------------------------------------------
  */

  const isActive = (href) => {
    if (
      href === "/dashboard/admin"
    ) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  /*
  |--------------------------------------------------------------------------
  | PAGE TITLE
  |--------------------------------------------------------------------------
  */

  const getPageTitle = () => {
    if (
      pathname.includes("/users")
    ) {
      return "Users";
    }

    if (
      pathname.includes("/properties")
    ) {
      return "All Properties";
    }

    if (
      pathname.includes("/bookings")
    ) {
      return "All Bookings";
    }

    if (
      pathname.includes("/transactions")
    ) {
      return "Transactions";
    }

    if (
      pathname.includes("/profile")
    ) {
      return "Profile";
    }

    if (
      pathname.includes("/settings")
    ) {
      return "Settings";
    }

    return "Overview";
  };

  /*
  |--------------------------------------------------------------------------
  | ADMIN DATA
  |--------------------------------------------------------------------------
  */

  const adminInitial =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() || "A";

  const adminPhoto =
    user?.photo ||
    user?.image ||
    "";

  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING
  |--------------------------------------------------------------------------
  */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 dark:bg-white">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-400/30 dark:border-t-zinc-950" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-zinc-200">
            Checking administrator access...
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          border-r
          border-zinc-800
          bg-[#09090b]
          transition-[width]
          duration-300
          lg:flex
          lg:flex-col
          ${
            collapsed
              ? "w-[76px]"
              : "w-[250px]"
          }
        `}
      >

        {/* BRAND */}

        <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 px-4">
          <Link
            href="/dashboard/admin"
            className={`
              flex
              min-w-0
              items-center
              gap-3
              ${
                collapsed
                  ? "w-full justify-center"
                  : ""
              }
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950">
              PR
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  PropertyRent
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  Admin Portal
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Management
            </p>
          )}

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  onClick={() =>
                    setMobileOpen(false)
                  }
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
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px]
                      w-[18px]
                      shrink-0
                      ${
                        active
                          ? "text-slate-950"
                          : "text-slate-400 group-hover:text-white"
                      }
                    `}
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ACCOUNT */}

          {!collapsed && (
            <div className="mt-8">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Account
              </p>

              <Link
                href="/dashboard/admin/profile"
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
                    "/dashboard/admin/profile"
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <CircleUserRound className="h-[18px] w-[18px]" />

                Profile
              </Link>

              <Link
                href="/dashboard/admin/settings"
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
                    "/dashboard/admin/settings"
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Settings className="h-[18px] w-[18px]" />

                Settings
              </Link>
            </div>
          )}
        </nav>

        {/* ADMIN ACCOUNT */}

        <div className="shrink-0 border-t border-white/10 p-3">
          <div
            className={`
              flex
              items-center
              rounded-xl
              bg-white/[0.04]
              ${
                collapsed
                  ? "justify-center p-2"
                  : "gap-3 px-2.5 py-2"
              }
            `}
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white">
              {adminPhoto ? (
                <Image
                  src={adminPhoto}
                  alt={
                    user?.name ||
                    "Administrator"
                  }
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-950">
                  {adminInitial}
                </div>
              )}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {user?.name ||
                      "Administrator"}
                  </p>

                  <p className="truncate text-[10px] text-slate-500">
                    Administrator
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (value) => !value
            )
          }
          className="
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
            border-slate-200
            bg-white
            text-slate-600
            shadow-sm
            transition
            hover:bg-slate-50
            dark:border-zinc-700
            dark:bg-zinc-900
            dark:text-zinc-300
            dark:hover:bg-zinc-800
          "
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[70]
          flex
          w-[270px]
          flex-col
          bg-[#09090b]
          shadow-2xl
          transition-transform
          duration-300
          lg:hidden
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* MOBILE BRAND */}

        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950">
              PR
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                PropertyRent
              </p>

              <p className="text-[11px] text-slate-500">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MOBILE NAV */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Management
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
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
                      active
                        ? "bg-white text-slate-950"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px]" />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* MOBILE ACCOUNT */}

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Account
            </p>

            <Link
              href="/dashboard/admin/profile"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <CircleUserRound className="h-[18px] w-[18px]" />

              Profile
            </Link>

            <Link
              href="/dashboard/admin/settings"
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-1.5 flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-[18px] w-[18px]" />

              Settings
            </Link>
          </div>
        </nav>

        {/* MOBILE ADMIN */}

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white">
              {adminPhoto ? (
                <Image
                  src={adminPhoto}
                  alt={
                    user?.name ||
                    "Administrator"
                  }
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-950">
                  {adminInitial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name ||
                  "Administrator"}
              </p>

              <p className="text-[10px] text-slate-500">
                Admin Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />

            Logout
          </button>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-300
          ${
            collapsed
              ? "lg:pl-[76px]"
              : "lg:pl-[250px]"
          }
        `}
      >

        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-40
            flex
            h-[72px]
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white/95
            px-4
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-zinc-800
            dark:bg-zinc-950/95
            sm:px-6
            lg:px-8
          "
        >

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                transition-all
                duration-200
                hover:bg-slate-50
                hover:text-slate-950
                dark:border-zinc-700
                dark:bg-zinc-900
                dark:text-zinc-300
                dark:hover:bg-zinc-800
                dark:hover:text-white
                lg:hidden
              "
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* BREADCRUMB */}

            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="text-slate-400 dark:text-zinc-500">
                Dashboard
              </span>

              <span className="text-slate-300 dark:text-zinc-700">
                /
              </span>

              <span className="font-medium text-slate-700 dark:text-zinc-200">
                {getPageTitle()}
              </span>
            </div>

            {/* MOBILE TITLE */}

            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* THEME TOGGLE */}

            <ThemeToggle />

            {/* ADMIN NAME */}

            <div className="hidden text-right sm:block">
              <p className="max-w-[160px] truncate text-xs font-semibold uppercase text-slate-900 dark:text-white">
                {user?.name ||
                  "Administrator"}
              </p>

              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Administrator
              </p>
            </div>

            {/* ADMIN IMAGE */}

            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800">
              {adminPhoto ? (
                <Image
                  src={adminPhoto}
                  alt={
                    user?.name ||
                    "Administrator"
                  }
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                    {adminInitial}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <main className="min-h-[calc(100vh-72px)] w-full overflow-x-hidden bg-slate-50 transition-colors duration-300 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}