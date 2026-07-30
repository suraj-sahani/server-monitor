import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesController } from './log-sources.controller';
import { LogSourcesService } from './log-sources.service';

describe('LogSourcesController', () => {
  let controller: LogSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogSourcesController],
      providers: [LogSourcesService],
    }).compile();

    controller = module.get<LogSourcesController>(LogSourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
