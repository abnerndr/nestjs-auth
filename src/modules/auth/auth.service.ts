import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from 'src/entities/user.entity';
import type {
  JwtPayload,
  UserLoginInterface,
} from 'src/shared/interfaces/user-login';
import { UsersService } from '../users/users.service';
import type { ResponseLoginDto } from './dto/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(email, true);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Partial<UserLoginInterface>): Promise<ResponseLoginDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role?.name,
    } as JwtPayload;
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(token: string): Promise<ResponseLoginDto> {
    try {
      const payload = this.jwtService.verify(token);
      // Você pode adicionar validações extras aqui, como checar se o usuário existe
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
      };
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }
}
