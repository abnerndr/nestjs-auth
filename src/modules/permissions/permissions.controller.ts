import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar uma nova permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({ status: 200, description: 'Lista de permissões' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma permissão pelo ID' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar uma permissão' })
  @ApiResponse({ status: 200, description: 'Permissão atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover uma permissão' })
  @ApiResponse({ status: 200, description: 'Permissão removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
