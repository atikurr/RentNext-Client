
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const THEME_KEY = "property-rental-theme";

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
    label: "Properties",
    href: "/dashboard/admin/properties",
    icon: Building2,
  },
  {
    label: "Bookings",
    href: "/dashboard/admin/bookings",
    icon: CalendarCheck2,
  },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
];

const accountNavigation = [
  {
    label: "Profile",
    href: "/dashboard/admin/profile",
    icon: CircleUserRound,
  },
  {
    label: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

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

    const nextTheme =
      currentTheme === "dark" ? "light" : "dark";

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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <Sun className="h-[18px] w-[18px] dark:hidden" />
      <Moon className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}

function Brand({ onNavigate, collapsed = false }) {
  return (
    <Link
      href="/dashboard/admin"
      onClick={onNavigate}
      className={`flex h-[64px] shrink-0 items-center border-b border-slate-200 px-4 dark:border-zinc-800 ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-extrabold text-white shadow-md shadow-orange-500/20">
        PR
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            PropertyRent
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
            Admin Portal
          </p>
        </div>
      )}
    </Link>
  );
}

function AdminAvatar({ user }) {
  const image = user?.image || user?.photo;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800">
      {image ? (
        <Image
          src={image}
          alt={user?.name || "Admin"}
          fill
          sizes="36px"
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

function SidebarNavigation({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}) {
  return (
    <div className="space-y-1">
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/dashboard/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={`group flex h-10 items-center rounded-xl text-[13px] font-medium transition-all duration-200 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              active
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active
                  ? "text-white"
                  : "text-slate-500 group-hover:text-orange-500 dark:text-zinc-400 dark:group-hover:text-orange-400"
              }`}
            />

            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Load saved theme
  useEffect(() => {
    let theme = "light";

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

  // Verify admin access
  useEffect(() => {
    let active = true;

    async function checkAdminAccess() {
      try {
        const session = await authClient.getSession();

        if (!active) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "admin") {
          router.replace(
            currentUser.role === "owner"
              ? "/dashboard/owner"
              : "/dashboard/tenant"
          );
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Admin authentication error:", error);

        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    checkAdminAccess();

    return () => {
      active = false;
    };
  }, [router]);

  // Close mobile menu after navigation
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
    const match = [...navigation, ...accountNavigation]
      .filter((item) => item.href !== "/dashboard/admin")
      .find(
        (item) =>
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`)
      );

    if (match) return match.label;

    return pathname === "/dashboard/admin"
      ? "Overview"
      : "Admin Dashboard";
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] dark:bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-zinc-200">
            Checking account access...
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

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-slate-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:flex ${
          collapsed ? "w-[76px]" : "w-[230px]"
        }`}
      >
        <Brand collapsed={collapsed} />

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-zinc-500">
              Management
            </p>
          )}

          <SidebarNavigation
            items={navigation}
            pathname={pathname}
            collapsed={collapsed}
          />

          <div className="my-5 border-t border-slate-200 dark:border-zinc-800" />

          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-zinc-500">
              Account
            </p>
          )}

          <SidebarNavigation
            items={accountNavigation}
            pathname={pathname}
            collapsed={collapsed}
          />
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-zinc-800">
          <div
            className={`flex items-center rounded-xl bg-slate-50 dark:bg-zinc-900 ${
              collapsed ? "justify-center p-2" : "gap-2.5 px-2 py-2"
            }`}
          >
            <AdminAvatar user={user} />

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {user.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Admin Account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
          className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[260px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pr-3">
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

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
            Management
          </p>

          <SidebarNavigation
            items={navigation}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />

          <div className="my-5 border-t border-slate-200 dark:border-zinc-800" />

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
            Account
          </p>

          <SidebarNavigation
            items={accountNavigation}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-zinc-900">
            <AdminAvatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user.name || "Administrator"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Admin Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[230px]"
        }`}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white/95 px-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-slate-400 dark:text-zinc-500 sm:inline">
                  Admin
                </span>
                <span className="hidden text-slate-300 dark:text-zinc-700 sm:inline">
                  /
                </span>
                <span className="truncate font-semibold text-slate-800 dark:text-zinc-100">
                  {getPageTitle()}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-zinc-500 sm:hidden">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <div className="hidden h-7 border-l border-slate-200 dark:border-zinc-800 sm:block" />

            <div className="hidden text-right sm:block">
              <p className="max-w-[150px] truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user.name || "Administrator"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                Administrator
              </p>
            </div>

            <AdminAvatar user={user} />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-60px)] w-full overflow-x-hidden bg-[#f7f5ef] text-slate-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
          {children}
        </main>
      </div>
    </div>
  );
}
