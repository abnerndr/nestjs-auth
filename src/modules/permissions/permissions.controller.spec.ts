import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let permissionsService: PermissionsService;

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPermission = {
    id: '1',
    name: 'read_users',
    description: 'Permission to read users',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermissions = [
    mockPermission,
    {
      ...mockPermission,
      id: '2',
      name: 'write_users',
      description: 'Permission to write users',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createPermissionDto: CreatePermissionDto = {
      name: 'delete_users',
      description: 'Permission to delete users',
    };

    it('should create a new permission successfully', async () => {
      const expectedPermission = { ...mockPermission, ...createPermissionDto, id: '3' };
      mockPermissionsService.create.mockResolvedValue(expectedPermission);

      const result = await controller.create(createPermissionDto);

      expect(permissionsService.create).toHaveBeenCalledWith(createPermissionDto);
      expect(result).toEqual(expectedPermission);
    });

    it('should handle service errors during permission creation', async () => {
      const error = new Error('Permission name already exists');
      mockPermissionsService.create.mockRejectedValue(error);

      await expect(controller.create(createPermissionDto)).rejects.toThrow(error);
      expect(permissionsService.create).toHaveBeenCalledWith(createPermissionDto);
    });

    it('should create permission without description', async () => {
      const createPermissionDtoWithoutDescription: CreatePermissionDto = {
        name: 'update_users',
      };
      const expectedPermission = {
        ...mockPermission,
        ...createPermissionDtoWithoutDescription,
        id: '4',
      };
      mockPermissionsService.create.mockResolvedValue(expectedPermission);

      const result = await controller.create(createPermissionDtoWithoutDescription);

      expect(permissionsService.create).toHaveBeenCalledWith(
        createPermissionDtoWithoutDescription,
      );
      expect(result).toEqual(expectedPermission);
    });

    it('should handle validation errors for short names', async () => {
      const invalidDto: CreatePermissionDto = {
        name: 'ab', // Too short
        description: 'Invalid permission',
      };
      const error = new Error('Nome deve ter pelo menos 3 caracteres');
      mockPermissionsService.create.mockRejectedValue(error);

      await expect(controller.create(invalidDto)).rejects.toThrow(error);
      expect(permissionsService.create).toHaveBeenCalledWith(invalidDto);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      mockPermissionsService.findAll.mockResolvedValue(mockPermissions);

      const result = await controller.findAll();

      expect(permissionsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
    });

    it('should return empty array when no permissions exist', async () => {
      mockPermissionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(permissionsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockPermissionsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(permissionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const permissionId = '1';

    it('should return a permission by id', async () => {
      mockPermissionsService.findOne.mockResolvedValue(mockPermission);

      const result = await controller.findOne(permissionId);

      expect(permissionsService.findOne).toHaveBeenCalledWith(permissionId);
      expect(result).toEqual(mockPermission);
    });

    it('should handle permission not found', async () => {
      mockPermissionsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(permissionId);

      expect(permissionsService.findOne).toHaveBeenCalledWith(permissionId);
      expect(result).toBeNull();
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('Database error');
      mockPermissionsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(permissionId)).rejects.toThrow(error);
      expect(permissionsService.findOne).toHaveBeenCalledWith(permissionId);
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      mockPermissionsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(invalidId)).rejects.toThrow(error);
      expect(permissionsService.findOne).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('update', () => {
    const permissionId = '1';
    const updatePermissionDto: UpdatePermissionDto = {
      name: 'updated_permission',
      description: 'Updated permission description',
    };

    it('should update a permission successfully', async () => {
      const updatedPermission = { ...mockPermission, ...updatePermissionDto };
      mockPermissionsService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update(permissionId, updatePermissionDto);

      expect(permissionsService.update).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
      expect(result).toEqual(updatedPermission);
    });

    it('should handle permission not found during update', async () => {
      const error = new Error('Permission not found');
      mockPermissionsService.update.mockRejectedValue(error);

      await expect(
        controller.update(permissionId, updatePermissionDto),
      ).rejects.toThrow(error);
      expect(permissionsService.update).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
    });

    it('should update only name', async () => {
      const updateNameOnly: UpdatePermissionDto = {
        name: 'new_permission_name',
      };
      const updatedPermission = { ...mockPermission, ...updateNameOnly };
      mockPermissionsService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update(permissionId, updateNameOnly);

      expect(permissionsService.update).toHaveBeenCalledWith(
        permissionId,
        updateNameOnly,
      );
      expect(result).toEqual(updatedPermission);
    });

    it('should update only description', async () => {
      const updateDescriptionOnly: UpdatePermissionDto = {
        description: 'New description only',
      };
      const updatedPermission = { ...mockPermission, ...updateDescriptionOnly };
      mockPermissionsService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update(permissionId, updateDescriptionOnly);

      expect(permissionsService.update).toHaveBeenCalledWith(
        permissionId,
        updateDescriptionOnly,
      );
      expect(result).toEqual(updatedPermission);
    });

    it('should handle validation errors during update', async () => {
      const invalidUpdateDto: UpdatePermissionDto = {
        name: 'ab', // Too short
      };
      const error = new Error('Nome deve ter pelo menos 3 caracteres');
      mockPermissionsService.update.mockRejectedValue(error);

      await expect(
        controller.update(permissionId, invalidUpdateDto),
      ).rejects.toThrow(error);
      expect(permissionsService.update).toHaveBeenCalledWith(
        permissionId,
        invalidUpdateDto,
      );
    });
  });

  describe('remove', () => {
    const permissionId = '1';

    it('should remove a permission successfully', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockPermissionsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(permissionId);

      expect(permissionsService.remove).toHaveBeenCalledWith(permissionId);
      expect(result).toEqual(deleteResult);
    });

    it('should handle permission not found during removal', async () => {
      const error = new Error('Permission not found');
      mockPermissionsService.remove.mockRejectedValue(error);

      await expect(controller.remove(permissionId)).rejects.toThrow(error);
      expect(permissionsService.remove).toHaveBeenCalledWith(permissionId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Cannot delete permission with associated roles');
      mockPermissionsService.remove.mockRejectedValue(error);

      await expect(controller.remove(permissionId)).rejects.toThrow(error);
      expect(permissionsService.remove).toHaveBeenCalledWith(permissionId);
    });

    it('should handle foreign key constraint errors', async () => {
      const error = new Error('Permission is referenced by other entities');
      mockPermissionsService.remove.mockRejectedValue(error);

      await expect(controller.remove(permissionId)).rejects.toThrow(error);
      expect(permissionsService.remove).toHaveBeenCalledWith(permissionId);
    });

    it('should handle invalid UUID during removal', async () => {
      const invalidId = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      mockPermissionsService.remove.mockRejectedValue(error);

      await expect(controller.remove(invalidId)).rejects.toThrow(error);
      expect(permissionsService.remove).toHaveBeenCalledWith(invalidId);
    });
  });
});