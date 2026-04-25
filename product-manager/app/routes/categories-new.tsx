import type { Route } from "./+types/categories-new";
import { useNavigate, useSearchParams } from "react-router";
import { useMemo, useState } from "react";
import { CatalogTabs } from "../components/catalog-tabs";
import { CategoryForm } from "../components/category-form";
import { PageHero } from "../components/page-hero";
import { useCatalog } from "../context/catalog-context";
import type { CategoryFormValues } from "../types/category";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nova Categoria - Gerenciador de Produtos" },
    { name: "description", content: "Cadastro de categoria em rota dedicada" },
  ];
}

export default function CategoriesNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = Number(searchParams.get("categoryId"));
  const { categories, isLoadingCategories, createCategory, updateCategory, getCategoryById } =
    useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editingCategory = Number.isNaN(categoryId) ? undefined : getCategoryById(categoryId);

  const initialValues = useMemo<CategoryFormValues | undefined>(() => {
    if (!editingCategory) {
      return undefined;
    }

    return {
      name: editingCategory.name,
      parentId: editingCategory.parentId,
    };
  }, [editingCategory]);

  const disabledParentIds = useMemo<number[]>(() => {
    if (!editingCategory) {
      return [];
    }

    const childrenById = new Map<number, number[]>();

    for (const category of categories) {
      if (category.parentId === null) {
        continue;
      }

      const siblings = childrenById.get(category.parentId) ?? [];
      siblings.push(category.id);
      childrenById.set(category.parentId, siblings);
    }

    const visited = new Set<number>([editingCategory.id]);
    const stack = [...(childrenById.get(editingCategory.id) ?? [])];

    while (stack.length > 0) {
      const currentId = stack.pop();

      if (currentId === undefined || visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);
      stack.push(...(childrenById.get(currentId) ?? []));
    }

    return [...visited];
  }, [categories, editingCategory]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
      } else {
        await createCategory(values);
      }

      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <PageHero
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
        description="Cadastre uma nova categoria para organizar seus produtos."
        actions={<CatalogTabs name="Categorias" />}
      />

      <section className="grid gap-6">
        <CategoryForm
          categories={categories}
          disabledParentIds={disabledParentIds}
          initialValues={initialValues}
          isSubmitting={isSubmitting || isLoadingCategories}
          onCancel={() => navigate("/")}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
