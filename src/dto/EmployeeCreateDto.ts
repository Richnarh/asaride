import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class EmployeeCreateDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  position?: string;

  @IsNumber()
  @IsNotEmpty()
  salary?: number;
}