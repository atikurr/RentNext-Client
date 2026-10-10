"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Send,
  Star,
  Trash2,
  Sparkles,
  ShieldCheck,
  PenLine,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const MAX_COMMENT_LENGTH = 1000;

export default function ReviewSection({
  propertyId,
  propertyTitle,
  session,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const reduceMotion = useReducedMotion();

  const user = session?.user || null;
  const isTenant = user?.role?.toLowerCase() === "tenant";
  const displayedRating = hoverRating || rating;

  const animationDuration = reduceMotion ? 0 : 0.3;

  const fetchReviews = useCallback(async () => {
    if (!propertyId) {
      return {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
      };
    }

    const response = await fetch(
      `${API_URL}/api/reviews/property/${propertyId}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to load reviews.");
    }

    return {
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
      averageRating: Number(data?.averageRating || 0),
      totalReviews: Number(data?.totalReviews || 0),
    };
  }, [propertyId]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const data = await fetchReviews();

        if (cancelled) return;

        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      } catch (error) {
        if (!cancelled) {
          console.error("Review loading error:", error);
          toast.error(error.message || "Failed to load reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [fetchReviews]);

  const refreshReviews = async () => {
    try {
      const data = await fetchReviews();

      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error("Review refresh error:", error);
      toast.error(error.message || "Failed to refresh reviews.");
    }
  };

  const getToken = async () => {
    const result = await authClient.token();

    return result?.data?.token || result?.token || "";
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please login to submit a review.");
      return;
    }

    if (!isTenant) {
      toast.error("Only tenants can submit reviews.");
      return;
    }

    if (!rating) {
      toast.error("Please select your star rating.");
      return;
    }

    if (comment.trim().length < 3) {
      toast.error("Your review must contain at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit review.");
      }

      toast.success("Your review was submitted successfully!");

      setRating(0);
      setHoverRating(0);
      setComment("");

      await refreshReviews();
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;

    try {
      setDeletingId(reviewId);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete review.");
      }

      toast.success("Review deleted successfully.");

      await refreshReviews();
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error(error.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const isOwnReview = (review) =>
    Boolean(
      user?.id &&
        review?.tenant?.id &&
        String(user.id) === String(review.tenant.id)
    );

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  const renderStars = (value, size = "h-4 w-4") =>
    [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= value
            ? "fill-orange-400 text-orange-400"
            : "text-slate-200"
        }`}
      />
    ));

  const getRatingLabel = (value) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very good",
      5: "Excellent",
    };

    return labels[value] || "Select your rating";
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {/* Reviews header */}
        <div className="border-b border-slate-100 px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                <Sparkles size={14} />
                Community feedback
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Reviews &{" "}
                <span className="text-orange-500">Ratings</span>
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {propertyTitle
                  ? `Discover what tenants think about ${propertyTitle}.`
                  : "Discover what tenants think about this property."}
              </p>
            </div>

            <div className="flex items-center gap-4 self-start rounded-2xl border border-orange-100 bg-orange-50/70 px-5 py-4 sm:self-auto">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white shadow-sm">
                <span className="text-2xl font-black leading-none text-slate-950">
                  {averageRating.toFixed(1)}
                </span>

                <div className="mt-1 flex">
                  {renderStars(Math.round(averageRating), "h-2.5 w-2.5")}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  {totalReviews}{" "}
                  {totalReviews === 1 ? "Review" : "Reviews"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Overall rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Improved review submission form */}
        {user && isTenant && (
          <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-7 lg:p-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationDuration }}
              className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.05)]"
            >
              {/* Form heading */}
              <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-6 text-white sm:px-8 sm:py-7">
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-16 h-44 w-44 rounded-full border-[24px] border-white/10"
                />

                <div
                  aria-hidden="true"
                  className="absolute -bottom-14 right-24 h-28 w-28 rounded-full bg-white/10"
                />

                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                    <PenLine size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-50">
                      Your experience matters
                    </p>

                    <h3 className="mt-1 text-xl font-black sm:text-2xl">
                      Write a Review
                    </h3>

                    <p className="mt-1 text-sm text-orange-50">
                      Help others find a place they will love.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="p-5 sm:p-8">
                {/* Tenant identity */}
                <div className="flex items-center gap-3">
                  {user.image || user.photo ? (
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50">
                      <Image
                        src={user.image || user.photo}
                        alt={user.name || "Your profile"}
                        fill
                        unoptimized
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base font-black text-orange-600">
                      {getInitial(user.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name || "RentNest Tenant"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Sharing as a tenant
                    </p>
                  </div>

                  <div className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
                    <ShieldCheck size={14} />
                    Tenant account
                  </div>
                </div>

                {/* Star rating */}
                <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        How was your experience?
                      </label>

                      <p className="mt-1 text-xs text-slate-500">
                        Select a star rating from 1 to 5.
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayedRating}
                        initial={
                          reduceMotion ? false : { opacity: 0, y: 5 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduceMotion ? undefined : { opacity: 0, y: -5 }
                        }
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                          displayedRating
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {getRatingLabel(displayedRating)}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <div
                    className="mt-4 flex items-center gap-1 sm:gap-2"
                    role="group"
                    aria-label="Select your rating"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onFocus={() => setHoverRating(star)}
                        onBlur={() => setHoverRating(0)}
                        aria-label={`Rate ${star} out of 5 stars`}
                        aria-pressed={rating === star}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors focus:outline-none focus:ring-4 focus:ring-orange-100 sm:h-14 sm:w-14 ${
                          star <= displayedRating
                            ? "border-orange-200 bg-orange-50"
                            : "border-slate-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        <Star
                          className={`h-6 w-6 transition-colors sm:h-7 sm:w-7 ${
                            star <= displayedRating
                              ? "fill-orange-400 text-orange-400"
                              : "text-slate-300"
                          }`}
                        />
                      </motion.button>
                    ))}

                    {rating > 0 && (
                      <span className="ml-2 text-sm font-bold text-slate-600">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Review textarea */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="reviewComment"
                      className="text-sm font-bold text-slate-900"
                    >
                      Tell us about your experience
                    </label>

                    <span className="text-xs text-slate-400">
                      Required
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      id="reviewComment"
                      name="comment"
                      value={comment}
                      onChange={(event) =>
                        setComment(
                          event.target.value.slice(0, MAX_COMMENT_LENGTH)
                        )
                      }
                      rows={5}
                      maxLength={MAX_COMMENT_LENGTH}
                      required
                      minLength={3}
                      placeholder="What did you like about this property? Tell other tenants about the location, comfort, facilities, or your overall experience..."
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />

                    <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-400">
                      {comment.length}/{MAX_COMMENT_LENGTH}
                    </div>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Please keep your review honest, helpful, and respectful.
                  </p>
                </div>

                {/* Submit actions */}
                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                    <ShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    Your feedback helps other tenants make informed decisions.
                  </p>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={
                      reduceMotion || submitting ? undefined : { y: -2 }
                    }
                    whileTap={
                      reduceMotion || submitting ? undefined : { scale: 0.98 }
                    }
                    className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200/70 transition-colors hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting review...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Login notice */}
        {!user && (
          <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-5 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                <MessageSquare size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Have an experience to share?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Please log in with your tenant account to write a review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                Community feedback
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                Tenant Reviews
              </h3>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 py-14">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="ml-3 text-sm text-slate-500">
                Loading reviews...
              </span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
                <MessageSquare size={25} />
              </div>

              <h4 className="mt-4 text-lg font-bold text-slate-900">
                No reviews yet
              </h4>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Be the first tenant to share an experience with this property.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <motion.article
                  key={review._id || index}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 12 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: animationDuration,
                    delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2),
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-orange-200 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {review?.tenant?.photo ? (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-orange-50">
                          <Image
                            src={review.tenant.photo}
                            alt={review.tenant.name || "Tenant"}
                            width={44}
                            height={44}
                            unoptimized
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {getInitial(review?.tenant?.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {review?.tenant?.name || "Tenant"}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(review?.createdAt)}
                        </p>
                      </div>
                    </div>

                    {isOwnReview(review) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingId === review._id}
                        aria-label="Delete your review"
                        title="Delete review"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === review._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {renderStars(Number(review.rating))}
                    </div>

                    <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
                      {Number(review.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                    {review.comment}
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                    <ThumbsUp size={14} className="text-orange-400" />
                    Shared with the RentNest community
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}