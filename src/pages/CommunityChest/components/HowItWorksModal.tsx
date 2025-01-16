import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import styled from "styled-components";
import TokenIcon from "@mui/icons-material/Token";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PieChartIcon from "@mui/icons-material/PieChart";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CasinoIcon from "@mui/icons-material/Casino";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GavelIcon from "@mui/icons-material/Gavel";
import Link from "@mui/material/Link";

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgb(23, 23, 23)" : "rgb(255, 255, 255)"};
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    border-radius: 24px;
    padding: 16px;
    border: 1px solid
      ${(props) =>
        props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  }
`;

const Section = styled(Box)<{ $isDarkTheme: boolean }>`
  margin-bottom: 24px;

  h6 {
    color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
    margin-bottom: 8px;
    font-weight: 600;
  }

  p {
    color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  open,
  onClose,
  isDarkTheme,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          How It Works
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Community Chest Voi (CCV) Token</Typography>
          <Typography>
            When you deposit VOI into the Community Chest, you receive an
            equivalent amount of CCV tokens. These tokens represent your share
            in the Community Chest.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TokenIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="1:1 Ratio"
                secondary="1 VOI = 1 CCV token. The exchange rate is always fixed."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccountBalanceWalletIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Fully Redeemable"
                secondary="CCV tokens can be redeemed for VOI at any time, with no lockup period or restrictions."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PieChartIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Reward Distribution"
                secondary="Weekly rewards are distributed proportionally to CCV holders based on their token balance."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SwapHorizIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Transferable"
                secondary="CCV tokens can be transferred between wallets, allowing for flexible management of your Community Chest position."
              />
            </ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Note: Always ensure you understand the relationship between VOI
            deposits and CCV tokens before participating in the Community Chest.
          </Typography>
        </Section>

        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Weekly Rewards & Draws</Typography>
          <Typography paragraph>
            The Community Chest operates on a weekly epoch system, with two main
            reward mechanisms:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <AutorenewIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Block Production Rewards"
                secondary="75% of block rewards produced by the Community Chest participation node are distributed to CCV holders in the following epoch."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CasinoIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Lucky Draw"
                secondary="A random draw occurs throughout the week. Your chance of winning is proportional to your CCV balance - the more you hold, the better your odds!"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CalendarTodayIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Weekly Epochs"
                secondary="Each epoch runs for 7 days. Rewards are calculated and distributed in the following epoch."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccountBalanceIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Reward Pool"
                secondary="The reward pool grows with each block produced by the Community Chest participation node. Block rewards vary based on network conditions and total stake."
              />
            </ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Note: Block production and rewards may vary based on network
            conditions and validator performance.
          </Typography>
        </Section>

        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Smart Contract Security</Typography>
          <Typography paragraph>
            The Community Chest is built on secure, auditable smart contracts on
            the VOI blockchain:
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Transparent Operations"
                secondary="All transactions, deposits, and withdrawals are publicly verifiable on the VOI blockchain."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="ARC-200 Standard"
                secondary="CCV tokens follow the ARC-200 standard, ensuring compatibility with wallets and services."
              />
            </ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Contract Address: 664258 - View on{" "}
            <Link
              href="https://voi.observer/explorer/application/664258"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: isDarkTheme ? "#90caf9" : "#1976d2",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              VOI Observer
            </Link>
          </Typography>
        </Section>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: isDarkTheme ? "#90caf9" : "#1976d2",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default HowItWorksModal;
