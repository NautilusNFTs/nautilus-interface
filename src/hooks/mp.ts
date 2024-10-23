import { INDEXER_API } from "@/contants/endpoints";
import { stakingRewards } from "@/static/staking/staking";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMarketplaceListings = (contractId: number) => {
  const data = useQuery({
    queryFn: () => {
      return axios
        .get(`${INDEXER_API}/nft-indexer/v1/mp/listings`, {
          params: {
            active: true,
            collectionId: contractId,
          },
        })
        .then(({ data: { listings } }) => {
          return listings.map((listing: any) => {
            if (listing.collectionId !== 421076) return listing;
            const rewards = stakingRewards.find(
              (el) => el.contractId === listing.tokenId
            );
            const isStaking = listing.staking.global_period_limit > 5;
            const type = isStaking ? "Staking" : "Airdrop";
            const global_initial =
              rewards?.initial || listing.staking.global_initial || 0;
            const global_total =
              rewards?.total || listing.staking.global_total || 0;

            const discount =
              ((Number(global_total) - Number(listing.price / 1e6)) /
                Number(global_total)) *
              100;
            return {
              ...listing,
              rewards,
              staking: {
                ...listing.staking,
                type,
                global_initial,
                global_total,
                discount,
              },
            };
          });
        });
    },
    queryKey: ["marketplaceListings", contractId],
  });
  return data;
};
