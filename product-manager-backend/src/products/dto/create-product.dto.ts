import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be a non-negative number' })
  price: number;

  @IsArray({ message: 'categoryIds must be an array' })
  @ArrayMinSize(1, { message: 'Product must have at least one category' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Each category id must be an integer' })
  categoryIds: number[];
}
