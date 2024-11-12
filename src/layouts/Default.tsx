import React from "react";
import styled from "styled-components";
import {
  Container
} from "@mui/material";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const LayoutRoot = styled.div`
  padding: 0px 40px;
  padding-top: 40px;
  padding-bottom: 40px;
  @media (max-width: 600px) {
    padding: 0px 10px;
    padding-top: 40px;
    padding-bottom: 80px;
  }1
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return (
    <>
      <LayoutRoot
        style={{ background: isDarkTheme ? "rgb(22, 23, 23)" : undefined }}
      >
        <header></header>
        <main>{children}</main>
      </LayoutRoot>
      <Footer />
    </>
  );
};

export default Layout;
