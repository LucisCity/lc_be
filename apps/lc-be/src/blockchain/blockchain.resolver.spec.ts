import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainResolver } from './blockchain.resolver';

describe('BlockchainResolver', () => {
  let resolver: BlockchainResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainResolver],
    }).compile();

    resolver = module.get<BlockchainResolver>(BlockchainResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
