// PRODUCT MANAGEMENT (UPDATED WITH VALIDATION)
// components/admin/product-management.tsx

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ProductImageManager } from "@/components/ui/product-image-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface Product {
  product_id: number; // ✅ Keep original field name for admin
  name: string;
  description?: string;
  price: number;
  category_id: number;
  is_available: boolean;
  inventory?: {
    quantity: number;
  };
  category_name?: string;
  _uuid?: string;
  images?: DatabaseImage[];
}

interface Category {
  category_id: number;
  name: string;
}

interface UploadedImage {
  url: string;
  publicId: string;
  fileName: string;
}

interface DatabaseImage {
  id: number;
  url: string;
  publicId: string;
  fileName: string;
  isPrimary: boolean;
  createdAt: string;
}

export function ProductManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    is_available: true,
    images: [] as UploadedImage[],
  });
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    is_available: true,
    images: [] as UploadedImage[],
    deletedImageIds: [] as number[],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products"); // ✅ Use admin API
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      const productsWithUuid = (data.products || []).map((p: Product) => ({
        ...p,
        _uuid: crypto.randomUUID(),
      }));

      setProducts(productsWithUuid);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      toast({
        title: "Missing fields",
        description: "Name, price, and category are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price),
      category_id: parseInt(newProduct.category_id),
      description: newProduct.description?.trim() || "",
      is_available: newProduct.is_available,
      created_by: 1, // Replace with actual admin ID from context/session if available
      images: newProduct.images,
    };

    try {
      const response = await fetch("/api/admin/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      // Handle successful product creation (with or without image warnings)
      const newProductWithImages = {
        ...result.product,
        _uuid: crypto.randomUUID(),
        images:
          result.product.images?.map((img: any, index: number) => ({
            id: img.image_id || 0,
            url: img.image_url,
            publicId: img.cloudinary_public_id,
            fileName: img.file_name,
            isPrimary: index === 0,
            createdAt: img.created_at || new Date().toISOString(),
          })) ||
          newProduct.images.map((img, index) => ({
            id: 0,
            url: img.url,
            publicId: img.publicId,
            fileName: img.fileName,
            isPrimary: index === 0,
            createdAt: new Date().toISOString(),
          })),
      };

      // Add new product to the TOP of the list
      setProducts([newProductWithImages, ...products]);

      setNewProduct({
        name: "",
        price: "",
        category_id: "",
        description: "",
        is_available: true,
        images: [],
      });
      setIsAddingProduct(false);

      // Show appropriate message
      if (result.warning) {
        toast({
          title: "Partial Success",
          description: result.warning,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });

      // Refresh products to show any partially created product
      fetchProducts();
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name,
      price: String(product.price),
      category_id: String(product.category_id),
      description: product.description || "",
      is_available: product.is_available,
      images: [],
      deletedImageIds: [],
    });
    setIsEditingProduct(true);
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    if (!editProduct.name || !editProduct.price || !editProduct.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate inputs before sending
      const priceValue = parseFloat(editProduct.price);
      const categoryIdValue = parseInt(editProduct.category_id);
      
      if (isNaN(priceValue) || priceValue <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(categoryIdValue) || categoryIdValue <= 0) {
        toast({
          title: "Error",
          description: "Please select a valid category",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        id: editingProduct.product_id, // ✅ Use correct admin field name
        name: editProduct.name.trim(),
        description: editProduct.description?.trim() || "",
        price: priceValue,
        category_id: categoryIdValue,
        images: editProduct.images.map((img) => ({
          image_url: img.url,
          cloudinary_public_id: img.publicId,
          file_name: img.fileName,
          is_primary: false,
        })),
        deletedImageIds: editProduct.deletedImageIds,
      };

      const response = await fetch("/api/admin/edit-product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      // Update the product in the list
      setProducts(
        products.map((p) =>
          p.product_id === editingProduct.product_id
            ? {
                ...p,
                name: editProduct.name,
                description: editProduct.description,
                price: parseFloat(editProduct.price),
                category_id: parseInt(editProduct.category_id),
                is_available: editProduct.is_available,
                // Keep existing images for now, refresh would be better
                images:
                  editProduct.images.length > 0
                    ? editProduct.images.map((img, index) => ({
                        id: 0,
                        url: img.url,
                        publicId: img.publicId,
                        fileName: img.fileName,
                        isPrimary: index === 0,
                        createdAt: new Date().toISOString(),
                      }))
                    : p.images,
              }
            : p
        )
      );

      setIsEditingProduct(false);
      setEditingProduct(null);

      toast({
        title: "Success",
        description: result.partialSuccess
          ? "Product updated, but some images may have failed"
          : "Product updated successfully",
        variant: result.partialSuccess ? "destructive" : "default",
      });

      // Refresh products to get updated data
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return <div className="flex justify-center p-8">Loading products...</div>;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Product Management</CardTitle>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (৳)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProduct.category_id}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.category_id}
                        value={String(cat.category_id)}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <ImageUpload
                  onImagesChange={(images) =>
                    setNewProduct({ ...newProduct, images })
                  }
                  maxImages={5}
                  initialImages={newProduct.images}
                />
              </div>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog
          open={isEditingProduct}
          onOpenChange={(open) => {
            setIsEditingProduct(open);
            if (!open) {
              // Reset state when dialog closes
              setEditingProduct(null);
              setEditProduct({
                name: "",
                price: "",
                category_id: "",
                description: "",
                is_available: true,
                images: [],
                deletedImageIds: [],
              });
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price (৳)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editProduct.category_id}
                  onValueChange={(value) =>
                    setEditProduct({ ...editProduct, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.category_id}
                        value={String(cat.category_id)}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <ProductImageManager
                  productId={editingProduct?.product_id}
                  existingImages={
                    editingProduct?.images?.map((img) => ({
                      id: img.id,
                      url: img.url,
                      publicId: img.publicId,
                      fileName: img.fileName,
                      isPrimary: img.isPrimary,
                      createdAt: img.createdAt,
                    })) || []
                  }
                  onImagesChange={(images) =>
                    setEditProduct({ ...editProduct, images })
                  }
                  onImageDelete={(imageId: number) => {
                    // Add to deleted IDs for the API call
                    setEditProduct((prev) => ({
                      ...prev,
                      deletedImageIds: [...prev.deletedImageIds, imageId],
                    }));

                    // Also remove from the editingProduct to update the UI immediately
                    setEditingProduct((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        images:
                          prev.images?.filter((img) => img.id !== imageId) ||
                          [],
                      };
                    });
                  }}
                  maxImages={5}
                />
              </div>
              <Button onClick={handleEditProduct}>Update Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <Card
                        key={product._uuid || product.product_id}
            className="p-4 border rounded"
          >
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="w-24 h-24 flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={
                      product.images.find((img) => img.isPrimary)?.url ||
                      product.images[0].url
                    }
                    alt={product.name}
                    width={96}
                    height={96}
                    className="object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex gap-4 mt-2">
                  <p className="text-sm text-gray-500">
                    Price: ৳{product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Available: {product.is_available ? "Yes" : "No"}
                  </p>
                  {product.images && product.images.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Images: {product.images.length}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(product)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
