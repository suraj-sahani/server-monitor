import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './entities/log-analysis-job.entity';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { LogSource } from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';

const mockOwnerId = 'owner-uuid';
const mockJobId = 'job-uuid';

const mockJob: LogAnalysisJob = {
  id: mockJobId,
  ownerId: mockOwnerId,
  name: 'Test Job',
  description: 'Desc',
  status: LogAnalysisJobStatus.PENDING,
  type: LogAnalysisJobType.ONETIME,
  ticketingSystemConfig: { integration: 'jira' },
  createdAt: new Date(),
  updatedAt: new Date(),
  logSource: {} as LogSource,
  remoteServer: {} as RemoteServer,
};

const mockJobsList = [mockJob];

const mockRepository = {
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockLogSourcesService = {
  getLogSourceById: vi.fn(),
};

const mockRemoteServersService = {
  getRemoteServerById: vi.fn(),
};

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJob),
          useValue: mockRepository,
        },
        {
          provide: LogSourcesService,
          useValue: mockLogSourcesService,
        },
        {
          provide: RemoteServersService,
          useValue: mockRemoteServersService,
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'New Job',
      type: LogAnalysisJobType.ONETIME,
      logSourceId: 'ls-id',
      remoteServerId: 'rs-id',
      ticketingSystemConfig: { integration: 'jira' },
    };

    it('should create and save a new job', async () => {
      mockLogSourcesService.getLogSourceById.mockResolvedValue({ id: 'ls-id' });
      mockRemoteServersService.getRemoteServerById.mockResolvedValue({
        id: 'rs-id',
      });

      const createdEntity = {
        ...createDto,
        ownerId: mockOwnerId,
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource: { id: 'ls-id' },
        remoteServer: { id: 'rs-id' },
      };

      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue({
        id: 'new-uuid',
        ...createdEntity,
      });

      const result = await service.createLogAnalysisJob(createDto, mockOwnerId);

      expect(mockLogSourcesService.getLogSourceById).toHaveBeenCalledWith(
        'ls-id',
        mockOwnerId,
      );
      expect(mockRemoteServersService.getRemoteServerById).toHaveBeenCalledWith(
        'rs-id',
        mockOwnerId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createdEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result.id).toEqual('new-uuid');
    });

    it('should create and save a new job without a log source', async () => {
      const createDtoWithoutLogSource = {
        name: 'New Job No Log Source',
        type: LogAnalysisJobType.ONETIME,
        remoteServerId: 'rs-id',
      };

      mockRemoteServersService.getRemoteServerById.mockResolvedValue({
        id: 'rs-id',
      });

      const createdEntity = {
        ...createDtoWithoutLogSource,
        ownerId: mockOwnerId,
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource: undefined,
        remoteServer: { id: 'rs-id' },
      };

      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue({
        id: 'new-uuid',
        ...createdEntity,
      });

      const result = await service.createLogAnalysisJob(
        createDtoWithoutLogSource,
        mockOwnerId,
      );

      expect(mockLogSourcesService.getLogSourceById).not.toHaveBeenCalled();
      expect(mockRemoteServersService.getRemoteServerById).toHaveBeenCalledWith(
        'rs-id',
        mockOwnerId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createdEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result.id).toEqual('new-uuid');
    });

    it('should throw NotFoundException if log source not found', async () => {
      mockLogSourcesService.getLogSourceById.mockRejectedValue(
        new NotFoundException('Log-source not found!'),
      );

      await expect(
        service.createLogAnalysisJob(createDto, mockOwnerId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createLogAnalysisJob(createDto, mockOwnerId),
      ).rejects.toThrow('Log-source not found!');
    });

    it('should throw NotFoundException if remote server not found', async () => {
      mockLogSourcesService.getLogSourceById.mockResolvedValue({ id: 'ls-id' });
      mockRemoteServersService.getRemoteServerById.mockRejectedValue(
        new NotFoundException('Remote-server not found!'),
      );

      await expect(
        service.createLogAnalysisJob(createDto, mockOwnerId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createLogAnalysisJob(createDto, mockOwnerId),
      ).rejects.toThrow('Remote-server not found!');
    });
  });

  describe('findAll', () => {
    it('should return all jobs for owner', async () => {
      mockRepository.find.mockResolvedValue(mockJobsList);

      const result = await service.getAllLogAnalysisJobs(mockOwnerId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { ownerId: mockOwnerId },
      });
      expect(result).toEqual(mockJobsList);
    });
  });

  describe('findOne', () => {
    it('should return job if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.getLogAnalysisJobById(
        mockJobId,
        mockOwnerId,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJobId, ownerId: mockOwnerId },
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('update', () => {
    it('should update job if found', async () => {
      const updateDto = { name: 'Updated' };
      const updatedJob = { ...mockJob, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue(updatedJob);

      const result = await service.updateLogAnalysisJob(
        mockJobId,
        mockOwnerId,
        updateDto,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJobId, ownerId: mockOwnerId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedJob);
      expect(result).toEqual(updatedJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateLogAnalysisJob(
          mockJobId,
          mockOwnerId,
          {} as UpdateLogAnalysisJobDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove job if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.remove.mockResolvedValue(mockJob);

      const result = await service.deleteLogAnalysisJob(mockJobId, mockOwnerId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockJobId, ownerId: mockOwnerId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockJob);
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteLogAnalysisJob(mockJobId, mockOwnerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
