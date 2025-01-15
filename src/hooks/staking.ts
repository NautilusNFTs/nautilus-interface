import { INDEXER_API } from "@/contants/endpoints";
import { AIRDROP_FUNDING } from "@/contants/staking";
import { stakingRewards } from "@/static/staking/staking";
import { getStakingWithdrawableAmount } from "@/utils/staking";
import { getAlgorandClients } from "@/wallets";
import { useQuery, QueryClient } from "@tanstack/react-query";
import algosdk from "algosdk";
import axios from "axios";

const { algodClient } = getAlgorandClients();
const queryClient = new QueryClient();

export const addRewardEstimates = (accounts: any[]) => {
  return accounts.map((account) => {
    const reward = stakingRewards.find(
      (reward) => `${reward.contractId}` === `${account.contractId}`
    );
    const isStaking = account.global_period_limit > 5;
    const global_funding = account?.global_funding || AIRDROP_FUNDING;
    const global_unlock =
      global_funding +
      (account.global_lockup_delay * account.global_period +
        account.global_vesting_delay) *
        account.global_period_seconds +
      account.global_distribution_count * account.global_distribution_seconds;
    return {
      ...account,
      type: isStaking ? "Staking" : "Airdrop",
      // global_initial:
      //   reward?.initial ||
      //   account.global_initial ||
      //   account?.global_initial ||
      //   0,
      // global_total: reward?.total || account?.global_total || 0,
      global_funding,
      global_unlock,
    };
  });
};

export const useOwnedStakingContract = (owner: string) => {
  const data = useQuery({
    queryFn: () => {
      return axios
        .get(`${INDEXER_API}/v1/scs/accounts`, {
          params: {
            owner,
          },
        })
        .then(({ data: { accounts } }) => addRewardEstimates(accounts));
    },
    queryKey: ["stakingAccount", owner],
  });
  return data;
};

interface useStakingContractOpts {
  includeRewards?: boolean;
  includeWithdrawable?: boolean;
}
export const useStakingContract = (
  contractId: string,
  opts?: useStakingContractOpts
) => {
  return useQuery({
    queryKey: ["stakingAccount", contractId, opts],
    queryFn: async () => {
      const {
        data: { accounts },
      } = await axios.get(`${INDEXER_API}/v1/scs/accounts`, {
        params: { contractId },
      });

      const [account] = addRewardEstimates(accounts);

      if (opts?.includeWithdrawable) {
        const accInfo = await algodClient
          .accountInformation(algosdk.getApplicationAddress(account.contractId))
          .do();
        const withdrawable = await getStakingWithdrawableAmount(
          algodClient,
          Number(contractId),
          account.global_owner
        );
        return {
          ...account,
          value: accInfo.amount,
          withdrawable: withdrawable.toString(),
          unlockTime:
            account.global_funding +
            (account.global_lockup_delay +
              account.global_vesting_delay * account.global_period) *
              account.global_period_seconds +
            account.global_distribution_count *
              account.global_distribution_seconds,
        };
      }
      return account;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Function to prefetch data
export const prefetchStakingContract = async (
  contractId: number,
  opts?: useStakingContractOpts
) => {
  await queryClient.prefetchQuery({
    queryKey: ["stakingAccount", contractId, opts],
    queryFn: async () => {
      const {
        data: { accounts },
      } = await axios.get(`${INDEXER_API}/v1/scs/accounts`, {
        params: { contractId },
      });

      const [account] = addRewardEstimates(accounts);

      if (opts?.includeWithdrawable) {
        const withdrawable = await getStakingWithdrawableAmount(
          algodClient,
          contractId,
          account.global_owner
        );
        return {
          ...account,
          withdrawable: withdrawable.toString(),
        };
      }

      return account;
    },
  });
};
