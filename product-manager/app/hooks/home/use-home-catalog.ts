import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useCatalog } from "../../context/catalog-context";
import { useDeleteConfirmation } from "./use-delete-confirmation";
import { useDebouncedValue } from "../use-debounced-value";
import type { CategoryOption } from "../../types/category";
import type { Product } from "../../types/product";
import type { HomeTableView } from "../../components/home/home-types";

interface UseHomeCatalogResult {
  tableView: HomeTableView;
  search: string;
  summaryText: string;
  filteredProducts: Product[];
  filteredCategories: CategoryOption[];
  productToDelete: number | null;
  categoryToDelete: number | null;
  isDeleting: boolean;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  setSearch: (value: string) => void;
  showProductsView: () => void;
  showCategoriesView: () => void;
  handleEditProduct: (id: number) => void;
  handleEditCategory: (id: number) => void;
  handleDeleteProductRequest: (id: number) => void;
  handleDeleteCategoryRequest: (id: number) => void;
  handleCancelProductDeletion: () => void;
  handleCancelCategoryDeletion: () => void;
  handleConfirmDeleteProduct: () => void;
  handleConfirmDeleteCategory: () => void;
}

export function useHomeCatalog(): UseHomeCatalogResult {
  const navigate = useNavigate();
  const {
    products,
    categories,
    deleteProduct,
    deleteCategory,
    isLoadingProducts,
    isLoadingCategories,
  } = useCatalog();

  const [search, setSearch] = useState("");
  const [tableView, setTableView] = useState<HomeTableView>("products");
  const debouncedSearch = useDebouncedValue(search, 250);
  const productDeletion = useDeleteConfirmation(deleteProduct);
  const categoryDeletion = useDeleteConfirmation(deleteCategory);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [debouncedSearch, products]);

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, debouncedSearch]);

  const summaryText = useMemo(() => {
    if (tableView === "products") {
      if (isLoadingProducts) {
        return "Carregando produtos...";
      }

      if (filteredProducts.length === 0) {
        return "Nenhum produto encontrado";
      }

      return `${filteredProducts.length} produto(s) encontrado(s)`;
    }

    if (isLoadingCategories) {
      return "Carregando categorias...";
    }

    if (filteredCategories.length === 0) {
      return "Nenhuma categoria encontrada";
    }

    return `${filteredCategories.length} categoria(s) encontrada(s)`;
  }, [
    filteredCategories.length,
    filteredProducts.length,
    isLoadingCategories,
    isLoadingProducts,
    tableView,
  ]);

  const showProductsView = useCallback(() => {
    setTableView("products");
  }, []);

  const showCategoriesView = useCallback(() => {
    setTableView("categories");
  }, []);

  const handleEditProduct = useCallback(
    (id: number) => {
      navigate(`/products/new?productId=${id}`);
    },
    [navigate],
  );

  const handleEditCategory = useCallback(
    (id: number) => {
      navigate(`/categories/new?categoryId=${id}`);
    },
    [navigate],
  );

  const isDeleting = productDeletion.isDeleting || categoryDeletion.isDeleting;

  return {
    tableView,
    search,
    summaryText,
    filteredProducts,
    filteredCategories,
    productToDelete: productDeletion.itemToDelete,
    categoryToDelete: categoryDeletion.itemToDelete,
    isDeleting,
    isLoadingProducts,
    isLoadingCategories,
    setSearch,
    showProductsView,
    showCategoriesView,
    handleEditProduct,
    handleEditCategory,
    handleDeleteProductRequest: productDeletion.requestDelete,
    handleDeleteCategoryRequest: categoryDeletion.requestDelete,
    handleCancelProductDeletion: productDeletion.cancelDelete,
    handleCancelCategoryDeletion: categoryDeletion.cancelDelete,
    handleConfirmDeleteProduct: productDeletion.confirmDelete,
    handleConfirmDeleteCategory: categoryDeletion.confirmDelete,
  };
}
