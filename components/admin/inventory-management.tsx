"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, AlertTriangle, CheckCircle } from "lucide-react";

interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  product_code?: string;
  quantity: number;
  category_id: number;
  is_available: boolean;
  categories?: {
    category_id: number;
    name: string;
  };
}

interface Category {
  category_id: number;
  name: string;
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<{
    [key: number]: number | string;
  }>({});
  const { toast } = useToast();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [productCodeSearch, setProductCodeSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, productCodeSearch, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (productCodeSearch) {
        params.append("product_code", productCodeSearch);
      }

      const response = await fetch(`/api/inventory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.total || 0);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, value: string) => {
    // Allow empty string for better UX when user wants to clear and type new value
    if (value === "") {
      setPendingUpdates((prev) => ({
        ...prev,
        [productId]: "",
      }));
      return;
    }

    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      setPendingUpdates((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  const handleUpdateQuantity = async (productId: number) => {
    const pendingValue = pendingUpdates[productId];
    if (pendingValue === undefined || pendingValue === "") return;

    // Convert to number and validate
    const newQuantity =
      typeof pendingValue === "string" ? parseInt(pendingValue) : pendingValue;
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid non-negative number",
        variant: "destructive",
      });
      return;
    }

    setUpdating(productId);
    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        // Update the product in the local state
        setProducts(
          products.map((product) =>
            product.product_id === productId
              ? {
                  ...product,
                  quantity: newQuantity,
                  is_available: newQuantity > 0,
                }
              : product
          )
        );

        // Remove from pending updates
        setPendingUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[productId];
          return newUpdates;
        });

        toast({
          title: "Success",
          description: "Product quantity updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setProductCodeSearch("");
    setCurrentPage(1);
  };

  // Helper function to get the current quantity for display
  const getCurrentQuantity = (
    productId: number,
    originalQuantity: number
  ): number => {
    const pendingValue = pendingUpdates[productId];
    if (pendingValue === undefined) return originalQuantity;
    if (pendingValue === "") return 0;
    return typeof pendingValue === "string"
      ? parseInt(pendingValue) || 0
      : pendingValue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">
            Manage product quantities and availability
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          Total Products: {totalProducts}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search Products</Label>
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="product-code">Product Code</Label>
              <Input
                id="product-code"
                placeholder="Search by product code..."
                value={productCodeSearch}
                onChange={(e) => setProductCodeSearch(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.product_id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {product.categories?.name}
                    </p>
                    {product.product_code && (
                      <p className="text-xs text-gray-500 font-mono">
                        {product.product_code}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={product.is_available ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {product.is_available ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {product.is_available ? "Available" : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      ৳{product.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${product.product_id}`}>
                      Current Quantity
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`quantity-${product.product_id}`}
                        type="number"
                        min="0"
                        value={
                          pendingUpdates[product.product_id] !== undefined
                            ? pendingUpdates[product.product_id]
                            : product.quantity
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            product.product_id,
                            e.target.value
                          )
                        }
                        disabled={updating === product.product_id}
                        className={`font-bold ${
                          getCurrentQuantity(
                            product.product_id,
                            product.quantity
                          ) === 0
                            ? "text-red-600"
                            : getCurrentQuantity(
                                product.product_id,
                                product.quantity
                              ) < 5
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      />
                      {pendingUpdates[product.product_id] !== undefined && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(product.product_id)
                          }
                          disabled={updating === product.product_id}
                        >
                          {updating === product.product_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          ) : (
                            "Update"
                          )}
                        </Button>
                      )}
                    </div>

                    {getCurrentQuantity(
                      product.product_id,
                      product.quantity
                    ) === 0 && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Out of stock
                      </p>
                    )}
                    {getCurrentQuantity(product.product_id, product.quantity) >
                      0 &&
                      getCurrentQuantity(product.product_id, product.quantity) <
                        5 && (
                        <p className="text-xs text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low stock
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-8">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
          <Button variant="outline" onClick={resetFilters} className="mt-2">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
