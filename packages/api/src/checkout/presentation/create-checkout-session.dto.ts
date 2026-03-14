import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class LineItemDto {
  @IsOptional()
  @IsString()
  price_id?: string;

  @IsOptional()
  @IsString()
  product_id?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutSessionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  line_items: LineItemDto[];

  @IsOptional()
  @IsString()
  success_url?: string;

  @IsOptional()
  @IsString()
  cancel_url?: string;
}
