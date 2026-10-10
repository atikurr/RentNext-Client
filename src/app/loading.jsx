
export default function Loading() {
  return (
    <main
      className="min-h-screen bg-[#fffaf5] px-5 py-10 sm:px-8"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="h-10 w-36 animate-pulse rounded-xl bg-orange-100" />
          <div className="hidden gap-3 sm:flex">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-orange-100" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
            <div className="h-3 w-3 rounded-full bg-orange-500" />
          </div>

          <h1 className="mt-6 text-xl font-bold text-gray-800">
            Finding your next home...
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we prepare everything for you.
          </p>
        </div>

        {/* Heading Skeleton */}
        <div className="mb-6 mt-8">
          <div className="h-7 w-56 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
        </div>

        {/* Property Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
            >
              <div className="relative h-52 animate-pulse bg-orange-100">
                <div className="absolute left-4 top-4 h-6 w-20 rounded-full bg-white/70" />
              </div>

              <div className="space-y-4 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />

                <div className="flex gap-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="h-6 w-28 animate-pulse rounded bg-orange-100" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          RentNext · Loading your experience
        </p>
      </div>
    </main>
  );
}
