import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto);
    return this.repo.save(user);
  }

  getAllUsers() {
    return this.repo.find();
  }

  getUserById(id: string) {
    return this.repo.findOneBy({ id });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.repo.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found!');

    return this.repo.save({ ...user, ...updateUserDto });
  }

  async deleteUser(id: string) {
    const user = await this.repo.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found!');

    return this.repo.remove(user);
  }
}
