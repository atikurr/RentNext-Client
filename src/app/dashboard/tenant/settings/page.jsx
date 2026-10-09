"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Mail,
  CalendarCheck,
  Heart,
  ShieldCheck,
  Lock,
  User,
  ChevronRight,
  Save,
  LogOut,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";

// =========================================================
// TOGGLE COMPONENT
// =========================================================

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-label="Toggle setting"
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        enabled
          ? "bg-orange-500"
          : "bg-slate-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

// =========================================================
// SETTINGS PAGE
// =========================================================

export default function TenantSettingsPage() {
  // =========================================================
  // INITIAL SETTINGS
  // =========================================================

  const getSavedSettings = () => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const saved =
        localStorage.getItem(
          "rentnest-tenant-settings"
        );

      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error(
        "Settings parse error:",
        error
      );

      return {};
    }
  };

  const savedSettings = getSavedSettings();

  // =========================================================
  // STATE
  // =========================================================

  const [emailNotifications, setEmailNotifications] =
    useState(
      savedSettings.emailNotifications ?? true
    );

  const [
    bookingNotifications,
    setBookingNotifications,
  ] = useState(
    savedSettings.bookingNotifications ?? true
  );

  const [propertyAlerts, setPropertyAlerts] =
    useState(
      savedSettings.propertyAlerts ?? true
    );

  const [marketingEmails, setMarketingEmails] =
    useState(
      savedSettings.marketingEmails ?? false
    );

  const [profileVisibility, setProfileVisibility] =
    useState(
      savedSettings.profileVisibility ?? true
    );

  const [saving, setSaving] = useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const settings = {
        emailNotifications,
        bookingNotifications,
        propertyAlerts,
        marketingEmails,
        profileVisibility,
      };

      localStorage.setItem(
        "rentnest-tenant-settings",
        JSON.stringify(settings)
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      toast.success(
        "Settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      toast.error(
        "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      toast.error(
        "Failed to sign out."
      );

      setLoggingOut(false);
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-[70vh] bg-[#f7f5ef] px-4 py-6 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

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
            Settings
          </span>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                <Settings size={21} />
              </div>

              <div>

                <h1 className="text-3xl font-bold tracking-tight">
                  Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Manage your account preferences and security.
                </p>

              </div>

            </div>

          </div>

          <Link
            href="/dashboard/tenant"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

        </div>

        {/* =================================================
            NOTIFICATION PREFERENCES
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

          {/* HEADER */}

          <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                <Bell size={19} />
              </div>

              <div>

                <h2 className="font-bold">
                  Notification Preferences
                </h2>

                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Choose how you want to receive updates.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">

            {/* EMAIL NOTIFICATIONS */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Mail size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Email Notifications
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    Receive important account updates,
                    security alerts, and platform
                    notifications through email.
                  </p>

                </div>

              </div>

              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />

            </div>

            {/* BOOKING NOTIFICATIONS */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <CalendarCheck size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Booking Updates
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    Get notified when your booking
                    status changes or when an owner
                    responds to your request.
                  </p>

                </div>

              </div>

              <Toggle
                enabled={bookingNotifications}
                onChange={setBookingNotifications}
              />

            </div>

            {/* PROPERTY ALERTS */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Heart size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Property Alerts
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    Receive updates about saved
                    properties and relevant rental
                    opportunities.
                  </p>

                </div>

              </div>

              <Toggle
                enabled={propertyAlerts}
                onChange={setPropertyAlerts}
              />

            </div>

            {/* MARKETING EMAILS */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Mail size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Product & Marketing Emails
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    Receive optional product updates,
                    announcements, and promotional
                    information.
                  </p>

                </div>

              </div>

              <Toggle
                enabled={marketingEmails}
                onChange={setMarketingEmails}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            PRIVACY
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

          <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h2 className="font-bold">
                  Privacy
                </h2>

                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Control your account visibility.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <User size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Profile Visibility
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    Allow your basic profile information
                    to be visible when required for
                    rental and booking interactions.
                  </p>

                </div>

              </div>

              <Toggle
                enabled={profileVisibility}
                onChange={setProfileVisibility}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

          <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <Lock size={19} />
              </div>

              <div>

                <h2 className="font-bold">
                  Security
                </h2>

                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Manage your account security.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">

            {/* PROFILE & PASSWORD */}

            <Link
              href="/dashboard/tenant/profile"
              className="flex items-center justify-between gap-5 px-6 py-5 transition hover:bg-slate-50 dark:hover:bg-zinc-900"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <User size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Profile & Password
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                    Update your personal information
                    and change your password.
                  </p>

                </div>

              </div>

              <ChevronRight
                size={19}
                className="shrink-0 text-slate-400"
              />

            </Link>

            {/* ACCOUNT STATUS */}

            <div className="flex items-center justify-between gap-5 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle2 size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Account Status
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                    Your account is currently active.
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
                Active
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            SAVE SETTINGS
        ================================================= */}

        <div className="mb-6 flex justify-end">

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Settings
              </>
            )}

          </button>

        </div>

        {/* =================================================
            SIGN OUT
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                <LogOut size={18} />
              </div>

              <div>

                <h2 className="font-bold">
                  Sign Out
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  Sign out from your RentNest account on this device.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >

              {loggingOut ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  Sign Out
                </>
              )}

            </button>

          </div>

        </section>

      </div>
    </div>
  );
}