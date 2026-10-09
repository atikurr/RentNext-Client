"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  MapPin,
  Ruler,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL = "http://localhost:5000";

const formatCurrency = (amount) => {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
};

function PropertyCard({ property, index }) {
  const image = property?.images?.[0] || "";

  const handleViewDetails = async (event) => {
    event.preventDefault();

    try {
      const { data } = await authClient.getSession();

      if (data?.session) {
        window.location.href = `/properties/${property._id}`;
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Session check failed:", error);
      window.location.href = "/login";
    }
  };

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
    >
      {/* Image */}
      <div className="relative h-[250px] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={property?.title || "Rental property"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-14 w-14 text-slate-300" />
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Property Type */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/30 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md">
            {property?.type || "Property"}
          </span>
        </div>

        {/* Available */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/20">
            Available
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-xl font-bold">
            {formatCurrency(property?.rent)}
          </p>

          <p className="text-xs font-medium text-white/80">
            / {property?.rentType || "Monthly"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900">
          {property?.title || "Beautiful Rental Property"}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-orange-500" />

          <p className="line-clamp-1 text-sm text-slate-500">
            {property?.location || "Location unavailable"}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-[42px] text-sm leading-6 text-slate-500">
          {property?.description ||
            "A comfortable and modern property ready for your next stay."}
        </p>

        {/* Property Info */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <BedDouble className="h-4 w-4 text-orange-500" />
            <span>{property?.bedrooms || 0} Beds</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Bath className="h-4 w-4 text-orange-500" />
            <span>{property?.bathrooms || 0} Baths</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Ruler className="h-4 w-4 text-orange-500" />
            <span>{property?.size || 0} sqft</span>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleViewDetails}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </motion.article>
  );
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/properties?limit=6`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load featured properties."
          );
        }

        if (!cancelled) {
          setProperties(
            Array.isArray(data?.properties)
              ? data.properties.slice(0, 6)
              : []
          );
        }
      } catch (error) {
        console.error(
          "Featured properties error:",
          error
        );

        if (!cancelled) {
          setError(
            error.message ||
              "Failed to load properties."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeaturedProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Featured Properties
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Find a place that
              <span className="text-orange-500">
                {" "}
                feels like home.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Explore our handpicked selection of approved
              rental properties and discover a space that
              matches your lifestyle.
            </p>
          </div>

          <Link
            href="/properties"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
          >
            View All Properties
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
              >
                <div className="h-[250px] animate-pulse bg-slate-100" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          properties.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                No approved properties available yet.
              </p>
            </div>
          )}

        {/* Properties */}
        {!loading &&
          !error &&
          properties.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  index={index}
                />
              ))}
            </div>
          )}
      </div>
    </section>
  );
}