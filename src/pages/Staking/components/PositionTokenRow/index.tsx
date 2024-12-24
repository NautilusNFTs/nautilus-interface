import React, { useState, useEffect } from "react";
import {
  Button,
  TableCell,
  TableRow,
  useTheme,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  TextField,
  Grid,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Skeleton from "@mui/material/Skeleton";
import { useStakingContract } from "@/hooks/staking";
import { getStakingTotalTokens, getStakingUnlockTime } from "@/utils/staking";
import moment from "moment";
import { useWallet } from "@txnlab/use-wallet-react";
import { getAlgorandClients } from "@/wallets";
import { CONTRACT } from "ulujs";
import { toast } from "react-toastify";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import { waitForConfirmation } from "algosdk";
import party from "party-js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DelegateModal from "@/components/modals/DelegateModal";
import { NAAS_ADDRESS } from "@/contants/staking";
import humanizeDuration from "humanize-duration";

const { algodClient } = getAlgorandClients();

interface PositionTokenRowProps {
  nft: {
    contractId: string;
    tokenId: string;
    staking: {
      contractId: string;
      tokenId: string;
      contractAddress: string;
      withdrawable: string;
      global_delegate: string;
      part_vote_lst: number;
    };
  };
  index: number;
  arc72TokensLength: number;
  lastRowStyle: React.CSSProperties;
  cellStyle: React.CSSProperties;
}

const ParticipateModal: React.FC<{
  open: boolean;
  onClose: () => void;
  contractId: string;
}> = ({ open, onClose, contractId }) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { activeAccount, signTransactions } = useWallet();

  const [formData, setFormData] = useState({
    firstRound: "",
    lastRound: "",
    keyDilution: "",
    selectionKey: "",
    votingKey: "",
    stateProofKey: "",
  });

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

  const handleSubmit = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    console.log({ contractId });

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

      console.log({ participateResult });

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

const PositionTokenRow: React.FC<PositionTokenRowProps> = ({
  nft,
  index,
  arc72TokensLength,
  lastRowStyle,
  cellStyle,
}) => {
  if (!nft.staking) return null;
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { activeAccount, signTransactions } = useWallet();
  const { data, isLoading, refetch } = useStakingContract(Number(nft.tokenId), {
    includeRewards: true,
    includeWithdrawable: true,
  });
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isParticipateModalOpen, setIsParticipateModalOpen] = useState(false);

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

  const handleClaim = async () => {
    if (!activeAccount) return;
    const apid = Number(nft.contractId);
    const ci = new CONTRACT(
      apid,
      algodClient,
      undefined,
      {
        name: "NautilusVoiStaking",
        methods: [
          {
            name: "withdraw",
            args: [
              {
                type: "uint64",
                name: "tokenId",
              },
              {
                type: "uint64",
                name: "amount",
              },
            ],
            readonly: false,
            returns: {
              type: "void",
            },
            desc: "Withdraw funds from contract.",
          },
        ],
        events: [],
      },
      {
        addr: activeAccount.address,
        sk: new Uint8Array(0),
      }
    );
    ci.setFee(5000);
    const withdrawR2 = await ci.withdraw(
      Number(nft.tokenId),
      BigInt(data?.withdrawable || "0")
    );
    if (!withdrawR2.success) {
      console.error({ withdrawR2 });
      throw new Error("withdraw failed in simulate");
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
    toast.success("Claimed");
    party.confetti(document.body, {
      count: party.variation.range(200, 300),
      size: party.variation.range(1, 1.4),
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const cellStyleWithColor = {
    ...cellStyle,
  };

  const renderExpirationCell = () => {
    // Check if active account is the delegate
    const isDelegate = activeAccount?.address === data?.global_delegate;

    if (!data?.part_vote_lst) {
      return (
        <>
          {isDelegate && (
            <Button
              variant={isDarkTheme ? "outlined" : "contained"}
              size="small"
              onClick={() => setIsParticipateModalOpen(true)}
              sx={{
                borderRadius: "12px",
                fontSize: "0.75rem",
                color: isDarkTheme ? "#FFFFFF" : undefined,
                backgroundColor: isDarkTheme ? "transparent" : undefined,
                borderColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.3)"
                  : undefined,
                "&:hover": {
                  backgroundColor: isDarkTheme
                    ? "rgba(255, 255, 255, 0.1)"
                    : undefined,
                  borderColor: isDarkTheme
                    ? "rgba(255, 255, 255, 0.5)"
                    : undefined,
                },
              }}
            >
              Go Online
            </Button>
          )}
        </>
      );
    }

    const roundDifference = data.part_vote_lst - currentRound;
    const isExpired = roundDifference <= 0;
    const timeRemaining = getExpirationTime(data.part_vote_lst);

    // Calculate if expiration is within 7 days
    const secondsRemaining = roundDifference * 2.8;
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    const isNearExpiration = secondsRemaining <= sevenDaysInSeconds;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        {timeRemaining === null ? (
          <Skeleton width={80} />
        ) : (
          <Typography
            sx={{
              color: isExpired
                ? "error.main"
                : isNearExpiration
                ? "warning.main"
                : "inherit",
            }}
          >
            {timeRemaining}
          </Typography>
        )}
        {!isExpired && !isNearExpiration && isDelegate && (
          <Button
            variant={isDarkTheme ? "outlined" : "contained"}
            size="small"
            onClick={() => setIsParticipateModalOpen(true)}
            sx={{
              borderRadius: "12px",
              fontSize: "0.75rem",
              minWidth: "60px",
              color: isDarkTheme ? "#FFFFFF" : undefined,
              backgroundColor: isDarkTheme ? "transparent" : undefined,
              borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.3)" : undefined,
              "&:hover": {
                backgroundColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.1)"
                  : undefined,
                borderColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.5)"
                  : undefined,
              },
            }}
          >
            Update
          </Button>
        )}
        {!isExpired && isNearExpiration && isDelegate && (
          <Button
            variant={isDarkTheme ? "outlined" : "contained"}
            size="small"
            onClick={() => setIsParticipateModalOpen(true)}
            sx={{
              borderRadius: "12px",
              fontSize: "0.75rem",
              minWidth: "60px",
              color: isDarkTheme ? "#FFFFFF" : undefined,
              backgroundColor: isDarkTheme ? "transparent" : undefined,
              borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.3)" : undefined,
              "&:hover": {
                backgroundColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.1)"
                  : undefined,
                borderColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.5)"
                  : undefined,
              },
            }}
          >
            Renew
          </Button>
        )}
        <ParticipateModal
          open={isParticipateModalOpen}
          onClose={() => setIsParticipateModalOpen(false)}
          contractId={Number(nft.tokenId)}
        />
      </Box>
    );
  };

  return (
    <>
      <TableRow
        key={`${nft.contractId}-${nft.tokenId}`}
        style={index === arc72TokensLength - 1 ? lastRowStyle : undefined}
      >
        {isLoading ? (
          <TableCell style={cellStyleWithColor} colSpan={6} align="right">
            <Skeleton variant="text" />
          </TableCell>
        ) : (
          <>
            <TableCell style={cellStyleWithColor} align="right">
              <a
                href={`https://block.voi.network/explorer/application/${data?.contractId}/global-state`}
                target="_blank"
                style={{
                  color: isDarkTheme ? "white" : "inherit",
                  fontWeight: 100,
                }}
                rel="noopener noreferrer"
              >
                {data?.contractId}
              </a>
              <ContentCopyIcon
                style={{
                  color: isDarkTheme ? "white" : "inherit",
                  cursor: "pointer",
                  marginLeft: "5px",
                  fontSize: "16px",
                }}
                onClick={() => copyToClipboard(data?.contractId, "Account ID")}
              />
            </TableCell>
            <TableCell style={cellStyleWithColor} align="center">
              <a
                href={`https://block.voi.network/explorer/account/${data?.contractAddress}/transactions`}
                target="_blank"
                style={{
                  color: isDarkTheme ? "white" : "inherit",
                  fontWeight: 100,
                }}
                rel="noopener noreferrer"
              >
                {data?.contractAddress.slice(0, 10)}...
                {data?.contractAddress.slice(-10)}
              </a>
              <ContentCopyIcon
                style={{
                  color: isDarkTheme ? "white" : "inherit",
                  cursor: "pointer",
                  marginLeft: "5px",
                  fontSize: "16px",
                }}
                onClick={() =>
                  copyToClipboard(data?.contractAddress, "Account Address")
                }
              />
            </TableCell>
            <TableCell
              style={{
                ...cellStyleWithColor,
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
                cursor: "pointer",
              }}
              align="center"
              onClick={() => setIsDelegateModalOpen(true)}
            >
              {data.global_delegate.slice(0, 10)}...
              {data.global_delegate.slice(-10)}
              <ContentCopyIcon
                style={{
                  color: isDarkTheme ? "white" : "inherit",
                  cursor: "pointer",
                  marginLeft: "5px",
                  fontSize: "16px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(data.global_delegate, "Account Address");
                }}
              />
            </TableCell>
            <TableCell
              style={{
                ...cellStyleWithColor,
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
              }}
              align="right"
            >
              {getStakingTotalTokens(data)} VOI
            </TableCell>
            <TableCell
              style={{
                ...cellStyleWithColor,
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
              }}
              align="right"
            >
              {moment.unix(getStakingUnlockTime(data)).fromNow(true)}
            </TableCell>
            <TableCell
              style={{
                ...cellStyleWithColor,
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
              }}
              align="right"
            >
              {renderExpirationCell()}
            </TableCell>
            <TableCell style={cellStyleWithColor} align="right">
              <Button
                sx={{
                  borderRadius: "20px",
                  color: "inherit",
                }}
                onClick={handleClaim}
                disabled={data?.withdrawable === "0"}
                variant={isDarkTheme ? "outlined" : "contained"}
                size="small"
              >
                <img src={VIAIcon} style={{ height: "12px" }} alt="VOI Icon" />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  {Number(data?.withdrawable || 0) / 1e6} VOI
                </Typography>
              </Button>
            </TableCell>
          </>
        )}
      </TableRow>

      <DelegateModal
        open={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
        contractId={nft.contractId}
        tokenId={Number(nft.tokenId)}
        currentDelegate={data?.global_delegate || ""}
        allowNaaS={true}
        naaSAddress={NAAS_ADDRESS}
      />
    </>
  );
};

export default PositionTokenRow;
