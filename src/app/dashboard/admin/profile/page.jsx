"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // LOAD ADMIN PROFILE
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);

        const session = await authClient.getSession();

        if (cancelled) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "admin") {
          if (currentUser.role === "owner") {
            router.replace("/dashboard/owner");
          } else {
            router.replace("/dashboard/tenant");
          }
          return;
        }

        setUser(currentUser);
        setName(currentUser.name || "");
        setEmail(currentUser.email || "");
        setPhoto(currentUser.photo || currentUser.image || "");
      } catch (error) {
        console.error("Profile loading error:", error);

        if (!cancelled) {
          toast.error("Failed to load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // UPLOAD PROFILE IMAGE
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/api/upload/profile`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Image upload failed.");
      }

      const uploadedUrl =
        data?.url || data?.imageUrl || data?.image?.url;

      if (!uploadedUrl) {
        throw new Error("Image URL was not returned by server.");
      }

      setPhoto(uploadedUrl);
      toast.success("Profile photo uploaded.");
    } catch (error) {
      console.error("Profile image upload error:", error);
      toast.error(error.message || "Failed to upload profile photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // SAVE PROFILE
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await authClient.updateUser({
        name: name.trim(),
        photo: photo || "",
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile.");
      }

      const updatedUser = data?.user || {
        ...user,
        name: name.trim(),
        photo: photo || "",
      };

      setUser(updatedUser);
      setName(updatedUser.name || name.trim());

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        throw new Error(error.message || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to change password.");
    }
  };

  const resetPasswordForm = () => {
    setShowPasswordSection(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const adminInitial = name?.trim()?.charAt(0)?.toUpperCase() || "A";

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="mt-3 h-4 w-72 rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="h-96 rounded-2xl bg-white dark:bg-zinc-900" />
            <div className="h-[500px] rounded-2xl bg-white dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <header className="mb-7">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-orange-600 dark:text-orange-400">
              Profile
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
            Admin Profile
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your personal information and account security.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* PROFILE CARD */}
          <section className="h-fit overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* AVATAR */}
                <div className="relative">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-orange-100 bg-orange-50 dark:border-orange-500/20 dark:bg-zinc-800">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={name || "Admin profile"}
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {adminInitial}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Change profile photo"
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-900"
                  >
                    {uploading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </div>

                {uploading && (
                  <p className="mt-3 text-xs font-medium text-orange-600 dark:text-orange-400">
                    Uploading photo...
                  </p>
                )}

                <h2 className="mt-5 text-xl font-bold text-zinc-950 dark:text-white">
                  {name || "Admin"}
                </h2>

                <p className="mt-1 max-w-full break-all text-sm text-zinc-500 dark:text-zinc-400">
                  {email}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                  <ShieldCheck size={15} />
                  Administrator
                </div>
              </div>

              {/* ACCOUNT DETAILS */}
              <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <User size={18} className="text-orange-600 dark:text-orange-400" />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">Account Type</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Administrator
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <Mail size={18} className="text-orange-600 dark:text-orange-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">Email Address</p>
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                    <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">Account Status</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* PERSONAL INFORMATION */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update your administrator profile information.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="admin-name"
                      className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                      />

                      <input
                        id="admin-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-email"
                      className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />

                      <input
                        id="admin-email"
                        type="email"
                        value={email}
                        disabled
                        className="h-12 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-500 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
                      />
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      Your email address is managed by the authentication system.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-zinc-900"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
              </form>
            </section>

            {/* ACCOUNT SECURITY */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <LockKeyhole size={19} className="text-orange-600 dark:text-orange-400" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                      Account Security
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Keep your administrator account secure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!showPasswordSection ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        Password
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        Change your password to help protect your account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(true)}
                      className="shrink-0 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-orange-500/30 dark:bg-zinc-900 dark:text-orange-300 dark:hover:bg-orange-500/10"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    {/* CURRENT PASSWORD */}
                    <div>
                      <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                        />

                        <input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          placeholder="Enter current password"
                          autoComplete="current-password"
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-12 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />

                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((value) => !value)}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                        />

                        <input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          minLength={8}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-12 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />

                        <button
                          type="button"
                          onClick={() => setShowNewPassword((value) => !value)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-zinc-400">
                        Use at least 8 characters.
                      </p>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                        />

                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          minLength={8}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-12 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((value) => !value)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={resetPasswordForm}
                        className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                      >
                        <LockKeyhole size={16} />
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* SECURITY NOTICE */}
            <div className="flex gap-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-5 dark:border-orange-500/20 dark:bg-orange-500/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">
                <ShieldCheck size={20} className="text-orange-600 dark:text-orange-400" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Keep Your Account Secure
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Keep your administrator credentials private and use a
                  strong password to protect your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}