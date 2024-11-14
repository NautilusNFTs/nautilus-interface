import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store, persistor, RootState } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import Navbar from "./components/Navbar";
import { routes } from "./routes";
import { getCurrentNodeEnv } from "./wallets";
import { ToastContainer } from "react-toastify";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
  useWallet,
} from "@txnlab/use-wallet-react";
import Wallet from './pages/Wallet';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import CommunityChest from './pages/CommunityChest';

const BackgroundLayer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
`;

interface AppContainerProps {
  children: React.ReactNode;
}
const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  return (
    <div
      style={{
        color: isDarkTheme ? "#fff" : "#000",
        transition: "all 0.25s linear",
      }}
    >
      <BackgroundLayer
        className="background-layer"
        style={{
          background: isDarkTheme ? "#161717" : "#FFFFFF",
        }}
      ></BackgroundLayer>
      <div className="relati overflow-x-hidden h-fi" style={{}}>
        {children}
      </div>
    </div>
  );
};

// New component that uses the wallet hook
const AppRoutes: React.FC = () => {
  const { activeAccount } = useWallet();
  const isDarkTheme = useSelector((state: RootState) => state.theme.isDarkTheme);

  return (
    <AppContainer>
      <Router>
        <Navbar />
        <Routes>
          {routes.map((el, key) => (
            <Route key={key} path={el.path} Component={el.Component} />
          ))}
          <Route path="/wallet/:accountId" element={<Wallet />} />
          <Route 
            path="/community-chest" 
            element={
              <CommunityChest 
                isDarkTheme={isDarkTheme} 
                connected={!!activeAccount} 
                address={activeAccount?.address} 
              />
            } 
          />
        </Routes>
      </Router>
    </AppContainer>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { ALGO_SERVER, ALGO_INDEXER_SERVER } = getCurrentNodeEnv();

  let walletConnectProjectId;
  if (!walletConnectProjectId) {
    walletConnectProjectId = "cd7fe0125d88d239da79fa286e6de2a8";
  }

  const walletManager = new WalletManager({
    wallets: [
      WalletId.KIBISIS,
      {
        id: WalletId.LUTE,
        options: { siteName: "Nautilus" },
      },
      {
        id: WalletId.BIATEC,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: "Nautilus",
            url: "https://nautilus.sh",
            description: "Nautilus NFT Marketplace",
            icons: ["https://nautilus.sh/favicon.ico"],
          },
          themeMode: "light",
        },
      },
      {
        id: WalletId.WALLETCONNECT,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: "Nautilus",
            url: "https://nautilus.sh",
            description: "Nautilus NFT Marketplace",
            icons: ["https://nautilus.sh/favicon.ico"],
          },
          themeMode: "light",
        },
      },
    ],
    algod: {
      baseServer: ALGO_SERVER,
      port: "",
      token: "",
    },
    network: NetworkId.MAINNET,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider manager={walletManager}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AppRoutes />
            </PersistGate>
          </Provider>
          <ToastContainer />
        </QueryClientProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
