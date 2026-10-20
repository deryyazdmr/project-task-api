import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProjectDto } from './dto/create-project.dto';
import { PrismaService } from './prisma/prisma.service';
import { Prisma } from './generated/prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Selam! Bu bir NestJS uygulamasıdır.';
  }

  getProjects(userId: number) {
    return this.prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getProjectById(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if(!project) {
      throw new NotFoundException(`Proje bulunamadı.`);
    }
    return project;
  }
  createProject(name: string, description: string, userId: number) {
    return this.prisma.project.create({
      data: {
        name: name,
        description: description,
        userId: userId,
      },
    });
  }
  async updateProject(
    id: number, 
    data: UpdateProjectDto, 
    userId: number
  ) {
    try {
      return await this.prisma.project.update({
        where: {
          id: id,
          userId: userId,
        },
        data: {
          name: data.name,
          description: data.description,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Proje bulunamadı.`);
      }
      throw error;
    }
  }
  async deleteProject(id: number, userId: number) {
    try {
      return await this.prisma.project.delete({
        where: {
          id: id,
          userId: userId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Proje bulunamadı.`);
      }
      throw error;
    }
  }
  async createTask(
    projectId: number,
    data: CreateTaskDto,
    userId: number,
  ) {
    await this.getProjectById(projectId, userId);

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: projectId,
      },
    });
  }
  async getTasks(projectId: number, userId: number) {
    await this.getProjectById(projectId, userId);

    return this.prisma.task.findMany({
      where: {
        projectId: projectId,
        project: {
          userId: userId,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }
  async getTaskById(
    projectId: number,
    taskId: number,
    userId: number,
  ) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId: projectId,
        project: {
          userId: userId,
        },
      },
    });

    if(!task) {
      throw new NotFoundException(`Görev bulunamadı.`);
    }
    return task;
  }
  async updateTask(
    projectId: number,
    taskId: number,
    data: UpdateTaskDto,
    userId: number,
  ) {
    try {
      return await this.prisma.task.update({
        where: {
          id: taskId,
          projectId: projectId,
          project: {
            userId: userId,
          },
        },
        data: {
          title: data.title,
          description: data.description,
          completed: data.completed,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Görev bulunamadı.`);
      }
      throw error;
    }
  }
  async deleteTask(
    projectId: number,
    taskId: number,
    userId: number,
  ) {
    try {
      return await this.prisma.task.delete({
        where: {
          id: taskId,
          projectId: projectId,
          project: {
            userId: userId,
          },
        },
      });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError && 
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Görev Bulunamadı.');
    }

    throw error;
    }
  }

  constructor(private readonly prisma: PrismaService) {}
}
