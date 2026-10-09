"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-zinc-950 sm:py-16">
      <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-12">

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <XCircle
              size={44}
              className="text-red-600 dark:text-red-400"
            />
          </div>

          {/* Heading */}
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <CreditCard size={14} />
              Payment Cancelled
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Payment Was Cancelled
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
              Your Stripe payment was cancelled or was not completed.
              No booking has been created from this payment attempt.
            </p>
          </div>

          {/* Info */}
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-800">
                <CreditCard
                  size={19}
                  className="text-zinc-700 dark:text-zinc-200"
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  What happened?
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  You can return to the property and try the booking
                  payment again whenever you are ready.
                </p>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <RefreshCw size={17} />
              Browse Properties
            </Link>

            <Link
              href="/dashboard/tenant/bookings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={17} />
              My Bookings
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Home size={17} />
              Home
            </Link>

          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-zinc-400">
            You can safely try the payment again later.
          </p>

        </div>
      </div>
    </main>
  );
}