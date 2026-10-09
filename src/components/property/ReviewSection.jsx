"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const user = session?.user || null;
  const isTenant = user?.role?.toLowerCase() === "tenant";

  // Fetch review data without updating React state.
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
      throw new Error(
        data?.message || "Failed to load reviews."
      );
    }

    return {
      reviews: data?.reviews || [],
      averageRating: Number(data?.averageRating || 0),
      totalReviews: Number(data?.totalReviews || 0),
    };
  }, [propertyId]);

  // Initial loading: update state only after the request finishes.
  useEffect(() => {
    let cancelled = false;

    const loadInitialReviews = async () => {
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

    loadInitialReviews();

    return () => {
      cancelled = true;
    };
  }, [fetchReviews]);

  // Refresh reviews after submit or delete.
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

  // Get authentication token.
  const getToken = async () => {
    const result = await authClient.token();

    return (
      result?.data?.token ||
      result?.token ||
      ""
    );
  };

  // Submit a review.
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
      toast.error("Please select a rating.");
      return;
    }

    if (comment.trim().length < 3) {
      toast.error("Review must contain at least 3 characters.");
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
        throw new Error(
          data?.message || "Failed to submit review."
        );
      }

      toast.success("Review submitted successfully!");

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

  // Delete the current tenant's review.
  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;

    try {
      setDeletingId(reviewId);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete review."
        );
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

  const getInitial = (name) =>
    name?.charAt(0)?.toUpperCase() || "U";

  const renderStars = (value, size = "h-4 w-4") =>
    [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= value
            ? "fill-orange-400 text-orange-400"
            : "text-slate-300"
        }`}
      />
    ));

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />

              <h2 className="text-2xl font-bold text-slate-950">
                Reviews & Ratings
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {propertyTitle
                ? `See what tenants say about ${propertyTitle}.`
                : "See what tenants say about this property."}
            </p>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-4 rounded-2xl bg-orange-50 px-5 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-950">
                {averageRating.toFixed(1)}
              </p>

              <div className="mt-1 flex justify-center">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>

            <div className="h-10 w-px bg-orange-200" />

            <div>
              <p className="text-sm font-bold text-slate-900">
                {totalReviews}
              </p>

              <p className="text-xs text-slate-500">
                {totalReviews === 1 ? "Review" : "Reviews"}
              </p>
            </div>
          </div>
        </div>

        {/* Review form */}
        {user && isTenant && (
          <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/50 p-5 sm:p-6">
            <h3 className="text-lg font-bold text-slate-950">
              Write a Review
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Share your experience with this property.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Your Rating
              </label>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} stars`}
                    className="rounded-md p-1 transition hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (hoverRating || rating)
                          ? "fill-orange-400 text-orange-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}

                {rating > 0 && (
                  <span className="ml-2 text-sm font-semibold text-slate-600">
                    {rating}/5
                  </span>
                )}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="reviewComment"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewComment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Write your experience about this property..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {comment.length}/1000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-600">
              Please login as a tenant to write a review.
            </p>
          </div>
        )}

        {/* Reviews list */}
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">
              Tenant Reviews
            </h3>

            <span className="text-sm text-slate-500">
              {totalReviews}{" "}
              {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                No reviews yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Be the first tenant to review this property.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {review?.tenant?.photo ? (
                        <Image
                          src={review.tenant.photo}
                          alt={review.tenant.name || "Tenant"}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {getInitial(review?.tenant?.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {review?.tenant?.name || "Tenant"}
                        </h4>

                        <p className="truncate text-xs text-slate-500">
                          {review?.tenant?.email || ""}
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
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
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
                    <div className="flex items-center">
                      {renderStars(Number(review.rating))}
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}