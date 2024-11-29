import React, { FC } from "react";
import { useStakingContract } from "@/hooks/staking";
import { Box, Typography, Skeleton } from "@mui/material";
import { formatter } from "@/utils/number";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import humanizeDuration from "humanize-duration";
import { AIRDROP_FUNDING } from "@/contants/staking";
import moment from "moment";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import algosdk from "algosdk";

interface StakingInformationProps {
  contractId: number;
}

const StakingInformation: FC<StakingInformationProps> = ({ contractId }) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { data: account, isLoading: loadingAccountData } = useStakingContract(
    contractId,
    {
      includeRewards: true,
      includeWithdrawable: true,
    }
  );

  const { balance, isLoading: loadingBalance, error: balanceError } = useAccountBalance(
    algosdk.getApplicationAddress(contractId)
  );

  const renderBalance = () => {
    if (loadingBalance) {
      return (
        <Skeleton
          variant="text"
          width={120}
          height={24}
          sx={{
            bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        />
      );
    }

    if (balanceError) {
      return account.global_total / 1e6;
    }

    return balance ? balance / 1e6 : account.global_total / 1e6;
  };

  return !loadingAccountData ? (
    <Box>
      <Typography variant="h6">Account Information</Typography>
      <Typography variant="body2">
        <strong>Type:</strong>
        {` `}
        {account.global_parent_id === 400350 ? "Staking" : "Airdrop"}
      </Typography>
      <Typography variant="body2">
        <strong>Account ID:</strong>
        {` `}
        <a
          style={{ color: "#93F" }}
          target="_blank"
          rel="noreferrer"
          href={`https://explorer.voi.network/explorer/application/${account.contractId}/transactions`}
        >
          {account.contractId}
        </a>
      </Typography>
      <Typography variant="body2">
        <strong>Lockup:</strong>{" "}
        {humanizeDuration(
          account.global_period_seconds *
            (account.global_lockup_delay * account.global_period +
              account.global_vesting_delay) *
            1000,
          {
            largest: 2,
            round: true,
            units: ["mo"],
          }
        )}
      </Typography>
      <Typography variant="body2">
        <strong>Vesting:</strong>{" "}
        {humanizeDuration(
          account.global_distribution_count *
            account.global_distribution_seconds *
            1000,
          {
            largest: 2,
            round: true,
            units: ["mo"],
          }
        )}
      </Typography>
      <Typography variant="body2">
        <strong>Initial:</strong> {account.global_initial / 1e6} VOI
      </Typography>
      <Typography variant="body2">
        <strong>Total:</strong> {renderBalance()} VOI
      </Typography>

      {moment().unix() < AIRDROP_FUNDING ? (
        <>
          <Typography variant="body2">
            <strong>Stake Amount:</strong>{" "}
            {account.global_period > 5
              ? `${account.global_initial / 10 ** 6} VOI`
              : `${formatter.format(account.global_initial / 10 ** 6)} VOI`}
          </Typography>
          <Typography variant="body2">
            <strong>Est. Total Tokens:</strong>
            {` `}
            {formatter.format(balance ? balance : account.global_total / 1e6)} VOI
          </Typography>
        </>
      ) : null}
      {moment().unix() > account?.global_funding &&
      moment().unix() < account?.global_unlock ? (
        <>
          <Typography variant="body2">
            <strong>Unlock:</strong>{" "}
            {humanizeDuration(
              (account.global_unlock - moment().unix()) * 1000,
              {
                largest: 2,
                round: true,
                units: ["mo"],
              }
            )}
          </Typography>
        </>
      ) : null}
      <Typography variant="body2">
        <strong>Delegate:</strong>
        {` `}
        <a
          style={{ color: "#93F" }}
          target="_blank"
          rel="noreferrer"
          href={`https://explorer.voi.network/explorer/account/${account.global_delegate}`}
        >
          {account.global_delegate.slice(0, 10)}...
          {account.global_delegate.slice(-10)}
        </a>
      </Typography>
      {account?.withdrawable ? (
        <Typography variant="body2">
          <strong>Withdrawable amount:</strong>
          {` `}
          {formatter.format(Number(account?.withdrawable || 0) / 1e6)} VOI
        </Typography>
      ) : null}
    </Box>
  ) : (
    <Typography
      variant="body2"
      sx={{
        color: isDarkTheme ? "#fff" : "#000",
        textAlign: "left",
        paddingTop: "20px",
      }}
    >
      No account information found
    </Typography>
  );
};

export default StakingInformation;
