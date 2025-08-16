import { IsString, IsOptional, IsNumber } from 'class-validator';

export class EmployeeUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;
}