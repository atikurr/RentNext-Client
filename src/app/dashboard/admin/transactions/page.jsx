"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Search,
  Eye,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000";

const statusOptions = [
  "All",
  "Paid",
  "Pending",
  "Failed",
  "Refunded",
];

const paymentMethodOptions = [
  "All",
  "Stripe",
];

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",

    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

    Failed:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

    Refunded:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING CARD
|--------------------------------------------------------------------------
*/

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-4 h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-3 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

export default function AdminTransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [paymentMethod, setPaymentMethod] =
    useState("All");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalTransactions: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] = useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | GET JWT TOKEN
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | Do NOT use:
  |
  | session?.data?.session?.token
  |
  | We use Better Auth JWT plugin:
  |
  | authClient.token()
  |
  |--------------------------------------------------------------------------
  */

  const getToken = useCallback(
    async () => {
      try {
        const result =
          await authClient.token();

        if (result?.error) {
          console.error(
            "Better Auth JWT error:",
            result.error
          );

          return "";
        }

        return result?.data?.token || "";
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
  | ADMIN AUTH CHECK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const session =
          await authClient.getSession();

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
            currentUser.role === "owner"
          ) {
            router.replace(
              "/dashboard/owner"
            );
          } else {
            router.replace(
              "/dashboard/tenant"
            );
          }
        }
      } catch (error) {
        console.error(
          "Admin auth check error:",
          error
        );

        router.replace("/login");
      }
    };

    checkAdmin();
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | FETCH TRANSACTIONS
  |--------------------------------------------------------------------------
  */

  const fetchTransactions =
    useCallback(async () => {
      try {
        setLoading(true);

        const token =
          await getToken();

        /*
        |--------------------------------------------------------------------------
        | TOKEN CHECK
        |--------------------------------------------------------------------------
        */

        if (!token) {
          toast.error(
            "Unable to get JWT token. Please login again."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | QUERY PARAMETERS
        |--------------------------------------------------------------------------
        */

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
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

        if (status !== "All") {
          params.set(
            "status",
            status
          );
        }

        if (
          paymentMethod !==
          "All"
        ) {
          params.set(
            "paymentMethod",
            paymentMethod
          );
        }

        /*
        |--------------------------------------------------------------------------
        | API REQUEST
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            `${API_URL}/api/admin/transactions?${params.toString()}`,
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

        /*
        |--------------------------------------------------------------------------
        | API ERROR
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to fetch transactions."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        setTransactions(
          result.data || []
        );

        setPagination(
          result.pagination || {
            currentPage: 1,
            totalTransactions: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (error) {
        console.error(
          "Fetch transactions error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load transactions."
        );
      } finally {
        setLoading(false);
      }
    }, [
      getToken,
      page,
      search,
      status,
      paymentMethod,
    ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD TRANSACTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchTransactions();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchTransactions]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS FILTER
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = (
    event
  ) => {
    setStatus(
      event.target.value
    );

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT METHOD FILTER
  |--------------------------------------------------------------------------
  */

  const handlePaymentMethodChange = (
    event
  ) => {
    setPaymentMethod(
      event.target.value
    );

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW DETAILS
  |--------------------------------------------------------------------------
  */

  const handleViewDetails = (
    transaction
  ) => {
    setSelectedTransaction(
      transaction
    );

    setShowDetails(true);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatusUpdate = async (
    transactionId,
    newStatus
  ) => {
    try {
      setUpdatingId(
        transactionId
      );

      const token =
        await getToken();

      if (!token) {
        toast.error(
          "Unable to get JWT token. Please login again."
        );

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/transactions/${transactionId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            credentials: "include",

            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update transaction."
        );
      }

      toast.success(
        "Transaction status updated successfully."
      );

      setSelectedTransaction(
        (previous) =>
          previous
            ? {
                ...previous,
                status: newStatus,
              }
            : previous
      );

      await fetchTransactions();
    } catch (error) {
      console.error(
        "Update transaction error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to update transaction status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE TRANSACTION
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    transaction
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete transaction "${transaction.transactionId}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        transaction._id
      );

      const token =
        await getToken();

      if (!token) {
        toast.error(
          "Unable to get JWT token. Please login again."
        );

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/transactions/${transaction._id}`,
          {
            method: "DELETE",

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
          result.message ||
            "Failed to delete transaction."
        );
      }

      toast.success(
        "Transaction deleted successfully."
      );

      if (
        selectedTransaction?._id ===
        transaction._id
      ) {
        setSelectedTransaction(
          null
        );

        setShowDetails(false);
      }

      await fetchTransactions();
    } catch (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to delete transaction."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
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
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE TIME
  |--------------------------------------------------------------------------
  */

  const formatDateTime = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT AMOUNT
  |--------------------------------------------------------------------------
  */

  const formatAmount = (
    amount,
    currency = "BDT"
  ) => {
    return `${currency} ${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FILTERS
  |--------------------------------------------------------------------------
  */

  const handleResetFilters = () => {
    setSearch("");

    setStatus("All");

    setPaymentMethod("All");

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

      <div className="min-h-full bg-slate-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                Transactions
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage and monitor all
                payment transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={
                fetchTransactions
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* STATS */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                {pagination.totalTransactions ||
                  0}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Current Page
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                {pagination.currentPage ||
                  1}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Pages
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                {pagination.totalPages ||
                  1}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Payment Method
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                Stripe
              </p>
            </div>

          </div>

          {/* FILTERS */}

          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]">

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={
                    handleSearchChange
                  }
                  placeholder="Search transaction, tenant, property..."
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500"
                />

              </div>

              {/* STATUS */}

              <select
                value={status}
                onChange={
                  handleStatusChange
                }
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              >
                {statusOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ===
                      "All"
                        ? "All Status"
                        : option}
                    </option>
                  )
                )}
              </select>

              {/* PAYMENT METHOD */}

              <select
                value={
                  paymentMethod
                }
                onChange={
                  handlePaymentMethodChange
                }
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              >
                {paymentMethodOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ===
                      "All"
                        ? "All Methods"
                        : option}
                    </option>
                  )
                )}
              </select>

              {/* RESET */}

              <button
                type="button"
                onClick={
                  handleResetFilters
                }
                className="h-11 rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Reset
              </button>

            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="space-y-4">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : transactions.length ===
            0 ? (
            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">

              <div className="mx-auto max-w-md">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Search
                    size={24}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
                  No transactions
                  found
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  No transactions
                  match your current
                  search or filter.
                </p>

              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">

                      <tr>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Transaction
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Property
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Tenant
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Amount
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Method
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">

                      {transactions.map(
                        (
                          transaction
                        ) => (
                          <tr
                            key={
                              transaction._id
                            }
                            className="transition hover:bg-zinc-50 dark:hover:bg-zinc-950/60"
                          >

                            {/* TRANSACTION */}

                            <td className="px-5 py-4">

                              <p className="max-w-[180px] truncate text-sm font-semibold text-zinc-950 dark:text-white">
                                {
                                  transaction.transactionId
                                }
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {formatDate(
                                  transaction.transactionDate
                                )}
                              </p>

                            </td>

                            {/* PROPERTY */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">

                                  {transaction
                                    .property
                                    ?.image ? (
                                    <Image
                                      src={
                                        transaction
                                          .property
                                          .image
                                      }
                                      alt={
                                        transaction
                                          .property
                                          .title ||
                                        "Property"
                                      }
                                      fill
                                      className="object-cover"
                                      sizes="56px"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                      No image
                                    </div>
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="max-w-[180px] truncate text-sm font-semibold text-zinc-950 dark:text-white">
                                    {transaction
                                      .property
                                      ?.title ||
                                      "N/A"}
                                  </p>

                                  <p className="max-w-[180px] truncate text-xs text-zinc-500">
                                    {transaction
                                      .property
                                      ?.location ||
                                      "N/A"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* TENANT */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {transaction
                                  .tenant
                                  ?.name ||
                                  "N/A"}
                              </p>

                              <p className="max-w-[180px] truncate text-xs text-zinc-500">
                                {transaction
                                  .tenant
                                  ?.email ||
                                  "N/A"}
                              </p>

                            </td>

                            {/* AMOUNT */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-bold text-zinc-950 dark:text-white">
                                {formatAmount(
                                  transaction.amount,
                                  transaction.currency
                                )}
                              </p>

                            </td>

                            {/* METHOD */}

                            <td className="px-5 py-4">

                              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {
                                  transaction.paymentMethod
                                }
                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">

                              <StatusBadge
                                status={
                                  transaction.status
                                }
                              />

                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewDetails(
                                      transaction
                                    )
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                                >
                                  <Eye
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      transaction
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    transaction._id
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
                                >
                                  {deletingId ===
                                  transaction._id ? (
                                    <RefreshCw
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={16}
                                    />
                                  )}
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              </div>

              {/* MOBILE */}

              <div className="grid grid-cols-1 gap-4 lg:hidden">

                {transactions.map(
                  (
                    transaction
                  ) => (
                    <div
                      key={
                        transaction._id
                      }
                      className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">

                            {transaction
                              .property
                              ?.image ? (
                              <Image
                                src={
                                  transaction
                                    .property
                                    .image
                                }
                                alt={
                                  transaction
                                    .property
                                    .title ||
                                  "Property"
                                }
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                No image
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                              {
                                transaction.transactionId
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {transaction
                                .property
                                ?.title ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                        <StatusBadge
                          status={
                            transaction.status
                          }
                        />

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">

                          <p className="text-xs text-zinc-500">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">
                            {formatAmount(
                              transaction.amount,
                              transaction.currency
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">

                          <p className="text-xs text-zinc-500">
                            Method
                          </p>

                          <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                            {
                              transaction.paymentMethod
                            }
                          </p>

                        </div>

                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">

                          <p className="text-xs text-zinc-500">
                            Tenant
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-zinc-950 dark:text-white">
                            {transaction
                              .tenant
                              ?.name ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">

                          <p className="text-xs text-zinc-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                            {formatDate(
                              transaction.transactionDate
                            )}
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewDetails(
                              transaction
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                        >
                          <Eye size={16} />
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              transaction
                            )
                          }
                          disabled={
                            deletingId ===
                            transaction._id
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-red-600 dark:border-red-900/50 dark:text-red-400"
                        >
                          {deletingId ===
                          transaction._id ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* PAGINATION */}

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {pagination.currentPage ||
                      1}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {pagination.totalPages ||
                      1}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      !pagination.hasPreviousPage
                    }
                    onClick={() =>
                      setPage(
                        (
                          previous
                        ) =>
                          Math.max(
                            previous -
                              1,
                            1
                          )
                      )
                    }
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      !pagination.hasNextPage
                    }
                    onClick={() =>
                      setPage(
                        (
                          previous
                        ) =>
                          previous +
                          1
                      )
                    }
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Next
                  </button>

                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}

      {showDetails &&
        selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">

                <div>

                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Transaction
                    Details
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {
                      selectedTransaction.transactionId
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(
                      false
                    );

                    setSelectedTransaction(
                      null
                    );
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="space-y-6 p-5 sm:p-6">

                {/* PROPERTY */}

                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">

                  <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800">

                    {selectedTransaction
                      .property
                      ?.image ? (
                      <Image
                        src={
                          selectedTransaction
                            .property
                            .image
                        }
                        alt={
                          selectedTransaction
                            .property
                            .title ||
                          "Property"
                        }
                        fill
                        className="object-cover"
                        sizes="768px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                        No property
                        image
                      </div>
                    )}

                  </div>

                  <div className="p-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <p className="text-lg font-bold text-zinc-950 dark:text-white">
                          {selectedTransaction
                            .property
                            ?.title ||
                            "N/A"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {selectedTransaction
                            .property
                            ?.location ||
                            "N/A"}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          selectedTransaction.status
                        }
                      />

                    </div>

                  </div>
                </div>

                {/* PAYMENT */}

                <section>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
                    Payment
                    Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Transaction ID
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-zinc-950 dark:text-white">
                        {
                          selectedTransaction.transactionId
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Payment ID
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-zinc-950 dark:text-white">
                        {selectedTransaction
                          .paymentId ||
                          "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Booking ID
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-zinc-950 dark:text-white">
                        {
                          selectedTransaction.bookingId
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Amount
                      </p>

                      <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
                        {formatAmount(
                          selectedTransaction.amount,
                          selectedTransaction.currency
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                        {
                          selectedTransaction.paymentMethod
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      <p className="text-xs text-zinc-500">
                        Transaction Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                        {formatDateTime(
                          selectedTransaction.transactionDate
                        )}
                      </p>
                    </div>

                  </div>
                </section>

                {/* TENANT */}

                <section>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
                    Tenant
                    Information
                  </h3>

                  <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">

                    <p className="text-sm font-bold text-zinc-950 dark:text-white">
                      {selectedTransaction
                        .tenant?.name ||
                        "N/A"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {selectedTransaction
                        .tenant?.email ||
                        "N/A"}
                    </p>

                    <p className="mt-2 text-xs text-zinc-400">
                      ID:{" "}
                      {selectedTransaction
                        .tenant?.id ||
                        "N/A"}
                    </p>

                  </div>
                </section>

                {/* OWNER */}

                <section>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
                    Owner
                    Information
                  </h3>

                  <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">

                    <p className="text-sm font-bold text-zinc-950 dark:text-white">
                      {selectedTransaction
                        .owner?.name ||
                        "N/A"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {selectedTransaction
                        .owner?.email ||
                        "N/A"}
                    </p>

                    <p className="mt-2 text-xs text-zinc-400">
                      ID:{" "}
                      {selectedTransaction
                        .owner?.id ||
                        "N/A"}
                    </p>

                  </div>
                </section>

                {/* STATUS */}

                <section>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
                    Update Status
                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {[
                      "Paid",
                      "Pending",
                      "Failed",
                      "Refunded",
                    ].map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          disabled={
                            updatingId ===
                            selectedTransaction._id
                          }
                          onClick={() =>
                            handleStatusUpdate(
                              selectedTransaction._id,
                              option
                            )
                          }
                          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                            selectedTransaction.status ===
                            option
                              ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                              : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}

                  </div>
                </section>

                {/* FOOTER */}

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(
                        false
                      );

                      setSelectedTransaction(
                        null
                      );
                    }}
                    className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        selectedTransaction
                      )
                    }
                    disabled={
                      deletingId ===
                      selectedTransaction._id
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId ===
                    selectedTransaction._id ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />

                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2
                          size={16}
                        />

                        Delete
                      </>
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}
    </>
  );
}