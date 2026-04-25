interface ProductSearchProps {
  search: string;
  summaryText: string;
  onSearchChange: (value: string) => void;
}

export function ProductSearch({
  search,
  summaryText,
  onSearchChange,
}: ProductSearchProps) {
  return (
    <div className="rounded-xl border border-[#D9D9D9] bg-white p-4 shadow-sm">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-[#240D49]">Filtro por nome</span>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          placeholder="Digite para pesquisar"
          className="rounded-lg border border-[#D9D9D9] px-3 py-2 outline-none transition focus:border-[#812FF1]"
        />
      </label>

      <p className="mt-3 text-sm text-[#240D49]/80">{summaryText}</p>
    </div>
  );
}
