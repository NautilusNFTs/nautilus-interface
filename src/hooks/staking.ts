import { INDEXER_API } from "@/contants/endpoints";
import { stakingRewards } from "@/static/staking/staking";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const addRewardEstimates = (accounts: any[]) => {
  return accounts.map((account) => {
    console.log({ account });
    const reward = stakingRewards.find(
      (reward) => `${reward.contractId}` === `${account.contractId}`
    );
    const isStaking = account.global_period_limit > 5;
    return {
      ...account,
      global_initial:
        reward?.initial ||
        account.global_initial ||
        account?.global_initial ||
        0,
      global_total: !isStaking
        ? reward?.total || reward?.global_total || account?.global_total || 0
        : reward?.total || reward?.global_total || account?.global_total || 0,
    };
  });
};

export const useStakingContract = (contractId: number) => {
  const data = useQuery({
    queryFn: () => {
      return axios
        .get(`${INDEXER_API}/v1/scs/accounts`, {
          params: {
            contractId,
          },
        })
        .then(({ data: { accounts } }) => addRewardEstimates(accounts));
    },
    queryKey: ["stakingAccount", contractId],
  });
  return data;
};
