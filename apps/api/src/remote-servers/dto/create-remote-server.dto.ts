import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRemoteServerDto {
  @IsString()
  @IsNotEmpty({ message: 'Server name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  config: Record<string, any>;
}
