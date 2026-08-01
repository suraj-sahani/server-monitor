import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { UserCtx } from '@/auth/user.decorator';
import { type IUserCtx } from '@/auth/user.interface';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}

  @Post()
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.logAnalysisJobsService.create(createLogAnalysisJobDto, user.id);
  }

  @Get()
  findAll(@UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @UserCtx() user: IUserCtx,
  ) {
    return this.logAnalysisJobsService.update(
      id,
      user.id,
      updateLogAnalysisJobDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserCtx() user: IUserCtx) {
    return this.logAnalysisJobsService.remove(id, user.id);
  }
}
