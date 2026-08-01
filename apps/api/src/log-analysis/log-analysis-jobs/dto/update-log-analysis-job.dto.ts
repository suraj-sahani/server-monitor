import { IsString } from 'class-validator';

export class UpdateLogAnalysisJobDto {
  @IsString()
  name: string;

  @IsString()
  description?: string;
}
