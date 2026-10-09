"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  UserRound,
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
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
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

function PropertyImage({ property }) {
  const image =
    property?.images?.[0] || "";

  if (!image) {
    return (
      <div className="flex h-28 w-40 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Building2 className="h-8 w-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <Image
        src={image}
        alt={
          property?.title ||
          "Property"
        }
        fill
        sizes="160px"
        className="object-cover"
        unoptimized
      />

      {property?.images?.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
          +{property.images.length - 1}
        </span>
      )}
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
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-4">
        <div className="h-28 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex-1">
          <div className="h-5 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-3 h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-5 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN ALL PROPERTIES
|--------------------------------------------------------------------------
*/

export default function AdminPropertiesPage() {
  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [type, setType] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      limit: 10,
      totalProperties: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  /*
  |--------------------------------------------------------------------------
  | MODALS
  |--------------------------------------------------------------------------
  */

  const [selectedProperty, setSelectedProperty] =
    useState(null);

  const [rejectModal, setRejectModal] =
    useState(null);

  const [deleteModal, setDeleteModal] =
    useState(null);

  const [rejectionFeedback, setRejectionFeedback] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | GET TOKEN
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
  | LOAD PROPERTIES
  |--------------------------------------------------------------------------
  */

  const loadProperties =
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

          if (type !== "all") {
            params.set(
              "type",
              type
            );
          }

          const response =
            await fetch(
              `${API_URL}/api/admin/properties?${params.toString()}`,
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
                "Failed to load properties."
            );
          }

          setProperties(
            data?.data || []
          );

          setPagination(
            data?.pagination || {
              currentPage: 1,
              limit: 10,
              totalProperties: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          );
        } catch (error) {
          console.error(
            "Admin properties error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to load properties."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        getToken,
        search,
        status,
        type,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL + FILTER LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setPage(1);
        loadProperties(1);
      }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [loadProperties]);

  /*
  |--------------------------------------------------------------------------
  | APPROVE PROPERTY
  |--------------------------------------------------------------------------
  */

  const handleApprove =
    useCallback(
      async (property) => {
        if (!property?._id) {
          toast.error(
            "Property ID is missing."
          );

          return;
        }

        try {
          setActionLoading(
            property._id
          );

          const token =
            await getToken();

          const response =
            await fetch(
              `${API_URL}/api/admin/properties/${property._id}/approve`,
              {
                method: "PATCH",
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
                "Failed to approve property."
            );
          }

          toast.success(
            "Property approved successfully."
          );

          await loadProperties(page);
        } catch (error) {
          console.error(
            "Approve property error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to approve property."
          );
        } finally {
          setActionLoading("");
        }
      },
      [
        getToken,
        loadProperties,
        page,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | OPEN REJECT MODAL
  |--------------------------------------------------------------------------
  */

  const openRejectModal =
    useCallback(
      (property) => {
        setRejectModal(property);
        setRejectionFeedback("");
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | REJECT PROPERTY
  |--------------------------------------------------------------------------
  */

  const handleReject =
    useCallback(async () => {
      if (!rejectModal?._id) {
        toast.error(
          "Property ID is missing."
        );

        return;
      }

      if (
        !rejectionFeedback.trim()
      ) {
        toast.error(
          "Please provide rejection feedback."
        );

        return;
      }

      try {
        setActionLoading(
          rejectModal._id
        );

        const token =
          await getToken();

        const response =
          await fetch(
            `${API_URL}/api/admin/properties/${rejectModal._id}/reject`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
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
              "Failed to reject property."
          );
        }

        toast.success(
          "Property rejected successfully."
        );

        setRejectModal(null);
        setRejectionFeedback("");

        await loadProperties(page);
      } catch (error) {
        console.error(
          "Reject property error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to reject property."
        );
      } finally {
        setActionLoading("");
      }
    }, [
      rejectModal,
      rejectionFeedback,
      getToken,
      loadProperties,
      page,
    ]);

  /*
  |--------------------------------------------------------------------------
  | DELETE PROPERTY
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    useCallback(async () => {
      if (!deleteModal?._id) {
        toast.error(
          "Property ID is missing."
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
            `${API_URL}/api/admin/properties/${deleteModal._id}`,
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
              "Failed to delete property."
          );
        }

        toast.success(
          "Property deleted successfully."
        );

        setDeleteModal(null);

        await loadProperties(page);
      } catch (error) {
        console.error(
          "Delete property error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to delete property."
        );
      } finally {
        setActionLoading("");
      }
    }, [
      deleteModal,
      getToken,
      loadProperties,
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
        loadProperties(nextPage);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      [
        pagination.totalPages,
        loadProperties,
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

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODALS
  |--------------------------------------------------------------------------
  */

  const closeRejectModal =
    () => {
      if (actionLoading) {
        return;
      }

      setRejectModal(null);
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
              Property Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              All Properties
            </h1>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Review, approve and manage rental
              properties submitted by owners.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <Building2 className="h-4 w-4 text-zinc-500" />

            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {pagination.totalProperties || 0}
            </span>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Properties
            </span>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px]">

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
                placeholder="Search property, location, owner..."
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-10 pr-8 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="all">
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
              </select>
            </div>

            {/* TYPE */}

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            >
              <option value="all">
                All Property Types
              </option>

              <option value="Apartment">
                Apartment
              </option>

              <option value="House">
                House
              </option>

              <option value="Studio">
                Studio
              </option>

              <option value="Condo">
                Condo
              </option>

              <option value="Villa">
                Villa
              </option>

              <option value="Room">
                Room
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>
        </div>

        {/* =================================================
            PROPERTY LIST
        ================================================= */}

        {loading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <Building2 className="h-8 w-8 text-zinc-400" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">
              No properties found
            </h2>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Try changing your search or
              filter options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {properties.map(
              (property) => {
                const isProcessing =
                  actionLoading ===
                  property._id;

                return (
                  <div
                    key={
                      property._id
                    }
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row">

                      {/* IMAGE */}

                      <PropertyImage
                        property={
                          property
                        }
                      />

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col justify-between gap-3 sm:flex-row">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {
                                  property.type
                                }
                              </span>

                              <StatusBadge
                                status={
                                  property.status
                                }
                              />
                            </div>

                            <h2 className="mt-2 truncate text-lg font-bold text-zinc-950 dark:text-white">
                              {
                                property.title
                              }
                            </h2>

                            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                              <MapPin className="h-4 w-4 shrink-0" />

                              <span className="truncate">
                                {
                                  property.location
                                }
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 sm:text-right">
                            <p className="text-lg font-bold text-zinc-950 dark:text-white">
                              ৳
                              {Number(
                                property.rent || 0
                              ).toLocaleString()}
                            </p>

                            <p className="text-xs text-zinc-400">
                              /{" "}
                              {property.rentType ||
                                "Monthly"}
                            </p>
                          </div>
                        </div>

                        {/* STATS */}

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-zinc-100 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">

                          <span className="inline-flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4" />

                            {
                              property.bedrooms
                            }{" "}
                            Beds
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Bath className="h-4 w-4" />

                            {
                              property.bathrooms
                            }{" "}
                            Baths
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Ruler className="h-4 w-4" />

                            {
                              property.size
                            }{" "}
                            sq ft
                          </span>

                          <span className="text-zinc-300 dark:text-zinc-700">
                            |
                          </span>

                          <span>
                            Added{" "}
                            {formatDate(
                              property.createdAt
                            )}
                          </span>
                        </div>

                        {/* OWNER */}

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <UserRound className="h-4 w-4" />

                          <span>
                            Owner:
                          </span>

                          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                            {
                              property
                                ?.owner
                                ?.name ||
                              "Unknown Owner"
                            }
                          </span>

                          {property
                            ?.owner
                            ?.email && (
                            <>
                              <span>
                                •
                              </span>

                              <span className="truncate">
                                {
                                  property
                                    .owner
                                    .email
                                }
                              </span>
                            </>
                          )}
                        </div>

                        {/* REJECTION FEEDBACK */}

                        {property.status ===
                          "Rejected" &&
                          property.rejectionFeedback && (
                            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 dark:border-red-950/50 dark:bg-red-950/20">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                                Rejection Feedback
                              </p>

                              <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">
                                {
                                  property.rejectionFeedback
                                }
                              </p>
                            </div>
                          )}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 flex-row items-center gap-2 border-t border-zinc-100 pt-4 sm:justify-end lg:w-[170px] lg:flex-col lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 dark:border-zinc-800">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProperty(
                              property
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:flex-none lg:w-full dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        {/* APPROVE */}

                        {property.status !==
                          "Approved" && (
                          <button
                            type="button"
                            disabled={
                              Boolean(
                                actionLoading
                              )
                            }
                            onClick={() =>
                              handleApprove(
                                property
                              )
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none lg:w-full"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}

                            Approve
                          </button>
                        )}

                        {/* REJECT */}

                        {property.status !==
                          "Rejected" && (
                          <button
                            type="button"
                            disabled={
                              Boolean(
                                actionLoading
                              )
                            }
                            onClick={() =>
                              openRejectModal(
                                property
                              )
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none lg:w-full"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          disabled={
                            Boolean(
                              actionLoading
                            )
                          }
                          onClick={() =>
                            setDeleteModal(
                              property
                            )
                          }
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-10 lg:w-full dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                          title="Delete property"
                        >
                          <Trash2 className="h-4 w-4" />

                          <span className="sr-only">
                            Delete
                          </span>
                        </button>
                      </div>
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
          properties.length > 0 &&
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
          VIEW PROPERTY MODAL
      ================================================= */}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Property Details
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Admin property preview
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProperty(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6">

              {/* IMAGE */}

              {selectedProperty
                .images?.[0] && (
                <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-zinc-100 sm:h-80 dark:bg-zinc-800">
                  <Image
                    src={
                      selectedProperty
                        .images[0]
                    }
                    alt={
                      selectedProperty.title
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* TITLE */}

              <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={
                        selectedProperty.status
                      }
                    />

                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {
                        selectedProperty.type
                      }
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
                    {
                      selectedProperty.title
                    }
                  </h3>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-4 w-4" />

                    {
                      selectedProperty.location
                    }
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xl font-bold text-zinc-950 dark:text-white">
                    ৳
                    {Number(
                      selectedProperty.rent ||
                        0
                    ).toLocaleString()}
                  </p>

                  <p className="text-xs text-zinc-400">
                    /{" "}
                    {
                      selectedProperty.rentType
                    }
                  </p>
                </div>
              </div>

              {/* DETAILS */}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                  <BedDouble className="h-4 w-4 text-zinc-500" />

                  <p className="mt-2 text-xs text-zinc-400">
                    Bedrooms
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {
                      selectedProperty.bedrooms
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                  <Bath className="h-4 w-4 text-zinc-500" />

                  <p className="mt-2 text-xs text-zinc-400">
                    Bathrooms
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {
                      selectedProperty.bathrooms
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                  <Ruler className="h-4 w-4 text-zinc-500" />

                  <p className="mt-2 text-xs text-zinc-400">
                    Size
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {
                      selectedProperty.size
                    }{" "}
                    sq ft
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                  <Building2 className="h-4 w-4 text-zinc-500" />

                  <p className="mt-2 text-xs text-zinc-400">
                    Images
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {
                      selectedProperty
                        .images
                        ?.length || 0
                    }
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-6">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Description
                </h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {
                    selectedProperty.description
                  }
                </p>
              </div>

              {/* OWNER */}

              <div className="mt-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Property Owner
                </h4>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <UserRound className="h-5 w-5 text-zinc-500" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {
                        selectedProperty
                          ?.owner
                          ?.name
                      }
                    </p>

                    <p className="text-xs text-zinc-400">
                      {
                        selectedProperty
                          ?.owner
                          ?.email
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* FEEDBACK */}

              {selectedProperty.status ===
                "Rejected" &&
                selectedProperty.rejectionFeedback && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-950/50 dark:bg-red-950/20">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                      <div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">
                          Rejection Feedback
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
                          {
                            selectedProperty.rejectionFeedback
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          REJECT MODAL
      ================================================= */}

      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="flex items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Reject Property
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Provide clear feedback to the
                  property owner.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRejectModal
                }
                disabled={
                  Boolean(
                    actionLoading
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">

              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                  {
                    rejectModal.title
                  }
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {
                    rejectModal.location
                  }
                </p>
              </div>

              <label className="mt-5 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
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
                rows={5}
                placeholder="Explain why this property is being rejected..."
                className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={
                    closeRejectModal
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
                    handleReject
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
                    <XCircle className="h-4 w-4" />
                  )}

                  Reject Property
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="p-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">
                Delete Property?
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Are you sure you want to permanently
                delete{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {deleteModal.title}
                </span>
                ? This action cannot be undone.
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