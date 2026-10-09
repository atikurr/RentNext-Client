"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| PAYMENT SUCCESS PAGE
|--------------------------------------------------------------------------
*/

export default function PaymentSuccessPage() {
  const searchParams =
    useSearchParams();

  const sessionId =
    searchParams.get(
      "session_id"
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [paymentData, setPaymentData] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | VERIFY PAYMENT
  |--------------------------------------------------------------------------
  */

useEffect(() => {
  let cancelled = false;

  const timer = setTimeout(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          setError(
            "Stripe payment session ID is missing."
          );

          setLoading(false);

          return;
        }

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/payments/verify-session/${encodeURIComponent(
            sessionId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to verify your payment."
          );
        }

        if (!result?.paid) {
          throw new Error(
            "Your payment has not been confirmed."
          );
        }

        if (!cancelled) {
          setPaymentData(result);

          toast.success(
            "Payment successful! Your booking has been created."
          );
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        if (!cancelled) {
          setError(
            error.message ||
              "Payment verification failed."
          );

          toast.error(
            error.message ||
              "Payment verification failed."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verifyPayment();
  }, 0);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [sessionId]);
  /*
  |--------------------------------------------------------------------------
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (
    amount
  ) => {
    return `৳${new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 0,
      }
    ).format(
      Number(amount || 0)
    )}`;
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-zinc-950">

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />

        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">

              <Loader2
                size={36}
                className="animate-spin text-zinc-700 dark:text-zinc-200"
              />

            </div>

            <h1 className="mt-6 text-2xl font-bold text-zinc-950 dark:text-white">
              Verifying Your Payment
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Please wait while we securely verify your Stripe payment
              and create your booking. Do not close this page.
            </p>

            <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">

              <ShieldCheck
                size={16}
              />

              Secure payment verification

            </div>

          </div>

        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR STATE
  |--------------------------------------------------------------------------
  */

  if (error || !paymentData) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-zinc-950">

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />

        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-zinc-900 sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">

              <ReceiptText
                size={36}
                className="text-red-600 dark:text-red-400"
              />

            </div>

            <h1 className="mt-6 text-2xl font-bold text-zinc-950 dark:text-white">
              Payment Verification Failed
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {error ||
                "We could not verify your payment."}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/dashboard/tenant/bookings"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Go to My Bookings

                <ArrowRight
                  size={16}
                />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Back to Home
              </Link>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUCCESS DATA
  |--------------------------------------------------------------------------
  */

  const booking =
    paymentData.booking || {};

  const transaction =
    paymentData.transaction || {};

  const property =
    paymentData.property || {};

  /*
  |--------------------------------------------------------------------------
  | SUCCESS PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-zinc-950 sm:py-12">

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto max-w-4xl">

        {/* ======================================================
            SUCCESS HEADER
        ====================================================== */}

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">

            <CheckCircle2
              size={42}
              className="text-emerald-600 dark:text-emerald-400"
            />

          </div>

          <div className="mt-6">

            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">

              <ShieldCheck
                size={14}
              />

              Payment Confirmed

            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Booking Confirmed!
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
              Your payment was successfully processed through Stripe.
              Your booking has been created and is now waiting for owner approval.
            </p>

          </div>

        </section>

        {/* ======================================================
            BOOKING + TRANSACTION
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ====================================================
              PROPERTY
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                  <Building2
                    size={19}
                    className="text-zinc-700 dark:text-zinc-200"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Property Details
                  </h2>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Your booked property
                  </p>

                </div>

              </div>

            </div>

            <div className="p-5">

              <div className="flex flex-col gap-5 sm:flex-row">

                {property.image ? (
                  <img
                    src={
                      property.image
                    }
                    alt={
                      property.title ||
                      "Property"
                    }
                    className="h-40 w-full rounded-2xl object-cover sm:h-32 sm:w-48"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 sm:h-32 sm:w-48 dark:bg-zinc-800">

                    <Building2
                      size={35}
                    />

                  </div>
                )}

                <div className="min-w-0 flex-1">

                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                    {property.title ||
                      "Property"}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">

                    <MapPin
                      size={16}
                    />

                    <span>
                      {property.location ||
                        "Location unavailable"}
                    </span>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">

                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Booking Status
                      </p>

                      <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                        {booking.status ||
                          "Pending"}
                      </p>

                    </div>

                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">

                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Payment Status
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {booking.paymentStatus ||
                          "Paid"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ====================================================
              AMOUNT
          ==================================================== */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                <CreditCard
                  size={19}
                  className="text-zinc-700 dark:text-zinc-200"
                />

              </div>

              <div>

                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Payment
                </h2>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Stripe transaction
                </p>

              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white dark:bg-white dark:text-zinc-950">

              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                Amount Paid
              </p>

              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(
                  transaction.amount
                )}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs opacity-70">

                <CheckCircle2
                  size={14}
                />

                Paid successfully

              </div>

            </div>

            <div className="mt-5 space-y-4">

              <div>

                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Transaction ID
                </p>

                <p className="mt-1 break-all text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {transaction.transactionId ||
                    "N/A"}
                </p>

              </div>

              <div>

                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {transaction.paymentMethod ||
                    "Stripe"}
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* ======================================================
            BOOKING INFORMATION
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                <CalendarDays
                  size={19}
                  className="text-zinc-700 dark:text-zinc-200"
                />

              </div>

              <div>

                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Booking Information
                </h2>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your reservation details
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">

              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Move-in Date
              </p>

              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                {formatDate(
                  booking.moveInDate
                )}
              </p>

            </div>

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">

              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Duration
              </p>

              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                {booking.duration ||
                  1}{" "}
                {Number(
                  booking.duration
                ) === 1
                  ? "month"
                  : "months"}
              </p>

            </div>

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">

              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Total Amount
              </p>

              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                {formatCurrency(
                  booking.totalAmount
                )}
              </p>

            </div>

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">

              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Booking ID
              </p>

              <p className="mt-2 truncate text-sm font-bold text-zinc-900 dark:text-white">
                {booking.id ||
                  "N/A"}
              </p>

            </div>

          </div>

        </section>

        {/* ======================================================
            NEXT STEP
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">

              <ShieldCheck
                size={20}
                className="text-amber-600 dark:text-amber-400"
              />

            </div>

            <div>

              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                What happens next?
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-400">
                Your payment has been received successfully. The booking
                is currently{" "}
                <strong>
                  Pending
                </strong>
                . The property owner will review your booking request and
                approve or reject it from their dashboard.
              </p>

            </div>

          </div>

        </section>

        {/* ======================================================
            ACTIONS
        ====================================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            href="/dashboard/tenant/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >

            View My Bookings

            <ArrowRight
              size={17}
            />

          </Link>

          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >

            Browse Properties

          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >

            Home

          </Link>

        </div>

        {/* ======================================================
            SECURITY NOTE
        ====================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-zinc-400">

          <UserRound
            size={14}
          />

          Payment secured by Stripe

        </div>

      </div>
    </main>
  );
}