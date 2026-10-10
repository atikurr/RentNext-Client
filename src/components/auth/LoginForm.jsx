
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
  MonitorSmartphone,
  Check,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const socialHandled = useRef(false);
  const mounted = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");

  // Initial loading state is determined before rendering.
  // This avoids calling setState synchronously in useEffect.
  const [checkingSocialLogin, setCheckingSocialLogin] = useState(() => {
    if (typeof window === "undefined") return false;

    const params = new URLSearchParams(window.location.search);
    return (
      params.get("social") === "success" ||
      params.get("social") === "error"
    );
  });

  const getCallbackUrl = useCallback(() => {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl");

    if (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//")
    ) {
      return callbackUrl;
    }

    return null;
  }, []);

  // Role-based navigation.
  const redirectAfterLogin = useCallback(
    (role) => {
      const callbackUrl =
        sessionStorage.getItem("loginCallbackUrl") ||
        getCallbackUrl();

      sessionStorage.removeItem("loginCallbackUrl");

      const normalizedRole = String(role || "").toLowerCase();

      let destination = "/";

      if (normalizedRole === "admin") {
        destination = "/dashboard/admin";
      } else if (normalizedRole === "owner") {
        destination = "/dashboard/owner";
      } else if (callbackUrl) {
        destination = callbackUrl;
      }

      router.replace(destination);
      router.refresh();
    },
    [getCallbackUrl, router]
  );

  // Verify that the session exists before redirecting.
  const getAuthenticatedUser = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await authClient.getSession();

      if (result.error) {
        throw new Error(
          result.error.message || "Unable to retrieve your session."
        );
      }

      if (result.data?.user) {
        return result.data.user;
      }

      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    throw new Error(
      "Your session could not be verified. Please try signing in again."
    );
  };

  // Complete the social login on the Login page.
  useEffect(() => {
    mounted.current = true;

    let cancelled = false;

    const params = new URLSearchParams(window.location.search);
    const socialStatus = params.get("social");

    const removeSocialParams = () => {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("social");

      window.history.replaceState(
        window.history.state,
        "",
        `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
      );
    };

    if (socialStatus !== "success" && socialStatus !== "error") {
      return () => {
        cancelled = true;
        mounted.current = false;
      };
    }

    if (socialStatus === "error") {
      removeSocialParams();

      toast.error("Social login was unsuccessful. Please try again.");

      // Defer the state update so it does not run synchronously
      // inside the effect body.
      const timer = setTimeout(() => {
        if (!cancelled) {
          setCheckingSocialLogin(false);
        }
      }, 0);

      return () => {
        cancelled = true;
        mounted.current = false;
        clearTimeout(timer);
      };
    }

    if (socialHandled.current) {
      return () => {
        cancelled = true;
        mounted.current = false;
      };
    }

    socialHandled.current = true;

    const completeSocialLogin = async () => {
      try {
        const user = await getAuthenticatedUser();

        if (cancelled || !mounted.current) return;

        removeSocialParams();

        toast.success("Login successful!");
        redirectAfterLogin(user.role);
      } catch (err) {
        console.error("Social login verification error:", err);

        if (cancelled || !mounted.current) return;

        removeSocialParams();

        const message =
          err instanceof Error
            ? err.message
            : "Unable to complete social login.";

        setError(message);
        toast.error(message);

        socialHandled.current = false;
        setCheckingSocialLogin(false);
      }
    };

    completeSocialLogin();

    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [redirectAfterLogin]);

  // Email and password login.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      const message = "Please enter your email and password.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      const { data, error: signInError } =
        await authClient.signIn.email({
          email: email.trim(),
          password,
          disableRedirect: true,
        });

      if (signInError) {
        throw new Error(
          signInError.message || "Invalid email or password."
        );
      }

      if (!data) {
        throw new Error("Login failed. Please try again.");
      }

      const user = await getAuthenticatedUser();

      toast.success("Login successful!");
      redirectAfterLogin(user.role);
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Google and Facebook login.
  const handleSocialLogin = async (provider) => {
    try {
      setError("");
      setSocialLoading(provider);

      const callbackUrl = getCallbackUrl();

      if (callbackUrl) {
        sessionStorage.setItem("loginCallbackUrl", callbackUrl);
      } else {
        sessionStorage.removeItem("loginCallbackUrl");
      }

      const frontendURL = window.location.origin;

      const { data, error: socialError } =
        await authClient.signIn.social({
          provider,
          callbackURL: `${frontendURL}/login?social=success`,
          errorCallbackURL: `${frontendURL}/login?social=error`,
        });

      if (socialError) {
        throw new Error(
          socialError.message ||
            `Unable to continue with ${provider}.`
        );
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      // If the SDK did not provide a URL, it may have initiated
      // a redirect itself. Do not report success without evidence.
      if (!data) {
        throw new Error("OAuth redirect URL was not generated.");
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);

      const message =
        err instanceof Error
          ? err.message
          : `Unable to continue with ${provider}.`;

      setError(message);
      toast.error(message);
      setSocialLoading("");
    }
  };

  // OAuth return loading screen.
  if (checkingSocialLogin) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          theme="light"
        />

        <main className="flex min-h-screen items-center justify-center bg-[#f3f0ed] px-5">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#ff6b00]">
              <Loader2 size={34} className="animate-spin" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Signing you in...
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Please wait while we verify your account.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <main className="min-h-screen bg-[#f3f0ed] p-3 sm:p-5 lg:p-7">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid min-h-[calc(100vh-56px)] max-w-[1450px] overflow-hidden rounded-[26px] bg-white shadow-[0_20px_80px_rgba(20,20,20,0.08)] lg:grid-cols-[0.95fr_1.05fr]"
        >
          {/* LEFT: LOGIN FORM */}
          <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-[470px]">
              <div className="mb-10 flex items-center justify-between gap-3">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src="/assets/logo.png"
                    alt="Rent Next"
                    width={190}
                    height={48}
                    priority
                    className="h-12 w-auto max-w-[190px] object-contain object-left"
                  />
                </Link>

                <p className="text-xs text-gray-500 sm:text-sm">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#ff6b00] transition hover:text-[#e85d00]"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              <div className="mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b00]">
                  Welcome to Rent Next
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#171717] sm:text-4xl">
                  Welcome <span className="text-[#ff6b00]">Back</span>
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                  Sign in to continue to your account.
                </p>
              </div>

              {/* SOCIAL LOGIN */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={Boolean(socialLoading) || loading}
                  className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition hover:border-[#ff6b00]/50 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {socialLoading === "google" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={Boolean(socialLoading) || loading}
                  className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition hover:border-[#ff6b00]/50 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {socialLoading === "facebook" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FacebookIcon />
                  )}
                  Continue with Facebook
                </button>
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">
                  OR CONTINUE WITH EMAIL
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              {/* EMAIL + PASSWORD */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#252525]"
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#ff6b00]"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading || Boolean(socialLoading)}
                      required
                      className="h-[52px] w-full rounded-xl border border-gray-200 bg-[#f7f7f7] pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#252525]"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#ff6b00]"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading || Boolean(socialLoading)}
                      required
                      className="h-[52px] w-full rounded-xl border border-gray-200 bg-[#f7f7f7] pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#ff6b00]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#ff6b00] transition hover:text-[#e85d00]"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || Boolean(socialLoading)}
                  className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#e85d00] hover:shadow-xl hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30">
                        <ArrowRight size={18} />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* BENEFITS */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
                <Benefit
                  icon={<ShieldCheck size={19} />}
                  title="Secure Login"
                  subtitle="Your data is safe"
                />

                <Benefit
                  icon={<Zap size={19} />}
                  title="Fast & Easy"
                  subtitle="Quick access"
                />

                <Benefit
                  icon={<MonitorSmartphone size={19} />}
                  title="Any Device"
                  subtitle="Login anywhere"
                />
              </div>

              <p className="mt-7 text-center text-sm text-gray-500 lg:hidden">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#ff6b00]"
                >
                  Create account
                </Link>
              </p>
            </div>
          </section>

          {/* RIGHT: PROPERTY IMAGE */}
          <section className="relative hidden min-h-[650px] p-4 lg:block">
            <div className="relative h-full min-h-[650px] overflow-hidden rounded-[22px] bg-[#171717]">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85"
                alt="Modern luxury home at sunset"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65" />

              <div className="absolute inset-x-0 top-0 p-8 xl:p-11">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#ff6b00]" />
                  Premium Properties
                </div>

                <h2 className="mt-7 max-w-lg text-4xl font-extrabold leading-[1.13] tracking-tight text-white xl:text-5xl">
                  Find Your
                  <br />
                  Perfect <span className="text-[#ff7a1a]">Home.</span>
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/80 xl:text-base">
                  Discover properties that match your lifestyle.
                  Buy, sell, or rent with confidence.
                </p>

                <div className="mt-6 space-y-3">
                  <Feature text="Verified Property Listings" />
                  <Feature text="Trusted Property Owners" />
                  <Feature text="A Better Way to Find Home" />
                </div>
              </div>

              <div className="absolute bottom-7 left-6 right-6 rounded-2xl border border-white/20 bg-black/35 p-5 text-white shadow-2xl backdrop-blur-xl xl:bottom-9 xl:left-9 xl:right-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6b00] text-white">
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Find Your Next Home
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      Your next chapter starts here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </>
  );
}

function Benefit({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-2 sm:text-left">
      <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff6b00] sm:mb-0">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-800 sm:text-xs">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-gray-400 sm:text-[11px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/90">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6b00] text-white">
        <Check size={13} strokeWidth={3} />
      </span>
      {text}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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

function FacebookIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.926-1.956 1.876V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.627 24 12Z"
        fill="#1877F2"
      />
    </svg>
  );
}
