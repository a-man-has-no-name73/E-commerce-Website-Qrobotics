"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Star, StarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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

interface ProductImageManagerProps {
  onImagesChange?: (images: UploadedImage[]) => void;
  onImageDelete?: (imageId: number) => void;
  maxImages?: number;
  initialImages?: UploadedImage[];
  existingImages?: DatabaseImage[];
  productId?: number;
}

export function ProductImageManager({
  onImagesChange,
  onImageDelete,
  maxImages = 5,
  initialImages = [],
  existingImages = [],
  productId,
}: ProductImageManagerProps) {
  const { toast } = useToast();
  const [newImages, setNewImages] = useState<UploadedImage[]>(initialImages);
  const [localExistingImages, setLocalExistingImages] =
    useState<DatabaseImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  // Update local existing images when prop changes
  useEffect(() => {
    setLocalExistingImages(existingImages);
  }, [existingImages]);

  const totalImages = localExistingImages.length + newImages.length;

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (totalImages + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only have up to ${maxImages} images total`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        return await response.json();
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const updatedNewImages = [...newImages, ...uploadedImages];

      setNewImages(updatedNewImages);
      onImagesChange?.(updatedNewImages);

      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      const input = event.target;
      if (input) input.value = "";
    }
  };

  const removeNewImage = async (index: number) => {
    const imageToRemove = newImages[index];

    try {
      await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: imageToRemove.publicId }),
      });

      const updatedImages = newImages.filter((_, i) => i !== index);
      setNewImages(updatedImages);
      onImagesChange?.(updatedImages);

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const removeExistingImage = (imageId: number) => {
    // Only mark for deletion, don't actually delete from database yet
    // Remove from local state to hide it in UI
    setLocalExistingImages((prev) => prev.filter((img) => img.id !== imageId));

    // Call the callback to notify parent component
    if (onImageDelete) {
      onImageDelete(imageId);
    }

    toast({
      title: "Image marked for deletion",
      description: "Image will be deleted when you save the product",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Images</Label>
        <p className="text-sm text-gray-500 mb-2">
          Upload up to {maxImages} images (max 5MB each). First image will be
          the primary image.
        </p>
      </div>

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image-upload-input")?.click()}
          disabled={uploading || totalImages >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>
        <span className="text-sm text-gray-500">
          {totalImages}/{maxImages} images
        </span>
      </div>

      <Input
        id="image-upload-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Existing Images */}
      {localExistingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {localExistingImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative border rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={image.url}
                    alt={`Product image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full p-1">
                      <Star className="h-3 w-3" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExistingImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {image.fileName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">New Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {newImages.map((image, index) => (
              <div key={image.publicId} className="relative group">
                <div className="aspect-square relative border rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={image.url}
                    alt={`New product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {index === 0 && localExistingImages.length === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full p-1">
                      <Star className="h-3 w-3" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeNewImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {image.fileName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalImages === 0 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Click to upload product images</p>
          <p className="text-sm text-gray-400">or drag and drop</p>
        </div>
      )}
    </div>
  );
}
