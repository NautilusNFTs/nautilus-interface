import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button, Typography, Stack, TextField } from "@mui/material";
import { useWallet } from "@txnlab/use-wallet-react";
import { stakingRewards } from "@/static/staking/staking";
import axios from "axios";
import { CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border-radius: 10px;

  &.dark {
    background: #202020;
    border: 1px solid #2b2b2b;
  }

  &.light {
    background: #fff;
    border: 1px solid #eaebf0;
  }
`;

const StyledButton = styled(Button)`
  && {
    background: #9933ff;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-transform: none;
    font-weight: 600;

    &:hover {
      background: #8829ff;
    }

    &:disabled {
      background: #666;
      color: #999;
    }
  }
`;

const InfoText = styled(Typography)`
  &.dark {
    color: #fff;
  }

  &.light {
    color: #000;
  }
`;

const MintContainer: React.FC = () => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const { activeAccount, signTransactions } = useWallet();
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!activeAccount) return;
    axios
      .get(`https://mainnet-idx.nautilus.sh/v1/scs/accounts`, {
        params: {
          owner: activeAccount.address,
        },
      })
      .then(({ data: { accounts } }) => {
        setAccounts(
          accounts.map((account: any) => {
            const reward = stakingRewards.find(
              (reward) => `${reward.contractId}` === `${account.contractId}`
            );
            return {
              ...account,
              global_initial:
                reward?.initial ||
                account.global_initial ||
                account?.global_initial ||
                0,
              global_total:
                reward?.total ||
                reward?.global_total ||
                account?.global_total ||
                0,
            };
          })
        );
      });
  }, [activeAccount]);

  const handleMint = async () => {
    if (!activeAccount || !amount) return;

    try {
      setIsLoading(true);

      /*
      const { algodClient } = getAlgorandClients();
      const contract = new CONTRACT(algodClient);
      
      const stakingTxn = await contract.prepareMintTransaction({
        from: activeAccount.address,
        amount: Number(amount),
        stakingAccount: accounts[0]
      });

      const signedTxns = await signTransactions([stakingTxn]);
      
      const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
      
      await algodClient.waitForConfirmation(txId, 4);
      */

      setAmount("");
    } catch (error) {
      console.error("Error minting:", error);
      // TODO: Add error handling/notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className={isDarkTheme ? "dark" : "light"}>
      <Stack spacing={3}>
        <InfoText variant="h5" className={isDarkTheme ? "dark" : "light"}>
          Mint Staking Position
        </InfoText>

        <InfoText variant="body1" className={isDarkTheme ? "dark" : "light"}>
          Mint a new staking position by specifying the amount of VOI you want
          to stake.
        </InfoText>

        <TextField
          label="Amount to Stake (VOI)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          InputProps={{
            inputProps: { min: 0 },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: isDarkTheme ? "#3b3b3b" : "#eaebf0",
              },
              "&:hover fieldset": {
                borderColor: "#9933ff",
              },
            },
            "& .MuiInputLabel-root": {
              color: isDarkTheme ? "#fff" : "#000",
            },
            "& .MuiInputBase-input": {
              color: isDarkTheme ? "#fff" : "#000",
            },
          }}
          disabled={isLoading}
        />

        <StyledButton
          onClick={handleMint}
          disabled={
            !activeAccount || !amount || isLoading || accounts.length === 0
          }
        >
          {!activeAccount
            ? "Connect Wallet to Mint"
            : accounts.length === 0
            ? "No Staking Positions Found"
            : isLoading
            ? "Minting..."
            : "Mint Staking Position"}
        </StyledButton>
      </Stack>
    </Container>
  );
};

export default MintContainer;
