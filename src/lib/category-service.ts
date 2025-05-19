import supabase from "../supabase-client";

export interface Category {
  id?: number;
  created_at?: string;
  name: string;
  slug: string;
  parent?: number | null;
  country?: string | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/**
 * Create a new category
 */
export async function createCategory(
  category: Omit<Category, "id" | "created_at">
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select("id")
      .single();

    if (error) {
      console.error("Error creating category:", error.message);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Error in createCategory:", error);
    return null;
  }
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return [];
  }
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching category:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return null;
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  id: number,
  category: Partial<Omit<Category, "id" | "created_at">>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return false;
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<boolean> {
  try {
    // First update all products that use this category to remove it
    const { error: productCategoryError } = await supabase
      .from("product_categories")
      .delete()
      .eq("category", id);

    if (productCategoryError) {
      console.error(
        "Error removing product categories:",
        productCategoryError.message
      );
      return false;
    }

    // Next update all child categories to make them root categories
    const { error: childCategoryError } = await supabase
      .from("categories")
      .update({ parent: null })
      .eq("parent", id);

    if (childCategoryError) {
      console.error(
        "Error updating child categories:",
        childCategoryError.message
      );
      return false;
    }

    // Finally delete the category
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return false;
  }
}

/**
 * Get categories organized as a tree with parent-child relationships
 */
export function getCategoryTree(categories: Category[]): CategoryNode[] {
  // Create a map of all categories
  const categoryMap = new Map<number, CategoryNode>();
  categories.forEach((category) => {
    if (category.id) {
      categoryMap.set(category.id, { ...category, children: [] });
    }
  });

  // Build the tree structure
  const rootNodes: CategoryNode[] = [];

  categories.forEach((category) => {
    if (category.id) {
      const node = categoryMap.get(category.id)!;

      if (category.parent && categoryMap.has(category.parent)) {
        // This is a child node, add it to its parent
        const parentNode = categoryMap.get(category.parent)!;
        parentNode.children.push(node);
      } else {
        // This is a root node
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}

/**
 * Associate a product with categories
 */
export async function associateProductWithCategories(
  productId: number,
  categoryIds: number[]
): Promise<boolean> {
  try {
    // First remove any existing associations
    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product", productId);

    if (deleteError) {
      console.error(
        "Error removing existing product categories:",
        deleteError.message
      );
      return false;
    }

    // Skip if no categories to add
    if (categoryIds.length === 0) {
      return true;
    }

    // Create new associations
    const records = categoryIds.map((categoryId) => ({
      product: productId,
      category: categoryId,
    }));

    const { error } = await supabase.from("product_categories").insert(records);

    if (error) {
      console.error(
        "Error associating product with categories:",
        error.message
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in associateProductWithCategories:", error);
    return false;
  }
}

/**
 * Get categories for a product
 */
export async function getCategoriesByProductId(
  productId: number
): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("category")
      .eq("product", productId);

    if (error) {
      console.error("Error fetching product categories:", error.message);
      return [];
    }

    return data.map((item) => item.category) || [];
  } catch (error) {
    console.error("Error in getCategoriesByProductId:", error);
    return [];
  }
}
