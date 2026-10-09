
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

const THEME_KEY = "property-rental-theme";

const navigation = [
  { label: "Dashboard", href: "/dashboard/owner", icon: LayoutDashboard },
  { label: "Add Property", href: "/dashboard/owner/add-property", icon: PlusCircle },
  { label: "My Properties", href: "/dashboard/owner/properties", icon: Building2 },
  { label: "Booking Requests", href: "/dashboard/owner/booking-requests", icon: CalendarCheck2 },
];

const accountNavigation = [
  { label: "Profile", href: "/dashboard/owner/profile", icon: CircleUserRound },
  { label: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

/* THEME */

function applyTheme(theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;

    const currentTheme = root.classList.contains("dark")
      ? "dark"
      : "light";

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
      console.error("Theme saving error:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark")
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      aria-label="Toggle theme"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </button>
  );
}

/* BRAND */

function Brand({ onNavigate, collapsed = false }) {
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
        <div>
          <p className="text-sm font-bold text-white">PropertyRent</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">Owner Portal</p>
        </div>
      )}
    </Link>
  );
}

/* AVATAR */

function OwnerAvatar({ user }) {
  const image = user?.image || user?.photo;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "O";

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800">
      {image ? (
        <Image
          src={image}
          alt={user?.name || "Owner"}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {initial}
        </span>
      )}
    </div>
  );
}

/* NAVIGATION */

function SidebarNavigation({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}) {
  return (
    <div className="space-y-1.5">
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/dashboard/owner"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`group flex h-11 items-center rounded-xl text-sm font-medium transition-all duration-200 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              active
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? "text-white" : "text-zinc-400 group-hover:text-orange-400"
              }`}
            />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

/* OWNER LAYOUT */

export default function OwnerDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* Load saved theme without setState inside effect */

  useEffect(() => {
    let theme = "dark";

    try {
      const savedTheme = localStorage.getItem(THEME_KEY);

      if (savedTheme === "light" || savedTheme === "dark") {
        theme = savedTheme;
      }
    } catch (error) {
      console.error("Theme loading error:", error);
    }

    applyTheme(theme);
  }, []);

  /* Owner authentication */

  useEffect(() => {
    let active = true;

    async function checkOwnerAccess() {
      try {
        const session = await authClient.getSession();

        if (!active) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "owner") {
          router.replace(
            currentUser.role === "admin"
              ? "/dashboard/admin"
              : "/dashboard/tenant"
          );
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Owner authentication error:", error);

        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    checkOwnerAccess();

    return () => {
      active = false;
    };
  }, [router]);

  /* Close mobile navigation on route change */

 useEffect(() => {
  if (!mobileOpen) return;

  const frame = requestAnimationFrame(() => {
    setMobileOpen(false);
  });

  return () => cancelAnimationFrame(frame);
}, [pathname]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getPageTitle = () => {
    if (pathname.includes("booking-requests")) return "Booking Requests";
    if (pathname.includes("add-property")) return "Add Property";
    if (pathname.includes("properties")) return "My Properties";
    if (pathname.includes("profile")) return "Profile";
    if (pathname.includes("settings")) return "Settings";

    return "Overview";
  };

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
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-[#f7f5ef] dark:bg-zinc-950" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      {/* DESKTOP SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:flex ${
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

        <div className="border-t border-white/10 p-3">
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
                  <p className="text-[10px] text-zinc-400">Owner Account</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[78px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
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
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[270px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pr-3 dark:border-zinc-800">
          <Brand onNavigate={() => setMobileOpen(false)} />

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
            Management
          </p>

          <SidebarNavigation
            items={navigation}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
              Account
            </p>

            <SidebarNavigation
              items={accountNavigation}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-zinc-900">
            <OwnerAvatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user.name || "Property Owner"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Owner Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"
        }`}
      >
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="text-slate-400 dark:text-zinc-500">
                Dashboard
              </span>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {getPageTitle()}
              </span>
            </div>

            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">
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
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                Owner
              </p>
            </div>

            <OwnerAvatar user={user} />
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] w-full overflow-x-hidden bg-[#f7f5ef] text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
          {children}
        </main>
      </div>
    </div>
  );
}
