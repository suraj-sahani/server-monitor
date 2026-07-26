import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import { UserCtx } from '../auth/user.decorator';
import { type IUserCtx } from '../auth/user.interface';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('remote-servers')
export class RemoteServersController {
  constructor(private readonly remoteServersService: RemoteServersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new remote server' })
  @ApiCreatedResponse({ description: 'Remote-server created successfully' })
  @ApiBadRequestResponse({ description: 'Validation Failed' })
  create(
    @Body() createRemoteServerDto: CreateRemoteServerDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.remoteServersService.createRemoteServer(
      createRemoteServerDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all remote-servers' })
  @ApiOkResponse({ description: "List all user's remote servers" })
  findAll(@UserCtx() user: IUserCtx) {
    return this.remoteServersService.getAllRemoteServers(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get remote-server by ID' })
  @ApiOkResponse({ description: 'Remote-server found' })
  @ApiNotFoundResponse({ description: 'Remote-server not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.remoteServersService.getRemoteServerById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update remote-server' })
  @ApiOkResponse({ description: 'Remote-server updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Remote-server not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRemoteServerDto: UpdateRemoteServerDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.remoteServersService.updateRemoteServer(
      id,
      user.id,
      updateRemoteServerDto,
    );
  }

  @ApiOperation({ summary: 'Delete remote-server' })
  @ApiOkResponse({ description: 'Remote-server deleted' })
  @ApiNotFoundResponse({ description: 'Remote-server not found' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.remoteServersService.deleteRemoteServer(id, user.id);
  }
}
