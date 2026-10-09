"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Maximize,
  Loader2,
  Filter,
  Home,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 6;

function getPropertyId(property) {
  return property?._id || property?.id;
}

function getPropertyImage(property) {
  const images = property?.images;

  if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];

    if (typeof firstImage === "string") return firstImage;

    return firstImage?.url || firstImage?.src || "";
  }

  return (
    property?.image ||
    property?.imageUrl ||
    property?.thumbnail ||
    ""
  );
}

function formatRent(value) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "0";

  return new Intl.NumberFormat("en-US").format(amount);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (["approved", "available", "active"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  }

  if (["rejected", "declined"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
}

function PropertyStatus({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const Icon = ["approved", "available", "active"].includes(
    normalized
  )
    ? CheckCircle2
    : ["rejected", "declined"].includes(normalized)
      ? XCircle
      : Loader2;

  return (
    <Badge
      variant="outline"
      className={`gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
        status
      )}`}
    >
      <Icon
        className={`h-3 w-3 ${
          Icon === Loader2 ? "animate-spin" : ""
        }`}
      />
      {status || "Pending"}
    </Badge>
  );
}

/* IMAGE COMPONENT — no setState inside useEffect */
function PropertyImage({ src, alt, className = "" }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-orange-50 dark:bg-zinc-800 ${className}`}
      >
        <Building2 className="h-9 w-9 text-orange-400" />
      </div>
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt || "Property"}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className={`object-cover ${className}`}
      onError={() => setImageError(true)}
    />
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-slate-100 p-3 dark:border-zinc-800">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-slate-800 dark:text-zinc-200">
          {value ?? "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function MyPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* FETCH PROPERTIES */
  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        setLoading(true);

        const tokenResult = await authClient.token();
        const token = tokenResult?.data?.token;

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/api/properties/my-properties`,
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

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.properties)
            ? data.properties
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.results)
                ? data.results
                : [];

        if (!cancelled) {
          setProperties(items);
        }
      } catch (error) {
        console.error("Load properties error:", error);

        if (!cancelled) {
          toast.error(
            error?.message || "Failed to load properties."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  /* SEARCH AND FILTER */
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const query = search.trim().toLowerCase();

      const searchableText = [
        property?.title,
        property?.name,
        property?.location,
        property?.address,
        property?.city,
        property?.type,
        property?.propertyType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const status = String(
        property?.status || "pending"
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  /* PAGINATION */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredProperties.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredProperties, currentPage]);

  const startItem =
    filteredProperties.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredProperties.length
  );

  function handleSearch(value) {
    setSearchInput(value);
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function openDetails(property) {
    setSelectedProperty(property);
    setDetailsOpen(true);
  }

  function openDeleteConfirmation(property) {
    setPropertyToDelete(property);
    setDeleteOpen(true);
  }

  /* EDIT PROPERTY */
  function handleEdit(property) {
    const id = getPropertyId(property);

    if (!id) {
      toast.error("Property ID not found.");
      return;
    }

    // Ensure this route matches your existing edit page.
    router.push(`/dashboard/owner/properties/edit/${id}`);
  }

  /* DELETE PROPERTY */
  async function handleDelete() {
    if (!propertyToDelete) return;

    const id = getPropertyId(propertyToDelete);

    if (!id) {
      toast.error("Property ID not found.");
      return;
    }

    try {
      setDeleting(true);

      const tokenResult = await authClient.token();
      const token = tokenResult?.data?.token;

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete property."
        );
      }

      setProperties((previous) =>
        previous.filter(
          (property) => getPropertyId(property) !== id
        )
      );

      setDeleteOpen(false);
      setPropertyToDelete(null);

      toast.success("Property deleted successfully.");
    } catch (error) {
      console.error("Delete property error:", error);

      toast.error(
        error?.message || "Failed to delete property."
      );
    } finally {
      setDeleting(false);
    }
  }

  const approvedCount = properties.filter((property) =>
    ["approved", "available", "active"].includes(
      String(property?.status || "").toLowerCase()
    )
  ).length;

  const pendingCount = properties.filter(
    (property) =>
      String(property?.status || "pending").toLowerCase() ===
      "pending"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
                <Building2 className="h-4 w-4 text-white" />
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-600 dark:text-orange-400">
                Owner Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              My Properties
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Manage and track your property listings.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push("/dashboard/owner/properties/add")
            }
            className="h-9 bg-orange-500 px-4 text-sm text-white hover:bg-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Total Properties
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {properties.length}
                </p>
              </div>
              <Building2 className="h-5 w-5 text-orange-500" />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {approvedCount}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </p>
              </div>
              <Loader2 className="h-5 w-5 text-amber-500" />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Filtered Results
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {filteredProperties.length}
                </p>
              </div>
              <Search className="h-5 w-5 text-orange-500" />
            </CardContent>
          </Card>
        </div>

        {/* PROPERTY LIST */}
        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          {/* SEARCH AND FILTER */}
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={searchInput}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Search properties..."
                className="h-9 border-slate-200 bg-slate-50 pl-9 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />

              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-9 w-[155px] border-slate-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-950">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-slate-100 dark:bg-zinc-800" />

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: ITEMS_PER_PAGE }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800"
                  >
                    <div className="h-36 animate-pulse bg-slate-200 dark:bg-zinc-800" />
                    <div className="space-y-3 p-3.5">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                      <div className="h-8 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : paginatedProperties.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                <Home className="h-5 w-5 text-orange-500" />
              </div>

              <h3 className="mt-3 text-base font-semibold">
                No properties found
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Try changing your search or filter.
              </p>

              <Button
                variant="outline"
                className="mt-3 h-9"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter("all");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            /* COMPACT PROPERTY CARDS — SIX PER PAGE */
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProperties.map((property) => {
                const id = getPropertyId(property);
                const image = getPropertyImage(property);

                return (
                  <Card
                    key={id}
                    className="group min-w-0 overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-orange-500/30"
                  >
                    <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                      <PropertyImage
                        src={image}
                        alt={property.title || property.name}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />

                      <div className="absolute left-2.5 top-2.5">
                        <PropertyStatus
                          status={property.status || "Pending"}
                        />
                      </div>

                      <div className="absolute right-2.5 top-2.5">
                        <Badge className="border-0 bg-white/95 text-[10px] text-slate-800 shadow-sm hover:bg-white dark:bg-zinc-900/95 dark:text-zinc-200">
                          {property.type ||
                            property.propertyType ||
                            "Property"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3.5">
                      <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {property.title ||
                          property.name ||
                          "Untitled Property"}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                        {property.location ||
                          property.address ||
                          property.city ||
                          "Location unavailable"}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                            Monthly Rent
                          </p>

                          <p className="truncate text-base font-bold text-orange-600 dark:text-orange-400">
                            ৳
                            {formatRent(
                              property.price ??
                                property.rent ??
                                property.monthlyRent
                            )}

                            <span className="ml-1 text-[10px] font-normal text-slate-500 dark:text-zinc-500">
                              / month
                            </span>
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                          {property.bedrooms != null && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                              <BedDouble className="h-3.5 w-3.5" />
                              {property.bedrooms}
                            </span>
                          )}

                          {property.bathrooms != null && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                              <Bath className="h-3.5 w-3.5" />
                              {property.bathrooms}
                            </span>
                          )}
                        </div>
                      </div>

                      <Separator className="my-3 bg-slate-100 dark:bg-zinc-800" />

                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(property)}
                          className="h-8 border-orange-200 bg-orange-50 px-2.5 text-xs text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(property)}
                          className="h-8 border-slate-200 px-2.5 text-xs dark:border-zinc-700"
                        >
                          <Edit className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openDeleteConfirmation(property)
                          }
                          className="h-8 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && filteredProperties.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Showing{" "}
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {startItem}–{endItem}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {filteredProperties.length}
                </span>{" "}
                properties
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  className="h-8 border-slate-200 px-2.5 text-xs dark:border-zinc-700"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    size="sm"
                    variant={
                      currentPage === pageNumber
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setPage(pageNumber)}
                    className={
                      currentPage === pageNumber
                        ? "h-8 min-w-8 bg-orange-500 px-2.5 text-xs text-white hover:bg-orange-600"
                        : "h-8 min-w-8 border-slate-200 px-2.5 text-xs dark:border-zinc-700"
                    }
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(totalPages, previous + 1)
                    )
                  }
                  className="h-8 border-slate-200 px-2.5 text-xs dark:border-zinc-700"
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* VIEW DETAILS POPUP */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Property Details
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400">
              Complete information about your property.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4">
              <div className="relative h-48 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
                <PropertyImage
                  src={getPropertyImage(selectedProperty)}
                  alt={
                    selectedProperty.title ||
                    selectedProperty.name ||
                    "Property"
                  }
                />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">
                    {selectedProperty.title ||
                      selectedProperty.name ||
                      "Untitled Property"}
                  </h3>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                    <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                    {selectedProperty.location ||
                      selectedProperty.address ||
                      selectedProperty.city ||
                      "Location unavailable"}
                  </p>
                </div>

                <PropertyStatus
                  status={selectedProperty.status || "Pending"}
                />
              </div>

              <div className="rounded-xl bg-orange-50 p-3.5 dark:bg-orange-500/10">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Monthly Rent
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ৳
                  {formatRent(
                    selectedProperty.price ??
                      selectedProperty.rent ??
                      selectedProperty.monthlyRent
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DetailItem
                  icon={Building2}
                  label="Property Type"
                  value={
                    selectedProperty.type ||
                    selectedProperty.propertyType
                  }
                />

                <DetailItem
                  icon={Home}
                  label="Listing Type"
                  value={
                    selectedProperty.listingType ||
                    selectedProperty.purpose
                  }
                />

                <DetailItem
                  icon={BedDouble}
                  label="Bedrooms"
                  value={selectedProperty.bedrooms}
                />

                <DetailItem
                  icon={Bath}
                  label="Bathrooms"
                  value={selectedProperty.bathrooms}
                />

                <DetailItem
                  icon={Maximize}
                  label="Area"
                  value={
                    selectedProperty.area
                      ? `${selectedProperty.area} sq ft`
                      : selectedProperty.size
                        ? `${selectedProperty.size} sq ft`
                        : "N/A"
                  }
                />

                <DetailItem
                  icon={MapPin}
                  label="City"
                  value={selectedProperty.city}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Created At"
                  value={formatDate(
                    selectedProperty.createdAt ||
                      selectedProperty.created_at
                  )}
                />

                <DetailItem
                  icon={MapPin}
                  label="Address"
                  value={selectedProperty.address}
                />
              </div>

              {selectedProperty.description && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    Description
                  </p>

                  <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 p-3.5 text-sm leading-6 text-slate-600 dark:border-zinc-800 dark:text-zinc-300">
                    {selectedProperty.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedProperty && (
              <Button
                variant="outline"
                onClick={() => handleEdit(selectedProperty)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-500/30 dark:text-orange-400"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
            )}

            <Button
              onClick={() => setDetailsOpen(false)}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-[440px]">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <DialogTitle className="text-lg font-bold">
              Delete Property?
            </DialogTitle>

            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {propertyToDelete?.title ||
                  propertyToDelete?.name ||
                  "this property"}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
              className="border-slate-200 dark:border-zinc-700"
            >
              Cancel
            </Button>

            <Button
              disabled={deleting}
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Property
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
        theme="colored"
      />
    </div>
  );
}