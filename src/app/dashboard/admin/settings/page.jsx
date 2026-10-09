"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  LockKeyhole,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  Settings as SettingsIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  bookingNotifications: true,
  propertyNotifications: true,
  userNotifications: true,
  transactionNotifications: true,
  securityNotifications: true,
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN + SETTINGS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const session =
          await authClient.getSession();

        if (cancelled) {
          return;
        }

        const currentUser =
          session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (
          currentUser.role !== "admin"
        ) {
          if (
            currentUser.role ===
            "owner"
          ) {
            router.replace(
              "/dashboard/owner"
            );
          } else {
            router.replace(
              "/dashboard/tenant"
            );
          }

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD LOCAL SETTINGS
        |--------------------------------------------------------------------------
        */

        try {
          const savedSettings =
            localStorage.getItem(
              "property-rental-admin-settings"
            );

          if (savedSettings) {
            const parsedSettings =
              JSON.parse(
                savedSettings
              );

            setSettings({
              ...DEFAULT_SETTINGS,
              ...parsedSettings,
            });
          }
        } catch (storageError) {
          console.error(
            "Settings storage error:",
            storageError
          );
        }
      } catch (error) {
        console.error(
          "Admin settings loading error:",
          error
        );

        toast.error(
          "Failed to load settings."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | TOGGLE SETTING
  |--------------------------------------------------------------------------
  */

  const handleToggle = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE SETTINGS
  |--------------------------------------------------------------------------
  */

  const handleSave = () => {
    try {
      setSaving(true);

      localStorage.setItem(
        "property-rental-admin-settings",
        JSON.stringify(settings)
      );

      toast.success(
        "Settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      );

      toast.error(
        "Failed to save settings."
      );
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 500);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET SETTINGS
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to reset all settings to default?"
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      DEFAULT_SETTINGS
    );

    try {
      localStorage.setItem(
        "property-rental-admin-settings",
        JSON.stringify(
          DEFAULT_SETTINGS
        )
      );

      toast.success(
        "Settings reset to default."
      );
    } catch (error) {
      console.error(
        "Reset settings error:",
        error
      );

      toast.error(
        "Failed to reset settings."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="animate-pulse">

            <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="mt-8 space-y-5">

              <div className="h-56 rounded-2xl bg-white dark:bg-zinc-900" />

              <div className="h-72 rounded-2xl bg-white dark:bg-zinc-900" />

            </div>

          </div>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto max-w-6xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-7">

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">

            <span>
              Dashboard
            </span>

            <span>
              /
            </span>

            <span className="text-zinc-600 dark:text-zinc-300">
              Settings
            </span>

          </div>

          <div className="mt-2 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">

              <SettingsIcon
                size={21}
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                Admin Settings
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your administrator preferences and notifications.
              </p>

            </div>

          </div>

        </div>

        {/* ======================================================
            SETTINGS CONTENT
        ====================================================== */}

        <div className="space-y-6">

          {/* ====================================================
              NOTIFICATION SETTINGS
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                  <Bell
                    size={19}
                    className="text-zinc-700 dark:text-zinc-200"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Notification Preferences
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Choose which activities you want to receive notifications about.
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

              {/* EMAIL */}

              <SettingRow
                title="Email Notifications"
                description="Receive important system notifications by email."
                enabled={
                  settings.emailNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "emailNotifications"
                  )
                }
              />

              {/* BOOKINGS */}

              <SettingRow
                title="Booking Notifications"
                description="Get notified when new bookings are created or their status changes."
                enabled={
                  settings.bookingNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "bookingNotifications"
                  )
                }
              />

              {/* PROPERTIES */}

              <SettingRow
                title="Property Notifications"
                description="Receive updates about property submissions, approvals, and rejections."
                enabled={
                  settings.propertyNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "propertyNotifications"
                  )
                }
              />

              {/* USERS */}

              <SettingRow
                title="User Notifications"
                description="Receive notifications about important user account activities."
                enabled={
                  settings.userNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "userNotifications"
                  )
                }
              />

              {/* TRANSACTIONS */}

              <SettingRow
                title="Transaction Notifications"
                description="Receive alerts about successful, failed, pending, or refunded payments."
                enabled={
                  settings.transactionNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "transactionNotifications"
                  )
                }
              />

              {/* SECURITY */}

              <SettingRow
                title="Security Notifications"
                description="Receive alerts about important account and security activities."
                enabled={
                  settings.securityNotifications
                }
                onToggle={() =>
                  handleToggle(
                    "securityNotifications"
                  )
                }
              />

            </div>

          </section>

          {/* ====================================================
              ACCOUNT
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                  <ShieldCheck
                    size={19}
                    className="text-zinc-700 dark:text-zinc-200"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Account & Security
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Manage your administrator account information and security.
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

              {/* PROFILE */}

              <Link
                href="/dashboard/admin/profile"
                className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                    <CircleUserRound
                      size={19}
                      className="text-zinc-600 dark:text-zinc-300"
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Profile
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Update your name and profile photo.
                    </p>

                  </div>

                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-zinc-400"
                />

              </Link>

              {/* PASSWORD */}

              <Link
                href="/dashboard/admin/profile"
                className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                    <LockKeyhole
                      size={19}
                      className="text-zinc-600 dark:text-zinc-300"
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Password & Security
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Change your administrator account password.
                    </p>

                  </div>

                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-zinc-400"
                />

              </Link>

              {/* EMAIL */}

              <div className="flex items-center justify-between gap-4 px-6 py-5">

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                    <Mail
                      size={19}
                      className="text-zinc-600 dark:text-zinc-300"
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Email Notifications
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      System email notifications are controlled above.
                    </p>

                  </div>

                </div>

                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Active
                </span>

              </div>

            </div>

          </section>

          {/* ====================================================
              ADMIN INFORMATION
          ==================================================== */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

                <ShieldCheck
                  size={20}
                  className="text-emerald-600 dark:text-emerald-400"
                />

              </div>

              <div>

                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Administrator Settings
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  These preferences are stored locally for this browser.
                  Your administrator account permissions are controlled
                  by the server and cannot be changed from this page.
                </p>

              </div>

            </div>

          </section>

          {/* ====================================================
              ACTIONS
          ==================================================== */}

          <div className="sticky bottom-4 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Save your changes
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Notification preferences will be saved for this browser.
                </p>

              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* RESET */}

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <RotateCcw
                    size={16}
                  />

                  Reset
                </button>

                {/* SAVE */}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={16}
                      />

                      Save Settings
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SETTING ROW
|--------------------------------------------------------------------------
*/

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

      <div className="min-w-0">

        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>

      </div>

      {/* TOGGLE */}

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-zinc-950 dark:bg-white"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >

        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6 dark:bg-zinc-950"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}