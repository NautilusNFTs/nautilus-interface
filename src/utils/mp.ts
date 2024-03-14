//import { fee } from "../constants/mp";

import { CollectionI, RankingI, Token } from "../types";

export const computeExtraPayment = (
  price: any,
  royalties: any,
  fee: any,
  rate = 1
) => {
  const { royaltyPercent } = royalties;
  return (
    rate *
    ((price * (royaltyPercent + computeMarketplaceFee(royalties, fee))) / 100)
  );
};
export const computeMarketplaceFee = (royalties: any, fee: any) =>
  Math.max(
    1,
    Math.min(
      fee,
      Math.ceil(royalties.royaltyPercent / royalties.creatorAddressCount)
    )
  );
export const getPriceSymbol = (price: any, node: any, tokens: any) => {
  const [pType, ...prc] = price;
  switch (pType) {
    case "00": {
      switch (node) {
        case "voi":
        case "voi-testnet":
          return "VOI";
        default:
          return "ALGO";
      }
    }
    case "01": {
      const [_, tidr, tprcr] = price;
      const tid = Number("0x" + tidr);
      const token = tokens.find((el: any) => el.tokenId === tid);
      return token?.symbol || "UNK";
    }
  }
};
export const decodeDecimals = (price: any, node: any, tokens: any) => {
  const [pType, ...prc] = price;
  switch (pType) {
    case "00": {
      switch (node) {
        case "algorand":
        case "algorand-testnet":
        case "voi":
        case "voi-testnet":
          return 6;
        default:
          return 0;
      }
    }
    case "01": {
      const [, tidr] = price;
      const tid = Number("0x" + tidr);
      const token = tokens?.find((el: any) => el.tokenId === tid);
      return Number(token?.decimals || 1);
    }
  }
};

export const decodeTokenId = (price: any) => {
  const [pType, ...prc] = price;
  switch (pType) {
    case "00": {
      return 0;
    }
    case "01": {
      const [_, tidr] = price;
      const tid = Number("0x" + tidr);
      return tid;
    }
  }
};

export const decodePrice = (price: any) => {
  if (!price) return 0;
  const [pType, ...prc] = price;
  switch (pType) {
    case "00": {
      const prcn = Number(prc);
      return prcn;
    }
    case "01": {
      const [_, tidr, tprcr] = price;
      const tprc = Number("0x" + tprcr);
      return tprc;
    }
    default: {
      return 0;
    }
  }
};

// export const computeSalePrice = (price, royalties, token) => {
//   const salePrice = (prc) => prc + computeExtraPayment(prc, royalties, fee);
//   return salePrice(price);
// };

// export const computeNFTSalePrice = (
//   tokens,
//   price,
//   royalties,
//   fee,
//   addFee = false
// ) => {
//   console.log({ tokens, price, royalties, fee, addFee });
//   const [pType, ...prc] = price;
//   const salePrice = (prc) => prc + computeExtraPayment(prc, royalties, fee);
//   switch (pType) {
//     case "00": {
//       const prcn = Number(prc);
//       return addFee ? salePrice(prcn) : prcn; /// 1e6;
//     }
//     case "01": {
//       /*
//       const l = nfts.find((el) => {
//         const [lmp, txId, round, ts, llId, cId, tId, lAddr, lPrc] = el;
//         return llId === lId && lmp === mp;
//       });
//       const LPRC = 8;
//       */
//       const [_, tidr, tprcr] = price;
//       const tid = Number("0x" + tidr);
//       const tprc = Number("0x" + tprcr.slice(0, tprcr.length - 6));
//       //const token = tokens?.find((el) => el.tokenId === tid);
//       const au = tprc;
//       //const decimals = Number(token?.decimals || 1);
//       return au; /// decimals;
//     }
//   }
// };

export const getRankings = (
  tokens: Token[],
  collections: CollectionI[],
  sales: any,
  listings: any,
  exchangeRate: number
) => {
  const scores = new Map();
  const saleCounts = new Map();
  for (const sale of sales) {
    if (scores.has(sale.collectionId)) {
      scores.set(
        sale.collectionId,
        scores.get(sale.collectionId) +
          (sale.currency === 0 ? sale.price / exchangeRate : sale.price)
      );
      saleCounts.set(sale.collectionId, saleCounts.get(sale.collectionId) + 1);
    } else {
      scores.set(
        sale.collectionId,
        sale.currency === 0 ? sale.price / exchangeRate : sale.price
      );
      saleCounts.set(sale.collectionId, 1);
    }
  }
  const floors = new Map();
  for (const listing of listings) {
    if (floors.has(listing.collectionId)) {
      floors.set(
        listing.collectionId,
        Math.min(
          floors.get(listing.collectionId),
          listing.currency === 0 ? listing.price / exchangeRate : listing.price
        )
      );
    } else {
      floors.set(
        listing.collectionId,
        listing.currency === 0 ? listing.price / exchangeRate : listing.price
      );
    }
  }
  const rankings = Array.from(scores.entries()).map((kv: any) => {
    const collection: CollectionI =
      collections.find((c: any) => `${c.contractId}` === `${kv[0]}`) ||
      ({} as CollectionI);
    const token: Token =
      tokens.find(
        (t: any) => `${t.contractId}` === `${kv[0]}` && `${t.tokenId}` === "1"
      ) || ({} as Token);
    const collectionTokens = tokens.filter(
      (t: any) => `${t.contractId}` === `${kv[0]}`
    );
    const saleCount = saleCounts.get(kv[0]) || 0;
    const owners = new Set();
    for (const token of collectionTokens) {
      owners.add(token.owner);
    }
    const floorPrice = floors.get(kv[0]) || 0;
    const volume = kv[1];
    return {
      collectionId: kv[0],
      image: token?.metadata?.image,
      floorPrice,
      volume,
      name: `${token?.metadata?.name?.replace(/[0-9 #]*$/, "")}`,
      score: `${Math.round(volume / 1e6).toLocaleString()}`,
      rank: volume,
      scoreUnit: "VIA",
      owners: owners.size,
      items: collection?.totalSupply || 0,
      sales: saleCount,
      exchangeRate,
    };
  });
  rankings.sort((a: RankingI, b: RankingI) => {
    if (b.rank === a.rank) {
      return b.volume - a.volume;
    } else {
      return b.rank - a.rank;
    }
  });
  return rankings;
};

export const compactAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;
