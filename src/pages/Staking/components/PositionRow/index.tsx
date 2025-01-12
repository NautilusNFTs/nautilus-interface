import React, { useState, useEffect } from "react";
import {
  TableRow,
  TableCell,
  Button,
  Skeleton,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  TextField,
  Grid,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  Slider,
  Table,
  TableHead,
  TableBody,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import moment from "moment";
import { useWallet } from "@txnlab/use-wallet-react";
import { getAlgorandClients } from "@/wallets";
import { CONTRACT } from "ulujs";
import { toast } from "react-toastify";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import { getStakingTotalTokens, getStakingUnlockTime } from "@/utils/staking";
import { useStakingContract } from "@/hooks/staking";
import algosdk, { waitForConfirmation } from "algosdk";
import party from "party-js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DelegateModal from "@/components/modals/DelegateModal";
import humanizeDuration from "humanize-duration";
import {
  MoreVerticalIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UserIcon,
  PowerIcon,
  BarChart3Icon,
} from "lucide-react";
import BlockProductionGraph from "@/pages/CommunityChest/components/BlockProductionGraph";
import { useBlocks } from "@/hooks/useBlocks";

// format number using Intl.NumberFormat
// 100.12342 -> 100
// 1000 -> 1K
// 1000000 -> 1M
// 1000000000 -> 1B
// 1000000000000 -> 1T
// 1000000000000000 -> 1Q
// 1000000000000000000 -> 1Q
const formatNumber = (number: number) => {
  if (number < 1000) {
    return number.toFixed(0);
  }
  if (number < 1000000) {
    return `${(number / 1000).toFixed(0)}K`;
  }
  if (number < 1000000000) {
    return `${(number / 1000000).toFixed(0)}M`;
  }
  if (number < 1000000000000) {
    return `${(number / 1000000000).toFixed(0)}B`;
  }
  if (number < 1000000000000000) {
    return `${(number / 1000000000000).toFixed(0)}T`;
  }
  return `${(number / 1000000000000000).toFixed(0)}Q`;
};

const { algodClient } = getAlgorandClients();

const ParticipateModal: React.FC<{
  open: boolean;
  onClose: () => void;
  contractId: string;
}> = ({ open, onClose, contractId }) => {
  const { activeAccount, signTransactions } = useWallet();
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const [formData, setFormData] = useState({
    firstRound: "",
    lastRound: "",
    keyDilution: "",
    selectionKey: "",
    votingKey: "",
    stateProofKey: "",
  });

  const handleSubmit = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const ci = new CONTRACT(
        Number(contractId),
        algodClient,
        undefined,
        {
          name: "NautilusVoiStaking",
          methods: [
            {
              name: "participate",
              args: [
                { type: "byte[32]", name: "vote_k" },
                { type: "byte[32]", name: "sel_k" },
                { type: "uint64", name: "vote_fst" },
                { type: "uint64", name: "vote_lst" },
                { type: "uint64", name: "vote_kd" },
                { type: "byte[64]", name: "sp_key" },
              ],
              returns: { type: "void" },
              desc: "Register participation keys.",
            },
          ],
          events: [],
        },
        { addr: activeAccount.address, sk: new Uint8Array(0) }
      );

      ci.setFee(5000);
      ci.setPaymentAmount(1000);

      // Convert base64 keys to byte arrays
      const votingKeyBytes = new Uint8Array(
        Buffer.from(formData.votingKey, "base64")
      );
      const selectionKeyBytes = new Uint8Array(
        Buffer.from(formData.selectionKey, "base64")
      );
      const stateProofKeyBytes = new Uint8Array(
        Buffer.from(formData.stateProofKey, "base64")
      );

      // Ensure key lengths are correct
      if (
        votingKeyBytes.length !== 32 ||
        selectionKeyBytes.length !== 32 ||
        stateProofKeyBytes.length !== 64
      ) {
        throw new Error("Invalid key lengths");
      }

      const participateResult = await ci.participate(
        votingKeyBytes, // vote_k
        selectionKeyBytes, // sel_k
        BigInt(formData.firstRound), // vote_fst
        BigInt(formData.lastRound), // vote_lst
        BigInt(formData.keyDilution), // vote_kd
        stateProofKeyBytes // sp_key
      );

      if (!participateResult.success) {
        console.error({ participateResult });
        throw new Error("Participate failed in simulate");
      }

      const stxns = await signTransactions(
        participateResult.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );

      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();

      await waitForConfirmation(algodClient, txId, 4);
      toast.success("Successfully registered participation keys");
      onClose();
    } catch (error) {
      console.error("Error registering participation:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to register participation"
      );
    }
  };

  const textFieldStyle = {
    "& .MuiInputLabel-root": {
      color: isDarkTheme ? "rgba(255, 255, 255, 0.7)" : undefined,
    },
    "& .MuiOutlinedInput-root": {
      color: isDarkTheme ? "#FFFFFF" : undefined,
      "& fieldset": {
        borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.23)" : undefined,
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDarkTheme
            ? "rgba(30, 30, 30, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" color={isDarkTheme ? "#FFFFFF" : undefined}>
          Participate in Consensus
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="First Round"
              value={formData.firstRound}
              onChange={(e) =>
                setFormData({ ...formData, firstRound: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Round"
              value={formData.lastRound}
              onChange={(e) =>
                setFormData({ ...formData, lastRound: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Key Dilution"
              value={formData.keyDilution}
              onChange={(e) =>
                setFormData({ ...formData, keyDilution: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Selection Key"
              value={formData.selectionKey}
              onChange={(e) =>
                setFormData({ ...formData, selectionKey: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Voting Key"
              value={formData.votingKey}
              onChange={(e) =>
                setFormData({ ...formData, votingKey: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="State Proof Key"
              value={formData.stateProofKey}
              onChange={(e) =>
                setFormData({ ...formData, stateProofKey: e.target.value })
              }
              sx={textFieldStyle}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant={isDarkTheme ? "outlined" : "contained"}
          sx={{
            color: isDarkTheme ? "#FFFFFF" : undefined,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant={isDarkTheme ? "outlined" : "contained"}
          sx={{
            color: isDarkTheme ? "#FFFFFF" : undefined,
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface PositionRowProps {
  position: {
    contractId: string;
    tokenId: string;
    contractAddress: string;
    withdrawable: string;
    global_delegate: string;
    part_vote_lst: number;
  };
  cellStyle: React.CSSProperties;
}

// Add new interface for block production data
interface BlockProductionData {
  start_date: string;
  end_date: string;
  proposers: Record<string, number>;
  total_blocks: number;
  ballast_blocks: number;
}

const PositionRow: React.FC<PositionRowProps> = ({ position, cellStyle }) => {
  const {
    data: blocksData,
    isLoading: isLoadingBlocks,
    refetch: refetchBlocks,
  } = useBlocks();

  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { activeAccount, signTransactions } = useWallet();

  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(0);

  const { data, isLoading, refetch } = useStakingContract(
    Number(position.contractId),
    {
      includeRewards: true,
      includeWithdrawable: true,
    }
  );
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  const handleClaim = async () => {
    if (!activeAccount) return;
    setIsWithdrawLoading(true);
    const apid = Number(position.contractId);
    const ci = new CONTRACT(
      apid,
      algodClient,
      undefined,
      {
        name: "NautilusVoiStaking",
        methods: [
          {
            name: "withdraw",
            args: [{ type: "uint64", name: "amount" }],
            readonly: false,
            returns: { type: "uint64" },
            desc: "Withdraw funds from contract.",
          },
        ],
        events: [],
      },
      { addr: activeAccount.address, sk: new Uint8Array(0) }
    );
    ci.setFee(5000);
    try {
      const withdrawR2 = await ci.withdraw(BigInt(withdrawAmount));
      if (!withdrawR2.success) {
        console.log({ withdrawR2 });
        throw new Error("Withdraw failed in simulate");
      }
      const stxns = await signTransactions(
        withdrawR2.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();
      await waitForConfirmation(algodClient, txId, 4);
      await refetch();
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Claimed");
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const cellStyleWithColor = {
    ...cellStyle,
  };

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState<number>(0);

  useEffect(() => {
    const fetchCurrentRound = async () => {
      try {
        const status = await algodClient.status().do();
        setCurrentRound(status["last-round"]);
      } catch (error) {
        console.error("Error fetching current round:", error);
      }
    };

    fetchCurrentRound();
    const interval = setInterval(fetchCurrentRound, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getExpirationTime = (part_vote_lst: number) => {
    if (!part_vote_lst || !currentRound) return null;

    const roundDifference = part_vote_lst - currentRound;
    if (roundDifference <= 0) return "Expired";

    const secondsRemaining = roundDifference * 2.8;

    return humanizeDuration(secondsRemaining * 1000, {
      largest: 2,
      round: true,
      units: ["y", "mo", "d", "h", "m"],
    });
  };

  const [isParticipateModalOpen, setIsParticipateModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Add new state for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleWithdrawConfirm = async () => {
    if (!activeAccount) return;
    setIsWithdrawLoading(true);
    const apid = Number(position.contractId);
    const ci = new CONTRACT(
      apid,
      algodClient,
      undefined,
      {
        name: "NautilusVoiStaking",
        methods: [
          {
            name: "withdraw",
            args: [{ type: "uint64", name: "amount" }],
            readonly: false,
            returns: { type: "uint64" },
            desc: "Withdraw funds from contract.",
          },
        ],
        events: [],
      },
      { addr: activeAccount.address, sk: new Uint8Array(0) }
    );
    ci.setFee(5000);
    try {
      const withdrawR2 = await ci.withdraw(BigInt(withdrawAmount));
      if (!withdrawR2.success) {
        console.log({ withdrawR2 });
        throw new Error("Withdraw failed in simulate");
      }
      const stxns = await signTransactions(
        withdrawR2.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();
      await waitForConfirmation(algodClient, txId, 4);
      await refetch();
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Claimed");
      setIsWithdrawModalOpen(false);
      setWithdrawAmount(0);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const handleDepositConfirm = async () => {
    if (!activeAccount || !amount) {
      toast.error("Please connect your wallet and enter an amount");
      return;
    }

    setIsDepositLoading(true);
    try {
      // Create payment transaction to app account
      const suggestedParams = await algodClient.getTransactionParams().do();
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAccount.address,
        to: position.contractAddress,
        amount: Math.floor(Number(amount) * 1e6), // Convert VOI to microVOI
        suggestedParams,
        note: new TextEncoder().encode(
          `deposit ${amount} VOI to staking contract ${position.contractId}`
        ),
      });
      const stxns = await signTransactions([paymentTxn.toByte()]);
      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();

      await waitForConfirmation(algodClient, txId, 4);
      await refetch();
      toast.success("Successfully deposited funds");
      setIsDepositModalOpen(false);
      setAmount("");
    } catch (error) {
      console.error("Error depositing:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deposit funds"
      );
    } finally {
      setIsDepositLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (activeAccount?.address && isDepositModalOpen) {
        try {
          const accountInfo = await algodClient
            .accountInformation(activeAccount.address)
            .do();
          const amount = accountInfo.amount;
          const minBalance = accountInfo["min-balance"];
          const availableBalance = Math.max(amount - minBalance - 1e6, 0) / 1e6;
          setMaxAmount(availableBalance);
        } catch (error) {
          console.error("Error fetching balance:", error);
          setMaxAmount(0);
        }
      }
    };

    fetchBalance();
  }, [activeAccount?.address, isDepositModalOpen]);

  // Add new state and modal component
  const [isBlockProductionModalOpen, setIsBlockProductionModalOpen] =
    useState(false);
  const [blockProductionData, setBlockProductionData] = useState<
    BlockProductionData[]
  >([]);
  const [isLoadingBlockData, setIsLoadingBlockData] = useState(false);

  // Add new function to fetch block production data
  const fetchBlockProductionData = async (contractAddress: string) => {
    setIsLoadingBlockData(true);
    try {
      const response = await fetch(
        `https://api.voirewards.com/proposers/index_main_3.php?action=epoch-summary&wallet=${contractAddress}`
      );
      const data = await response.json();
      setBlockProductionData(data.snapshots || []);
    } catch (error) {
      console.error("Error fetching block production data:", error);
      toast.error("Failed to fetch block production data");
    } finally {
      setIsLoadingBlockData(false);
    }
  };

  // Inside PositionRow component, update this function to use period numbers
  const transformDataForGraph = (data: BlockProductionData[]) => {
    return data.map((snapshot, index) => ({
      count: snapshot.proposers[position.contractAddress] || 0,
      label: `${index}`, // Most recent period will be Period 1
    }));
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell style={cellStyleWithColor} colSpan={6} align="right">
          <Skeleton variant="text" />
        </TableCell>
      </TableRow>
    );
  }
  return (
    <>
      <TableRow>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <a
            href={`https://block.voi.network/explorer/application/${position.contractId}/global-state`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            {position.contractId}
          </a>
          <ContentCopyIcon
            style={{
              cursor: "pointer",
              marginLeft: "5px",
              fontSize: "16px",
              color: "inherit",
            }}
            onClick={() => copyToClipboard(position.contractId, "Account ID")}
          />
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="center"
        >
          <a
            href={`https://block.voi.network/explorer/account/${position.contractAddress}/transactions`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            {position.contractAddress.slice(0, 6)}...
            {position.contractAddress.slice(-6)}
          </a>
          <ContentCopyIcon
            style={{
              cursor: "pointer",
              marginLeft: "5px",
              fontSize: "16px",
              color: "inherit",
            }}
            onClick={() =>
              copyToClipboard(position.contractAddress, "Account Address")
            }
          />
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
            cursor: "pointer",
          }}
          align="center"
          onClick={() => setIsDelegateModalOpen(true)}
        >
          {position.global_delegate.slice(0, 6)}...
          {position.global_delegate.slice(-6)}
          <ContentCopyIcon
            style={{
              cursor: "pointer",
              marginLeft: "5px",
              fontSize: "16px",
              color: "inherit",
            }}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(position.global_delegate, "Account Address");
            }}
          />
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                flexShrink: 0,
              }}
            >
              <img src={VIAIcon} style={{ height: "12px" }} alt="VOI Icon" />
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: isDarkTheme ? "white" : "black",
                  fontWeight: 500,
                }}
              >
                {formatNumber(getStakingTotalTokens(position))} VOI
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <Typography variant="body2" sx={{ flexShrink: 0 }}>
            {moment.unix(getStakingUnlockTime(position)).fromNow(true)}
          </Typography>
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <Typography variant="body2" sx={{ flexShrink: 0 }}>
            {getExpirationTime(position.part_vote_lst)}
          </Typography>
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          {blocksData?.getProposerBlocks(position.contractAddress)}
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              animation:
                Number(data?.withdrawable || 0) > 0
                  ? "glow 1.5s ease-in-out infinite alternate"
                  : "none",
              "@keyframes glow": {
                from: {
                  textShadow: "0 0 5px rgba(255,255,255,0.2)",
                },
                to: {
                  textShadow: "0 0 20px rgba(255,255,255,0.6)",
                },
              },
            }}
          >
            <img
              src={VIAIcon}
              style={{
                height: "12px",
                filter:
                  Number(data?.withdrawable || 0) === 0
                    ? "grayscale(100%)"
                    : undefined,
              }}
              alt="VOI Icon"
            />
            <Typography
              variant="body2"
              sx={{
                ml: 1,
                color: isDarkTheme ? "white" : "black",
                fontWeight: 500,
              }}
            >
              {Number(data?.withdrawable || 0) / 1e6} VOI
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          style={{
            ...cellStyleWithColor,
            color: isDarkTheme ? "white" : "black",
            fontWeight: 100,
          }}
          align="right"
        >
          <Button
            id="actions-button"
            aria-controls={open ? "actions-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            variant={isDarkTheme ? "outlined" : "contained"}
            size="small"
            sx={{
              borderRadius: "12px",
              minWidth: "40px",
              color: isDarkTheme ? "#FFFFFF" : undefined,
              backgroundColor: isDarkTheme ? "transparent" : undefined,
              borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.3)" : undefined,
            }}
          >
            <MoreVerticalIcon />
          </Button>
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "actions-button",
            }}
            PaperProps={{
              sx: {
                backgroundColor: isDarkTheme
                  ? "rgba(30, 30, 30, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setIsDepositModalOpen(true);
                handleClose();
              }}
              sx={{
                color: isDarkTheme ? "#FFFFFF" : undefined,
                gap: 1.5,
              }}
            >
              <ArrowUpIcon size={18} /> Deposit
            </MenuItem>
            {Number(data?.withdrawable || 0) > 0 && (
              <MenuItem
                onClick={() => {
                  setIsWithdrawModalOpen(true);
                  handleClose();
                }}
                sx={{
                  color: isDarkTheme ? "#FFFFFF" : undefined,
                  gap: 1.5,
                }}
              >
                <ArrowDownIcon size={18} /> Withdraw
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setIsDelegateModalOpen(true);
                handleClose();
              }}
              sx={{
                color: isDarkTheme ? "#FFFFFF" : undefined,
                gap: 1.5,
              }}
            >
              <UserIcon size={18} /> Change Delegate
            </MenuItem>
            <MenuItem
              onClick={() => {
                setIsParticipateModalOpen(true);
                handleClose();
              }}
              sx={{
                color: isDarkTheme ? "#FFFFFF" : undefined,
                gap: 1.5,
              }}
            >
              <PowerIcon size={18} />{" "}
              {!position.part_vote_lst ? "Go Online" : "Update Participation"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                fetchBlockProductionData(position.contractAddress);
                setIsBlockProductionModalOpen(true);
                handleClose();
              }}
              sx={{
                color: isDarkTheme ? "#FFFFFF" : undefined,
                gap: 1.5,
              }}
            >
              <BarChart3Icon size={18} /> View Block Production
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      <Dialog
        maxWidth="xs"
        fullWidth
        open={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: isDarkTheme
              ? "rgba(30, 30, 30, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" color={isDarkTheme ? "#FFFFFF" : undefined}>
            Deposit VOI
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            {isDepositLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress
                  size={100}
                  sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                />
                <Typography
                  variant="h6"
                  color={isDarkTheme ? "#FFFFFF" : undefined}
                >
                  Signature pending...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography color={isDarkTheme ? "#FFFFFF" : undefined}>
                  Select amount to deposit: {Number(amount || 0).toFixed(6)} VOI
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Slider
                    value={Number(amount || 0)}
                    onChange={(_, value) => setAmount(value.toString())}
                    min={0}
                    max={maxAmount}
                    step={0.001}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value.toFixed(6)} VOI`}
                    sx={{
                      color: isDarkTheme ? "#FFFFFF" : undefined,
                      "& .MuiSlider-valueLabel": {
                        backgroundColor: isDarkTheme
                          ? "rgba(30, 30, 30, 0.95)"
                          : undefined,
                      },
                    }}
                  />
                  <Button
                    onClick={() => setAmount(maxAmount.toString())}
                    variant={isDarkTheme ? "outlined" : "contained"}
                    size="small"
                    sx={{
                      color: isDarkTheme ? "#FFFFFF" : undefined,
                      minWidth: "60px",
                    }}
                  >
                    Max
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {!isDepositLoading && (
            <>
              <Button
                onClick={() => setIsDepositModalOpen(false)}
                variant={isDarkTheme ? "outlined" : "contained"}
                sx={{
                  color: isDarkTheme ? "#FFFFFF" : undefined,
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isDepositLoading}
                onClick={handleDepositConfirm}
                variant={isDarkTheme ? "outlined" : "contained"}
                sx={{
                  color: isDarkTheme ? "#FFFFFF" : undefined,
                }}
              >
                {isDepositLoading ? (
                  <CircularProgress
                    size={16}
                    sx={{ color: isDarkTheme ? "#FFFFFF" : "inherit" }}
                  />
                ) : (
                  "Confirm"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth="xs"
        fullWidth
        open={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: isDarkTheme
              ? "rgba(30, 30, 30, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" color={isDarkTheme ? "#FFFFFF" : undefined}>
            Withdraw Funds
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            {isWithdrawLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress
                  size={100}
                  sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                />
                <Typography
                  variant="h6"
                  color={isDarkTheme ? "#FFFFFF" : undefined}
                >
                  Signature pending...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography color={isDarkTheme ? "#FFFFFF" : undefined}>
                  Select amount to withdraw: {withdrawAmount / 1e6} VOI
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Slider
                    value={withdrawAmount}
                    onChange={(_, value) => setWithdrawAmount(value as number)}
                    min={0}
                    max={Number(data?.withdrawable || 0)}
                    step={1000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) =>
                      `${(value / 1e6).toFixed(6)} VOI`
                    }
                    sx={{
                      color: isDarkTheme ? "#FFFFFF" : undefined,
                      "& .MuiSlider-valueLabel": {
                        backgroundColor: isDarkTheme
                          ? "rgba(30, 30, 30, 0.95)"
                          : undefined,
                      },
                    }}
                  />
                  <Button
                    onClick={() =>
                      setWithdrawAmount(Number(data?.withdrawable || 0))
                    }
                    variant={isDarkTheme ? "outlined" : "contained"}
                    size="small"
                    sx={{
                      color: isDarkTheme ? "#FFFFFF" : undefined,
                      minWidth: "60px",
                    }}
                  >
                    Max
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {!isWithdrawLoading && (
            <>
              <Button
                onClick={() => setIsWithdrawModalOpen(false)}
                variant={isDarkTheme ? "outlined" : "contained"}
                sx={{
                  color: isDarkTheme ? "#FFFFFF" : undefined,
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isWithdrawLoading}
                onClick={handleWithdrawConfirm}
                variant={isDarkTheme ? "outlined" : "contained"}
                sx={{
                  color: isDarkTheme ? "#FFFFFF" : undefined,
                }}
              >
                {isWithdrawLoading ? (
                  <CircularProgress
                    size={16}
                    sx={{ color: isDarkTheme ? "#FFFFFF" : "inherit" }}
                  />
                ) : (
                  "Confirm"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <DelegateModal
        open={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
        contractId={position.contractId}
        currentDelegate={position.global_delegate}
      />

      <ParticipateModal
        open={isParticipateModalOpen}
        onClose={() => setIsParticipateModalOpen(false)}
        contractId={position.contractId}
      />

      <Dialog
        maxWidth="md"
        fullWidth
        open={isBlockProductionModalOpen}
        onClose={() => setIsBlockProductionModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: isDarkTheme
              ? "rgba(30, 30, 30, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" color={isDarkTheme ? "#FFFFFF" : undefined}>
            Block Production History
          </Typography>
        </DialogTitle>
        <DialogContent>
          {isLoadingBlockData ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <BlockProductionGraph
                  data={transformDataForGraph(blockProductionData)}
                  isDarkTheme={isDarkTheme}
                />
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                    >
                      Period
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                    >
                      Blocks Produced
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                    >
                      Total Blocks
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                    >
                      Participation Rate
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blockProductionData.map((snapshot, index) => {
                    const blocksProduced =
                      snapshot.proposers[position.contractAddress] || 0;
                    const participationRate = (
                      (blocksProduced / snapshot.total_blocks) *
                      100
                    ).toFixed(2);

                    return (
                      <TableRow key={index}>
                        <TableCell
                          sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                        >
                          {moment(snapshot.start_date).format("MMM D")} -{" "}
                          {moment(snapshot.end_date).format("MMM D, YYYY")}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                        >
                          {blocksProduced.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                        >
                          {snapshot.total_blocks.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkTheme ? "#FFFFFF" : undefined }}
                        >
                          {participationRate}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsBlockProductionModalOpen(false)}
            variant={isDarkTheme ? "outlined" : "contained"}
            sx={{
              color: isDarkTheme ? "#FFFFFF" : undefined,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PositionRow;
