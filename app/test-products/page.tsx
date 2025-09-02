"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridLoading } from "@/components/ui/loading";

// Simulated product data
const mockProducts = [
  {
    id: 1,
    name: "Robot Arm Model X1",
    description: "Advanced robotic arm for industrial automation",
    price: 5999,
    category: "Robotic Arms",
    category_id: 1,
    inStock: true,
    stock: 15,
    isAvailable: true,
    createdAt: "2024-01-01",
    images: [
      {
        id: 1,
        url: "/placeholder.svg",
        publicId: "placeholder",
        fileName: "placeholder.svg",
        isPrimary: true,
        createdAt: "2024-01-01",
      },
    ],
  },
  {
    id: 2,
    name: "Smart Sensor Kit",
    description: "IoT sensor package for smart factory solutions",
    price: 899,
    category: "Sensors",
    category_id: 2,
    inStock: true,
    stock: 25,
    isAvailable: true,
    createdAt: "2024-01-01",
    images: [
      {
        id: 2,
        url: "/placeholder.svg",
        publicId: "placeholder",
        fileName: "placeholder.svg",
        isPrimary: true,
        createdAt: "2024-01-01",
      },
    ],
  },
  {
    id: 3,
    name: "Automated Conveyor",
    description: "High-speed conveyor system for production lines",
    price: 12999,
    category: "Conveyors",
    category_id: 3,
    inStock: false,
    stock: 0,
    isAvailable: false,
    createdAt: "2024-01-01",
    images: [
      {
        id: 3,
        url: "/placeholder.svg",
        publicId: "placeholder",
        fileName: "placeholder.svg",
        isPrimary: true,
        createdAt: "2024-01-01",
      },
    ],
  },
];

export default function TestProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API call with delay to see loading state
    const simulateApiCall = async () => {
      setLoading(true);

      // Add a 2-second delay to clearly see the loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProducts(mockProducts);
      setLoading(false);
    };

    simulateApiCall();
  }, []);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Test Products (with Loading)</h1>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload (Test Loading)
            </button>
          </div>

          {loading ? (
            <div>
              <h2 className="text-lg mb-4 text-gray-600">
                Loading products...
              </h2>
              <ProductGridLoading count={6} />
            </div>
          ) : (
            <div>
              <h2 className="text-lg mb-4 text-green-600">
                Products loaded successfully!
              </h2>
              <ProductGrid products={products} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
