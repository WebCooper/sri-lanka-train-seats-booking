import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Reflector } from '@nestjs/core';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        Reflector,
        {
          provide: AdminService,
          useValue: {
            findAll: jest.fn(),
            createAdmin: jest.fn(),
            findOne: jest.fn(),
            updateAdmin: jest.fn(),
            removeAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
