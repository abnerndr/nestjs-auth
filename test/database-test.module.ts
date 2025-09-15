import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../src/entities/permission.entity';
import { Role } from '../src/entities/role.entity';
import { User } from '../src/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'better-sqlite3',
        database: './test.db', // Arquivo temporário para testes
        entities: [User, Role, Permission],
        synchronize: true, // Cria as tabelas automaticamente
        logging: false, // Desabilita logs durante os testes
        dropSchema: true, // Limpa o schema a cada execução
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseTestModule {}