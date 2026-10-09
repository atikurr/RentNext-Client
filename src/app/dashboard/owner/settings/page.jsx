
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Globe2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Smartphone,
  UserRound,
  LoaderCircle,
  Settings2,
  RotateCcw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SETTINGS_KEY = "property-rental-owner-settings";

const DEFAULT_SETTINGS = {
  emailBookingRequests: true,
  emailPropertyUpdates: true,
  emailMarketing: false,
  browserNotifications: true,
};

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <CardHeader className="border-b border-slate-100 px-5 py-5 dark:border-zinc-800 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
            {description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

function SettingToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500/15 ${
        checked
          ? "border-orange-500 bg-orange-500"
          : "border-slate-300 bg-slate-200 dark:border-zinc-700 dark:bg-zinc-800"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? "left-[21px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {title}
          </p>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <SettingToggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

const cardClass =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

export default function OwnerSettingsPage() {
  const router = useRouter();

  const [ownerSettings, setOwnerSettings] = useState(
    DEFAULT_SETTINGS
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = window.localStorage.getItem(SETTINGS_KEY);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        if (
          parsedSettings &&
          typeof parsedSettings === "object" &&
          !Array.isArray(parsedSettings)
        ) {
          setOwnerSettings({
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkOwner() {
      try {
        const session = await authClient.getSession();

        if (!mounted) return;

        const currentUser = session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "owner") {
          if (currentUser.role === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/tenant");
          }
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Owner authorization error:", error);

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkOwner();

    return () => {
      mounted = false;
    };
  }, [router]);

  const updateSetting = (key, value) => {
    setOwnerSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    try {
      setSaving(true);

      window.localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(ownerSettings)
      );

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Restore all settings to their default values?"
    );

    if (!confirmed) return;

    const resetValue = { ...DEFAULT_SETTINGS };

    try {
      window.localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(resetValue)
      );

      setOwnerSettings(resetValue);
      toast.success("Settings restored to default.");
    } catch (error) {
      console.error("Reset settings error:", error);
      toast.error("Failed to reset settings.");
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Loading settings...
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  const profileImage = user.photo || user.image || "";

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "O";

  const notificationsEnabled =
    ownerSettings.emailBookingRequests ||
    ownerSettings.emailPropertyUpdates ||
    ownerSettings.emailMarketing ||
    ownerSettings.browserNotifications;

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="min-h-full bg-slate-50 transition-colors duration-300 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Page heading */}
          <header className="mb-8">
            <div className="mb-5 flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
              <Link
                href="/dashboard/owner"
                className="transition hover:text-orange-600 dark:hover:text-orange-400"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                Settings
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Badge
                  variant="outline"
                  className="mb-3 rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400"
                >
                  <Settings2 className="mr-1.5 h-3 w-3" />
                  Owner Portal
                </Badge>

                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
                  Manage your notification preferences and
                  account security.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Account protected
                </span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0 space-y-6">
              {/* Notifications */}
              <Card className={cardClass}>
                <SectionHeader
                  icon={Bell}
                  title="Notifications"
                  description="Choose which updates you want to receive."
                />

                <CardContent className="px-5 sm:px-6">
                  <SettingRow
                    icon={Bell}
                    title="Booking request emails"
                    description="Receive an email when a tenant submits a new booking request."
                    checked={ownerSettings.emailBookingRequests}
                    onChange={(value) =>
                      updateSetting("emailBookingRequests", value)
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Building2}
                    title="Property updates"
                    description="Receive updates about your property listings and approval status."
                    checked={ownerSettings.emailPropertyUpdates}
                    onChange={(value) =>
                      updateSetting("emailPropertyUpdates", value)
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Globe2}
                    title="Marketing emails"
                    description="Receive occasional product news, tips and platform updates."
                    checked={ownerSettings.emailMarketing}
                    onChange={(value) =>
                      updateSetting("emailMarketing", value)
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Smartphone}
                    title="Browser notifications"
                    description="Save your preference for browser notifications."
                    checked={ownerSettings.browserNotifications}
                    onChange={(value) =>
                      updateSetting("browserNotifications", value)
                    }
                  />
                </CardContent>
              </Card>

              {/* Security */}
              <Card className={cardClass}>
                <SectionHeader
                  icon={LockKeyhole}
                  title="Security"
                  description="Manage your password and account security."
                />

                <CardContent className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-500/15 dark:bg-orange-500/5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm dark:bg-zinc-900 dark:text-orange-400">
                        <LockKeyhole className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Password & account security
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-400">
                          Update your password and account
                          security information from your profile.
                        </p>

                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 h-10 rounded-xl border-orange-200 bg-white text-xs font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-500/20 dark:bg-zinc-900 dark:text-orange-400 dark:hover:bg-zinc-800"
                          onClick={() =>
                            router.push("/dashboard/owner/profile")
                          }
                        >
                          Open Profile Security
                          <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Account session active
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-white text-[10px] text-emerald-700 dark:border-emerald-500/30 dark:bg-zinc-900 dark:text-emerald-400"
                    >
                      Secure
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Save actions */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-11 rounded-xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset defaults
                </Button>

                <Button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="h-11 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24">
              {/* Owner card */}
              <Card className="overflow-hidden rounded-2xl border-zinc-800 bg-zinc-950 text-white shadow-lg">
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />

                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-orange-500 text-sm font-bold text-white">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={user.name || "Owner profile"}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {user.name || "Property Owner"}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-5 bg-white/10" />

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-400">
                        Account type
                      </span>
                      <span className="font-semibold capitalize">
                        {user.role || "Owner"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-400">
                        Notifications
                      </span>
                      <span
                        className={
                          notificationsEnabled
                            ? "font-semibold text-emerald-400"
                            : "font-semibold text-zinc-400"
                        }
                      >
                        {notificationsEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-400">
                        Browser alerts
                      </span>
                      <span
                        className={
                          ownerSettings.browserNotifications
                            ? "font-semibold text-emerald-400"
                            : "font-semibold text-zinc-400"
                        }
                      >
                        {ownerSettings.browserNotifications
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/owner/profile"
                    className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white transition hover:border-orange-500/40 hover:bg-orange-500/10"
                  >
                    <UserRound className="h-4 w-4" />
                    View Profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>

              {/* Profile shortcut */}
              <Card className={cardClass}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Profile information
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
                        Update your name, photo and password.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-9 rounded-lg border-slate-200 bg-white text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        onClick={() =>
                          router.push("/dashboard/owner/profile")
                        }
                      >
                        Open Profile
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account actions */}
              <Card className="overflow-hidden rounded-2xl border-red-100 bg-white shadow-sm dark:border-red-500/20 dark:bg-zinc-900">
                <CardHeader className="px-5 py-5">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Account actions
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                    Sign out from this device.
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-5">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="h-10 w-full rounded-xl border-red-200 bg-white text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {loggingOut ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {loggingOut ? "Signing out..." : "Logout"}
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
