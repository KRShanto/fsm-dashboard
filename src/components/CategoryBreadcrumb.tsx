import React, { useEffect, useState } from "react";
import {
  getCategoriesByProductId,
  getAllCategories,
} from "../lib/category-service";
import type { Category } from "../lib/category-service";
import { FiChevronRight } from "react-icons/fi";

interface CategoryBreadcrumbProps {
  productId: number;
}

export default function CategoryBreadcrumb({
  productId,
}: CategoryBreadcrumbProps) {
  const [categoryPaths, setCategoryPaths] = useState<Category[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryPaths = async () => {
      try {
        setLoading(true);
        // Get all category IDs for this product
        const categoryIds = await getCategoriesByProductId(productId);

        if (categoryIds.length === 0) {
          setLoading(false);
          return;
        }

        // Get all categories to build paths
        const allCategories = await getAllCategories();

        // Create a map for quick access
        const categoryMap = new Map<number, Category>();
        allCategories.forEach((category) => {
          if (category.id) {
            categoryMap.set(category.id, category);
          }
        });

        // Build paths for each category
        const paths: Category[][] = [];

        for (const categoryId of categoryIds) {
          if (categoryMap.has(categoryId)) {
            const path: Category[] = [];
            let currentCategory = categoryMap.get(categoryId);

            // Build the path starting from the leaf category up to the root
            while (currentCategory) {
              path.unshift(currentCategory); // Add to beginning of array

              // Move to parent if exists
              if (
                currentCategory.parent &&
                categoryMap.has(currentCategory.parent)
              ) {
                currentCategory = categoryMap.get(currentCategory.parent);
              } else {
                currentCategory = undefined;
              }
            }

            paths.push(path);
          }
        }

        setCategoryPaths(paths);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category breadcrumbs:", error);
        setLoading(false);
      }
    };

    fetchCategoryPaths();
  }, [productId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading categories...</div>;
  }

  if (categoryPaths.length === 0) {
    return null; // Don't show anything if no categories
  }

  return (
    <div className="flex flex-col space-y-2 mb-4">
      {categoryPaths.map((path, pathIndex) => (
        <div
          key={pathIndex}
          className="flex flex-wrap items-center text-sm text-gray-600"
        >
          {path.map((category, index) => (
            <React.Fragment key={category.id}>
              <span className="hover:text-primary cursor-pointer">
                {category.name}
              </span>
              {index < path.length - 1 && (
                <FiChevronRight className="mx-2 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
