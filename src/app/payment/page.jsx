"use client";

import { Suspense,useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  WalletCards,
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-BD").format(
    Number(price || 0)
  );
};

const formatDate = (date) => {
  if (!date) {
    return "Not provided";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-BD",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};

/*
|--------------------------------------------------------------------------
| PAYMENT PAGE
|--------------------------------------------------------------------------
*/

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
  |--------------------------------------------------------------------------
  | QUERY PARAMETERS
  |--------------------------------------------------------------------------
  */

  const propertyId =
    searchParams.get("propertyId") || "";

  const moveInDate =
    searchParams.get("moveInDate") || "";

  const phone =
    searchParams.get("phone") || "";

  const additionalNotes =
    searchParams.get("additionalNotes") || "";

  const duration = Math.max(
    Number(
      searchParams.get("duration") || 1
    ),
    1
  );

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [session, setSession] =
    useState(null);

  const [property, setProperty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | TOTAL AMOUNT
  |--------------------------------------------------------------------------
  */

  const totalAmount = useMemo(() => {
    return (
      Number(property?.rent || 0) *
      duration
    );
  }, [property, duration]);

  /*
  |--------------------------------------------------------------------------
  | LOAD SESSION + PROPERTY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        /*
        |--------------------------------------------------------------------------
        | PROPERTY ID CHECK
        |--------------------------------------------------------------------------
        */

        if (!propertyId) {
          toast.error(
            "Property information is missing."
          );

          router.replace("/properties");

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | GET BETTER AUTH SESSION
        |--------------------------------------------------------------------------
        */

        const sessionResult =
          await authClient.getSession();

        if (!mounted) {
          return;
        }

        if (sessionResult?.error) {
          console.error(
            "Session error:",
            sessionResult.error
          );

          router.replace(
            `/login?callbackUrl=${encodeURIComponent(
              `/payment?${searchParams.toString()}`
            )}`
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | SESSION + USER
        |--------------------------------------------------------------------------
        */

        const sessionData =
          sessionResult?.data?.session ||
          null;

        const currentUser =
          sessionResult?.data?.user ||
          null;

        /*
        |--------------------------------------------------------------------------
        | LOGIN CHECK
        |--------------------------------------------------------------------------
        */

        if (
          !sessionData ||
          !currentUser
        ) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent(
              `/payment?${searchParams.toString()}`
            )}`
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZED SESSION
        |--------------------------------------------------------------------------
        */

        const normalizedSession = {
          ...sessionData,
          user: currentUser,
        };

        setSession(
          normalizedSession
        );

        /*
        |--------------------------------------------------------------------------
        | ROLE CHECK
        |--------------------------------------------------------------------------
        */

        const role = String(
          currentUser?.role || ""
        ).toLowerCase();

        if (role !== "tenant") {
          toast.error(
            "Only tenants can make property payments."
          );

          router.replace("/");

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD PROPERTY
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            `${API_URL}/api/properties/${propertyId}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load property."
          );
        }

        if (!mounted) {
          return;
        }

        setProperty(
          data?.property || null
        );
      } catch (error) {
        console.error(
          "Payment page loading error:",
          error
        );

        if (mounted) {
          toast.error(
            error?.message ||
              "Unable to load payment information."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [
    propertyId,
    router,
    searchParams,
  ]);

  /*
  |--------------------------------------------------------------------------
  | START STRIPE PAYMENT
  |--------------------------------------------------------------------------
  */

  const handlePayment = async () => {
    if (paymentLoading) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SESSION CHECK
    |--------------------------------------------------------------------------
    */

    if (!session?.user) {
      toast.error(
        "Please login before making payment."
      );

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/payment?${searchParams.toString()}`
        )}`
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    const currentUser =
      session.user;

    /*
    |--------------------------------------------------------------------------
    | ROLE CHECK
    |--------------------------------------------------------------------------
    */

    const role = String(
      currentUser?.role || ""
    ).toLowerCase();

    if (role !== "tenant") {
      toast.error(
        "Only tenants can make payments."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PROPERTY CHECK
    |--------------------------------------------------------------------------
    */

    if (!property) {
      toast.error(
        "Property information is not available."
      );

      return;
    }

    if (!propertyId) {
      toast.error(
        "Property ID is missing."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | MOVE-IN DATE
    |--------------------------------------------------------------------------
    */

    if (!moveInDate) {
      toast.error(
        "Move-in date is missing."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DURATION
    |--------------------------------------------------------------------------
    */

    if (
      !duration ||
      duration < 1
    ) {
      toast.error(
        "Invalid booking duration."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | RENT
    |--------------------------------------------------------------------------
    */

    const monthlyRent =
      Number(
        property?.rent || 0
      );

    if (
      !monthlyRent ||
      monthlyRent <= 0
    ) {
      toast.error(
        "Invalid rental price."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | TENANT INFORMATION
    |--------------------------------------------------------------------------
    |
    | Get directly from Better Auth session.
    |
    */

    const tenantId =
      currentUser?.id ||
      currentUser?._id ||
      "";

    const tenantName =
      currentUser?.name ||
      currentUser?.fullName ||
      "Tenant";

    const tenantEmail =
      currentUser?.email ||
      "";

    const tenantPhoto =
      currentUser?.image ||
      currentUser?.photo ||
      currentUser?.avatar ||
      "";

    /*
    |--------------------------------------------------------------------------
    | TENANT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!tenantId) {
      console.error(
        "Tenant ID missing:",
        currentUser
      );

      toast.error(
        "Tenant information is missing. Please login again."
      );

      return;
    }

    if (!tenantEmail) {
      toast.error(
        "Tenant email is missing from your account."
      );

      return;
    }

    try {
      setPaymentLoading(true);

      /*
      |--------------------------------------------------------------------------
      | GET JWT TOKEN
      |--------------------------------------------------------------------------
      */

      let token = null;

      try {
        const tokenResponse =
          await authClient.token();

        token =
          tokenResponse?.data?.token ||
          null;
      } catch (tokenError) {
        console.warn(
          "JWT token could not be retrieved:",
          tokenError
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE STRIPE CHECKOUT SESSION
      |--------------------------------------------------------------------------
      */

      const response =
        await fetch(
          `${API_URL}/api/payments/create-checkout-session`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            credentials: "include",

            body: JSON.stringify({
              /*
              |--------------------------------------------------------------------------
              | PROPERTY
              |--------------------------------------------------------------------------
              */

              propertyId,

              propertyTitle:
                property?.title ||
                "Property Booking",

              rent:
                monthlyRent,

              rentType:
                property?.rentType ||
                "Monthly",

              /*
              |--------------------------------------------------------------------------
              | BOOKING
              |--------------------------------------------------------------------------
              */

              moveInDate,

              duration,

              phone,

              additionalNotes,

              /*
              |--------------------------------------------------------------------------
              | TENANT
              |--------------------------------------------------------------------------
              */

              tenantId,

              tenantName,

              tenantEmail,

              tenantPhoto,
            }),
          }
        );

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const data =
        await response.json();

      /*
      |--------------------------------------------------------------------------
      | API ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create Stripe checkout session."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STRIPE CHECKOUT URL
      |--------------------------------------------------------------------------
      */

      if (data?.checkoutUrl) {
        window.location.assign(
          data.checkoutUrl
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | FALLBACK URL
      |--------------------------------------------------------------------------
      */

      if (data?.url) {
        window.location.assign(
          data.url
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | FALLBACK SESSION URL
      |--------------------------------------------------------------------------
      */

      if (data?.sessionUrl) {
        window.location.assign(
          data.sessionUrl
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | NO URL
      |--------------------------------------------------------------------------
      */

      throw new Error(
        "Stripe checkout URL was not returned by the server."
      );
    } catch (error) {
      console.error(
        "Stripe payment error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to start payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
        />

        <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="animate-pulse">
              <div className="mb-8 h-7 w-40 rounded bg-slate-200 dark:bg-zinc-800" />

              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="h-[500px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />

                <div className="space-y-4">
                  <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />

                  <div className="h-24 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                  <div className="h-14 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                  <div className="h-14 rounded-2xl bg-slate-200 dark:bg-zinc-800" />

                  <div className="h-14 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PROPERTY NOT FOUND
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <CreditCard className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
              Payment Information Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              We could not load the selected
              property information.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/properties"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-950"
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
  | MAIN PAGE
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
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* HEADER */}

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
              Secure Checkout
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Complete Your Payment
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Review your booking details before
              continuing to secure payment with
              Stripe.
            </p>
          </div>

          {/* CONTENT */}

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">

            {/* LEFT */}

            <section className="space-y-6">

              {/* PROPERTY */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <div className="relative h-72 w-full overflow-hidden">
                  <img
                    src={
                      property.images?.[0] ||
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={
                      property.title ||
                      "Property"
                    }
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-7">

                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {property.type ||
                      property.propertyType ||
                      "Property"}
                  </span>

                  <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                    {property.title}
                  </h2>

                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-zinc-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {property.location ||
                        "Location unavailable"}
                    </span>
                  </div>

                </div>
              </div>

              {/* BOOKING DETAILS */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">

                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  Booking Details
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  {/* MOVE IN */}

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">

                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <CalendarDays className="h-4 w-4" />

                      <span className="text-xs font-medium">
                        Move-in Date
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      {formatDate(
                        moveInDate
                      )}
                    </p>

                  </div>

                  {/* DURATION */}

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">

                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <CalendarDays className="h-4 w-4" />

                      <span className="text-xs font-medium">
                        Duration
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      {duration}{" "}
                      {duration === 1
                        ? "month"
                        : "months"}
                    </p>

                  </div>

                  {/* PHONE */}

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">

                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <Phone className="h-4 w-4" />

                      <span className="text-xs font-medium">
                        Contact Number
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {phone ||
                        "Not provided"}
                    </p>

                  </div>

                  {/* TENANT */}

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-800/60">

                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <User className="h-4 w-4" />

                      <span className="text-xs font-medium">
                        Tenant
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {session?.user?.name ||
                        session?.user?.email ||
                        "Tenant"}
                    </p>

                  </div>

                </div>

                {/* NOTES */}

                {additionalNotes && (
                  <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">

                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
                      Additional Notes
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-zinc-300">
                      {additionalNotes}
                    </p>

                  </div>
                )}

              </div>
            </section>

            {/* RIGHT */}

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7 lg:sticky lg:top-6">

              {/* HEADER */}

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <WalletCards className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
                </div>

                <div>

                  <h2 className="font-bold text-slate-950 dark:text-white">
                    Payment Summary
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Secure Stripe payment
                  </p>

                </div>
              </div>

              {/* PRICE */}

              <div className="mt-7 space-y-4">

                <div className="flex items-center justify-between gap-4">

                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Monthly Rent
                  </span>

                  <span className="text-sm font-semibold text-slate-950 dark:text-white">
                    ৳
                    {formatPrice(
                      property.rent
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4">

                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    Duration
                  </span>

                  <span className="text-sm font-semibold text-slate-950 dark:text-white">
                    {duration}{" "}
                    {duration === 1
                      ? "month"
                      : "months"}
                  </span>

                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-zinc-800">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-base font-semibold text-slate-950 dark:text-white">
                      Total Amount
                    </span>

                    <span className="text-2xl font-bold text-slate-950 dark:text-white">
                      ৳
                      {formatPrice(
                        totalAmount
                      )}
                    </span>

                  </div>

                </div>

              </div>

              {/* SECURE */}

              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                  <div>

                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                      Secure Payment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                      Your payment is securely
                      processed through Stripe.
                    </p>

                  </div>

                </div>

              </div>

              {/* PAY */}

              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  paymentLoading
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >

                {paymentLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />

                    Pay ৳
                    {formatPrice(
                      totalAmount
                    )}
                  </>
                )}

              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-zinc-500">
                By continuing, your booking
                request will be submitted and
                payment will be processed securely
                through Stripe.
              </p>

            </aside>
          </div>
        </div>
      </main>
    </>
  ); 
}
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            Loading payment page...
          </p>
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}