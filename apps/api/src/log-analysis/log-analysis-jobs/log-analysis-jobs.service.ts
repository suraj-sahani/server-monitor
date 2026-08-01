import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
} from './entities/log-analysis-job.entity';
import { Repository } from 'typeorm';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';

@Injectable()
export class LogAnalysisJobsService {
  constructor(
    @InjectRepository(LogAnalysisJob)
    private repo: Repository<LogAnalysisJob>,
    private logSourceService: LogSourcesService,
    private remoteServersService: RemoteServersService,
  ) {}

  async create(
    createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    ownerId: string,
  ) {
    const { logSourceId, remoteServerId } = createLogAnalysisJobDto;
    const logSource = await this.logSourceService.findOne(logSourceId, ownerId);

    if (!logSource) throw new NotFoundException('Log-source not found!');

    const remoteServer = await this.remoteServersService.getRemoteServerById(
      remoteServerId,
      ownerId,
    );

    if (!remoteServer) throw new NotFoundException('Remote-server not found!');

    const job = this.repo.create({
      ...createLogAnalysisJobDto,
      status: LogAnalysisJobStatus.INITIALIZED,
      ownerId,
    });
    return this.repo.save(job);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string) {
    const logAnalysisJob = await this.repo.findOne({ where: { id, ownerId } });

    if (!logAnalysisJob)
      throw new NotFoundException('Log-analysis job not found!');

    return logAnalysisJob;
  }

  async update(
    id: string,
    ownerId: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
  ) {
    const job = await this.findOne(id, ownerId);

    if (!job) throw new NotFoundException('Job not found!');

    return this.repo.save({ ...job, updateLogAnalysisJobDto });
  }

  async remove(id: string, ownerId: string) {
    const job = await this.findOne(id, ownerId);

    if (!job) throw new NotFoundException('Log-analysis job not found!');

    return this.repo.remove(job);
  }
}
