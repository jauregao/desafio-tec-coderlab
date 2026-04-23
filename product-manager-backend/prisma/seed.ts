/* eslint-disable prettier/prettier */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Please set it in the environment variables.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

type CategorySeed = {
  key: string;
  name: string;
  parentKey?: string;
};

const categorySeeds: CategorySeed[] = [
  { key: 'electronics', name: 'Eletrônicos' },
  { key: 'computers', name: 'Computadores', parentKey: 'electronics' },
  { key: 'notebooks', name: 'Notebooks', parentKey: 'computers' },
  { key: 'desktops', name: 'Desktops', parentKey: 'computers' },
  { key: 'accessories', name: 'Acessórios', parentKey: 'electronics' },
  { key: 'phones', name: 'Celulares', parentKey: 'electronics' },
  { key: 'home', name: 'Casa' },
  { key: 'kitchen', name: 'Cozinha', parentKey: 'home' },
  { key: 'furniture', name: 'Móveis', parentKey: 'home' },
  { key: 'fashion', name: 'Moda' },
  { key: 'mens', name: 'Masculino', parentKey: 'fashion' },
  { key: 'womens', name: 'Feminino', parentKey: 'fashion' },
];

function validateNoHierarchyLoops(seeds: CategorySeed[]): void {
  const byKey = new Map(seeds.map((seed) => [seed.key, seed]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string, chain: string[]): void => {
    if (visited.has(key)) {
      return;
    }

    if (visiting.has(key)) {
      throw new Error(
        `Category loop detected: ${[...chain, key].join(' -> ')}`,
      );
    }

    const seed = byKey.get(key);

    if (!seed) {
      throw new Error(`Referenced category not found: ${key}`);
    }

    visiting.add(key);

    if (seed.parentKey) {
      if (seed.parentKey === seed.key) {
        throw new Error(`Category cannot be its own parent: ${seed.key}`);
      }

      visit(seed.parentKey, [...chain, key]);
    }

    visiting.delete(key);
    visited.add(key);
  };

  for (const seed of seeds) {
    visit(seed.key, []);
  }
}

async function main(): Promise<void> {
  validateNoHierarchyLoops(categorySeeds);

  await prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    const createdIds = new Map<string, number>();

    for (const seed of categorySeeds) {
      const parentId = seed.parentKey ? createdIds.get(seed.parentKey) : null;

      if (seed.parentKey && parentId == null) {
        throw new Error(
          `Parent not found for category ${seed.key}: ${seed.parentKey}`,
        );
      }

      const category = await tx.category.create({
        data: {
          name: seed.name,
          parentId,
        },
      });

      createdIds.set(seed.key, category.id);
    }
  });

  console.log(`Seed completed: ${categorySeeds.length} categories created.`);
}

main()
  .catch((error) => {
    console.error('Error occurred while running seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
