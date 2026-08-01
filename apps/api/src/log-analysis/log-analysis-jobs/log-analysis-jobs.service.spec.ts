import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LogAnalysisJob } from './entities/log-analysis-job.entity';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJob),
          useValue: {},
        },
        {
          provide: LogSourcesService,
          useValue: {},
        },
        {
          provide: RemoteServersService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
