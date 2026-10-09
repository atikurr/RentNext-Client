"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  Plus,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

/* =========================================================
   COLORS
========================================================= */

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fff7ed";
const NAVY = "#172033";

/* =========================================================
   BUTTON STYLES
========================================================= */

const primaryButton =
  "group inline-flex h-11 min-w-[150px] shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold leading-none text-white shadow-[0_6px_18px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_10px_28px_rgba(249,115,22,0.28)] active:translate-y-0 active:scale-[0.98]";

const outlineButton =
  "group inline-flex h-11 min-w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium leading-none text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md active:translate-y-0 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-orange-500/50 dark:hover:bg-zinc-800 dark:hover:text-orange-400";

const ghostButton =
  "group inline-flex h-9 min-w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium leading-none text-slate-500 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.97] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-400";

const plusIcon =
  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-90";

const arrowIcon =
  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

const smallArrowIcon =
  "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "orange",
}) {
  const iconStyles =
    accent === "green"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
      : accent === "blue"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      : accent === "purple"
      ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
      : "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";

  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              {title}
            </p>

            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
              {value}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

              <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                {description}
              </span>
            </div>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${iconStyles}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  if (status === "Approved") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
      >
        <CheckCircle2 className="mr-1.5 h-3 w-3" />
        Approved
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
      >
        <Clock3 className="mr-1.5 h-3 w-3" />
        Pending
      </Badge>
    );
  }

  if (status === "Rejected") {
    return (
      <Badge
        variant="outline"
        className="inline-flex items-center whitespace-nowrap rounded-full border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-300"
      >
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="whitespace-nowrap rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
    >
      {status || "Unknown"}
    </Badge>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-[#f7f8fa] dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="animate-pulse">
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-3 h-8 w-72 rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />

          <div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        </div>

        <div className="mt-6 h-[330px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      </div>
    </div>
  );
}

/* =========================================================
   OWNER DASHBOARD
========================================================= */

export default function OwnerDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  /* =========================================================
     WATCH THEME CHANGES
  ========================================================= */

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =========================================================
     LOAD ANALYTICS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const tokenResponse = await authClient.token();
        const token = tokenResponse?.data?.token;

        if (!token) {
          throw new Error("Authentication token is missing.");
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${API_URL}/api/owner/analytics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load owner analytics."
          );
        }

        if (cancelled) return;

        setAnalytics(data?.analytics || null);
      } catch (error) {
        console.error("Owner analytics loading error:", error);

        if (!cancelled) {
          toast.error(
            error?.message || "Failed to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     CURRENT MONTH
  ========================================================= */

  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date());
  }, []);

  /* =========================================================
     CURRENT DATE
  ========================================================= */

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  const formatCurrency = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
  };

  /* =========================================================
     DATA
  ========================================================= */

  const totalEarnings = analytics?.totalEarnings || 0;
  const totalProperties = analytics?.totalProperties || 0;
  const totalBookings = analytics?.totalBookings || 0;
  const activeTenants = analytics?.activeTenants || 0;
  const pendingRequests = analytics?.pendingRequests || 0;
  const monthlyEarnings = analytics?.monthlyEarnings || [];
  const recentProperties = analytics?.recentProperties || [];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme={isDark ? "dark" : "light"}
        />

        <DashboardSkeleton />
      </>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-full bg-[#f7f8fa] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* WELCOME */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
              Owner Dashboard
            </div>

            <p className="mb-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
              {currentDate}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl lg:text-4xl">
              Welcome back, Owner
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Here&apos;s what&apos;s happening with your properties today.
            </p>
          </div>

          <Link
            href="/dashboard/owner/add-property"
            className={primaryButton}
          >
            <Plus className={plusIcon} />
            <span className="whitespace-nowrap">Add Property</span>
          </Link>
        </div>

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(totalEarnings)}
            description="Successful payments"
            icon={DollarSign}
            accent="orange"
          />

          <StatCard
            title="Total Properties"
            value={totalProperties.toLocaleString()}
            description="Your property listings"
            icon={Building2}
            accent="blue"
          />

          <StatCard
            title="Total Bookings"
            value={totalBookings.toLocaleString()}
            description="Approved & completed"
            icon={CalendarCheck}
            accent="purple"
          />

          <StatCard
            title="Active Tenants"
            value={activeTenants.toLocaleString()}
            description="Confirmed tenants"
            icon={Users}
            accent="green"
          />
        </div>

        {/* MAIN ANALYTICS */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* EARNINGS */}

          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Earnings Overview
                </CardTitle>

                <CardDescription className="mt-1 text-slate-500 dark:text-zinc-400">
                  Your monthly earnings for the last 12 months
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="inline-flex w-fit items-center whitespace-nowrap rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
              >
                Last 12 months
              </Badge>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyEarnings}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="rentNestEarningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={ORANGE}
                          stopOpacity={0.28}
                        />

                        <stop
                          offset="100%"
                          stopColor={ORANGE}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke={isDark ? "#3f3f46" : "#e2e8f0"}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{
                        fill: isDark ? "#a1a1aa" : "#64748b",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{
                        fill: isDark ? "#a1a1aa" : "#64748b",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        `৳${Number(value) / 1000}k`
                      }
                    />

                    <Tooltip
                      cursor={{
                        strokeDasharray: "4 4",
                        stroke: isDark ? "#52525b" : "#cbd5e1",
                      }}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Earnings",
                      ]}
                      contentStyle={{
                        borderRadius: "14px",
                        border: isDark
                          ? "1px solid #3f3f46"
                          : "1px solid #e2e8f0",
                        background: isDark ? "#18181b" : "#ffffff",
                        color: isDark ? "#f4f4f5" : NAVY,
                        boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke={ORANGE}
                      strokeWidth={3}
                      fill="url(#rentNestEarningsGradient)"
                      activeDot={{
                        r: 5,
                        fill: ORANGE,
                        stroke: isDark ? "#18181b" : "#ffffff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PERFORMANCE */}

          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-base text-slate-900 dark:text-zinc-100">
                Performance Summary
              </CardTitle>

              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Your property business at a glance
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              {/* PENDING */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">
                      Pending Requests
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                      Need your attention
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {pendingRequests}
                </span>
              </div>

              <Separator className="dark:bg-zinc-800" />

              {/* PROPERTIES */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">
                      Total Properties
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                      Your listings
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold text-slate-900 dark:text-zinc-100">
                  {totalProperties}
                </span>
              </div>

              <Separator className="dark:bg-zinc-800" />

              {/* BOOKINGS */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                    <CalendarCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">
                      Confirmed Bookings
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                      Approved & completed
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold text-slate-900 dark:text-zinc-100">
                  {totalBookings}
                </span>
              </div>

              <Separator className="dark:bg-zinc-800" />

              {/* THIS MONTH */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <WalletCards className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">
                      This Month
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                      {currentMonthName} earnings
                    </p>
                  </div>
                </div>

                <span className="shrink-0 font-semibold text-slate-900 dark:text-zinc-100">
                  {formatCurrency(
                    monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0
                  )}
                </span>
              </div>

              <Link
                href="/dashboard/owner/analytics"
                className={`${outlineButton} mt-2 w-full`}
              >
                <span className="whitespace-nowrap">
                  View Detailed Analytics
                </span>

                <ArrowUpRight className={arrowIcon} />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* RECENT PROPERTIES */}

        <Card className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-zinc-100">
                Recent Properties
              </CardTitle>

              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Your latest property listings
              </CardDescription>
            </div>

            <Link
              href="/dashboard/owner/properties"
              className={outlineButton}
            >
              <span className="whitespace-nowrap">View All</span>

              <ArrowUpRight className={smallArrowIcon} />
            </Link>
          </CardHeader>

          <CardContent>
            {recentProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
                  <Building2 className="h-6 w-6 text-orange-500" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  No properties yet
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-zinc-400">
                  Add your first property to start receiving booking requests.
                </p>

                <Link
                  href="/dashboard/owner/add-property"
                  className={`${primaryButton} mt-5`}
                >
                  <Plus className={plusIcon} />

                  <span className="whitespace-nowrap">Add Property</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProperties.map((property, index) => (
                  <div key={property.id}>
                    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                          <Building2 className="h-5 w-5 text-orange-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {property.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-zinc-400">
                            {property.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
                        {/* RENT */}

                        <div className="hidden text-right md:block">
                          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {formatCurrency(property.rent)}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {property.rentType || "Monthly"}
                          </p>
                        </div>

                        {/* BOOKINGS */}

                        <div className="hidden text-right lg:block">
                          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {property.bookings}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Bookings
                          </p>
                        </div>

                        {/* STATUS */}

                        <StatusBadge status={property.status} />

                        {/* VIEW */}

                        <Link
                          href={`/dashboard/owner/properties/${property.id}/edit`}
                          className={ghostButton}
                        >
                          <span className="whitespace-nowrap">View</span>

                          <ArrowUpRight className={smallArrowIcon} />
                        </Link>
                      </div>
                    </div>

                    {index < recentProperties.length - 1 && (
                      <Separator className="bg-slate-100 dark:bg-zinc-800" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOTTOM CTA */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-[0_10px_30px_rgba(249,115,22,0.16)] sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                Grow your rental business
              </div>

              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Add another property today.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50">
                List your property and connect with potential tenants through
                RentNest.
              </p>
            </div>

            <Link
              href="/dashboard/owner/add-property"
              className="group inline-flex h-11 min-w-[150px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold leading-none text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className={plusIcon} />

              <span className="whitespace-nowrap">Add Property</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}