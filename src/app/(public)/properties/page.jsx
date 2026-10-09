"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| PROPERTY TYPES
|--------------------------------------------------------------------------
*/

const propertyTypes = [
  "All",
  "Apartment",
  "House",
  "Studio",
  "Condo",
  "Villa",
  "Room",
  "Other",
];

/*
|--------------------------------------------------------------------------
| SORT OPTIONS
|--------------------------------------------------------------------------
*/

const sortOptions = [
  {
    value: "",
    label: "Newest First",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
];

/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (amount) => {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
};

/*
|--------------------------------------------------------------------------
| PROPERTY CARD
|--------------------------------------------------------------------------
*/

function PropertyCard({ property }) {
  const image = property?.images?.[0] || "";

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {image ? (
          <img
            src={image}
            alt={property.title || "Property"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-zinc-400" />
          </div>
        )}

        {/* PROPERTY TYPE */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur dark:bg-zinc-950/90 dark:text-zinc-100">
            {property.type || "Property"}
          </span>
        </div>

        {/* AVAILABLE */}
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            Available
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {/* TITLE */}
        <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          {property.title || "Untitled Property"}
        </h2>

        {/* LOCATION */}
        <div className="mt-2 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

          <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
            {property.location || "Location unavailable"}
          </p>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-3 line-clamp-2 min-h-[40px] text-sm leading-5 text-zinc-500 dark:text-zinc-400">
          {property.description ||
            "Discover this comfortable rental property."}
        </p>

        {/* DETAILS */}
        <div className="mt-5 flex items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {/* BEDROOMS */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <BedDouble className="h-4 w-4" />

            <span>{property.bedrooms || 0} Beds</span>
          </div>

          {/* BATHROOMS */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <Bath className="h-4 w-4" />

            <span>{property.bathrooms || 0} Baths</span>
          </div>

          {/* SIZE */}
          <div className="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
            {property.size || 0} sq ft
          </div>
        </div>

        {/* PRICE + BUTTON */}
        <div className="mt-5 flex items-center justify-between gap-4">
          {/* PRICE */}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-zinc-950 dark:text-white">
              {formatCurrency(property.rent)}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              per {(property.rentType || "Monthly").toLowerCase()}
            </p>
          </div>

          {/* VIEW DETAILS */}
          {property?._id ? (
            <Link
              href={`/properties/${property._id}`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white no-underline transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              View Details

              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-zinc-300 px-4 text-sm font-semibold text-zinc-500"
            >
              View Details

              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING SKELETON
|--------------------------------------------------------------------------
*/

function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-60 animate-pulse bg-zinc-200 dark:bg-zinc-800" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Building2 className="h-7 w-7 text-zinc-500" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-zinc-950 dark:text-white">
        No properties found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        We couldn&apos;t find any approved properties matching your current
        search or filter. Try changing your search criteria.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Clear Filters
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

export default function AllPropertiesPage() {
  const [properties, setProperties] = useState([]);

  const [search, setSearch] = useState("");

  const [type, setType] = useState("All");

  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 9,
    totalProperties: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH PROPERTIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if (search.trim()) {
          params.set("search", search.trim());
        }

        /*
        |--------------------------------------------------------------------------
        | PROPERTY TYPE
        |--------------------------------------------------------------------------
        */

        if (type && type !== "All") {
          params.set("type", type);
        }

        /*
        |--------------------------------------------------------------------------
        | SORT
        |--------------------------------------------------------------------------
        */

        if (sort) {
          params.set("sort", sort);
        }

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        params.set("page", String(page));

        params.set("limit", "9");

        /*
        |--------------------------------------------------------------------------
        | API REQUEST
        |--------------------------------------------------------------------------
        */

        const response = await fetch(
          `${API_URL}/api/properties?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load properties."
          );
        }

        if (cancelled) {
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | PROPERTIES
        |--------------------------------------------------------------------------
        */

        setProperties(
          Array.isArray(data?.properties) ? data.properties : []
        );

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        setPagination(
          data?.pagination || {
            currentPage: page,
            limit: 9,
            totalProperties: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (fetchError) {
        console.error("Properties loading error:", fetchError);

        if (!cancelled) {
          setError(
            fetchError?.message || "Failed to load properties."
          );

          setProperties([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | SEARCH DEBOUNCE
    |--------------------------------------------------------------------------
    */

    const timeoutId = setTimeout(
      fetchProperties,
      search.trim() ? 400 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [search, type, sort, page]);

  /*
  |--------------------------------------------------------------------------
  | RESET FILTERS
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setType("All");
    setSort("");
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | TYPE CHANGE
  |--------------------------------------------------------------------------
  */

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | SORT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | PAGE CHANGE
  |--------------------------------------------------------------------------
  */

  const goToPreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPage((currentPage) => currentPage - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((currentPage) => currentPage + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* BACK */}

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 no-underline transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Home
          </Link>

          {/* TITLE */}

          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              Find your next place
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Explore All Properties
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400 sm:text-base">
              Discover approved rental properties that match your lifestyle,
              location, and budget.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH + FILTERS
      ========================================================= */}

      <section className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_240px]">
            {/* SEARCH */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by location, title, or keyword..."
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-950 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:bg-zinc-800 dark:focus:ring-zinc-800"
              />
            </div>

            {/* TYPE */}

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <select
                value={type}
                onChange={handleTypeChange}
                className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:bg-zinc-800 dark:focus:ring-zinc-800"
              >
                {propertyTypes.map((propertyType) => (
                  <option
                    key={propertyType}
                    value={propertyType}
                  >
                    {propertyType === "All"
                      ? "All Property Types"
                      : propertyType}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>

            {/* SORT */}

            <div className="relative">
              <select
                value={sort}
                onChange={handleSortChange}
                className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 pr-10 text-sm text-zinc-800 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:bg-zinc-800 dark:focus:ring-zinc-800"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROPERTY CONTENT
      ========================================================= */}

      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* RESULT HEADER */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? "Finding properties..."
                : `${pagination.totalProperties} ${
                    pagination.totalProperties === 1
                      ? "property"
                      : "properties"
                  } available`}
            </p>
          </div>

          {(search || type !== "All" || sort) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ERROR */}

        {error && !loading ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-300">
              Unable to load properties
            </h2>

            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setPage(1);
                setError("");
              }}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          /* =======================================================
             SKELETONS
          ======================================================= */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertySkeleton key={index} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          /* =======================================================
             EMPTY
          ======================================================= */

          <div className="grid">
            <EmptyState onReset={resetFilters} />
          </div>
        ) : (
          /* =======================================================
             PROPERTIES
          ======================================================= */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        )}

        {/* =========================================================
            PAGINATION
        ========================================================= */}

        {!loading &&
          !error &&
          pagination.totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Page{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {pagination.currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Previous
                </button>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Next

                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}