import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LogSource } from './entities/log-source.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogSourcesService {
  constructor(
    @InjectRepository(LogSource)
    private repo: Repository<LogSource>,
  ) {}

  create(ownerId: string, createLogSourceDto: CreateLogSourceDto) {
    const logSource = this.repo.create({ ...createLogSourceDto, ownerId });
    return this.repo.save(logSource);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string) {
    const existingLogSource = await this.repo.findOneBy({ id, ownerId });

    if (!existingLogSource)
      throw new NotFoundException('Log-source not found!');

    return existingLogSource;
  }

  async update(
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

  async remove(id: string, ownerId: string) {
    const existingLogSource = await this.repo.findOneBy({ id, ownerId });

    if (!existingLogSource)
      throw new NotFoundException('Log-source not found!');

    return this.repo.delete({ id, ownerId });
  }
}
