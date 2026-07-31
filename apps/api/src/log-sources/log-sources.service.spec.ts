import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesService } from './log-sources.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  LogSource,
  LogSourceStatus,
  LogSourceType,
} from './entities/log-source.entity';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';

const mockOwnerId = 'owner-uuid';
const mockSourceId = 'source-uuid';

const mockLogSource: LogSource = {
  id: mockSourceId,
  ownerId: mockOwnerId,
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
    ownerId: mockOwnerId,
    name: 'Test Source 2',
    description: undefined,
    type: LogSourceType.PROMETHEUS,
    config: { host: '192.168.1.1' },
    status: LogSourceStatus.ONLINE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockRepository = {
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOneBy: vi.fn(),
  delete: vi.fn(),
};

describe('LogSourcesService', () => {
  let service: LogSourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSourcesService,
        {
          provide: getRepositoryToken(LogSource),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new log source', async () => {
      const createLogSourceDto = {
        name: 'New Source',
        description: 'New Description',
        type: LogSourceType.ZABBIX,
        config: { host: 'localhost' },
      };

      const createdSource = {
        ...createLogSourceDto,
        status: LogSourceStatus.UNKNOWN,
        ownerId: mockOwnerId,
      };

      mockRepository.create.mockReturnValue(createdSource);
      mockRepository.save.mockResolvedValue({
        id: 'new-uuid',
        ...createdSource,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(mockOwnerId, createLogSourceDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createdSource);
      expect(mockRepository.save).toHaveBeenCalledWith(createdSource);
      expect(result.id).toEqual('new-uuid');
      expect(result.name).toEqual('New Source');
    });
  });

  describe('findAll', () => {
    it('should return an array of log sources for a given owner', async () => {
      mockRepository.find.mockResolvedValue(mockLogSourcesList);

      const result = await service.findAll(mockOwnerId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { ownerId: mockOwnerId },
      });
      expect(result).toEqual(mockLogSourcesList);
    });

    it('should return an empty array when no sources exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockOwnerId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a log source when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockLogSource);

      const result = await service.findOne(mockSourceId, mockOwnerId);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockSourceId,
        ownerId: mockOwnerId,
      });
      expect(result).toEqual(mockLogSource);
    });

    it('should throw NotFoundException when source is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', mockOwnerId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent-id', mockOwnerId)).rejects.toThrow(
        'Log-source not found!',
      );
    });
  });

  describe('update', () => {
    it('should update and return the source when found', async () => {
      const updateDto = { name: 'Updated Source' };
      const updatedSource = { ...mockLogSource, ...updateDto };

      mockRepository.findOneBy.mockResolvedValue(mockLogSource);
      mockRepository.save.mockResolvedValue(updatedSource);

      const result = await service.update(
        mockSourceId,
        mockOwnerId,
        updateDto,
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockSourceId,
        ownerId: mockOwnerId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedSource);
      expect(result).toEqual(updatedSource);
    });

    it('should throw NotFoundException when source is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', mockOwnerId, {
          name: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return the source when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockLogSource);
      const deleteResult = { affected: 1 };
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove(mockSourceId, mockOwnerId);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockSourceId,
        ownerId: mockOwnerId,
      });
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: mockSourceId,
        ownerId: mockOwnerId,
      });
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException when source is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent-id', mockOwnerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
