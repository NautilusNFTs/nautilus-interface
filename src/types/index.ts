export interface RankingI {
  id: string;
  name: string;
  image: string;
  contractId: string;
  volume: number;
  floorPrice: number;
  items: number;
  owners: number;
  sales: number;
}

export interface Pool {
  contractId: number;
  providerId: string;
  tokAId: number;
  tokBId: number;
  balA: string;
  balB: string;
  decA: number;
  decB: number;
  mintRound: number;
  tvl: string;
}

export interface PaymentToken {
  tokenId: number;
  symbol: string;
  decimals: number;
  pool?: {
    contractId: string;
  };
}

export interface PoolsResponse {
  "current-round": number;
  pools: Pool[];
}

export interface Arc200Balance {
  assetId: string;
  balance: string;
  loading: boolean;
  error: string | null;
  assetType: number;
  decimals: number;
}

export interface TokenType {
  contractId: number;
  decimals: number;
  price: string;
  [key: string]: any;
}

export interface ListingTokenI {
  contractId: string;
  tokenId: string;
  [key: string]: any;
}

export interface NFTIndexerTokenI {
  contractId: string;
  tokenId: string;
  [key: string]: any;
}

export interface NFTIndexerListingI {
  collectionId: string;
  tokenId: string;
  mpContractId: string;
  mpListingId: string;
  [key: string]: any;
} 