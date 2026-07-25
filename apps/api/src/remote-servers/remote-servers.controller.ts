import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { UserCtx } from 'src/auth/user.decorator';
import { type IUserCtx } from 'src/auth/user.interface';

@Controller('remote-servers')
export class RemoteServersController {
  constructor(private readonly remoteServersService: RemoteServersService) {}

  @Post()
  create(
    @Body() createRemoteServerDto: CreateRemoteServerDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.remoteServersService.createRemoteServer({
      ...createRemoteServerDto,
      ownerId: user.id,
    });
  }

  @Get()
  findAll(@UserCtx() user: IUserCtx) {
    return this.remoteServersService.getAllRemoteServers(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserCtx() user: IUserCtx) {
    return this.remoteServersService.getRemoteServerById(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRemoteServerDto: UpdateRemoteServerDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.remoteServersService.updateRemoteServer(
      id,
      user.id,
      updateRemoteServerDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserCtx() user: IUserCtx) {
    return this.remoteServersService.deleteRemoteServer(id, user.id);
  }
}
