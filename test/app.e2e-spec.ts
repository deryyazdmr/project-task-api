import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Kullanıcı ve veri erişimi E2E', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService | undefined;
  let testDirectory: string;

  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousJwtSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    testDirectory = mkdtempSync(
      join(tmpdir(), 'project-task-api-e2e-'),
    );

    const databasePath = join(testDirectory, 'test.db')
      .replace(/\\/g, '/');

    process.env.DATABASE_URL = `file:${databasePath}`;
    process.env.JWT_SECRET =
      'only-for-automated-tests-not-a-real-production-secret';

    execFileSync(
      process.execPath,
      [
        join(process.cwd(), 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--config',
        './prisma7.config.ts',
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env },
        stdio: 'inherit',
        timeout: 60000,
      },
    );

    const { AppModule } = await import('../src/app.module.js');

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  }, 90000);

  afterAll(async () => {
    try {
      await app?.close();
    } finally {
      await prisma?.$disconnect();

      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }

      if (previousJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = previousJwtSecret;
      }

      if (testDirectory) {
        rmSync(testDirectory, {
          recursive: true,
          force: true,
          maxRetries: 3,
          retryDelay: 100,
        });
      }
    }
  });

  it('kayıt giriş doğrulama ve kullanıcılar arası erişimi kontrol eder', async () => {
    if (!app || !prisma) {
      throw new Error('Test uygulaması başlatılamadı');
    }

    const server = app.getHttpServer();

    const userA = {
      email: 'user-a@example.com',
      password: 'Deneme123!',
    };

    const userB = {
      email: 'user-b@example.com',
      password: 'Deneme456!',
    };

    const registration = await request(server)
      .post('/auth/register')
      .send(userA)
      .expect(201);

    expect(registration.body).not.toHaveProperty('password');
    expect(registration.body).not.toHaveProperty('passwordHash');

    await request(server)
      .post('/auth/register')
      .send(userA)
      .expect(409);

    await request(server)
      .post('/auth/register')
      .send(userB)
      .expect(201);

    await request(server)
      .post('/auth/login')
      .send({
        email: userA.email,
        password: 'YanlisParola123!',
      })
      .expect(401);

    const loginA = await request(server)
      .post('/auth/login')
      .send(userA)
      .expect(200);

    const loginB = await request(server)
      .post('/auth/login')
      .send(userB)
      .expect(200);

    const tokenA = (loginA.body as {
      access_token: string;
    }).access_token;

    const tokenB = (loginB.body as {
      access_token: string;
    }).access_token;

    expect(typeof tokenA).toBe('string');
    expect(typeof tokenB).toBe('string');

    await request(server)
      .get('/projects')
      .expect(401);

    const projectResponse = await request(server)
      .post('/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'E2E projesi',
        description: 'Erişim testi',
      })
      .expect(201);

    const projectId = (projectResponse.body as {
      id: number;
    }).id;

    await request(server)
      .get('/projects')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)
      .expect([]);

    await request(server)
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(server)
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'İzinsiz değişiklik' })
      .expect(404);

    await request(server)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    const tasksUrl = `/projects/${projectId}/tasks`;

    await request(server)
      .post(tasksUrl)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: '   ' })
      .expect(400);

    await request(server)
      .post(tasksUrl)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'İzinsiz görev' })
      .expect(404);

    const taskResponse = await request(server)
      .post(tasksUrl)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'E2E görevi' })
      .expect(201);

    const taskId = (taskResponse.body as {
      id: number;
    }).id;

    const taskUrl = `${tasksUrl}/${taskId}`;

    await request(server)
      .get(tasksUrl)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(server)
      .get(taskUrl)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(server)
      .patch(taskUrl)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ completed: true })
      .expect(404);

    await request(server)
      .delete(taskUrl)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(server)
      .patch(taskUrl)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ completed: 'true' })
      .expect(400);

    await request(server)
      .get(taskUrl)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.title).toBe('E2E görevi');
        expect(response.body.completed).toBe(false);
      });

    await request(server)
      .patch(taskUrl)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ completed: true })
      .expect(200)
      .expect((response) => {
        expect(response.body.completed).toBe(true);
      });

    await request(server)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const remainingTasks = await prisma.task.count({
      where: { projectId: projectId },
    });

    expect(remainingTasks).toBe(0);
  }, 60000);
});