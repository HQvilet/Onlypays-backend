import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  const mockConnection = {
    readyState: 1,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome string', () => {
      expect(appController.getHello()).toBe('OnlyPays Media Service');
    });
  });

  describe('health', () => {
    it('should return OK status', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('OK');
      expect(result.service).toBe('media-service');
    });
  });
});
