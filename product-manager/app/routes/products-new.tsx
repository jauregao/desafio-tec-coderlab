import type { Route } from "./+types/products-new";
import { useNavigate, useSearchParams } from "react-router";
import { useMemo, useState } from "react";
import { CatalogTabs } from "../components/catalog-tabs";
import { ProductForm } from "../components/product-form";
import { PageHero } from "../components/page-hero";
import { useCatalog } from "../context/catalog-context";
import type { ProductFormValues } from "../types/product";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Novo Produto - Gerenciador de Produtos" },
    { name: "description", content: "Cadastro de produto em rota dedicada" },
  ];
}

export default function ProductsNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = Number(searchParams.get("productId"));
  const { categories, isLoadingCategories, createProduct, updateProduct, getProductById } =
    useCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingProduct = Number.isNaN(productId) ? undefined : getProductById(productId);

  const initialValues = useMemo<ProductFormValues | undefined>(() => {
    if (!editingProduct) {
      return undefined;
    }

    return {
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      categoryId: editingProduct.categoryId,
    };
  }, [editingProduct]);

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
      } else {
        await createProduct(values);
      }

      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <PageHero
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        description="Cadastre novos produtos para organizar seu catálogo e facilitar a gestão do seu negócio."
        actions={<CatalogTabs name="Produtos" />}
      />

      <section className="grid gap-6">
        <ProductForm
          categories={categories}
          initialValues={initialValues}
          isSubmitting={isSubmitting || isLoadingCategories}
          onCancelEdit={() => navigate("/")}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}
