import { Test, TestingModule } from '@nestjs/testing';
import { InvestResolver } from './invest.resolver';

describe('InvestResolver', () => {
  let resolver: InvestResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestResolver],
    }).compile();

    resolver = module.get<InvestResolver>(InvestResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
