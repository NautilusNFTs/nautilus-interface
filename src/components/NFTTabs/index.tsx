import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import NFTSalesTable from "../NFTSalesTable";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getSmartTokens } from "../../store/smartTokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { BigNumber } from "bignumber.js";
import { stakingRewards } from "@/static/staking/staking";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface NFTTabsProps {
  nft: any;
  loading: boolean;
  exchangeRate: number;
}

const NFTTabs: React.FC<NFTTabsProps> = ({ nft, loading, exchangeRate }) => {
  const dispatch = useDispatch();
  /* Smart Tokens */
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  React.useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  const sales = useSelector((state: any) => state.sales.sales);
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Tabs */
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tokenSales = React.useMemo(() => {
    const tokenSales = sales.filter(
      (sale: any) =>
        sale.collectionId === nft.contractId && sale.tokenId === nft.tokenId
    );
    tokenSales.sort((a: any, b: any) => b.timestamp - a.timestamp);
    return tokenSales;
  }, [sales, nft]);

  const [account, setAccount] = React.useState<any>(null);
  React.useEffect(() => {
    if (!nft) return;
    axios
      .get(`https://mainnet-idx.nautilus.sh/v1/scs/accounts`, {
        params: {
          contractId: nft.tokenId,
        },
      })
      .then(({ data: { accounts } }) => {
        if (accounts.length === 0) return;
        const account = accounts[0];
        const reward = stakingRewards.find(
          (reward) => `${reward.contractId}` === `${account.contractId}`
        );
        setAccount({
          ...account,
          global_initial:
            reward?.initial ||
            account.global_initial ||
            account?.global_initial ||
            0,
          global_total:
            reward?.total || reward?.global_total || account?.global_total || 0,
        });
      });
  }, [nft]);
  console.log({ account });

  return !loading ? (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          sx={{
            color: "717579",
            "& .MuiTabs-root": {},
            "& .MuiTabs-indicator": {
              color: "#93F",
              backgroundColor: "#93F",
            },
            "& .Mui-selected": {
              color: "#93F",
              textAlign: "center",
              leadingTrim: "both",
              textEdge: "cap",
              fontFamily: "Nohemi",
              //fontSize: "24px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: "20px",
            },
          }}
          textColor="inherit"
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            sx={{
              color: "717579",
            }}
            label="History"
            {...a11yProps(0)}
          />
          <Tab label="Staking Information" {...a11yProps(1)} />
          {/*<Tab label="Information" {...a11yProps(1)} />
          <Tab label="Attributes" {...a11yProps(2)} />*/}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {tokenSales && tokenSales.length > 0 ? (
          <NFTSalesTable
            sales={
              tokenSales?.map((sale: any) => {
                const currency = smartTokens.find(
                  (token: any) => `${token.contractId}` === `${sale.currency}`
                );
                console.log({ currency });
                const currencySymbol =
                  currency?.tokenId === "0" ? "VOI" : currency?.symbol || "VOI";
                const currencyDecimals =
                  currency?.decimals === 0 ? 0 : currency?.decimals || 6;
                const currencyPrice =
                  currency?.tokenId === "0" ? 0 : currency?.price || 0;
                const priceBn = new BigNumber(sale.price).div(
                  new BigNumber(10).pow(currencyDecimals)
                );
                const price = formatter.format(priceBn.toNumber());
                const normalPrice = formatter.format(
                  new BigNumber(currencyPrice).multipliedBy(priceBn).toNumber()
                );
                return {
                  event: "Sale",
                  price: price,
                  normalPrice: currencyPrice > 0 ? normalPrice : 0,
                  currency: currencySymbol,
                  seller: sale.seller,
                  buyer: sale.buyer,
                  date: moment.unix(sale.timestamp).format("LLL"),
                  round: sale.round,
                };
              }) || []
            }
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: isDarkTheme ? "#fff" : "#000",
              textAlign: "left",
              paddingTop: "20px",
            }}
          >
            No sales found
          </Typography>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {account ? (
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
              {account.global_period > 5
                ? `${account.global_period} mo`
                : `${account.global_period} years`}
            </Typography>
            <Typography variant="body2">
              <strong>Vesting:</strong>{" "}
              {account.global_period > 5
                ? `${account.global_distribution_count} mo`
                : `12 years`}
            </Typography>
            <Typography variant="body2">
              <strong>Stake Amount:</strong>{" "}
              {account.global_period > 5
                ? `${account.global_initial / 10 ** 6} VOI`
                : `${formatter.format(account.global_initial / 10 ** 6)} VOI`}
            </Typography>
            <Typography variant="body2">
              <strong>Est. Total Tokens:</strong>
              {` `}
              {account.global_period > 5
                ? `${account.global_total / 10 ** 6} VOI`
                : `${formatter.format(account.global_total)} VOI`}
            </Typography>
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
        )}
      </CustomTabPanel>
      {/*<CustomTabPanel value={value} index={1}>
        Information
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Attributes
        </CustomTabPanel>*/}
    </Box>
  ) : null;
};

export default NFTTabs;
