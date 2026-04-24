import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'parentId must be an integer' })
  @Min(1, { message: 'parentId must be greater than 0' })
  parentId?: number;
}
