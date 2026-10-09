"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Camera,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

export default function OwnerProfilePage() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    showPasswordSection,
    setShowPasswordSection,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /*
   * =====================================================
   * LOAD CURRENT USER
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const session =
          await authClient.getSession();

        if (cancelled) return;

        const currentUser =
          session?.data?.user;

        if (!currentUser) {
          return;
        }

        setUser(currentUser);

        setName(
          currentUser.name || ""
        );

        setEmail(
          currentUser.email || ""
        );

        setPhoto(
          currentUser.photo ||
            currentUser.image ||
            ""
        );
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        toast.error(
          "Failed to load profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =====================================================
   * PROFILE IMAGE UPLOAD
   * =====================================================
   */

  const handleImageChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    /*
     * Validate image
     */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      toast.error(
        "Please select a valid image."
      );

      return;
    }

    /*
     * 5 MB limit
     */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Image size must be less than 5MB."
      );

      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const response = await fetch(
  `${API_URL}/api/upload/profile`,
  {
    method: "POST",
    body: formData,
    credentials: "include",
  }
);


      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Image upload failed."
        );
      }

      const uploadedUrl =
        data?.url ||
        data?.imageUrl ||
        data?.image?.url;

      if (!uploadedUrl) {
        throw new Error(
          "Image URL was not returned by server."
        );
      }

      setPhoto(uploadedUrl);

      toast.success(
        "Profile photo uploaded."
      );
    } catch (error) {
      console.error(
        "Profile image upload error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  /*
   * =====================================================
   * SAVE PROFILE
   * =====================================================
   */

  const handleSaveProfile =
    async (event) => {
      event.preventDefault();

      if (!name.trim()) {
        toast.error(
          "Please enter your name."
        );

        return;
      }

      if (
        name.trim().length < 2
      ) {
        toast.error(
          "Name must contain at least 2 characters."
        );

        return;
      }

      try {
        setSaving(true);

        const {
          data,
          error,
        } =
          await authClient.updateUser({
            name: name.trim(),
            photo: photo || "",
          });

        if (error) {
          throw new Error(
            error.message ||
              "Failed to update profile."
          );
        }

        /*
         * Update local user state
         */

        const updatedUser =
          data?.user || {
            ...user,
            name: name.trim(),
            photo: photo || "",
          };

        setUser(updatedUser);

        toast.success(
          "Profile updated successfully."
        );
      } catch (error) {
        console.error(
          "Profile update error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * =====================================================
   * CHANGE PASSWORD
   * =====================================================
   */

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      if (!currentPassword) {
        toast.error(
          "Please enter your current password."
        );

        return;
      }

      if (!newPassword) {
        toast.error(
          "Please enter a new password."
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        toast.error(
          "New password must be at least 8 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error(
          "New passwords do not match."
        );

        return;
      }

      try {
        const { error } =
          await authClient.changePassword(
            {
              currentPassword,
              newPassword,
              revokeOtherSessions:
                false,
            }
          );

        if (error) {
          throw new Error(
            error.message ||
              "Failed to change password."
          );
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowPasswordSection(
          false
        );

        setShowCurrentPassword(
          false
        );

        setShowNewPassword(false);

        setShowConfirmPassword(
          false
        );

        toast.success(
          "Password changed successfully."
        );
      } catch (error) {
        console.error(
          "Password change error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to change password."
        );
      }
    };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="min-h-full w-full bg-slate-50 transition-colors duration-300 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">

            <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-2 h-4 w-64 rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="h-[330px] rounded-2xl bg-white dark:bg-zinc-900" />

              <div className="h-[330px] rounded-2xl bg-white dark:bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * PROFILE
   * =====================================================
   */

  return (
    <div className="min-h-full w-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7">

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-500">
            <span>
              Dashboard
            </span>

            <span>/</span>

            <span className="text-slate-600 dark:text-zinc-300">
              Profile
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Manage your personal information and account security.
          </p>
        </div>

        {/* =================================================
            PROFILE GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="p-6">

              <div className="flex flex-col items-center text-center">

                {/* PROFILE IMAGE */}

                <div className="relative">

                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800">

                    {photo ? (
                      <Image
                        src={photo}
                        alt={
                          user?.name ||
                          "Owner profile"
                        }
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-950 text-3xl font-bold text-white dark:bg-white dark:text-zinc-950">
                        {name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "O"}
                      </div>
                    )}

                  </div>

                  {/* UPLOAD */}

                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-slate-950 text-white shadow-md transition hover:bg-slate-800 dark:border-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    title="Change profile photo"
                  >
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      uploading
                    }
                  />

                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                  {name ||
                    "Property Owner"}
                </h2>

                <p className="mt-1 max-w-full truncate text-sm text-slate-500 dark:text-zinc-400">
                  {email}
                </p>

                {/* ROLE */}

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-300" />

                  <span className="text-xs font-semibold capitalize text-slate-700 dark:text-zinc-200">
                    {user?.role ||
                      "owner"}
                  </span>
                </div>

              </div>

              {/* ACCOUNT INFO */}

              <div className="mt-7 border-t border-slate-100 pt-5 dark:border-zinc-800">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-500">
                  Account
                </p>

                <div className="space-y-3">

                  {/* ACCOUNT TYPE */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-zinc-800">
                      <User className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                        Account Type
                      </p>

                      <p className="text-xs font-medium capitalize text-slate-700 dark:text-zinc-200">
                        {user?.role ||
                          "Owner"}
                      </p>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-zinc-800">
                      <Mail className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                        Email
                      </p>

                      <p className="truncate text-xs font-medium text-slate-700 dark:text-zinc-200">
                        {email}
                      </p>

                    </div>

                  </div>

                </div>
              </div>

            </div>

          </section>

          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">

              <div className="border-b border-slate-100 px-6 py-5 dark:border-zinc-800">

                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Update your basic account information.
                </p>

              </div>

              <form
                onSubmit={
                  handleSaveProfile
                }
                className="p-6"
              >

                <div className="grid gap-5 md:grid-cols-2">

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="owner-name"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                      <input
                        id="owner-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter your full name"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="owner-email"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                      <input
                        id="owner-email"
                        type="email"
                        value={email}
                        disabled
                        className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-500 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500"
                      />

                    </div>

                    <p className="mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                      Email address cannot be changed here.
                    </p>

                  </div>

                </div>

                {/* SAVE */}

                <div className="mt-6 flex justify-end">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950" />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />

                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </form>

            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">

              <div className="flex items-center justify-between gap-4 px-6 py-5">

                <div>

                  <div className="flex items-center gap-2">

                    <LockKeyhole className="h-4 w-4 text-slate-600 dark:text-zinc-300" />

                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Account Security
                    </h2>

                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    Keep your account secure by using a strong password.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordSection(
                      (value) =>
                        !value
                    )
                  }
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {showPasswordSection
                    ? "Cancel"
                    : "Change Password"}
                </button>

              </div>

              {showPasswordSection && (
                <form
                  onSubmit={
                    handleChangePassword
                  }
                  className="border-t border-slate-100 p-6 dark:border-zinc-800"
                >

                  <div className="grid gap-5 md:grid-cols-3">

                    {/* CURRENT PASSWORD */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                        Current Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showCurrentPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            currentPassword
                          }
                          onChange={(
                            event
                          ) =>
                            setCurrentPassword(
                              event
                                .target
                                .value
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(
                              (value) =>
                                !value
                            )
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>

                    {/* NEW PASSWORD */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                        New Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            newPassword
                          }
                          onChange={(
                            event
                          ) =>
                            setNewPassword(
                              event
                                .target
                                .value
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              (value) =>
                                !value
                            )
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                        Minimum 8 characters.
                      </p>

                    </div>

                    {/* CONFIRM */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                        Confirm Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            confirmPassword
                          }
                          onChange={(
                            event
                          ) =>
                            setConfirmPassword(
                              event
                                .target
                                .value
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (value) =>
                                !value
                            )
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>

                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                        Password security
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                        Use a strong password that you do not reuse elsewhere.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      <LockKeyhole className="h-4 w-4" />

                      Update Password
                    </button>

                  </div>

                </form>
              )}

            </section>

          </div>

        </div>

      </div>
    </div>
  );
}