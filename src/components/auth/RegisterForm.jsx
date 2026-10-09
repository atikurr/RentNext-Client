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
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

/* =========================================================
   SOCIAL BUTTON
========================================================= */

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
      className="
        flex h-11 w-full items-center justify-center
        rounded-xl border border-[#292929]
        bg-[#0b0b0b]
        text-white
        transition-all duration-200
        hover:border-[#444]
        hover:bg-[#111]
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
      aria-label={`Continue with ${label}`}
    >
      {icon}
    </button>
  );
}

/* =========================================================
   REGISTER FORM
========================================================= */

export default function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [role, setRole] = useState("tenant");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/upload/profile",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      setImageUrl(data.imageUrl);
    } catch (uploadError) {
      console.error(
        "Profile image upload error:",
        uploadError
      );

      setImagePreview("");
      setImageUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        uploadError.message ||
          "Failed to upload profile image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const removeImage = () => {
    setImagePreview("");
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     SOCIAL LOGIN
  ======================================================= */

  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);

    try {
      const { data, error } =
        await authClient.signIn.social({
          provider,
          callbackURL: "/dashboard/tenant",
          disableRedirect: true,
        });

      if (error) {
        console.error(
          `${provider} login error:`,
          error
        );

        setError(
          error.message ||
            `${provider} login failed.`
        );

        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (socialError) {
      console.error(
        `${provider} login error:`,
        socialError
      );

      setError(
        socialError.message ||
          `${provider} login is not configured yet.`
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     REGISTER
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const formData = new FormData(
      event.currentTarget
    );

    const name = formData
      .get("name")
      ?.toString()
      .trim();

    const email = formData
      .get("email")
      ?.toString()
      .trim();

    const password = formData
      .get("password")
      ?.toString();

    const confirmPassword = formData
      .get("confirmPassword")
      ?.toString();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name || name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
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

    if (uploadingImage) {
      setError(
        "Please wait until your profile image finishes uploading."
      );
      return;
    }

    setLoading(true);

    try {
      /* ===================================================
         BETTER AUTH SIGN UP
      =================================================== */

      const { data, error } =
        await authClient.signUp.email({
          name,
          email,
          password,
          photo: imageUrl || "",
          role,
          callbackURL:
            role === "owner"
              ? "/dashboard/owner"
              : "/dashboard/tenant",
        });

      if (error) {
        console.error(
          "Better Auth registration error:",
          error
        );

        setError(
          error.message ||
            "Unable to create your account."
        );

        return;
      }

      console.log(
        "Registration successful:",
        data
      );

      /* ===================================================
         ROLE BASED NAVIGATION
      =================================================== */

      if (role === "owner") {
        router.push("/dashboard/owner");
      } else {
        router.push("/dashboard/tenant");
      }
    } catch (registerError) {
      console.error(
        "Registration error:",
        registerError
      );

      setError(
        registerError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-10 sm:px-6">
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
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
            duration: 0.4,
          }}
          className="w-full max-w-[560px]"
        >
          {/* =================================================
              CARD
          ================================================= */}

          <div
            className="
              rounded-2xl
              border border-[#292929]
              bg-[#151515]
              px-6 py-7
              shadow-2xl shadow-black/40
              sm:px-8 sm:py-8
            "
          >
            {/* =================================================
                LOGO
            ================================================= */}

            <div className="flex justify-center">
              <div
                className="
                  flex h-14 w-14
                  items-center justify-center
                  rounded-2xl
                  bg-white
                  text-xl font-bold
                  tracking-tight
                  text-black
                "
              >
                PR
              </div>
            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mt-5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Create Your Account
              </h1>

              <p className="mt-2 text-sm text-[#737373]">
                Join our property rental platform
              </p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

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
                className="
                  mt-5
                  rounded-xl
                  border border-red-900/50
                  bg-red-950/30
                  px-4 py-3
                  text-sm
                  text-red-400
                "
              >
                {error}
              </motion.div>
            )}

            {/* =================================================
                PROFILE IMAGE
            ================================================= */}

            <div className="mt-6 flex flex-col items-center">
              <div className="relative">
                <div
                  className="
                    flex h-20 w-20
                    items-center justify-center
                    overflow-hidden
                    rounded-full
                    border border-[#292929]
                    bg-[#0b0b0b]
                  "
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile image preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      size={30}
                      strokeWidth={1.5}
                      className="text-[#555]"
                    />
                  )}
                </div>

                {/* REMOVE */}

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    aria-label="Remove profile image"
                    className="
                      absolute -right-1 -top-1
                      flex h-6 w-6
                      items-center justify-center
                      rounded-full
                      bg-red-500
                      text-white
                      transition
                      hover:bg-red-600
                    "
                  >
                    <X size={13} />
                  </button>
                )}

                {/* CAMERA */}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    uploadingImage || loading
                  }
                  aria-label="Upload profile image"
                  className="
                    absolute bottom-0 right-0
                    flex h-7 w-7
                    items-center justify-center
                    rounded-full
                    bg-white
                    text-black
                    shadow-lg
                    transition
                    hover:bg-slate-200
                    disabled:opacity-50
                  "
                >
                  {uploadingImage ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <Camera size={13} />
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="mt-2 text-[11px] text-[#666]">
                Profile photo is optional · Max 5MB
              </p>
            </div>

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-[#999]">
                Account Type
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* TENANT */}

                <button
                  type="button"
                  onClick={() =>
                    setRole("tenant")
                  }
                  disabled={loading}
                  aria-pressed={
                    role === "tenant"
                  }
                  className={`
                    rounded-xl
                    border
                    px-3 py-3
                    text-left
                    transition-all
                    ${
                      role === "tenant"
                        ? "border-white bg-white text-black"
                        : "border-[#292929] bg-[#0b0b0b] text-[#aaa] hover:border-[#444]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Home
                      size={18}
                      className={
                        role === "tenant"
                          ? "text-black"
                          : "text-[#777]"
                      }
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        Tenant
                      </p>

                      <p
                        className={`
                          mt-0.5 text-[10px]
                          ${
                            role === "tenant"
                              ? "text-black/60"
                              : "text-[#666]"
                          }
                        `}
                      >
                        Find & book
                      </p>
                    </div>
                  </div>
                </button>

                {/* OWNER */}

                <button
                  type="button"
                  onClick={() =>
                    setRole("owner")
                  }
                  disabled={loading}
                  aria-pressed={
                    role === "owner"
                  }
                  className={`
                    rounded-xl
                    border
                    px-3 py-3
                    text-left
                    transition-all
                    ${
                      role === "owner"
                        ? "border-white bg-white text-black"
                        : "border-[#292929] bg-[#0b0b0b] text-[#aaa] hover:border-[#444]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2
                      size={18}
                      className={
                        role === "owner"
                          ? "text-black"
                          : "text-[#777]"
                      }
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        Owner
                      </p>

                      <p
                        className={`
                          mt-0.5 text-[10px]
                          ${
                            role === "owner"
                              ? "text-black/60"
                              : "text-[#666]"
                          }
                        `}
                      >
                        List & manage
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* =================================================
                SOCIAL LOGIN
            ================================================= */}

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {/* GOOGLE */}

              <SocialButton
                provider="google"
                label="Google"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={
                  <svg
                    width="18"
                    height="18"
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

              {/* APPLE */}

              <SocialButton
                provider="apple"
                label="Apple"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={
                  <Apple
                    size={19}
                    strokeWidth={2}
                    className="text-white"
                  />
                }
              />

              {/* FACEBOOK */}

              <SocialButton
                provider="facebook"
                label="Facebook"
                disabled={loading}
                onClick={handleSocialLogin}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#1877F2"
                      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.43H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.5h3.33l-.53 3.5h-2.8V24C19.61 23.09 24 18.09 24 12.07z"
                    />
                  </svg>
                }
              />
            </div>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#292929]" />

              <span className="whitespace-nowrap text-[10px] font-medium tracking-wider text-[#666]">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-[#292929]" />
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* FULL NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-medium text-[#aaa]"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    strokeWidth={1.7}
                    className="
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                    "
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    disabled={loading}
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#292929]
                      bg-[#0b0b0b]
                      pl-10 pr-4
                      text-sm text-white
                      outline-none
                      placeholder:text-[#555]
                      transition
                      focus:border-[#555]
                      focus:ring-1
                      focus:ring-white/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-[#aaa]"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.7}
                    className="
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#292929]
                      bg-[#0b0b0b]
                      pl-10 pr-4
                      text-sm text-white
                      outline-none
                      placeholder:text-[#555]
                      transition
                      focus:border-[#555]
                      focus:ring-1
                      focus:ring-white/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium text-[#aaa]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.7}
                    className="
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                    "
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#292929]
                      bg-[#0b0b0b]
                      pl-10 pr-11
                      text-sm text-white
                      outline-none
                      placeholder:text-[#555]
                      transition
                      focus:border-[#555]
                      focus:ring-1
                      focus:ring-white/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                      transition
                      hover:text-white
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-medium text-[#aaa]"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.7}
                    className="
                      absolute left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                    "
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#292929]
                      bg-[#0b0b0b]
                      pl-10 pr-11
                      text-sm text-white
                      outline-none
                      placeholder:text-[#555]
                      transition
                      focus:border-[#555]
                      focus:ring-1
                      focus:ring-white/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
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
                    className="
                      absolute right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#666]
                      transition
                      hover:text-white
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  SELECTED ACCOUNT TYPE
              ================================================= */}

              <div
                className="
                  flex items-center
                  justify-between
                  rounded-xl
                  border border-[#292929]
                  bg-[#0b0b0b]
                  px-3.5 py-2.5
                "
              >
                <span className="text-xs text-[#666]">
                  Selected account type
                </span>

                <span
                  className="
                    rounded-full
                    bg-white
                    px-3 py-1
                    text-[10px]
                    font-bold
                    capitalize
                    text-black
                  "
                >
                  {role}
                </span>
              </div>

              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading || uploadingImage
                }
                className="
                  flex h-12 w-full
                  items-center justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  text-sm font-bold
                  text-black
                  transition-all
                  hover:bg-slate-200
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                LOGIN LINK
            ================================================= */}

            <div className="mt-6 text-center">
              <p className="text-sm text-[#777]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                    font-medium
                    text-white
                    transition
                    hover:text-[#ccc]
                  "
                >
                  Login
                </Link>
              </p>
            </div>

            {/* =================================================
                TERMS
            ================================================= */}

            <p className="mt-5 text-center text-[10px] leading-5 text-[#555]">
              By creating an account, you agree to our{" "}
              <span className="text-[#777]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-[#777]">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}