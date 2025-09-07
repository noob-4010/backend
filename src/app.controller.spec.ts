import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Code } from './codes/code.entity';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getRepositoryToken(Code),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  it('should return root message', () => {
    expect(appController.getRoot()).toBe('Server is running 🚀');
  });

  it('should return codes array', async () => {
    const codes = await appController.getCodes();
    expect(codes).toEqual([]);
  });
});