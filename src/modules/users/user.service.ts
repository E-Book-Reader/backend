import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    private configuration: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  getUser(query: { id?: string; email?: string }): Promise<User> {
    return this.userRepository.findOneBy(query);
  }

  createUser({
    email,
    username,
    picture,
  }: {
    email: string;
    username: string;
    picture: string;
  }) {
    const user = new User();
    user.email = email;
    user.picture = picture;
    user.username = username;
    return this.userRepository.save(user);
  }
}
