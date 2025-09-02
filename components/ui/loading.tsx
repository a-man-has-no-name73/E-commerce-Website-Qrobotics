import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingProps {
  variant?: "spinner" | "skeleton" | "dots" | "bars";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  variant = "spinner",
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClass = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
    !fullScreen && "p-4",
    className
  );

  const renderSpinner = () => (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-200 border-t-blue-500",
        sizeClasses[size]
      )}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-blue-500 animate-bounce",
            size === "sm" && "w-1 h-1",
            size === "md" && "w-2 h-2",
            size === "lg" && "w-3 h-3",
            size === "xl" && "w-4 h-4"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-blue-500 animate-pulse rounded-sm",
            size === "sm" && "w-1",
            size === "md" && "w-1.5",
            size === "lg" && "w-2",
            size === "xl" && "w-3"
          )}
          style={{
            height: `${
              (i + 1) *
              (size === "sm" ? 4 : size === "md" ? 6 : size === "lg" ? 8 : 10)
            }px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "spinner":
        return renderSpinner();
      case "dots":
        return renderDots();
      case "bars":
        return renderBars();
      case "skeleton":
        return <Skeleton className={sizeClasses[size]} />;
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-2">
        {renderVariant()}
        {text && (
          <p className={cn("text-gray-600 animate-pulse", textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Specific loading components for common use cases
export function ProductCardLoading() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <Skeleton className="w-full h-48 mb-4" />
      <Skeleton className="w-20 h-4 mb-2" />
      <Skeleton className="w-full h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-full h-4 mb-3" />
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-full h-10" />
    </div>
  );
}

export function ProductGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardLoading key={i} />
      ))}
    </div>
  );
}

export function ProductDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Loading */}
        <div className="space-y-4">
          <Skeleton className="w-full h-96" />
          <div className="flex space-x-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="w-20 h-20" />
            ))}
          </div>
        </div>

        {/* Product Info Loading */}
        <div className="space-y-4">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-24 h-8" />
          <div className="space-y-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
          <Skeleton className="w-full h-12" />
        </div>
      </div>
    </div>
  );
}

export function TableLoading({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="flex-1 h-8" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <Skeleton key={j} className="flex-1 h-6" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormLoading() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-24" />
      <Skeleton className="w-full h-10" />
    </div>
  );
}

export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading variant="spinner" size="lg" text={text} />
    </div>
  );
}
