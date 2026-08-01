import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

describe('LogAnalysisJobsController', () => {
  let controller: LogAnalysisJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogAnalysisJobsController],
      providers: [
        {
          provide: LogAnalysisJobsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<LogAnalysisJobsController>(
      LogAnalysisJobsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
