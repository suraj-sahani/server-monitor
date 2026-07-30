import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { LogSourceType } from '../entities/log-source.entity';

export class CreateLogSourceDto {
  @IsString({ message: 'Log-source name is required. ' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;

  @IsEnum(LogSourceType)
  type: LogSourceType;
}
