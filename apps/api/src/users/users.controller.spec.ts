import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';

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

const mockUsersService = {
  create: vi.fn(),
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw a BadRequestException when invalid email is passed', async () => {
      const createUserDto = { name: 'John Doe', email: 'invalid email' };

      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Invalid email address!'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException when empty name is passed', async () => {
      const createUserDto = { name: '', email: 'john.doe@gmail.com' };

      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Name is required!'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUsersService.getAllUsers.mockResolvedValue(mockUsersList);

      const result = await controller.findAll();

      expect(mockUsersService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsersList);
    });

    it('should return an empty array when no users exist', async () => {
      mockUsersService.getAllUsers.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(mockUsersService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should propagate NotFoundException when user is not found', async () => {
      mockUsersService.getUserById.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should propagate NotFoundException when user is not found', async () => {
      mockUsersService.updateUser.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(
        controller.update('nonexistent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException when invalid data is passed', async () => {
      const updateUserDto = { email: 'invalid email' };

      mockUsersService.updateUser.mockRejectedValue(
        new BadRequestException('Invalid email address!'),
      );

      await expect(
        controller.update(mockUser.id, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete and return the user', async () => {
      mockUsersService.deleteUser.mockResolvedValue(mockUser);

      const result = await controller.remove(mockUser.id);

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should propagate NotFoundException when user is not found', async () => {
      mockUsersService.deleteUser.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
