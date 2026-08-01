import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesController } from './log-sources.controller';
import { LogSourcesService } from './log-sources.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  LogSource,
  LogSourceStatus,
  LogSourceType,
} from './entities/log-source.entity';
import { IUserCtx } from '../auth/user.interface';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { CreateLogSourceDto } from './dto/create-log-source.dto';

const mockUserCtx: IUserCtx = {
  id: 'owner-uuid',
  email: 'test@example.com',
  name: 'Test User',
};

const mockSourceId = 'source-uuid';

const mockLogSource: LogSource = {
  id: mockSourceId,
  ownerId: mockUserCtx.id,
  name: 'Test Source',
  description: 'Test Description',
  type: LogSourceType.ZABBIX,
  config: { host: '127.0.0.1' },
  status: LogSourceStatus.UNKNOWN,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLogSourcesList: LogSource[] = [
  mockLogSource,
  {
    id: 'source-uuid-2',
    ownerId: mockUserCtx.id,
    name: 'Test Source 2',
    type: LogSourceType.PROMETHEUS,
    config: { host: '192.168.1.1' },
    status: LogSourceStatus.ONLINE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockLogSourcesService = {
  createLogSource: vi.fn(),
  getAllLogSources: vi.fn(),
  getLogSourceById: vi.fn(),
  updateLogSource: vi.fn(),
  deleteLogSource: vi.fn(),
};

describe('LogSourcesController', () => {
  let controller: LogSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogSourcesController],
      providers: [
        {
          provide: LogSourcesService,
          useValue: mockLogSourcesService,
        },
      ],
    }).compile();

    controller = module.get<LogSourcesController>(LogSourcesController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new log source', async () => {
      const createDto = {
        name: 'New Source',
        type: LogSourceType.ZABBIX,
        config: { host: 'localhost' },
      };
      mockLogSourcesService.createLogSource.mockResolvedValue(mockLogSource);

      const result = await controller.create(createDto, mockUserCtx);

      expect(mockLogSourcesService.createLogSource).toHaveBeenCalledWith(
        mockUserCtx.id,
        createDto,
      );
      expect(result).toEqual(mockLogSource);
    });

    it('should throw a BadRequestException when validation fails', async () => {
      const createDto = { name: '', config: {} } as CreateLogSourceDto;

      mockLogSourcesService.createLogSource.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(controller.create(createDto, mockUserCtx)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of log sources', async () => {
      mockLogSourcesService.getAllLogSources.mockResolvedValue(mockLogSourcesList);

      const result = await controller.findAll(mockUserCtx);

      expect(mockLogSourcesService.getAllLogSources).toHaveBeenCalledWith(
        mockUserCtx.id,
      );
      expect(result).toEqual(mockLogSourcesList);
    });

    it('should return an empty array when no sources exist', async () => {
      mockLogSourcesService.getAllLogSources.mockResolvedValue([]);

      const result = await controller.findAll(mockUserCtx);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a log source by ID', async () => {
      mockLogSourcesService.getLogSourceById.mockResolvedValue(mockLogSource);

      const result = await controller.findOne(mockSourceId, mockUserCtx);

      expect(mockLogSourcesService.getLogSourceById).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
      );
      expect(result).toEqual(mockLogSource);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.getLogSourceById.mockRejectedValue(
        new NotFoundException('Log-source not found!'),
      );

      await expect(
        controller.findOne('nonexistent-id', mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the log source', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedSource = { ...mockLogSource, ...updateDto };
      mockLogSourcesService.updateLogSource.mockResolvedValue(updatedSource);

      const result = await controller.update(
        mockSourceId,
        mockUserCtx,
        updateDto,
      );

      expect(mockLogSourcesService.updateLogSource).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
        updateDto,
      );
      expect(result).toEqual(updatedSource);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.updateLogSource.mockRejectedValue(
        new NotFoundException('Log-source not found!'),
      );

      await expect(
        controller.update('nonexistent-id', mockUserCtx, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException when invalid data is passed', async () => {
      const updateDto = {
        config: 'invalid config',
      } as unknown as UpdateLogSourceDto;

      mockLogSourcesService.updateLogSource.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        controller.update(mockSourceId, mockUserCtx, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete and return the result', async () => {
      const deleteResult = { affected: 1 };
      mockLogSourcesService.deleteLogSource.mockResolvedValue(deleteResult);

      const result = await controller.remove(mockSourceId, mockUserCtx);

      expect(mockLogSourcesService.deleteLogSource).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
      );
      expect(result).toEqual(deleteResult);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.deleteLogSource.mockRejectedValue(
        new NotFoundException('Log-source not found!'),
      );

      await expect(
        controller.remove('nonexistent-id', mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
