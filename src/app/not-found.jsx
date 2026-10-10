
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Search,
  Building2,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5] px-5 py-16">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-600 shadow-sm">
          <Building2 size={38} strokeWidth={1.7} />
        </div>

        {/* 404 */}
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-orange-600">
          Page Not Found
        </p>

        <h1 className="text-8xl font-extrabold tracking-tight text-gray-900 sm:text-9xl">
          4<span className="text-orange-500">0</span>4
        </h1>

        <h2 className="mt-5 text-2xl font-bold text-gray-800 sm:text-3xl">
          Oops! You seem to be lost.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-500 sm:text-lg">
          The property or pages you are looking for does not exist,
          may have been moved, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
          >
            <Home size={19} />
            Back to Home
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 transition duration-300 hover:border-orange-300 hover:bg-orange-50"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-orange-100 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Search size={19} />
            </span>
            Rent<span className="text-orange-500">Next</span>
          </Link>

          <p className="mt-3 text-sm text-gray-400">
            Find your next place to call home.
          </p>
        </div>
      </div>
    </main>
  );
}
