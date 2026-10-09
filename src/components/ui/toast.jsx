"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Status",
  },
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "Approved",
    label: "Approved",
  },
  {
    value: "Rejected",
    label: "Rejected",
  },
];

const statusConfig = {
  Pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock3,
  },
  Approved: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
    icon: XCircle,
  },
  Cancelled: {
    label: "Cancelled",
    className:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    icon: XCircle,
  },
  Completed: {
    label: "Completed",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    icon: CheckCircle2,
  },
};

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount) {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[
    parts.length - 1
  ].charAt(0)}`.toUpperCase();
}

function getBookingsFromResponse(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.bookings)) {
    return result.data.bookings;
  }

  if (Array.isArray(result?.bookings)) {
    return result.bookings;
  }

  if (Array.isArray(result?.results)) {
    return result.results;
  }

  return [];
}

function getPaginationFromResponse(result) {
  const pagination =
    result?.pagination ||
    result?.data?.pagination ||
    {};

  return {
    page: Number(pagination.page || 1),
    limit: Number(pagination.limit || 10),
    total: Number(
      pagination.total ??
        pagination.totalBookings ??
        0
    ),
    totalPages: Number(
      pagination.totalPages ??
        pagination.pages ??
        1
    ),
  };
}

function StatusBadge({ status }) {
  const config =
    statusConfig[status] ||
    statusConfig.Pending;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  valueClassName,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white ${valueClassName || ""}`}
          >
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Avatar({
  src,
  name,
  size = "md",
}) {
  const sizeClass =
    size === "sm"
      ? "h-9 w-9"
      : size === "lg"
        ? "h-12 w-12"
        : "h-10 w-10";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 ${sizeClass}`}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "User"}
          fill
          sizes={
            size === "lg"
              ? "48px"
              : size === "sm"
                ? "36px"
                : "40px"
          }
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [rejectingBooking, setRejectingBooking] =
    useState(null);

  const [rejectionFeedback, setRejectionFeedback] =
    useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectModalOpen, setRejectModalOpen] =
    useState(false);

  const fetchBookings = useCallback(
    async ({
      showRefresh = false,
      currentPage = page,
    } = {}) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const session =
          await authClient.getSession();

        const sessionUser =
          session?.data?.user;

        if (!sessionUser) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        const tokenResult =
          await authClient.token();

        const token =
          tokenResult?.data?.token;

        if (!token) {
          throw new Error(
            "Authentication token could not be generated."
          );
        }

        const params = new URLSearchParams();

        params.set(
          "page",
          String(currentPage)
        );

        params.set(
          "limit",
          String(limit)
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (status !== "all") {
          params.set(
            "status",
            status
          );
        }

        const response = await fetch(
          `${API_URL}/api/bookings/owner?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            credentials: "include",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to load booking requests."
          );
        }

        const bookingList =
          getBookingsFromResponse(result);

        const paginationData =
          getPaginationFromResponse(result);

        setBookings(bookingList);

        setPagination({
          ...paginationData,
          page: currentPage,
          limit,
          totalPages:
            paginationData.totalPages > 0
              ? paginationData.totalPages
              : 1,
        });
      } catch (error) {
        console.error(
          "Fetch booking requests error:",
          error
        );

        setBookings([]);

        toast.add({
          type: "error",
          title: "Unable to load bookings",
          description:
            error?.message ||
            "Something went wrong while loading booking requests.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit, page, search, status]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings({
        currentPage: page,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchBookings, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const stats = useMemo(() => {
    const total =
      pagination.total ||
      bookings.length;

    const pending = bookings.filter(
      (item) =>
        item?.status === "Pending"
    ).length;

    const approved = bookings.filter(
      (item) =>
        item?.status === "Approved"
    ).length;

    const rejected = bookings.filter(
      (item) =>
        item?.status === "Rejected"
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [bookings, pagination.total]);

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    if (actionLoadingId) return;

    setDetailsOpen(false);
    setSelectedBooking(null);
  };

  const openRejectModal = (booking) => {
    setRejectingBooking(booking);
    setRejectionFeedback("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (actionLoadingId) return;

    setRejectModalOpen(false);
    setRejectingBooking(null);
    setRejectionFeedback("");
  };

  const updateBookingStatus = async (
    booking,
    nextStatus,
    feedback = ""
  ) => {
    if (!booking?._id) {
      toast.add({
        type: "error",
        title: "Invalid booking",
        description:
          "The selected booking could not be identified.",
      });

      return;
    }

    if (
      !["Approved", "Rejected"].includes(
        nextStatus
      )
    ) {
      return;
    }

    if (
      nextStatus === "Rejected" &&
      !feedback.trim()
    ) {
      toast.add({
        type: "warning",
        title: "Feedback required",
        description:
          "Please provide a rejection reason before rejecting this booking.",
      });

      return;
    }

    try {
      setActionLoadingId(booking._id);

      const tokenResult =
        await authClient.token();

      const token =
        tokenResult?.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token could not be generated."
        );
      }

      const response = await fetch(
        `${API_URL}/api/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: nextStatus,
            rejectionFeedback:
              nextStatus === "Rejected"
                ? feedback.trim()
                : "",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to ${nextStatus.toLowerCase()} booking.`
        );
      }

      setBookings((current) =>
        current.map((item) =>
          item._id === booking._id
            ? {
                ...item,
                status: nextStatus,
                rejectionFeedback:
                  nextStatus ===
                  "Rejected"
                    ? feedback.trim()
                    : "",
              }
            : item
        )
      );

      if (
        selectedBooking?._id ===
        booking._id
      ) {
        setSelectedBooking((current) =>
          current
            ? {
                ...current,
                status: nextStatus,
                rejectionFeedback:
                  nextStatus ===
                  "Rejected"
                    ? feedback.trim()
                    : "",
              }
            : current
        );
      }

      if (
        rejectingBooking?._id ===
        booking._id
      ) {
        setRejectingBooking(
          (current) =>
            current
              ? {
                  ...current,
                  status: nextStatus,
                  rejectionFeedback:
                    feedback.trim(),
                }
              : current
        );
      }

      toast.add({
        type:
          nextStatus === "Approved"
            ? "success"
            : "info",
        title:
          nextStatus === "Approved"
            ? "Booking approved"
            : "Booking rejected",
        description:
          nextStatus === "Approved"
            ? "The booking request has been approved successfully."
            : "The booking request has been rejected successfully.",
      });

      if (
        nextStatus === "Rejected"
      ) {
        closeRejectModal();
      }
    } catch (error) {
      console.error(
        "Update booking status error:",
        error
      );

      toast.add({
        type: "error",
        title: "Action failed",
        description:
          error?.message ||
          "Unable to update the booking status.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (
    booking
  ) => {
    await updateBookingStatus(
      booking,
      "Approved"
    );
  };

  const handleReject = async () => {
    if (!rejectingBooking) {
      return;
    }

    await updateBookingStatus(
      rejectingBooking,
      "Rejected",
      rejectionFeedback
    );
  };

  const handleRefresh = async () => {
    await fetchBookings({
      showRefresh: true,
      currentPage: page,
    });

    toast.add({
      type: "success",
      title: "Bookings refreshed",
      description:
        "Booking requests have been updated.",
    });
  };

  const canGoPrevious = page > 1;

  const canGoNext =
    page <
    Math.max(
      1,
      pagination.totalPages
    );

  const goToPreviousPage = () => {
    if (!canGoPrevious) return;

    setPage((current) =>
      Math.max(1, current - 1)
    );
  };

  const goToNextPage = () => {
    if (!canGoNext) return;

    setPage((current) =>
      Math.min(
        Math.max(
          1,
          pagination.totalPages
        ),
        current + 1
      )
    );
  };

  return (
    <>
      <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-6 transition-colors duration-300 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px]">
          {/* PAGE HEADER */}
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-950">
                  <CalendarCheck2 className="h-4 w-4" />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">
                  Owner Dashboard
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Booking Requests
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
                Review tenant reservations,
                manage approval requests, and
                keep your property bookings
                organized.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white xl:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* STATS */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Requests"
              value={stats.total}
              description="All booking requests"
              icon={CalendarDays}
              iconClassName="bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              description="Awaiting your review"
              icon={Clock3}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              valueClassName="text-amber-600 dark:text-amber-400"
            />

            <StatCard
              title="Approved"
              value={stats.approved}
              description="Confirmed bookings"
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />

            <StatCard
              title="Rejected"
              value={stats.rejected}
              description="Declined requests"
              icon={XCircle}
              iconClassName="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              valueClassName="text-red-600 dark:text-red-400"
            />
          </div>

          {/* MAIN CARD */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
            {/* SEARCH / FILTER */}
            <div className="border-b border-slate-200 p-4 dark:border-zinc-800 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search by tenant name, email, property or location..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="relative min-w-0 flex-1 lg:w-48 lg:flex-none">
                    <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                    >
                      {STATUS_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                            className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-white"
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="p-6">
                <div className="hidden lg:block">
                  <div className="space-y-4">
                    {Array.from({
                      length: 6,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[2fr_2fr_1.2fr_1.2fr_1.4fr] items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100 dark:bg-zinc-800" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                            <div className="h-2.5 w-36 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                          <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                        </div>

                        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-zinc-800" />

                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />

                        <div className="flex gap-2">
                          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
                          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
                          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 lg:hidden">
                  {Array.from({
                    length: 4,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100 dark:bg-zinc-800" />

                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                          <div className="h-2.5 w-44 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
                        <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : bookings.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                  <CalendarDays className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                  No booking requests
                  found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-400">
                  There are currently no
                  booking requests matching
                  your selected filters.
                </p>

                {(search ||
                  status !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus("all");
                    }}
                    className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-950/60">
                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Tenant
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Property
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Booking
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Status
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {bookings.map(
                        (booking) => {
                          const tenant =
                            booking?.tenant ||
                            {};

                          const property =
                            booking?.property ||
                            {};

                          const isLoading =
                            actionLoadingId ===
                            booking?._id;

                          return (
                            <tr
                              key={
                                booking?._id
                              }
                              className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                            >
                              {/* TENANT */}
                              <td className="px-5 py-4 align-middle">
                                <div className="flex min-w-[210px] items-center gap-3">
                                  <Avatar
                                    src={
                                      tenant.photo
                                    }
                                    name={
                                      tenant.name
                                    }
                                    size="sm"
                                  />

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                      {tenant.name ||
                                        "Unknown tenant"}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-500">
                                      {tenant.email ||
                                        "No email"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* PROPERTY */}
                              <td className="px-5 py-4 align-middle">
                                <div className="min-w-[220px]">
                                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
                                    {property.title ||
                                      "Untitled property"}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />

                                    <span className="truncate">
                                      {property.location ||
                                        "Location unavailable"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* BOOKING */}
                              <td className="px-5 py-4 align-middle">
                                <div className="min-w-[150px]">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {formatAmount(
                                      booking.totalAmount
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                                    Move-in:{" "}
                                    {formatDate(
                                      booking.moveInDate
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-600">
                                    {
                                      booking.duration
                                    }{" "}
                                    month
                                    {Number(
                                      booking.duration
                                    ) !== 1
                                      ? "s"
                                      : ""}
                                  </p>
                                </div>
                              </td>

                              {/* STATUS */}
                              <td className="px-5 py-4 align-middle">
                                <StatusBadge
                                  status={
                                    booking.status
                                  }
                                />
                              </td>

                              {/* ACTIONS */}
                              <td className="px-5 py-4 align-middle">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDetails(
                                        booking
                                      )
                                    }
                                    title="View details"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  {booking.status ===
                                    "Pending" && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={
                                          isLoading
                                        }
                                        onClick={() =>
                                          handleApprove(
                                            booking
                                          )
                                        }
                                        title="Approve booking"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          isLoading
                                        }
                                        onClick={() =>
                                          openRejectModal(
                                            booking
                                          )
                                        }
                                        title="Reject booking"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </>
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

                {/* MOBILE CARDS */}
                <div className="space-y-3 p-4 lg:hidden">
                  {bookings.map(
                    (booking) => {
                      const tenant =
                        booking?.tenant ||
                        {};

                      const property =
                        booking?.property ||
                        {};

                      const isLoading =
                        actionLoadingId ===
                        booking?._id;

                      return (
                        <div
                          key={
                            booking?._id
                          }
                          className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          {/* TOP */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar
                                src={
                                  tenant.photo
                                }
                                name={
                                  tenant.name
                                }
                                size="sm"
                              />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {tenant.name ||
                                    "Unknown tenant"}
                                </p>

                                <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                                  {tenant.email ||
                                    "No email"}
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                booking.status
                              }
                            />
                          </div>

                          {/* PROPERTY */}
                          <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-zinc-900">
                            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                              Property
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {property.title ||
                                "Untitled property"}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />

                              <span className="truncate">
                                {property.location ||
                                  "Location unavailable"}
                              </span>
                            </div>
                          </div>

                          {/* BOOKING INFO */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                                Amount
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                {formatAmount(
                                  booking.totalAmount
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                                Move-in
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {formatDate(
                                  booking.moveInDate
                                )}
                              </p>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  booking
                                )
                              }
                              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </button>

                            {booking.status ===
                              "Pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isLoading
                                  }
                                  onClick={() =>
                                    handleApprove(
                                      booking
                                    )
                                  }
                                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isLoading
                                  }
                                  onClick={() =>
                                    openRejectModal(
                                      booking
                                    )
                                  }
                                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Page{" "}
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {Math.max(
                        1,
                        pagination.totalPages
                      )}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={
                        goToPreviousPage
                      }
                      disabled={
                        !canGoPrevious
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={
                        !canGoNext
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {detailsOpen &&
        selectedBooking && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDetails();
              }
            }}
          >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-zinc-500">
                    Booking Details
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    Reservation Request
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {/* TENANT */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                    <div className="mb-4 flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-slate-500 dark:text-zinc-400" />

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                        Tenant
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar
                        src={
                          selectedBooking
                            ?.tenant?.photo
                        }
                        name={
                          selectedBooking
                            ?.tenant?.name
                        }
                        size="lg"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {selectedBooking
                            ?.tenant
                            ?.name ||
                            "Unknown tenant"}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500 dark:text-zinc-500">
                          {selectedBooking
                            ?.tenant
                            ?.email ||
                            "No email"}
                        </p>

                        {selectedBooking
                          ?.tenant
                          ?.phone && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            {
                              selectedBooking
                                .tenant
                                .phone
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PROPERTY */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                    <div className="mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500 dark:text-zinc-400" />

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                        Property
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedBooking
                        ?.property
                        ?.title ||
                        "Untitled property"}
                    </p>

                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                      <span>
                        {selectedBooking
                          ?.property
                          ?.location ||
                          "Location unavailable"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* BOOKING SUMMARY */}
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      Booking Summary
                    </p>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-zinc-800 sm:grid-cols-4">
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {formatAmount(
                          selectedBooking.totalAmount
                        )}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {
                          selectedBooking.duration
                        }{" "}
                        month
                        {Number(
                          selectedBooking.duration
                        ) !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 p-4 dark:border-zinc-800 sm:border-t-0">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Move-in
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {formatDate(
                          selectedBooking.moveInDate
                        )}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 p-4 dark:border-zinc-800 sm:border-t-0">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                        Status
                      </p>

                      <div className="mt-1">
                        <StatusBadge
                          status={
                            selectedBooking.status
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOTES */}
                {selectedBooking
                  .additionalNotes && (
                  <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      Additional Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-zinc-300">
                      {
                        selectedBooking.additionalNotes
                      }
                    </p>
                  </div>
                )}

                {/* REJECTION FEEDBACK */}
                {selectedBooking
                  .rejectionFeedback && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                      Rejection Feedback
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-300">
                      {
                        selectedBooking.rejectionFeedback
                      }
                    </p>
                  </div>
                )}

                {/* CREATED */}
                <p className="mt-5 text-xs text-slate-400 dark:text-zinc-600">
                  Request created{" "}
                  {formatDateTime(
                    selectedBooking.createdAt
                  )}
                </p>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Close
                </button>

                {selectedBooking.status ===
                  "Pending" && (
                  <>
                    <button
                      type="button"
                      disabled={
                        actionLoadingId ===
                        selectedBooking._id
                      }
                      onClick={() =>
                        handleApprove(
                          selectedBooking
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoadingId ===
                      selectedBooking._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoadingId ===
                        selectedBooking._id
                      }
                      onClick={() =>
                        openRejectModal(
                          selectedBooking
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {/* REJECT MODAL */}
      {rejectModalOpen &&
        rejectingBooking && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeRejectModal();
              }
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      <XCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Reject Booking
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
                        Provide a reason for
                        the tenant.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeRejectModal
                  }
                  disabled={
                    Boolean(
                      actionLoadingId
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={
                        rejectingBooking
                          ?.tenant
                          ?.photo
                      }
                      name={
                        rejectingBooking
                          ?.tenant
                          ?.name
                      }
                      size="sm"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {rejectingBooking
                          ?.tenant
                          ?.name ||
                          "Unknown tenant"}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                        {rejectingBooking
                          ?.property
                          ?.title ||
                          "Untitled property"}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    Rejection reason
                  </span>

                  <textarea
                    value={
                      rejectionFeedback
                    }
                    onChange={(event) =>
                      setRejectionFeedback(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Explain why this booking request is being rejected..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-red-500/40 dark:focus:ring-red-500/10"
                  />
                </label>

                <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-600">
                  This feedback will be visible
                  to the tenant.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeRejectModal
                  }
                  disabled={
                    Boolean(
                      actionLoadingId
                    )
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={
                    Boolean(
                      actionLoadingId
                    ) ||
                    !rejectionFeedback.trim()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoadingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Reject Booking
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}