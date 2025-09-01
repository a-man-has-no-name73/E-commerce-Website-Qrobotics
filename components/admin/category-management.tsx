// CATEGORY MANAGEMENT (UPDATED)
// components/admin/category-management.tsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { TableLoading, Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Image as ImageIcon, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryImageManager } from "@/components/ui/category-image-manager";
import Image from "next/image";

interface Category {
  category_id: number;
  name: string;
  description?: string;
  created_at: string;
  _uuid?: string; // used for frontend-only key uniqueness
}

interface CategoryImage {
  id: number;
  url: string;
  publicId: string;
  fileName: string;
  isPrimary: boolean;
  createdAt: string;
}

interface UploadedImage {
  url: string;
  publicId: string;
  fileName: string;
}

export function CategoryManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Loading states for operations
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<number | null>(
    null
  );

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState({
    name: "",
    description: "",
  });
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [editImages, setEditImages] = useState<UploadedImage[]>([]);
  const [existingImages, setExistingImages] = useState<CategoryImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [categoryImages, setCategoryImages] = useState<{
    [key: number]: CategoryImage[];
  }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      const categoriesWithUuid = (data.categories || []).map((c: Category) => ({
        ...c,
        _uuid: c._uuid || crypto.randomUUID(), // Only generate UUID if not exists
      }));
      setCategories(categoriesWithUuid);

      // Fetch images for each category
      const imagePromises = categoriesWithUuid.map(
        async (category: Category) => {
          try {
            const imageResponse = await fetch(
              `/api/categories/images?categoryId=${category.category_id}`
            );
            if (!imageResponse.ok) {
              console.error(
                `Failed to fetch images for category ${category.category_id}: ${imageResponse.status}`
              );
              return { categoryId: category.category_id, images: [] };
            }
            const imageData = await imageResponse.json();
            return {
              categoryId: category.category_id,
              images: imageData.images || [],
            };
          } catch (error) {
            console.error(
              `Failed to fetch images for category ${category.category_id}:`,
              error
            );
            return { categoryId: category.category_id, images: [] };
          }
        }
      );

      const imageResults = await Promise.all(imagePromises);
      const imageMap: { [key: number]: CategoryImage[] } = {};
      imageResults.forEach((result) => {
        imageMap[result.categoryId] = result.images;
      });
      setCategoryImages(imageMap);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCategory(true);

    toast({
      title: "Creating category...",
      description: "Setting up new category and uploading images",
    });

    try {
      const response = await fetch("/api/admin/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create category");

      const createdCategory = {
        ...result.category,
        _uuid: result.category._uuid || crypto.randomUUID(),
      };
      setCategories((prev) => [...prev, createdCategory]);

      // If there are new images, save them
      if (newImages.length > 0) {
        try {
          const imageResponse = await fetch("/api/categories/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryId: result.category.category_id,
              images: newImages,
            }),
          });

          if (imageResponse.ok) {
            // Refresh category images
            const imageData = await fetch(
              `/api/categories/images?categoryId=${result.category.category_id}`
            );
            if (imageData.ok) {
              const images = await imageData.json();
              setCategoryImages((prev) => ({
                ...prev,
                [result.category.category_id]: images.images || [],
              }));
            }
          }
        } catch (imageError) {
          console.error("Failed to save category images:", imageError);
          toast({
            title: "Warning",
            description: "Category created but failed to save images",
            variant: "destructive",
          });
        }
      }

      setNewCategory({ name: "", description: "" });
      setNewImages([]);
      setIsAddingCategory(false);
      toast({ title: "Success", description: "Category created successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleEditClick = useCallback(
    (category: Category) => {
      const images = categoryImages[category.category_id] || [];
      setEditingCategory(category);
      setEditCategory({
        name: category.name,
        description: category.description || "",
      });
      setExistingImages(images);
      setEditImages([]);
      setImagesToDelete([]);
      setIsEditingCategory(true);
    },
    [categoryImages]
  );

  const handleImageDelete = useCallback((imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  }, []);

  // Memoize the existing images to prevent unnecessary re-renders
  const memoizedExistingImages = useMemo(
    () => existingImages,
    [existingImages]
  );

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    if (!editCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        id: editingCategory.category_id,
        name: editCategory.name.trim(),
        description: editCategory.description.trim(),
      };

      const response = await fetch("/api/admin/edit-category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update category");
      }

      // Handle image deletions
      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(async (imageId) => {
          try {
            await fetch("/api/categories/images", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageId }),
            });
          } catch (error) {
            console.error(`Failed to delete image ${imageId}:`, error);
          }
        });
        await Promise.all(deletePromises);
      }

      // Handle new image uploads
      if (editImages.length > 0) {
        try {
          await fetch("/api/categories/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryId: editingCategory.category_id,
              images: editImages,
            }),
          });
        } catch (imageError) {
          console.error("Failed to save new category images:", imageError);
        }
      }

      // Update the category in the list
      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === editingCategory.category_id
            ? {
                ...c,
                name: editCategory.name,
                description: editCategory.description,
              }
            : c
        )
      );

      // Refresh category images
      try {
        const imageResponse = await fetch(
          `/api/categories/images?categoryId=${editingCategory.category_id}`
        );
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          setCategoryImages((prev) => ({
            ...prev,
            [editingCategory.category_id]: imageData.images || [],
          }));
        } else {
          console.error("Failed to refresh category images: Response not OK");
        }
      } catch (error) {
        console.error("Failed to refresh category images:", error);
      }

      setIsEditingCategory(false);
      setEditingCategory(null);
      setExistingImages([]);
      setEditImages([]);
      setImagesToDelete([]);

      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    setIsDeletingCategory(category.category_id);

    try {
      toast({
        title: "Deleting Category",
        description: `Deleting "${category.name}"...`,
      });

      // First check if category has products
      const productsResponse = await fetch(
        `/api/products?categoryId=${category.category_id}`
      );
      const productsData = await productsResponse.json();
      const productCount = productsData.products?.length || 0;

      const response = await fetch("/api/admin/delete-category", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.category_id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete category");
      }

      // Remove the category from the list
      setCategories(
        categories.filter((c) => c.category_id !== category.category_id)
      );

      // Remove category images from state
      setCategoryImages((prev) => {
        const newState = { ...prev };
        delete newState[category.category_id];
        return newState;
      });

      toast({
        title: "Success",
        description:
          productCount > 0
            ? `Category "${category.name}" and ${productCount} associated products deleted successfully`
            : `Category "${category.name}" deleted successfully`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCategory(null);
    }
  };

  if (loading)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <TableLoading rows={6} columns={4} />
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Category Management</CardTitle>
        <Dialog
          open={isAddingCategory}
          onOpenChange={(open) => {
            setIsAddingCategory(open);
            if (!open) {
              setNewCategory({ name: "", description: "" });
              setNewImages([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  content={newCategory.description}
                  onChange={(content) =>
                    setNewCategory({
                      ...newCategory,
                      description: content,
                    })
                  }
                  placeholder="Enter category description with formatting..."
                  className="mt-2"
                />
              </div>
              <CategoryImageManager
                key="add-category"
                onImagesChange={setNewImages}
                maxImages={3}
                initialImages={newImages}
              />
              <Button
                onClick={handleAddCategory}
                disabled={isCreatingCategory}
                className="w-full"
              >
                {isCreatingCategory ? (
                  <>
                    <Loading variant="spinner" size="sm" className="mr-2" />
                    Creating Category...
                  </>
                ) : (
                  "Add Category"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog
          open={isEditingCategory}
          onOpenChange={(open) => {
            setIsEditingCategory(open);
            if (!open) {
              setEditingCategory(null);
              setEditCategory({ name: "", description: "" });
              setExistingImages([]);
              setEditImages([]);
              setImagesToDelete([]);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <RichTextEditor
                  content={editCategory.description}
                  onChange={(content) =>
                    setEditCategory({
                      ...editCategory,
                      description: content,
                    })
                  }
                  placeholder="Enter category description with formatting..."
                  className="mt-2"
                />
              </div>
              <CategoryImageManager
                key={`edit-${editingCategory?.category_id || "new"}`}
                onImagesChange={setEditImages}
                onImageDelete={handleImageDelete}
                maxImages={3}
                initialImages={editImages}
                existingImages={memoizedExistingImages}
                imagesToDelete={imagesToDelete}
                categoryId={editingCategory?.category_id}
              />
              <Button onClick={handleEditCategory}>Update Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const images = categoryImages[category.category_id] || [];
          const primaryImage = images.find((img) => img.isPrimary) || images[0];

          return (
            <Card key={category.category_id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(category)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeletingCategory === category.category_id}
                      >
                        {isDeletingCategory === category.category_id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.name}"?
                          This will permanently remove the category and all its
                          images. Products in this category will be moved to "No
                          Category" and will remain available for sale.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={isDeletingCategory === category.category_id}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeletingCategory === category.category_id}
                        >
                          {isDeletingCategory === category.category_id ? (
                            <>
                              <Loading variant="spinner" size="sm" className="mr-2" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Category"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Category Image */}
              {primaryImage ? (
                <div className="mb-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={primaryImage.url}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {images.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{images.length - 1} more image
                      {images.length > 2 ? "s" : ""}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">No image</p>
                </div>
              )}

              <div
                className="text-sm text-gray-600 mb-2 prose prose-sm"
                dangerouslySetInnerHTML={{ __html: category.description || "" }}
              />
              <p className="text-xs text-gray-500">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </p>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
