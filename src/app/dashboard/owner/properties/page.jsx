"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Filter,
  Home,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000";

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    icon: Loader2,
  },

  Approved: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: CheckCircle2,
  },

  Rejected: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
    icon: XCircle,
  },
};

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* =========================================================
   FORMAT RENT
========================================================= */

function formatRent(rent) {
  const number = Number(rent);

  if (Number.isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(
    number
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.Pending;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full border bg-white/90 px-3 py-1 font-medium shadow-sm backdrop-blur-md dark:bg-zinc-950/80 ${config.className}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${
          status === "Pending"
            ? "animate-spin"
            : ""
        }`}
      />

      {config.label}
    </Badge>
  );
}

/* =========================================================
   PROPERTY IMAGE
========================================================= */

function PropertyImage({ src, alt }) {
  const [hasError, setHasError] =
    useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <Building2 className="h-10 w-10 text-zinc-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
      className="object-cover transition duration-500 group-hover:scale-105"
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}

/* =========================================================
   LOADING CARD
========================================================= */

function LoadingCard() {
  return (
    <Card className="w-full max-w-[360px] overflow-hidden rounded-2xl border-zinc-200 shadow-sm dark:border-zinc-800">
      <div className="aspect-[4/3] animate-pulse bg-zinc-200 dark:bg-zinc-800" />

      <CardContent className="space-y-4 p-4">
        <div className="h-6 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="grid grid-cols-3 gap-2">
          <div className="h-14 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

          <div className="h-14 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

          <div className="h-14 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="h-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MyPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedProperty, setSelectedProperty] =
    useState(null);

  const [feedbackDialogOpen, setFeedbackDialogOpen] =
    useState(false);

  const [selectedFeedback, setSelectedFeedback] =
    useState("");

  const [feedbackPropertyId, setFeedbackPropertyId] =
    useState("");

  const [feedbackPropertyTitle, setFeedbackPropertyTitle] =
    useState("");

  /* =========================================================
     LOAD PROPERTIES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProperties = async () => {
      try {
        setLoading(true);

        const tokenResponse =
          await authClient.token();

        const token =
          tokenResponse?.data?.token ||
          tokenResponse?.token;

        if (!token) {
          if (!cancelled) {
            toast.error(
              "Authentication token not found."
            );

            router.push("/login");
          }

          return;
        }

        const response = await fetch(
          `${API_URL}/api/properties/my-properties`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch properties."
          );
        }

        if (!cancelled) {
          setProperties(
            Array.isArray(data?.properties)
              ? data.properties
              : []
          );
        }
      } catch (error) {
        console.error(
          "Fetch properties error:",
          error
        );

        if (!cancelled) {
          toast.error(
            error?.message ||
              "Failed to load your properties."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =========================================================
     FILTER PROPERTIES
  ========================================================= */

  const filteredProperties = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return properties.filter(
      (property) => {
        const matchesSearch =
          !normalizedSearch ||
          property.title
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          property.location
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          property.type
            ?.toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" ||
          property.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    properties,
    search,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    return {
      total: properties.length,

      approved: properties.filter(
        (property) =>
          property.status === "Approved"
      ).length,

      pending: properties.filter(
        (property) =>
          property.status === "Pending"
      ).length,

      rejected: properties.filter(
        (property) =>
          property.status === "Rejected"
      ).length,
    };
  }, [properties]);

  /* =========================================================
     DELETE CLICK
  ========================================================= */

  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };

  /* =========================================================
     DELETE PROPERTY
  ========================================================= */

  const handleDelete = async () => {
    if (!selectedProperty?._id) {
      return;
    }

    try {
      setDeleting(true);

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token ||
        tokenResponse?.token;

      if (!token) {
        toast.error(
          "Authentication token not found."
        );

        router.push("/login");

        return;
      }

      const response = await fetch(
        `${API_URL}/api/properties/${selectedProperty._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",
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

      setProperties((current) =>
        current.filter(
          (property) =>
            property._id !==
            selectedProperty._id
        )
      );

      setDeleteDialogOpen(false);
      setSelectedProperty(null);

      toast.success(
        "Property deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete property."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (property) => {
    router.push(
      `/dashboard/owner/properties/${property._id}/edit`
    );
  };

  /* =========================================================
     VIEW
  ========================================================= */

  const handleView = (property) => {
    router.push(
      `/property/${property._id}`
    );
  };

  /* =========================================================
     FEEDBACK
  ========================================================= */

  const handleFeedback = (property) => {
    setSelectedFeedback(
      property.rejectionFeedback || ""
    );

    setFeedbackPropertyId(
      property._id || ""
    );

    setFeedbackPropertyTitle(
      property.title || "Property"
    );

    setFeedbackDialogOpen(true);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-zinc-50/50 dark:bg-zinc-950">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Home className="h-4 w-4" />

              <span>
                Owner Dashboard
              </span>

              <span>/</span>

              <span className="text-zinc-900 dark:text-zinc-100">
                My Properties
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              My Properties
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your rental properties,
              monitor their status, and update
              your listings.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push(
                "/dashboard/owner/add-property"
              )
            }
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />

            Add Property
          </Button>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Building2 className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              </div>

              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Properties
                </p>

                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                  {statistics.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Approved
                </p>

                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                  {statistics.approved}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
                <Loader2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                  {statistics.pending}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Rejected
                </p>

                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                  {statistics.rejected}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        <Card className="mb-7 border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by property name, location, or type..."
                  className="h-11 pl-10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={statusFilter}
                  onValueChange={
                    setStatusFilter
                  }
                >
                  <SelectTrigger className="h-11 w-full sm:w-[190px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-zinc-400" />

                      <SelectValue placeholder="Filter status" />
                    </div>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All Status
                    </SelectItem>

                    <SelectItem value="Approved">
                      Approved
                    </SelectItem>

                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>

                    <SelectItem value="Rejected">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(search ||
                  statusFilter !==
                    "all") && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-11 gap-2"
                  >
                    <XCircle className="h-4 w-4" />

                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Properties
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loading
              ? "Loading properties..."
              : `${filteredProperties.length} ${
                  filteredProperties.length ===
                  1
                    ? "property"
                    : "properties"
                } found`}
          </p>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredProperties.length ===
            0 && (
            <Card className="border-dashed border-zinc-300 shadow-sm dark:border-zinc-700">
              <CardContent className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Building2 className="h-8 w-8 text-zinc-400" />
                </div>

                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {properties.length ===
                  0
                    ? "No properties yet"
                    : "No properties found"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {properties.length ===
                  0
                    ? "You haven't added any properties yet. Add your first property to start receiving rental requests."
                    : "Try changing your search keyword or status filter."}
                </p>

                {properties.length ===
                0 ? (
                  <Button
                    onClick={() =>
                      router.push(
                        "/dashboard/owner/add-property"
                      )
                    }
                    className="mt-6 gap-2"
                  >
                    <Plus className="h-4 w-4" />

                    Add Your First Property
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-6"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

        {/* =================================================
            PROPERTY GRID
        ================================================= */}

        {!loading &&
          filteredProperties.length >
            0 && (
            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map(
                (property) => (
                  <Card
                    key={property._id}
                    className="group w-full max-w-[360px] overflow-hidden rounded-2xl border-zinc-200 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <PropertyImage
                        src={
                          property.images?.[0]
                        }
                        alt={
                          property.title ||
                          "Property"
                        }
                      />

                      {/* STATUS */}

                      <div className="absolute left-3 top-3 z-10">
                        <StatusBadge
                          status={
                            property.status
                          }
                        />
                      </div>

                      {/* PROPERTY TYPE */}

                      {property.type && (
                        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                          {property.type}
                        </div>
                      )}

                      {/* PHOTO COUNT */}

                      {property.images?.length >
                        1 && (
                        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                          {
                            property.images
                              .length
                          }{" "}
                          Photos
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}

                    <CardContent className="px-2 pb-2 pt-4">
                      {/* PRICE */}

                      <div className="mb-2">
                        <span className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                          ৳
                          {formatRent(
                            property.rent
                          )}
                        </span>

                        <span className="ml-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          /{" "}
                          {(
                            property.rentType ||
                            "Monthly"
                          ).toLowerCase()}
                        </span>
                      </div>

                      {/* TITLE */}

                      <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-zinc-950 dark:text-white">
                        {property.title ||
                          "Untitled Property"}
                      </h3>

                      {/* LOCATION */}

                      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                        <span className="line-clamp-1">
                          {property.location ||
                            "Location not specified"}
                        </span>
                      </div>

                      {/* STATS */}

                      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-zinc-100 py-3 dark:border-zinc-800">
                        <div className="rounded-lg bg-zinc-50 px-2 py-2.5 text-center dark:bg-zinc-900">
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Bedrooms
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                            {property.bedrooms ??
                              0}
                          </p>
                        </div>

                        <div className="rounded-lg bg-zinc-50 px-2 py-2.5 text-center dark:bg-zinc-900">
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Bathrooms
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                            {property.bathrooms ??
                              0}
                          </p>
                        </div>

                        <div className="rounded-lg bg-zinc-50 px-2 py-2.5 text-center dark:bg-zinc-900">
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Size
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                            {property.size ??
                              0}

                            <span className="ml-0.5 text-[9px] font-normal text-zinc-500">
                              sqft
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* REJECTION FEEDBACK */}

                      {property.status ===
                        "Rejected" &&
                        property.rejectionFeedback && (
                          <button
                            type="button"
                            onClick={() =>
                              handleFeedback(
                                property
                              )
                            }
                            className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                          >
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                              Admin Feedback
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-red-600/80 dark:text-red-400/80">
                              {
                                property.rejectionFeedback
                              }
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-red-700 dark:text-red-400">
                              Click to view full
                              feedback
                            </p>
                          </button>
                        )}

                      {/* DATE */}

                      <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />

                          Added{" "}
                          {formatDate(
                            property.createdAt
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleView(
                              property
                            )
                          }
                          className="h-9 gap-1.5 rounded-lg text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />

                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit(
                              property
                            )
                          }
                          className="h-9 gap-1.5 rounded-lg text-xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" />

                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(
                              property
                            )
                          }
                          className="h-9 gap-1.5 rounded-lg border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />

                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

        {/* =================================================
            DELETE DIALOG
        ================================================= */}

        <Dialog
          open={deleteDialogOpen}
          onOpenChange={
            setDeleteDialogOpen
          }
        >
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>
                Delete Property?
              </DialogTitle>

              <DialogDescription className="pt-2 leading-6">
                Are you sure you want to
                delete{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {selectedProperty?.title ||
                    "this property"}
                </span>
                ? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={() =>
                  setDeleteDialogOpen(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />

                    Delete Property
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =================================================
            FEEDBACK DIALOG
        ================================================= */}

        <Dialog
          open={feedbackDialogOpen}
          onOpenChange={
            setFeedbackDialogOpen
          }
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />

                Rejection Feedback
              </DialogTitle>

              <DialogDescription>
                Admin feedback for{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {feedbackPropertyTitle}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="whitespace-pre-wrap text-sm leading-6 text-red-700 dark:text-red-300">
                {selectedFeedback ||
                  "No rejection feedback was provided."}
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setFeedbackDialogOpen(
                    false
                  )
                }
              >
                Close
              </Button>

              <Button
                onClick={() => {
                  setFeedbackDialogOpen(
                    false
                  );

                  const property =
                    properties.find(
                      (item) =>
                        item._id ===
                        feedbackPropertyId
                    );

                  if (property) {
                    handleEdit(property);
                  }
                }}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />

                Edit Property
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}