"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* ================= BRAND ================= */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg">
                <Image
                  src="/assets/logo.png"
                  alt="RentNest Logo"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Rent<span className="text-orange-500">Nest</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Find verified rental properties and discover a comfortable home
              that matches your lifestyle, location, and budget.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M14 8h3V4h-3c-3.314 0-5 1.686-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.552.448-1 1-1Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-[19px] w-[19px]"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3A2.05 2.05 0 1 0 4.75 7.1 2.05 2.05 0 0 0 4.75 3ZM21 13.84c0-3.76-2-5.51-4.67-5.51-2.15 0-3.1 1.18-3.63 2.01V8.5H9.2V21h3.5v-6.19c0-1.63.31-3.2 2.32-3.2 1.98 0 2 1.86 2 3.3V21H21v-7.16Z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="#"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[17px] w-[17px]"
                >
                  <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.59l-5.16-6.75L5.1 22H1.84l7.61-8.7L1.25 2h6.76l4.66 6.16L18.244 2Zm-1.15 17.87h1.8L7.02 4.02H5.09l12.004 15.85Z" />
                </svg>
              </a>

            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/properties"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  All Properties
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= FOR YOU ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              For You
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Find a Property
                  <ArrowUpRight size={14} />
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/owner/add-property"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  List Your Property
                </Link>
              </li>

              <li>
                <Link
                  href="/properties"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Browse Rentals
                </Link>
              </li>

              <li>
                <Link
                  href="/#why-rentnest"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  Why Choose Us
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4">

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <p className="text-sm leading-6 text-slate-400">
                  Dhaka, Bangladesh
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="shrink-0 text-orange-500"
                />

                <a
                  href="tel:+8801560017344"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  +880 1560-017344
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="shrink-0 text-orange-500"
                />

                <a
                  href="mailto:info@rentnest.com"
                  className="text-sm text-slate-400 transition hover:text-orange-400"
                >
                  info@rentnest.com
                </a>
              </div>
            </div>

            {/* Support Badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Support available
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} RentNest. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-orange-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-orange-400"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}