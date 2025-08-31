"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Star, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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
  serialNumber?: number;
  createdAt: string;
}

interface ProductImageManagerProps {
  onImagesChange?: (images: UploadedImage[]) => void;
  onImageDelete?: (imageId: number) => void;
  onImageReorder?: (imageOrder: { imageId: number; serialNumber: number }[]) => void;
  maxImages?: number;
  initialImages?: UploadedImage[];
  existingImages?: DatabaseImage[];
  productId?: number;
  enableDragDrop?: boolean;
}

export function ProductImageManagerWithDragDrop({
  onImagesChange,
  onImageDelete,
  onImageReorder,
  maxImages = 5,
  initialImages = [],
  existingImages = [],
  productId,
  enableDragDrop = false,
}: ProductImageManagerProps) {
  const { toast } = useToast();
  const [newImages, setNewImages] = useState<UploadedImage[]>(initialImages);
  const [localExistingImages, setLocalExistingImages] = useState<DatabaseImage[]>(
    existingImages.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
  );
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Update local existing images when prop changes
  useEffect(() => {
    setLocalExistingImages(
      existingImages.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
    );
  }, [existingImages]);

  // Update parent when new images change
  useEffect(() => {
    onImagesChange?.(newImages);
  }, [newImages, onImagesChange]);

  const totalImages = localExistingImages.length + newImages.length;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (totalImages + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        return {
          url: result.url,
          publicId: result.publicId,
          fileName: file.name,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setNewImages((prev) => [...prev, ...uploadedImages]);

      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeNewImage = async (index: number) => {
    const image = newImages[index];
    
    try {
      // Delete from Cloudinary
      await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: image.publicId }),
      });

      setNewImages((prev) => prev.filter((_, i) => i !== index));
      
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

  const removeExistingImage = async (imageId: number) => {
    const image = localExistingImages.find((img) => img.id === imageId);
    if (!image) return;

    try {
      // Delete from database and Cloudinary
      const response = await fetch("/api/admin/delete-product-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, publicId: image.publicId }),
      });

      if (!response.ok) throw new Error("Failed to delete image");

      setLocalExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      onImageDelete?.(imageId);

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !enableDragDrop || !productId) return;

    const items = Array.from(localExistingImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setLocalExistingImages(items);

    // Prepare the new order with serial numbers
    const imageOrder = items.map((item, index) => ({
      imageId: item.id,
      serialNumber: index + 1,
    }));

    setReordering(true);

    try {
      const response = await fetch("/api/admin/reorder-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          imageOrder,
        }),
      });

      if (!response.ok) throw new Error("Failed to reorder images");

      const data = await response.json();
      
      // Update with server response
      setLocalExistingImages(data.images || items);
      onImageReorder?.(imageOrder);

      toast({
        title: "Success",
        description: "Images reordered successfully",
      });
    } catch (error) {
      // Revert on error
      setLocalExistingImages(existingImages.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0)));
      
      toast({
        title: "Error",
        description: "Failed to reorder images",
        variant: "destructive",
      });
    } finally {
      setReordering(false);
    }
  };

  const ImageCard = ({ image, index, isDragging = false }: { image: DatabaseImage; index: number; isDragging?: boolean }) => (
    <div className={`group relative ${isDragging ? 'opacity-50' : ''}`}>
      <div className="aspect-square relative border rounded-lg overflow-hidden bg-gray-50">
        <Image
          src={image.url}
          alt={`Product image ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {(image.isPrimary || index === 0) && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full p-1">
            <Star className="h-3 w-3 fill-current" />
          </div>
        )}
        {index === 0 && (
          <div className="absolute top-2 left-8 bg-blue-500 text-white rounded px-2 py-1 text-xs">
            Primary
          </div>
        )}
        {enableDragDrop && (
          <div className="absolute top-2 right-8 bg-gray-700 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-3 w-3" />
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
      <p className="text-xs text-blue-500">
        Serial: {image.serialNumber || index + 1}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <Label htmlFor="image-upload-input">Product Images ({totalImages}/{maxImages})</Label>
        <div className="mt-2">
          <Input
            id="image-upload-input"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading || totalImages >= maxImages}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-upload-input")?.click()}
            disabled={uploading || totalImages >= maxImages}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      {/* Reordering Notice */}
      {enableDragDrop && localExistingImages.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Drag and drop</strong> to reorder images. The first image will be the primary image.
          </p>
        </div>
      )}

      {/* Existing Images */}
      {localExistingImages.length > 0 && (
        <div>
          <Label>Current Images</Label>
          {enableDragDrop ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="existing-images" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2"
                  >
                    {localExistingImages.map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id.toString()}
                        index={index}
                        isDragDisabled={reordering}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ImageCard
                              image={image}
                              index={index}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
              {localExistingImages.map((image, index) => (
                <ImageCard key={image.id} image={image} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div>
          <Label>New Images (will be saved when you save the product)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
            {newImages.map((image, index) => (
              <div key={index} className="group relative">
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

      {/* Loading State */}
      {reordering && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Reordering images...</p>
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
