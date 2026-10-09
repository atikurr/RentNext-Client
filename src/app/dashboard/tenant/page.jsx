"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Heart,
  Home,
  MapPin,
  Search,
  Building2,
  TrendingUp,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function TenantDashboard() {
  const [user, setUser] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  const [favorites, setFavorites] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          const session =
            await authClient.getSession();

          const currentUser =
            session?.data?.user;

          if (!currentUser) {
            return;
          }

          if (mounted) {
            setUser(currentUser);
          }

          /* TOKEN */

          let token = null;

          try {
            const tokenResponse =
              await authClient.token();

            token =
              tokenResponse?.data
                ?.token ||
              tokenResponse?.token ||
              null;
          } catch (error) {
            console.warn(
              "Token could not be loaded:",
              error
            );
          }

          const headers = {
            "Content-Type":
              "application/json",
          };

          if (token) {
            headers.Authorization =
              `Bearer ${token}`;
          }

          /* =================================================
             BOOKINGS
          ================================================= */

          try {
            const response =
              await fetch(
                `${API_URL}/api/bookings/my-bookings`,
                {
                  method: "GET",
                  headers,
                  credentials:
                    "include",
                }
              );

            if (response.ok) {
              const data =
                await response.json();

              const list =
                data?.bookings ||
                data?.data ||
                data ||
                [];

              if (mounted) {
                setBookings(
                  Array.isArray(list)
                    ? list
                    : []
                );
              }
            } else {
              console.warn(
                "Bookings request failed:",
                response.status
              );
            }
          } catch (error) {
            console.error(
              "Bookings error:",
              error
            );
          }

          /* =================================================
             FAVORITES
          ================================================= */

          try {
            const response =
              await fetch(
                `${API_URL}/api/favorites`,
                {
                  method: "GET",
                  headers,
                  credentials:
                    "include",
                }
              );

            if (response.ok) {
              const data =
                await response.json();

              const list =
                data?.favorites ||
                data?.data ||
                data ||
                [];

              if (mounted) {
                setFavorites(
                  Array.isArray(list)
                    ? list
                    : []
                );
              }
            } else {
              console.warn(
                "Favorites request failed:",
                response.status
              );
            }
          } catch (error) {
            console.error(
              "Favorites error:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Dashboard error:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const totalBookings =
    bookings.length;

  const pendingBookings =
    bookings.filter(
      (item) =>
        item?.status?.toLowerCase() ===
        "pending"
    ).length;

  const approvedBookings =
    bookings.filter(
      (item) =>
        item?.status?.toLowerCase() ===
        "approved"
    ).length;

  const totalPaid =
    bookings
      .filter(
        (item) =>
          item?.paymentStatus?.toLowerCase() ===
          "paid"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item?.totalAmount ||
              item?.amount ||
              0
          ),
        0
      );

  /* =======================================================
     HELPERS
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
    } catch {
      return "N/A";
    }
  };

  const formatAmount = (amount) => {
    return `৳${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  const getStatusClass = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "approved":
        return `
          border-green-200
          bg-green-50
          text-green-700

          dark:border-green-500/20
          dark:bg-green-500/10
          dark:text-green-400
        `;

      case "pending":
        return `
          border-orange-200
          bg-orange-50
          text-orange-700

          dark:border-orange-500/20
          dark:bg-orange-500/10
          dark:text-orange-400
        `;

      case "rejected":
        return `
          border-red-200
          bg-red-50
          text-red-700

          dark:border-red-500/20
          dark:bg-red-500/10
          dark:text-red-400
        `;

      default:
        return `
          border-slate-200
          bg-slate-50
          text-slate-600

          dark:border-zinc-700
          dark:bg-zinc-800
          dark:text-zinc-400
        `;
    }
  };

  /* =======================================================
     PROPERTY DATA HELPERS
  ======================================================= */

  const getProperty = (
    booking
  ) => {
    return (
      booking?.property || {}
    );
  };

  const getPropertyTitle = (
    booking
  ) => {
    const property =
      getProperty(booking);

    return (
      property?.title ||
      booking?.propertyTitle ||
      "Property"
    );
  };

  const getPropertyLocation = (
    booking
  ) => {
    const property =
      getProperty(booking);

    return (
      property?.location ||
      "Location unavailable"
    );
  };

  const getPropertyImage = (
    booking
  ) => {
    const property =
      getProperty(booking);

    return property?.image || "";
  };

  /* =======================================================
     FAVORITE DATA
  ======================================================= */

  const getFavoriteProperty = (
    favorite
  ) => {
    return (
      favorite?.property ||
      favorite ||
      {}
    );
  };

  const getFavoriteId = (
    favorite
  ) => {
    const property =
      getFavoriteProperty(
        favorite
      );

    return (
      property?._id ||
      property?.id ||
      favorite?.propertyId ||
      ""
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        min-h-[calc(100vh-72px)]
        bg-[#f7f5ef]
        px-4
        py-5
        transition-colors
        duration-300

        dark:bg-[#09090b]

        sm:px-6
        lg:px-8
        lg:py-7
      "
    >
      <div className="mx-auto max-w-[1450px]">

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Tenant Dashboard
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-slate-900

              dark:text-white

              sm:text-3xl
            "
          >
            Dashboard
          </h1>
        </div>

        {/* =================================================
            WELCOME HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[22px]
            bg-slate-950
            p-6
            text-white
            shadow-sm

            dark:bg-[#111113]
            dark:ring-1
            dark:ring-zinc-800

            sm:p-8
          "
        >
          {/* Background decoration */}

          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>
              <p className="text-sm font-medium text-orange-400">
                Welcome back,{" "}
                {user?.name
                  ?.split(" ")[0] ||
                  "Tenant"}
                !
              </p>

              <h2
                className="
                  mt-2
                  max-w-xl
                  text-2xl
                  font-bold
                  leading-tight
                  text-white

                  sm:text-3xl
                "
              >
                Find a place you will
                love to call home.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Explore approved rental
                properties, manage your
                bookings and keep track of
                your favorite homes.
              </p>
            </div>

            <Link
              href="/properties"
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-orange-500
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-orange-500/20
                transition
                hover:bg-orange-600
              "
            >
              <Search size={17} />

              Explore Properties

              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL BOOKINGS */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              transition-colors

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  Total Bookings
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : totalBookings}
                </h3>

                <p className="mt-2 flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                  <TrendingUp size={12} />

                  Your rental activity
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <CalendarDays size={20} />
              </div>
            </div>
          </div>

          {/* PENDING */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  Pending Requests
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : pendingBookings}
                </h3>

                <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-500">
                  Waiting for owner
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                <Clock3 size={20} />
              </div>
            </div>
          </div>

          {/* APPROVED */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  Approved
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : approvedBookings}
                </h3>

                <p className="mt-2 text-[11px] text-green-600 dark:text-green-400">
                  Successful requests
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* TOTAL PAID */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  Total Paid
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : formatAmount(
                        totalPaid
                      )}
                </h3>

                <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-500">
                  Successful payments
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <CreditCard size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT GRID
        ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* =================================================
              RECENT BOOKINGS
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800">

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                  Your latest rental activities
                </p>
              </div>

              <Link
                href="/dashboard/tenant/bookings"
                className="flex items-center gap-1 text-xs font-semibold text-orange-500 transition hover:text-orange-600"
              >
                View All

                <ArrowRight size={14} />
              </Link>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-slate-400 dark:text-zinc-500">
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              /* EMPTY */
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <CalendarDays size={24} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                  No bookings yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
                  Start exploring approved
                  properties and find your
                  next home.
                </p>

                <Link
                  href="/properties"
                  className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              /* TABLE */
              <div className="overflow-x-auto">

                <table className="w-full min-w-[720px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-950">

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Property
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Move-in
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings
                      .slice(0, 6)
                      .map(
                        (
                          booking,
                          index
                        ) => {
                          const image =
                            getPropertyImage(
                              booking
                            );

                          return (
                            <tr
                              key={
                                booking?._id ||
                                booking?.id ||
                                index
                              }
                              className="
                                border-b
                                border-slate-100
                                last:border-0
                                transition

                                hover:bg-slate-50

                                dark:border-zinc-800
                                dark:hover:bg-zinc-800/50
                              "
                            >

                              {/* PROPERTY */}

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  {image ? (
                                    <img
                                      src={image}
                                      alt={getPropertyTitle(
                                        booking
                                      )}
                                      className="h-10 w-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                                      <Building2 size={17} />
                                    </div>
                                  )}

                                  <div className="min-w-0">

                                    <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                                      {getPropertyTitle(
                                        booking
                                      )}
                                    </p>

                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
                                      <MapPin size={10} />

                                      {getPropertyLocation(
                                        booking
                                      )}
                                    </p>

                                  </div>
                                </div>
                              </td>

                              {/* DATE */}

                              <td className="px-5 py-4 text-xs text-slate-500 dark:text-zinc-400">
                                {formatDate(
                                  booking?.startDate ||
                                    booking?.moveInDate
                                )}
                              </td>

                              {/* AMOUNT */}

                              <td className="px-5 py-4 text-xs font-semibold text-slate-900 dark:text-white">
                                {formatAmount(
                                  booking?.totalAmount ||
                                    booking?.amount
                                )}
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">

                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    border
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-semibold

                                    ${getStatusClass(
                                      booking?.status
                                    )}
                                  `}
                                >
                                  {booking?.status ||
                                    "Pending"}
                                </span>

                              </td>
                            </tr>
                          );
                        }
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="space-y-5">

            {/* =================================================
                FAVORITES
            ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm

                dark:border-zinc-800
                dark:bg-zinc-900
              "
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800">

                <div className="flex items-center gap-2">

                  <Heart
                    size={17}
                    className="text-orange-500"
                  />

                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Favorites
                  </h2>
                </div>

                <Link
                  href="/dashboard/tenant/favorites"
                  className="text-xs font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  View All
                </Link>
              </div>

              <div className="p-4">

                {favorites.length ===
                0 ? (
                  <div className="py-7 text-center">

                    <Heart
                      size={28}
                      className="mx-auto text-slate-300 dark:text-zinc-700"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
                      No favorites yet
                    </p>

                    <Link
                      href="/properties"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-500 transition hover:text-orange-600"
                    >
                      Explore Properties

                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">

                    {favorites
                      .slice(0, 3)
                      .map(
                        (
                          favorite,
                          index
                        ) => {
                          const property =
                            getFavoriteProperty(
                              favorite
                            );

                          const propertyId =
                            getFavoriteId(
                              favorite
                            );

                          return (
                            <Link
                              key={
                                favorite?._id ||
                                favorite?.id ||
                                index
                              }
                              href={
                                propertyId
                                  ? `/properties/${propertyId}`
                                  : "/properties"
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border
                                border-slate-100
                                p-2.5
                                transition

                                hover:border-orange-200
                                hover:bg-orange-50/40

                                dark:border-zinc-800
                                dark:hover:border-zinc-700
                                dark:hover:bg-zinc-800
                              "
                            >

                              {property?.image ? (
                                <img
                                  src={
                                    property.image
                                  }
                                  alt={
                                    property.title ||
                                    "Property"
                                  }
                                  className="h-11 w-14 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                                  <Building2 size={17} />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {property?.title ||
                                    "Property"}
                                </p>

                                <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400 dark:text-zinc-500">
                                  <MapPin size={10} />

                                  {property?.location ||
                                    "Location"}
                                </p>

                              </div>

                              <ArrowRight
                                size={14}
                                className="shrink-0 text-slate-300 dark:text-zinc-600"
                              />
                            </Link>
                          );
                        }
                      )}
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm

                dark:border-zinc-800
                dark:bg-zinc-900
              "
            >
              <h2 className="font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">

                {/* FIND */}

                <Link
                  href="/properties"
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    transition

                    hover:border-orange-200
                    hover:bg-orange-50

                    dark:border-zinc-800
                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                  "
                >
                  <Search
                    size={19}
                    className="text-orange-500"
                  />

                  <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Find Property
                  </p>
                </Link>

                {/* BOOKINGS */}

                <Link
                  href="/dashboard/tenant/bookings"
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    transition

                    hover:border-orange-200
                    hover:bg-orange-50

                    dark:border-zinc-800
                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                  "
                >
                  <CalendarDays
                    size={19}
                    className="text-orange-500"
                  />

                  <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    My Bookings
                  </p>
                </Link>

                {/* FAVORITES */}

                <Link
                  href="/dashboard/tenant/favorites"
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    transition

                    hover:border-orange-200
                    hover:bg-orange-50

                    dark:border-zinc-800
                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                  "
                >
                  <Heart
                    size={19}
                    className="text-orange-500"
                  />

                  <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Favorites
                  </p>
                </Link>

                {/* PROFILE */}

                <Link
                  href="/dashboard/tenant/profile"
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    transition

                    hover:border-orange-200
                    hover:bg-orange-50

                    dark:border-zinc-800
                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                  "
                >
                  <Home
                    size={19}
                    className="text-orange-500"
                  />

                  <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Profile
                  </p>
                </Link>

              </div>
            </section>
          </div>
        </div>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-2xl
            border
            border-orange-100
            bg-orange-50
            p-6

            dark:border-orange-500/10
            dark:bg-orange-500/5

            sm:p-7
          "
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <Home size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Looking for your next home?
                </h2>

                <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-zinc-400">
                  Browse approved properties and
                  discover a place that matches
                  your lifestyle and budget.
                </p>
              </div>
            </div>

            <Link
              href="/properties"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Browse Properties

              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}