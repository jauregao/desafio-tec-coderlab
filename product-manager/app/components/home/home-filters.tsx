import { ProductSearch } from "../product-search";
import { HomeViewToggle } from "./home-view-toggle";
import type { HomeTableView } from "./home-types";

interface HomeFiltersProps {
  tableView: HomeTableView;
  search: string;
  summaryText: string;
  onSearchChange: (value: string) => void;
  onShowProductsView: () => void;
  onShowCategoriesView: () => void;
}

export function HomeFilters({
  tableView,
  search,
  summaryText,
  onSearchChange,
  onShowProductsView,
  onShowCategoriesView,
}: HomeFiltersProps) {
  return (
    <>
      <ProductSearch search={search} summaryText={summaryText} onSearchChange={onSearchChange} />

      <div className="flex gap-2">
        <HomeViewToggle isActive={tableView === "products"} onClick={onShowProductsView}>
          Produtos
        </HomeViewToggle>
        <HomeViewToggle isActive={tableView === "categories"} onClick={onShowCategoriesView}>
          Categorias
        </HomeViewToggle>
      </div>
    </>
  );
}
