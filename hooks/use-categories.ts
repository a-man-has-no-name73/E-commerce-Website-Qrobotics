"use client";

import { useState, useEffect } from 'react';

interface CategoryImage {
  id: number;
  url: string;
  publicId: string;
  fileName: string;
  isPrimary: boolean;
  createdAt: string;
}

interface Category {
  category_id: number;
  name: string;
  description?: string;
  created_at: string;
  images?: CategoryImage[];
  primaryImage?: CategoryImage;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const categoriesData = result.categories || [];
        
        // Fetch images for each category
        const categoriesWithImages = await Promise.all(
          categoriesData.map(async (category: Category) => {
            try {
              const imageResponse = await fetch(`/api/categories/images?categoryId=${category.category_id}`);
              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                const images = imageData.images || [];
                const primaryImage = images.find((img: CategoryImage) => img.isPrimary) || images[0];
                
                return {
                  ...category,
                  images,
                  primaryImage
                };
              }
            } catch (error) {
              console.error(`Failed to fetch images for category ${category.category_id}:`, error);
            }
            
            return category;
          })
        );
        
        setCategories(categoriesWithImages);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
