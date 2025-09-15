import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoles } from '../../shared/enums/roles.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    roles: [{ id: '1', name: 'user' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'test2@example.com' }];

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
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    full_name: 'New User',
    password: 'password123',
    role_id: '1',
    is_active: true,
  };

    it('should create a new user successfully', async () => {
      const expectedUser = { ...mockUser, ...createUserDto, id: '3' };
      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should handle service errors during user creation', async () => {
      const error = new Error('Email already exists');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockUsersService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const userId = '1';

    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('Database error');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(userId)).rejects.toThrow(error);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
    full_name: 'Updated User',
    email: 'updated@example.com',
  };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle user not found during update', async () => {
      const error = new Error('User not found');
      mockUsersService.update.mockRejectedValue(error);

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(error);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should handle validation errors during update', async () => {
      const error = new Error('Email already exists');
      mockUsersService.update.mockRejectedValue(error);

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(error);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    const userId = '1';

    it('should remove a user successfully', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockUsersService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(userId);

      expect(usersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deleteResult);
    });

    it('should handle user not found during removal', async () => {
      const error = new Error('User not found');
      mockUsersService.remove.mockRejectedValue(error);

      await expect(controller.remove(userId)).rejects.toThrow(error);
      expect(usersService.remove).toHaveBeenCalledWith(userId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database constraint violation');
      mockUsersService.remove.mockRejectedValue(error);

      await expect(controller.remove(userId)).rejects.toThrow(error);
      expect(usersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});