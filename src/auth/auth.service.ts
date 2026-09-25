/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { db } from 'src/db';
import { users } from 'src/db/schema';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async signUp({ username, password }: SignUpDto) {
    const exists = await this.userService.findOne(username);

    if (exists) {
      throw new HttpException('Username already exists.', HttpStatus.CONFLICT);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const hash: string = await bcrypt.hash(password, 10);

    const user = await db
      .insert(users)
      .values({
        username,
        password: hash,
      })
      .returning();

    const payload = { id: user[0].id, username };

    return {
      message: 'User registered successfully.',
      username,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signIn(payload: { id: number; username: string }) {
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validate({ username, password }: SignInDto) {
    // check if the user exists
    const user = await this.userService.findOne(username);
    console.log(user);
    if (!user) {
      return false;
      // throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    // compare password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const compare = await bcrypt.compare(password, user.password);

    if (!compare) {
      return false;
      // throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const payload = { id: user.id, username };

    return payload;
  }
}
