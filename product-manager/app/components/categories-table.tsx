import type { CategoryOption } from "../types/category";

interface CategoriesTableProps {
  categories: CategoryOption[];
  deletingId: number | null;
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CategoriesTable({
  categories,
  deletingId,
  loading = false,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="surface-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categorias</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr className="border-t border-[#D9D9D9]">
                <td className="text-muted px-4 py-8 text-center text-sm" colSpan={3}>
                  Aguardando resposta do servidor...
                </td>
              </tr>
            )}

            {!loading && categories.length === 0 && (
              <tr className="border-t border-[#D9D9D9]">
                <td className="text-muted px-4 py-8 text-center text-sm" colSpan={3}>
                  Nenhuma categoria encontrada
                </td>
              </tr>
            )}

            {categories.map((category) => {
              const hierarchy = category.fullPath || "-";

              return (
                <tr key={category.id} className="border-t border-[#D9D9D9]">
                  <td className="px-4 py-3 font-medium text-[#07010F]">{category.name}</td>
                  <td className="px-4 py-3 text-[#240D49]/80">{hierarchy || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-secondary rounded-md px-3 py-1.5"
                        onClick={() => onEdit(category.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === category.id}
                        className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => onDelete(category.id)}
                      >
                        {deletingId === category.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
