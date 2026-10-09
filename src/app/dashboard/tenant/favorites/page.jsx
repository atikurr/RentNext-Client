"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Home,
} from "lucide-react";
import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");

  // =========================================================
  // GET AUTH TOKEN
  // =========================================================

  const getToken = async () => {
    try {
      const tokenResponse = await authClient.token();

      return (
        tokenResponse?.data?.token ||
        tokenResponse?.token ||
        ""
      );
    } catch (error) {
      console.error("Token error:", error);
      return "";
    }
  };

  // =========================================================
  // LOAD FAVORITES
  // =========================================================

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/favorites/my-favorites`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load favorites."
        );
      }

      setFavorites(
        Array.isArray(data?.favorites)
          ? data.favorites
          : []
      );
    } catch (error) {
      console.error(
        "Favorites loading error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFavorites();
  }, [fetchFavorites]);

  // =========================================================
  // REMOVE FAVORITE
  // =========================================================

  const handleRemoveFavorite = async (
    propertyId
  ) => {
    if (!propertyId || removingId) {
      return;
    }

    try {
      setRemovingId(propertyId);

      const token = await getToken();

      if (!token) {
        toast.error(
          "Authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/favorites/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to remove favorite."
        );
      }

      setFavorites((current) =>
        current.filter(
          (item) =>
            String(item?.property?.id) !==
            String(propertyId)
        )
      );

      toast.success(
        "Removed from favorites."
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const filteredFavorites =
    favorites.filter((item) => {
      const title =
        item?.property?.title
          ?.toLowerCase() || "";

      const location =
        item?.property?.location
          ?.toLowerCase() || "";

      const type =
        item?.property?.type
          ?.toLowerCase() || "";

      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        title.includes(searchValue) ||
        location.includes(searchValue) ||
        type.includes(searchValue)
      );
    });

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    const numericPrice =
      Number(price || 0);

    return numericPrice.toLocaleString(
      "en-BD"
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f7f5ef] p-4 dark:bg-[#09090b] sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse gap-4 border-b border-slate-100 pb-4 last:border-0 dark:border-zinc-800"
                >
                  <div className="h-24 w-32 rounded-xl bg-slate-200 dark:bg-zinc-800" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-56 rounded bg-slate-200 dark:bg-zinc-800" />

                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-zinc-800" />

                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-[70vh] bg-[#f7f5ef] p-4 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                <Heart
                  size={22}
                  fill="currentColor"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Favorites
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Properties you saved for later.
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search favorites..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10 sm:w-64"
              />
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchFavorites}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                  Total Favorites
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {favorites.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                <Heart
                  size={22}
                  fill="currentColor"
                />
              </div>

            </div>
          </div>

          {/* SHOWING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                  Showing
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {filteredFavorites.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Home size={22} />
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
              <Heart size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No favorites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-400">
              You have not saved any properties yet.
              Browse properties and add the ones you
              like to your favorites.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Home size={17} />
              Browse Properties
            </Link>

          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <Search
              size={35}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold">
              No matching favorites
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              Try searching with another property
              name, location, or property type.
            </p>

          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-zinc-800 dark:bg-zinc-950">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Property
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Location
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Type
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Details
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Rent
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredFavorites.map(
                      (favorite) => {
                        const property =
                          favorite?.property || {};

                        const propertyId =
                          property?.id;

                        const image =
                          property?.image ||
                          FALLBACK_IMAGE;

                        return (
                          <tr
                            key={
                              favorite?._id ||
                              propertyId
                            }
                            className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0 dark:border-zinc-800 dark:hover:bg-zinc-950"
                          >

                            {/* PROPERTY */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-4">

                                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">

                                  <Image
                                    src={image}
                                    alt={
                                      property?.title ||
                                      "Property"
                                    }
                                    fill
                                    sizes="112px"
                                    className="object-cover"
                                    unoptimized
                                  />

                                </div>

                                <div className="min-w-0">

                                  <h3 className="max-w-[230px] truncate font-semibold">
                                    {property?.title ||
                                      "Untitled Property"}
                                  </h3>

                                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">

                                    <MapPin size={13} />

                                    <span className="max-w-[220px] truncate">
                                      {property?.location ||
                                        "Location unavailable"}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            </td>

                            {/* LOCATION */}

                            <td className="px-6 py-5">

                              <div className="flex max-w-[180px] items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">

                                <MapPin
                                  size={16}
                                  className="mt-0.5 shrink-0 text-orange-500"
                                />

                                <span>
                                  {property?.location ||
                                    "N/A"}
                                </span>

                              </div>

                            </td>

                            {/* TYPE */}

                            <td className="px-6 py-5">

                              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                                {property?.type ||
                                  "Property"}
                              </span>

                            </td>

                            {/* DETAILS */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">

                                <span className="flex items-center gap-1">
                                  <BedDouble size={15} />
                                  {property?.bedrooms ||
                                    0}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Bath size={15} />
                                  {property?.bathrooms ||
                                    0}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Ruler size={15} />
                                  {property?.size ||
                                    0}
                                </span>

                              </div>

                            </td>

                            {/* RENT */}

                            <td className="px-6 py-5">

                              <div className="font-bold text-orange-500">
                                ৳
                                {formatPrice(
                                  property?.rent
                                )}
                              </div>

                              <div className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                                /{" "}
                                {property?.rentType ||
                                  "Monthly"}
                              </div>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">

                              <div className="flex justify-end gap-2">

                                <Link
                                  href={`/properties/${propertyId}`}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-orange-300 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
                                  title="View Property"
                                >
                                  <Eye size={17} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFavorite(
                                      propertyId
                                    )
                                  }
                                  disabled={
                                    removingId ===
                                    propertyId
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                                  title="Remove Favorite"
                                >
                                  {removingId ===
                                  propertyId ? (
                                    <RefreshCw
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={17}
                                    />
                                  )}
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>
                </table>

              </div>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="space-y-4 md:hidden">

              {filteredFavorites.map(
                (favorite) => {
                  const property =
                    favorite?.property || {};

                  const propertyId =
                    property?.id;

                  const image =
                    property?.image ||
                    FALLBACK_IMAGE;

                  return (
                    <div
                      key={
                        favorite?._id ||
                        propertyId
                      }
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >

                      {/* IMAGE */}

                      <div className="relative h-52 w-full">

                        <Image
                          src={image}
                          alt={
                            property?.title ||
                            "Property"
                          }
                          fill
                          sizes="100vw"
                          className="object-cover"
                          unoptimized
                        />

                        <div className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-red-500 shadow-sm">
                          <Heart
                            size={18}
                            fill="currentColor"
                          />
                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="font-bold">
                              {property?.title ||
                                "Untitled Property"}
                            </h3>

                            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400">

                              <MapPin
                                size={15}
                                className="text-orange-500"
                              />

                              <span>
                                {property?.location ||
                                  "Location unavailable"}
                              </span>

                            </div>

                          </div>

                          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                            {property?.type ||
                              "Property"}
                          </span>

                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 flex items-center gap-4 border-y border-slate-100 py-4 text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">

                          <span className="flex items-center gap-1.5">
                            <BedDouble size={16} />
                            {property?.bedrooms ||
                              0}{" "}
                            Beds
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Bath size={16} />
                            {property?.bathrooms ||
                              0}{" "}
                            Baths
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Ruler size={16} />
                            {property?.size || 0}
                          </span>

                        </div>

                        {/* PRICE */}

                        <div className="mt-4">

                          <span className="text-xl font-bold text-orange-500">
                            ৳
                            {formatPrice(
                              property?.rent
                            )}
                          </span>

                          <span className="ml-1 text-sm text-slate-500 dark:text-zinc-400">
                            /{" "}
                            {property?.rentType ||
                              "Monthly"}
                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="mt-5 flex gap-3">

                          <Link
                            href={`/properties/${propertyId}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                          >
                            <Eye size={17} />
                            View Property
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFavorite(
                                propertyId
                              )
                            }
                            disabled={
                              removingId ===
                              propertyId
                            }
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                          >
                            {removingId ===
                            propertyId ? (
                              <RefreshCw
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}