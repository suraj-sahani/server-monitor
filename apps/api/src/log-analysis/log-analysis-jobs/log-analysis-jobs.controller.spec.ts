import { IUserCtx } from '@/auth/user.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './entities/log-analysis-job.entity';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';

const mockUserCtx: IUserCtx = {
  id: 'owner-uuid',
  email: 'test@example.com',
  name: 'Test User',
};

const mockJobId = 'job-uuid';

const mockJob = {
  id: mockJobId,
  ownerId: mockUserCtx.id,
  name: 'Test Job',
  description: 'Test Description',
  status: LogAnalysisJobStatus.PENDING,
  type: LogAnalysisJobType.ONETIME,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockJobsList = [mockJob];

const mockLogAnalysisJobsService = {
  createLogAnalysisJob: vi.fn(),
  getAllLogAnalysisJobs: vi.fn(),
  getLogAnalysisJobById: vi.fn(),
  updateLogAnalysisJob: vi.fn(),
  deleteLogAnalysisJob: vi.fn(),
};

describe('LogAnalysisJobsController', () => {
  let controller: LogAnalysisJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogAnalysisJobsController],
      providers: [
        {
          provide: LogAnalysisJobsService,
          useValue: mockLogAnalysisJobsService,
        },
      ],
    }).compile();

    controller = module.get<LogAnalysisJobsController>(
      LogAnalysisJobsController,
    );

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new log analysis job', async () => {
      const createDto = {
        name: 'Test Job',
        type: LogAnalysisJobType.ONETIME,
        logSourceId: 'ls-uuid',
        remoteServerId: 'rs-uuid',
      };

      mockLogAnalysisJobsService.createLogAnalysisJob.mockResolvedValue(
        mockJob,
      );

      const result = await controller.create(createDto, mockUserCtx);

      expect(
        mockLogAnalysisJobsService.createLogAnalysisJob,
      ).toHaveBeenCalledWith(createDto, mockUserCtx.id);
      expect(result).toEqual(mockJob);
    });

    it('should create a new log analysis job without logSourceId', async () => {
      const createDto = {
        name: 'Test Job 2',
        type: LogAnalysisJobType.ONETIME,
        remoteServerId: 'rs-uuid',
      };

      const mockJobWithoutLogSource = {
        ...mockJob,
        ...createDto,
        logSourceId: undefined,
      };

      mockLogAnalysisJobsService.createLogAnalysisJob.mockResolvedValue(
        mockJobWithoutLogSource,
      );

      const result = await controller.create(createDto, mockUserCtx);

      expect(
        mockLogAnalysisJobsService.createLogAnalysisJob,
      ).toHaveBeenCalledWith(createDto, mockUserCtx.id);
      expect(result).toEqual(mockJobWithoutLogSource);
    });
  });

  describe('findAll', () => {
    it('should return an array of jobs', async () => {
      mockLogAnalysisJobsService.getAllLogAnalysisJobs.mockResolvedValue(
        mockJobsList,
      );

      const result = await controller.findAll(mockUserCtx);

      expect(
        mockLogAnalysisJobsService.getAllLogAnalysisJobs,
      ).toHaveBeenCalledWith(mockUserCtx.id);
      expect(result).toEqual(mockJobsList);
    });
  });

  describe('findOne', () => {
    it('should return a job by ID', async () => {
      mockLogAnalysisJobsService.getLogAnalysisJobById.mockResolvedValue(
        mockJob,
      );

      const result = await controller.findOne(mockJobId, mockUserCtx);

      expect(
        mockLogAnalysisJobsService.getLogAnalysisJobById,
      ).toHaveBeenCalledWith(mockJobId, mockUserCtx.id);
      expect(result).toEqual(mockJob);
    });
  });

  describe('update', () => {
    it('should update and return the job', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedJob = { ...mockJob, ...updateDto };
      mockLogAnalysisJobsService.updateLogAnalysisJob.mockResolvedValue(
        updatedJob,
      );

      const result = await controller.update(mockJobId, updateDto, mockUserCtx);

      expect(
        mockLogAnalysisJobsService.updateLogAnalysisJob,
      ).toHaveBeenCalledWith(mockJobId, mockUserCtx.id, updateDto);
      expect(result).toEqual(updatedJob);
    });
  });

  describe('remove', () => {
    it('should remove and return the job', async () => {
      const deleteResult = mockJob;
      mockLogAnalysisJobsService.deleteLogAnalysisJob.mockResolvedValue(
        deleteResult,
      );

      const result = await controller.remove(mockJobId, mockUserCtx);

      expect(
        mockLogAnalysisJobsService.deleteLogAnalysisJob,
      ).toHaveBeenCalledWith(mockJobId, mockUserCtx.id);
      expect(result).toEqual(deleteResult);
    });
  });
});
