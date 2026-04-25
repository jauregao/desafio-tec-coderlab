import { useCallback } from "react";
import { useToast } from "../../components/toast";
import { useApiRequest } from "../use-api-request";
import { useData } from "../use-data";
import type {
  Product,
  ProductFormValues,
  ProductWithCategory,
} from "../../types/product";

interface UseProductsApiResult {
  products: Product[];
  isLoadingProducts: boolean;
  createProduct: (values: ProductFormValues) => Promise<void>;
  updateProduct: (id: number, values: ProductFormValues) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => ProductWithCategory | undefined;
}

export function useProductsApi(): UseProductsApiResult {
  const toast = useToast();
  const { run } = useApiRequest();

  const {
    data: productsData,
    setData: setProducts,
    loading: isLoadingProducts,
  } = useData<Product[]>("/product", {
    retries: 24,
    retryDelayMs: 2500,
  });

  const products = productsData ?? [];

  const createProduct = useCallback(
    async (values: ProductFormValues) => {
      try {
        const created = await run<ProductWithCategory>("/product", {
          method: "POST",
          body: JSON.stringify(values),
        });

        setProducts((current) => [...(current ?? []), created]);
        toast.success("Produto criado com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel criar o produto",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [run, setProducts, toast],
  );

  const updateProduct = useCallback(
    async (id: number, values: ProductFormValues) => {
      try {
        const updated = await run<ProductWithCategory>(`/product/${id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });

        setProducts((current) =>
          (current ?? []).map((product) => (product.id === id ? updated : product)),
        );
        toast.success("Produto atualizado com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel atualizar o produto",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [run, setProducts, toast],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      try {
        await run(`/product/${id}`, { method: "DELETE" });
        setProducts((current) => (current ?? []).filter((product) => product.id !== id));
        toast.success("Produto removido com sucesso");
      } catch (error) {
        toast.error(
          "Não foi possivel excluir o produto",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
    [run, setProducts, toast],
  );

  const getProductById = useCallback(
    (id: number) => {
      return products.find((item) => item.id === id) as ProductWithCategory | undefined;
    },
    [products],
  );

  return {
    products,
    isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
}
