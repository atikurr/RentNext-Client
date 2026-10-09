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
  LoaderCircle,
  ChevronRight,
  Settings2,
} from "lucide-react";
import {
  toast,
  ToastContainer,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-orange-500";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300";

const cardClass =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900";

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-zinc-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={`${inputClass} pr-12`}
          required
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function OwnerProfilePage() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");

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

  // Load the authenticated user's profile.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);

        const session = await authClient.getSession();

        if (cancelled) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          setUser(null);
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
  }, []);

  // Upload profile photo.
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

      const response = await fetch(
        `${API_URL}/api/upload/profile`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Image upload failed."
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
      toast.success("Profile photo uploaded.");
    } catch (error) {
      console.error("Profile image upload error:", error);

      toast.error(
        error.message || "Failed to upload profile photo."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Save profile information.
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
        throw new Error(
          error.message || "Failed to update profile."
        );
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

      toast.error(
        error.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change account password.
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
      toast.error(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        throw new Error(
          error.message || "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordSection(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Password change error:", error);

      toast.error(
        error.message || "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1350px] animate-pulse">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="mt-4 h-8 w-52 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="h-[360px] rounded-2xl bg-white dark:bg-zinc-900" />
            <div className="space-y-6">
              <div className="h-[260px] rounded-2xl bg-white dark:bg-zinc-900" />
              <div className="h-[180px] rounded-2xl bg-white dark:bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed-out state.
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <ShieldCheck size={26} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Sign in required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Please sign in to view and manage your profile.
          </p>
        </div>
      </div>
    );
  }

  const initials =
    name?.trim()?.charAt(0)?.toUpperCase() || "O";

  return (
    <div className="min-h-full w-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <main className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading */}
        <header className="mb-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-500">
            <span>Dashboard</span>
            <ChevronRight size={13} />
            <span className="text-orange-600 dark:text-orange-400">
              Profile
            </span>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
                <Settings2 size={14} />
                Account Settings
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
                Manage your personal information and keep your
                property owner account secure.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Account active
            </div>
          </div>
        </header>

        {/* Main layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Profile card */}
          <aside className={cardClass}>
            <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />

            <div className="p-5 sm:p-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile image */}
                <div className="relative">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-orange-100 bg-orange-50 ring-4 ring-orange-500/10 dark:border-zinc-800 dark:bg-zinc-800 dark:ring-orange-500/10">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={name || "Owner profile"}
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 to-amber-400 text-3xl font-extrabold text-white">
                        {initials}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="profile-image"
                    title="Change profile photo"
                    className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg transition hover:bg-orange-600 dark:border-zinc-900 ${
                      uploading
                        ? "cursor-wait"
                        : "cursor-pointer"
                    }`}
                  >
                    {uploading ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera size={17} />
                    )}
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </div>

                <h2 className="mt-5 max-w-full break-words text-lg font-bold text-slate-950 dark:text-white">
                  {name || "Property Owner"}
                </h2>

                <p className="mt-1 max-w-full break-all text-sm text-slate-500 dark:text-zinc-400">
                  {email}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 dark:border-orange-500/20 dark:bg-orange-500/10">
                  <ShieldCheck
                    size={15}
                    className="text-orange-600 dark:text-orange-400"
                  />
                  <span className="text-xs font-semibold capitalize text-orange-700 dark:text-orange-400">
                    {user.role || "owner"}
                  </span>
                </div>
              </div>

              {/* Account information */}
              <div className="mt-7 border-t border-slate-100 pt-5 dark:border-zinc-800">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-zinc-500">
                  Account Information
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <User size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        Account Type
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-700 dark:text-zinc-200">
                        {user.role || "Owner"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Mail size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-700 dark:text-zinc-200">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo upload hint */}
              <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50/70 p-3 dark:border-orange-500/15 dark:bg-orange-500/5">
                <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                  Profile photo
                </p>
                <p className="mt-1 text-xs leading-5 text-orange-700/80 dark:text-orange-300/70">
                  Use a clear image. Maximum file size is 5 MB.
                </p>
              </div>
            </div>
          </aside>

          {/* Right content */}
          <div className="min-w-0 space-y-6">
            {/* Personal information */}
            <section className={cardClass}>
              <SectionHeader
                icon={User}
                title="Personal Information"
                description="Update your basic account information."
              />

              <form
                onSubmit={handleSaveProfile}
                className="p-5 sm:p-7"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="owner-name"
                      className={labelClass}
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="owner-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        minLength={2}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="owner-email"
                      className={labelClass}
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="owner-email"
                        type="email"
                        value={email}
                        disabled
                        className={`${inputClass} cursor-not-allowed bg-slate-50 pl-11 text-slate-500 dark:bg-zinc-950 dark:text-zinc-500`}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
                      Email address cannot be changed here.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <p className="text-xs leading-5 text-slate-400 dark:text-zinc-500">
                    Make sure your name is correct before saving.
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
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

            {/* Account security */}
            <section className={cardClass}>
              <SectionHeader
                icon={LockKeyhole}
                title="Account Security"
                description="Keep your account secure with a strong password."
              />

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      Password & Protection
                    </p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-zinc-400">
                      Change your password periodically to help
                      protect your account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection((value) => !value);
                  }}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/15"
                >
                  <LockKeyhole size={16} />
                  {showPasswordSection
                    ? "Cancel"
                    : "Change Password"}
                </button>
              </div>

              {showPasswordSection && (
                <form
                  onSubmit={handleChangePassword}
                  className="border-t border-slate-100 p-5 sm:p-7 dark:border-zinc-800"
                >
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Update Your Password
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
                      Enter your current password and choose a
                      new password containing at least 8
                      characters.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <PasswordField
                      label="Current Password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      visible={showCurrentPassword}
                      onToggle={() =>
                        setShowCurrentPassword((value) => !value)
                      }
                      autoComplete="current-password"
                    />

                    <PasswordField
                      label="New Password"
                      value={newPassword}
                      onChange={setNewPassword}
                      visible={showNewPassword}
                      onToggle={() =>
                        setShowNewPassword((value) => !value)
                      }
                      autoComplete="new-password"
                    />

                    <PasswordField
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      visible={showConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      autoComplete="new-password"
                    />
                  </div>

                  {newPassword.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          newPassword.length >= 8
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />

                      <span
                        className={
                          newPassword.length >= 8
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        {newPassword.length >= 8
                          ? "Password length requirement met"
                          : "Use at least 8 characters"}
                      </span>
                    </div>
                  )}

                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 text-xs ${
                        newPassword === confirmPassword
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500"
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        Password safety
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
                        Avoid reusing passwords from other websites.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        changingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                          Updating...
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={16} />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Account information note */}
            <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 sm:p-5 dark:border-orange-500/15 dark:bg-orange-500/5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm dark:bg-zinc-900 dark:text-orange-400">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  Your account, your control
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-400">
                  Keep your profile information up to date and
                  use a strong password to protect your owner
                  account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}