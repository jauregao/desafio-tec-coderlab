import { Link } from "react-router";
import { PageHero } from "../page-hero";
import type { HomeTableView } from "./home-types";

interface HomeHeaderProps {
  tableView: HomeTableView;
}

export function HomeHeader({ tableView }: HomeHeaderProps) {
  const isProductsView = tableView === "products";

  return (
    <PageHero
      title="Gerenciador de Produtos"
      description={`Listagem de ${isProductsView ? "produtos" : "categorias"}.`}
      actions={
        isProductsView ? (
          <Link to="/products/new" className="btn-primary">
            Criar produto
          </Link>
        ) : (
          <Link to="/categories/new" className="btn-primary">
            Criar categoria
          </Link>
        )
      }
    />
  );
}
