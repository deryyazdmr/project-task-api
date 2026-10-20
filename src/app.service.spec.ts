import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService proje erişimi', () => {
  let service: AppService;

  const prismaMock = {
    project: {
      findMany: jest.fn<(...args: unknown[]) => Promise<unknown[]>>(),
      findUnique: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('projeleri giriş yapan kullanıcıya göre filtreler', async () => {
    prismaMock.project.findMany.mockResolvedValue([]);

    await service.getProjects(7);

    expect(prismaMock.project.findMany).toHaveBeenCalledWith({
      where: {
        userId: 7,
      },
      orderBy: {
        id: 'asc',
      },
    });
  });

  it('proje detayında hem proje hem kullanıcı ID bilgisini kontrol eder', async () => {
    const project = {
      id: 2,
      name: 'Test projesi',
      userId: 7,
    };

    prismaMock.project.findUnique.mockResolvedValue(project);

    const result = await service.getProjectById(2, 7);

    expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
      where: {
        id: 2,
        userId: 7,
      },
    });

    expect(result).toEqual(project);
  });

  it('kullanıcının erişebildiği proje bulunamazsa 404 hatası verir', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(
      service.getProjectById(2, 8),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});