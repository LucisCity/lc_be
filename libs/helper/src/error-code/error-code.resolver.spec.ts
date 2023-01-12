import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCodeResolver } from './error-code.resolver';

describe('ErrorCodeResolver', () => {
  let resolver: ErrorCodeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorCodeResolver],
    }).compile();

    resolver = module.get<ErrorCodeResolver>(ErrorCodeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
