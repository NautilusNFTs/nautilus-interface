import { useState, useEffect } from "react";
import algosdk from "algosdk";
import { getAlgorandClients } from "@/wallets";

const { algodClient } = getAlgorandClients();

export const useAccountBalance = (accountId: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!accountId) {
        setIsLoading(false);
        return;
      }

      try {
        const accountInfo = await algodClient
          .accountInformation(accountId)
          .do();
        setBalance(accountInfo.amount);
        setError(null);
      } catch (err) {
        console.error("Error fetching account balance:", err);
        setError("Failed to fetch balance");
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [accountId]);

  return { balance, isLoading, error };
};
