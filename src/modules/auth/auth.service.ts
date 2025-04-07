import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    // Utiliser la nouvelle méthode qui ne passe pas par plainToInstance
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Retourner l'utilisateur sans le mot de passe pour la suite du processus
    return plainToInstance(User, user);
  }

  async login(user: User) {
    const validatedUser = await this.validateUser(user.email, user.password);
    const payload = {
      email: validatedUser.email,
      sub: validatedUser.id,
      role: validatedUser.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
