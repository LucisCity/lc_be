import { ethers } from 'ethers';

export type Chain = {
  symbol: string;
  name: string | null;
  chain_id: number | null;
  rpc_url: string | null;
  icon: string | null;
  explorer: string | null;
  // enable: boolean
  // created_at: Date
  // updated_at: Date
};

const providers: { [key: string]: ethers.providers.JsonRpcProvider } = {};

const get_provider = (chain: Chain) => {
  if (!providers[chain.symbol]) {
    providers[chain.symbol] = new ethers.providers.JsonRpcProvider(
      chain.rpc_url,
      { name: chain.symbol, chainId: chain.chain_id },
    );
  }
  return providers[chain.symbol];
};

export const ETH = {
  getProvider: (chain: Chain) => {
    return get_provider(chain);
  },
  getBlock: async (chain: Chain, block: number) => {
    return get_provider(chain).getBlock(block);
  },
  lastBlock: async (chain: Chain) => {
    return get_provider(chain).getBlockNumber();
  },
  generateAddress: () => {
    return ethers.Wallet.createRandom();
  },
  getLogs: async (
    chain: Chain,
    from: number,
    to: number,
    address?: string,
    topics?: string[],
  ) => {
    const req: any = {
      fromBlock: from,
      toBlock: to,
    };
    if (address) {
      req['address'] = address;
    }
    if (topics) {
      const _topics: string[] = [];
      for (const item of topics) {
        if (item.indexOf('(') >= 0) {
          _topics.push(ethers.utils.id(item));
        } else {
          _topics.push(item);
        }
      }
      req.topics = _topics;
    }
    // console.log(req)
    return get_provider(chain).getLogs(req);
  },
  /***
   * @param amount want to send. Exp: 0.1 bnb
   * @param prv_key private key of owner address
   *  ***/
  send: async (
    to: string,
    amount: string,
    privateKey: string,
    chain: Chain,
  ) => {
    const wallet = new ethers.Wallet(privateKey, get_provider(chain));
    const transactionResult = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseUnits(amount, 18),
    });
    return transactionResult;
  },
};
