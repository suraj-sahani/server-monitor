import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersService } from './remote-servers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';

const mockOwnerId = 'owner-uuid';
const mockServerId = 'server-uuid';

const mockRemoteServer: RemoteServer = {
  id: mockServerId,
  ownerId: mockOwnerId,
  name: 'Test Server',
  description: 'Test Description',
  config: { host: '127.0.0.1' },
  status: RemoteServerStatus.UNKNOWN,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRemoteServersList: RemoteServer[] = [
  mockRemoteServer,
  {
    id: 'server-uuid-2',
    ownerId: mockOwnerId,
    name: 'Test Server 2',
    description: undefined,
    config: { host: '192.168.1.1' },
    status: RemoteServerStatus.ONLINE,
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

describe('RemoteServersService', () => {
  let service: RemoteServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteServersService,
        {
          provide: getRepositoryToken(RemoteServer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRemoteServer', () => {
    it('should create and save a new remote server', async () => {
      const createRemoteServerDto = {
        name: 'New Server',
        description: 'New Description',
        config: { host: 'localhost' },
      };

      const createdServer = {
        ...createRemoteServerDto,
        status: RemoteServerStatus.UNKNOWN,
        ownerId: mockOwnerId,
      };

      mockRepository.create.mockReturnValue(createdServer);
      mockRepository.save.mockResolvedValue({
        id: 'new-uuid',
        ...createdServer,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createRemoteServer(
        createRemoteServerDto,
        mockOwnerId,
      );

      expect(mockRepository.create).toHaveBeenCalledWith(createdServer);
      expect(mockRepository.save).toHaveBeenCalledWith(createdServer);
      expect(result.id).toEqual('new-uuid');
      expect(result.name).toEqual('New Server');
    });
  });

  describe('getAllRemoteServers', () => {
    it('should return an array of remote servers for a given owner', async () => {
      mockRepository.find.mockResolvedValue(mockRemoteServersList);

      const result = await service.getAllRemoteServers(mockOwnerId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { ownerId: mockOwnerId },
      });
      expect(result).toEqual(mockRemoteServersList);
    });

    it('should return an empty array when no servers exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getAllRemoteServers(mockOwnerId);

      expect(result).toEqual([]);
    });
  });

  describe('getRemoteServerById', () => {
    it('should return a remote server when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockRemoteServer);

      const result = await service.getRemoteServerById(
        mockServerId,
        mockOwnerId,
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockServerId,
        ownerId: mockOwnerId,
      });
      expect(result).toEqual(mockRemoteServer);
    });

    it('should throw NotFoundException when server is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.getRemoteServerById('nonexistent-id', mockOwnerId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getRemoteServerById('nonexistent-id', mockOwnerId),
      ).rejects.toThrow('Server not found!');
    });
  });

  describe('updateRemoteServer', () => {
    it('should update and return the server when found', async () => {
      const updateDto = { name: 'Updated Server' };
      const updatedServer = { ...mockRemoteServer, ...updateDto };

      mockRepository.findOneBy.mockResolvedValue(mockRemoteServer);
      mockRepository.save.mockResolvedValue(updatedServer);

      const result = await service.updateRemoteServer(
        mockServerId,
        mockOwnerId,
        updateDto,
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockServerId,
        ownerId: mockOwnerId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedServer);
      expect(result).toEqual(updatedServer);
    });

    it('should throw NotFoundException when server is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateRemoteServer('nonexistent-id', mockOwnerId, {
          name: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRemoteServer', () => {
    it('should remove and return the server when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockRemoteServer);
      const deleteResult = { affected: 1 };
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteRemoteServer(
        mockServerId,
        mockOwnerId,
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: mockServerId,
        ownerId: mockOwnerId,
      });
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: mockServerId,
        ownerId: mockOwnerId,
      });
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException when server is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.deleteRemoteServer('nonexistent-id', mockOwnerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
