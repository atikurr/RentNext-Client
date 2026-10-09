"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/assets/default-avatar.png";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const reduceMotion = useReducedMotion();

  const fetchReviews = useCallback(async (signal) => {
    try {
      const response = await fetch(
        `${API_URL}/api/reviews?limit=4`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Reviews request failed: ${response.status}`);
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.reviews)
          ? data.reviews
          : Array.isArray(data?.data)
            ? data.data
            : [];

      if (signal?.aborted) return;

      setReviews(items.slice(0, 4));
      setActive(0);
      setImageErrors({});
      setFetchError("");
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Customer reviews error:", error);
      setReviews([]);
      setFetchError(
        "Unable to load reviews. Please check your backend server and review API."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Load reviews when the component mounts.
  useEffect(() => {
  const controller = new AbortController();

  const loadReviews = async () => {
    await fetchReviews(controller.signal);
  };

  loadReviews();

  return () => {
    controller.abort();
  };
}, [fetchReviews]);

  // Automatically change the review every five seconds.
  useEffect(() => {
    if (reviews.length <= 1) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const goPrevious = () => {
    if (reviews.length <= 1) return;

    setActive(
      (current) => (current - 1 + reviews.length) % reviews.length
    );
  };

  const goNext = () => {
    if (reviews.length <= 1) return;

    setActive((current) => (current + 1) % reviews.length);
  };

  const retryFetch = () => {
    setLoading(true);
    setFetchError("");

    fetchReviews();
  };

  const currentReview = reviews[active];

  const tenantName =
    currentReview?.tenant?.name?.trim() || "RentNest Tenant";

  const propertyTitle =
    currentReview?.property?.title || "Rental Property";

  const comment =
    currentReview?.comment?.trim() || "No comment available.";

  const parsedRating = Number(currentReview?.rating ?? 0);

  const rating = Number.isFinite(parsedRating)
    ? Math.min(5, Math.max(0, parsedRating))
    : 0;

  const imageKey = currentReview?._id || `review-${active}`;

  const rawPhoto =
    typeof currentReview?.tenant?.photo === "string"
      ? currentReview.tenant.photo.trim()
      : "";

  const tenantPhoto =
    rawPhoto && !imageErrors[imageKey]
      ? rawPhoto
      : FALLBACK_IMAGE;

  const animation = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: "easeInOut" };

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={animation}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
            <Sparkles size={16} />
            Tenant Stories
          </span>

          <h2
            id="customer-reviews-heading"
            className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            What Our <span className="text-orange-500">Tenants</span> Say
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base lg:text-lg">
            Real experiences from people who found their next place
            through RentNest.
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div
            role="status"
            aria-label="Loading tenant reviews"
            className="mx-auto grid max-w-5xl animate-pulse overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-orange-100/30 md:grid-cols-2"
          >
            <div className="min-h-72 bg-orange-50" />
            <div className="space-y-5 p-8 sm:p-12">
              <div className="h-5 w-32 rounded-full bg-slate-200" />
              <div className="h-7 w-3/4 rounded-full bg-slate-200" />
              <div className="h-4 rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 rounded-full bg-slate-100" />
              <p className="pt-4 text-sm text-slate-400">
                Loading tenant experiences...
              </p>
            </div>
          </div>
        )}

        {/* Empty or error state */}
        {!loading && reviews.length === 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animation}
            className="mx-auto max-w-2xl rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/30 sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Quote size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
              {fetchError
                ? "Reviews are temporarily unavailable"
                : "Tenant stories are coming soon"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {fetchError ||
                "No reviews have been submitted yet. Tenant reviews will appear here when available."}
            </p>

            {fetchError && (
              <button
                type="button"
                onClick={retryFetch}
                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                Try Again
              </button>
            )}
          </motion.div>
        )}

        {/* Review slider */}
        {!loading && currentReview && (
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 z-10 w-1.5 bg-orange-500"
              />

              <div className="grid min-h-[390px] md:grid-cols-[0.82fr_1.18fr]">
                {/* Tenant profile */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-orange-50/70 p-7 sm:p-10">
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[30px] border-orange-100/70"
                  />

                  <div className="relative">
                    <Quote
                      size={42}
                      strokeWidth={1.5}
                      className="text-orange-300"
                    />

                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Tenant Review
                    </span>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={imageKey}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                      transition={animation}
                      className="relative mt-8"
                    >
                      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-orange-100 text-2xl font-black text-orange-600 shadow-lg shadow-orange-200/60">
                        <Image
                          src={tenantPhoto}
                          alt={`${tenantName} profile`}
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-cover"
                          onError={() => {
                            if (tenantPhoto !== FALLBACK_IMAGE) {
                              setImageErrors((previous) => ({
                                ...previous,
                                [imageKey]: true,
                              }));
                            }
                          }}
                        />
                      </div>

                      <h3 className="mt-5 break-words text-xl font-black text-slate-950 sm:text-2xl">
                        {tenantName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        RentNest Tenant
                      </p>

                      <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />
                        <span className="break-words font-medium">
                          {propertyTitle}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="relative mt-8 flex items-center gap-2 border-t border-orange-100 pt-5 text-xs font-medium text-slate-500">
                    <Star
                      size={15}
                      fill="currentColor"
                      className="text-orange-400"
                    />
                    Real feedback from RentNest users
                  </div>
                </div>

                {/* Review content */}
                <div className="flex min-w-0 flex-col justify-between p-7 sm:p-10 lg:p-12">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={imageKey}
                      initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                      transition={animation}
                    >
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={19}
                            fill={
                              index < Math.round(rating)
                                ? "currentColor"
                                : "none"
                            }
                            className={
                              index < Math.round(rating)
                                ? "text-orange-400"
                                : "text-slate-200"
                            }
                          />
                        ))}

                        <span className="ml-2 text-sm font-bold text-slate-600">
                          {rating.toFixed(1)}
                        </span>
                      </div>

                      <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                        Tenant Experience
                      </p>

                      <blockquote className="mt-4 break-words text-xl font-semibold leading-relaxed text-slate-800 sm:text-2xl lg:text-[27px]">
                        “{comment}”
                      </blockquote>

                      <div className="mt-8 h-px w-full bg-slate-100" />

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">
                          Shared with RentNest
                        </p>

                        <p className="shrink-0 text-sm font-bold tabular-nums text-orange-500">
                          {String(active + 1).padStart(2, "0")} /{" "}
                          {String(reviews.length).padStart(2, "0")}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Slider controls */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={goPrevious}
                      disabled={reviews.length <= 1}
                      aria-label="Previous review"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={reviews.length <= 1}
                      aria-label="Next review"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight size={18} />
                    </button>

                    <div className="ml-1 flex items-center gap-1.5">
                      {reviews.map((review, index) => (
                        <button
                          key={review._id || index}
                          type="button"
                          onClick={() => setActive(index)}
                          aria-label={`Show review ${index + 1}`}
                          aria-current={active === index ? "true" : undefined}
                          className="flex h-8 items-center justify-center rounded-full px-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                          <motion.span
                            animate={{
                              width: active === index ? 25 : 7,
                              opacity: active === index ? 1 : 0.35,
                            }}
                            transition={animation}
                            className="block h-1.5 rounded-full bg-orange-500"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <Star size={15} fill="currentColor" />
                </span>
                Genuine tenant feedback
              </span>

              <span className="hidden h-4 w-px bg-slate-200 sm:block" />

              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <Quote size={15} />
                </span>
                Experiences shared on RentNest
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}