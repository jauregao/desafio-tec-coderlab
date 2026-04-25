import { CategoriesTable } from "../categories-table";
import { ProductsTable } from "../products-table";
import type { CategoryOption } from "../../types/category";
import type { Product } from "../../types/product";
import type { HomeTableView } from "./home-types";

interface HomeContentProps {
  tableView: HomeTableView;
  filteredProducts: Product[];
  filteredCategories: CategoryOption[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productDeletingId: number | null;
  categoryDeletingId: number | null;
  onEditProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onEditCategory: (id: number) => void;
  onDeleteCategory: (id: number) => void;
}

export function HomeContent({
  tableView,
  filteredProducts,
  filteredCategories,
  isLoadingProducts,
  isLoadingCategories,
  productDeletingId,
  categoryDeletingId,
  onEditProduct,
  onDeleteProduct,
  onEditCategory,
  onDeleteCategory,
}: HomeContentProps) {
  if (tableView === "products") {
    return (
      <ProductsTable
        products={filteredProducts}
        deletingId={productDeletingId}
        loading={isLoadingProducts}
        onEdit={onEditProduct}
        onDelete={onDeleteProduct}
      />
    );
  }

  return (
    <CategoriesTable
      categories={filteredCategories}
      deletingId={categoryDeletingId}
      loading={isLoadingCategories}
      onEdit={onEditCategory}
      onDelete={onDeleteCategory}
    />
  );
}
