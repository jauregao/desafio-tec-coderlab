import type { Product } from "../types/product";
import { useCatalog } from "../context/catalog-context";
import { getCategoryPathById } from "../lib/category-tree";

interface ProductsTableProps {
  products: Product[];
  deletingId: number | null;
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductsTable({
  products,
  deletingId,
  loading = false,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const { categories } = useCatalog();

  const getCategoryTreeLabel = (product: Product) => {
    return getCategoryPathById(product.categoryId, categories);
  };

  return (
    <div className="surface-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria(s)</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr className="border-t border-[#D9D9D9]">
                <td className="text-muted px-4 py-8 text-center text-sm" colSpan={4}>
                  Aguardando resposta do servidor...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr className="border-t border-[#D9D9D9]">
                <td className="text-muted px-4 py-8 text-center text-sm" colSpan={4}>
                  Nenhum produto encontrado
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#D9D9D9]">
                <td className="px-4 py-3 font-medium text-[#07010F]">{product.name}</td>
                <td className="px-4 py-3 text-[#240D49]/80">{product.description}</td>
                <td className="px-4 py-3 text-[#240D49]/80">
                  {getCategoryTreeLabel(product) || "-"}
                </td>
                <td className="px-4 py-3 text-[#240D49]">
                  {product.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-[#D9D9D9] px-3 py-1.5 font-medium text-[#240D49] transition hover:bg-[#F1E5FF]"
                      onClick={() => onEdit(product.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === product.id}
                      className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onDelete(product.id)}
                    >
                      {deletingId === product.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
