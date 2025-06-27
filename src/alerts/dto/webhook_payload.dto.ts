import { IsString, IsIn, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  symbol: string;
  
  @IsString()
  @IsIn(['buy', 'sell'])
  side: string;
  
  @IsString()
  @IsIn(['market', 'limit'])
  type: string;
  
  @IsNumber()
  quantity: number;
  
  @IsOptional()
  @IsNumber()
  price?: number;
  
  @IsOptional()
  @IsNumber()
  leverage?: number;
  
  @IsOptional()
  @IsBoolean()
  reduce_only?: boolean;
}