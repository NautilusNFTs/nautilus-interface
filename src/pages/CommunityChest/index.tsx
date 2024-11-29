import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  CircularProgress,
  useTheme,
  Link,
  Tooltip,
} from "@mui/material";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import Layout from "@/layouts/Default";
import BigNumber from "bignumber.js";
import { getAlgorandClients } from "@/wallets";
import algosdk from "algosdk";
import axios from "axios";
import { abi, CONTRACT } from "ulujs";
import { useWallet } from "@txnlab/use-wallet-react";
import party from "party-js";
import DepositModal from "./components/DepositModal";
import WithdrawModal from "./components/WithdrawModal";
import HowItWorksModal from "./components/HowItWorksModal";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RankingsModal from "./components/RankingsModal";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import BlockProductionGraph from "./components/BlockProductionGraph";
import InfoIcon from "@mui/icons-material/Info";
import RewardDistributionModal from "./components/RewardDistributionModal";
import LEDCountdown from "./components/LEDCountdown";

const findCommonRatio = (a: number, totalSum: number, n: number) => {
  // Using numerical method (binary search) to find r
  // where a(1-r^n)/(1-r) = totalSum
  let left = 0.1; // Lower bound for r
  let right = 2.0; // Upper bound for r
  const epsilon = 0.0000001; // Precision

  while (right - left > epsilon) {
    const mid = (left + right) / 2;
    const sum = (a * (1 - Math.pow(mid, n))) / (1 - mid);

    if (sum < totalSum) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return (left + right) / 2;
};

export const getTokensByEpoch = async (epoch: number) => {
  // tokens = 3000000 for epoch 1
  // tokens = a * r^(i-1)
  const a = 3_000_000;
  const totalSum = 1_000_000_000;
  const n = 1042;
  const r = findCommonRatio(a, totalSum, n);
  return Math.round(a * Math.pow(r, epoch - 1));
};

interface CommunityChestProps {
  isDarkTheme: boolean;
  connected: boolean;
  address?: string;
}

function weightedRandomSelect(data: any) {
  // Step 1: Convert balances to numbers and calculate total weight
  const totalBalance = data.balances.reduce(
    (sum: number, item: any) => sum + Number(item.balance),
    0
  );

  // Step 2: Calculate cumulative weights
  const cumulativeWeights = [];
  let cumulativeSum = 0;
  for (const item of data.balances) {
    cumulativeSum += Number(item.balance) / totalBalance;
    cumulativeWeights.push(cumulativeSum);
  }

  // Step 3: Generate a random number and select based on cumulative weights
  const random = Math.random();
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      return data.balances[i].accountId;
    }
  }
}

const Container = styled(Box)<{ $isDarkTheme: boolean }>`
  padding: 24px;
  max-width: 800px;
  margin: 48px auto 0;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};

  @media (min-width: 768px) {
    margin-top: 64px;
  }
`;

const StatsCard = styled(Card)<{ $isDarkTheme: boolean }>`
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: none;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  margin-top: 48px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 64px;
  }
`;

const StatusRow = styled(Box)<{ $isDarkTheme: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  text-align: center;
  flex: 1;
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  margin: 4px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  @media (min-width: 768px) {
    &:last-child {
      border-right: 1px solid
        ${(props) =>
          props.$isDarkTheme
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"};
    }
  }
`;

const BigNumberDisplay = styled(Typography)<{ $isDarkTheme: boolean }>`
  font-size: 36px;
  font-weight: 600;
  margin: 8px 0;
  font-family: "IBM Plex Mono", monospace;
  color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
  text-shadow: ${(props) =>
    props.$isDarkTheme ? "0 0 20px rgba(144, 202, 249, 0.3)" : "none"};
`;

const Label = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)"};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const ActionCard = styled(Card)<{ $isDarkTheme: boolean }>`
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  padding: 24px;
  border-radius: 16px;
  box-shadow: none;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  .MuiInputBase-root {
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)"};
    border-radius: 8px;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  }

  .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
  }

  .MuiFormLabel-root {
    color: ${(props) =>
      props.$isDarkTheme
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)"} !important;
  }

  h6 {
    color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "#000"};
    font-weight: 500;
    margin-bottom: 16px;
  }

  .MuiInputLabel-root {
    color: ${(props) =>
      props.$isDarkTheme
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)"} !important;
  }

  .MuiInputLabel-root.Mui-focused {
    color: ${(props) =>
      props.$isDarkTheme ? "#90caf9" : "#1976d2"} !important;
  }

  .MuiButton-contained {
    background-color: ${(props) =>
      props.$isDarkTheme ? "#90caf9" : "#1976d2"};
    color: ${(props) => (props.$isDarkTheme ? "#000" : "#fff")};
    font-weight: 500;
    padding: 8px 24px;

    &:hover {
      background-color: ${(props) =>
        props.$isDarkTheme ? "#64b5f6" : "#1565c0"};
    }

    &:disabled {
      background-color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(144, 202, 249, 0.3)"
          : "rgba(25, 118, 210, 0.3)"};
      color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(0, 0, 0, 0.26)"
          : "rgba(255, 255, 255, 0.3)"};
    }
  }
`;

const glowAnimation = keyframes`
  0% {
    filter: drop-shadow(0 0 2px #ffd700);
  }
  50% {
    filter: drop-shadow(0 0 8px #ffd700);
  }
  100% {
    filter: drop-shadow(0 0 2px #ffd700);
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 32px;
  }
`;

const ChestIcon = styled.svg<{ $intensity: number }>`
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  animation: ${glowAnimation} 2s ease-in-out infinite;
  filter: drop-shadow(
    0 0 ${(props) => Math.min(props.$intensity * 2, 15)}px #ffd700
  );

  @media (min-width: 768px) {
    width: 96px;
    height: 96px;
    margin-bottom: 0;
  }
`;

const StorySection = styled(Typography)<{ $isDarkTheme: boolean }>`
  text-align: left;
  margin-bottom: 64px;
  font-style: italic;
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
  width: 100%;
  line-height: 1.6;
  padding: 0 16px;

  @media (min-width: 768px) {
    margin-bottom: 96px;
  }

  .how-it-works-link {
    color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
    cursor: pointer;
    text-decoration: none;
    margin-left: 8px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Disclaimer = styled(Typography)<{ $isDarkTheme: boolean }>`
  text-align: left;
  margin-top: 32px;
  padding: 16px;
  font-size: 12px;
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"};
  border-top: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  line-height: 1.6;
`;

// Add keyframes for fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Update the RollDiceSection styled component
const RollDiceSection = styled(Box)<{ $isDarkTheme: boolean }>`
  text-align: center;
  margin-bottom: 32px;
  padding: 16px;
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 16px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};

  .selected-account {
    font-size: 24px;
    font-weight: bold;
    color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
    margin-top: 16px;
    animation: ${fadeIn} 0.5s ease-in-out; // Apply fade-in animation
  }
`;

// Update the EpochSummary interface
interface EpochSummary {
  start_date: string;
  end_date: string;
  proposers: { [key: string]: number } | []; // Update to handle object format
  total_blocks: number;
  ballast_blocks: number;
}

interface ApiResponse {
  last_updated: number;
  snapshots: EpochSummary[];
}

// Add this interface near the top with other interfaces
interface Notification {
  date: string;
  message: string;
  type: "info" | "warning" | "success";
}

// Update the NotificationSection styled component
const NotificationSection = styled(Box)<{ $isDarkTheme: boolean }>`
  margin: 64px 0 48px;
  padding: 16px;
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
`;

const NotificationItem = styled(Box)<{ $isDarkTheme: boolean; $type: string }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: ${(props) => {
    const alpha = props.$isDarkTheme ? "0.2" : "0.1";
    switch (props.$type) {
      case "info":
        return props.$isDarkTheme
          ? `rgba(33, 150, 243, ${alpha})`
          : `rgba(33, 150, 243, ${alpha})`;
      case "warning":
        return props.$isDarkTheme
          ? `rgba(255, 152, 0, ${alpha})`
          : `rgba(255, 152, 0, ${alpha})`;
      case "success":
        return props.$isDarkTheme
          ? `rgba(76, 175, 80, ${alpha})`
          : `rgba(76, 175, 80, ${alpha})`;
      default:
        return "transparent";
    }
  }};
  border-left: 4px solid
    ${(props) => {
      switch (props.$type) {
        case "info":
          return "#2196f3";
        case "warning":
          return "#ff9800";
        case "success":
          return "#4caf50";
        default:
          return "transparent";
      }
    }};

  &:last-child {
    margin-bottom: 0;
  }
`;

// Add this constant with the notifications data
const notifications: Notification[] = [
  {
    date: "2024-11-14",
    message:
      "Update: Weekly rewards now available to CCV holder according to reward distribution",
    type: "info",
  },
  {
    date: "2024-11-13",
    message:
      "Community Chest v1.0 launched no-loss lottery with Community Chest Voi (CCV)",
    type: "success",
  },

  /*
  {
    date: "2024-03-20",
    message: "Community Chest v2.0 launched with improved reward distribution system",
    type: "success"
  },
  {
    date: "2024-03-15",
    message: "Upcoming maintenance scheduled for March 25th. Service may be temporarily unavailable.",
    type: "warning"
  },
  {
    date: "2024-03-10",
    message: "New feature: Weekly rewards now automatically distributed to participants",
    type: "info"
  }
  */
];

const CommunityChest: React.FC<CommunityChestProps> = ({
  isDarkTheme,
  connected,
  address,
}) => {
  const ctcInfo = 664258;
  const { signTransactions } = useWallet();
  const [totalInChest, setTotalInChest] = useState<string>("0");
  const [holders, setHolders] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [holdersList, setHoldersList] = useState<any[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [epochSummaries, setEpochSummaries] = useState<EpochSummary[]>([]);
  const [currentEpochTokens, setCurrentEpochTokens] = useState<string>("0");
  const [showRewardDistribution, setShowRewardDistribution] = useState(false);
  const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState<string>("");

  useEffect(() => {
    if (connected) {
      fetchData();
    }
  }, [connected, address]);

  // Update the fetchData function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { algodClient } = getAlgorandClients();

      // Fetch contract data

      const ctcAddr = algosdk.getApplicationAddress(ctcInfo);
      const accInfo = await algodClient.accountInformation(ctcAddr).do();
      const { amount } = accInfo;

      // Fetch holders data
      const response = await axios.get(
        `https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/balances?contractId=664258`
      );
      const filteredHolders =
        response?.data?.balances?.filter(
          (balance: any) =>
            balance.accountId !== algosdk.getApplicationAddress(664258) &&
            balance.balance !== "0"
        ) || [];
      setHoldersList(filteredHolders);
      const holders = filteredHolders.length || 0;

      // Fetch epoch summary
      const epochResponse = await axios.get<ApiResponse>(
        `https://api.voirewards.com/proposers/index_main_3.php?action=epoch-summary&wallet=${algosdk.getApplicationAddress(
          ctcInfo
        )}`
      );

      // Sort snapshots by start date in descending order (newest first)
      const sortedEpochs = epochResponse.data.snapshots.sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );

      setEpochSummaries(sortedEpochs);
      console.log("Latest Epoch:", sortedEpochs[0]);

      // Get user balance
      const ci = new CONTRACT(ctcInfo, algodClient, null, abi.nt200, {
        addr:
          address ||
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
        sk: Uint8Array.from([]),
      });
      const arc200_balanceOf =
        (await ci.arc200_balanceOf(address))?.returnValue || BigInt(0);
      const userBalance = arc200_balanceOf.toString();

      setTotalInChest(amount);
      setHolders(holders);
      setUserBalance(userBalance);

      // Add token calculations
      if (sortedEpochs.length > 0) {
        // number of weeks since launch (since October 30, 2024 UTC)
        const weeksSinceLaunch = Math.ceil(
          (new Date().getTime() - new Date("2024-10-30").getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
        const current = await getTokensByEpoch(weeksSinceLaunch);
        setCurrentEpochTokens(current.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch community chest data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);

      const { algodClient } = getAlgorandClients();
      const ciC = new CONTRACT(ctcInfo, algodClient, null, abi.custom, {
        addr:
          address ||
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
        sk: Uint8Array.from([]),
      });
      const ci = new CONTRACT(
        ctcInfo,
        algodClient,
        null,
        abi.nt200,
        {
          addr:
            address ||
            "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
          sk: Uint8Array.from([]),
        },
        true,
        false,
        true
      );
      const amountBI = BigInt(
        new BigNumber(depositAmount).multipliedBy(10 ** 6).toFixed(0)
      );
      let customR;
      for (const p0 of [0, 1]) {
        const buildN = [];
        if (p0 > 0) {
          const txnO = (await ci.createBalanceBox(address)).obj;
          buildN.push({
            ...txnO,
            payment: 28500,
            note: new Uint8Array(Buffer.from("createBalanceBox")),
          });
        }
        {
          const txn0 = (await ci.deposit(amountBI)).obj;
          buildN.push({
            ...txn0,
            payment: amountBI,
            note: new Uint8Array(Buffer.from("Deposit")),
          });
        }
        ciC.setEnableGroupResourceSharing(true);
        ciC.setExtraTxns(buildN);
        customR = await ciC.custom();
        if (customR.success) {
          break;
        }
      }
      if (!customR?.success) {
        toast.error("Failed to deposit");
        return;
      }
      const stxns = await signTransactions(
        customR.txns.map(
          (t: string) => new Uint8Array(Buffer.from(t, "base64"))
        )
      );
      const [stxn] = stxns;
      const dstxn = algosdk.decodeSignedTransaction(stxn as Uint8Array);
      const txId = dstxn.txn.txID();
      await algodClient.sendRawTransaction(stxns as Uint8Array[]).do();
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Deposit successful!");
      setDepositModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error depositing:", error);
      toast.error("Failed to deposit");
    } finally {
      setIsLoading(false);
      setDepositAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      const { algodClient } = getAlgorandClients();
      const ci = new CONTRACT(ctcInfo, algodClient, null, abi.nt200, {
        addr:
          address ||
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
        sk: Uint8Array.from([]),
      });
      const amountBI = BigInt(
        new BigNumber(withdrawAmount).multipliedBy(10 ** 6).toFixed(0)
      );
      ci.setFee(2000);
      const withdrawR = await ci.withdraw(amountBI);
      if (!withdrawR.success) {
        toast.error("Failed to withdraw");
        return;
      }
      const stxns = await signTransactions(
        withdrawR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const [stxn] = stxns;
      const dstxn = algosdk.decodeSignedTransaction(stxn as Uint8Array);
      const txId = dstxn.txn.txID();
      await algodClient.sendRawTransaction(stxns as Uint8Array[]).do();
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Withdrawal successful!");
      setWithdrawModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error withdrawing:", error);
      toast.error("Failed to withdraw");
    } finally {
      setIsLoading(false);
      setWithdrawAmount("");
    }
  };

  const formatAmount = (amount: string): string => {
    return new BigNumber(amount).dividedBy(1e6).toFormat();
  };

  const calculateGlowIntensity = (amount: string): number => {
    const value = new BigNumber(amount).dividedBy(1e6).toNumber();
    // Adjust these thresholds based on your needs
    if (value < 1000) return 1;
    if (value < 10000) return 3;
    if (value < 100000) return 5;
    return 7;
  };

  const handleRollDice = () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    setIsRolling(true);
    setSelectedAccount(null);
    setTimeout(() => {
      const selected = weightedRandomSelect({ balances: holdersList });
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      setIsRolling(false);
      setTimeout(() => {
        setSelectedAccount(selected);
      }, 1000);
    }, 2000); // Simulate a delay for cinematic effect
  };

  // Add a function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Address copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy address");
      });
  };

  // Add this helper function near the top with other utility functions
  const calculateAverageStake = (total: string, holders: number): string => {
    if (holders === 0) return "0";
    const totalBN = new BigNumber(total);
    return totalBN.dividedBy(holders).dividedBy(1e6).toFixed(6);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (epochSummaries.length > 0) {
        const endDate = new Date(epochSummaries[0].end_date);
        const now = new Date();
        const diff = Math.max(
          0,
          Math.floor((endDate.getTime() - now.getTime()) / 1000)
        );
        setTimeUntilNextEpoch(formatTimeRemaining(diff));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [epochSummaries]);

  // Inside the CommunityChest component, add this helper function
  const formatNotificationDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <Container $isDarkTheme={isDarkTheme}>
        <HeaderContainer>
          <ChestIcon
            viewBox="0 0 24 24"
            $intensity={calculateGlowIntensity(totalInChest)}
          >
            <path
              fill={isDarkTheme ? "#ffd700" : "#ffa000"}
              d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z"
            />
          </ChestIcon>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: isDarkTheme ? "#fff" : "#000",
            }}
          >
            Community Chest
          </Typography>
        </HeaderContainer>

        <StorySection $isDarkTheme={isDarkTheme}>
          Welcome to the Community Chest - a collaborative pool where members
          can deposit VOI for a chance to win big! Every deposit increases the
          chest's value, and weekly draws give participants the opportunity to
          win exciting rewards. Your deposit remains fully accessible - you can
          withdraw your entire contribution at any time without restrictions.
          Join us in building this treasure trove of possibilities!
          <Link
            component="span"
            className="how-it-works-link"
            onClick={() => setHowItWorksOpen(true)}
          >
            Learn how it works →
          </Link>
        </StorySection>

        {/* Add the notification section here */}
        <NotificationSection $isDarkTheme={isDarkTheme}>
          <Label $isDarkTheme={isDarkTheme} style={{ marginBottom: "16px" }}>
            Notifications
          </Label>
          {notifications.slice(0, 3).map((notification, index) => (
            <NotificationItem
              key={index}
              $isDarkTheme={isDarkTheme}
              $type={notification.type}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkTheme
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.9)",
                    fontWeight: 500,
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkTheme
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.6)",
                    ml: 2,
                  }}
                >
                  {formatNotificationDate(notification.date)}
                </Typography>
              </Box>
            </NotificationItem>
          ))}
        </NotificationSection>

        <StatsCard
          style={{
            background: "transparent",
            border: "none",
          }}
          $isDarkTheme={isDarkTheme}
        >
          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Total in Chest</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {formatAmount(totalInChest)}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI
                </Typography>
              </>
            )}
          </StatusRow>

          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Average Stake</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {calculateAverageStake(totalInChest, holders)}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI/HOLDER
                </Typography>
              </>
            )}
          </StatusRow>

          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Number of Holders</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {holders.toLocaleString()}
                </BigNumberDisplay>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                  >
                    PARTICIPANTS
                  </Typography>
                  <LeaderboardIcon
                    sx={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: isDarkTheme ? "#90caf9" : "#1976d2",
                      "&:hover": { opacity: 0.8 },
                    }}
                    onClick={() => setShowRankings(true)}
                  />
                </Box>
              </>
            )}
          </StatusRow>
        </StatsCard>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginBottom: "24px",
          }}
        >
          <Label
            $isDarkTheme={isDarkTheme}
            style={{ textAlign: "left", marginLeft: "4px" }}
          >
            Block Production History
          </Label>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <BlockProductionGraph
                isDarkTheme={isDarkTheme}
                data={epochSummaries
                  .slice(0, 6)
                  .reverse()
                  .map((epoch, index) => {
                    // For empty array or empty object, return 0
                    const blockCount = Array.isArray(epoch.proposers)
                      ? 0
                      : Object.values(epoch.proposers).reduce(
                          (sum, blocks) => sum + blocks,
                          0
                        );

                    return {
                      count: blockCount,
                      label: `Week ${index}`,
                    };
                  })}
              />
              <Link
                href="https://voirewards.com/wallet/KS55CA7K5HQG6P7M5IDH5VXDXBJILSYEVMPP24H3QGJSLPQXPX3LKPW7WM#proposals"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: isDarkTheme ? "#90caf9" : "#1976d2",
                  textDecoration: "none",
                  fontSize: "14px",
                  textAlign: "right",
                  mt: 1,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                View on Voi Rewards →
              </Link>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            marginBottom: "24px",
          }}
        >
          <StatusRow $isDarkTheme={isDarkTheme} style={{ flex: 1 }}>
            <Label $isDarkTheme={isDarkTheme}>Current Epoch Tokens</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {currentEpochTokens.toLocaleString()}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI
                </Typography>
              </>
            )}
          </StatusRow>

          <StatusRow $isDarkTheme={isDarkTheme} style={{ flex: 1 }}>
            <Label $isDarkTheme={isDarkTheme}>Current Block Reward</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {epochSummaries.length > 0 && Number(currentEpochTokens) > 0
                    ? (() => {
                        const nonBallastBlocks = epochSummaries[0].total_blocks;

                        console.log("nonBallastBlocks", nonBallastBlocks);

                        if (nonBallastBlocks <= 0) return "0";

                        // Calculate percentage through epoch
                        const secondsElapsed =
                          new Date().getTime() / 1000 -
                          new Date(epochSummaries[0].start_date).getTime() /
                            1000;
                        const secondsInEpoch = 7 * 24 * 60 * 60;
                        const percentageThroughEpoch =
                          secondsElapsed / secondsInEpoch;

                        const rewardPerBlock =
                          (Number(currentEpochTokens) *
                            percentageThroughEpoch) /
                          nonBallastBlocks;

                        return isNaN(rewardPerBlock)
                          ? "0"
                          : rewardPerBlock.toFixed(2);
                      })()
                    : "0"}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI PER BLOCK
                </Typography>
              </>
            )}
          </StatusRow>
        </Box>

        <StatusRow
          $isDarkTheme={isDarkTheme}
          style={{ flex: 1, marginBottom: "24px" }}
        >
          <Label $isDarkTheme={isDarkTheme}>Time Until Next Epoch</Label>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              {epochSummaries.length > 0 && (
                <LEDCountdown
                  isDarkTheme={isDarkTheme}
                  days={Math.floor(
                    (new Date(epochSummaries[0].end_date).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  hours={Math.floor(
                    ((new Date(epochSummaries[0].end_date).getTime() -
                      new Date().getTime()) %
                      (1000 * 60 * 60 * 24)) /
                      (1000 * 60 * 60)
                  )}
                  minutes={Math.floor(
                    ((new Date(epochSummaries[0].end_date).getTime() -
                      new Date().getTime()) %
                      (1000 * 60 * 60)) /
                      (1000 * 60)
                  )}
                />
              )}
            </>
          )}
        </StatusRow>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            marginBottom: "24px",
          }}
        >
          <StatusRow $isDarkTheme={isDarkTheme} style={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Label $isDarkTheme={isDarkTheme}>Estimated Reward</Label>
              <InfoIcon
                sx={{
                  fontSize: 16,
                  color: isDarkTheme
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.7)",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={() => setShowRewardDistribution(true)}
              />
            </Box>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {epochSummaries.length > 0 && Number(currentEpochTokens) > 0
                    ? (() => {
                        const nonBallastBlocks = epochSummaries[0].total_blocks;

                        if (nonBallastBlocks <= 0) return "0";

                        const blocksProduced = Array.isArray(
                          epochSummaries[0].proposers
                        )
                          ? 0
                          : Object.values(epochSummaries[0].proposers).reduce(
                              (sum, blocks) => sum + blocks,
                              0
                            );

                        console.log("blocksProduced", blocksProduced);

                        // Calculate percentage through epoch
                        const secondsElapsed =
                          new Date().getTime() / 1000 -
                          new Date(epochSummaries[0].start_date).getTime() /
                            1000;
                        const secondsInEpoch = 7 * 24 * 60 * 60;
                        const percentageThroughEpoch =
                          secondsElapsed / secondsInEpoch;

                        // Calculate rewards based on total blocks in epoch
                        const rewardPerBlock =
                          (Number(currentEpochTokens) *
                            percentageThroughEpoch) /
                          nonBallastBlocks;

                        const totalReward = rewardPerBlock * blocksProduced;
                        const estimatedReward = totalReward * 0.45; // 45% of rewards

                        return isNaN(estimatedReward)
                          ? "0"
                          : estimatedReward.toFixed(2);
                      })()
                    : "0"}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI THIS EPOCH
                </Typography>
              </>
            )}
          </StatusRow>
        </Box>

        <RollDiceSection $isDarkTheme={isDarkTheme}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Feeling Lucky?
          </Typography>
          <Button
            variant="contained"
            onClick={handleRollDice}
            disabled={isRolling || !connected}
            sx={{
              bgcolor: isDarkTheme ? "#90caf9" : "#1976d2",
              color: isDarkTheme ? "#000" : "#fff",
              "&:hover": {
                bgcolor: isDarkTheme ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            {isRolling ? <CircularProgress size={24} /> : "Roll the Dice"}
          </Button>
          {selectedAccount && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Typography className="selected-account">
                🎉 Winner:{" "}
                {`${selectedAccount.slice(0, 6)}...${selectedAccount.slice(
                  -6
                )}`}{" "}
                🎉
              </Typography>
              <ContentCopyIcon
                sx={{
                  cursor: "pointer",
                  fontSize: "20px",
                  ml: 1,
                  color: isDarkTheme ? "#90caf9" : "#1976d2",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={() => copyToClipboard(selectedAccount)}
              />
            </Box>
          )}
        </RollDiceSection>

        {address && (
          <StatusRow
            $isDarkTheme={isDarkTheme}
            style={{ marginBottom: "24px" }}
          >
            <Label $isDarkTheme={isDarkTheme}>Your Balance</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {formatAmount(userBalance)}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI
                </Typography>
              </>
            )}
          </StatusRow>
        )}

        {address ? (
          <ActionCard
            style={{
              background: "transparent",
              border: "none",
            }}
            $isDarkTheme={isDarkTheme}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deposit
              </Typography>
              <Button
                variant="contained"
                onClick={() => setDepositModalOpen(true)}
                disabled={!connected}
                fullWidth
              >
                Deposit VOI
              </Button>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Withdraw
              </Typography>
              <Button
                variant="contained"
                onClick={() => setWithdrawModalOpen(true)}
                disabled={!connected}
                fullWidth
              >
                Withdraw VOI
              </Button>
            </Box>
          </ActionCard>
        ) : null}

        <Disclaimer $isDarkTheme={isDarkTheme}>
          DISCLAIMER: The Community Chest is an experimental feature.
          Participants acknowledge and accept all risks associated with using
          this service. While deposits can be withdrawn at any time without
          restrictions, smart contract interactions may take a few seconds to
          process. Past performance does not guarantee future results. Always
          invest responsibly and never commit more than you can afford to lose.
        </Disclaimer>

        <DepositModal
          open={depositModalOpen}
          onClose={() => {
            setDepositModalOpen(false);
            setDepositAmount("");
          }}
          onDeposit={handleDeposit}
          amount={depositAmount}
          setAmount={setDepositAmount}
          isLoading={isLoading}
          isDarkTheme={isDarkTheme}
        />

        <WithdrawModal
          open={withdrawModalOpen}
          onClose={() => {
            setWithdrawModalOpen(false);
            setWithdrawAmount("");
          }}
          onWithdraw={handleWithdraw}
          amount={withdrawAmount}
          setAmount={setWithdrawAmount}
          isLoading={isLoading}
          isDarkTheme={isDarkTheme}
        />

        <HowItWorksModal
          open={howItWorksOpen}
          onClose={() => setHowItWorksOpen(false)}
          isDarkTheme={isDarkTheme}
        />

        <RankingsModal
          open={showRankings}
          onClose={() => setShowRankings(false)}
          isDarkTheme={isDarkTheme}
          holders={holdersList}
          totalSupply={totalInChest}
        />

        <RewardDistributionModal
          open={showRewardDistribution}
          onClose={() => setShowRewardDistribution(false)}
          isDarkTheme={isDarkTheme}
        />
      </Container>
    </Layout>
  );
};

export default CommunityChest;
