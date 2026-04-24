export interface CategoryTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  fullPath: string;
  children: CategoryTreeNode[];
}
