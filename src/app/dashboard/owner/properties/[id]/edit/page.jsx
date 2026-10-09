"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Save,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const INITIAL_FORM = {
  title: "",
  description: "",
  location: "",
  type: "Apartment",
  rent: "",
  rentType: "Monthly",
  bedrooms: "",
  bathrooms: "",
  size: "",
  amenities: "",
  extraFeatures: "",
};

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Studio",
  "Condo",
  "Villa",
  "Room",
  "Other",
];

const RENT_TYPES = ["Monthly", "Yearly", "Weekly", "Daily"];

function getPropertyId(property) {
  return String(property?._id ?? property?.id ?? "");
}

function getImageUrl(image) {
  if (typeof image === "string") return image;
  if (image && typeof image === "object") {
    return image.url || image.secure_url || image.src || "";
  }
  return "";
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  const getToken = useCallback(async () => {
    const result = await authClient.token();
    return result?.data?.token || result?.token || "";
  }, []);

  // Load the current owner's properties and find the requested property.
  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          toast.error("Please log in to edit your property.");

          if (!cancelled) router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/properties/my-properties?page=1&limit=100`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load your properties."
          );
        }

        // Supports common API response shapes.
        const properties = Array.isArray(data)
          ? data
          : Array.isArray(data?.properties)
            ? data.properties
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.properties)
                ? data.data.properties
                : [];

        const property = properties.find(
          (item) => getPropertyId(item) === String(propertyId)
        );

        if (!property) {
          throw new Error(
            "Property not found. Please check your property ID or API response."
          );
        }

        if (cancelled) return;

        setForm({
          title: property.title || "",
          description: property.description || "",
          location: property.location || "",
          type: property.type || "Apartment",
          rent: property.rent ?? "",
          rentType: property.rentType || "Monthly",
          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          size: property.size ?? "",
          amenities: Array.isArray(property.amenities)
            ? property.amenities.join(", ")
            : typeof property.amenities === "string"
              ? property.amenities
              : "",
          extraFeatures: Array.isArray(property.extraFeatures)
            ? property.extraFeatures.join(", ")
            : typeof property.extraFeatures === "string"
              ? property.extraFeatures
              : "",
        });

        const existingImages = Array.isArray(property.images)
          ? property.images.map(getImageUrl).filter(Boolean)
          : [];

        setImages(existingImages);
        setPropertyStatus(property.status || "");
        setRejectionFeedback(property.rejectionFeedback || "");
      } catch (error) {
        console.error("Load property error:", error);

        if (!cancelled) {
          toast.error(error?.message || "Failed to load property.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [propertyId, getToken, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddImage = () => {
    const url = imageUrl.trim();

    if (!url) {
      toast.error("Please enter an image URL.");
      return;
    }

    try {
      const parsedUrl = new URL(url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        toast.error("Please enter an HTTP or HTTPS image URL.");
        return;
      }
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    if (images.includes(url)) {
      toast.warning("This image has already been added.");
      return;
    }

    setImages((current) => [...current, url]);
    setImageUrl("");
  };

  const handleImageKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddImage();
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Property title is required.");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Property description is required.");
      return false;
    }

    if (!form.location.trim()) {
      toast.error("Property location is required.");
      return false;
    }

    if (!form.type) {
      toast.error("Please select a property type.");
      return false;
    }

    if (form.rent === "" || !Number.isFinite(Number(form.rent)) || Number(form.rent) < 0) {
      toast.error("Please enter a valid rent amount.");
      return false;
    }

    if (
      form.bedrooms === "" ||
      !Number.isFinite(Number(form.bedrooms)) ||
      Number(form.bedrooms) < 0
    ) {
      toast.error("Please enter a valid number of bedrooms.");
      return false;
    }

    if (
      form.bathrooms === "" ||
      !Number.isFinite(Number(form.bathrooms)) ||
      Number(form.bathrooms) < 0
    ) {
      toast.error("Please enter a valid number of bathrooms.");
      return false;
    }

    if (
      form.size === "" ||
      !Number.isFinite(Number(form.size)) ||
      Number(form.size) <= 0
    ) {
      toast.error("Please enter a valid property size.");
      return false;
    }

    if (images.length === 0) {
      toast.error("Please add at least one property image.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      const amenities = form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const extraFeatures = form.extraFeatures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        type: form.type,
        rent: Number(form.rent),
        rentType: form.rentType,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        size: Number(form.size),
        amenities,
        extraFeatures,
        images,
      };

      const response = await fetch(
        `${API_URL}/api/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update property.");
      }

      toast.success("Property updated successfully!");

      // The backend may set the status to Pending after an update.
      setPropertyStatus(data?.property?.status || data?.status || "Pending");
      setRejectionFeedback("");

      window.setTimeout(() => {
        router.push("/dashboard/owner/properties");
      }, 1200);
    } catch (error) {
      console.error("Update property error:", error);
      toast.error(error?.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="colored"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Loading property...
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Please wait while we load your property details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50/70 dark:bg-zinc-950">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <main className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-7">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/owner/properties")}
            className="mb-4 -ml-2 gap-2 text-zinc-600 hover:text-orange-600 dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Properties
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Building2 className="h-4 w-4" />
                <span>Owner Dashboard</span>
                <span>/</span>
                <span>My Properties</span>
                <span>/</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  Edit
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                Edit Property
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Update your property information and save your changes.
              </p>
            </div>

            {propertyStatus && (
              <Badge
                variant="outline"
                className="w-fit rounded-full px-3 py-1.5"
              >
                Current Status:{" "}
                <span className="ml-1 font-semibold">{propertyStatus}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Rejection Feedback */}
        {propertyStatus.toLowerCase() === "rejected" &&
          rejectionFeedback && (
            <Card className="mb-6 border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20">
              <CardContent className="flex gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">
                    Admin Rejection Feedback
                  </h3>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-red-700 dark:text-red-400">
                    {rejectionFeedback}
                  </p>
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Please update your property according to this feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the main information about your property.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Property Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Modern 3 Bedroom Apartment"
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the property, facilities, and key features..."
                      rows={7}
                      disabled={saving}
                      required
                      className="resize-y"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="location"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Dhanmondi, Dhaka"
                        disabled={saving}
                        required
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Property Type
                      </label>
                      <Select
                        value={form.type}
                        onValueChange={(value) =>
                          setForm((current) => ({ ...current, type: value }))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Rent Type
                      </label>
                      <Select
                        value={form.rentType}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            rentType: value,
                          }))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rent type" />
                        </SelectTrigger>
                        <SelectContent>
                          {RENT_TYPES.map((rentType) => (
                            <SelectItem key={rentType} value={rentType}>
                              {rentType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>
                    Update pricing, rooms, and property size.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="rent"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        Rent (৳) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="rent"
                        name="rent"
                        type="number"
                        min="0"
                        value={form.rent}
                        onChange={handleChange}
                        placeholder="25000"
                        disabled={saving}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="bedrooms"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        Bedrooms <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        min="0"
                        step="1"
                        value={form.bedrooms}
                        onChange={handleChange}
                        placeholder="3"
                        disabled={saving}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="bathrooms"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        Bathrooms <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        min="0"
                        step="1"
                        value={form.bathrooms}
                        onChange={handleChange}
                        placeholder="2"
                        disabled={saving}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="size"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        Size (sqft) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="size"
                        name="size"
                        type="number"
                        min="1"
                        value={form.size}
                        onChange={handleChange}
                        placeholder="1200"
                        disabled={saving}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                  <CardDescription>
                    Separate multiple items using commas.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="amenities"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Amenities
                    </label>
                    <Input
                      id="amenities"
                      name="amenities"
                      value={form.amenities}
                      onChange={handleChange}
                      placeholder="WiFi, Parking, Security, Elevator"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="extraFeatures"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Extra Features
                    </label>
                    <Input
                      id="extraFeatures"
                      name="extraFeatures"
                      value={form.extraFeatures}
                      onChange={handleChange}
                      placeholder="Balcony, Rooftop, Furnished Kitchen"
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Property Images */}
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-orange-500" />
                    Property Images
                  </CardTitle>
                  <CardDescription>
                    Add image URLs from Cloudinary or another image hosting
                    service.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      onKeyDown={handleImageKeyDown}
                      placeholder="https://example.com/property.jpg"
                      disabled={saving}
                      aria-label="Property image URL"
                    />
                    <Button
                      type="button"
                      onClick={handleAddImage}
                      size="icon"
                      disabled={saving || !imageUrl.trim()}
                      className="shrink-0 bg-orange-500 text-white hover:bg-orange-600"
                      aria-label="Add image"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Images
                    </p>
                    <Badge variant="secondary">
                      {images.length} {images.length === 1 ? "image" : "images"}
                    </Badge>
                  </div>

                  <Separator />

                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <Image
                            src={image}
                            alt={`Property image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, 180px"
                            className="object-cover"
                            unoptimized
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
                            <span className="text-[11px] font-medium text-white">
                              Image {index + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            disabled={saving}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                      <ImagePlus className="mb-3 h-8 w-8 text-zinc-400" />
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        No images added
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Add at least one property image.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Notice */}
              <Card className="border-amber-200 bg-amber-50/70 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                <CardContent className="flex gap-3 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                    <Check className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      Admin Review
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-400/80">
                      Property changes may require admin review before the
                      updated listing becomes publicly available. The actual
                      status is controlled by your backend.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardContent className="space-y-3 p-5">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-11 w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Property
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() =>
                      router.push("/dashboard/owner/properties")
                    }
                    className="h-11 w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}