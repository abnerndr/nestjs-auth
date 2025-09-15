import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserRoles } from '../../shared/enums/roles.enum';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRole = {
    id: '1',
    name: UserRoles.USER,
    description: 'User role',
    permissions: [{ id: '1', name: 'read_users' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoles = [
    mockRole,
    { ...mockRole, id: '2', name: UserRoles.ADMIN, description: 'Admin role' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createRoleDto: CreateRoleDto = {
      name: UserRoles.USER,
      description: 'New user role',
      permissions: ['1', '2'],
    };

    it('should create a new role successfully', async () => {
      const expectedRole = { ...mockRole, ...createRoleDto, id: '3' };
      mockRolesService.create.mockResolvedValue(expectedRole);

      const result = await controller.create(createRoleDto);

      expect(rolesService.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(expectedRole);
    });

    it('should handle service errors during role creation', async () => {
      const error = new Error('Role name already exists');
      mockRolesService.create.mockRejectedValue(error);

      await expect(controller.create(createRoleDto)).rejects.toThrow(error);
      expect(rolesService.create).toHaveBeenCalledWith(createRoleDto);
    });

    it('should create role without permissions', async () => {
      const createRoleDtoWithoutPermissions: CreateRoleDto = {
        name: UserRoles.USER,
        description: 'Simple user role',
      };
      const expectedRole = { ...mockRole, ...createRoleDtoWithoutPermissions, id: '4' };
      mockRolesService.create.mockResolvedValue(expectedRole);

      const result = await controller.create(createRoleDtoWithoutPermissions);

      expect(rolesService.create).toHaveBeenCalledWith(createRoleDtoWithoutPermissions);
      expect(result).toEqual(expectedRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(rolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });

    it('should return empty array when no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(rolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockRolesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(rolesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const roleId = '1';

    it('should return a role by id', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(roleId);

      expect(rolesService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });

    it('should handle role not found', async () => {
      mockRolesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(roleId);

      expect(rolesService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toBeNull();
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('Database error');
      mockRolesService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(roleId)).rejects.toThrow(error);
      expect(rolesService.findOne).toHaveBeenCalledWith(roleId);
    });
  });

  describe('update', () => {
    const roleId = '1';
    const updateRoleDto: UpdateRoleDto = {
      description: 'Updated role description',
      permissions: ['3', '4'],
    };

    it('should update a role successfully', async () => {
      const updatedRole = { ...mockRole, ...updateRoleDto };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateRoleDto);

      expect(rolesService.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });

    it('should handle role not found during update', async () => {
      const error = new Error('Role not found');
      mockRolesService.update.mockRejectedValue(error);

      await expect(controller.update(roleId, updateRoleDto)).rejects.toThrow(error);
      expect(rolesService.update).toHaveBeenCalledWith(roleId, updateRoleDto);
    });

    it('should update role name', async () => {
      const updateRoleDtoWithName: UpdateRoleDto = {
        name: UserRoles.ADMIN,
        description: 'Updated to admin role',
      };
      const updatedRole = { ...mockRole, ...updateRoleDtoWithName };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateRoleDtoWithName);

      expect(rolesService.update).toHaveBeenCalledWith(roleId, updateRoleDtoWithName);
      expect(result).toEqual(updatedRole);
    });

    it('should handle validation errors during update', async () => {
      const error = new Error('Invalid role name');
      mockRolesService.update.mockRejectedValue(error);

      await expect(controller.update(roleId, updateRoleDto)).rejects.toThrow(error);
      expect(rolesService.update).toHaveBeenCalledWith(roleId, updateRoleDto);
    });
  });

  describe('remove', () => {
    const roleId = '1';

    it('should remove a role successfully', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockRolesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(roleId);

      expect(rolesService.remove).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(deleteResult);
    });

    it('should handle role not found during removal', async () => {
      const error = new Error('Role not found');
      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow(error);
      expect(rolesService.remove).toHaveBeenCalledWith(roleId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Cannot delete role with associated users');
      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow(error);
      expect(rolesService.remove).toHaveBeenCalledWith(roleId);
    });

    it('should handle foreign key constraint errors', async () => {
      const error = new Error('Role is referenced by other entities');
      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow(error);
      expect(rolesService.remove).toHaveBeenCalledWith(roleId);
    });
  });
});