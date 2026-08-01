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
import { LogSourcesService } from './log-sources.service';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { UserCtx } from 'src/auth/user.decorator';
import { type IUserCtx } from 'src/auth/user.interface';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('log-sources')
export class LogSourcesController {
  constructor(private readonly logSourcesService: LogSourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a log-source' })
  @ApiCreatedResponse({ description: 'Log-source created successfully' })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  create(
    @Body() createLogSourceDto: CreateLogSourceDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.logSourcesService.createLogSource(user.id, createLogSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all log-sources' })
  @ApiOkResponse({ description: "List all user's log sources" })
  findAll(@UserCtx() user: IUserCtx) {
    return this.logSourcesService.getAllLogSources(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log-source by ID' })
  @ApiOkResponse({ description: 'Log-source found' })
  @ApiNotFoundResponse({ description: 'Log-source not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.logSourcesService.getLogSourceById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update log-source' })
  @ApiOkResponse({ description: 'Log-source updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Log-source not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UserCtx() user: IUserCtx,
    @Body() updateLogSourceDto: UpdateLogSourceDto,
  ) {
    return this.logSourcesService.updateLogSource(
      id,
      user.id,
      updateLogSourceDto,
    );
  }

  @ApiOperation({ summary: 'Delete log-source' })
  @ApiOkResponse({ description: 'Log-source deleted' })
  @ApiNotFoundResponse({ description: 'Log-source not found' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.logSourcesService.deleteLogSource(id, user.id);
  }
}
