import { useState, useEffect } from "react";
import {
  getAllCategories,
  getCategoryTree,
  createCategory,
} from "../lib/category-service";
import type { Category, CategoryNode } from "../lib/category-service";
import { FiChevronDown, FiChevronRight, FiPlus } from "react-icons/fi";
import { toast } from "sonner";

interface CategorySelectorProps {
  selectedCategories: number[];
  onChange: (categoryIds: number[]) => void;
}

export default function CategorySelector({
  selectedCategories,
  onChange,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);

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
    onChange(
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
      setIsLoading(true);

      // Generate a slug from the category name
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create the new category
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        slug,
        parent: parentCategoryId,
      });

      if (categoryId) {
        // Successfully created category

        // Reset form
        setNewCategoryName("");
        setParentCategoryId(null);

        // Refresh categories list
        const allCategories = await getAllCategories();
        setCategories(allCategories);
        const tree = getCategoryTree(allCategories);
        setCategoryTree(tree);

        // If this is a child category, expand the parent to show the new category
        if (parentCategoryId) {
          setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            newSet.add(parentCategoryId);
            return newSet;
          });
        }

        // Auto-select the newly created category if needed
        if (!selectedCategories.includes(categoryId)) {
          onChange([...selectedCategories, categoryId]);
        }

        toast.success("Category created successfully");
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error creating category");
    } finally {
      setIsLoading(false);
    }
  };

  // Recursive render function for category tree
  const renderCategoryTree = (nodes: CategoryNode[], level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = node.id ? expandedCategories.has(node.id) : false;
      const isSelected = node.id ? selectedCategories.includes(node.id) : false;

      return (
        <div key={node.id} style={{ paddingLeft: `${level * 20}px` }}>
          <div className="flex items-center py-1.5">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => node.id && toggleExpand(node.id)}
                className="mr-1 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {isExpanded ? (
                  <FiChevronDown size={16} />
                ) : (
                  <FiChevronRight size={16} />
                )}
              </button>
            ) : (
              <span className="w-6"></span>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id={`category-${node.id}`}
                checked={isSelected}
                onChange={() => node.id && toggleCategorySelection(node.id)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`category-${node.id}`}
                className="text-sm cursor-pointer select-none"
              >
                {node.name}
              </label>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderCategoryTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Get parent category options for the dropdown
  const getParentCategoryOptions = () => {
    return [
      <option key="none" value="">
        -- Parent category --
      </option>,
      ...categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      )),
    ];
  };

  if (isLoading && categories.length === 0) {
    return <div className="p-4 text-center">Loading categories...</div>;
  }

  return (
    <div className="border rounded-md">
      <div className="p-2 max-h-[300px] overflow-y-auto">
        {categories.length > 0 ? (
          renderCategoryTree(categoryTree)
        ) : (
          <div className="p-2 text-sm text-muted-foreground">
            No categories found
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add new category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          />

          <select
            value={parentCategoryId || ""}
            onChange={(e) =>
              setParentCategoryId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          >
            {getParentCategoryOptions()}
          </select>

          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || isLoading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Adding...
              </>
            ) : (
              <>
                <FiPlus className="mr-1" />
                Add new category
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
