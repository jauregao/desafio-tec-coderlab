import { NavLink } from "react-router";

const baseClassName =
  "rounded-full px-4 py-2 text-sm font-semibold transition border";

const activeClassName = "border-white bg-white text-[#240D49]";
const inactiveClassName = "border-white/25 text-white hover:bg-white/10";

export function CatalogTabs({ name }: { name: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <NavLink to="/" end className={`${baseClassName} ${inactiveClassName}`}>
        Voltar
      </NavLink>
      <div className={`${baseClassName} ${activeClassName}`}>{name}</div>
    </div>
  );
}
