import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LogAnalysisJobType } from '../entities/log-analysis-job.entity';

export class CreateLogAnalysisJobDto {
  @IsNotEmpty({ message: 'Log-analysis job name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LogAnalysisJobType)
  type: LogAnalysisJobType;

  @IsNotEmpty({ message: 'Log-source ID is required.' })
  @IsUUID()
  logSourceId: string;

  @IsNotEmpty({ message: 'Remote-server ID is required.' })
  @IsUUID()
  remoteServerId: string;
}
