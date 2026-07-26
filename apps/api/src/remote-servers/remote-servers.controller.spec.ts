import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersController } from './remote-servers.controller';
import { RemoteServersService } from './remote-servers.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { IUserCtx } from '../auth/user.interface';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';

const mockUserCtx: IUserCtx = {
  id: 'owner-uuid',
  email: 'test@example.com',
  name: 'Test User',
};

const mockServerId = 'server-uuid';

const mockRemoteServer: RemoteServer = {
  id: mockServerId,
  ownerId: mockUserCtx.id,
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
    ownerId: mockUserCtx.id,
    name: 'Test Server 2',
    config: { host: '192.168.1.1' },
    status: RemoteServerStatus.ONLINE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockRemoteServersService = {
  createRemoteServer: vi.fn(),
  getAllRemoteServers: vi.fn(),
  getRemoteServerById: vi.fn(),
  updateRemoteServer: vi.fn(),
  deleteRemoteServer: vi.fn(),
};

describe('RemoteServersController', () => {
  let controller: RemoteServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoteServersController],
      providers: [
        {
          provide: RemoteServersService,
          useValue: mockRemoteServersService,
        },
      ],
    }).compile();

    controller = module.get<RemoteServersController>(RemoteServersController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new remote server', async () => {
      const createDto = { name: 'New Server', config: { host: 'localhost' } };
      mockRemoteServersService.createRemoteServer.mockResolvedValue(
        mockRemoteServer,
      );

      const result = await controller.create(createDto, mockUserCtx);

      expect(mockRemoteServersService.createRemoteServer).toHaveBeenCalledWith(
        createDto,
        mockUserCtx.id,
      );
      expect(result).toEqual(mockRemoteServer);
    });

    it('should throw a BadRequestException when validation fails', async () => {
      const createDto = { name: '', config: {} };

      mockRemoteServersService.createRemoteServer.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(controller.create(createDto, mockUserCtx)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of remote servers', async () => {
      mockRemoteServersService.getAllRemoteServers.mockResolvedValue(
        mockRemoteServersList,
      );

      const result = await controller.findAll(mockUserCtx);

      expect(mockRemoteServersService.getAllRemoteServers).toHaveBeenCalledWith(
        mockUserCtx.id,
      );
      expect(result).toEqual(mockRemoteServersList);
    });

    it('should return an empty array when no servers exist', async () => {
      mockRemoteServersService.getAllRemoteServers.mockResolvedValue([]);

      const result = await controller.findAll(mockUserCtx);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a remote server by ID', async () => {
      mockRemoteServersService.getRemoteServerById.mockResolvedValue(
        mockRemoteServer,
      );

      const result = await controller.findOne(mockServerId, mockUserCtx);

      expect(mockRemoteServersService.getRemoteServerById).toHaveBeenCalledWith(
        mockServerId,
        mockUserCtx.id,
      );
      expect(result).toEqual(mockRemoteServer);
    });

    it('should propagate NotFoundException when server is not found', async () => {
      mockRemoteServersService.getRemoteServerById.mockRejectedValue(
        new NotFoundException('Server not found!'),
      );

      await expect(
        controller.findOne('nonexistent-id', mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the remote server', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedServer = { ...mockRemoteServer, ...updateDto };
      mockRemoteServersService.updateRemoteServer.mockResolvedValue(
        updatedServer,
      );

      const result = await controller.update(
        mockServerId,
        updateDto,
        mockUserCtx,
      );

      expect(mockRemoteServersService.updateRemoteServer).toHaveBeenCalledWith(
        mockServerId,
        mockUserCtx.id,
        updateDto,
      );
      expect(result).toEqual(updatedServer);
    });

    it('should propagate NotFoundException when server is not found', async () => {
      mockRemoteServersService.updateRemoteServer.mockRejectedValue(
        new NotFoundException('Server not found!'),
      );

      await expect(
        controller.update('nonexistent-id', { name: 'Test' }, mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException when invalid data is passed', async () => {
      const updateDto = {
        config: 'invalid config',
      } as unknown as UpdateRemoteServerDto;

      mockRemoteServersService.updateRemoteServer.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        controller.update(mockServerId, updateDto, mockUserCtx),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete and return the result', async () => {
      const deleteResult = { affected: 1 };
      mockRemoteServersService.deleteRemoteServer.mockResolvedValue(
        deleteResult,
      );

      const result = await controller.remove(mockServerId, mockUserCtx);

      expect(mockRemoteServersService.deleteRemoteServer).toHaveBeenCalledWith(
        mockServerId,
        mockUserCtx.id,
      );
      expect(result).toEqual(deleteResult);
    });

    it('should propagate NotFoundException when server is not found', async () => {
      mockRemoteServersService.deleteRemoteServer.mockRejectedValue(
        new NotFoundException('Server not found!'),
      );

      await expect(
        controller.remove('nonexistent-id', mockUserCtx),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
