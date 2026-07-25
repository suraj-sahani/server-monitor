import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServer)
    private repo: Repository<RemoteServer>,
  ) {}

  createRemoteServer(payload: CreateRemoteServerDto & { ownerId: string }) {
    const newServer = this.repo.create({
      ...payload,
      status: RemoteServerStatus.UNKNOWN,
    });
    return this.repo.save(newServer);
  }

  getAllRemoteServers(ownerId: string) {
    return this.repo.find({ where: { ownerId: ownerId } });
  }

  async getRemoteServerById(id: string, ownerId: string) {
    const server = await this.repo.findOneBy({ id, ownerId });

    if (!server) throw new NotFoundException('Server not found!');

    return server;
  }

  async updateRemoteServer(
    id: string,
    ownerId: string,
    updateRemoteServerDto: UpdateRemoteServerDto,
  ) {
    const server = await this.repo.findOneBy({ id, ownerId });

    if (!server) throw new NotFoundException('Server not found!');

    const updatedServer = { ...server, ...updateRemoteServerDto };

    return this.repo.save(updatedServer);
  }

  async deleteRemoteServer(id: string, ownerId: string) {
    await this.repo.findOneByOrFail({ id, ownerId });

    return this.repo.delete({ id, ownerId });
  }
}
