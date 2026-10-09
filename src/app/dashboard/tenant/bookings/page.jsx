"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const FALLBACK_IMAGE =
  "/placeholder-property.jpg";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  /* =====================================================
     GET BOOKINGS
  ===================================================== */

  const fetchBookings = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      /* -----------------------------------------------
         GET JWT TOKEN
      ------------------------------------------------ */

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token ||
        tokenResponse?.token ||
        "";

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      /* -----------------------------------------------
         API REQUEST
      ------------------------------------------------ */

      const response = await fetch(
        `${API_URL}/api/bookings/my-bookings`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load your bookings."
        );
      }

      const bookingList = Array.isArray(
        data?.bookings
      )
        ? data.bookings
        : [];

      setBookings(bookingList);
      setError("");
    } catch (err) {
      console.error(
        "My bookings error:",
        err
      );

      setBookings([]);

      setError(
        err?.message ||
          "Failed to load bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchBookings(true);
  
}, []);

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(false);
  };

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     AMOUNT FORMAT
  ===================================================== */

  const formatAmount = (amount) => {
    return `৳${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  /* =====================================================
     PROPERTY HELPERS
  ===================================================== */

  const getPropertyTitle = (booking) => {
    return (
      booking?.property?.title ||
      "Property"
    );
  };

  const getPropertyLocation = (booking) => {
    return (
      booking?.property?.location ||
      "Location unavailable"
    );
  };

  const getPropertyImage = (booking) => {
    return (
      booking?.property?.image ||
      FALLBACK_IMAGE
    );
  };

  const getPropertyId = (booking) => {
    return (
      booking?.property?.id ||
      booking?.property?._id ||
      ""
    );
  };

  /* =====================================================
     BOOKING STATUS STYLE
  ===================================================== */

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "approved") {
      return `
        border-green-200
        bg-green-50
        text-green-700
        dark:border-green-500/20
        dark:bg-green-500/10
        dark:text-green-400
      `;
    }

    if (value === "pending") {
      return `
        border-orange-200
        bg-orange-50
        text-orange-700
        dark:border-orange-500/20
        dark:bg-orange-500/10
        dark:text-orange-400
      `;
    }

    if (value === "rejected") {
      return `
        border-red-200
        bg-red-50
        text-red-700
        dark:border-red-500/20
        dark:bg-red-500/10
        dark:text-red-400
      `;
    }

    if (value === "cancelled") {
      return `
        border-slate-200
        bg-slate-50
        text-slate-600
        dark:border-zinc-700
        dark:bg-zinc-800
        dark:text-zinc-400
      `;
    }

    if (value === "completed") {
      return `
        border-blue-200
        bg-blue-50
        text-blue-700
        dark:border-blue-500/20
        dark:bg-blue-500/10
        dark:text-blue-400
      `;
    }

    return `
      border-slate-200
      bg-slate-50
      text-slate-600
      dark:border-zinc-700
      dark:bg-zinc-800
      dark:text-zinc-400
    `;
  };

  /* =====================================================
     PAYMENT STATUS STYLE
  ===================================================== */

  const getPaymentClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "paid") {
      return `
        border-green-200
        bg-green-50
        text-green-700
        dark:border-green-500/20
        dark:bg-green-500/10
        dark:text-green-400
      `;
    }

    if (value === "pending") {
      return `
        border-yellow-200
        bg-yellow-50
        text-yellow-700
        dark:border-yellow-500/20
        dark:bg-yellow-500/10
        dark:text-yellow-400
      `;
    }

    if (value === "failed") {
      return `
        border-red-200
        bg-red-50
        text-red-700
        dark:border-red-500/20
        dark:bg-red-500/10
        dark:text-red-400
      `;
    }

    if (value === "refunded") {
      return `
        border-purple-200
        bg-purple-50
        text-purple-700
        dark:border-purple-500/20
        dark:bg-purple-500/10
        dark:text-purple-400
      `;
    }

    return `
      border-slate-200
      bg-slate-50
      text-slate-600
      dark:border-zinc-700
      dark:bg-zinc-800
      dark:text-zinc-400
    `;
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredBookings =
    bookings.filter((booking) => {
      const keyword =
        search.trim().toLowerCase();

      const title =
        getPropertyTitle(
          booking
        ).toLowerCase();

      const location =
        getPropertyLocation(
          booking
        ).toLowerCase();

      const status =
        String(
          booking?.status || ""
        ).toLowerCase();

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        location.includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        status ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalBookings =
    bookings.length;

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking?.status === "Pending"
    ).length;

  const approvedBookings =
    bookings.filter(
      (booking) =>
        booking?.status === "Approved"
    ).length;

  const paidBookings =
    bookings.filter(
      (booking) =>
        booking?.paymentStatus === "Paid"
    ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main
        className="
          flex
          min-h-[calc(100vh-72px)]
          items-center
          justify-center
          bg-[#f7f5ef]
          dark:bg-[#09090b]
        "
      >
        <div className="text-center">

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-orange-50
              text-orange-500
              dark:bg-orange-500/10
            "
          >
            <CalendarDays
              size={26}
              className="animate-pulse"
            />
          </div>

          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-slate-700
              dark:text-white
            "
          >
            Loading bookings...
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
              dark:text-zinc-500
            "
          >
            Please wait
          </p>

        </div>
      </main>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main
      className="
        min-h-[calc(100vh-72px)]
        bg-[#f7f5ef]
        px-4
        py-6
        text-slate-900
        transition-colors
        duration-300
        dark:bg-[#09090b]
        dark:text-white
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >
      <div className="mx-auto max-w-[1450px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            justify-between
            gap-4
            md:flex-row
            md:items-end
          "
        >

          <div>

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-orange-500
              "
            >
              Tenant Portal
            </p>

            <h1
              className="
                mt-1
                text-3xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              My Bookings
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
                dark:text-zinc-400
              "
            >
              View and manage your rental
              bookings.
            </p>

          </div>

          <Link
            href="/properties"
            className="
              inline-flex
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
            <Search size={16} />
            Browse Properties
          </Link>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
              dark:border-red-500/20
              dark:bg-red-500/10
              dark:text-red-400
            "
          >

            <div className="flex items-center gap-2">
              <XCircle size={17} />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchBookings(true)
              }
              className="
                shrink-0
                rounded-lg
                px-3
                py-1
                text-xs
                font-semibold
                hover:bg-red-100
                dark:hover:bg-red-500/10
              "
            >
              Retry
            </button>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-4
            lg:grid-cols-4
          "
        >

          {/* TOTAL */}

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
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {totalBookings}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-50
                  text-orange-500
                  dark:bg-orange-500/10
                "
              >
                <CalendarDays size={19} />
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
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {pendingBookings}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-yellow-50
                  text-yellow-600
                  dark:bg-yellow-500/10
                  dark:text-yellow-400
                "
              >
                <Clock3 size={19} />
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
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Approved
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {approvedBookings}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-50
                  text-green-600
                  dark:bg-green-500/10
                  dark:text-green-400
                "
              >
                <CheckCircle2 size={19} />
              </div>

            </div>
          </div>

          {/* PAID */}

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
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Paid Bookings
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {paidBookings}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  dark:bg-blue-500/10
                  dark:text-blue-400
                "
              >
                <CreditCard size={19} />
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              md:flex-row
            "
          >

            {/* SEARCH */}

            <div
              className="
                flex
                h-11
                flex-1
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                dark:border-zinc-700
                dark:bg-zinc-950
              "
            >

              <Search
                size={17}
                className="
                  text-slate-400
                  dark:text-zinc-500
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search property or location..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  outline-none
                  placeholder:text-slate-400
                  dark:text-white
                  dark:placeholder:text-zinc-600
                "
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                text-slate-700
                outline-none
                dark:border-zinc-700
                dark:bg-zinc-950
                dark:text-zinc-300
              "
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            {/* REFRESH */}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh bookings"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-zinc-700
                dark:bg-zinc-950
                dark:text-zinc-300
                dark:hover:bg-zinc-800
              "
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

          </div>

          <p
            className="
              mt-3
              text-xs
              text-slate-400
              dark:text-zinc-500
            "
          >
            Showing{" "}
            {filteredBookings.length}{" "}
            of {bookings.length} bookings
          </p>

        </div>

        {/* =================================================
            BOOKINGS TABLE
        ================================================= */}

        <div
          className="
            mt-5
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

          <div
            className="
              border-b
              border-slate-100
              px-5
              py-4
              dark:border-zinc-800
            "
          >
            <h2 className="font-bold">
              All Bookings
            </h2>

            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
              Your rental booking history
            </p>
          </div>

          {filteredBookings.length ===
          0 ? (
            <div
              className="
                flex
                min-h-[350px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-orange-50
                  text-orange-500
                  dark:bg-orange-500/10
                "
              >
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-4 font-semibold">
                {error
                  ? "Unable to load bookings"
                  : search ||
                    statusFilter !== "All"
                  ? "No matching bookings"
                  : "No bookings yet"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-zinc-400">
                {error
                  ? "Please try again or login again."
                  : search ||
                    statusFilter !== "All"
                  ? "Try changing your search or status filter."
                  : "You have not made any rental bookings yet."}
              </p>

              {error && (
                <button
                  type="button"
                  onClick={() =>
                    fetchBookings(true)
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-orange-500
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-orange-600
                  "
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
              )}

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr
                    className="
                      border-b
                      border-slate-100
                      bg-slate-50
                      dark:border-zinc-800
                      dark:bg-zinc-950
                    "
                  >

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Property Name
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Booking Date
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Amount Paid
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Booking Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Payment Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredBookings.map(
                    (booking, index) => {
                      const propertyImage =
                        getPropertyImage(
                          booking
                        );

                      const propertyId =
                        getPropertyId(
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
                            hover:bg-slate-50
                            dark:border-zinc-800
                            dark:hover:bg-zinc-800/40
                          "
                        >

                          {/* PROPERTY */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div
                                className="
                                  relative
                                  h-12
                                  w-14
                                  shrink-0
                                  overflow-hidden
                                  rounded-lg
                                  bg-slate-100
                                  dark:bg-zinc-800
                                "
                              >

                                <Image
                                  src={
                                    propertyImage
                                  }
                                  alt={getPropertyTitle(
                                    booking
                                  )}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                  unoptimized
                                />

                              </div>

                              <div className="min-w-0">

                                <p
                                  className="
                                    max-w-[280px]
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                    dark:text-white
                                  "
                                >
                                  {getPropertyTitle(
                                    booking
                                  )}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    flex
                                    max-w-[280px]
                                    items-center
                                    gap-1
                                    truncate
                                    text-[11px]
                                    text-slate-400
                                    dark:text-zinc-500
                                  "
                                >
                                  <MapPin size={10} />

                                  {getPropertyLocation(
                                    booking
                                  )}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* DATE */}

                          <td
                            className="
                              px-5
                              py-4
                              text-xs
                              text-slate-600
                              dark:text-zinc-400
                            "
                          >
                            {formatDate(
                              booking?.startDate
                            )}
                          </td>

                          {/* AMOUNT */}

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            {formatAmount(
                              booking?.totalAmount
                            )}
                          </td>

                          {/* BOOKING STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                border
                                px-3
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

                          {/* PAYMENT STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                border
                                px-3
                                py-1
                                text-[10px]
                                font-semibold
                                ${getPaymentClass(
                                  booking?.paymentStatus
                                )}
                              `}
                            >
                              {booking?.paymentStatus ||
                                "Pending"}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedBooking(
                                    booking
                                  )
                                }
                                title="View booking"
                                className="
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-500
                                  hover:bg-orange-50
                                  hover:text-orange-600
                                  dark:border-zinc-700
                                  dark:bg-zinc-900
                                  dark:text-zinc-400
                                  dark:hover:bg-zinc-800
                                "
                              >
                                <Eye size={15} />
                              </button>

                              {propertyId && (
                                <Link
                                  href={`/properties/${propertyId}`}
                                  title="View property"
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-500
                                    hover:bg-orange-50
                                    hover:text-orange-600
                                    dark:border-zinc-700
                                    dark:bg-zinc-900
                                    dark:text-zinc-400
                                    dark:hover:bg-zinc-800
                                  "
                                >
                                  <ArrowRight
                                    size={15}
                                  />
                                </Link>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedBooking && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setSelectedBooking(null)
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-xl
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
              dark:bg-zinc-900
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-6
                py-5
                dark:border-zinc-800
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-orange-500
                  "
                >
                  Booking Details
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {getPropertyTitle(
                    selectedBooking
                  )}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  dark:hover:bg-zinc-800
                "
              >
                <X size={18} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6">

              {/* IMAGE */}

              <div
                className="
                  relative
                  h-52
                  w-full
                  overflow-hidden
                  rounded-2xl
                  bg-slate-100
                  dark:bg-zinc-800
                "
              >

                <Image
                  src={getPropertyImage(
                    selectedBooking
                  )}
                  alt={getPropertyTitle(
                    selectedBooking
                  )}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  unoptimized
                />

              </div>

              {/* LOCATION */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-slate-500
                  dark:text-zinc-400
                "
              >
                <MapPin size={15} />

                {getPropertyLocation(
                  selectedBooking
                )}
              </div>

              {/* INFO */}

              <div
                className="
                  mt-5
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Move-in Date
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {formatDate(
                      selectedBooking?.startDate
                    )}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Total Amount
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {formatAmount(
                      selectedBooking?.totalAmount
                    )}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Booking Status
                  </p>

                  <span
                    className={`
                      mt-2
                      inline-flex
                      rounded-full
                      border
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      ${getStatusClass(
                        selectedBooking?.status
                      )}
                    `}
                  >
                    {selectedBooking?.status ||
                      "Pending"}
                  </span>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Payment Status
                  </p>

                  <span
                    className={`
                      mt-2
                      inline-flex
                      rounded-full
                      border
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      ${getPaymentClass(
                        selectedBooking?.paymentStatus
                      )}
                    `}
                  >
                    {selectedBooking?.paymentStatus ||
                      "Pending"}
                  </span>
                </div>

              </div>

              {/* DURATION */}

              {selectedBooking?.duration && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Duration
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {selectedBooking.duration}
                  </p>
                </div>
              )}

              {/* NOTE */}

              {selectedBooking?.note && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-slate-100
                    p-4
                    dark:border-zinc-800
                  "
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Additional Note
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-600
                      dark:text-zinc-400
                    "
                  >
                    {selectedBooking.note}
                  </p>
                </div>
              )}

              {/* REJECTION */}

              {selectedBooking?.status ===
                "Rejected" &&
                selectedBooking?.rejectionFeedback && (
                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      p-4
                      dark:border-red-500/20
                      dark:bg-red-500/10
                    "
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
                      Rejection Feedback
                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-red-700
                        dark:text-red-300
                      "
                    >
                      {
                        selectedBooking.rejectionFeedback
                      }
                    </p>
                  </div>
                )}

              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setSelectedBooking(null)
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    hover:bg-slate-50
                    dark:border-zinc-700
                    dark:text-zinc-300
                    dark:hover:bg-zinc-800
                  "
                >
                  Close
                </button>

                {getPropertyId(
                  selectedBooking
                ) && (
                  <Link
                    href={`/properties/${getPropertyId(
                      selectedBooking
                    )}`}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-orange-500
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-orange-600
                    "
                  >
                    View Property
                    <ArrowRight size={15} />
                  </Link>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}