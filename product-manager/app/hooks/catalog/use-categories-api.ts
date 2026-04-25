import { useCallback, useMemo } from "react";
import { useToast } from "../../components/toast";
import { flattenCategoryTree } from "../../lib/category-tree";
import type {
  CategoryFormValues,
  CategoryOption,
  CategoryTreeNode,
} from "../../types/category";
import { useApiRequest } from "../use-api-request";
import { useData } from "../use-data";

interface UseCategoriesApiResult {
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  createCategory: (values: CategoryFormValues) => Promise<void>;
  updateCategory: (id: number, values: CategoryFormValues) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoryById: (id: number) => CategoryOption | undefined;
}

export function useCategoriesApi(): UseCategoriesApiResult {
  const toast = useToast();
  const { run } = useApiRequest();

  const {
    data: categoriesTreeData,
    refetch: refetchCategories,
    loading: isLoadingCategories,
  } = useData<CategoryTreeNode[]>("/category/tree", {
    retries: 24,
    retryDelayMs: 2500,
  });

  const categories = useMemo(() => {
    return flattenCategoryTree(categoriesTreeData ?? []);
  }, [categoriesTreeData]);

  const createCategory = useCallback(
    async (values: CategoryFormValues) => {
      try {
        await run<CategoryOption>("/category", {
          method: "POST",
          body: JSON.stringify({
            name: values.name,
            parentId: values.parentId ?? undefined,
          }),
        });

        await refetchCategories();
        toast.success("Categoria criada com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel criar a categoria",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [refetchCategories, run, toast],
  );

  const updateCategory = useCallback(
    async (id: number, values: CategoryFormValues) => {
      try {
        await run(`/category/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: values.name,
            parentId: values.parentId,
          }),
        });

        await refetchCategories();
        toast.success("Categoria atualizada com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel atualizar a categoria",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [refetchCategories, run, toast],
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      try {
        await run(`/category/${id}`, { method: "DELETE" });
        await refetchCategories();
        toast.success("Categoria removida com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel excluir a categoria",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [refetchCategories, run, toast],
  );

  const getCategoryById = useCallback(
    (id: number) => {
      return categories.find((item) => item.id === id);
    },
    [categories],
  );

  return {
    categories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
