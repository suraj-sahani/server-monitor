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
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
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
      mockLogSourcesService.create.mockResolvedValue(mockLogSource);

      const result = await controller.create(createDto, mockUserCtx);

      expect(mockLogSourcesService.create).toHaveBeenCalledWith(
        mockUserCtx.id,
        createDto,
      );
      expect(result).toEqual(mockLogSource);
    });

    it('should throw a BadRequestException when validation fails', async () => {
      const createDto = { name: '', config: {} } as CreateLogSourceDto;

      mockLogSourcesService.create.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(controller.create(createDto, mockUserCtx)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of log sources', async () => {
      mockLogSourcesService.findAll.mockResolvedValue(mockLogSourcesList);

      const result = await controller.findAll(mockUserCtx);

      expect(mockLogSourcesService.findAll).toHaveBeenCalledWith(
        mockUserCtx.id,
      );
      expect(result).toEqual(mockLogSourcesList);
    });

    it('should return an empty array when no sources exist', async () => {
      mockLogSourcesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUserCtx);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a log source by ID', async () => {
      mockLogSourcesService.findOne.mockResolvedValue(mockLogSource);

      const result = await controller.findOne(mockSourceId, mockUserCtx);

      expect(mockLogSourcesService.findOne).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
      );
      expect(result).toEqual(mockLogSource);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.findOne.mockRejectedValue(
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
      mockLogSourcesService.update.mockResolvedValue(updatedSource);

      const result = await controller.update(
        mockSourceId,
        mockUserCtx,
        updateDto,
      );

      expect(mockLogSourcesService.update).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
        updateDto,
      );
      expect(result).toEqual(updatedSource);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.update.mockRejectedValue(
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

      mockLogSourcesService.update.mockRejectedValue(
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
      mockLogSourcesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(mockSourceId, mockUserCtx);

      expect(mockLogSourcesService.remove).toHaveBeenCalledWith(
        mockSourceId,
        mockUserCtx.id,
      );
      expect(result).toEqual(deleteResult);
    });

    it('should propagate NotFoundException when source is not found', async () => {
      mockLogSourcesService.remove.mockRejectedValue(
        new NotFoundException('Log-source not found!'),
      );

      await expect(
        controller.remove('nonexistent-id', mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
