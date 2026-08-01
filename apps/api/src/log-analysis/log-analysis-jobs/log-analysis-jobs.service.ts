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

  async createLogAnalysisJob(
    createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    ownerId: string,
  ) {
    const { logSourceId, remoteServerId } = createLogAnalysisJobDto;
    // We do not check if the log-source or the remote-server exists
    // or not as these cases are already handled within each of their
    // respoective service methods
    const logSource = await this.logSourceService.getLogSourceById(
      logSourceId,
      ownerId,
    );

    const remoteServer = await this.remoteServersService.getRemoteServerById(
      remoteServerId,
      ownerId,
    );

    const job = this.repo.create({
      ...createLogAnalysisJobDto,
      status: LogAnalysisJobStatus.INITIALIZED,
      logSource,
      remoteServer,
      ownerId,
    });
    return this.repo.save(job);
  }

  getAllLogAnalysisJobs(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async getLogAnalysisJobById(id: string, ownerId: string) {
    const logAnalysisJob = await this.repo.findOne({ where: { id, ownerId } });

    if (!logAnalysisJob)
      throw new NotFoundException('Log-analysis job not found!');

    return logAnalysisJob;
  }

  async updateLogAnalysisJob(
    id: string,
    ownerId: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
  ) {
    const job = await this.getLogAnalysisJobById(id, ownerId);

    if (!job) throw new NotFoundException('Job not found!');

    return this.repo.save({ ...job, ...updateLogAnalysisJobDto });
  }

  async deleteLogAnalysisJob(id: string, ownerId: string) {
    const job = await this.getLogAnalysisJobById(id, ownerId);

    if (!job) throw new NotFoundException('Log-analysis job not found!');

    return this.repo.remove(job);
  }
}
