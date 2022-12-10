import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  @ApiProperty({
    default: 1,
    type: Number,
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    default: 10,
    type: Number,
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    default: Order.ASC,
    enum: Order,
    required: false
  })
  @IsEnum(Order)
  @IsOptional()
  order?: Order;


  @ApiProperty({
    default: 'createdAt',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  orderBy?: string;
}
