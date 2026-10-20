import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Param, ParseIntPipe } from '@nestjs/common';
import { Body, Post} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { Patch } from '@nestjs/common';
import { UpdateProjectDto } from './dto/create-project.dto';
import { Delete } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Req } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects')
  getProjects(@Req() request: AuthenticatedRequest) {
    return this.appService.getProjects(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:id')
  getProjectById(@Param('id', ParseIntPipe)id : number, @Req() request: AuthenticatedRequest) {
    return this.appService.getProjectById(id, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects')
  createProject(@Body() body: CreateProjectDto, @Req() request: AuthenticatedRequest,) {
    return this.appService.createProject(body.name,
      body.description ?? '',
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('projects/:id')
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProjectDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.updateProject(id, body, request.user.id,);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  deleteProject(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.appService.deleteProject(id, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:projectId/tasks')
  createTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: CreateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.createTask( 
      projectId, 
      body, 
      request.user.id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:projectId/tasks')
  getTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.getTasks(
      projectId, 
      request.user.id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:projectId/tasks/:taskId')
  getTaskById(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Req() request: AuthenticatedRequest,
   ) {
      return this.appService.getTaskById(
        projectId, 
        taskId,
        request.user.id
      );
   }
    @UseGuards(JwtAuthGuard)
    @Patch('projects/:projectId/tasks/:taskId')
  updateTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() body: UpdateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.updateTask(
      projectId,
      taskId,
      body,
      request.user.id,
    );
  }
    @UseGuards(JwtAuthGuard)
    @Delete('projects/:projectId/tasks/:taskId')
    deleteTask(
      @Param('projectId', ParseIntPipe) projectId: number,
      @Param('taskId', ParseIntPipe) taskId: number,
      @Req() request: AuthenticatedRequest,
  ) {
    return this.appService.deleteTask(
      projectId,
      taskId,
      request.user.id,
    );
  }
}
