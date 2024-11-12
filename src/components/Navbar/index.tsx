import styled from "@emotion/styled";
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LightLogo from "static/logo-light.svg";
import DarkLogo from "static/logo-dark.svg";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import ThemeSelector from "../ThemeSelector";

import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import { useWallet } from "@txnlab/use-wallet";
import { Chip, Divider, Stack } from "@mui/material";

import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "react-toastify";
import ConnectWallet from "../ConnectWallet";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { arc200 } from "ulujs";
import { TOKEN_VIA } from "../../contants/tokens";
import { getAlgorandClients } from "../../wallets";
import { arc200_balanceOf } from "ulujs/types/arc200";
import VOIIcon from "static/crypto-icons/voi/0.svg";
import VIAIcon from "static/crypto-icons/voi/6779767.svg";

const AccountIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
    >
      <path
        d="M27.5 28C27.5 26.1392 27.5 25.2089 27.2632 24.4518C26.7299 22.7473 25.3544 21.4134 23.5966 20.8963C22.8159 20.6667 21.8564 20.6667 19.9375 20.6667H13.0625C11.1436 20.6667 10.1841 20.6667 9.40343 20.8963C7.64563 21.4134 6.27006 22.7473 5.73683 24.4518C5.5 25.2089 5.5 26.1392 5.5 28M22.6875 10C22.6875 13.3137 19.9173 16 16.5 16C13.0827 16 10.3125 13.3137 10.3125 10C10.3125 6.68629 13.0827 4 16.5 4C19.9173 4 22.6875 6.68629 22.6875 10Z"
        stroke="#9933FF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const AccountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const Button = styled.div`
  cursor: pointer;
`;

const AccountIconContainer = styled(Button)`
  display: flex;
  width: 45px;
  height: 45px;
  /*
  padding: var(--Main-System-8px, 8px);
  */
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  border: 1px solid #93f;
`;

const NavRoot = styled.nav`
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0px;
  backdrop-filter: blur(32px);
`;

const NavContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0px;
  @media screen and (min-width: 960px) {
    padding: 0px 80px;
  }
`;

const NavLogo = styled.img``;

const NavLinks = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: none;
  align-items: center;
  gap: 24px;
  @media screen and (min-width: 960px) {
    display: inline-flex;
  }
`;

const NavLink = styled.a`
  font-family: Nohemi, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.1px;
  text-align: left;
  text-decoration: none;
  color: #161717;
  cursor: pointer;
  &:hover {
    color: #9933ff !important;
  }
  text-align: center;
  padding-left: 6px;
  padding-right: 6px;
`;

const ActiveNavLink = styled(NavLink)`
  color: #9933ff;
  border-bottom: 3px solid #9933ff;
`;

const LgIconLink = styled.a`
  display: none;
  cursor: pointer;
  &:hover {
    color: #9933ff;
  }
  @media screen and (min-width: 600px) {
    display: inline-flex;
  }
`;

const ConnectButton = styled.svg`
  cursor: pointer;
`;

const linkLabels: any = {
  "/collection": "Collections",
  "/listing": "Buy",
};

const Navbar = () => {
  const location = useLocation();

  /* Copy to clipboard */

  const [copiedText, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        console.log("Copied!", { text });
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard!");
      });
  };

  /* Wallet */

  const { providers, activeAccount, connectedAccounts, getAccountInfo } =
    useWallet();

  const [accInfo, setAccInfo] = React.useState<any>(null);
  const [balance, setBalance] = React.useState<any>(null);

  // EFFECT: get voi balance
  useEffect(() => {
    if (activeAccount && providers && providers.length >= 3) {
      getAccountInfo().then(setAccInfo);
    }
  }, [activeAccount, providers]);

  // EFFECT: get via balance
  // useEffect(() => {
  //   if (activeAccount && providers && providers.length >= 3) {
  //     const { algodClient, indexerClient } = getAlgorandClients();
  //     const ci = new arc200(TOKEN_VIA, algodClient, indexerClient);
  //     ci.arc200_balanceOf(activeAccount.address).then(
  //       (arc200_balanceOfR: any) => {
  //         if (arc200_balanceOfR.success) {
  //           setBalance(Number(arc200_balanceOfR.returnValue));
  //         }
  //       }
  //     );
  //   }
  // }, [activeAccount, providers]);

  /* Theme */

  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Navigation */

  const navigate = useNavigate();
  /*
  const [active, setActive] = React.useState("");
  */

  /* Popper */

  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  return (
    <NavRoot
      style={{
        backgroundColor: isDarkTheme ? "#161717" : undefined,
        borderBottom: isDarkTheme ? "none" : undefined,
      }}
    >
      <NavContainer>
        <Link to="/">
          <NavLogo src={isDarkTheme ? DarkLogo : LightLogo} />
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* <NavLinks>
            {[
              {
                label: "Buy",
                href: "/listing",
              },
              {
                label: "Collections",
                href: "/collection",
              },
            ].map((item) =>
              linkLabels[location.pathname] === item.label ? (
                <ActiveNavLink
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </ActiveNavLink>
              ) : (
                <NavLink
                  style={{ color: isDarkTheme ? "#717579" : undefined }}
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </NavLinks> */}
          <NavLinks>
            {[              
              {
                label: "Collections",
                href: "/collection",
              },
              {
                label: "Sell",
                href: "/sell"
                // href: "/listing",
              }
            ].map((item) =>
              linkLabels[location.pathname] === item.label ? (
                <ActiveNavLink
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </ActiveNavLink>
              ) : (
                <NavLink
                  style={{ color: isDarkTheme ? "#717579" : undefined }}
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </NavLinks>
          <ul
            style={{
              listStyleType: "none",
              margin: 0,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {/* magnifying glass */}
            <li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <LgIconLink>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </LgIconLink>
          </li>
            {/* moon icon */}
            <li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <ThemeSelector>
                {isDarkTheme ? (
                  <WbSunnyOutlinedIcon />
                ) : (
                  <LgIconLink>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </LgIconLink>
                )}
              </ThemeSelector>
            </li>
            {/* cart icon */}
            {/*<li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <LgIconLink>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 2H3.30616C3.55218 2 3.67519 2 3.77418 2.04524C3.86142 2.08511 3.93535 2.14922 3.98715 2.22995C4.04593 2.32154 4.06333 2.44332 4.09812 2.68686L4.57143 6M4.57143 6L5.62332 13.7314C5.75681 14.7125 5.82355 15.2031 6.0581 15.5723C6.26478 15.8977 6.56108 16.1564 6.91135 16.3174C7.30886 16.5 7.80394 16.5 8.79411 16.5H17.352C18.2945 16.5 18.7658 16.5 19.151 16.3304C19.4905 16.1809 19.7818 15.9398 19.9923 15.6342C20.2309 15.2876 20.3191 14.8247 20.4955 13.8988L21.8191 6.94969C21.8812 6.62381 21.9122 6.46087 21.8672 6.3335C21.8278 6.22177 21.7499 6.12768 21.6475 6.06802C21.5308 6 21.365 6 21.0332 6H4.57143ZM10 21C10 21.5523 9.55228 22 9 22C8.44772 22 8 21.5523 8 21C8 20.4477 8.44772 20 9 20C9.55228 20 10 20.4477 10 21ZM18 21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21C16 20.4477 16.4477 20 17 20C17.5523 20 18 20.4477 18 21Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </LgIconLink>
        </li>*/}
          </ul>
          {activeAccount && accInfo ? (
            <StyledLink to={`/account/${activeAccount?.address}`}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <div
                  style={{
                    color: isDarkTheme ? "#717579" : undefined,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VOIIcon} style={{ height: "12px" }} />
                      <div>
                        {(
                          (accInfo.amount - accInfo["min-balance"]) /
                          1e6
                        ).toLocaleString()}{" "}
                        VOI
                      </div>
                    </Stack>
                    {/*<Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VIAIcon} style={{ height: "12px" }} />
                      <div>{(balance / 1e6).toLocaleString()} VIA</div>
                    </Stack>*/}
                  </Stack>
                </div>
              </Stack>
            </StyledLink>
          ) : null}
          <AccountContainer>
            {activeAccount ? (
              <Link to={`/account/${activeAccount?.address}`}>
                <AccountIconContainer>
                  <AccountIcon />
                </AccountIconContainer>
              </Link>
            ) : null}
            <ConnectWallet />
          </AccountContainer>
        </div>
      </NavContainer>
    </NavRoot>
  );
};

export default Navbar;
