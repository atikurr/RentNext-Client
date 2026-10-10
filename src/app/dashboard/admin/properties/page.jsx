
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
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
import { authClient } from "@/lib/auth-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const panelClass =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

function StatusBadge({ status }) {
  const config = {
    Approved: {
      Icon: CheckCircle2,
      style:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    Rejected: {
      Icon: XCircle,
      style:
        "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    },
    Pending: {
      Icon: Clock3,
      style:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
  };

  const item = config[status] || config.Pending;
  const Icon = item.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${item.style}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status || "Pending"}
    </span>
  );
}

function PropertyImage({ property, className = "" }) {
  const image = property?.images?.[0];

  if (!image) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-800 ${className}`}
      >
        <Building2 className="h-9 w-9" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800 ${className}`}
    >
      <Image
        src={image}
        alt={property?.title || "Property"}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-cover transition duration-500 hover:scale-105"
        unoptimized
      />

      {property?.images?.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-white">
          +{property.images.length - 1} photos
        </span>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className={`${panelClass} animate-pulse p-5`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-40 rounded-xl bg-slate-200 dark:bg-zinc-800 sm:w-56" />
        <div className="flex-1 space-y-4">
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </div>
  );
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalProperties: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  const getToken = useCallback(async () => {
    const result = await authClient.token();

    if (result?.error) {
      throw new Error(
        result.error.message || "Authentication failed."
      );
    }

    const token = result?.data?.token;

    if (!token) {
      throw new Error("Please log in again.");
    }

    return token;
  }, []);

  // LOAD PROPERTIES
  const loadProperties = useCallback(
    async (requestedPage = 1) => {
      try {
        setLoading(true);

        const token = await getToken();
        const params = new URLSearchParams();

        params.set("page", String(requestedPage));
        params.set("limit", "10");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status !== "all") {
          params.set("status", status);
        }

        if (type !== "all") {
          params.set("type", type);
        }

        const response = await fetch(
          `${API_URL}/api/admin/properties?${params.toString()}`,
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
            data?.message || "Failed to load properties."
          );
        }

        setProperties(
          Array.isArray(data?.data) ? data.data : []
        );

        setPagination(
          data?.pagination || {
            currentPage: requestedPage,
            totalProperties: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (error) {
        console.error("Load properties error:", error);
        toast.error(error.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    },
    [getToken, search, status, type]
  );

  // SEARCH / FILTER CHANGE
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProperties(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadProperties]);

  // PAGINATION
  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      loading
    ) {
      return;
    }

    setPage(nextPage);
    loadProperties(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // APPROVE PROPERTY
  const handleApprove = async (property) => {
    if (!property?._id) return;

    try {
      setActionLoading(property._id);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/admin/properties/${property._id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to approve property."
        );
      }

      toast.success("Property approved successfully.");
      setSelectedProperty(null);
      await loadProperties(page);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.message || "Failed to approve property.");
    } finally {
      setActionLoading("");
    }
  };

  // OPEN REJECT MODAL
  const openRejectModal = (property) => {
    setRejectModal(property);
    setRejectionFeedback("");
  };

  // REJECT PROPERTY
  const handleReject = async () => {
    if (!rejectModal?._id) return;

    if (!rejectionFeedback.trim()) {
      toast.error("Please provide rejection feedback.");
      return;
    }

    try {
      setActionLoading(rejectModal._id);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/admin/properties/${rejectModal._id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejectionFeedback: rejectionFeedback.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to reject property."
        );
      }

      toast.success("Property rejected successfully.");
      setRejectModal(null);
      setRejectionFeedback("");
      await loadProperties(page);
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.message || "Failed to reject property.");
    } finally {
      setActionLoading("");
    }
  };

  // DELETE PROPERTY
  const handleDelete = async () => {
    if (!deleteModal?._id) return;

    try {
      setActionLoading(deleteModal._id);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/admin/properties/${deleteModal._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete property."
        );
      }

      toast.success("Property deleted successfully.");
      setDeleteModal(null);

      const nextPage =
        properties.length === 1 && page > 1
          ? page - 1
          : page;

      setPage(nextPage);
      await loadProperties(nextPage);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete property.");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const closeRejectModal = () => {
    if (actionLoading) return;
    setRejectModal(null);
    setRejectionFeedback("");
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setDeleteModal(null);
  };

  // DISPLAY PAGE NUMBERS WITH ELLIPSIS
  const getPageNumbers = () => {
    const current = Number(pagination.currentPage || page);
    const total = Number(pagination.totalPages || 1);

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    const pages = [1];

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let number = start; number <= end; number++) {
      pages.push(number);
    }

    if (current < total - 2) pages.push("...");

    pages.push(total);

    return pages.filter(
      (value, index, array) =>
        value === "..." || array.indexOf(value) === index
    );
  };

  return (
    <main className="min-h-full bg-slate-50/80 text-slate-900 dark:bg-zinc-950 dark:text-white">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              <Building2 className="h-3.5 w-3.5" />
              Property Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              All Properties
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Review, approve and manage properties submitted by owners.
            </p>
          </div>

          <div className={`${panelClass} flex items-center gap-3 px-4 py-3`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xl font-bold tabular-nums">
                {pagination.totalProperties || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Total properties
              </p>
            </div>
          </div>
        </header>

        {/* SEARCH AND FILTERS */}
        <section className={`${panelClass} mb-6 p-4 sm:p-5`}>
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-bold">Search and filters</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search property, location, owner..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={inputClass}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              aria-label="Filter by property type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className={inputClass}
            >
              <option value="all">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
              <option value="Condo">Condo</option>
              <option value="Villa">Villa</option>
              <option value="Room">Room</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </section>

        {/* PROPERTY LIST */}
        <section className="space-y-4">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : properties.length === 0 ? (
            <div className={`${panelClass} px-6 py-20 text-center`}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
                <Building2 className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                No properties found
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-zinc-400">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            properties.map((property) => {
              const isProcessing =
                actionLoading === property._id;

              return (
                <article
                  key={property._id}
                  className={`${panelClass} overflow-hidden transition duration-200 hover:border-orange-200 hover:shadow-md dark:hover:border-orange-500/30`}
                >
                  <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row">

                    <PropertyImage
                      property={property}
                      className="h-48 w-full shrink-0 sm:h-44 xl:h-40 xl:w-56"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                              {property.type || "Property"}
                            </span>

                            <StatusBadge status={property.status} />
                          </div>

                          <h2 className="mt-3 break-words text-lg font-bold">
                            {property.title || "Untitled property"}
                          </h2>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                            <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                            <span className="break-words">
                              {property.location || "Location unavailable"}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            ৳{Number(property.rent || 0).toLocaleString()}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                            / {property.rentType || "Monthly"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 border-y border-slate-100 py-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-orange-500" />
                          {property.bedrooms ?? "—"} Beds
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Bath className="h-4 w-4 text-orange-500" />
                          {property.bathrooms ?? "—"} Baths
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Ruler className="h-4 w-4 text-orange-500" />
                          {property.size ?? "—"} sq ft
                        </span>

                        <span>
                          Added {formatDate(property.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                        <UserRound className="h-4 w-4 text-orange-500" />

                        <span>Owner:</span>

                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          {property?.owner?.name || "Unknown Owner"}
                        </span>

                        {property?.owner?.email && (
                          <>
                            <span>·</span>
                            <span className="break-all">
                              {property.owner.email}
                            </span>
                          </>
                        )}
                      </div>

                      {property.status === "Rejected" &&
                        property.rejectionFeedback && (
                          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-950/50 dark:bg-red-950/20">
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">
                              Rejection feedback
                            </p>

                            <p className="mt-1 text-sm leading-5 text-red-700 dark:text-red-300">
                              {property.rejectionFeedback}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 xl:w-40 xl:shrink-0 xl:flex-col xl:items-stretch xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setSelectedProperty(property)}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold transition hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>

                      {property.status !== "Approved" && (
                        <button
                          type="button"
                          disabled={Boolean(actionLoading)}
                          onClick={() => handleApprove(property)}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Approve
                        </button>
                      )}

                      {property.status !== "Rejected" && (
                        <button
                          type="button"
                          disabled={Boolean(actionLoading)}
                          onClick={() => openRejectModal(property)}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={() => setDeleteModal(property)}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* PAGINATION */}
        {!loading &&
          properties.length > 0 &&
          pagination.totalPages > 1 && (
            <footer
              className={`${panelClass} mt-6 flex flex-col items-center justify-between gap-4 p-4 sm:flex-row`}
            >
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Page{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {pagination.currentPage || page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {pagination.totalPages}
                </span>
                {pagination.totalProperties != null && (
                  <span className="ml-2">
                    · {pagination.totalProperties} properties
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage || loading
                  }
                  onClick={() =>
                    handlePageChange(
                      Number(pagination.currentPage || page) - 1
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold transition hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {getPageNumbers().map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 min-w-7 items-center justify-center text-sm text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      disabled={loading}
                      onClick={() => handlePageChange(pageNumber)}
                      aria-current={
                        Number(pagination.currentPage || page) === pageNumber
                          ? "page"
                          : undefined
                      }
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        Number(pagination.currentPage || page) === pageNumber
                          ? "bg-orange-500 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() =>
                    handlePageChange(
                      Number(pagination.currentPage || page) + 1
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold transition hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </footer>
          )}
      </div>

      {/* VIEW PROPERTY MODAL */}
      {selectedProperty && (
        <Modal
          title="Property Details"
          subtitle="Admin property preview"
          wide
          onClose={() => setSelectedProperty(null)}
        >
          {selectedProperty.images?.[0] && (
            <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-72 dark:bg-zinc-800">
              <Image
                src={selectedProperty.images[0]}
                alt={selectedProperty.title || "Property"}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={selectedProperty.status} />

            <span className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              {selectedProperty.type || "Property"}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold">
            {selectedProperty.title || "Untitled property"}
          </h3>

          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
            <MapPin className="h-4 w-4 text-orange-500" />
            {selectedProperty.location || "Location unavailable"}
          </p>

          <p className="mt-4 text-2xl font-bold text-orange-600 dark:text-orange-400">
            ৳{Number(selectedProperty.rent || 0).toLocaleString()}

            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-zinc-400">
              / {selectedProperty.rentType || "Monthly"}
            </span>
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Bedrooms", selectedProperty.bedrooms ?? "—"],
              ["Bathrooms", selectedProperty.bathrooms ?? "—"],
              [
                "Size",
                selectedProperty.size
                  ? `${selectedProperty.size} sq ft`
                  : "—",
              ],
              ["Added", formatDate(selectedProperty.createdAt)],
              [
                "Owner",
                selectedProperty?.owner?.name || "Unknown Owner",
              ],
              [
                "Owner Email",
                selectedProperty?.owner?.email || "—",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 p-3 dark:border-zinc-800"
              >
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {selectedProperty.description && (
            <div className="mt-5">
              <h4 className="text-sm font-bold">Description</h4>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-zinc-300">
                {selectedProperty.description}
              </p>
            </div>
          )}

          {selectedProperty.status === "Rejected" &&
            selectedProperty.rejectionFeedback && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-950/50 dark:bg-red-950/20">
                <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
                  Rejection feedback
                </h4>

                <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-300">
                  {selectedProperty.rejectionFeedback}
                </p>
              </div>
            )}
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <Modal
          title="Reject property"
          subtitle="Provide a clear reason for the property owner."
          onClose={closeRejectModal}
        >
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <p className="text-sm leading-5 text-amber-800 dark:text-amber-300">
              You are rejecting{" "}
              <strong>{rejectModal.title || "this property"}</strong>.
              Please include a clear reason.
            </p>
          </div>

          <label
            htmlFor="rejectionFeedback"
            className="mt-5 block text-sm font-semibold"
          >
            Rejection feedback <span className="text-red-500">*</span>
          </label>

          <textarea
            id="rejectionFeedback"
            value={rejectionFeedback}
            onChange={(event) =>
              setRejectionFeedback(event.target.value)
            }
            rows={5}
            maxLength={1000}
            placeholder="Explain why this property is being rejected..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {rejectionFeedback.length}/1000
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={closeRejectModal}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                Boolean(actionLoading) || !rejectionFeedback.trim()
              }
              onClick={handleReject}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === rejectModal._id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Confirm rejection
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <Modal
          title="Delete property?"
          subtitle="This action cannot be undone."
          onClose={closeDeleteModal}
        >
          <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-950/50 dark:bg-red-950/20">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                Permanently delete this listing
              </p>

              <p className="mt-1 text-sm leading-5 text-red-700 dark:text-red-400">
                Are you sure you want to delete{" "}
                <strong>{deleteModal.title || "this property"}</strong>?
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={closeDeleteModal}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={Boolean(actionLoading)}
              onClick={handleDelete}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === deleteModal._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete property
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
