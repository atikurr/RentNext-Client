"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bell,
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

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  bookingNotifications: true,
  propertyNotifications: true,
  userNotifications: true,
  transactionNotifications: true,
  securityNotifications: true,
};

const STORAGE_KEY = "property-rental-admin-settings";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // LOAD ADMIN + SETTINGS
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
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

        try {
          const savedSettings = localStorage.getItem(STORAGE_KEY);

          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);

            if (
              parsedSettings &&
              typeof parsedSettings === "object" &&
              !Array.isArray(parsedSettings)
            ) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...parsedSettings,
              });
            }
          }
        } catch (storageError) {
          console.error("Settings storage error:", storageError);
          toast.error("Could not load saved preferences.");
        }
      } catch (error) {
        console.error("Admin settings loading error:", error);
        toast.error("Failed to load settings.");
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

  // TOGGLE SETTING
  const handleToggle = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  // SAVE SETTINGS
  const handleSave = () => {
    try {
      setSaving(true);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // RESET SETTINGS
  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to default?"
    );

    if (!confirmed) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      setSettings({ ...DEFAULT_SETTINGS });

      toast.success("Settings reset to default.");
    } catch (error) {
      console.error("Reset settings error:", error);
      toast.error("Failed to reset settings.");
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 transition-colors dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-8 space-y-5">
            <div className="h-56 rounded-2xl bg-white dark:bg-zinc-900" />
            <div className="h-72 rounded-2xl bg-white dark:bg-zinc-900" />
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

      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-7">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-orange-600 dark:text-orange-400">
              Settings
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/20">
              <SettingsIcon size={21} />
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
        </header>

        {/* SETTINGS CONTENT */}
        <div className="space-y-6">
          {/* NOTIFICATION SETTINGS */}
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                  <Bell
                    size={19}
                    className="text-orange-600 dark:text-orange-400"
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
              <SettingRow
                title="Email Notifications"
                description="Receive important system notifications by email."
                enabled={settings.emailNotifications}
                onToggle={() => handleToggle("emailNotifications")}
              />

              <SettingRow
                title="Booking Notifications"
                description="Get notified when new bookings are created or their status changes."
                enabled={settings.bookingNotifications}
                onToggle={() => handleToggle("bookingNotifications")}
              />

              <SettingRow
                title="Property Notifications"
                description="Receive updates about property submissions, approvals, and rejections."
                enabled={settings.propertyNotifications}
                onToggle={() => handleToggle("propertyNotifications")}
              />

              <SettingRow
                title="User Notifications"
                description="Receive notifications about important user account activities."
                enabled={settings.userNotifications}
                onToggle={() => handleToggle("userNotifications")}
              />

              <SettingRow
                title="Transaction Notifications"
                description="Receive alerts about successful, failed, pending, or refunded payments."
                enabled={settings.transactionNotifications}
                onToggle={() => handleToggle("transactionNotifications")}
              />

              <SettingRow
                title="Security Notifications"
                description="Receive alerts about important account and security activities."
                enabled={settings.securityNotifications}
                onToggle={() => handleToggle("securityNotifications")}
              />
            </div>
          </section>

          {/* ACCOUNT & SECURITY */}
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                  <ShieldCheck
                    size={19}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Account &amp; Security
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
                className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-orange-50/60 dark:hover:bg-orange-500/5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-orange-100 dark:bg-zinc-800 dark:group-hover:bg-orange-500/10">
                    <CircleUserRound
                      size={19}
                      className="text-zinc-600 group-hover:text-orange-600 dark:text-zinc-300 dark:group-hover:text-orange-400"
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
                  className="shrink-0 text-zinc-400 transition-colors group-hover:text-orange-500"
                />
              </Link>

              {/* PASSWORD */}
              <Link
                href="/dashboard/admin/profile"
                className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-orange-50/60 dark:hover:bg-orange-500/5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-orange-100 dark:bg-zinc-800 dark:group-hover:bg-orange-500/10">
                    <LockKeyhole
                      size={19}
                      className="text-zinc-600 group-hover:text-orange-600 dark:text-zinc-300 dark:group-hover:text-orange-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Password &amp; Security
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Change your administrator account password.
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-zinc-400 transition-colors group-hover:text-orange-500"
                />
              </Link>

              {/* EMAIL STATUS */}
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <Mail
                      size={19}
                      className="text-orange-600 dark:text-orange-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Email Notifications
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      System email notification preference.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Available
                </span>
              </div>
            </div>
          </section>

          {/* ADMIN INFORMATION */}
          <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 shadow-sm transition-colors dark:border-orange-500/20 dark:bg-orange-500/5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">
                <ShieldCheck
                  size={20}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Administrator Settings
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  These preferences are stored locally for this browser.
                  Your administrator account permissions are controlled
                  by the server and cannot be changed from this page.
                </p>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
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
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                {/* SAVE */}
                <button
                  type="button"
                  onClick={handleSave}
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
                      <Save size={16} />
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

// SETTING ROW
function SettingRow({ title, description, enabled, onToggle }) {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-orange-50/30 dark:hover:bg-orange-500/[0.02] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* ORANGE TOGGLE */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
          enabled
            ? "bg-orange-500"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}