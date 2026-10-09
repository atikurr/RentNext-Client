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
  PlusCircle,
  Settings,
  Sun,
  X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard/owner",
    icon: LayoutDashboard,
  },
  {
    label: "Add Property",
    href: "/dashboard/owner/add-property",
    icon: PlusCircle,
  },
  {
    label: "My Properties",
    href: "/dashboard/owner/properties",
    icon: Building2,
  },
  {
    label: "Booking Requests",
    href: "/dashboard/owner/booking-requests",
    icon: CalendarCheck2,
  },
];

const accountNavigation = [
  {
    label: "Profile",
    href: "/dashboard/owner/profile",
    icon: CircleUserRound,
  },
  {
    label: "Settings",
    href: "/dashboard/owner/settings",
    icon: Settings,
  },
];

/* =========================================================
   THEME TOGGLE
   No setState inside useEffect
========================================================= */

function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("light", nextTheme === "light");
    root.setAttribute("data-theme", nextTheme);
    root.style.colorScheme = nextTheme;

    try {
      localStorage.setItem("property-rental-theme", nextTheme);
    } catch (error) {
      console.error("Theme saving error:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title="Toggle theme"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:translate-y-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-orange-500/50 dark:hover:bg-zinc-800"
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" />
      <Moon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}

/* =========================================================
   BRAND
========================================================= */

function Brand({ collapsed = false, onNavigate }) {
  return (
    <Link
      href="/dashboard/owner"
      onClick={onNavigate}
      className={`flex h-[72px] shrink-0 items-center border-b border-white/10 px-4 ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20">
        PR
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            PropertyRent
          </p>

          <p className="mt-0.5 text-[11px] text-zinc-400">
            Owner Portal
          </p>
        </div>
      )}
    </Link>
  );
}

/* =========================================================
   OWNER AVATAR
========================================================= */

function OwnerAvatar({ user, size = "h-9 w-9" }) {
  const photo = user?.photo || user?.image || "";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "O";

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={user?.name || "Owner"}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
          {initial}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

function SidebarNavigation({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon;

        const active =
          item.href === "/dashboard/owner"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={`group relative flex h-11 items-center rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              active
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active
                  ? "text-white"
                  : "text-zinc-400 group-hover:text-orange-400"
              }`}
            />

            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/* =========================================================
   OWNER DASHBOARD LAYOUT
========================================================= */

export default function OwnerDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* =======================================================
     OWNER AUTHORIZATION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkOwnerAccess = async () => {
      try {
        const session = await authClient.getSession();

        if (!mounted) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "owner") {
          if (currentUser.role === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/tenant");
          }

          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Owner authorization error:", error);

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkOwnerAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     LOAD SAVED THEME
     No React state update in this effect
  ======================================================= */

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(
        "property-rental-theme"
      );

      const theme =
        savedTheme === "dark" ? "dark" : "light";

      const root = document.documentElement;

      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("light", theme === "light");
      root.setAttribute("data-theme", theme);
      root.style.colorScheme = theme;
    } catch (error) {
      console.error("Theme initialization error:", error);
    }
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  const getPageTitle = () => {
    if (pathname.includes("booking-requests")) {
      return "Booking Requests";
    }

    if (pathname.includes("add-property")) {
      return "Add Property";
    }

    if (pathname.includes("properties")) {
      return "My Properties";
    }

    if (pathname.includes("profile")) {
      return "Profile";
    }

    if (pathname.includes("settings")) {
      return "Settings";
    }

    return "Overview";
  };

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] dark:bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Checking account access...
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
      <div className="min-h-screen bg-[#f7f5ef] dark:bg-zinc-950" />
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f5ef] font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      {/* DESKTOP SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-zinc-800 bg-[#09090b] transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? "w-[76px]" : "w-[250px]"
        }`}
      >
        <Brand collapsed={collapsed} />

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Management
            </p>
          )}

          <SidebarNavigation
            items={navigation}
            pathname={pathname}
            collapsed={collapsed}
          />

          <div className="mt-8">
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Account
              </p>
            )}

            <SidebarNavigation
              items={accountNavigation}
              pathname={pathname}
              collapsed={collapsed}
            />
          </div>
        </nav>

        {/* DESKTOP OWNER ACCOUNT */}

        <div className="shrink-0 border-t border-white/10 p-3">
          <div
            className={`flex items-center rounded-xl bg-white/[0.04] ${
              collapsed ? "justify-center p-2" : "gap-3 px-2.5 py-2"
            }`}
          >
            <OwnerAvatar user={user} />

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {user.name || "Property Owner"}
                  </p>

                  <p className="truncate text-[10px] text-zinc-500">
                    Owner Account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* COLLAPSE BUTTON */}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[78px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[270px] flex-col bg-[#09090b] shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 pr-3">
          <Brand onNavigate={() => setMobileOpen(false)} />

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Management
          </p>

          <SidebarNavigation
            items={navigation}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Account
            </p>

            <SidebarNavigation
              items={accountNavigation}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </nav>

        {/* MOBILE OWNER ACCOUNT */}

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <OwnerAvatar user={user} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user.name || "Property Owner"}
              </p>

              <p className="text-[10px] text-zinc-500">
                Owner Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"
        }`}
      >
        {/* HEADER */}

        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="text-slate-400 dark:text-zinc-500">
                Dashboard
              </span>

              <span className="text-slate-300 dark:text-zinc-700">
                /
              </span>

              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {getPageTitle()}
              </span>
            </div>

            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </p>

              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Owner Portal
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="max-w-[160px] truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user.name || "Property Owner"}
              </p>

              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Owner
              </p>
            </div>

            <OwnerAvatar user={user} />
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)] w-full overflow-x-hidden bg-[#f7f5ef] transition-colors duration-300 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}