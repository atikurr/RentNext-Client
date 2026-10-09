"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Search,
  MapPin,
  Home,
  KeyRound,
  Building2,
  ShieldCheck,
  Users,
  ArrowRight,
  ChevronDown,
  Star,
  Headphones,
  LockKeyhole,
  BadgeDollarSign,
  Mouse,
  Check,
} from "lucide-react";

export default function Hero() {
  const router = useRouter();

  // --------------------------------------------------
  // Search States
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState("Rent");

  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // --------------------------------------------------
  // Bangladesh Locations
  // --------------------------------------------------

  const bangladeshLocations = [
    "Dhaka",
    "Chattogram",
    "Gazipur",
    "Narayanganj",
    "Sylhet",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Rangpur",
    "Mymensingh",
    "Cumilla",
    "Cox's Bazar",
    "Bogura",
    "Jashore",
    "Tangail",
  ];

  // --------------------------------------------------
  // Property Types
  // --------------------------------------------------

  const propertyTypes = [
    "Apartment",
    "House",
    "Villa",
    "Studio",
    "Office",
  ];

  // --------------------------------------------------
  // Search Tabs
  // --------------------------------------------------

  const tabs = [
    {
      name: "Rent",
      icon: KeyRound,
    },
    {
      name: "Buy",
      icon: Home,
    },
    {
      name: "Projects",
      icon: Building2,
    },
    {
      name: "Commercial",
      icon: Building2,
    },
  ];

  // --------------------------------------------------
  // Production Search Handler
  // --------------------------------------------------

  const handleSearch = (event) => {
    event?.preventDefault();

    setSearchError("");

    const cleanLocation = location.trim();
    const cleanPropertyType = propertyType.trim();

    const min = minPrice
      ? Number(minPrice)
      : null;

    const max = maxPrice
      ? Number(maxPrice)
      : null;

    // -------------------------------
    // Validate Min Price
    // -------------------------------

    if (min !== null && (!Number.isFinite(min) || min < 0)) {
      setSearchError("Please enter a valid minimum price.");
      return;
    }

    // -------------------------------
    // Validate Max Price
    // -------------------------------

    if (max !== null && (!Number.isFinite(max) || max < 0)) {
      setSearchError("Please enter a valid maximum price.");
      return;
    }

    // -------------------------------
    // Validate Price Range
    // -------------------------------

    if (
      min !== null &&
      max !== null &&
      min > max
    ) {
      setSearchError(
        "Minimum price cannot be greater than maximum price."
      );
      return;
    }

    // -------------------------------
    // Build Query
    // -------------------------------

    const params = new URLSearchParams();

    if (cleanLocation) {
      params.set("location", cleanLocation);
    }

    if (cleanPropertyType) {
      params.set(
        "propertyType",
        cleanPropertyType
      );
    }

    if (min !== null) {
      params.set(
        "minPrice",
        String(min)
      );
    }

    if (max !== null) {
      params.set(
        "maxPrice",
        String(max)
      );
    }

    // -------------------------------
    // Navigate
    // -------------------------------

    const query = params.toString();

    setSearching(true);

    router.push(
      query
        ? `/properties?${query}`
        : "/properties"
    );
  };

  return (
    <section className="relative w-full bg-white">
      <div className="relative min-h-[850px] w-full overflow-hidden sm:min-h-[880px] lg:min-h-[900px]">

        {/* =====================================================
            BACKGROUND IMAGE
        ====================================================== */}

        <div className="absolute inset-0">
          <Image
            src="/assets/hero.png"
            alt="Luxury rental property"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Soft sunlight */}

        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/20 via-transparent to-orange-100/10" />

        {/* Bottom dark gradient */}

        <div className="absolute inset-x-0 bottom-0 h-[330px] bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pt-[205px] sm:px-10 lg:px-20 lg:pt-[220px]">

          <motion.div
            initial={{
              opacity: 0,
              x: -45,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="max-w-[720px]"
          >

            {/* Badge */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-5 py-3 text-sm font-bold text-slate-800 shadow-lg backdrop-blur-xl"
            >
              <Home
                size={17}
                className="text-orange-500"
              />

              Find Your Dream Home
            </motion.div>

            {/* Heading */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
              className="text-[48px] font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-[62px] lg:text-[78px]"
            >
              Find a perfect home

              <span className="block text-orange-500">
                you&apos;ll love
                <span className="ml-1 inline-block animate-pulse text-slate-900">
                  |
                </span>
              </span>
            </motion.h1>

            {/* Description */}

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.35,
              }}
              className="mt-7 max-w-[650px] text-base font-medium leading-7 text-slate-700 sm:text-lg"
            >
              Discover verified rental properties and find a comfortable
              home that perfectly matches your lifestyle and budget.
            </motion.p>

            {/* =================================================
                STATS
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.5,
              }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <StatCard
                icon={<Home size={20} />}
                value="500+"
                label="Verified Properties"
                iconClass="bg-orange-50 text-orange-500"
              />

              <StatCard
                icon={<ShieldCheck size={20} />}
                value="100%"
                label="Trusted Listings"
                iconClass="bg-sky-50 text-sky-500"
              />

              <StatCard
                icon={<Users size={20} />}
                value="2K+"
                label="Happy Tenants"
                iconClass="bg-emerald-50 text-emerald-500"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* =====================================================
            FEATURED PROPERTY
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: 45,
            y: -15,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.45,
          }}
          className="absolute right-[5%] top-[220px] z-20 hidden w-[315px] rotate-1 rounded-[25px] border border-white/90 bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl xl:block"
        >
          <div className="flex items-center gap-3">

            <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[17px]">
              <Image
                src="/assets/hero.png"
                alt="Modern Villa"
                fill
                sizes="76px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[11px] font-medium text-slate-400">
                Featured Property
              </p>

              <h3 className="mt-1 truncate text-[15px] font-bold text-slate-900">
                Modern Villa
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin
                  size={12}
                  className="text-orange-500"
                />

                Premium Location
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg">
              <ArrowRight size={17} />
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            SEARCH PANEL
        ====================================================== */}

        <motion.form
          onSubmit={handleSearch}
          initial={{
            opacity: 0,
            y: 45,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.6,
            type: "spring",
            stiffness: 70,
          }}
          className="absolute bottom-[70px] left-1/2 z-30 w-[calc(100%-32px)] max-w-[1380px] -translate-x-1/2"
        >
          <div className="rounded-[28px] border border-white/90 bg-white/95 p-3 shadow-[0_25px_70px_rgba(15,23,42,0.25)] backdrop-blur-2xl">

            {/* =================================================
                TABS
            ================================================== */}

            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-3">

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  activeTab === tab.name;

                return (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.name)
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.3)]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                );
              })}

              <div className="ml-auto hidden rounded-xl bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-500 md:block">
                New Launch
              </div>
            </div>

            {/* =================================================
                FILTERS
            ================================================== */}

            <div className="grid gap-2 pt-3 md:grid-cols-2 lg:grid-cols-[1.3fr_1.25fr_1fr_1fr_1.15fr]">

              {/* LOCATION */}

              <div className="flex h-[66px] items-center rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">

                <MapPin
                  size={21}
                  className="mr-3 shrink-0 text-orange-500"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </p>

                  <select
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setSearchError("");
                    }}
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium text-slate-800 outline-none"
                  >
                    <option value="">
                      All Locations
                    </option>

                    {bangladeshLocations.map(
                      (city) => (
                        <option
                          key={city}
                          value={city}
                        >
                          {city}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <ChevronDown
                  size={15}
                  className="pointer-events-none text-slate-400"
                />
              </div>

              {/* PROPERTY TYPE */}

              <div className="flex h-[66px] items-center rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">

                <Home
                  size={21}
                  className="mr-3 shrink-0 text-orange-500"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Property Type
                  </p>

                  <select
                    value={propertyType}
                    onChange={(e) => {
                      setPropertyType(
                        e.target.value
                      );
                      setSearchError("");
                    }}
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium text-slate-800 outline-none"
                  >
                    <option value="">
                      All Property Types
                    </option>

                    {propertyTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <ChevronDown
                  size={15}
                  className="pointer-events-none text-slate-400"
                />
              </div>

              {/* MIN PRICE */}

              <div className="flex h-[66px] items-center rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">

                <span className="mr-3 text-lg font-bold text-orange-500">
                  $
                </span>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Min Price
                  </p>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(
                        e.target.value
                      );
                      setSearchError("");
                    }}
                    placeholder="$500"
                    className="mt-1 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* MAX PRICE */}

              <div className="flex h-[66px] items-center rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-300 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">

                <span className="mr-3 text-lg font-bold text-orange-500">
                  $
                </span>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Max Price
                  </p>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(
                        e.target.value
                      );
                      setSearchError("");
                    }}
                    placeholder="$5,000"
                    className="mt-1 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                disabled={searching}
                className="group flex h-[66px] items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_16px_35px_rgba(249,115,22,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {searching ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search
                      size={20}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />

                    <span>
                      Search Properties
                    </span>

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            {/* Search Error */}

            {searchError && (
              <p className="px-2 pt-2 text-xs font-medium text-red-500">
                {searchError}
              </p>
            )}
          </div>
        </motion.form>

        {/* =====================================================
            TRUST BAR
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 1,
          }}
          className="absolute bottom-0 left-0 z-20 hidden w-full lg:block"
        >
          <div className="px-10 py-4">

            <div className="mx-auto flex max-w-[1400px] items-center justify-between">

              {/* LEFT */}

              <div className="flex items-center gap-4">

                <div className="flex -space-x-3">
                  <Avatar />
                  <Avatar position="center" />
                  <Avatar position="right" />
                  <Avatar position="bottom" />

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-[10px] font-bold text-slate-800">
                    +2K
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    5,000+ Happy Families
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={13}
                            className="fill-yellow-400 text-yellow-400"
                          />
                        )
                      )}
                    </div>

                    <span className="text-xs text-white/80">
                      4.8 (2.3K reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER */}

              <motion.div
                animate={{
                  y: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hidden flex-col items-center text-white/90 xl:flex"
              >
                <Mouse
                  size={25}
                  strokeWidth={1.5}
                />

                <span className="mt-1 text-[10px] font-medium">
                  Scroll to explore
                </span>

                <ChevronDown
                  size={14}
                  className="mt-0.5"
                />
              </motion.div>

              {/* RIGHT */}

              <div className="flex items-center gap-8">

                <TrustFeature
                  icon={<Headphones size={25} />}
                  title="24/7 Support"
                  subtitle="Always here for you"
                />

                <TrustFeature
                  icon={<LockKeyhole size={25} />}
                  title="Secure & Safe"
                  subtitle="Verified properties"
                />

                <TrustFeature
                  icon={<BadgeDollarSign size={25} />}
                  title="Best Price"
                  subtitle="No hidden fees"
                />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  value,
  label,
  iconClass,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-lg font-black text-slate-900">
          {value}
        </p>

        <p className="text-xs text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ position = "left" }) {
  const positions = {
    left: "object-left",
    center: "object-center",
    right: "object-right",
    bottom: "object-bottom",
  };

  return (
    <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-slate-300">
      <Image
        src="/assets/hero.png"
        alt="Happy customer"
        fill
        sizes="36px"
        className={`object-cover ${positions[position]}`}
      />
    </div>
  );
}

/* =========================================================
   TRUST FEATURE
========================================================= */

function TrustFeature({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 text-white">

      <div className="text-white">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold">
            {title}
          </p>

          <Check
            size={12}
            className="text-emerald-400"
          />
        </div>

        <p className="mt-0.5 text-[10px] text-white/60">
          {subtitle}
        </p>
      </div>
    </div>
  );
}