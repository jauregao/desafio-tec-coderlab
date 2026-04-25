export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: ProductCategory;
}

export interface ProductCategory {
  id: number;
  name: string;
  parentId: number | null;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

export interface ProductWithCategory {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: ProductCategory;
}
