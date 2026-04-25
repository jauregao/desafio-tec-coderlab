-- Add nullable categoryId column first so we can backfill from product_categories
ALTER TABLE "products"
ADD COLUMN "categoryId" INTEGER;

-- Backfill categoryId from existing product-category relations.
-- If a product has multiple categories, we keep the lowest categoryId.
UPDATE "products" AS p
SET "categoryId" = pc_min."categoryId"
FROM (
  SELECT
    pc."productId",
    MIN(pc."categoryId") AS "categoryId"
  FROM "product_categories" AS pc
  GROUP BY pc."productId"
) AS pc_min
WHERE p."id" = pc_min."productId";

-- Fail fast if there are products without any linked category.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "products" WHERE "categoryId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate: there are products without category relation in product_categories';
  END IF;
END $$;

-- Enforce new one-category-per-product model
ALTER TABLE "products"
ALTER COLUMN "categoryId" SET NOT NULL;

CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

ALTER TABLE "products"
ADD CONSTRAINT "products_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove old join table now that relation is 1:N
DROP TABLE "product_categories";
