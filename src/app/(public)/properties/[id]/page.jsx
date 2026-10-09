"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReviewSection from "@/components/property/ReviewSection";

import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  MapPin,
  Maximize,
  Phone,
  Send,
  User,
  X,
} from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US").format(
    Number(price || 0)
  );
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params?.id;

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [property, setProperty] = useState(null);
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);

  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [formData, setFormData] = useState({
    moveInDate: "",
    phone: "",
    additionalNotes: "",
    duration: 1,
  });

  /*
  |--------------------------------------------------------------------------
  | CALLBACK URL
  |--------------------------------------------------------------------------
  */

  const getPropertyCallbackUrl = () => {
    if (!propertyId) {
      return "/properties";
    }

    return `/properties/${propertyId}`;
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const result = await authClient.getSession();

        if (!mounted) {
          return;
        }

        if (result?.error) {
          console.error(
            "Session error:",
            result.error
          );

          setSession(null);
          return;
        }

        const sessionData =
          result?.data?.session || null;

        const currentUser =
          result?.data?.user || null;

        console.log(
          "Property Details Session:",
          sessionData
        );

        console.log(
          "Property Details User:",
          currentUser
        );

        console.log(
          "Property Details Role:",
          currentUser?.role
        );   

        if (!sessionData || !currentUser) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(
              getPropertyCallbackUrl()
            )}`
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | COMBINE SESSION + USER
        |--------------------------------------------------------------------------
        */

        setSession({
          ...sessionData,
          user: currentUser,
        });
      } catch (error) {
        console.error(
          "Session loading error:",
          error
        );

        if (mounted) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(
              getPropertyCallbackUrl()
            )}`
          );
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    if (propertyId) {
      loadSession();
    }

    return () => {
      mounted = false;
    };
  }, [propertyId, router]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProperty = async () => {
      if (
        !propertyId ||
        authLoading ||
        !session
      ) {
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/properties/${propertyId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load property."
          );
        }

        setProperty(data?.property || null);
      } catch (error) {
        console.error(
          "Property loading error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load property."
        );

        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [
    propertyId,
    authLoading,
    session,
  ]);

  /*
  |--------------------------------------------------------------------------
  | USER / ROLE
  |--------------------------------------------------------------------------
  */

  const user = session?.user || {};

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  const isTenant = userRole === "tenant";
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";

  /*
  |--------------------------------------------------------------------------
  | CHECK FAVORITE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const checkFavorite = async () => {
      if (
        !propertyId ||
        !session?.user ||
        !isTenant
      ) {
        return;
      }

      try {
        const tokenResponse =
          await authClient.token();

        const token =
          tokenResponse?.data?.token;

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/api/favorites/check/${propertyId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setFavorite(
            Boolean(data?.isFavorite)
          );
        }
      } catch (error) {
        console.error(
          "Favorite check error:",
          error
        );
      }
    };

    checkFavorite();
  }, [
    propertyId,
    session,
    isTenant,
  ]);

  /*
  |--------------------------------------------------------------------------
  | IMAGE HANDLERS
  |--------------------------------------------------------------------------
  */

  const handlePreviousImage = () => {
    if (!property?.images?.length) {
      return;
    }

    setActiveImage((current) =>
      current === 0
        ? property.images.length - 1
        : current - 1
    );
  };

  const handleNextImage = () => {
    if (!property?.images?.length) {
      return;
    }

    setActiveImage((current) =>
      current === property.images.length - 1
        ? 0
        : current + 1
    );
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT HANDLER
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | FAVORITE
  |--------------------------------------------------------------------------
  */

  const handleFavorite = async () => {
    if (!session?.user) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          getPropertyCallbackUrl()
        )}`
      );

      return;
    }

    if (!isTenant) {
      toast.error(
        "Only tenants can save favorites."
      );

      return;
    }

    if (favoriteLoading) {
      return;
    }

    try {
      setFavoriteLoading(true);

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token;

      if (!token) {
        toast.error(
          "Authentication token not found."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | REMOVE FAVORITE
      |--------------------------------------------------------------------------
      */

      if (favorite) {
        const response = await fetch(
          `${API_URL}/api/favorites/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to remove favorite."
          );
        }

        setFavorite(false);

        toast.success(
          "Removed from favorites."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | ADD FAVORITE
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${API_URL}/api/favorites/${propertyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to add favorite."
        );
      }

      setFavorite(true);

      toast.success(
        "Added to favorites."
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      toast.error(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN BOOKING MODAL
  |--------------------------------------------------------------------------
  */

  const openBookingModal = () => {
    if (!session?.user) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          getPropertyCallbackUrl()
        )}`
      );

      return;
    }

    if (!isTenant) {
      toast.error(
        "Only tenants can book a property."
      );

      return;
    }

    setBookingOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE BOOKING MODAL
  |--------------------------------------------------------------------------
  */

  const closeBookingModal = () => {
    if (bookingLoading) {
      return;
    }

    setBookingOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | BOOKING → PAYMENT
  |--------------------------------------------------------------------------
  */

  const handleBookingSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!property) {
      return;
    }

    if (!session?.user) {
      toast.error(
        "Please login before booking."
      );

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          getPropertyCallbackUrl()
        )}`
      );

      return;
    }

    if (!isTenant) {
      toast.error(
        "Only tenants can book a property."
      );

      return;
    }

    if (!formData.moveInDate) {
      toast.error(
        "Please select a move-in date."
      );

      return;
    }

    if (!formData.phone.trim()) {
      toast.error(
        "Please enter your contact number."
      );

      return;
    }

    if (
      !formData.duration ||
      Number(formData.duration) < 1
    ) {
      toast.error(
        "Duration must be at least 1."
      );

      return;
    }

    try {
      setBookingLoading(true);

      const query =
        new URLSearchParams({
          propertyId: String(
            propertyId
          ),

          moveInDate:
            formData.moveInDate,

          phone:
            formData.phone.trim(),

          additionalNotes:
            formData.additionalNotes.trim(),

          duration: String(
            formData.duration
          ),
        });

      setBookingOpen(false);

      router.push(
        `/payment?${query.toString()}`
      );
    } catch (error) {
      console.error(
        "Payment redirect error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to continue to payment."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-32 rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[500px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />

              <div className="space-y-4">
                <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />

                <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-zinc-800" />

                <div className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                <div className="h-14 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                <div className="h-14 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!property) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
        />

        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <Home className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Property Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              This property may have been
              removed, rejected, or is no
              longer available.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/properties")
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </button>
          </div>
        </main>
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const images =
    property.images?.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        ];

  const currentImage =
    images[activeImage] || images[0];

  const totalAmount =
    Number(property.rent || 0) *
    Number(formData.duration || 1);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />

      <main className="min-h-screen bg-slate-50 pb-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              router.push("/properties")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </button>

          {/* MAIN PROPERTY */}

          <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* IMAGE GALLERY */}

            <div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={currentImage}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />

                  {/* STATUS */}

                  <div className="absolute left-5 top-5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                    {property.status ||
                      "Approved"}
                  </div>

                  {/* COUNTER */}

                  {images.length > 1 && (
                    <div className="absolute right-5 top-5 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                      {activeImage + 1} /{" "}
                      {images.length}
                    </div>
                  )}

                  {/* PREVIOUS */}

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={
                        handlePreviousImage
                      }
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}

                  {/* NEXT */}

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={
                        handleNextImage
                      }
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* THUMBNAILS */}

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {images.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setActiveImage(
                            index
                          )
                        }
                        className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          activeImage === index
                            ? "border-slate-900 dark:border-white"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${property.title} ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* PROPERTY SUMMARY */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {property.type}
                  </span>

                  <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                    {property.title}
                  </h1>
                </div>

                {/* FAVORITE */}

                <button
                  type="button"
                  onClick={
                    handleFavorite
                  }
                  disabled={
                    favoriteLoading
                  }
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                    favorite
                      ? "border-red-200 bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/40"
                      : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  aria-label={
                    favorite
                      ? "Remove favorite"
                      : "Add favorite"
                  }
                >
                  {favoriteLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart
                      className="h-5 w-5"
                      fill={
                        favorite
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )}
                </button>
              </div>

              {/* LOCATION */}

              <div className="mt-5 flex items-start gap-2 text-slate-500 dark:text-zinc-400">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-900 dark:text-white" />

                <span className="text-sm leading-6">
                  {property.location}
                </span>
              </div>

              {/* PRICE */}

              <div className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-zinc-800/70">
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                  Rental Price
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-950 dark:text-white">
                    ৳
                    {formatPrice(
                      property.rent
                    )}
                  </span>

                  <span className="pb-1 text-sm text-slate-500 dark:text-zinc-400">
                    /{" "}
                    {property.rentType ||
                      "Monthly"}
                  </span>
                </div>
              </div>

              {/* FEATURES */}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                  <BedDouble className="h-5 w-5 text-slate-700 dark:text-zinc-300" />

                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {property.bedrooms ||
                      0}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Bedrooms
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                  <Bath className="h-5 w-5 text-slate-700 dark:text-zinc-300" />

                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {property.bathrooms ||
                      0}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Bathrooms
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                  <Maximize className="h-5 w-5 text-slate-700 dark:text-zinc-300" />

                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {property.size ||
                      0}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Sq Ft
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
                  <Home className="h-5 w-5 text-slate-700 dark:text-zinc-300" />

                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {property.type}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Property Type
                  </p>
                </div>
              </div>

              {/* BOOK */}

              <button
                type="button"
                onClick={
                  openBookingModal
                }
                disabled={!isTenant}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <CalendarDays className="h-5 w-5" />

                {isTenant
                  ? "Book This Property"
                  : "Tenant Account Required"}
              </button>

              {!isTenant && (
                <p className="mt-3 text-center text-xs text-slate-500 dark:text-zinc-500">
                  Property booking is
                  available only for
                  tenant accounts.
                </p>
              )}
            </div>
          </section>

          {/* DETAILS */}

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* DESCRIPTION */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                About This Property
              </h2>

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-zinc-400">
                {property.description}
              </p>

              {/* AMENITIES */}

              {property.amenities
                ?.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-8 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Amenities
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {property.amenities.map(
                      (
                        amenity,
                        index
                      ) => (
                        <div
                          key={`${amenity}-${index}`}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-zinc-800/70"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <Check className="h-4 w-4" />
                          </span>

                          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                            {amenity}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* EXTRA FEATURES */}

              {property.extraFeatures
                ?.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-8 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Extra Features
                  </h3>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {property.extraFeatures.map(
                      (
                        feature,
                        index
                      ) => (
                        <span
                          key={`${feature}-${index}`}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* OWNER */}

            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                Property Owner
              </h2>

              <div className="mt-6 flex items-center gap-4">
                {property.owner?.photo ? (
                  <img
                    src={
                      property.owner.photo
                    }
                    alt={
                      property.owner.name ||
                      "Property Owner"
                    }
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                    <User className="h-7 w-7 text-slate-500 dark:text-zinc-400" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">
                    {property.owner?.name ||
                      "Property Owner"}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-zinc-400">
                    {property.owner?.email ||
                      "Owner"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/70">
                <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                  This property is managed
                  by the listed owner.
                  Contact information is
                  shared during the booking
                  process.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                <CalendarDays className="h-4 w-4" />

                Listed{" "}
                {formatDate(
                  property.createdAt
                )}
              </div>
            </div>
          </section>

        </div>

        {/* REVIEWS & RATINGS */}
        <ReviewSection
          propertyId={propertyId}
          propertyTitle={property?.title}
          session={session}
        />
       
      </main>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeBookingModal();
            }
          }}
        >
          <div className="my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-zinc-800 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                  Booking Request
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Book This Property
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                  Provide your booking
                  information below.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeBookingModal
                }
                disabled={
                  bookingLoading
                }
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleBookingSubmit
              }
              className="space-y-6 p-6 sm:p-7"
            >
              {/* PROPERTY */}

              <div className="flex gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/70">
                <img
                  src={images[0]}
                  alt={property.title}
                  className="h-20 w-24 rounded-xl object-cover"
                />

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-950 dark:text-white">
                    {property.title}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" />

                    {property.location}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    ৳
                    {formatPrice(
                      property.rent
                    )}{" "}
                    /{" "}
                    {property.rentType ||
                      "Monthly"}
                  </p>
                </div>
              </div>

              {/* USER INFO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  User Information
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <p className="text-xs text-slate-500 dark:text-zinc-500">
                      Name
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user.name ||
                        "User"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <p className="text-xs text-slate-500 dark:text-zinc-500">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user.email ||
                        "Email"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MOVE IN DATE */}

              <div>
                <label
                  htmlFor="moveInDate"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-200"
                >
                  Move-in Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="moveInDate"
                    name="moveInDate"
                    type="date"
                    value={
                      formData.moveInDate
                    }
                    onChange={
                      handleInputChange
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
                  />
                </div>
              </div>

              {/* PHONE + DURATION */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-200"
                  >
                    Contact Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="+880 1XXXXXXXXX"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-200"
                  >
                    Duration
                  </label>

                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={
                      formData.duration
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
                  />
                </div>
              </div>

              {/* NOTES */}

              <div>
                <label
                  htmlFor="additionalNotes"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-200"
                >
                  Additional Notes
                </label>

                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows="4"
                  value={
                    formData.additionalNotes
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Write any additional information for the property owner..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
                />
              </div>

              {/* TOTAL */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Estimated Total
                  </span>

                  <span className="text-xl font-bold text-slate-950 dark:text-white">
                    ৳
                    {formatPrice(
                      totalAmount
                    )}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                  {formatPrice(
                    property.rent
                  )}{" "}
                  ×{" "}
                  {formData.duration ||
                    1}{" "}
                  {(
                    property.rentType ||
                    "Monthly"
                  ).toLowerCase()}
                  {Number(
                    formData.duration
                  ) > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              {/* PAYMENT BUTTON */}

              <button
                type="submit"
                disabled={
                  bookingLoading
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Opening Payment...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Continue to Payment
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-zinc-500">
                You will review your
                booking information and
                continue to secure Stripe
                payment.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}