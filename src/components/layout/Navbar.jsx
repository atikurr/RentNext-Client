"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Building2,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const profileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // =====================================================
  // LOAD SESSION
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } =
          await authClient.getSession();

        if (!mounted) return;

        if (error) {
          setUser(null);
          return;
        }

        const currentUser = data?.user || null;

        // Admin should stay inside admin dashboard.
        if (
          currentUser?.role?.toLowerCase() === "admin"
        ) {
          setUser(null);
          router.replace("/dashboard/admin");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Navbar session error:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // =====================================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // ESC KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================================
  // DASHBOARD PATH
  // =====================================================

  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();

    if (role === "owner") {
      return "/dashboard/owner";
    }

    return "/dashboard/tenant";
  };

  // =====================================================
  // ACTIVE NAV
  // =====================================================

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return (
      pathname === path ||
      pathname?.startsWith(`${path}/`)
    );
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const profileImage =
    user?.image ||
    user?.photo ||
    user?.profileImage ||
    user?.avatar ||
    null;

  const userName =
    user?.name ||
    user?.fullName ||
    "User";

  const userEmail =
    user?.email ||
    "";

  const userRole =
    user?.role?.toLowerCase() ||
    "tenant";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() ||
    "U";

  // =====================================================
  // DASHBOARD CLICK
  // =====================================================

  const handleDashboardClick = () => {
    setProfileOpen(false);
    setMobileOpen(false);

    router.push(getDashboardPath());
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      setUser(null);
      setProfileOpen(false);
      setMobileOpen(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  // =====================================================
  // CLOSE MOBILE
  // =====================================================

  const closeMobile = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  // =====================================================
  // NAV ITEM CLASS
  // =====================================================

  const navItemClass = (active) =>
    `group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
      active
        ? "bg-orange-50 text-orange-500"
        : "text-slate-700 hover:bg-white/80 hover:text-orange-500"
    }`;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            NAVBAR CONTAINER
        ================================================== */}

        <div className="rounded-[24px] border border-white/70 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150">

          <div className="flex h-[72px] items-center px-4 sm:px-6 lg:px-7">

            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              href="/"
              onClick={closeMobile}
              className="shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src="/assets/logo.png"
                alt="RentNest"
                width={190}
                height={60}
                priority
                className="h-auto w-[140px] object-contain sm:w-[155px]"
              />
            </Link>

            {/* =================================================
                DESKTOP CENTER NAVIGATION
            ================================================== */}

            <nav className="mx-auto hidden items-center gap-1 lg:flex">

              {/* HOME */}

              <Link
                href="/"
                className={navItemClass(
                  isActive("/")
                )}
              >
                <Home
                  size={16}
                  strokeWidth={2}
                />

                <span>
                  Home
                </span>

                {isActive("/") && (
                  <span className="absolute bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-orange-500" />
                )}
              </Link>

              {/* ALL PROPERTIES */}

              <Link
                href="/properties"
                className={navItemClass(
                  isActive("/properties")
                )}
              >
                <Building2
                  size={16}
                  strokeWidth={2}
                />

                <span>
                  All Properties
                </span>

                {isActive("/properties") && (
                  <span className="absolute bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-orange-500" />
                )}
              </Link>

              {/* DASHBOARD
                  Only Owner/Tenant
              */}

              {!loading && user && (
                <button
                  type="button"
                  onClick={handleDashboardClick}
                  className={navItemClass(
                    pathname?.startsWith(
                      "/dashboard"
                    )
                  )}
                >
                  <LayoutDashboard
                    size={16}
                    strokeWidth={2}
                  />

                  <span>
                    Dashboard
                  </span>

                  {pathname?.startsWith(
                    "/dashboard"
                  ) && (
                    <span className="absolute bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-orange-500" />
                  )}
                </button>
              )}
            </nav>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="ml-auto hidden items-center lg:flex">

              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200/70" />

                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200/70" />
                </div>
              ) : user ? (
                <div
                  ref={profileRef}
                  className="relative"
                >

                  {/* =========================================
                      PROFILE TRIGGER
                  ========================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      setProfileOpen(
                        (previous) =>
                          !previous
                      )
                    }
                    className="group flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:border-orange-200 hover:bg-white hover:shadow-md"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >

                    {/* AVATAR */}

                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={userName}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-orange-50 text-sm font-bold text-orange-500">
                          {userInitial}
                        </div>
                      )}
                    </div>

                    {/* NAME */}

                    <div className="max-w-[130px] text-left">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {userName}
                      </p>

                      <p className="text-[10px] font-medium capitalize text-slate-400">
                        {userRole}
                      </p>
                    </div>

                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-slate-400 transition-transform duration-300 group-hover:text-orange-500 ${
                        profileOpen
                          ? "rotate-180 text-orange-500"
                          : ""
                      }`}
                    />
                  </button>

                  {/* =========================================
                      PROFILE DROPDOWN
                  ========================================== */}

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-[calc(100%+12px)] w-[270px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
                      role="menu"
                    >

                      {/* PROFILE HEADER */}

                      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-orange-50">
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                alt={userName}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-orange-500">
                                {userInitial}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {userName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {userEmail}
                            </p>

                            <span className="mt-2 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-orange-500">
                              {userRole}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* MENU ITEMS */}

                      <div className="p-2">

                        {/* DASHBOARD */}

                        <button
                          type="button"
                          onClick={handleDashboardClick}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-orange-500"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <LayoutDashboard
                              size={17}
                            />
                          </span>

                          <span>
                            Dashboard
                          </span>
                        </button>

                        {/* PROFILE */}

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);

                            // Profile page can be connected
                            // later for Owner/Tenant.
                            router.push(
                              "/dashboard/tenant/profile"
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-orange-500"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <User size={17} />
                          </span>

                          <span>
                            Profile
                          </span>
                        </button>

                        <div className="my-2 border-t border-slate-100" />

                        {/* LOGOUT */}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                            <LogOut
                              size={17}
                            />
                          </span>

                          <span>
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">

                  {/* LOGIN */}

                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-orange-500"
                  >
                    <LogIn size={16} />

                    Login
                  </Link>

                  {/* REGISTER */}

                  <Link
                    href="/register"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    <UserPlus size={16} />

                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* =================================================
                MOBILE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (previous) => !previous
                )
              }
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 transition hover:border-orange-200 hover:text-orange-500 lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE MENU
          ================================================== */}

          {mobileOpen && (
            <div className="border-t border-slate-100 bg-white/95 px-4 pb-4 backdrop-blur-2xl lg:hidden">

              <div className="space-y-1 pt-3">

                {/* HOME */}

                <Link
                  href="/"
                  onClick={closeMobile}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive("/")
                      ? "bg-orange-50 text-orange-500"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Home size={18} />

                  Home
                </Link>

                {/* ALL PROPERTIES */}

                <Link
                  href="/properties"
                  onClick={closeMobile}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive("/properties")
                      ? "bg-orange-50 text-orange-500"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Building2 size={18} />

                  All Properties
                </Link>

                {/* DASHBOARD */}

                {!loading && user && (
                  <button
                    type="button"
                    onClick={handleDashboardClick}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      pathname?.startsWith(
                        "/dashboard"
                      )
                        ? "bg-orange-50 text-orange-500"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutDashboard size={18} />

                    Dashboard
                  </button>
                )}

                <div className="my-2 border-t border-slate-100" />

                {/* LOGGED IN */}

                {user ? (
                  <>

                    {/* MOBILE USER */}

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">

                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-orange-50">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt={userName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-orange-500">
                            {userInitial}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {userName}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />

                      Logout
                    </button>
                  </>
                ) : (
                  <>

                    {/* LOGIN */}

                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogIn size={18} />

                      Login
                    </Link>

                    {/* REGISTER */}

                    <Link
                      href="/register"
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white"
                    >
                      <UserPlus size={18} />

                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}