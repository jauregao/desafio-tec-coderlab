export interface CategoryOption {
  id: number;
  name: string;
  parentId: number | null;
  fullPath: string;
  ancestorsPath: string;
  depth: number;
}

export interface CategoryFormValues {
  name: string;
  parentId: number | null;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  fullPath: string;
  children: CategoryTreeNode[];
}
