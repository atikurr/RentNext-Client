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
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

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

/* =========================================================
   CONSTANTS
========================================================= */

const SETTINGS_KEY =
  "property-rental-owner-settings";

const DEFAULT_SETTINGS = {
  emailBookingRequests: true,
  emailPropertyUpdates: true,
  emailMarketing: false,
  browserNotifications: true,
};

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <CardHeader className="border-b border-slate-100 px-5 py-5 dark:border-zinc-800 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
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

/* =========================================================
   TOGGLE
========================================================= */

function SettingToggle({
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-950/10 dark:focus:ring-white/10 ${
        checked
          ? "border-slate-950 bg-slate-950 dark:border-white dark:bg-white"
          : "border-slate-300 bg-slate-200 dark:border-zinc-700 dark:bg-zinc-800"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 dark:bg-zinc-950 ${
          checked
            ? "left-[21px]"
            : "left-0.5"
        }`}
      />
    </button>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <SettingToggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

/* =========================================================
   OWNER SETTINGS PAGE
========================================================= */

export default function OwnerSettingsPage() {
  const router = useRouter();

  const [
    ownerSettings,
    setOwnerSettings,
  ] = useState(
    DEFAULT_SETTINGS
  );

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     LOAD SAVED SETTINGS
  ======================================================= */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const savedSettings =
        window.localStorage.getItem(
          SETTINGS_KEY
        );

      if (!savedSettings) {
        return;
      }

      const parsedSettings =
        JSON.parse(
          savedSettings
        );

      if (
        parsedSettings &&
        typeof parsedSettings ===
          "object"
      ) {
        setOwnerSettings({
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    }
  }, []);

  /* =======================================================
     LOAD OWNER SESSION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkOwner = async () => {
      try {
        const session =
          await authClient.getSession();

        if (!mounted) {
          return;
        }

        const currentUser =
          session?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (
          currentUser.role !==
          "owner"
        ) {
          if (
            currentUser.role ===
            "admin"
          ) {
            router.replace(
              "/dashboard/admin"
            );
          } else {
            router.replace(
              "/dashboard/tenant"
            );
          }

          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Owner authorization error:",
          error
        );

        if (mounted) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkOwner();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     UPDATE SETTING
  ======================================================= */

  const updateSetting = (
    key,
    value
  ) => {
    setOwnerSettings(
      (currentSettings) => ({
        ...currentSettings,
        [key]: value,
      })
    );
  };

  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  const handleSave = () => {
    try {
      setSaving(true);

      window.localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(
          ownerSettings
        )
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
      window.setTimeout(() => {
        setSaving(false);
      }, 500);
    }
  };

  /* =======================================================
     RESET SETTINGS
  ======================================================= */

  const handleReset = () => {
    const confirmed =
      window.confirm(
        "Restore all settings to their default values?"
      );

    if (!confirmed) {
      return;
    }

    const resetValue = {
      ...DEFAULT_SETTINGS,
    };

    setOwnerSettings(
      resetValue
    );

    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(
        resetValue
      )
    );

    toast.success(
      "Settings restored to default."
    );
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {
      try {
        await authClient.signOut();

        router.replace("/login");
        router.refresh();
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );

        toast.error(
          "Logout failed."
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 dark:bg-white">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-400/30 dark:border-t-zinc-950" />
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

  /* =======================================================
     USER DATA
  ======================================================= */

  const profileImage =
    user.photo ||
    user.image ||
    "";

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "O";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <div className="min-h-full bg-slate-50 transition-colors duration-300 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
              <Link
                href="/dashboard/owner"
                className="transition hover:text-slate-900 dark:hover:text-white"
              >
                Dashboard
              </Link>

              <ChevronRight className="h-3.5 w-3.5" />

              <span className="font-medium text-slate-700 dark:text-zinc-300">
                Settings
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Badge
                  variant="outline"
                  className="mb-3 rounded-full border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Owner Portal
                </Badge>

                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
                  Manage your notification
                  preferences and account
                  security.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                  Account protected
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="space-y-6">

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
                    checked={
                      ownerSettings.emailBookingRequests
                    }
                    onChange={(value) =>
                      updateSetting(
                        "emailBookingRequests",
                        value
                      )
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Building2}
                    title="Property updates"
                    description="Receive updates about your property listings and approval status."
                    checked={
                      ownerSettings.emailPropertyUpdates
                    }
                    onChange={(value) =>
                      updateSetting(
                        "emailPropertyUpdates",
                        value
                      )
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Globe2}
                    title="Marketing emails"
                    description="Receive occasional product news, tips and platform updates."
                    checked={
                      ownerSettings.emailMarketing
                    }
                    onChange={(value) =>
                      updateSetting(
                        "emailMarketing",
                        value
                      )
                    }
                  />

                  <Separator className="bg-slate-100 dark:bg-zinc-800" />

                  <SettingRow
                    icon={Smartphone}
                    title="Browser notifications"
                    description="Allow the dashboard to display browser notifications."
                    checked={
                      ownerSettings.browserNotifications
                    }
                    onChange={(value) =>
                      updateSetting(
                        "browserNotifications",
                        value
                      )
                    }
                  />

                </CardContent>
              </Card>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <SectionHeader
                  icon={LockKeyhole}
                  title="Security"
                  description="Manage your password and account security."
                />

                <CardContent className="p-5 sm:p-6">

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-900">
                        <LockKeyhole className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Password & account security
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                          Update your password and
                          account security information
                          from your profile.
                        </p>

                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          onClick={() =>
                            router.push(
                              "/dashboard/owner/profile"
                            )
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

              {/* =================================================
                  SAVE ACTIONS
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleReset
                  }
                  className="h-11 rounded-xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Reset defaults
                </Button>

                <Button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleSave
                  }
                  className="h-11 rounded-xl bg-slate-950 px-6 text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />

                      Save changes
                    </>
                  )}
                </Button>

              </div>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* =================================================
                  OWNER CARD
              ================================================= */}

              <Card className="overflow-hidden rounded-2xl border-zinc-800 bg-zinc-950 text-white shadow-lg dark:bg-zinc-950">

                <CardContent className="p-5">

                  <div className="flex items-center gap-3">

                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white text-sm font-bold text-zinc-950">

                      {profileImage ? (
                        <Image
                          src={
                            profileImage
                          }
                          alt={
                            user.name ||
                            "Owner profile"
                          }
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {initials}
                        </div>
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {user.name ||
                          "Property Owner"}
                      </p>

                      <p className="truncate text-xs text-zinc-500">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  <Separator className="my-5 bg-white/10" />

                  <div className="space-y-3 text-xs">

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">
                        Account type
                      </span>

                      <span className="font-semibold">
                        Owner
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">
                        Notifications
                      </span>

                      <span className="font-semibold">
                        {ownerSettings.emailBookingRequests ||
                        ownerSettings.emailPropertyUpdates
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">
                        Browser alerts
                      </span>

                      <span className="font-semibold">
                        {ownerSettings.browserNotifications
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>

                  </div>

                </CardContent>
              </Card>

              {/* =================================================
                  PROFILE CARD
              ================================================= */}

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <CardContent className="p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <UserRound className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Profile information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                        Update your name, photo
                        and password.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-9 rounded-lg border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        onClick={() =>
                          router.push(
                            "/dashboard/owner/profile"
                          )
                        }
                      >
                        Open Profile

                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>

                    </div>

                  </div>

                </CardContent>
              </Card>

              {/* =================================================
                  LOGOUT
              ================================================= */}

              <Card className="rounded-2xl border-red-100 bg-white shadow-sm dark:border-red-500/20 dark:bg-zinc-900">

                <CardHeader className="px-5 py-5">

                  <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Account actions
                  </CardTitle>

                  <CardDescription className="text-xs text-slate-500 dark:text-zinc-500">
                    Sign out from this device.
                  </CardDescription>

                </CardHeader>

                <CardContent className="px-5 pb-5">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleLogout
                    }
                    className="h-10 w-full rounded-xl border-red-200 bg-white text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />

                    Logout
                  </Button>

                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          TOAST
      ================================================= */}

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}