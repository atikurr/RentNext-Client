"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
} from "lucide-react";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

const API_URL = "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| GET USER ID
|--------------------------------------------------------------------------
*/

function getUserId(user) {
  if (!user) {
    return "";
  }

  if (user.id) {
    return String(user.id);
  }

  if (user._id) {
    return String(user._id);
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| ROLE BADGE
|--------------------------------------------------------------------------
*/

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin
      </span>
    );
  }

  if (role === "owner") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
        <Building2 className="h-3.5 w-3.5" />
        Owner
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
      <UserRound className="h-3.5 w-3.5" />
      Tenant
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING ROW
|--------------------------------------------------------------------------
*/

function LoadingRow() {
  return (
    <div className="animate-pulse border-b border-zinc-100 p-5 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-2 h-3 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| USER AVATAR
|--------------------------------------------------------------------------
*/

function UserAvatar({
  user,
  size = 44,
}) {
  const image =
    user?.image ||
    user?.photo ||
    "";

  const name =
    user?.name ||
    "User";

  if (!image) {
    return (
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        style={{
          width: size,
          height: size,
        }}
      >
        <UserRound className="h-5 w-5 text-zinc-500" />
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
      style={{
        width: size,
        height: size,
      }}
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

/*
|--------------------------------------------------------------------------
| ADMIN USERS PAGE
|--------------------------------------------------------------------------
*/

export default function AdminUsersPage() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      limit: 10,
      totalUsers: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [stats, setStats] =
    useState({
      total: 0,
      tenants: 0,
      owners: 0,
      admins: 0,
    });

  const [roleModal, setRoleModal] =
    useState(null);

  const [selectedRole, setSelectedRole] =
    useState("tenant");

  /*
  |--------------------------------------------------------------------------
  | GET TOKEN
  |--------------------------------------------------------------------------
  */

  const getToken = useCallback(
    async () => {
      const result =
        await authClient.token();

      if (result?.error) {
        throw new Error(
          result.error.message ||
            "Authentication token could not be generated."
        );
      }

      const token =
        result?.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      return token;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

  const loadUsers = useCallback(
    async (requestedPage = 1) => {
      try {
        setLoading(true);

        const token =
          await getToken();

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(requestedPage)
        );

        params.set(
          "limit",
          "10"
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (role !== "all") {
          params.set(
            "role",
            role
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/admin/users?${params.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load users."
          );
        }

        setUsers(
          data?.data || []
        );

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
        console.error(
          "Admin users load error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      getToken,
      search,
      role,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setPage(1);
        loadUsers(1);
      }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [loadUsers]);

  /*
  |--------------------------------------------------------------------------
  | OPEN ROLE MODAL
  |--------------------------------------------------------------------------
  */

  const openRoleModal = useCallback(
    (user) => {
      const userId =
        getUserId(user);

      console.log(
        "Selected user:",
        user
      );

      console.log(
        "Selected user ID:",
        userId
      );

      if (!userId) {
        toast.error(
          "This user does not have a valid ID."
        );

        return;
      }

      setRoleModal({
        ...user,
        resolvedId: userId,
      });

      setSelectedRole(
        user.role === "owner"
          ? "owner"
          : "tenant"
      );
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | CLOSE ROLE MODAL
  |--------------------------------------------------------------------------
  */

  const closeRoleModal = useCallback(
    () => {
      if (actionLoading) {
        return;
      }

      setRoleModal(null);
    },
    [actionLoading]
  );

  /*
  |--------------------------------------------------------------------------
  | CHANGE ROLE
  |--------------------------------------------------------------------------
  */

  const handleRoleChange =
    useCallback(
      async () => {
        const userId =
          roleModal?.resolvedId ||
          getUserId(roleModal);

        console.log(
          "Role change user ID:",
          userId
        );

        if (!userId) {
          toast.error(
            "User ID is missing."
          );

          return;
        }

        if (
          !["tenant", "owner"].includes(
            selectedRole
          )
        ) {
          toast.error(
            "Invalid role selected."
          );

          return;
        }

        try {
          setActionLoading(
            userId
          );

          const token =
            await getToken();

          const response =
            await fetch(
              `${API_URL}/api/admin/users/${encodeURIComponent(
                userId
              )}/role`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body: JSON.stringify({
                  role:
                    selectedRole,
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to update role."
            );
          }

          toast.success(
            "User role updated successfully."
          );

          setRoleModal(null);

          await loadUsers(page);
        } catch (error) {
          console.error(
            "Change user role error:",
            error
          );

          toast.error(
            error.message ||
              "Failed to update user role."
          );
        } finally {
          setActionLoading("");
        }
      },
      [
        roleModal,
        selectedRole,
        getToken,
        loadUsers,
        page,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const handlePageChange =
    useCallback(
      (nextPage) => {
        if (
          nextPage < 1 ||
          nextPage >
            pagination.totalPages
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
      [
        pagination.totalPages,
        loadUsers,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate =
    useCallback((date) => {
      if (!date) {
        return "—";
      }

      return new Date(
        date
      ).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full bg-zinc-50/70 dark:bg-zinc-950">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}

        <div className="mb-7">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Account Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
            All Users
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage tenants, owners and
            administrator accounts.
          </p>
        </div>

        {/* STATS */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={Users}
            iconClass="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          />

          <StatCard
            title="Tenants"
            value={stats.tenants}
            icon={UserRound}
            iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          />

          <StatCard
            title="Owners"
            value={stats.owners}
            icon={Building2}
            iconClass="bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
          />

          <StatCard
            title="Admins"
            value={stats.admins}
            icon={ShieldCheck}
            iconClass="bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
          />
        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name or email..."
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />
            </div>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            >
              <option value="all">
                All Roles
              </option>

              <option value="tenant">
                Tenant
              </option>

              <option value="owner">
                Owner
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>
        </div>

        {/* USERS */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
              User Directory
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              {pagination.totalUsers ||
                0}{" "}
              registered users
            </p>
          </div>

          {loading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Users className="h-7 w-7 text-zinc-500" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
                No users found
              </h3>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Try changing your search or
                role filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-left dark:border-zinc-800 dark:bg-zinc-950/50">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        User
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Joined
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map(
                      (user) => {
                        const userId =
                          getUserId(
                            user
                          );

                        return (
                          <tr
                            key={
                              userId ||
                              user.email
                            }
                            className="border-b border-zinc-100 transition hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-950/50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  user={
                                    user
                                  }
                                  size={
                                    44
                                  }
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                                    {user.name ||
                                      "Unnamed User"}
                                  </p>

                                  <p className="truncate text-xs text-zinc-400">
                                    {user.email ||
                                      "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <RoleBadge
                                role={
                                  user.role
                                }
                              />
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                              {formatDate(
                                user.createdAt
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              {user.role ===
                              "admin" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                                  <Shield className="h-3.5 w-3.5" />
                                  Protected
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={
                                    !userId
                                  }
                                  onClick={() =>
                                    openRoleModal(
                                      user
                                    )
                                  }
                                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  Change Role
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="divide-y divide-zinc-100 lg:hidden dark:divide-zinc-800">
                {users.map(
                  (user) => {
                    const userId =
                      getUserId(
                        user
                      );

                    return (
                      <div
                        key={
                          userId ||
                          user.email
                        }
                        className="p-5"
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar
                            user={
                              user
                            }
                            size={
                              44
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                              {user.name ||
                                "Unnamed User"}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-400">
                              {user.email ||
                                "No email"}
                            </p>

                            <div className="mt-3">
                              <RoleBadge
                                role={
                                  user.role
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-zinc-400">
                            Joined{" "}
                            {formatDate(
                              user.createdAt
                            )}
                          </p>

                          {user.role ===
                          "admin" ? (
                            <span className="text-xs font-medium text-zinc-400">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                !userId
                              }
                              onClick={() =>
                                openRoleModal(
                                  user
                                )
                              }
                              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                            >
                              Change Role
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* PAGINATION */}

              {pagination.totalPages >
                1 && (
                <div className="flex items-center justify-center gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
                  <button
                    type="button"
                    disabled={
                      !pagination.hasPreviousPage
                    }
                    onClick={() =>
                      handlePageChange(
                        pagination.currentPage -
                          1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-zinc-950 px-3 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
                    {
                      pagination.currentPage
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      !pagination.hasNextPage
                    }
                    onClick={() =>
                      handlePageChange(
                        pagination.currentPage +
                          1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ROLE MODAL */}

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Change User Role
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update the account type for{" "}
                  <span className="font-semibold">
                    {roleModal.name ||
                      roleModal.email}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRoleModal
                }
                disabled={
                  Boolean(actionLoading)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Account Role
              </label>

              <select
                value={
                  selectedRole
                }
                onChange={(event) =>
                  setSelectedRole(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="tenant">
                  Tenant
                </option>

                <option value="owner">
                  Owner
                </option>
              </select>

              <p className="mt-3 text-xs leading-5 text-zinc-400">
                Admin accounts are protected and
                cannot be changed from this interface.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={
                    closeRoleModal
                  }
                  disabled={
                    Boolean(actionLoading)
                  }
                  className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleRoleChange
                  }
                  disabled={
                    Boolean(actionLoading)
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}

                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}