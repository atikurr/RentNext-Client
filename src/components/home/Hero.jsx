
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
  Mouse,
  Check,
} from "lucide-react";

const locations = [
  "Dhaka",
  "Gazipur",
  "Savar",
  "Chattogram",
  "Narayanganj",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Cumilla",
  "Cox's Bazar",
];

const propertyTypes = [
  "Apartment",
  "House",
  "Villa",
  "Studio",
  "Office",
  "Duplex",
];

const tabs = [
  { name: "Rent", icon: KeyRound },
  { name: "Buy", icon: Home },
  { name: "Projects", icon: Building2 },
  { name: "Commercial", icon: Building2 },
];

export default function Hero() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Rent");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    setError("");

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (
      (min !== null && (!Number.isFinite(min) || min < 0)) ||
      (max !== null && (!Number.isFinite(max) || max < 0))
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      setError("Minimum price cannot exceed maximum price.");
      return;
    }

    const params = new URLSearchParams();

    if (location) params.set("location", location);
    if (propertyType) params.set("propertyType", propertyType);
    if (min !== null) params.set("minPrice", String(min));
    if (max !== null) params.set("maxPrice", String(max));
    params.set("type", activeTab.toLowerCase());

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <section className="relative isolate w-full min-w-0 overflow-x-clip bg-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/assets/hero.png"
          alt="Beautiful rental property"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Background overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/75 via-white/35 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/75 via-transparent to-white/10" />

      {/* Main content */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-32 sm:px-6 sm:pb-10 sm:pt-36 md:px-8 md:pt-40 lg:px-12 lg:pb-12 lg:pt-44 xl:px-16">
        {/* Hero heading and featured card */}
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-w-0"
          >
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-3 text-xs font-bold text-slate-800 shadow-lg sm:mb-6 sm:px-5 sm:text-sm">
              <Home size={18} className="shrink-0 text-orange-500" />
              <span>Find Your Dream Home</span>
            </div>

            <h1 className="max-w-3xl text-[clamp(2.25rem,7vw,4.75rem)] font-black leading-[1.08] tracking-tight text-slate-950">
              Find a perfect
              <span className="block text-orange-500">
                home you&apos;ll love.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
              Discover verified properties and find a comfortable home
              that matches your lifestyle and budget.
            </p>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8 sm:grid-cols-3">
              <StatCard
                icon={<Home size={20} />}
                value="500+"
                label="Properties"
                color="bg-orange-100 text-orange-600"
              />

              <StatCard
                icon={<ShieldCheck size={20} />}
                value="100%"
                label="Trusted Listings"
                color="bg-sky-100 text-sky-600"
              />

              <StatCard
                icon={<Users size={20} />}
                value="2K+"
                label="Happy Tenants"
                color="bg-emerald-100 text-emerald-600"
              />
            </div>
          </motion.div>

          {/* Featured card: tablet/mobile hidden to preserve space */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden min-w-0 lg:block"
          >
            <div className="ml-auto max-w-[420px] rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl xl:p-5">
              <div className="relative h-56 overflow-hidden rounded-2xl xl:h-64">
                <Image
                  src="/assets/hero.png"
                  alt="Featured modern property"
                  fill
                  sizes="(min-width: 1280px) 420px, 380px"
                  className="object-cover"
                />

                <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-2 text-xs font-bold text-white">
                  Featured Property
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    Find Your New Home
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={15} className="shrink-0 text-orange-500" />
                    Explore available properties
                  </p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                  <ArrowRight size={20} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search form: normal document flow, no absolute positioning */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 mt-8 w-full min-w-0 sm:mt-10 lg:mt-12"
        >
          <div className="w-full min-w-0 rounded-2xl border border-white/90 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-5 lg:p-6">
            {/* Tabs */}
            <div className="flex min-w-0 gap-2 overflow-x-auto border-b border-slate-200 pb-3 sm:gap-3 sm:pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.name;

                return (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => setActiveTab(tab.name)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition sm:px-5 sm:text-sm ${
                      active
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Responsive filters */}
            <div className="grid min-w-0 grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-5">
              <FilterField icon={<MapPin size={20} />}>
                <label
                  htmlFor="hero-location"
                  className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                >
                  Location
                </label>

                <div className="relative mt-1">
                  <select
                    id="hero-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full min-w-0 appearance-none bg-transparent pr-5 text-sm font-semibold text-slate-800 outline-none"
                  >
                    <option value="">All Locations</option>
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-0 top-1 text-slate-400"
                  />
                </div>
              </FilterField>

              <FilterField icon={<Home size={20} />}>
                <label
                  htmlFor="hero-property-type"
                  className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                >
                  Property Type
                </label>

                <div className="relative mt-1">
                  <select
                    id="hero-property-type"
                    value={propertyType}
                    onChange={(event) =>
                      setPropertyType(event.target.value)
                    }
                    className="w-full min-w-0 appearance-none bg-transparent pr-5 text-sm font-semibold text-slate-800 outline-none"
                  >
                    <option value="">All Property Types</option>
                    {propertyTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-0 top-1 text-slate-400"
                  />
                </div>
              </FilterField>

              <FilterField icon={<span className="text-lg font-bold">৳</span>}>
                <label
                  htmlFor="hero-min-price"
                  className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                >
                  Min Price
                </label>

                <input
                  id="hero-min-price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="5,000"
                  className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </FilterField>

              <FilterField icon={<span className="text-lg font-bold">৳</span>}>
                <label
                  htmlFor="hero-max-price"
                  className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                >
                  Max Price
                </label>

                <input
                  id="hero-max-price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="50,000"
                  className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </FilterField>

              <button
                type="submit"
                className="flex min-h-[60px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.99] sm:col-span-2 lg:col-span-1"
              >
                <Search size={19} />
                <span>Search Properties</span>
                <ArrowRight size={17} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}
          </div>
        </motion.form>

        {/* Trust bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-white/20 bg-slate-950/40 p-4 text-white backdrop-blur-md sm:grid-cols-2 sm:p-5 lg:mt-7 lg:grid-cols-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 -space-x-2">
              {["A", "R", "S", "M"].map((letter, index) => (
                <div
                  key={letter}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
                    index % 2 === 0 ? "bg-orange-500" : "bg-orange-700"
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">Happy Families</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} fill="currentColor" />
                  ))}
                </span>
                <span className="text-xs text-white/80">
                  Customer trust
                </span>
              </div>
            </div>
          </div>

          <TrustFeature
            icon={<Headphones size={23} />}
            title="24/7 Support"
            subtitle="We're here to help"
          />

          <TrustFeature
            icon={<LockKeyhole size={23} />}
            title="Safe & Secure"
            subtitle="Your search, made simple"
          />
        </div>

        <div className="mt-5 hidden items-center justify-center gap-2 text-xs font-medium text-white/90 lg:flex">
          <Mouse size={17} />
          Scroll to explore
          <ChevronDown size={14} />
        </div>
      </div>
    </section>
  );
}

function FilterField({ icon, children }) {
  return (
    <div className="flex min-h-[70px] min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 sm:px-4">
      <span className="shrink-0 text-orange-500">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-3 shadow-lg backdrop-blur-xl sm:px-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${color}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-lg font-black text-slate-900">{value}</p>
        <p className="text-xs leading-4 text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function TrustFeature({ icon, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-300">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold">{title}</p>
          <Check size={13} className="text-emerald-400" />
        </div>
        <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>
      </div>
    </div>
  );
}
