
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  X,
  RefreshCw,
  UserCheck,
  UserCog,
  UsersRound,
  CalendarDays,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getUserId(user) {
  if (!user) return "";
  if (user.id) return String(user.id);
  if (user._id) return String(user._id);
  return "";
}

function RoleBadge({ role }) {
  const config = {
    admin: {
      label: "Admin",
      icon: ShieldCheck,
      classes:
        "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/20",
    },
    owner: {
      label: "Owner",
      icon: Building2,
      classes:
        "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
    },
    tenant: {
      label: "Tenant",
      icon: UserRound,
      classes:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    },
  };

  const item = config[role] || config.tenant;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${item.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="animate-pulse border-b border-slate-100 p-4 last:border-0 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800" />

        <div className="flex-1">
          <div className="h-3.5 w-36 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="mt-2 h-3 w-48 max-w-full rounded bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function UserAvatar({ user, size = 42 }) {
  const image = user?.image || user?.photo || "";
  const name = user?.name || "User";

  if (!image) {
    return (
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 dark:bg-orange-500/10"
        style={{ width: size, height: size }}
      >
        <UserRound className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800"
      style={{ width: size, height: size }}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes={`${size}px`}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

function EmptyState({ search, role }) {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
        <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        No users found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-zinc-400">
        {search || role !== "all"
          ? "Try changing your search keywords or role filter."
          : "Registered users will appear here."}
      </p>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [stats, setStats] = useState({
    total: 0,
    tenants: 0,
    owners: 0,
    admins: 0,
  });

  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState("tenant");

  const getToken = useCallback(async () => {
    const result = await authClient.token();

    if (result?.error) {
      throw new Error(
        result.error.message ||
          "Authentication token could not be generated."
      );
    }

    const token = result?.data?.token;

    if (!token) {
      throw new Error(
        "Authentication token is missing. Please login again."
      );
    }

    return token;
  }, []);

  const loadUsers = useCallback(
    async (requestedPage = 1, showToast = true) => {
      try {
        setLoading(true);

        const token = await getToken();
        const params = new URLSearchParams();

        params.set("page", String(requestedPage));
        params.set("limit", "10");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (role !== "all") {
          params.set("role", role);
        }

        const response = await fetch(
          `${API_URL}/api/admin/users?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load users.");
        }

        setUsers(data?.data || []);

        setPagination(
          data?.pagination || {
            currentPage: 1,
            limit: 10,
            totalUsers: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );

        setStats(
          data?.stats || {
            total: 0,
            tenants: 0,
            owners: 0,
            admins: 0,
          }
        );
      } catch (error) {
        console.error("Admin users load error:", error);

        if (showToast) {
          toast.error(error.message || "Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    },
    [getToken, search, role]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  const openRoleModal = useCallback((user) => {
    const userId = getUserId(user);

    if (!userId) {
      toast.error("This user does not have a valid ID.");
      return;
    }

    setRoleModal({
      ...user,
      resolvedId: userId,
    });

    setSelectedRole(user.role === "owner" ? "owner" : "tenant");
  }, []);

  const closeRoleModal = useCallback(() => {
    if (actionLoading) return;
    setRoleModal(null);
  }, [actionLoading]);

  const handleRoleChange = useCallback(async () => {
    const userId = roleModal?.resolvedId || getUserId(roleModal);

    if (!userId) {
      toast.error("User ID is missing.");
      return;
    }

    if (!["tenant", "owner"].includes(selectedRole)) {
      toast.error("Invalid role selected.");
      return;
    }

    try {
      setActionLoading(userId);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/admin/users/${encodeURIComponent(userId)}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update role.");
      }

      toast.success("User role updated successfully.");
      setRoleModal(null);
      await loadUsers(page);
    } catch (error) {
      console.error("Change user role error:", error);
      toast.error(error.message || "Failed to update user role.");
    } finally {
      setActionLoading("");
    }
  }, [roleModal, selectedRole, getToken, loadUsers, page]);

  const handlePageChange = useCallback(
    (nextPage) => {
      if (
        nextPage < 1 ||
        nextPage > pagination.totalPages
      ) {
        return;
      }

      setPage(nextPage);
      loadUsers(nextPage);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [pagination.totalPages, loadUsers]
  );

  const formatDate = useCallback((date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  return (
    <div className="min-h-full bg-[#f1f3f5] text-slate-900 transition-colors duration-200 dark:bg-[#09090b] dark:text-zinc-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:p-4 lg:p-5">
        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                Users
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              All Users
            </h1>

            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Manage accounts, review user roles and monitor registrations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadUsers(page)}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-orange-500"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total ?? 0}
            icon={Users}
            color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
            description="All registered accounts"
          />

          <StatCard
            title="Tenants"
            value={stats.tenants ?? 0}
            icon={UserCheck}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            description="Property seekers"
          />

          <StatCard
            title="Property Owners"
            value={stats.owners ?? 0}
            icon={Building2}
            color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            description="Property managers"
          />

          <StatCard
            title="Administrators"
            value={stats.admins ?? 0}
            icon={Shield}
            color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
            description="Protected accounts"
          />
        </div>

        {/* SEARCH AND FILTERS */}
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="user-role-filter"
                className="shrink-0 text-xs font-medium text-slate-500 dark:text-zinc-400"
              >
                Role
              </label>

              <select
                id="user-role-filter"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white sm:min-w-[150px]"
              >
                <option value="all">All Roles</option>
                <option value="tenant">Tenant</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </section>

        {/* USER DIRECTORY */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                User Directory
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                {pagination.totalUsers || 0} registered users
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[11px] font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              <UsersRound className="h-3.5 w-3.5" />
              {users.length} shown on this page
            </div>
          </div>

          {loading ? (
            <div>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </div>
          ) : users.length === 0 ? (
            <EmptyState search={search} role={role} />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950">
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        User
                      </th>

                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Role
                      </th>

                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Registered
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {users.map((user, index) => {
                      const userId = getUserId(user);

                      return (
                        <tr
                          key={userId || user.email || index}
                          className="transition-colors hover:bg-orange-50/50 dark:hover:bg-white/[0.025]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex min-w-[230px] items-center gap-3">
                              <UserAvatar user={user} size={38} />

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                  {user.name || "Unnamed User"}
                                </p>

                                <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <RoleBadge role={user.role} />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!userId}
                                onClick={() => openRoleModal(user)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 text-[11px] font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:opacity-50 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                              >
                                <UserCog className="h-3.5 w-3.5" />
                                Change Role
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET USER CARDS */}
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 lg:hidden">
                {users.map((user, index) => {
                  const userId = getUserId(user);

                  return (
                    <div
                      key={userId || user.email || index}
                      className="p-3 transition-colors hover:bg-orange-50/40 dark:hover:bg-white/[0.02] sm:p-4"
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar user={user} size={42} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500 dark:text-zinc-400">
                            {user.email || "No email"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <RoleBadge role={user.role} />

                            <span className="text-[10px] text-slate-500 dark:text-zinc-500">
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>

                        {user.role === "admin" ? (
                          <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                        ) : (
                          <button
                            type="button"
                            disabled={!userId}
                            onClick={() => openRoleModal(user)}
                            aria-label={`Change role for ${user.name || user.email}`}
                            title="Change role"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100 disabled:opacity-50 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                          >
                            <UserCog className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PAGINATION */}
          {!loading && pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Page{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pagination.currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pagination.totalPages}
                </span>
              </p>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() =>
                      handlePageChange(pagination.currentPage - 1)
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-orange-500"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>

                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-orange-500 px-2.5 text-xs font-bold text-white">
                    {pagination.currentPage}
                  </span>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      handlePageChange(pagination.currentPage + 1)
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-orange-500"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* CHANGE ROLE MODAL */}
      {roleModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRoleModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>

                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Change User Role
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-400">
                  Update the account type for{" "}
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {roleModal.name || roleModal.email}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={closeRoleModal}
                disabled={Boolean(actionLoading)}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <label
                htmlFor="change-user-role"
                className="mb-2 block text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Account Role
              </label>

              <select
                id="change-user-role"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
              >
                <option value="tenant">Tenant</option>
                <option value="owner">Owner</option>
              </select>

              <div className="mt-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-500/10">
                <p className="text-[11px] leading-5 text-orange-800 dark:text-orange-300">
                  Administrator accounts are protected and cannot be changed from this interface.
                </p>
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={closeRoleModal}
                  disabled={Boolean(actionLoading)}
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRoleChange}
                  disabled={Boolean(actionLoading)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}

                  {actionLoading ? "Saving..." : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
