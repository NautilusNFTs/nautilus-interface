import React from "react";
import { Grid, Skeleton, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { decodePrice, decodeTokenId } from "../../utils/mp";
import NftCard from "../../components/NFTCard";

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Heading = styled.h3`
  font-family: Advent Pro;
  font-size: 36px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: 0em;
  text-align: left;
  margin: 0px;
`;

const Button = styled.div`
  cursor: pointer;
`;
const SecondaryButton = styled(Button)`
  display: flex;
  padding: 20px;
  justify-content: center;
  align-items: center;
  gap: 3px;
  border-radius: 100px;
  border: 1px solid #93f;
  flexshrink: 0;
`;
const ButtonLabel = styled.div`
  color: #93f;
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 125% */
`;

interface NFTMoreProps {
  nfts: any[];
  title: string;
  onClick: (el: any) => void;
}

export const NFTMore: React.FC<NFTMoreProps> = ({ nfts, title, onClick }) => {
  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const isLoading = false;

  return !isLoading && nfts.length > 0 ? (
    <Stack style={{ gap: "36px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Heading style={{ color: isDarkTheme ? "#FFFFFF" : undefined }}>
          {title}
        </Heading>
        <StyledLink to={`/collection/${nfts[0].contractId}`}>
          <SecondaryButton>
            <ButtonLabel>View Collection</ButtonLabel>
          </SecondaryButton>
        </StyledLink>
      </div>
      <Grid container spacing={2}>
        {nfts.slice(0, 4).map((el: any) => {
          const collectionsMissingImage = [35720076];
          const url = !collectionsMissingImage.includes(el.contractId)
            ? `https://prod.cdn.highforge.io/i/${encodeURIComponent(
                el.metadataURI
              )}?w=400`
            : el.metadata.image;
          return (
            <Grid key={`${el.tokenId}`} item xs={6} sm={4} md={3}>
              <NftCard
                nftName={el.metadata.name}
                image={url}
                price={(el.listing.price / 1e6).toLocaleString()}
                currency={`${el.listing.currency}` === "0" ? "VOI" : "VIA"}
                owner={el.owner}
                onClick={() => {
                  onClick(el);
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  ) : null;
};
