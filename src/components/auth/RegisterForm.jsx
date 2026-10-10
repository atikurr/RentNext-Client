
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Camera,
  ArrowRight,
  Apple,
  Loader2,
  X,
  Home,
  Building2,
  CheckCircle2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const ORANGE = "#ff6b00";

function SocialButton({
  provider,
  label,
  icon,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
      className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 transition duration-200 hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
    </button>
  );
}

function Field({
  label,
  id,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-zinc-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          strokeWidth={1.8}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        {children}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [role, setRole] = useState("tenant");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // IMAGE UPLOAD
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
    setImageUrl("");
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Image upload failed (${response.status}).`
        );
      }

      if (
        typeof data.imageUrl !== "string" ||
        !data.imageUrl.trim()
      ) {
        throw new Error(
          "Image uploaded, but the server did not return imageUrl."
        );
      }

      setImageUrl(data.imageUrl);
    } catch (uploadError) {
      console.error("Profile image upload error:", uploadError);

      URL.revokeObjectURL(previewUrl);
      setImagePreview("");
      setImageUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload profile image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // REMOVE IMAGE
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SOCIAL LOGIN
  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);

    try {
      const { error: socialError } =
        await authClient.signIn.social({
          provider,
          callbackURL: "/",
        });

      if (socialError) {
        throw new Error(
          socialError.message || "Social login failed."
        );
      }
    } catch (socialError) {
      console.error("Social login error:", socialError);

      setError(
        socialError instanceof Error
          ? socialError.message
          : "Social login is not configured yet."
      );

      setLoading(false);
    }
  };

  // REGISTER
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (uploadingImage) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData
      .get("confirmPassword")
      ?.toString();

    if (!name || name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!["tenant", "owner"].includes(role)) {
      setError("Please select an account type.");
      return;
    }

    setLoading(true);

    try {
      const { error: registerError } =
        await authClient.signUp.email({
          name,
          email,
          password,
          photo: imageUrl || "",
          role,
          callbackURL: "/login",
        });

      if (registerError) {
        throw new Error(
          registerError.message ||
            "Unable to create your account."
        );
      }

      setSuccess(
        "Account created successfully. Please log in."
      );

      router.replace("/login");
    } catch (registerError) {
      console.error("Registration error:", registerError);

      setError(
        registerError instanceof Error
          ? registerError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[#f7f5f2] px-4 py-6 text-zinc-900 sm:px-6 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] lg:grid-cols-[1fr_0.8fr]"
        >
          {/* FORM PANEL */}
          <section className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
            {/* LOGO */}
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-3 sm:justify-start"
              aria-label="Rent Next home"
            >
              <Image
                src="/assets/logo.png"
                alt="Rent Next"
                width={48}
                height={48}
                priority
                className="h-11 w-11 object-contain"
              />

              <span className="text-2xl font-extrabold tracking-tight text-zinc-900">
                Rent <span style={{ color: ORANGE }}>Next</span>
                <span style={{ color: ORANGE }}>.</span>
              </span>
            </Link>

            {/* HEADING */}
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                YOUR NEXT CHAPTER STARTS HERE
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Create your{" "}
                <span style={{ color: ORANGE }}>account.</span>
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Find your place or list your property with Rent Next.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* SUCCESS */}
            {success && (
              <div
                role="status"
                className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                {success}
              </div>
            )}

            {/* PROFILE PHOTO */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
              <div className="relative shrink-0">
                <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-orange-100 shadow-sm">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      width={68}
                      height={68}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      size={28}
                      strokeWidth={1.6}
                      className="text-orange-600"
                    />
                  )}
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading || uploadingImage}
                    aria-label="Remove profile image"
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploadingImage}
                  aria-label="Upload profile image"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow-sm transition hover:brightness-95 disabled:opacity-50"
                  style={{ backgroundColor: ORANGE }}
                >
                  {uploadingImage ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Camera size={13} />
                  )}
                </button>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-800">
                  Profile photo
                  <span className="ml-2 text-xs font-normal text-zinc-400">
                    Optional
                  </span>
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Add a photo to personalize your account.
                  Maximum file size: 5MB.
                </p>

                {uploadingImage && (
                  <p className="mt-1 text-xs font-medium text-orange-600">
                    Uploading image...
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* ACCOUNT TYPE */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-zinc-700">
                I want to join as
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  disabled={loading}
                  aria-pressed={role === "tenant"}
                  className={`rounded-2xl border p-3.5 text-left transition duration-200 ${
                    role === "tenant"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/10"
                      : "border-zinc-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        role === "tenant"
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Home size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold">Tenant</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        Find a home
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  disabled={loading}
                  aria-pressed={role === "owner"}
                  className={`rounded-2xl border p-3.5 text-left transition duration-200 ${
                    role === "owner"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/10"
                      : "border-zinc-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        role === "owner"
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Building2 size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold">Owner</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        List a property
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* SOCIAL LOGIN */}
            <div className="grid grid-cols-3 gap-3">
              <SocialButton
                provider="google"
                label="Google"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.92-4.2 2.92-7.41z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.54 13.69A5.86 5.86 0 0 1 6.23 12c0-.59.1-1.16.31-1.69V7.79H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.21l3.24-2.52z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.28c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03z"
                    />
                  </svg>
                }
              />

              <SocialButton
                provider="apple"
                label="Apple"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={<Apple size={20} />}
              />

              <SocialButton
                provider="facebook"
                label="Facebook"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#1877F2"
                      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.43H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.5h-3.33V24C19.61 23.09 24 18.09 24 12.07z"
                    />
                  </svg>
                }
              />
            </div>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.14em] text-zinc-400">
                OR REGISTER WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            {/* REGISTRATION FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" id="name" icon={User}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  minLength={2}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </Field>

              <Field label="Email Address" id="email" icon={Mail}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </Field>

              <Field label="Password" id="password" icon={LockKeyhole}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-orange-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </Field>

              <Field
                label="Confirm Password"
                id="confirmPassword"
                icon={LockKeyhole}
              >
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-orange-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </Field>

              {/* SELECTED ROLE */}
              <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    Selected account type
                  </p>
                  <p className="mt-0.5 text-sm font-bold capitalize text-zinc-800">
                    {role}
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  {role === "owner" ? (
                    <Building2 size={17} />
                  ) : (
                    <Home size={17} />
                  )}
                </span>
              </div>

              {/* ORANGE PRIMARY BUTTON */}
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:bg-[#ed6000] hover:shadow-orange-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-orange-600 transition hover:text-orange-700"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-5 text-center text-[11px] leading-5 text-zinc-400">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-orange-600"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-orange-600"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* RIGHT DESIGN PANEL */}
          <aside className="relative hidden min-h-full overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-zinc-950 to-zinc-950" />

            <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-orange-600/15 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold tracking-[0.22em] text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                RENT NEXT · PROPERTY PLATFORM
              </div>

              <h2 className="mt-10 max-w-md text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                Your next home
                <br />
                starts <span className="text-orange-500">here.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-300">
                Discover spaces that fit your lifestyle. Find a home
                you love or share your property with the right people.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-4">
              {[
                {
                  title: "Find your place",
                  description: "Explore homes that feel right for you.",
                  icon: Home,
                },
                {
                  title: "Manage your property",
                  description: "Bring your rental journey into one place.",
                  icon: Building2,
                },
                {
                  title: "A simpler experience",
                  description: "Get started with your own account.",
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 mt-10 border-t border-white/10 pt-5 text-xs text-zinc-500">
              Find. Rent. Live better.
            </div>
          </aside>
        </motion.div>
      </div>
    </main>
  );
}
