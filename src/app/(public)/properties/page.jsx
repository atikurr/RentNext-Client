"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const LIMIT = 9;

const PROPERTY_TYPES = [
  "All",
  "Apartment",
  "House",
  "Studio",
  "Condo",
  "Villa",
  "Room",
  "Other",
];

const SORT_OPTIONS = [
  { value: "", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function formatCurrency(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function getRentPeriod(rentType) {
  const type = String(rentType || "Monthly").toLowerCase();

  if (type === "yearly") return "year";
  if (type === "weekly") return "week";
  if (type === "daily") return "day";

  return "month";
}

function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [
      1,
      "...",
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "...",
    current - 1,
    current,
    current + 1,
    "...",
    total,
  ];
}

/* PROPERTY CARD */

function PropertyCard({ property }) {
  const [imageError, setImageError] = useState(false);

  const image = property?.images?.[0];
  const detailsUrl = `/properties/${property._id}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-950/5 dark:border-zinc-800 dark:bg-zinc-900">

      <Link
        href={detailsUrl}
        className="relative block h-56 overflow-hidden bg-zinc-100 sm:h-60"
      >
        {image && !imageError ? (
          <img
            src={image}
            alt={property.title || "Rental property"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
            <Building2 className="h-14 w-14 text-orange-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm">
          {property.type || "Property"}
        </span>

        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Available
        </span>

        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="line-clamp-1 text-lg font-bold text-white">
            {property.title || "Untitled Property"}
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.location || "Location unavailable"}
            </span>
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
          {property.description ||
            "Discover a comfortable rental property that suits your lifestyle."}
        </p>

        <div className="mt-5 grid grid-cols-3 divide-x divide-zinc-200 rounded-xl bg-zinc-50 p-3 dark:divide-zinc-700 dark:bg-zinc-800/70">

          <div className="flex flex-col items-center gap-1 text-center">
            <BedDouble className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold">
              {property.bedrooms ?? 0}
            </span>
            <span className="text-xs text-zinc-500">Beds</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <Bath className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold">
              {property.bathrooms ?? 0}
            </span>
            <span className="text-xs text-zinc-500">Baths</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <Maximize2 className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold">
              {Number(property.size || 0).toLocaleString("en-BD")}
            </span>
            <span className="text-xs text-zinc-500">Sq ft</span>
          </div>

        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Rental price
            </p>

            <p className="mt-1 break-words text-xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
              {formatCurrency(property.rent)}
              <span className="ml-1 text-xs font-medium text-zinc-500">
                /{getRentPeriod(property.rentType)}
              </span>
            </p>
          </div>

          <Link
            href={detailsUrl}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-orange-400"
          >
            Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* LOADING SKELETON */

function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-56 animate-pulse bg-zinc-200 dark:bg-zinc-800 sm:h-60" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-10 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/* EMPTY STATE */

function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/30">
        <Building2 className="h-8 w-8 text-orange-500" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        No properties found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        We could nt find properties matching your search.
        Try another location or change your filters.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        <RotateCcw className="h-4 w-4" />
        Clear Filters
      </button>
    </div>
  );
}

/* MAIN PAGE */

export default function AllPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: LIMIT,
    totalProperties: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchProperties = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (type !== "All") params.set("type", type);
      if (sort) params.set("sort", sort);

      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const response = await fetch(
        `${API_URL}/api/properties?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load properties."
        );
      }

      setProperties(
        Array.isArray(data?.properties) ? data.properties : []
      );

      setPagination(
        data?.pagination || {
          currentPage: page,
          limit: LIMIT,
          totalProperties: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (fetchError) {
      if (fetchError.name === "AbortError") return;

      console.error("Properties loading error:", fetchError);
      setError(fetchError.message || "Failed to load properties.");
      setProperties([]);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [search, type, sort, page]);

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(
      () => fetchProperties(controller.signal),
      search.trim() ? 400 : 0
    );

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [fetchProperties, retryCount, search]);

  const resetFilters = () => {
    setSearch("");
    setType("All");
    setSort("");
    setPage(1);
  };

  const changePage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = getPageNumbers(
    page,
    pagination.totalPages
  );

  const startItem =
    pagination.totalProperties === 0
      ? 0
      : (page - 1) * LIMIT + 1;

  const endItem = Math.min(
    page * LIMIT,
    pagination.totalProperties
  );

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">

      {/* PAGE HERO */}

      <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl dark:bg-orange-950/30" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl dark:bg-amber-950/20" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-orange-600 dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
              <Building2 className="h-3.5 w-3.5" />
              Find your next place
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Explore{" "}
              <span className="text-orange-500">
                All Properties
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base dark:text-zinc-400">
              Find a place that feels like home. Explore approved
              rental properties and choose one that fits your
              lifestyle and budget.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <Building2 className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">
                  {pagination.totalProperties.toLocaleString("en-BD")}
                </span>
                <span className="text-zinc-500">Properties</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  Admin-approved listings
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS */}

      <section className="relative z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_240px]">

              <label className="relative block">
                <span className="sr-only">Search properties</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search location, title, keyword..."
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-orange-950"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Property type</span>
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setPage(1);
                  }}
                  className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-11 pr-10 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-orange-950"
                >
                  {PROPERTY_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All property types" : item}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </label>

              <label className="relative block">
                <span className="sr-only">Sort properties</span>

                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 pr-10 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-orange-950"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </label>

            </div>

            {(search || type !== "All" || sort) && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Filters applied. Update your search or clear all filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROPERTY GRID */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Discover your space
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Available Properties
            </h2>

            {!loading && !error && (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {pagination.totalProperties > 0
                  ? `Showing ${startItem}–${endItem} of ${pagination.totalProperties} properties`
                  : "No matching properties"}
              </p>
            )}
          </div>

          {!loading && !error && pagination.totalPages > 0 && (
            <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Page {page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {error ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-10 text-center dark:border-red-900 dark:bg-zinc-900">
            <Building2 className="h-10 w-10 text-red-500" />

            <h2 className="mt-4 text-lg font-bold">
              Unable to load properties
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {loading
                ? Array.from({ length: LIMIT }, (_, index) => (
                    <PropertySkeleton key={index} />
                  ))
                : properties.length > 0
                  ? properties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        property={property}
                      />
                    ))
                  : <EmptyState onReset={resetFilters} />}
            </div>

            {/* NUMBERED PAGINATION */}

            {!loading && pagination.totalPages > 1 && (
              <nav
                aria-label="Property pagination"
                className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800"
              >
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Showing{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {startItem}–{endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {pagination.totalProperties}
                    </span>
                  </p>

                  <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => changePage(page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {pageNumbers.map((number, index) =>
                      number === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex h-10 w-7 items-center justify-center text-zinc-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={number}
                          type="button"
                          onClick={() => changePage(number)}
                          aria-label={`Go to page ${number}`}
                          aria-current={
                            page === number ? "page" : undefined
                          }
                          className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${
                            page === number
                              ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => changePage(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}