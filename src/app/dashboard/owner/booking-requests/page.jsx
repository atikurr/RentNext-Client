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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PAGE_LIMIT = 6;

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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

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

const getBookingId = (booking) => booking?._id || booking?.id;

const getErrorMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback;

function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        statusStyles[status] || ""
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </Badge>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-zinc-950">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-zinc-200">
        {value || "—"}
      </p>
    </div>
  );
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  // Load bookings without synchronously setting state in the effect body.
  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);

        const tokenResult = await authClient.token();
        const token = tokenResult?.data?.token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(PAGE_LIMIT));

        if (status !== "all") {
          params.set("status", status);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(
          `${API_URL}/api/bookings/owner?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load booking requests."
          );
        }

        if (cancelled) return;

        const nextBookings = Array.isArray(data.bookings)
          ? data.bookings
          : [];

        const serverPagination = data.pagination || {};

        setBookings(nextBookings);

        setPagination({
          page: Number(serverPagination.page) || page,
          limit: PAGE_LIMIT,
          total:
            Number(serverPagination.total) ||
            nextBookings.length,
          totalPages:
            Number(serverPagination.totalPages) ||
            Math.ceil(
              (Number(serverPagination.total) ||
                nextBookings.length) / PAGE_LIMIT
            ),
          hasNextPage:
            typeof serverPagination.hasNextPage === "boolean"
              ? serverPagination.hasNextPage
              : page <
                Math.ceil(
                  (Number(serverPagination.total) ||
                    nextBookings.length) / PAGE_LIMIT
                ),
          hasPreviousPage:
            typeof serverPagination.hasPreviousPage === "boolean"
              ? serverPagination.hasPreviousPage
              : page > 1,
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Load bookings error:", error);

          toast.error(
            getErrorMessage(error, "Failed to load booking requests.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [page, status, search, refreshing]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const openRejectDialog = (booking) => {
    setSelectedBooking(booking);
    setRejectionFeedback("");
    setRejectOpen(true);
  };

  const updateBookingStatus = async (
    bookingId,
    newStatus,
    feedback = ""
  ) => {
    if (!bookingId) {
      toast.error("Booking ID not found.");
      return;
    }

    try {
      setActionLoading(true);

      const tokenResult = await authClient.token();
      const token = tokenResult?.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            ...(newStatus === "Rejected"
              ? { rejectionFeedback: feedback.trim() }
              : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update booking.");
      }

      if (!data.booking) {
        throw new Error("Updated booking data was not returned by the server.");
      }

      setBookings((current) =>
        current.map((booking) =>
          getBookingId(booking) === bookingId
            ? data.booking
            : booking
        )
      );

      setSelectedBooking(data.booking);
      setRejectOpen(false);
      setRejectionFeedback("");

      toast.success(
        newStatus === "Approved"
          ? "Booking approved successfully."
          : "Booking rejected successfully."
      );

      // Reload current page so the total and filtered results stay accurate.
      setRefreshing(true);
    } catch (error) {
      console.error("Update booking error:", error);

      toast.error(
        getErrorMessage(error, "Failed to update booking.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (booking) => {
    updateBookingStatus(getBookingId(booking), "Approved");
  };

  const handleReject = async () => {
    if (!selectedBooking) return;

    if (!rejectionFeedback.trim()) {
      toast.error("Please provide rejection feedback.");
      return;
    }

    await updateBookingStatus(
      getBookingId(selectedBooking),
      "Rejected",
      rejectionFeedback
    );
  };

  const statistics = useMemo(() => {
    return {
      total: pagination.total,
      pending: bookings.filter((item) => item.status === "Pending").length,
      approved: bookings.filter((item) => item.status === "Approved").length,
      rejected: bookings.filter((item) => item.status === "Rejected").length,
    };
  }, [bookings, pagination.total]);

  const handlePageChange = (nextPage) => {
    const totalPages = pagination.totalPages || 1;

    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-full bg-slate-50 p-4 transition-colors dark:bg-zinc-950 sm:p-6">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <div className="space-y-2">
            <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
                Owner Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Booking Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Review reservations and manage your booking requests.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 border-orange-200 bg-white px-3 text-sm text-slate-700 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5 sm:p-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Total Requests
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {statistics.total}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
                <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-amber-100 bg-white shadow-sm dark:border-amber-500/20 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5 sm:p-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {statistics.pending}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-emerald-100 bg-white shadow-sm dark:border-emerald-500/20 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5 sm:p-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statistics.approved}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-red-100 bg-white shadow-sm dark:border-red-500/20 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5 sm:p-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Rejected
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {statistics.rejected}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTERS AND BOOKING CARDS */}
        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-slate-100 p-3 dark:border-zinc-800 sm:p-4">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search tenant, property or location..."
                  className="h-9 border-slate-200 bg-slate-50 pl-9 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className="h-9 bg-orange-500 px-4 text-sm text-white hover:bg-orange-600"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Search
                </Button>

                <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
                  <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />

                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-950 sm:w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                <CalendarDays className="h-5 w-5 text-orange-500" />
              </div>

              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                No booking requests found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-zinc-400">
                There are no bookings matching your selected filters.
              </p>

              {(search || status !== "all") && (
                <Button
                  variant="outline"
                  className="mt-3 h-9"
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
              {/* COMPACT BOOKING CARDS */}
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {bookings.slice(0, PAGE_LIMIT).map((booking) => (
                  <Card
                    key={getBookingId(booking)}
                    className="min-w-0 rounded-xl border-slate-200 bg-white shadow-sm transition duration-200 hover:border-orange-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-orange-500/30"
                  >
                    <CardContent className="p-3.5">
                      {/* TENANT */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="h-9 w-9 shrink-0 border border-slate-200 dark:border-zinc-700">
                            <AvatarImage src={booking.tenant?.photo || ""} />
                            <AvatarFallback className="bg-orange-50 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                              {getInitials(booking.tenant?.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {booking.tenant?.name || "Unknown tenant"}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                              {booking.tenant?.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={booking.status} />
                      </div>

                      <Separator className="my-3 bg-slate-100 dark:bg-zinc-800" />

                      {/* PROPERTY */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {booking.property?.title || "Untitled property"}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                          <span className="truncate">
                            {booking.property?.location || "Location unavailable"}
                          </span>
                        </div>
                      </div>

                      {/* PERIOD AND AMOUNT */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <DetailItem
                          label="Booking Period"
                          value={`${formatShortDate(booking.startDate)} – ${formatShortDate(booking.endDate)}`}
                        />

                        <DetailItem
                          label="Total Amount"
                          value={formatCurrency(booking.totalAmount)}
                        />
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(booking)}
                          className="h-8 border-orange-200 bg-orange-50 px-2.5 text-xs text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View Details
                        </Button>

                        {booking.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(booking)}
                              disabled={actionLoading}
                              className="h-8 bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                            >
                              {actionLoading ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="mr-1 h-3.5 w-3.5" />
                              )}
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectDialog(booking)}
                              disabled={actionLoading}
                              className="h-8 border-red-200 bg-white px-2.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400"
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* PAGINATION */}
          {pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  {pagination.total === 0
                    ? 0
                    : (page - 1) * PAGE_LIMIT + 1}
                  {"–"}
                  {Math.min(page * PAGE_LIMIT, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  {pagination.total}
                </span>{" "}
                bookings
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-8 border-slate-200 bg-white px-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? "default" : "outline"}
                    size="sm"
                    disabled={loading}
                    onClick={() => handlePageChange(pageNumber)}
                    className={
                      pageNumber === page
                        ? "h-8 min-w-8 bg-orange-500 px-2.5 text-xs text-white hover:bg-orange-600"
                        : "h-8 min-w-8 border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    }
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-8 border-slate-200 bg-white px-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* VIEW BOOKING DETAILS POPUP */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-[580px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Booking Details
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Complete tenant, property, booking and payment information.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* TENANT DETAILS */}
              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3.5 dark:border-orange-500/20 dark:bg-orange-500/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-white dark:border-zinc-700">
                    <AvatarImage
                      src={selectedBooking.tenant?.photo || ""}
                    />
                    <AvatarFallback className="bg-orange-500 text-sm font-semibold text-white">
                      {getInitials(selectedBooking.tenant?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedBooking.tenant?.name || "Unknown tenant"}
                    </p>
                    <p className="break-all text-sm text-slate-500 dark:text-zinc-400">
                      {selectedBooking.tenant?.email || "No email provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PROPERTY DETAILS */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Property Information
                </p>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-zinc-800">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedBooking.property?.title || "Untitled property"}
                  </p>

                  <div className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>
                      {selectedBooking.property?.location || "Location unavailable"}
                    </span>
                  </div>

                  {selectedBooking.property?.rentType && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                      Rent type: {selectedBooking.property.rentType}
                    </p>
                  )}
                </div>
              </div>

              {/* BOOKING INFORMATION */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Booking Information
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <DetailItem
                    label="Start Date"
                    value={formatDate(selectedBooking.startDate)}
                  />
                  <DetailItem
                    label="End Date"
                    value={formatDate(selectedBooking.endDate)}
                  />
                  <DetailItem
                    label="Duration"
                    value={
                      selectedBooking.duration
                        ? `${selectedBooking.duration} period`
                        : "—"
                    }
                  />
                  <DetailItem
                    label="Total Amount"
                    value={formatCurrency(selectedBooking.totalAmount)}
                  />
                </div>
              </div>

              {/* PAYMENT STATUS */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-zinc-800">
                <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                  Payment Status
                </span>

                <Badge
                  variant="outline"
                  className={
                    selectedBooking.paymentStatus === "Paid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                  }
                >
                  {selectedBooking.paymentStatus || "Pending"}
                </Badge>
              </div>

              {/* TENANT NOTE */}
              {selectedBooking.note && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Tenant Note
                  </p>

                  <div className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 p-3.5 text-sm leading-6 text-slate-600 dark:border-zinc-800 dark:text-zinc-300">
                    {selectedBooking.note}
                  </div>
                </div>
              )}

              {/* REJECTION FEEDBACK */}
              {selectedBooking.rejectionFeedback && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/30 dark:bg-red-500/10">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Rejection Feedback
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-red-600 dark:text-red-300">
                    {selectedBooking.rejectionFeedback}
                  </p>
                </div>
              )}

              {/* BOOKING STATUS */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-zinc-800">
                <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                  Booking Status
                </span>
                <StatusBadge status={selectedBooking.status} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {selectedBooking?.status === "Pending" && (
              <>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => {
                    const booking = selectedBooking;
                    setDetailsOpen(false);
                    openRejectDialog(booking);
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>

                <Button
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedBooking)}
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

      {/* REJECT BOOKING POPUP */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-[500px]">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <DialogTitle className="text-lg font-bold">
              Reject Booking Request
            </DialogTitle>

            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Provide a clear reason for rejecting this request. The tenant
              will be able to view your feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="rejection-feedback"
              className="text-sm font-semibold text-slate-700 dark:text-zinc-300"
            >
              Rejection Feedback
            </label>

            <textarea
              id="rejection-feedback"
              value={rejectionFeedback}
              onChange={(event) =>
                setRejectionFeedback(event.target.value)
              }
              placeholder="Explain why this booking is being rejected..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:bg-zinc-900 dark:focus:ring-orange-500/10"
            />

            <p className="text-xs text-slate-400 dark:text-zinc-500">
              A rejection reason is required.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={actionLoading}
              className="border-slate-200 dark:border-zinc-700"
            >
              Cancel
            </Button>

            <Button
              onClick={handleReject}
              disabled={actionLoading || !rejectionFeedback.trim()}
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