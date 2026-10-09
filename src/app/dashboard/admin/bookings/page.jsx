"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Search,
  CalendarCheck2,
  MapPin,
  UserRound,
  Building2,
  CreditCard,
  Clock3,
  CheckCircle2,
  XCircle,
  Ban,
  CircleCheck,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  CalendarDays,
  WalletCards,
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| BOOKING STATUS BADGE
|--------------------------------------------------------------------------
*/

function BookingStatusBadge({ status }) {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        <Ban className="h-3.5 w-3.5" />
        Cancelled
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
        <CircleCheck className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PAYMENT BADGE
|--------------------------------------------------------------------------
*/

function PaymentStatusBadge({
  status,
}) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CreditCard className="h-3.5 w-3.5" />
        Paid
      </span>
    );
  }

  if (status === "Failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  if (status === "Refunded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
        <WalletCards className="h-3.5 w-3.5" />
        Refunded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY IMAGE
|--------------------------------------------------------------------------
*/

function PropertyImage({
  booking,
}) {
  const image =
    booking?.property?.image || "";

  if (!image) {
    return (
      <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Building2 className="h-6 w-6 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <Image
        src={image}
        alt={
          booking?.property?.title ||
          "Property"
        }
        fill
        sizes="80px"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING CARD
|--------------------------------------------------------------------------
*/

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-4">
        <div className="h-16 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex-1">
          <div className="h-4 w-52 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-2 h-3 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-4 h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN BOOKINGS PAGE
|--------------------------------------------------------------------------
*/

export default function AdminBookingsPage() {
  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [paymentStatus, setPaymentStatus] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      limit: 10,
      totalBookings: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [statusModal, setStatusModal] =
    useState(null);

  const [deleteModal, setDeleteModal] =
    useState(null);

  const [newStatus, setNewStatus] =
    useState("Approved");

  const [rejectionFeedback, setRejectionFeedback] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | TOKEN
  |--------------------------------------------------------------------------
  */

  const getToken = useCallback(
    async () => {
      const result =
        await authClient.token();

      if (result?.error) {
        throw new Error(
          result.error.message ||
            "Unable to generate authentication token."
        );
      }

      const token =
        result?.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      return token;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD BOOKINGS
  |--------------------------------------------------------------------------
  */

  const loadBookings =
    useCallback(
      async (requestedPage = 1) => {
        try {
          setLoading(true);

          const token =
            await getToken();

          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(requestedPage)
          );

          params.set(
            "limit",
            "10"
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

          if (
            paymentStatus !==
            "all"
          ) {
            params.set(
              "paymentStatus",
              paymentStatus
            );
          }

          const response =
            await fetch(
              `${API_URL}/api/admin/bookings?${params.toString()}`,
              {
                method: "GET",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load bookings."
            );
          }

          setBookings(
            data?.data || []
          );

          setPagination(
            data?.pagination || {
              currentPage: 1,
              limit: 10,
              totalBookings: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          );
        } catch (error) {
          console.error(
            "Admin bookings error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to load bookings."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        getToken,
        search,
        status,
        paymentStatus,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | FILTER LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setPage(1);
        loadBookings(1);
      }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [loadBookings]);

  /*
  |--------------------------------------------------------------------------
  | OPEN STATUS MODAL
  |--------------------------------------------------------------------------
  */

  const openStatusModal =
    useCallback((booking) => {
      setStatusModal(booking);

      setNewStatus(
        booking?.status ||
          "Approved"
      );

      setRejectionFeedback(
        booking?.rejectionFeedback ||
          ""
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE BOOKING STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatusUpdate =
    useCallback(async () => {
      if (!statusModal?._id) {
        toast.error(
          "Booking ID is missing."
        );

        return;
      }

      if (
        ![
          "Pending",
          "Approved",
          "Rejected",
          "Cancelled",
          "Completed",
        ].includes(newStatus)
      ) {
        toast.error(
          "Invalid booking status."
        );

        return;
      }

      if (
        newStatus ===
          "Rejected" &&
        !rejectionFeedback.trim()
      ) {
        toast.error(
          "Rejection feedback is required."
        );

        return;
      }

      try {
        setActionLoading(
          statusModal._id
        );

        const token =
          await getToken();

        const response =
          await fetch(
            `${API_URL}/api/admin/bookings/${statusModal._id}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status:
                  newStatus,

                rejectionFeedback:
                  rejectionFeedback.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update booking status."
          );
        }

        toast.success(
          "Booking status updated successfully."
        );

        setStatusModal(null);
        setRejectionFeedback("");

        await loadBookings(page);
      } catch (error) {
        console.error(
          "Booking status update error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update booking status."
        );
      } finally {
        setActionLoading("");
      }
    }, [
      statusModal,
      newStatus,
      rejectionFeedback,
      getToken,
      loadBookings,
      page,
    ]);

  /*
  |--------------------------------------------------------------------------
  | DELETE BOOKING
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    useCallback(async () => {
      if (!deleteModal?._id) {
        toast.error(
          "Booking ID is missing."
        );

        return;
      }

      try {
        setActionLoading(
          deleteModal._id
        );

        const token =
          await getToken();

        const response =
          await fetch(
            `${API_URL}/api/admin/bookings/${deleteModal._id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to delete booking."
          );
        }

        toast.success(
          "Booking deleted successfully."
        );

        setDeleteModal(null);

        await loadBookings(page);
      } catch (error) {
        console.error(
          "Delete booking error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to delete booking."
        );
      } finally {
        setActionLoading("");
      }
    }, [
      deleteModal,
      getToken,
      loadBookings,
      page,
    ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const handlePageChange =
    useCallback(
      (nextPage) => {
        if (
          nextPage < 1 ||
          nextPage >
            pagination.totalPages
        ) {
          return;
        }

        setPage(nextPage);

        loadBookings(nextPage);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      [
        pagination.totalPages,
        loadBookings,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate =
    useCallback((date) => {
      if (!date) {
        return "—";
      }

      return new Date(
        date
      ).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    }, []);

  const formatDateTime =
    useCallback((date) => {
      if (!date) {
        return "—";
      }

      return new Date(
        date
      ).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODALS
  |--------------------------------------------------------------------------
  */

  const closeStatusModal =
    () => {
      if (actionLoading) {
        return;
      }

      setStatusModal(null);
      setRejectionFeedback("");
    };

  const closeDeleteModal =
    () => {
      if (actionLoading) {
        return;
      }

      setDeleteModal(null);
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950">

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Booking Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              All Bookings
            </h1>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Monitor and manage all property
              booking requests.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <CalendarCheck2 className="h-4 w-4 text-zinc-500" />

            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {
                pagination.totalBookings ||
                0
              }
            </span>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Bookings
            </span>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_200px]">

            {/* SEARCH */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search property, tenant or owner..."
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />
            </div>

            {/* BOOKING STATUS */}

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            >
              <option value="all">
                All Booking Status
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

            {/* PAYMENT STATUS */}

            <select
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            >
              <option value="all">
                All Payment Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Failed">
                Failed
              </option>

              <option value="Refunded">
                Refunded
              </option>
            </select>
          </div>
        </div>

        {/* =================================================
            BOOKINGS
        ================================================= */}

        {loading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : bookings.length ===
          0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <CalendarCheck2 className="h-8 w-8 text-zinc-400" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">
              No bookings found
            </h2>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Try changing your search or
              filter options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {bookings.map(
              (booking) => {
                const isProcessing =
                  actionLoading ===
                  booking._id;

                return (
                  <div
                    key={
                      booking._id
                    }
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="p-4 sm:p-5">

                      {/* TOP */}

                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                        {/* PROPERTY */}

                        <div className="flex min-w-0 flex-1 gap-4">
                          <PropertyImage
                            booking={
                              booking
                            }
                          />

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">
                              <BookingStatusBadge
                                status={
                                  booking.status
                                }
                              />

                              <PaymentStatusBadge
                                status={
                                  booking.paymentStatus
                                }
                              />
                            </div>

                            <h2 className="mt-2 truncate text-base font-bold text-zinc-950 dark:text-white">
                              {
                                booking
                                  ?.property
                                  ?.title
                              }
                            </h2>

                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />

                              {
                                booking
                                  ?.property
                                  ?.location
                              }
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">

                              <span className="inline-flex items-center gap-1.5">
                                <UserRound className="h-3.5 w-3.5" />

                                Tenant:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                  {
                                    booking
                                      ?.tenant
                                      ?.name
                                  }
                                </span>
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />

                                Move-in:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                  {formatDate(
                                    booking.moveInDate
                                  )}
                                </span>
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <WalletCards className="h-3.5 w-3.5" />

                                Duration:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                  {
                                    booking.duration
                                  }{" "}
                                  month
                                  {booking.duration !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AMOUNT */}

                        <div className="shrink-0 border-t border-zinc-100 pt-4 xl:w-[150px] xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                          <p className="text-xs text-zinc-400">
                            Total Amount
                          </p>

                          <p className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                            ৳
                            {Number(
                              booking.totalAmount ||
                                0
                            ).toLocaleString()}
                          </p>

                          <p className="mt-1 text-[11px] text-zinc-400">
                            {booking
                              ?.property
                              ?.rentType ||
                              "Monthly"}{" "}
                            rent
                          </p>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 gap-2 border-t border-zinc-100 pt-4 xl:w-[190px] xl:flex-col xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBooking(
                                booking
                              )
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:flex-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Eye className="h-4 w-4" />

                            View Details
                          </button>

                          <button
                            type="button"
                            disabled={
                              Boolean(
                                actionLoading
                              )
                            }
                            onClick={() =>
                              openStatusModal(
                                booking
                              )
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CircleCheck className="h-4 w-4" />
                            )}

                            Manage Status
                          </button>

                          <button
                            type="button"
                            disabled={
                              Boolean(
                                actionLoading
                              )
                            }
                            onClick={() =>
                              setDeleteModal(
                                booking
                              )
                            }
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                            <Trash2 className="h-4 w-4" />

                            <span className="sr-only">
                              Delete booking
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* REJECTION FEEDBACK */}

                      {booking.status ===
                        "Rejected" &&
                        booking.rejectionFeedback && (
                          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-950/50 dark:bg-red-950/20">
                            <div className="flex gap-3">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />

                              <div>
                                <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                  Rejection Feedback
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">
                                  {
                                    booking.rejectionFeedback
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          bookings.length > 0 &&
          pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row dark:border-zinc-800 dark:bg-zinc-900">

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Page{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {
                    pagination.currentPage
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {
                    pagination.totalPages
                  }
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.currentPage -
                        1
                    )
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />

                  Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-zinc-950 px-3 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
                  {
                    pagination.currentPage
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.currentPage +
                        1
                    )
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next

                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* =================================================
          BOOKING DETAILS MODAL
      ================================================= */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Booking Details
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Complete booking information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* PROPERTY */}

              <section>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Property
                </h3>

                <div className="mt-3 flex gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <PropertyImage
                    booking={
                      selectedBooking
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-950 dark:text-white">
                      {
                        selectedBooking
                          ?.property
                          ?.title
                      }
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <MapPin className="h-3.5 w-3.5" />

                      {
                        selectedBooking
                          ?.property
                          ?.location
                      }
                    </p>

                    <p className="mt-3 text-sm font-bold text-zinc-950 dark:text-white">
                      ৳
                      {Number(
                        selectedBooking
                          ?.property
                          ?.rent || 0
                      ).toLocaleString()}{" "}
                      /{" "}
                      {
                        selectedBooking
                          ?.property
                          ?.rentType
                      }
                    </p>
                  </div>
                </div>
              </section>

              {/* TENANT + OWNER */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* TENANT */}

                <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Tenant
                  </h3>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <UserRound className="h-5 w-5 text-zinc-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {
                          selectedBooking
                            ?.tenant
                            ?.name
                        }
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                        <Mail className="h-3 w-3" />

                        {
                          selectedBooking
                            ?.tenant
                            ?.email
                        }
                      </p>

                      {selectedBooking
                        ?.tenant
                        ?.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                          <Phone className="h-3 w-3" />

                          {
                            selectedBooking
                              .tenant
                              .phone
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* OWNER */}

                <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Owner
                  </h3>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Building2 className="h-5 w-5 text-zinc-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {
                          selectedBooking
                            ?.owner
                            ?.name
                        }
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                        <Mail className="h-3 w-3" />

                        {
                          selectedBooking
                            ?.owner
                            ?.email
                        }
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* BOOKING INFO */}

              <section>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Booking Information
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                    <CalendarDays className="h-4 w-4 text-zinc-500" />

                    <p className="mt-2 text-xs text-zinc-400">
                      Move-in Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {formatDate(
                        selectedBooking.moveInDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                    <Clock3 className="h-4 w-4 text-zinc-500" />

                    <p className="mt-2 text-xs text-zinc-400">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {
                        selectedBooking.duration
                      }{" "}
                      month
                      {selectedBooking.duration !==
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                    <WalletCards className="h-4 w-4 text-zinc-500" />

                    <p className="mt-2 text-xs text-zinc-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      ৳
                      {Number(
                        selectedBooking.totalAmount ||
                          0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                    <CreditCard className="h-4 w-4 text-zinc-500" />

                    <p className="mt-2 text-xs text-zinc-400">
                      Payment
                    </p>

                    <div className="mt-1">
                      <PaymentStatusBadge
                        status={
                          selectedBooking.paymentStatus
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* NOTES */}

              {selectedBooking.additionalNotes && (
                <section>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Additional Notes
                  </h3>

                  <p className="mt-3 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300">
                    {
                      selectedBooking.additionalNotes
                    }
                  </p>
                </section>
              )}

              {/* REJECTION */}

              {selectedBooking.rejectionFeedback && (
                <section className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-950/50 dark:bg-red-950/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                    <div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">
                        Rejection Feedback
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
                        {
                          selectedBooking.rejectionFeedback
                        }
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* TIMESTAMPS */}

              <div className="border-t border-zinc-200 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
                Created:{" "}
                {formatDateTime(
                  selectedBooking.createdAt
                )}

                {selectedBooking.updatedAt && (
                  <>
                    {" "}
                    • Updated:{" "}
                    {formatDateTime(
                      selectedBooking.updatedAt
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          STATUS MODAL
      ================================================= */}

      {statusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="flex items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Manage Booking Status
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update the booking status for{" "}
                  <span className="font-semibold">
                    {
                      statusModal
                        ?.property
                        ?.title
                    }
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeStatusModal
                }
                disabled={
                  Boolean(
                    actionLoading
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">

              <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Booking Status
              </label>

              <select
                value={newStatus}
                onChange={(event) =>
                  setNewStatus(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
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

              {newStatus ===
                "Rejected" && (
                <>
                  <label className="mt-5 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Rejection Feedback
                  </label>

                  <textarea
                    value={
                      rejectionFeedback
                    }
                    onChange={(
                      event
                    ) =>
                      setRejectionFeedback(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    placeholder="Explain why this booking is being rejected..."
                    className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                  />
                </>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={
                    closeStatusModal
                  }
                  disabled={
                    Boolean(
                      actionLoading
                    )
                  }
                  className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleStatusUpdate
                  }
                  disabled={
                    Boolean(
                      actionLoading
                    )
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="p-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">
                Delete Booking?
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Are you sure you want to permanently
                delete this booking? This action
                cannot be undone.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    Boolean(
                      actionLoading
                    )
                  }
                  className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    Boolean(
                      actionLoading
                    )
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}