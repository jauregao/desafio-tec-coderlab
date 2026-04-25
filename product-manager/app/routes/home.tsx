import type { Route } from "./+types/home";
import { ConfirmDialog } from "../components/confirm-dialog";
import { HomeContent } from "../components/home/home-content";
import { HomeFilters } from "../components/home/home-filters";
import { HomeHeader } from "../components/home/home-header";
import { useHomeCatalog } from "../hooks/home/use-home-catalog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gerenciador de Produtos - Coderlab" },
    { name: "description", content: "Desafio técnico da Coderlab" },
  ];
}

export default function Home() {
  const {
    tableView,
    search,
    summaryText,
    filteredProducts,
    filteredCategories,
    productToDelete,
    categoryToDelete,
    isDeleting,
    isLoadingProducts,
    isLoadingCategories,
    setSearch,
    showProductsView,
    showCategoriesView,
    handleEditProduct,
    handleDeleteProductRequest,
    handleEditCategory,
    handleDeleteCategoryRequest,
    handleCancelProductDeletion,
    handleConfirmDeleteProduct,
    handleCancelCategoryDeletion,
    handleConfirmDeleteCategory,
  } = useHomeCatalog();

  return (
    <main className="page-shell">
      <HomeHeader tableView={tableView} />

      <section className="grid gap-4">
        <HomeFilters
          tableView={tableView}
          search={search}
          summaryText={summaryText}
          onSearchChange={setSearch}
          onShowProductsView={showProductsView}
          onShowCategoriesView={showCategoriesView}
        />

        <HomeContent
          tableView={tableView}
          filteredProducts={filteredProducts}
          filteredCategories={filteredCategories}
          isLoadingProducts={isLoadingProducts}
          isLoadingCategories={isLoadingCategories}
          productDeletingId={isDeleting ? productToDelete : null}
          categoryDeletingId={isDeleting ? categoryToDelete : null}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProductRequest}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategoryRequest}
        />
      </section>

      <ConfirmDialog
        open={productToDelete != null}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto?"
        confirmLabel="Excluir produto"
        isConfirming={isDeleting}
        onCancel={handleCancelProductDeletion}
        onConfirm={handleConfirmDeleteProduct}
      />

      <ConfirmDialog
        open={categoryToDelete != null}
        title="Excluir categoria"
        description="Tem certeza que deseja excluir esta categoria?"
        confirmLabel="Excluir categoria"
        isConfirming={isDeleting}
        onCancel={handleCancelCategoryDeletion}
        onConfirm={handleConfirmDeleteCategory}
      />
    </main>
  );
}
