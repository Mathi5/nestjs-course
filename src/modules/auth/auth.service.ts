import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log('UserLogin Service validate : ', user);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    console.log('Password:', password);
    console.log('User Password:', user.password);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    return user;
  }

  async login(user: User) {
    console.log('UserLogin Service : ', user);
    const validatedUser = await this.validateUser(user.email, user.password);
    const payload = {
      email: validatedUser.email,
      sub: validatedUser.id,
      role: validatedUser.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
