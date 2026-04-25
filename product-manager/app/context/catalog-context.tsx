import {
  createContext,
  useContext,
  useMemo,
} from "react";
import type {
  CategoryFormValues,
  CategoryOption,
} from "../types/category";
import type {
  Product,
  ProductFormValues,
  ProductWithCategory,
} from "../types/product";
import { useCategoriesApi } from "../hooks/catalog/use-categories-api";
import { useProductsApi } from "../hooks/catalog/use-products-api";

interface CatalogContextValue {
  products: Product[];
  categories: CategoryOption[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  createProduct: (values: ProductFormValues) => Promise<void>;
  updateProduct: (id: number, values: ProductFormValues) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  createCategory: (values: CategoryFormValues) => Promise<void>;
  updateCategory: (id: number, values: CategoryFormValues) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoryById: (id: number) => CategoryOption | undefined;
  getProductById: (id: number) => ProductWithCategory | undefined;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const {
    products,
    isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  } = useProductsApi();

  const {
    categories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  } = useCategoriesApi();

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      isLoadingProducts,
      isLoadingCategories,
      createProduct,
      updateProduct,
      deleteProduct,
      createCategory,
      updateCategory,
      deleteCategory,
      getCategoryById,
      getProductById,
    }),
    [
      categories,
      createCategory,
      createProduct,
      deleteProduct,
      deleteCategory,
      getCategoryById,
      getProductById,
      isLoadingCategories,
      isLoadingProducts,
      products,
      updateCategory,
      updateProduct,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }

  return context;
}
