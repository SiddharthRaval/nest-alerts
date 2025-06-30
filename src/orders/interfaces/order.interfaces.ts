export interface OrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
  extra?: Record<string, any>;
}

export interface ExchangeConfig {
  apiKey: string;
  apiSecret: string;
  isFutures: boolean;
  isTestnet: boolean;
  client: any;
  useDirect: boolean;
}

export interface OrderResult {
  source: 'ccxt' | 'binance-rest' | 'binance-rest-fallback';
  result: any;
}

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}