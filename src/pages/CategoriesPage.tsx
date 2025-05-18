import { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from "../lib/category-service";
import type { Category, CategoryNode } from "../lib/category-service";
import PageTitle from "../components/PageTitle";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState<number | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParent, setEditParent] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
      const tree = getCategoryTree(data);
      setCategoryTree(tree);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    // Disable the form during submission
    setIsSubmitting(true);

    let slug = newCategorySlug.trim();
    if (!slug) {
      // Generate slug from name if not provided
      slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    try {
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        slug,
        parent: newCategoryParent,
      });

      if (categoryId) {
        // Reset form and refresh categories
        setNewCategoryName("");
        setNewCategorySlug("");
        setNewCategoryParent(null);

        // Fetch updated categories
        const data = await getAllCategories();
        setCategories(data);
        const tree = getCategoryTree(data);
        setCategoryTree(tree);

        // If this is a child category, expand the parent to show the new category
        if (newCategoryParent) {
          setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            newSet.add(newCategoryParent);
            return newSet;
          });
        }

        toast.success("Category created successfully");
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category.id || null);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditParent(category.parent || null);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName("");
    setEditSlug("");
    setEditParent(null);
  };

  const saveEdit = async (categoryId: number) => {
    if (!editName.trim()) return;

    try {
      await updateCategory(categoryId, {
        name: editName.trim(),
        slug: editSlug.trim(),
        parent: editParent,
      });

      // Refresh categories and exit edit mode
      await fetchCategories();
      cancelEditing();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    // Confirm deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This will remove it from all products."
      )
    ) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await fetchCategories();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

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

  const renderCategoryItem = (category: Category) => {
    const isEditing = editingCategory === category.id;
    const parentCategory = category.parent
      ? categories.find((c) => c.id === category.parent)
      : null;

    if (!category.id) return null;

    return (
      <div className="py-2" key={category.id}>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
              placeholder="Category name"
            />
            <input
              type="text"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
              placeholder="category-slug"
            />
            <select
              value={editParent || ""}
              onChange={(e) =>
                setEditParent(e.target.value ? Number(e.target.value) : null)
              }
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="">No parent (top level)</option>
              {categories
                .filter((c) => c.id !== category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => saveEdit(category.id as number)}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md"
              >
                <FiCheck className="mr-1" /> Save
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md"
              >
                <FiX className="mr-1" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="text-gray-400 text-sm ml-2">
                {category.slug}
              </span>
              {parentCategory && (
                <span className="text-sm text-gray-500 ml-2">
                  (Parent: {parentCategory.name})
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => startEditing(category)}
                className="p-1 text-gray-500 hover:text-blue-500"
                title="Edit category"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id as number)}
                className="p-1 text-gray-500 hover:text-red-500"
                title="Delete category"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Recursive render function for category tree
  const renderCategoryTree = (nodes: CategoryNode[], level = 0) => {
    return nodes
      .map((node) => {
        if (!node.id) return null;

        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedCategories.has(node.id as number);

        return (
          <div
            key={node.id}
            className="border-b border-gray-100 last:border-b-0"
          >
            <div
              className="flex items-center"
              style={{ paddingLeft: `${level * 20}px` }}
            >
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

              <div className="flex-1">{renderCategoryItem(node)}</div>
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-6">
                {renderCategoryTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Categories" />

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2">⟳</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-1" />
                    Add Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">
              No categories found. Create your first category above.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {renderCategoryTree(categoryTree)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
