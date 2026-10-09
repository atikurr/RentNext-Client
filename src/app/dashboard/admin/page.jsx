"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { authClient } from "@/lib/auth-client";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading,
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {value}
            </p>
          )}

          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            {description}
          </p>

        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Icon size={21} />
        </div>

      </div>

      {href && (
        <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">

          View details

          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />

        </div>
      )}

    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

/*
|--------------------------------------------------------------------------
| QUICK ACTION
|--------------------------------------------------------------------------
*/

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-950"
    >

      <div className="flex min-w-0 items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Icon size={20} />
        </div>

        <div className="min-w-0">

          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {title}
          </p>

          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>

        </div>

      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1"
      />

    </Link>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS ROW
|--------------------------------------------------------------------------
*/

function StatusRow({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>

        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-zinc-950 dark:text-white">
        {value}
      </span>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FORMAT NUMBER
|--------------------------------------------------------------------------
*/

function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(Number(value || 0));
}

/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

function formatCurrency(value) {
  return `৳${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(Number(value || 0))}`;
}

/*
|--------------------------------------------------------------------------
| MONTH NAME
|--------------------------------------------------------------------------
*/

function getMonthName(
  year,
  month
) {
  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
    }
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

export default function AdminDashboardPage() {
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [admin, setAdmin] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | GET JWT TOKEN
  |--------------------------------------------------------------------------
  */

  const getToken = useCallback(
    async () => {
      try {
        const result =
          await authClient.token();

        if (result?.error) {
          console.error(
            "JWT token error:",
            result.error
          );

          return "";
        }

        return (
          result?.data?.token || ""
        );
      } catch (error) {
        console.error(
          "Get JWT token error:",
          error
        );

        return "";
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | CHECK ADMIN
  |--------------------------------------------------------------------------
  */

  const checkAdmin = useCallback(
    async () => {
      const session =
        await authClient.getSession();

      const currentUser =
        session?.data?.user;

      if (!currentUser) {
        window.location.href =
          "/login";

        return null;
      }

      if (
        currentUser.role !== "admin"
      ) {
        if (
          currentUser.role ===
          "owner"
        ) {
          window.location.href =
            "/dashboard/owner";
        } else {
          window.location.href =
            "/dashboard/tenant";
        }

        return null;
      }

      setAdmin(currentUser);

      return currentUser;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | FETCH ANALYTICS
  |--------------------------------------------------------------------------
  */

  const fetchAnalytics =
    useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const currentUser =
            await checkAdmin();

          if (!currentUser) {
            return;
          }

          const token =
            await getToken();

          if (!token) {
            toast.error(
              "Unable to get JWT token. Please login again."
            );

            return;
          }

          /*
          |--------------------------------------------------------------------------
          | ONE API CALL
          |--------------------------------------------------------------------------
          */

          const response =
            await fetch(
              `${API_URL}/api/admin/analytics`,
              {
                method: "GET",

                headers: {
                  Authorization: `Bearer ${token}`,
                },

                credentials: "include",
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
                "Failed to load admin analytics."
            );
          }

          setAnalytics(
            result?.data || null
          );
        } catch (error) {
          console.error(
            "Admin analytics error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to load dashboard data."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        checkAdmin,
        getToken,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchAnalytics();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAnalytics]);

  /*
  |--------------------------------------------------------------------------
  | MONTHLY REVENUE CHART DATA
  |--------------------------------------------------------------------------
  */

  const monthlyRevenueData =
    useMemo(() => {
      const monthly =
        analytics?.revenue?.monthly ||
        [];

      const now =
        new Date();

      const months = [];

      for (
        let index = 11;
        index >= 0;
        index--
      ) {
        const date =
          new Date(
            now.getFullYear(),
            now.getMonth() -
              index,
            1
          );

        months.push({
          year:
            date.getFullYear(),

          month:
            date.getMonth() + 1,
        });
      }

      return months.map(
        ({
          year,
          month,
        }) => {
          const found =
            monthly.find(
              (item) =>
                Number(
                  item.year
                ) === year &&
                Number(
                  item.month
                ) === month
            );

          return {
            name: getMonthName(
              year,
              month
            ),

            revenue:
              Number(
                found?.revenue || 0
              ),

            transactions:
              Number(
                found?.transactions ||
                  0
              ),
          };
        }
      );
    }, [analytics]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY TYPE CHART
  |--------------------------------------------------------------------------
  */

  const propertyTypeData =
    useMemo(() => {
      return (
        analytics?.properties
          ?.byType || []
      );
    }, [analytics]);

  /*
  |--------------------------------------------------------------------------
  | USER ROLE DATA
  |--------------------------------------------------------------------------
  */

  const userRoleData =
    useMemo(() => {
      const users =
        analytics?.users || {};

      return [
        {
          name: "Tenant",
          value:
            Number(
              users.tenants || 0
            ),
        },

        {
          name: "Owner",
          value:
            Number(
              users.owners || 0
            ),
        },

        {
          name: "Admin",
          value:
            Number(
              users.admins || 0
            ),
        },
      ];
    }, [analytics]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY PIE DATA
  |--------------------------------------------------------------------------
  */

  const propertyStatusData =
    useMemo(() => {
      const properties =
        analytics?.properties ||
        {};

      return [
        {
          name: "Approved",
          value:
            Number(
              properties.approved ||
                0
            ),
        },

        {
          name: "Pending",
          value:
            Number(
              properties.pending ||
                0
            ),
        },

        {
          name: "Rejected",
          value:
            Number(
              properties.rejected ||
                0
            ),
        },
      ];
    }, [analytics]);

  /*
  |--------------------------------------------------------------------------
  | ADMIN INITIAL
  |--------------------------------------------------------------------------
  */

  const adminInitial =
    admin?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    "A";

  /*
  |--------------------------------------------------------------------------
  | SAFE DATA
  |--------------------------------------------------------------------------
  */

  const summary =
    analytics?.summary || {};

  const users =
    analytics?.users || {};

  const properties =
    analytics?.properties || {};

  const bookings =
    analytics?.bookings || {};

  const payments =
    analytics?.payments || {};

  const transactions =
    analytics?.transactions || {};

  const revenue =
    analytics?.revenue || {};

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

      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">

              <span>
                Dashboard
              </span>

              <span>
                /
              </span>

              <span className="text-zinc-600 dark:text-zinc-300">
                Admin
              </span>

            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back,{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                {admin?.name ||
                  "Administrator"}
              </span>
              . Monitor your entire platform from one place.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              fetchAnalytics(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

        {/* ======================================================
            WELCOME CARD
        ====================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="relative p-6 sm:p-7">

            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-zinc-100 blur-3xl dark:bg-zinc-800" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-bold text-white dark:bg-white dark:text-zinc-950">
                  {adminInitial}
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                      Platform Administration
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">

                      <ShieldCheck
                        size={12}
                      />

                      Active Admin

                    </span>

                  </div>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Real-time overview of users, properties, bookings and transactions.
                  </p>

                </div>

              </div>

              <Link
                href="/dashboard/admin/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >

                View Profile

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>

          </div>

        </div>

        {/* ======================================================
            MAIN STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Users"
            value={
              loading
                ? "—"
                : formatNumber(
                    summary.totalUsers
                  )
            }
            description={`${formatNumber(
              users.tenants
            )} tenants • ${formatNumber(
              users.owners
            )} owners`}
            icon={Users}
            href="/dashboard/admin/users"
            loading={loading}
          />

          <StatCard
            title="Total Properties"
            value={
              loading
                ? "—"
                : formatNumber(
                    summary.totalProperties
                  )
            }
            description={`${formatNumber(
              properties.approved
            )} approved • ${formatNumber(
              properties.pending
            )} pending`}
            icon={Building2}
            href="/dashboard/admin/properties"
            loading={loading}
          />

          <StatCard
            title="Total Bookings"
            value={
              loading
                ? "—"
                : formatNumber(
                    summary.totalBookings
                  )
            }
            description={`${formatNumber(
              bookings.approved
            )} approved • ${formatNumber(
              bookings.pending
            )} pending`}
            icon={CalendarCheck}
            href="/dashboard/admin/bookings"
            loading={loading}
          />

          <StatCard
            title="Total Revenue"
            value={
              loading
                ? "—"
                : formatCurrency(
                    summary.totalRevenue
                  )
            }
            description={`${formatNumber(
              transactions.paid
            )} paid transactions`}
            icon={TrendingUp}
            href="/dashboard/admin/transactions"
            loading={loading}
          />

        </div>

        {/* ======================================================
            REVENUE CHART
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="flex flex-col gap-3 border-b border-zinc-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">

            <div>

              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Revenue Overview
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Successful payment revenue for the last 12 months.
              </p>

            </div>

            <div className="rounded-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800">

              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Total Revenue
              </p>

              <p className="mt-0.5 text-sm font-bold text-zinc-950 dark:text-white">
                {loading
                  ? "—"
                  : formatCurrency(
                      revenue.total
                    )}
              </p>

            </div>

          </div>

          <div className="h-[330px] w-full p-4 sm:p-6">

            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={
                    monthlyRevenueData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(
                      value
                    ) =>
                      `৳${value}`
                    }
                  />

                  <Tooltip
                    formatter={(
                      value
                    ) =>
                      formatCurrency(
                        value
                      )
                    }
                    labelStyle={{
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    strokeWidth={2}
                    fillOpacity={0.15}
                  />

                </AreaChart>

              </ResponsiveContainer>
            )}

          </div>

        </section>

        {/* ======================================================
            ANALYTICS GRID
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* USER ROLES */}

          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                  <Users
                    size={19}
                    className="text-zinc-700 dark:text-zinc-200"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    User Distribution
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Users by account role.
                  </p>

                </div>

              </div>

            </div>

            <div className="h-[300px] p-4">

              {loading ? (
                <div className="h-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        userRoleData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                    >

                      {userRoleData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              [
                                "#18181b",
                                "#71717a",
                                "#a1a1aa",
                              ][
                                index %
                                  3
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>
              )}

            </div>

          </section>

          {/* PROPERTY TYPES */}

          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">

                  <BarChart3
                    size={19}
                    className="text-zinc-700 dark:text-zinc-200"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Properties by Type
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Property inventory distribution.
                  </p>

                </div>

              </div>

            </div>

            <div className="h-[300px] p-4">

              {loading ? (
                <div className="h-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              ) : propertyTypeData.length ===
                0 ? (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  No property data available.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      propertyTypeData
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="type"
                      tick={{
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      name="Properties"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>
              )}

            </div>

          </section>

        </div>

        {/* ======================================================
            STATUS OVERVIEW
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* PROPERTY STATUS */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Property Status
                </h2>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Current property moderation.
                </p>

              </div>

              <Building2
                size={20}
                className="text-zinc-400"
              />

            </div>

            <div className="space-y-4">

              <StatusRow
                icon={CheckCircle2}
                label="Approved"
                value={formatNumber(
                  properties.approved
                )}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              />

              <StatusRow
                icon={Clock3}
                label="Pending"
                value={formatNumber(
                  properties.pending
                )}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              />

              <StatusRow
                icon={XCircle}
                label="Rejected"
                value={formatNumber(
                  properties.rejected
                )}
                iconClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              />

            </div>

            <Link
              href="/dashboard/admin/properties"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >

              Manage Properties

              <ArrowRight
                size={16}
              />

            </Link>

          </section>

          {/* BOOKING STATUS */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Booking Status
                </h2>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Current booking activity.
                </p>

              </div>

              <CalendarCheck
                size={20}
                className="text-zinc-400"
              />

            </div>

            <div className="space-y-4">

              <StatusRow
                icon={CheckCircle2}
                label="Approved"
                value={formatNumber(
                  bookings.approved
                )}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              />

              <StatusRow
                icon={Clock3}
                label="Pending"
                value={formatNumber(
                  bookings.pending
                )}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              />

              <StatusRow
                icon={XCircle}
                label="Rejected"
                value={formatNumber(
                  bookings.rejected
                )}
                iconClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              />

              <StatusRow
                icon={CheckCircle2}
                label="Completed"
                value={formatNumber(
                  bookings.completed
                )}
                iconClass="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              />

            </div>

            <Link
              href="/dashboard/admin/bookings"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >

              Manage Bookings

              <ArrowRight
                size={16}
              />

            </Link>

          </section>

          {/* TRANSACTION STATUS */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Transactions
                </h2>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Payment transaction overview.
                </p>

              </div>

              <CreditCard
                size={20}
                className="text-zinc-400"
              />

            </div>

            <div className="space-y-4">

              <StatusRow
                icon={CheckCircle2}
                label="Paid"
                value={formatNumber(
                  transactions.paid
                )}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              />

              <StatusRow
                icon={Clock3}
                label="Pending"
                value={formatNumber(
                  transactions.pending
                )}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              />

              <StatusRow
                icon={XCircle}
                label="Failed"
                value={formatNumber(
                  transactions.failed
                )}
                iconClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              />

              <StatusRow
                icon={RefreshCw}
                label="Refunded"
                value={formatNumber(
                  transactions.refunded
                )}
                iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
              />

            </div>

            <Link
              href="/dashboard/admin/transactions"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >

              View Transactions

              <ArrowRight
                size={16}
              />

            </Link>

          </section>

        </div>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Quickly access the main administration sections.
            </p>

          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

            <QuickAction
              href="/dashboard/admin/users"
              icon={Users}
              title="Manage Users"
              description="View users and change roles."
            />

            <QuickAction
              href="/dashboard/admin/properties"
              icon={Building2}
              title="Manage Properties"
              description="Approve, reject or manage properties."
            />

            <QuickAction
              href="/dashboard/admin/bookings"
              icon={CalendarCheck}
              title="Manage Bookings"
              description="Monitor and manage booking activities."
            />

            <QuickAction
              href="/dashboard/admin/transactions"
              icon={CreditCard}
              title="Transactions"
              description="Review platform payment transactions."
            />

          </div>

        </section>

        {/* ======================================================
            ADMIN NOTICE
        ====================================================== */}

        <div className="mt-6 flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">

            <ShieldCheck
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />

          </div>

          <div>

            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Administrator Access
            </h3>

            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              You have administrator access to manage platform users,
              properties, bookings, and transactions. Dashboard statistics
              are calculated directly from the database.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}