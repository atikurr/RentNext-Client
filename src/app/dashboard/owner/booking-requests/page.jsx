"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Eye,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const API_URL = "http://localhost:5000";

const statusStyles = {
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",

  Approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",

  Rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",

  Cancelled:
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",

  Completed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

const formatShortDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getInitials = (name) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
};

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [
    rejectionFeedback,
    setRejectionFeedback,
  ] = useState("");

  /*
   * ======================================================
   * LOAD BOOKINGS
   * ======================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);

        const tokenResult =
          await authClient.token();

        const token =
          tokenResult?.data?.token;

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
        );

        params.set("limit", "10");

        if (status !== "all") {
          params.set(
            "status",
            status
          );
        }

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/bookings/owner?${params.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load booking requests."
          );
        }

        if (cancelled) return;

        setBookings(
          Array.isArray(data.bookings)
            ? data.bookings
            : []
        );

        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Load bookings error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to load booking requests."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [page, status, search]);

  /*
   * ======================================================
   * SEARCH
   * ======================================================
   */

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSearchKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
   * ======================================================
   * STATUS FILTER
   * ======================================================
   */

  const handleStatusChange = (
    value
  ) => {
    setStatus(value);
    setPage(1);
  };

  /*
   * ======================================================
   * REFRESH
   * ======================================================
   */

  const handleRefresh = () => {
    setRefreshing(true);

    setSearch(
      (current) => current
    );
  };

  /*
   * ======================================================
   * DETAILS
   * ======================================================
   */

  const openDetails = (
    booking
  ) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  /*
   * ======================================================
   * REJECT DIALOG
   * ======================================================
   */

  const openRejectDialog = (
    booking
  ) => {
    setSelectedBooking(booking);
    setRejectionFeedback("");
    setRejectOpen(true);
  };

  /*
   * ======================================================
   * UPDATE STATUS
   * ======================================================
   */

  const updateBookingStatus =
    async (
      bookingId,
      newStatus,
      feedback = ""
    ) => {
      try {
        setActionLoading(true);

        const tokenResult =
          await authClient.token();

        const token =
          tokenResult?.data?.token;

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/bookings/${bookingId}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                status: newStatus,

                ...(newStatus ===
                "Rejected"
                  ? {
                      rejectionFeedback:
                        feedback.trim(),
                    }
                  : {}),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update booking."
          );
        }

        setBookings(
          (current) =>
            current.map(
              (booking) =>
                booking._id === bookingId
                  ? data.booking
                  : booking
            )
        );

        setSelectedBooking(
          data.booking
        );

        setRejectOpen(false);
        setRejectionFeedback("");

        toast.success(
          newStatus === "Approved"
            ? "Booking approved successfully."
            : "Booking rejected successfully."
        );
      } catch (error) {
        console.error(
          "Update booking error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update booking."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * ======================================================
   * APPROVE
   * ======================================================
   */

  const handleApprove = (
    booking
  ) => {
    updateBookingStatus(
      booking._id,
      "Approved"
    );
  };

  /*
   * ======================================================
   * REJECT
   * ======================================================
   */

  const handleReject = async () => {
    if (!selectedBooking) return;

    if (!rejectionFeedback.trim()) {
      toast.error(
        "Please provide rejection feedback."
      );

      return;
    }

    await updateBookingStatus(
      selectedBooking._id,
      "Rejected",
      rejectionFeedback
    );
  };

  /*
   * ======================================================
   * STATISTICS
   * ======================================================
   */

  const statistics = useMemo(() => {
    return {
      total: pagination.total || 0,

      pending: bookings.filter(
        (item) =>
          item.status === "Pending"
      ).length,

      approved: bookings.filter(
        (item) =>
          item.status === "Approved"
      ).length,

      rejected: bookings.filter(
        (item) =>
          item.status === "Rejected"
      ).length,
    };
  }, [
    bookings,
    pagination.total,
  ]);

  /*
   * ======================================================
   * LOADING
   * ======================================================
   */

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 font-sans transition-colors duration-300 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 p-5 md:p-7 xl:p-8">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>

          <div className="h-[500px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-[1500px] space-y-6 p-5 md:p-7 xl:p-8">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white">
                <CalendarDays className="h-[18px] w-[18px] text-white dark:text-zinc-950" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-zinc-400">
                Owner Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">
              Booking Requests
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Review tenant reservations,
              manage approval requests, and
              keep your property bookings
              organized.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm transition-colors duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Total Requests
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {statistics.total}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    All booking requests
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <CalendarDays className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PENDING */}

          <Card className="rounded-2xl border-amber-100 bg-white shadow-sm transition-colors duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:bg-zinc-900">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Pending
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                    {statistics.pending}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    Awaiting your review
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* APPROVED */}

          <Card className="rounded-2xl border-emerald-100 bg-white shadow-sm transition-colors duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:bg-zinc-900">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Approved
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {statistics.approved}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    Confirmed bookings
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REJECTED */}

          <Card className="rounded-2xl border-red-100 bg-white shadow-sm transition-colors duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-red-500/20 dark:bg-zinc-900">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Rejected
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
                    {statistics.rejected}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    Declined requests
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">

          {/* FILTER BAR */}

          <div className="border-b border-slate-100 p-4 dark:border-zinc-800 md:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                <Input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  placeholder="Search by tenant name, email, property or location..."
                  className="h-11 border-slate-200 bg-slate-50 pl-10 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:focus-visible:bg-zinc-900"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <Button
                  onClick={handleSearch}
                  className="h-11 bg-slate-950 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  <Search className="mr-2 h-4 w-4" />

                  Search
                </Button>

                <div className="flex items-center gap-2">
                  <Filter className="hidden h-4 w-4 text-slate-400 dark:text-zinc-500 sm:block" />

                  <Select
                    value={status}
                    onValueChange={
                      handleStatusChange
                    }
                  >
                    <SelectTrigger className="h-11 w-full border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 sm:w-[170px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                      <SelectItem value="all">
                        All Status
                      </SelectItem>

                      <SelectItem value="Pending">
                        Pending
                      </SelectItem>

                      <SelectItem value="Approved">
                        Approved
                      </SelectItem>

                      <SelectItem value="Rejected">
                        Rejected
                      </SelectItem>

                      <SelectItem value="Cancelled">
                        Cancelled
                      </SelectItem>

                      <SelectItem value="Completed">
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {bookings.length === 0 ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800">
                <CalendarDays className="h-7 w-7 text-slate-400 dark:text-zinc-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                No booking requests found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-400">
                There are currently no
                booking requests matching
                your selected filters.
              </p>

              {(search ||
                status !== "all") && (
                <Button
                  variant="outline"
                  className="mt-5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-950/60">
                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Tenant
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Property
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Booking Period
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Amount
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {bookings.map(
                        (booking) => (
                          <tr
                            key={
                              booking._id
                            }
                            className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                          >
                            {/* TENANT */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-200 dark:border-zinc-700">
                                  <AvatarImage
                                    src={
                                      booking
                                        .tenant
                                        ?.photo ||
                                      ""
                                    }
                                  />

                                  <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    {getInitials(
                                      booking
                                        .tenant
                                        ?.name
                                    )}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                  <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {
                                      booking
                                        .tenant
                                        ?.name
                                    }
                                  </p>

                                  <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500 dark:text-zinc-500">
                                    {
                                      booking
                                        .tenant
                                        ?.email
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* PROPERTY */}

                            <td className="px-6 py-5">
                              <div>
                                <p className="max-w-[230px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {
                                    booking
                                      .property
                                      ?.title
                                  }
                                </p>

                                <div className="mt-1 flex max-w-[230px] items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />

                                  <span className="truncate">
                                    {
                                      booking
                                        .property
                                        ?.location
                                    }
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* DATES */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                                  <CalendarDays className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                                    {formatShortDate(
                                      booking.startDate
                                    )}{" "}
                                    –{" "}
                                    {formatShortDate(
                                      booking.endDate
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-600">
                                    {
                                      booking.duration
                                    }{" "}
                                    period
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* AMOUNT */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-slate-400 dark:text-zinc-500" />

                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                  {formatCurrency(
                                    booking.totalAmount
                                  )}
                                </span>
                              </div>

                              <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-600">
                                {
                                  booking
                                    .property
                                    ?.rentType
                                }
                              </p>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  statusStyles[
                                    booking
                                      .status
                                  ] || ""
                                }`}
                              >
                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                                {
                                  booking.status
                                }
                              </Badge>
                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openDetails(
                                      booking
                                    )
                                  }
                                  className="h-9 border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                                >
                                  <Eye className="mr-1.5 h-3.5 w-3.5" />

                                  View
                                </Button>

                                {booking.status ===
                                  "Pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApprove(
                                          booking
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      className="h-9 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                                    >
                                      {actionLoading ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                      )}

                                      Approve
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        openRejectDialog(
                                          booking
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      className="h-9 border-red-200 bg-white px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                                    >
                                      <X className="mr-1.5 h-3.5 w-3.5" />

                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ==================================================
                  MOBILE / TABLET CARDS
              ================================================== */}

              <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
                {bookings.map(
                  (booking) => (
                    <Card
                      key={
                        booking._id
                      }
                      className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200 dark:border-zinc-700">
                              <AvatarImage
                                src={
                                  booking
                                    .tenant
                                    ?.photo ||
                                  ""
                                }
                              />

                              <AvatarFallback className="bg-slate-100 text-xs font-semibold dark:bg-zinc-800 dark:text-zinc-300">
                                {getInitials(
                                  booking
                                    .tenant
                                    ?.name
                                )}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {
                                  booking
                                    .tenant
                                    ?.name
                                }
                              </p>

                              <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                                {
                                  booking
                                    .tenant
                                    ?.email
                                }
                              </p>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${
                              statusStyles[
                                booking
                                  .status
                              ] || ""
                            }`}
                          >
                            {
                              booking.status
                            }
                          </Badge>
                        </div>

                        <Separator className="my-4 bg-slate-200 dark:bg-zinc-800" />

                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {
                              booking
                                .property
                                ?.title
                            }
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                            <MapPin className="h-3.5 w-3.5" />

                            {
                              booking
                                .property
                                ?.location
                            }
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-900">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                              Period
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                              {formatShortDate(
                                booking.startDate
                              )}{" "}
                              –{" "}
                              {formatShortDate(
                                booking.endDate
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-900">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                              Amount
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                              {formatCurrency(
                                booking.totalAmount
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openDetails(
                                booking
                              )
                            }
                            className="h-9 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          >
                            <Eye className="mr-1.5 h-4 w-4" />

                            View
                          </Button>

                          {booking.status ===
                            "Pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApprove(
                                    booking
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                <Check className="mr-1.5 h-4 w-4" />

                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openRejectDialog(
                                    booking
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="h-9 border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <X className="mr-1.5 h-4 w-4" />

                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </>
          )}

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {pagination.totalPages >
            0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                Showing page{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {
                    pagination.totalPages
                  }
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current - 1,
                          1
                        )
                    )
                  }
                  className="h-9 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />

                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                  className="h-9 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next

                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ======================================================
          VIEW DETAILS DIALOG
      ====================================================== */}

      <Dialog
        open={detailsOpen}
        onOpenChange={
          setDetailsOpen
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Booking Details
            </DialogTitle>

            <DialogDescription className="text-slate-500 dark:text-zinc-400">
              Review the tenant, property,
              booking period and payment
              information.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-5">

              {/* TENANT */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-white shadow-sm dark:border-zinc-700">
                    <AvatarImage
                      src={
                        selectedBooking
                          .tenant
                          ?.photo || ""
                      }
                    />

                    <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-zinc-950">
                      {getInitials(
                        selectedBooking
                          .tenant?.name
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {
                        selectedBooking
                          .tenant?.name
                      }
                    </p>

                    <p className="truncate text-sm text-slate-500 dark:text-zinc-500">
                      {
                        selectedBooking
                          .tenant?.email
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* PROPERTY */}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Property
                </p>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {
                      selectedBooking
                        .property?.title
                    }
                  </p>

                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-500">
                    <MapPin className="h-4 w-4" />

                    {
                      selectedBooking
                        .property?.location
                    }
                  </div>
                </div>
              </div>

              {/* BOOKING INFO */}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Start Date
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(
                      selectedBooking.startDate
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    End Date
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(
                      selectedBooking.endDate
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Duration
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {
                      selectedBooking.duration
                    }{" "}
                    period
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Total Amount
                  </p>

                  <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(
                      selectedBooking.totalAmount
                    )}
                  </p>
                </div>
              </div>

              {/* PAYMENT */}

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                <span className="text-sm text-slate-500 dark:text-zinc-400">
                  Payment Status
                </span>

                <Badge
                  variant="outline"
                  className={
                    selectedBooking.paymentStatus ===
                    "Paid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                  }
                >
                  {
                    selectedBooking.paymentStatus ||
                    "Pending"
                  }
                </Badge>
              </div>

              {/* NOTE */}

              {selectedBooking.note && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Tenant Note
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                    {
                      selectedBooking.note
                    }
                  </div>
                </div>
              )}

              {/* REJECTION FEEDBACK */}

              {selectedBooking.rejectionFeedback && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Rejection Feedback
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-red-600 dark:text-red-300">
                    {
                      selectedBooking.rejectionFeedback
                    }
                  </p>
                </div>
              )}

              {/* STATUS */}

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                  Booking Status
                </span>

                <Badge
                  variant="outline"
                  className={
                    statusStyles[
                      selectedBooking.status
                    ] || ""
                  }
                >
                  {
                    selectedBooking.status
                  }
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {selectedBooking?.status ===
              "Pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsOpen(
                      false
                    );

                    openRejectDialog(
                      selectedBooking
                    );
                  }}
                  className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <X className="mr-1.5 h-4 w-4" />

                  Reject
                </Button>

                <Button
                  onClick={() =>
                    handleApprove(
                      selectedBooking
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {actionLoading ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-4 w-4" />
                  )}

                  Approve Booking
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          REJECT DIALOG
      ====================================================== */}

      <Dialog
        open={rejectOpen}
        onOpenChange={
          setRejectOpen
        }
      >
        <DialogContent className="rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-[520px]">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Reject Booking Request
            </DialogTitle>

            <DialogDescription className="leading-6 text-slate-500 dark:text-zinc-400">
              Please provide a clear reason
              for rejecting this request.
              The tenant will be able to view
              your feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Rejection Feedback
            </label>

            <textarea
              value={
                rejectionFeedback
              }
              onChange={(event) =>
                setRejectionFeedback(
                  event.target.value
                )
              }
              placeholder="Example: The property is no longer available for the selected dates."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-zinc-800"
            />

            <p className="text-xs text-slate-400 dark:text-zinc-500">
              A rejection reason is required.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setRejectOpen(
                  false
                )
              }
              disabled={
                actionLoading
              }
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleReject
              }
              disabled={
                actionLoading ||
                !rejectionFeedback.trim()
              }
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {actionLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-1.5 h-4 w-4" />
              )}

              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TOAST */}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}