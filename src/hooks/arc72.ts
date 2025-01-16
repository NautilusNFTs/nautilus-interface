import { ARC72_INDEXER_API } from "@/config/arc72-idx";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  addRewardEstimates,
  prefetchStakingContract,
  useStakingContract,
} from "./staking";

interface UseOwnedARC72TokenOpts {
  includeStaking?: boolean;
}
export const useOwnedARC72Token = (
  owner: string,
  contractId: number,
  opts: UseOwnedARC72TokenOpts
) => {
  const data = useQuery({
    queryFn: () => {
      return axios
        .get(`${ARC72_INDEXER_API}/nft-indexer/v1/tokens`, {
          params: {
            owner,
            contractId,
          },
        })
        .then(({ data }) => {
          if (opts?.includeStaking) {
            return Promise.all(
              data.tokens.map(async (token: any) => {
                const { data } = await axios.get(
                  `${ARC72_INDEXER_API}/v1/scs/accounts`,
                  {
                    params: { contractId: token.tokenId },
                  }
                );
                return {
                  ...token,
                  staking: addRewardEstimates(data.accounts)[0],
                };
              })
            );
          }
          return data.tokens;
        });
    },
    queryKey: ["arc72Tokens", owner, contractId, JSON.stringify(opts)],
    staleTime: opts?.includeStaking ? 5 * 60 * 1000 : undefined, // 5 minutes
  });
  return data;
};
