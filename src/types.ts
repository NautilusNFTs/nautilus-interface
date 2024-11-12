/* Token */

export interface TokenI {
  owner: string;
  approved: string;
  contractId: number;
  tokenId: number;
  metadataURI: string;
}

export interface CollectionTokenI extends TokenI {
  metadata: string;
}

export interface NFTIndexerToken extends CollectionTokenI {
  ["mint-round"]: number;
}

export interface NFTIndexerTokenResponse {
  currentRound: number;
  tokens: NFTIndexerToken[];
  ["next-token"]: string;
}

export interface Properties {
  [key: string]: string;
}

export interface NFTMetadata {
  description: string;
  image: string;
  image_integrity: string;
  image_mimetype: string;
  name: string;
  properties: Properties;
  royalties: string;
}

export interface Token extends TokenI {
  pk: string;
  metadata: NFTMetadata;
  royalties: any;
}

/* Collection */

export interface CollectionI {
  contractId: number;
  totalSupply: number;
  isBlacklisted: number;
  mintRound: number;
}

export interface NFTIndexerCollectionI extends CollectionI {
  firstToken: CollectionTokenI | null;
}

export interface NFTIndexerCollectionResponse {
  collections: NFTIndexerCollectionI[];
  ["next-token"]: string;
}

/* Listing */

export interface NFTIndexerListingI {
  transactionId: string;
  mpContractId: number;
  mpListingId: number;
  tokenId: number;
  seller: string;
  price: number;
  currency: number;
  createRound: number;
  createTimestamp: number;
  endTimestamp: number | null;
  royalty: number | null;
  collectionId: number;
  token?: any;
  delete?: any;
  sale?: any;
}

export interface ListingI {
  pk: string;
  mpContractId: number;
  mpListingId: number;
  tokenId: number;
  seller: string;
  buyer?: string;
  currency: number;
  price: number;
  normalPrice?: number;
  round: number;
  timestamp: number;
  collectionId: number;
  endTimestamp: number | null;
  royalty: number | null;
  // nftindexerlistingi
  transactionId: string;
  createTimestamp: number;
}

export interface ListingActivityI extends ListingI {
  activity: "listing";
}

export interface ListedToken extends Token {
  listing: ListingI;
}

/* Sale */

export interface SaleI {
  transactionId: string;
  mpContractId: number;
  mpListingId: number;
  tokenId: number;
  seller: string;
  buyer: string;
  currency: number;
  price: number;
  round: number;
  timestamp: number;
  collectionId: number;
}

export interface SaleActivityI extends SaleI {
  activity: "sale";
}

export interface NFTIndexerSaleI extends SaleI {
  listing: ListingI;
}

export interface NFTIndexerSaleResponse {
  ["current-round"]: number;
  sales: NFTIndexerSaleI[];
  ["next-token"]: string;
}

export interface Sale extends SaleI {
  pk: string;
  token: Token;
  collection: CollectionI;
}

/* Ranking */

export interface RankingI {
  collectionId: number;
  image: string;
  floorPrice: number;
  volume: number;
  name: string;
  score: string;
  rank: number;
  scoreUnit: string;
  owners: number;
  items: number;
  sales: number;
}

/* Activity */

export interface ActivityI {
  image: string;
  tokenName: string;
  activity: string;
  seller: string;
  buyer: string;
  price: number;
}
