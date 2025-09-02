import { ProductGridLoading } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>

      {/* Search filters loading */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="lg:w-1/4">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-18"></div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/4">
          <ProductGridLoading count={8} />
        </div>
      </div>
    </div>
  );
}
