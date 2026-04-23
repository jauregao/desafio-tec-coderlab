import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ProductsModule, CategoriesModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
