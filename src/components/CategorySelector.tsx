import { useState, useEffect } from "react";
import {
  getAllCategories,
  getCategoryTree,
  createCategory,
} from "../lib/category-service";
import type { Category, CategoryNode } from "../lib/category-service";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";

interface CategorySelectorProps {
  selectedCategories: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  showCountry?: boolean;
}

export default function CategorySelector({
  selectedCategories,
  onCategoryChange,
  showCountry = true,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState<number | null>(
    null
  );
  const [newCategoryCountry, setNewCategoryCountry] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      try {
        const allCategories = await getAllCategories();
        setCategories(allCategories);
        const tree = getCategoryTree(allCategories);
        setCategoryTree(tree);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Toggle category expanded state
  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle category selection
  const toggleCategorySelection = (categoryId: number) => {
    onCategoryChange(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  // Handle category creation
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      // Disable form during submission
      setIsSubmitting(true);

      // Generate a slug from the category name
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create the new category
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        slug,
        parent: newCategoryParent,
        country: newCategoryCountry,
      });

      if (categoryId) {
        // Successfully created category

        // Reset form
        setNewCategoryName("");
        setNewCategorySlug("");
        setNewCategoryParent(null);
        setNewCategoryCountry("");

        // Refresh categories list
        const allCategories = await getAllCategories();
        setCategories(allCategories);
        const tree = getCategoryTree(allCategories);
        setCategoryTree(tree);

        // If this is a child category, expand the parent to show the new category
        if (newCategoryParent) {
          setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            newSet.add(newCategoryParent);
            return newSet;
          });
        }

        // Auto-select the newly created category if needed
        if (!selectedCategories.includes(categoryId)) {
          onCategoryChange([...selectedCategories, categoryId]);
        }

        toast.success("Category created successfully");
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error creating category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryItem = (node: CategoryNode) => {
    if (!node.id) return null;

    const isSelected = selectedCategories.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories.has(node.id);

    return (
      <div key={node.id} className="py-1">
        <div className="flex items-center">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id as number)}
              className="mr-2 text-gray-500 hover:text-primary focus:outline-none h-8 w-8 flex items-center justify-center text-xl bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isExpanded ? "-" : "+"}
            </button>
          ) : (
            <span className="w-8 h-8 mr-2"></span>
          )}

          <label className="flex items-center space-x-2 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCategorySelection(node.id as number)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm">
              {node.name}
              {showCountry && node.country && (
                <span className="text-gray-500 ml-2">({node.country})</span>
              )}
            </span>
          </label>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1">{renderCategoryTree(node.children)}</div>
        )}
      </div>
    );
  };

  const renderCategoryTree = (nodes: CategoryNode[]) => {
    return nodes.map((node) => renderCategoryItem(node));
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Categories</h3>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            <FiPlus className="mr-1" /> Add Category
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {renderCategoryTree(categoryTree)}
        </div>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Add New Category</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Category name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Slug (optional)
              </label>
              <input
                type="text"
                id="slug"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="category-slug"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country (optional)
              </label>
              <input
                type="text"
                id="country"
                value={newCategoryCountry}
                onChange={(e) => setNewCategoryCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Country"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="parent"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Parent Category
              </label>
              <select
                id="parent"
                value={newCategoryParent || ""}
                onChange={(e) =>
                  setNewCategoryParent(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
              >
                <option value="">None (top level)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Category"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
