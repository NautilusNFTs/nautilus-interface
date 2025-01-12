import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  useTheme,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import PositionTokenRow from "../PositionTokenRow";
import PositionRow from "../PositionRow";
import Pagination from "@/components/Pagination";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { abi, CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";
import { useWallet } from "@txnlab/use-wallet-react";
import { getStakingWithdrawableAmount } from "@/utils/staking";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface ResponsiveTableProps {
  stakingContracts: any[];
  arc72Tokens: any[];
}

type SortDirection = "asc" | "desc" | null;
type SortColumn =
  | "contractId"
  | "totalStaked"
  | "unlock"
  | "claimable"
  | "expires"
  | "global_delegate"
  | "part_vote_lst"
  | "unlockTime"
  | null;

const StyledTabs = styled(Tabs)<{ $isDarkTheme: boolean }>`
  .MuiTab-root {
    color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"};
    font-family: "Plus Jakarta Sans";
    font-weight: 600;

    &.Mui-selected {
      color: #9933ff;
    }
  }

  .MuiTabs-indicator {
    background-color: #9933ff;
  }
`;

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  stakingContracts,
  arc72Tokens,
}) => {
  const { activeAccount, signTransactions } = useWallet();
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const theme = useTheme();
  const pageSize = 10;

  // Add sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>("totalStaked");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort stakingContracts
  const sortedStakingContracts = useMemo(() => {
    if (!sortColumn || !sortDirection) return stakingContracts;

    return [...stakingContracts].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Special handling for specific columns
      if (sortColumn === "totalStaked") {
        aValue = Number(a.global_total || 0);
        bValue = Number(b.global_total || 0);
      } else if (sortColumn === "unlock") {
        aValue = Number(a.unlock || 0);
        bValue = Number(b.unlock || 0);
      } else if (sortColumn === "claimable") {
        aValue = Number(a.withdrawable || 0);
        bValue = Number(b.withdrawable || 0);
      } else if (sortColumn === "expires") {
        aValue = Number(a.expires || 0);
        bValue = Number(b.expires || 0);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
  }, [stakingContracts, sortColumn, sortDirection]);

  // Sort arc72Tokens
  const sortedArc72Tokens = useMemo(() => {
    if (!sortColumn || !sortDirection) return arc72Tokens;

    return [...arc72Tokens].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Special handling for specific columns
      if (sortColumn === "totalStaked") {
        aValue = Number(a.staking?.global_total || 0);
        bValue = Number(b.staking?.global_total || 0);
      } else if (sortColumn === "unlock") {
        aValue = Number(a.staking?.unlock || 0);
        bValue = Number(b.staking?.unlock || 0);
      } else if (sortColumn === "claimable") {
        aValue = Number(a.staking?.withdrawable || 0);
        bValue = Number(b.staking?.withdrawable || 0);
      } else if (sortColumn === "expires") {
        aValue = Number(a.staking?.expires || 0);
        bValue = Number(b.staking?.expires || 0);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
  }, [arc72Tokens, sortColumn, sortDirection]);

  const SortableHeader: React.FC<{
    column: SortColumn;
    children: React.ReactNode;
  }> = ({ column, children }) => (
    <Box
      component="span"
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": { opacity: 0.8 },
      }}
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column && (
        <Box component="span" sx={{ ml: 1 }}>
          {sortDirection === "asc" ? (
            <ArrowUpwardIcon fontSize="small" />
          ) : (
            <ArrowDownwardIcon fontSize="small" />
          )}
        </Box>
      )}
    </Box>
  );

  console.log(stakingContracts, arc72Tokens);

  const tableStyle = {
    backgroundColor: "transparent",
    borderRadius: "8px",
    marginTop: "25px",
  };

  const cellStyle = {
    color: theme.palette.mode === "dark" ? "white" : theme.palette.text.primary,
    fontWeight: 900,
  };

  const headCellStyle = {
    ...cellStyle,
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
  };

  const headRowStyle = {
    borderBottom: "none",
  };

  const lastRowStyle = {
    borderBottom: "none",
  };

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const totalPages = Math.ceil(sortedStakingContracts.length / pageSize);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages2 = Math.ceil(sortedArc72Tokens.length / pageSize);
  const [currentPage2, setCurrentPage2] = React.useState(1);

  // Add state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);

  // Calculate total withdrawable amount based on active tab
  const handleWithdrawAllClick = async () => {
    if (!activeAccount) return;
    const { algodClient } = getAlgorandClients();
    let total = BigInt(0);
    if (value === 0) {
      // Only calculate for active staking contracts tab
      // total = sortedStakingContracts
      //   .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      //   .reduce((sum, ctc) => sum + Number(ctc.withdrawable || 0), 0);
      // build withdraw transactions
      const buildN = [];
      let withdrawableAmount;
      for await (const ctc of sortedStakingContracts) {
        const withdrawable = await getStakingWithdrawableAmount(
          algodClient,
          ctc.contractId,
          ctc.global_owner
        );
        total += BigInt(withdrawable);
        if (withdrawable > 0) {
          const builder = new CONTRACT(
            ctc.contractId,
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
            { addr: activeAccount.address, sk: new Uint8Array(0) },
            true,
            false,
            true
          );
          const txnO = await builder.withdraw(BigInt(withdrawable));
          buildN.push({
            ...txnO,
          });
        }
      }
      const ci = new CONTRACT(0, algodClient, undefined, abi.custom, {
        addr: activeAccount.address,
        sk: new Uint8Array(0),
      });
      ci.setFee(2000);
      ci.setEnableGroupResourceSharing(true);
      ci.setExtraTxns(buildN.slice(0, 8).map((txn) => txn.obj));
      //ci.setGroupResourceSharingStrategy("merge");
      const customR = await ci.custom();
      const stxns = await signTransactions(
        customR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const res = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();
      console.log(res);
    } else {
      const buildN: any[] = [];
      for await (const nft of sortedArc72Tokens) {
        try {
          const withdrawable = await getStakingWithdrawableAmount(
            algodClient,
            Number(nft.tokenId),
            nft.staking?.global_owner
          );
          console.log(withdrawable);
          total += BigInt(withdrawable);
          if (withdrawable > BigInt(0)) {
            const builder = new CONTRACT(
              nft.contractId,
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
              { addr: activeAccount.address, sk: new Uint8Array(0) },
              true,
              false,
              true
            );
            const txnO = await builder.withdraw(
              Number(nft.tokenId),
              BigInt(withdrawable)
            );
            console.log({ txnO });
            buildN.push({
              ...txnO,
              accounts: [
                "RTKWX3FTDNNIHMAWHK5SDPKH3VRPPW7OS5ZLWN6RFZODF7E22YOBK2OGPE",
              ],
              foreignApp: [Number(nft.tokenId)],
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
      console.log(buildN);
      const ci = new CONTRACT(0, algodClient, undefined, abi.custom, {
        addr: activeAccount.address,
        sk: new Uint8Array(0),
      });
      ci.setFee(8000);
      ci.setEnableGroupResourceSharing(true);
      ci.setExtraTxns(buildN.slice(0, 7).map((txn) => txn.obj));
      //ci.setGroupResourceSharingStrategy("merge");
      const customR = await ci.custom();
      console.log(customR);
      const stxns = await signTransactions(
        customR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const res = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();
      console.log(res);
    }
    setWithdrawableAmount(Number(total) / 10 ** 6);
    setIsModalOpen(true);
  };

  // Add modal JSX before the return statement
  const withdrawModal = (
    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <DialogTitle>Withdraw All Tokens</DialogTitle>
      <DialogContent>
        <Typography>Total withdrawable amount: {withdrawableAmount}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
        <Button
          onClick={() => {
            // Add your withdraw logic here
            setIsModalOpen(false);
          }}
          sx={{
            backgroundColor: "#9933ff",
            color: "white",
            "&:hover": { backgroundColor: "#7f2adb" },
          }}
        >
          Confirm Withdraw
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {withdrawModal}
      <StyledTabs
        value={value}
        onChange={handleChange}
        aria-label="position tabs"
        $isDarkTheme={isDarkTheme}
      >
        <Tab label="Staking Contracts" />
        <Tab label="Tokens" />
      </StyledTabs>
      <CustomTabPanel value={value} index={0}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          {/*<Button
            variant="contained"
            onClick={handleWithdrawAllClick}
            sx={{
              backgroundColor: "#9933ff",
              "&:hover": { backgroundColor: "#7f2adb" },
            }}
          >
            Withdraw All
          </Button>
          */}
        </Box>
        <TableContainer component={Paper} style={tableStyle}>
          <Table>
            <TableHead>
              <TableRow style={headRowStyle}>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="contractId">
                    Account Id
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  <SortableHeader column="global_delegate">
                    Delegate
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="totalStaked">
                    Lockup Tokens
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="unlockTime">
                    Unlock Time
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="part_vote_lst">
                    Expires
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="part_vote_lst">
                    Proposer Blocks
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="claimable">
                    Claimable Amount
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedStakingContracts
                ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                ?.map((ctc, index) => (
                  <PositionRow
                    key={ctc.contractId}
                    position={ctc}
                    cellStyle={cellStyle}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isDarkTheme={isDarkTheme}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleWithdrawAllClick}
            sx={{
              backgroundColor: "#9933ff",
              "&:hover": { backgroundColor: "#7f2adb" },
            }}
          >
            Withdraw All
          </Button>
        </Box>
        <TableContainer component={Paper} style={tableStyle}>
          <Table>
            <TableHead>
              <TableRow style={headRowStyle}>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="contractId">
                    Account Id
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Delegate
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="totalStaked">
                    Lockup Tokens
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="unlock">Unlock Time</SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="expires">Expires</SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="claimable">Claimable</SortableHeader>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedArc72Tokens
                ?.slice((currentPage2 - 1) * pageSize, currentPage2 * pageSize)
                ?.map((nft, index) => (
                  <PositionTokenRow
                    key={nft.tokenId}
                    nft={nft}
                    index={index}
                    arc72TokensLength={sortedArc72Tokens.length}
                    lastRowStyle={lastRowStyle}
                    cellStyle={cellStyle}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage2}
          totalPages={totalPages2}
          onPageChange={setCurrentPage2}
          isDarkTheme={isDarkTheme}
        />
      </CustomTabPanel>
    </>
  );
};

export default ResponsiveTable;
