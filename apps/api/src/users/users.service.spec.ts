import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockUsersList: User[] = [
  mockUser,
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
];

const mockRepository = {
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOneBy: vi.fn(),
  remove: vi.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      mockRepository.find.mockResolvedValue(mockUsersList);

      const result = await service.getAllUsers();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsersList);
    });

    it('should return an empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getUserById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserById('nonexistent-id')).rejects.toThrow(
        'User not found!',
      );
    });
  });

  describe('updateUser', () => {
    it('should update and return the user when found', async () => {
      const updateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser(mockUser.id, updateUserDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repo.save).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateUser('nonexistent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should remove and return the user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      const result = await service.deleteUser(mockUser.id);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
      expect(repo.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
