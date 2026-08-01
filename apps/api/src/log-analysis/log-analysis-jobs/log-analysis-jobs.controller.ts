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
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { UserCtx } from '@/auth/user.decorator';
import { type IUserCtx } from '@/auth/user.interface';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create log-analysis-job' })
  @ApiCreatedResponse({ description: 'Log-analysis-job created successfully' })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.logAnalysisJobsService.createLogAnalysisJob(
      createLogAnalysisJobDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all log-analysis-jobs' })
  @ApiOkResponse({ description: "List all user's log-analysis-jobs sources" })
  findAll(@UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.getAllLogAnalysisJobs(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log-analysis-job by ID' })
  @ApiOkResponse({ description: 'Log-analysis-job found' })
  @ApiNotFoundResponse({ description: 'Log-analysis-job not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.getLogAnalysisJobById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update log-analysis-job' })
  @ApiOkResponse({ description: 'Log-analysis-job updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Log-analysis-job not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.logAnalysisJobsService.updateLogAnalysisJob(
      id,
      user.id,
      updateLogAnalysisJobDto,
    );
  }

  @ApiOperation({ summary: 'Delete log-analysis' })
  @ApiOkResponse({ description: 'Log-analysis deleted' })
  @ApiNotFoundResponse({ description: 'Log-analysis not found' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.deleteLogAnalysisJob(id, user.id);
  }
}
