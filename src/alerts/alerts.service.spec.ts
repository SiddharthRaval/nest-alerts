import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { ConfigService } from '../config/config.service';

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: ConfigService,
          useValue: {
            mode: 'test',
          },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
