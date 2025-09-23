export interface EtherscanTransaction {
  hash: string;
  from: string;
  to:string;
  value: string;
  timeStamp: string;
  functionName: string;
  blockNumber: string;
  gasUsed: string;
  gasPrice: string;
}

export interface ExplainedTransaction extends EtherscanTransaction {
  explanation: string | null;
  isExplanationLoading: boolean;
}

export interface EtherscanNftTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface Nft {
  id: string; // contractAddress-tokenID
  contractAddress: string;
  tokenID: string;
  name: string;
}

export interface WalletSummary {
  balance: string; // in wei
  summary: string | null;
  nfts: Nft[];
  balanceUsd: number | null;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// --- CoinMarketCap Types ---

export interface UsdQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  last_updated: string;
}

export interface CoinMarketCapQuote {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
  cmc_rank: number;
  last_updated: string;
  quote: {
    USD: UsdQuote;
  };
}

export interface CoinMarketCapResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: {
    [symbol: string]: CoinMarketCapQuote;
  };
}
