import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  category_id: number;
  inStock: boolean;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  images: Array<{
    id: number;
    url: string;
    publicId: string;
    fileName: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
  image?: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No products found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={
                    product.images?.[0]?.url ||
                    product.image ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {!product.inStock && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="p-4">
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    ৳{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.stock} in stock
                  </span>
                </div>
                <Button
                  className="w-full"
                  disabled={!product.inStock}
                  variant={product.inStock ? "default" : "secondary"}
                >
                  {product.inStock ? "View Details" : "Out of Stock"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
