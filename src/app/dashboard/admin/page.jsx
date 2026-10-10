
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const cardClass =
  "rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

const headingClass =
  "text-sm font-bold text-zinc-900 dark:text-white";

const mutedClass =
  "text-xs text-zinc-500 dark:text-zinc-400";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Number(value || 0)
  );
}

function formatCurrency(value) {
  return `৳${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;
}

function getMonthName(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-US",
    { month: "short" }
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading,
}) {
  const content = (
    <div className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          ) : (
            <p className="mt-1.5 break-words text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {value}
            </p>
          )}

          <p className="mt-1.5 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
          <Icon size={18} />
        </div>
      </div>

      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
          View details
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickAction({ href, icon: Icon, title, description }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 transition hover:border-orange-200 hover:bg-orange-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-900 dark:hover:bg-orange-950/10"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-900 dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <ArrowRight
        size={15}
        className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
        <Icon size={16} />
      </div>

      <div>
        <h2 className={headingClass}>{title}</h2>
        <p className={mutedClass}>{description}</p>
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={15} />
        </div>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-zinc-950 dark:text-white">
        {formatNumber(value)}
      </span>
    </div>
  );
}

const approvedClass =
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
const pendingClass =
  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
const rejectedClass =
  "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
const neutralClass =
  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const getToken = useCallback(async () => {
    try {
      const result = await authClient.token();

      if (result?.error) {
        console.error("JWT token error:", result.error);
        return "";
      }

      return result?.data?.token || "";
    } catch (error) {
      console.error("Get JWT token error:", error);
      return "";
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const currentUser = session?.data?.user;

      if (!currentUser) {
        window.location.href = "/login";
        return null;
      }

      if (currentUser.role !== "admin") {
        window.location.href =
          currentUser.role === "owner"
            ? "/dashboard/owner"
            : "/dashboard/tenant";
        return null;
      }

      setAdmin(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Admin session error:", error);
      window.location.href = "/login";
      return null;
    }
  }, []);

  const fetchAnalytics = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const currentUser = await checkAdmin();
        if (!currentUser) return;

        const token = await getToken();

        if (!token) {
          toast.error("Unable to get JWT token. Please login again.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/admin/analytics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Failed to load admin analytics."
          );
        }

        setAnalytics(result?.data || null);
      } catch (error) {
        console.error("Admin analytics error:", error);
        toast.error(
          error.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [checkAdmin, getToken]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  const monthlyRevenueData = useMemo(() => {
    const monthly = analytics?.revenue?.monthly || [];
    const now = new Date();
    const months = [];

    for (let index = 11; index >= 0; index--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }

    return months.map(({ year, month }) => {
      const found = monthly.find(
        (item) =>
          Number(item.year) === year &&
          Number(item.month) === month
      );

      return {
        name: getMonthName(year, month),
        revenue: Number(found?.revenue || 0),
        transactions: Number(found?.transactions || 0),
      };
    });
  }, [analytics]);

  const propertyTypeData = useMemo(
    () => analytics?.properties?.byType || [],
    [analytics]
  );

  const userRoleData = useMemo(() => {
    const users = analytics?.users || {};

    return [
      { name: "Tenant", value: Number(users.tenants || 0) },
      { name: "Owner", value: Number(users.owners || 0) },
      { name: "Admin", value: Number(users.admins || 0) },
    ];
  }, [analytics]);

  const propertyStatusData = useMemo(() => {
    const properties = analytics?.properties || {};

    return [
      { name: "Approved", value: Number(properties.approved || 0) },
      { name: "Pending", value: Number(properties.pending || 0) },
      { name: "Rejected", value: Number(properties.rejected || 0) },
    ];
  }, [analytics]);

  const adminInitial =
    admin?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const summary = analytics?.summary || {};
  const users = analytics?.users || {};
  const properties = analytics?.properties || {};
  const bookings = analytics?.bookings || {};
  const transactions = analytics?.transactions || {};
  const revenue = analytics?.revenue || {};

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 dark:bg-zinc-950 sm:px-5 lg:px-6">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-orange-600 dark:text-orange-400">
                Admin
              </span>
            </div>

            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Welcome back,{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                {admin?.name || "Administrator"}
              </span>
              . Monitor your platform from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-orange-400 sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Welcome card */}
        <section className={`${cardClass} mb-4 overflow-hidden`}>
          <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-100/70 blur-3xl dark:bg-orange-500/10" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-base font-bold text-white shadow-sm shadow-orange-500/20">
                {adminInitial}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Platform Administration
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck size={11} />
                    Active Admin
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Overview of users, properties, bookings and transactions.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/admin/profile"
              className="relative inline-flex h-8 items-center justify-center gap-2 self-start rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-orange-400 sm:self-auto"
            >
              View Profile
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Main statistics */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={loading ? "—" : formatNumber(summary.totalUsers)}
            description={`${formatNumber(users.tenants)} tenants • ${formatNumber(users.owners)} owners`}
            icon={Users}
            href="/dashboard/admin/users"
            loading={loading}
          />

          <StatCard
            title="Total Properties"
            value={
              loading ? "—" : formatNumber(summary.totalProperties)
            }
            description={`${formatNumber(properties.approved)} approved • ${formatNumber(properties.pending)} pending`}
            icon={Building2}
            href="/dashboard/admin/properties"
            loading={loading}
          />

          <StatCard
            title="Total Bookings"
            value={loading ? "—" : formatNumber(summary.totalBookings)}
            description={`${formatNumber(bookings.approved)} approved • ${formatNumber(bookings.pending)} pending`}
            icon={CalendarCheck}
            href="/dashboard/admin/bookings"
            loading={loading}
          />

          <StatCard
            title="Total Revenue"
            value={
              loading ? "—" : formatCurrency(summary.totalRevenue)
            }
            description={`${formatNumber(transactions.paid)} paid transactions`}
            icon={TrendingUp}
            href="/dashboard/admin/transactions"
            loading={loading}
          />
        </div>

        {/* Revenue chart */}
        <section className={`${cardClass} mt-4 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={headingClass}>Revenue Overview</h2>
              <p className={mutedClass}>
                Successful payment revenue for the last 12 months.
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-500/10">
              <p className="text-[10px] font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Total Revenue
              </p>
              <p className="mt-0.5 text-sm font-bold text-zinc-950 dark:text-white">
                {loading ? "—" : formatCurrency(revenue.total)}
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full p-3 sm:h-[280px]">
            {loading ? (
              <div className="h-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRevenueData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f97316"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e4e4e7"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `৳${value}`}
                  />

                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e4e4e7",
                      fontSize: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Analytics charts */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className={`${cardClass} overflow-hidden`}>
            <SectionHeader
              icon={Users}
              title="User Distribution"
              description="Users by account role."
            />

            <div className="h-[240px] p-3">
              {loading ? (
                <div className="h-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      outerRadius={75}
                      innerRadius={43}
                      paddingAngle={3}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={["#f97316", "#fb923c", "#fed7aa"][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <SectionHeader
              icon={BarChart3}
              title="Properties by Type"
              description="Property inventory distribution."
            />

            <div className="h-[240px] p-3">
              {loading ? (
                <div className="h-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ) : propertyTypeData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  No property data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={propertyTypeData}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e4e4e7"
                    />
                    <XAxis
                      dataKey="type"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="Properties"
                      fill="#f97316"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        {/* Status overview */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className={`${cardClass} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className={headingClass}>Property Status</h2>
                <p className={mutedClass}>Current property moderation.</p>
              </div>
              <Building2 size={18} className="text-orange-500" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <StatusRow
                icon={CheckCircle2}
                label="Approved"
                value={properties.approved}
                iconClass={approvedClass}
              />
              <StatusRow
                icon={Clock3}
                label="Pending"
                value={properties.pending}
                iconClass={pendingClass}
              />
              <StatusRow
                icon={XCircle}
                label="Rejected"
                value={properties.rejected}
                iconClass={rejectedClass}
              />
            </div>

            <Link
              href="/dashboard/admin/properties"
              className="mt-3 flex h-8 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-orange-400"
            >
              Manage Properties <ArrowRight size={13} />
            </Link>
          </section>

          <section className={`${cardClass} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className={headingClass}>Booking Status</h2>
                <p className={mutedClass}>Current booking activity.</p>
              </div>
              <CalendarCheck size={18} className="text-orange-500" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <StatusRow
                icon={CheckCircle2}
                label="Approved"
                value={bookings.approved}
                iconClass={approvedClass}
              />
              <StatusRow
                icon={Clock3}
                label="Pending"
                value={bookings.pending}
                iconClass={pendingClass}
              />
              <StatusRow
                icon={XCircle}
                label="Rejected"
                value={bookings.rejected}
                iconClass={rejectedClass}
              />
              <StatusRow
                icon={CheckCircle2}
                label="Completed"
                value={bookings.completed}
                iconClass={neutralClass}
              />
            </div>

            <Link
              href="/dashboard/admin/bookings"
              className="mt-3 flex h-8 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-orange-400"
            >
              Manage Bookings <ArrowRight size={13} />
            </Link>
          </section>

          <section className={`${cardClass} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className={headingClass}>Transactions</h2>
                <p className={mutedClass}>Payment transaction overview.</p>
              </div>
              <CreditCard size={18} className="text-orange-500" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <StatusRow
                icon={CheckCircle2}
                label="Paid"
                value={transactions.paid}
                iconClass={approvedClass}
              />
              <StatusRow
                icon={Clock3}
                label="Pending"
                value={transactions.pending}
                iconClass={pendingClass}
              />
              <StatusRow
                icon={XCircle}
                label="Failed"
                value={transactions.failed}
                iconClass={rejectedClass}
              />
              <StatusRow
                icon={RefreshCw}
                label="Refunded"
                value={transactions.refunded}
                iconClass={neutralClass}
              />
            </div>

            <Link
              href="/dashboard/admin/transactions"
              className="mt-3 flex h-8 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-orange-400"
            >
              View Transactions <ArrowRight size={13} />
            </Link>
          </section>
        </div>

        {/* Quick actions */}
        <section className={`${cardClass} mt-4 p-4`}>
          <div className="mb-3">
            <h2 className={headingClass}>Quick Actions</h2>
            <p className={mutedClass}>
              Quickly access the main administration sections.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
              description="Monitor booking activities."
            />
            <QuickAction
              href="/dashboard/admin/transactions"
              icon={CreditCard}
              title="Transactions"
              description="Review platform payments."
            />
          </div>
        </section>

        {/* Admin notice */}
        <section className={`${cardClass} mt-4 flex items-start gap-3 p-4`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck size={18} />
          </div>

          <div>
            <h3 className={headingClass}>Administrator Access</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              You have administrator access to manage platform users,
              properties, bookings, and transactions. Dashboard statistics
              are loaded from the analytics API.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
