"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

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

const propertyTypes = [
  "Apartment",
  "House",
  "Studio",
  "Condo",
  "Villa",
  "Room",
  "Other",
];

const rentTypes = [
  "Monthly",
  "Yearly",
  "Weekly",
  "Daily",
];

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

export default function AddPropertyPage() {
  const router = useRouter();

  const [form, setForm] =
    useState(initialForm);

  const [images, setImages] =
    useState([""]);

  const [imagePreviews, setImagePreviews] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addImageField = () => {
    setImages((previous) => [
      ...previous,
      "",
    ]);
  };

  const removeImageField = (
    index
  ) => {
    if (images.length === 1) {
      return;
    }

    setImages((previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setImagePreviews((previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  const updateImage = (
    index,
    value
  ) => {
    setImages((previous) => {
      const updated = [
        ...previous,
      ];

      updated[index] = value;

      return updated;
    });

    setImagePreviews((previous) => {
      const updated = [
        ...previous,
      ];

      updated[index] = value;

      return updated;
    });
  };

  const parseList = (value) => {
    return value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error(
        "Property title is required."
      );

      return false;
    }

    if (!form.description.trim()) {
      toast.error(
        "Property description is required."
      );

      return false;
    }

    if (!form.location.trim()) {
      toast.error(
        "Property location is required."
      );

      return false;
    }

    if (!form.type) {
      toast.error(
        "Please select a property type."
      );

      return false;
    }

    if (
      form.rent === "" ||
      Number(form.rent) < 0
    ) {
      toast.error(
        "Please enter a valid rent amount."
      );

      return false;
    }

    if (
      form.bedrooms === "" ||
      Number(form.bedrooms) < 0
    ) {
      toast.error(
        "Please enter the number of bedrooms."
      );

      return false;
    }

    if (
      form.bathrooms === "" ||
      Number(form.bathrooms) < 0
    ) {
      toast.error(
        "Please enter the number of bathrooms."
      );

      return false;
    }

    if (
      form.size === "" ||
      Number(form.size) <= 0
    ) {
      toast.error(
        "Please enter a valid property size."
      );

      return false;
    }

    const validImages =
      images.filter(
        (image) =>
          image.trim()
      );

    if (
      validImages.length === 0
    ) {
      toast.error(
        "Please add at least one property image."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const tokenResult =
        await authClient.token();

      const token =
        tokenResult?.data?.token;

      if (!token) {
        toast.error(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      const validImages =
        images
          .map((image) =>
            image.trim()
          )
          .filter(Boolean);

      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim(),

        location:
          form.location.trim(),

        type: form.type,

        rent: Number(
          form.rent
        ),

        rentType:
          form.rentType,

        bedrooms: Number(
          form.bedrooms
        ),

        bathrooms: Number(
          form.bathrooms
        ),

        size: Number(
          form.size
        ),

        amenities:
          parseList(
            form.amenities
          ),

        extraFeatures:
          parseList(
            form.extraFeatures
          ),

        images:
          validImages,
      };

      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/properties`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }
);

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create property."
        );
      }

      toast.success(
        "Property submitted successfully!",
        {
          position:
            "bottom-right",

          autoClose: 3000,

          hideProgressBar:
            false,

          closeOnClick: true,

          pauseOnHover: true,

          draggable: true,
        }
      );

      setForm(initialForm);

      setImages([""]);

      setImagePreviews([]);

      setTimeout(() => {
        router.push(
          "/dashboard/owner/properties"
        );
      }, 1500);
    } catch (error) {
      console.error(
        "Add property error:",
        error
      );

      toast.error(
        error.message ||
          "Something went wrong while adding the property.",
        {
          position:
            "bottom-right",

          autoClose: 4000,

          hideProgressBar:
            false,

          closeOnClick: true,

          pauseOnHover: true,

          draggable: true,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-full bg-zinc-100/70 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* PAGE HEADER */}

          <div className="mb-8">
            <Button
              variant="ghost"
              asChild
              className="-ml-2 mb-4 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
            >
              <Link href="/dashboard/owner">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-lg"
                  >
                    Owner Portal
                  </Badge>

                  <span className="text-xs text-zinc-400">
                    / Add Property
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Add New Property
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Add your property details
                  and submit it for admin
                  approval.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Admin approval required
              </div>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">

              {/* LEFT */}

              <div className="space-y-6">

                {/* BASIC INFORMATION */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div>
                        <CardTitle className="text-base">
                          Basic Information
                        </CardTitle>

                        <CardDescription>
                          Tell tenants about your property.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    {/* TITLE */}

                    <div className="space-y-2">
                      <label
                        htmlFor="title"
                        className="text-sm font-medium"
                      >
                        Property Title

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <Input
                        id="title"
                        value={form.title}
                        onChange={(event) =>
                          updateField(
                            "title",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Modern 3 Bedroom Apartment"
                        className="h-11 rounded-xl"
                        maxLength={120}
                      />

                      <div className="flex justify-end">
                        <span className="text-xs text-zinc-400">
                          {form.title.length}/120
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <Textarea
                        id="description"
                        value={
                          form.description
                        }
                        onChange={(event) =>
                          updateField(
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Describe the property, location, facilities, and key features..."
                        className="min-h-[150px] resize-none rounded-xl"
                        maxLength={2000}
                      />

                      <div className="flex justify-end">
                        <span className="text-xs text-zinc-400">
                          {
                            form.description
                              .length
                          }
                          /2000
                        </span>
                      </div>
                    </div>

                    {/* LOCATION */}

                    <div className="space-y-2">
                      <label
                        htmlFor="location"
                        className="text-sm font-medium"
                      >
                        Location

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                        <Input
                          id="location"
                          value={
                            form.location
                          }
                          onChange={(event) =>
                            updateField(
                              "location",
                              event.target.value
                            )
                          }
                          placeholder="e.g. Dhanmondi, Dhaka"
                          className="h-11 rounded-xl pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PROPERTY DETAILS */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Property Details
                    </CardTitle>

                    <CardDescription>
                      Provide the key specifications
                      of your property.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid gap-5 sm:grid-cols-2">

                      {/* TYPE */}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Property Type

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <Select
                          value={form.type}
                          onValueChange={(value) =>
                            updateField(
                              "type",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>

                          <SelectContent>
                            {propertyTypes.map(
                              (type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                >
                                  {type}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* RENT */}

                      <div className="space-y-2">
                        <label
                          htmlFor="rent"
                          className="text-sm font-medium"
                        >
                          Rent Amount

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <div className="flex gap-2">
                          <Input
                            id="rent"
                            type="number"
                            min="0"
                            value={form.rent}
                            onChange={(event) =>
                              updateField(
                                "rent",
                                event.target.value
                              )
                            }
                            placeholder="35000"
                            className="h-11 flex-1 rounded-xl"
                          />

                          <Select
                            value={
                              form.rentType
                            }
                            onValueChange={(
                              value
                            ) =>
                              updateField(
                                "rentType",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="h-11 w-[125px] rounded-xl">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              {rentTypes.map(
                                (type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                  >
                                    {type}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* BEDROOMS */}

                      <div className="space-y-2">
                        <label
                          htmlFor="bedrooms"
                          className="text-sm font-medium"
                        >
                          Bedrooms

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          value={
                            form.bedrooms
                          }
                          onChange={(event) =>
                            updateField(
                              "bedrooms",
                              event.target.value
                            )
                          }
                          placeholder="3"
                          className="h-11 rounded-xl"
                        />
                      </div>

                      {/* BATHROOMS */}

                      <div className="space-y-2">
                        <label
                          htmlFor="bathrooms"
                          className="text-sm font-medium"
                        >
                          Bathrooms

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          value={
                            form.bathrooms
                          }
                          onChange={(event) =>
                            updateField(
                              "bathrooms",
                              event.target.value
                            )
                          }
                          placeholder="2"
                          className="h-11 rounded-xl"
                        />
                      </div>

                      {/* SIZE */}

                      <div className="space-y-2 sm:col-span-2">
                        <label
                          htmlFor="size"
                          className="text-sm font-medium"
                        >
                          Property Size

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <Input
                            id="size"
                            type="number"
                            min="0"
                            value={form.size}
                            onChange={(event) =>
                              updateField(
                                "size",
                                event.target.value
                              )
                            }
                            placeholder="1200"
                            className="h-11 rounded-xl pr-16"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                            sq ft
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AMENITIES */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Amenities & Features
                    </CardTitle>

                    <CardDescription>
                      Separate multiple items using commas.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    <div className="space-y-2">
                      <label
                        htmlFor="amenities"
                        className="text-sm font-medium"
                      >
                        Amenities
                      </label>

                      <Textarea
                        id="amenities"
                        value={
                          form.amenities
                        }
                        onChange={(event) =>
                          updateField(
                            "amenities",
                            event.target.value
                          )
                        }
                        placeholder="WiFi, Parking, Security, Elevator"
                        className="min-h-[100px] resize-none rounded-xl"
                      />

                      {form.amenities && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {parseList(
                            form.amenities
                          ).map(
                            (amenity) => (
                              <Badge
                                key={amenity}
                                variant="secondary"
                                className="rounded-lg"
                              >
                                {amenity}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label
                        htmlFor="extraFeatures"
                        className="text-sm font-medium"
                      >
                        Extra Features
                      </label>

                      <Textarea
                        id="extraFeatures"
                        value={
                          form.extraFeatures
                        }
                        onChange={(event) =>
                          updateField(
                            "extraFeatures",
                            event.target.value
                          )
                        }
                        placeholder="Balcony, Rooftop, Furnished Kitchen"
                        className="min-h-[100px] resize-none rounded-xl"
                      />

                      {form.extraFeatures && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {parseList(
                            form.extraFeatures
                          ).map(
                            (feature) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="rounded-lg"
                              >
                                {feature}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* PROPERTY IMAGES */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <ImagePlus className="h-5 w-5" />
                      </div>

                      <div>
                        <CardTitle className="text-base">
                          Property Images
                        </CardTitle>

                        <CardDescription>
                          Add image URLs for your property.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">

                    {images.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex gap-2"
                        >
                          <Input
                            type="url"
                            value={image}
                            onChange={(
                              event
                            ) =>
                              updateImage(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="https://example.com/property.jpg"
                            className="h-11 rounded-xl"
                          />

                          {images.length >
                            1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                removeImageField(
                                  index
                                )
                              }
                              className="h-11 w-11 shrink-0 rounded-xl text-zinc-500 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        addImageField
                      }
                      className="w-full rounded-xl border-dashed"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Image
                    </Button>

                    {/* IMAGE PREVIEW */}

                    {imagePreviews.some(
                      (image) => image
                    ) && (
                      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                        {imagePreviews.map(
                          (
                            image,
                            index
                          ) => {
                            if (
                              !image
                            ) {
                              return null;
                            }

                            return (
                              <div
                                key={`${image}-${index}`}
                                className="relative aspect-video overflow-hidden rounded-xl border bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
                              >
                                <Image
                                  src={image}
                                  alt={`Property preview ${
                                    index +
                                    1
                                  }`}
                                  fill
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                  className="object-cover"
                                  unoptimized
                                />

                                <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                                  Image{" "}
                                  {index +
                                    1}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                      <p className="text-xs leading-5 text-zinc-500">
                        Add at least one valid image URL.
                        You can use ImgBB, Cloudinary,
                        or another public image hosting
                        service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SIDEBAR */}

              <div className="space-y-6">

                {/* SUBMIT CARD */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-24">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Submit Property
                    </CardTitle>

                    <CardDescription>
                      Review your information before
                      submitting.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        <div>
                          <p className="text-sm font-medium">
                            Admin Review
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Your property will remain
                            Pending until an administrator
                            approves it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">

                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Property Type
                        </span>

                        <span className="font-medium">
                          {form.type ||
                            "Not selected"}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Rent
                        </span>

                        <span className="font-medium">
                          {form.rent
                            ? `৳${Number(
                                form.rent
                              ).toLocaleString()} / ${
                                form.rentType
                              }`
                            : "Not specified"}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Bedrooms
                        </span>

                        <span className="font-medium">
                          {form.bedrooms ||
                            "—"}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Bathrooms
                        </span>

                        <span className="font-medium">
                          {form.bathrooms ||
                            "—"}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Images
                        </span>

                        <span className="font-medium">
                          {
                            images.filter(
                              (image) =>
                                image.trim()
                            ).length
                          }
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full rounded-xl"
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
                      onClick={() =>
                        router.push(
                          "/dashboard/owner"
                        )
                      }
                      className="h-11 w-full rounded-xl"
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>

                {/* TIPS */}

                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Listing Tips
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 text-xs leading-5 text-zinc-500">

                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                        Use a clear and descriptive
                        property title.
                      </li>

                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                        Add accurate rent and property
                        specifications.
                      </li>

                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                        Include useful amenities and
                        features.
                      </li>

                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                        Use high-quality property
                        images.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* TOAST */}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}