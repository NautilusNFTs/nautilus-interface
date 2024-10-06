import { getAlgorandClients } from "@/wallets";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@txnlab/use-wallet-react";

export const useAccountInfo = () => {
  const { activeAccount } = useWallet();
  const { algodClient } = getAlgorandClients();
  const data = useQuery({
    queryFn: () => {
      if (!activeAccount) return null;
      return algodClient.accountInformation(activeAccount?.address).do();
    },
    queryKey: ["accountInfo", activeAccount?.address],
  });
  return data;
};
