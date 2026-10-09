"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  LayoutDashboard,
  Heart,
  CalendarCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=Tenant&background=f97316&color=fff&size=200";

export default function TenantProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  // =========================================================
  // LOAD SESSION
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const result =
          await authClient.getSession();

        if (!mounted) return;

        const sessionUser =
          result?.data?.user;

        if (sessionUser) {
          setUser(sessionUser);
          setName(sessionUser.name || "");
        }
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);

      /*
       * Better Auth update user
       */

      const result =
        await authClient.updateUser({
          name: name.trim(),
        });

      if (result?.error) {
        throw new Error(
          result.error.message ||
            "Failed to update profile."
        );
      }

      setUser((prev) => ({
        ...prev,
        name: name.trim(),
      }));

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async () => {
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

    if (newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const result =
        await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });

      if (result?.error) {
        throw new Error(
          result.error.message ||
            "Failed to change password."
        );
      }

      toast.success(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordModal(false);
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f7f5ef] p-4 dark:bg-[#09090b] sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-8">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-3 h-9 w-40 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_1fr]">

            <div className="h-[500px] animate-pulse rounded-3xl bg-slate-200 dark:bg-zinc-900" />

            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-zinc-900" />
              <div className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-zinc-900" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO USER
  // =========================================================

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f5ef] p-6 dark:bg-[#09090b]">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <User
            size={40}
            className="mx-auto text-orange-500"
          />

          <h2 className="mt-4 text-xl font-bold">
            Profile unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Please log in to view your profile.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Login
          </Link>

        </div>
      </div>
    );
  }

  // =========================================================
  // USER DATA
  // =========================================================

  const email =
    user?.email || "No email available";

  const image =
    user?.image ||
    user?.photo ||
    FALLBACK_AVATAR;

  const role =
    user?.role?.toLowerCase() ||
    "tenant";

  const phone =
    user?.phone ||
    user?.phoneNumber ||
    "Not provided";

  const joinedDate = user?.createdAt
    ? new Date(
        user.createdAt
      ).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-[70vh] bg-[#f7f5ef] px-4 py-6 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-500">

          <Link
            href="/dashboard/tenant"
            className="transition hover:text-orange-500"
          >
            Dashboard
          </Link>

          <span>/</span>

          <span className="font-semibold text-slate-900 dark:text-white">
            Profile
          </span>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">

          <h1 className="text-3xl font-bold tracking-tight">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Manage your personal information and account security.
          </p>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">

          {/* =================================================
              LEFT PROFILE CARD
          ================================================= */}

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

            {/* AVATAR */}

            <div className="flex justify-center">

              <div className="relative">

                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800">

                  <Image
                    src={image}
                    alt={user?.name || "Tenant"}
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />

                </div>

                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white text-slate-700 shadow-md dark:border-[#18181b] dark:bg-zinc-800 dark:text-white"
                  title="Profile photo"
                >
                  <Camera size={17} />
                </button>

              </div>

            </div>

            {/* NAME */}

            <div className="mt-6 text-center">

              <h2 className="text-xl font-bold uppercase">
                {user?.name || "Tenant"}
              </h2>

              <p className="mt-2 break-all text-sm text-slate-500 dark:text-zinc-400">
                {email}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold capitalize text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <ShieldCheck size={14} />
                {role}
              </span>

            </div>

            {/* DIVIDER */}

            <div className="my-7 border-t border-slate-200 dark:border-zinc-800" />

            {/* ACCOUNT */}

            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
              Account
            </p>

            <div className="space-y-4">

              {/* TYPE */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <User size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Account Type
                  </p>

                  <p className="mt-0.5 text-sm font-semibold capitalize">
                    {role}
                  </p>
                </div>

              </div>

              {/* EMAIL */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <Mail size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Email
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {email}
                  </p>
                </div>

              </div>

              {/* JOINED */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Joined
                  </p>

                  <p className="mt-0.5 text-sm font-semibold">
                    {joinedDate}
                  </p>
                </div>

              </div>

            </div>

          </aside>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <main className="space-y-6">

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

              {/* SECTION HEADER */}

              <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800 sm:px-7">

                <h2 className="text-lg font-bold">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Update your basic account information.
                </p>

              </div>

              {/* FORM */}

              <div className="p-6 sm:p-7">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-[#09090b] dark:text-white"
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={email}
                        disabled
                        className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-500 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500"
                      />

                    </div>

                    <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
                      Email address cannot be changed here.
                    </p>

                  </div>

                </div>

                {/* SAVE */}

                <div className="mt-6 flex justify-end">

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {savingProfile ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={17} />
                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                ACCOUNT SECURITY
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b] sm:p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Lock size={20} />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold">
                      Account Security
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                      Keep your account secure by using a strong password.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordModal(true)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
                >
                  <Lock size={16} />
                  Change Password
                </button>

              </div>

            </section>

            {/* =================================================
                QUICK LINKS
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <Link
                href="/dashboard/tenant"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-zinc-800 dark:bg-[#18181b] dark:hover:border-orange-500"
              >

                <LayoutDashboard
                  size={21}
                  className="text-orange-500"
                />

                <h3 className="mt-4 font-bold">
                  Dashboard
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  Account overview
                </p>

              </Link>

              <Link
                href="/dashboard/tenant/bookings"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-zinc-800 dark:bg-[#18181b] dark:hover:border-orange-500"
              >

                <CalendarCheck
                  size={21}
                  className="text-orange-500"
                />

                <h3 className="mt-4 font-bold">
                  My Bookings
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  View your bookings
                </p>

              </Link>

              <Link
                href="/dashboard/tenant/favorites"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-zinc-800 dark:bg-[#18181b] dark:hover:border-orange-500"
              >

                <Heart
                  size={21}
                  className="text-orange-500"
                />

                <h3 className="mt-4 font-bold">
                  Favorites
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  Saved properties
                </p>

              </Link>

            </section>

          </main>

        </div>

      </div>

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#18181b]">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-zinc-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                  <Lock size={19} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Change Password
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    Update your account password.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 p-6">

              {/* CURRENT PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Current Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Minimum 8 characters.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="h-12 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="h-12 flex-1 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}