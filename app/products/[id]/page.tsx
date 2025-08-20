"use client";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { useProduct } from "@/hooks/use-products";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { product, loading, error } = useProduct(productId);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-pulse">
                <div className="bg-gray-300 h-96 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="bg-gray-300 h-8 rounded mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-12 rounded mt-4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600">
              The product you're looking for doesn't exist or is no longer
              available.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.map((img) => img.url) || ["/placeholder.svg"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductImageGallery images={images} />
            <ProductInfo product={product} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
