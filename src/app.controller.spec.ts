import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import type { AuthenticatedRequest } from './auth/jwt-auth.guard';

describe('AppController', () => {
  let controller: AppController;

  const projects = [
    {
      id: 2,
      name: 'Test projesi',
      description: 'Controller testi',
      userId: 1,
    },
  ];

  const appServiceMock = {
    getProjects: jest.fn(async (_userId: number) => projects),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AppController>(AppController);
  });

  it('listeleme için giriş yapan kullanıcının ID bilgisini servicee iletir', async () => {
    const request = {
      user: {
        id: 1,
      },
    } as AuthenticatedRequest;

    const result = await controller.getProjects(request);

    expect(appServiceMock.getProjects).toHaveBeenCalledTimes(1);
    expect(appServiceMock.getProjects).toHaveBeenCalledWith(1);
    expect(result).toEqual(projects);
  });
});