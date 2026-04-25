import type { CategoryOption, CategoryTreeNode } from "../types/category";

const TREE_SEPARATOR = " > ";

export function getCategoryPathById(
  categoryId: number,
  categories: CategoryOption[],
): string | undefined {
  return categories.find((category) => category.id === categoryId)?.fullPath;
}

export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryOption[] {
  const flat: CategoryOption[] = [];

  const walk = (node: CategoryTreeNode, parentPath: string, depth: number) => {
    const currentFullPath =
      node.fullPath || (parentPath ? `${parentPath}${TREE_SEPARATOR}${node.name}` : node.name);

    flat.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      fullPath: currentFullPath,
      ancestorsPath: parentPath || "-",
      depth,
    });

    for (const child of node.children) {
      walk(child, currentFullPath, depth + 1);
    }
  };

  for (const root of tree) {
    walk(root, "", 0);
  }

  return flat;
}

export function getLeafCategoryPathsByIds(
  categoryIds: number[],
  categories: CategoryOption[],
): string[] {
  const categoryPathById = new Map(categories.map((category) => [category.id, category.fullPath]));

  const uniquePaths = Array.from(
    new Set(
      categoryIds
        .map((id) => categoryPathById.get(id))
        .filter((path): path is string => Boolean(path)),
    ),
  );

  return uniquePaths.filter(
    (path) =>
      !uniquePaths.some(
        (otherPath) => otherPath !== path && otherPath.startsWith(`${path}${TREE_SEPARATOR}`),
      ),
  );
}

export function getSingleLeafCategoryId(
  categoryIds: number[],
  categories: CategoryOption[],
): number | undefined {
  const categoryPathById = new Map(categories.map((category) => [category.id, category.fullPath]));
  const validIds = categoryIds.filter((id) => categoryPathById.has(id));

  if (validIds.length === 0) {
    return undefined;
  }

  if (validIds.length === 1) {
    return validIds[0];
  }

  const leafId = validIds.find((id) => {
    const path = categoryPathById.get(id);

    if (!path) {
      return false;
    }

    return !validIds.some((otherId) => {
      if (otherId === id) {
        return false;
      }

      const otherPath = categoryPathById.get(otherId);
      return Boolean(otherPath && otherPath.startsWith(`${path}${TREE_SEPARATOR}`));
    });
  });

  return leafId ?? validIds[0];
}
