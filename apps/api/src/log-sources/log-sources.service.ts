import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LogSource, LogSourceStatus } from './entities/log-source.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogSourcesService {
  constructor(
    @InjectRepository(LogSource)
    private repo: Repository<LogSource>,
  ) {}

  createLogSource(ownerId: string, createLogSourceDto: CreateLogSourceDto) {
    const logSource = this.repo.create({
      ...createLogSourceDto,
      status: LogSourceStatus.UNKNOWN,
      ownerId,
    });
    return this.repo.save(logSource);
  }

  getAllLogSources(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async getLogSourceById(id: string, ownerId: string) {
    const existingLogSource = await this.repo.findOneBy({ id, ownerId });

    if (!existingLogSource)
      throw new NotFoundException('Log-source not found!');

    return existingLogSource;
  }

  async updateLogSource(
    id: string,
    ownerId: string,
    updateLogSourceDto: UpdateLogSourceDto,
  ) {
    const existingLogSource = await this.repo.findOneBy({ id, ownerId });

    if (!existingLogSource)
      throw new NotFoundException('Log-source not found!');

    const updatedLogSource = { ...existingLogSource, ...updateLogSourceDto };

    return this.repo.save(updatedLogSource);
  }

  async deleteLogSource(id: string, ownerId: string) {
    const existingLogSource = await this.repo.findOneBy({ id, ownerId });

    if (!existingLogSource)
      throw new NotFoundException('Log-source not found!');

    return this.repo.delete({ id, ownerId });
  }
}
