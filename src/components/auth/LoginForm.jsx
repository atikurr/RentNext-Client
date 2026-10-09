"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Apple,
  Loader2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET CALLBACK URL
  // =====================================================

  const getCallbackUrl = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const callbackUrl = params.get("callbackUrl");

    // Only allow internal routes
    if (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//")
    ) {
      return callbackUrl;
    }

    return null;
  };

  // =====================================================
  // REDIRECT AFTER LOGIN
  // =====================================================

  const redirectAfterLogin = (role) => {
    const callbackUrl = getCallbackUrl();

    const normalizedRole = role?.toLowerCase();

    // ---------------------------------------------------
    // ADMIN
    // Admin always goes directly to admin dashboard
    // ---------------------------------------------------

    if (normalizedRole === "admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (callbackUrl) {
      router.replace(callbackUrl);
      return;
    }

    router.replace("/");
  };

  // =====================================================
  // EMAIL + PASSWORD LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------------
      // EMAIL LOGIN
      // ---------------------------------------------------

      const { data, error } =
        await authClient.signIn.email({
          email: email.trim(),
          password,
          disableRedirect: true,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Invalid email or password."
        );
      }

      if (!data) {
        throw new Error(
          "Login failed. Please try again."
        );
      }

      // ---------------------------------------------------
      // GET CURRENT SESSION
      // ---------------------------------------------------

      const sessionResult =
        await authClient.getSession();

      if (sessionResult?.error) {
        throw new Error(
          sessionResult.error.message ||
            "Unable to get your session."
        );
      }

      const user =
        sessionResult?.data?.user;

      if (!user) {
        throw new Error(
          "Login successful, but user session was not found."
        );
      }

      console.log("Logged in user:", user);

      console.log(
        "Logged in user role:",
        user.role
      );

      console.log(
        "Callback URL:",
        getCallbackUrl()
      );

      // ---------------------------------------------------
      // REDIRECT
      // ---------------------------------------------------

      redirectAfterLogin(user.role);

      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SOCIAL LOGIN
  // =====================================================

  const handleSocialLogin = async (provider) => {
    try {
      setError("");

      setSocialLoading(provider);

      // ---------------------------------------------------
      // PRESERVE CALLBACK URL
      // ---------------------------------------------------

      const callbackUrl = getCallbackUrl();

      /*
       * If user came from Property Details,
       * preserve that route.
       *
       * Otherwise normal social login goes Home.
       */

      const finalCallbackUrl =
        callbackUrl || "/";

      // ---------------------------------------------------
      // SOCIAL AUTH
      // ---------------------------------------------------

      const { data, error } =
        await authClient.signIn.social({
          provider,

          callbackURL:
            `http://localhost:3000${finalCallbackUrl}`,

          errorCallbackURL:
            "http://localhost:3000/login",

          newUserCallbackURL:
            `http://localhost:3000${finalCallbackUrl}`,

          disableRedirect: true,
        });

      if (error) {
        throw new Error(
          error.message ||
            `Unable to continue with ${provider}.`
        );
      }

      // ---------------------------------------------------
      // REDIRECT TO OAUTH PROVIDER
      // ---------------------------------------------------

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error(
        "OAuth redirect URL was not generated."
      );
    } catch (error) {
      console.error(
        `${provider} login error:`,
        error
      );

      setError(
        error?.message ||
          `Unable to continue with ${provider}.`
      );

      setSocialLoading("");
    }
  };

  return (
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
        duration: 0.5,
      }}
      className="w-full max-w-md"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="px-7 pb-6 pt-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
            <span className="text-xl font-bold">
              PR
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sign in to continue to Property Rental
          </p>
        </div>

        {/* =================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-7"
        >
          {/* ERROR */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD */}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-500 transition hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Signing in...
              </>
            ) : (
              <>
                Sign In

                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <div className="flex items-center gap-4 px-7 py-6">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs text-zinc-600">
            OR CONTINUE WITH
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* =================================================
            SOCIAL LOGIN
        ================================================== */}

        <div className="grid grid-cols-3 gap-3 px-7">

          {/* GOOGLE */}

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("google")
            }
            disabled={
              Boolean(socialLoading) ||
              loading
            }
            className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d0d0d] transition hover:border-white/20 hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Continue with Google"
          >
            {socialLoading === "google" ? (
              <Loader2
                size={18}
                className="animate-spin text-white"
              />
            ) : (
              <GoogleIcon />
            )}
          </button>

          {/* APPLE */}

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("apple")
            }
            disabled={
              Boolean(socialLoading) ||
              loading
            }
            className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d0d0d] text-white transition hover:border-white/20 hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Continue with Apple"
          >
            {socialLoading === "apple" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Apple size={20} />
            )}
          </button>

          {/* FACEBOOK */}

          <button
            type="button"
            onClick={() =>
              handleSocialLogin("facebook")
            }
            disabled={
              Boolean(socialLoading) ||
              loading
            }
            className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d0d0d] transition hover:border-white/20 hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Continue with Facebook"
          >
            {socialLoading === "facebook" ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <FacebookIcon />
            )}
          </button>
        </div>

        {/* =================================================
            REGISTER
        ================================================== */}

        <div className="px-7 pb-8 pt-6 text-center">
          <p className="text-sm text-zinc-500">
            Don&apos;t have an account?{" "}

            <Link
              href="/register"
              className="font-medium text-white transition hover:text-zinc-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// GOOGLE ICON
// =====================================================

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.23c0-.79-.065-1.55-.19-2.28H12v4.315h5.495a4.7 4.7 0 0 1-2.04 3.085v2.565h3.3c1.93-1.775 3.05-4.39 3.05-7.685Z"
        fill="#4285F4"
      />

      <path
        d="M12 22c2.76 0 5.075-.915 6.765-2.485l-3.3-2.565c-.915.615-2.08.98-3.465.98-2.665 0-4.92-1.8-5.73-4.215H2.86v2.645A10.22 10.22 0 0 0 12 22Z"
        fill="#34A853"
      />

      <path
        d="M6.27 13.715A6.14 6.14 0 0 1 5.95 12c0-.595.105-1.175.32-1.715V7.64H2.86A10.22 10.22 0 0 0 1.78 12c0 1.57.375 3.055 1.08 4.36l3.41-2.645Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.07c1.5 0 2.85.515 3.91 1.525l2.93-2.93C17.07 2.99 14.755 2 12 2A10.22 10.22 0 0 0 2.86 7.64l3.41 2.645 3.41 2.645Z"
        fill="#EA4335"
      />
    </svg>
  );
}

// =====================================================
// FACEBOOK ICON
// =====================================================

function FacebookIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.926-1.956 1.876V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12Z"
        fill="#1877F2"
      />
    </svg>
  );
}