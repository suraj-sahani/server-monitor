import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LogSourceType } from '../entities/log-source.entity';

export class CreateLogSourceDto {
  @IsNotEmpty({ message: 'Log-source name is required' })
  @IsString({ message: 'Log-source should be string. ' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;

  @IsEnum(LogSourceType)
  type: LogSourceType;
}
