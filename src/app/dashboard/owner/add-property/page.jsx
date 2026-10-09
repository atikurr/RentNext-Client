
"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const propertyTypes = [
  "Apartment",
  "House",
  "Studio",
  "Condo",
  "Villa",
  "Room",
  "Other",
];

const rentTypes = ["Monthly", "Yearly", "Weekly", "Daily"];

const initialForm = {
  title: "",
  description: "",
  location: "",
  type: "",
  rent: "",
  rentType: "Monthly",
  bedrooms: "",
  bathrooms: "",
  size: "",
  amenities: "",
  extraFeatures: "",
};

const inputClass =
  "h-10 rounded-lg border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

const cardClass =
  "border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

const labelClass =
  "text-sm font-medium text-zinc-800 dark:text-zinc-200";

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AddPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([""]);
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addImageField = () => {
    setImages((previous) => [...previous, ""]);
  };

  const removeImageField = (index) => {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );

    setImageErrors((previous) => {
      const updated = {};

      Object.entries(previous).forEach(([key, value]) => {
        const oldIndex = Number(key);

        if (oldIndex < index) updated[oldIndex] = value;
        if (oldIndex > index) updated[oldIndex - 1] = value;
      });

      return updated;
    });
  };

  const updateImage = (index, value) => {
    setImages((previous) =>
      previous.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    );

    setImageErrors((previous) => ({
      ...previous,
      [index]: false,
    }));
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

    if (
      form.rent === "" ||
      !Number.isFinite(Number(form.rent)) ||
      Number(form.rent) <= 0
    ) {
      toast.error("Enter a valid rent amount.");
      return false;
    }

    if (
      form.bedrooms === "" ||
      !Number.isInteger(Number(form.bedrooms)) ||
      Number(form.bedrooms) < 0
    ) {
      toast.error("Enter a valid number of bedrooms.");
      return false;
    }

    if (
      form.bathrooms === "" ||
      !Number.isInteger(Number(form.bathrooms)) ||
      Number(form.bathrooms) < 0
    ) {
      toast.error("Enter a valid number of bathrooms.");
      return false;
    }

    if (
      form.size === "" ||
      !Number.isFinite(Number(form.size)) ||
      Number(form.size) <= 0
    ) {
      toast.error("Enter a valid property size.");
      return false;
    }

    const validImages = images
      .map((image) => image.trim())
      .filter(Boolean);

    if (!validImages.length) {
      toast.error("Add at least one property image URL.");
      return false;
    }

    for (const image of validImages) {
      try {
        const url = new URL(image);

        if (!["http:", "https:"].includes(url.protocol)) {
          toast.error("Image URLs must use HTTP or HTTPS.");
          return false;
        }
      } catch {
        toast.error("Please enter a valid image URL.");
        return false;
      }
    }

    if (Object.values(imageErrors).some(Boolean)) {
      toast.error("Please correct or remove broken image URLs.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !validateForm()) return;

    try {
      setLoading(true);

      const tokenResult = await authClient.token();
      const token = tokenResult?.data?.token;

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

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
        amenities: parseList(form.amenities),
        extraFeatures: parseList(form.extraFeatures),
        images: images.map((image) => image.trim()).filter(Boolean),
      };

      const response = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create property.");
      }

      toast.success("Property submitted successfully!");

      setForm(initialForm);
      setImages([""]);
      setImageErrors({});

      setTimeout(() => {
        router.push("/dashboard/owner/properties");
      }, 1000);
    } catch (error) {
      console.error("Add property error:", error);
      toast.error(error.message || "Failed to add property.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setImages([""]);
    setImageErrors({});
  };

  return (
    <main className="min-h-screen bg-zinc-100/70 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}

        <header className="mb-7">
          <Button
            variant="ghost"
            asChild
            className="-ml-2 mb-3 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Link href="/dashboard/owner">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge
                variant="outline"
                className="mb-3 rounded-lg border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
              >
                Owner Portal
              </Badge>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Add New Property
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Add your property details, images and rental information.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Property listing
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {/* BASIC INFORMATION */}

              <Card className={cardClass}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div>
                      <CardTitle className="text-base">
                        Basic Information
                      </CardTitle>
                      <CardDescription className="dark:text-zinc-400">
                        Tell tenants about your property.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className={labelClass}>
                      Property Title *
                    </label>

                    <Input
                      id="title"
                      required
                      maxLength={120}
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="e.g. Modern 3 Bedroom Apartment"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className={labelClass}>
                      Description *
                    </label>

                    <Textarea
                      id="description"
                      required
                      maxLength={2000}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Describe your property and facilities..."
                      className="min-h-28 resize-y rounded-lg border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className={labelClass}>
                      Location *
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                      <Input
                        id="location"
                        required
                        value={form.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                        placeholder="e.g. Dhanmondi, Dhaka"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PROPERTY DETAILS */}

              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Property Details
                  </CardTitle>
                  <CardDescription className="dark:text-zinc-400">
                    Enter property specifications and rent.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className={labelClass}>Property Type *</label>

                      <Select
                        value={form.type}
                        onValueChange={(value) => updateField("type", value)}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="rent" className={labelClass}>
                        Rent Amount (৳) *
                      </label>

                      <Input
                        id="rent"
                        type="number"
                        min="1"
                        required
                        value={form.rent}
                        onChange={(e) => updateField("rent", e.target.value)}
                        placeholder="35000"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Rent Type</label>

                      <Select
                        value={form.rentType}
                        onValueChange={(value) =>
                          updateField("rentType", value)
                        }
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {rentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bedrooms" className={labelClass}>
                        Bedrooms *
                      </label>

                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.bedrooms}
                        onChange={(e) =>
                          updateField("bedrooms", e.target.value)
                        }
                        placeholder="3"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bathrooms" className={labelClass}>
                        Bathrooms *
                      </label>

                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.bathrooms}
                        onChange={(e) =>
                          updateField("bathrooms", e.target.value)
                        }
                        placeholder="2"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="size" className={labelClass}>
                        Property Size (sq ft) *
                      </label>

                      <Input
                        id="size"
                        type="number"
                        min="1"
                        required
                        value={form.size}
                        onChange={(e) => updateField("size", e.target.value)}
                        placeholder="1200"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AMENITIES */}

              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Amenities & Features
                  </CardTitle>
                  <CardDescription className="dark:text-zinc-400">
                    Separate items with commas.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="amenities" className={labelClass}>
                      Amenities
                    </label>

                    <Textarea
                      id="amenities"
                      value={form.amenities}
                      onChange={(e) =>
                        updateField("amenities", e.target.value)
                      }
                      placeholder="WiFi, Parking, Security, Elevator"
                      className="min-h-24 rounded-lg border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />

                    <div className="flex flex-wrap gap-2">
                      {parseList(form.amenities).map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                  <div className="space-y-2">
                    <label htmlFor="extraFeatures" className={labelClass}>
                      Extra Features
                    </label>

                    <Textarea
                      id="extraFeatures"
                      value={form.extraFeatures}
                      onChange={(e) =>
                        updateField("extraFeatures", e.target.value)
                      }
                      placeholder="Balcony, Rooftop, Furnished Kitchen"
                      className="min-h-24 rounded-lg border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />

                    <div className="flex flex-wrap gap-2">
                      {parseList(form.extraFeatures).map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PROPERTY IMAGES */}

              <Card className={cardClass}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <ImagePlus className="h-5 w-5" />
                    </div>

                    <div>
                      <CardTitle className="text-base">
                        Property Images
                      </CardTitle>
                      <CardDescription className="dark:text-zinc-400">
                        Add image URLs for your property.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      {/* Compact URL field */}

                      <div className="flex items-center gap-2">
                        <Input
                          type="url"
                          value={image}
                          onChange={(e) =>
                            updateImage(index, e.target.value)
                          }
                          placeholder="https://example.com/property.jpg"
                          aria-label={`Property image URL ${index + 1}`}
                          className="h-10 min-w-0 flex-1 rounded-lg border-zinc-200 bg-white text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white sm:text-sm"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={images.length === 1}
                          onClick={() => removeImageField(index)}
                          aria-label="Remove image"
                          className="h-10 w-10 shrink-0 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Small preview below the URL */}

                      {image.trim() && (
                        <div className="relative w-full max-w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                          {imageErrors[index] ? (
                            <div className="flex h-36 flex-col items-center justify-center gap-2 px-3 text-center">
                              <XCircle className="h-6 w-6 text-red-500" />
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Image could not be loaded. Check the URL.
                              </p>
                            </div>
                          ) : (
                            <Image
  src={image.trim()}
  alt={`Property preview ${index + 1}`}
  width={1200}
  height={700}
  unoptimized
  className="h-56 w-full rounded-xl object-cover sm:h-64"
  onLoad={() => {
    setImageErrors((previous) => ({
      ...previous,
      [index]: false,
    }));
  }}
  onError={() => {
    setImageErrors((previous) => ({
      ...previous,
      [index]: true,
    }));
  }}
/>
                          )}

                          {!imageErrors[index] && (
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                              Image {index + 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageField}
                    className="h-9 w-full rounded-lg border-dashed border-zinc-300 text-sm dark:border-zinc-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Image
                  </Button>

                  <p className="rounded-lg bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                    Add at least one valid image URL. Public image-hosting
                    links work best.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* SUMMARY */}

            <aside>
              <Card className={`${cardClass} lg:sticky lg:top-24`}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Submission Summary
                  </CardTitle>
                  <CardDescription className="dark:text-zinc-400">
                    Review your listing before submitting.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-zinc-900 dark:text-white">
                          {form.title || "New Property"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {form.type || "Property type not selected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <SummaryRow
                      label="Location"
                      value={form.location || "Not entered"}
                    />

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    <SummaryRow
                      label="Rent"
                      value={
                        form.rent
                          ? `৳${Number(form.rent).toLocaleString("en-BD")} / ${form.rentType.toLowerCase()}`
                          : "Not entered"
                      }
                    />

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    <SummaryRow
                      label="Bedrooms"
                      value={form.bedrooms || "—"}
                    />

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    <SummaryRow
                      label="Bathrooms"
                      value={form.bathrooms || "—"}
                    />

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    <SummaryRow
                      label="Size"
                      value={form.size ? `${form.size} sq ft` : "—"}
                    />

                    <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                    <SummaryRow
                      label="Images"
                      value={images.filter((image) => image.trim()).length}
                    />
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                        Check your details and image links before submitting.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-xl bg-orange-500 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit Property
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={clearForm}
                    className="h-10 w-full rounded-xl dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    Clear Form
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="max-w-[65%] break-words text-right font-medium text-zinc-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
