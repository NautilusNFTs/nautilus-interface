import React, { useMemo } from "react";
import { styled as mstyled } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Box, Grid } from "@mui/material";
import Stack from "@mui/material/Stack";
import styled from "styled-components";
import { collections } from "../../contants/games";
import { Link, useNavigate } from "react-router-dom";
import { Style } from "@mui/icons-material";

export interface Player {
  collectionId: number;
  image: string;
  name: string;
  score: number;
  scoreUnit: string;
  floorPrice: number;
}

interface Props {
  rankings: Player[];
  selectedOption: string | null;
}

const StyledGrid = styled(Grid)`
  display: flex;
  padding: 0px 72px 0px 24px;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 600px) {
    padding: 0px 24px 0px 24px;
  }
`;

const StyledGrid2 = styled(StyledGrid)`
  justify-content: flex-end;
  padding-right: 120px;
  &.light {
    color: #000;
  }
  &.dark {
    color: #fff;
  }
  @media (max-width: 600px) {
    padding-right: 72px;
  }
`;

const AccountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--Main-System-16px, 16px);
`;

const AccountAvatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 100px;
  background-size: contain;
`;

const AccountName = styled.div`
  /* Layout */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  /* Typography */
  font-family: Inter;
  font-size: 100%;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 91.667% */
`;

const AccountMetric = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccountMetricSubtext = styled.span`
  color: #717579;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 110% */
`;

const AccountMetricMaintext = styled.span`
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px; /* 110% */
  & .dark {
    color: #fff;
  }
  & .light {
    color: #000;
  }
`;

const RankText = styled.div`
  font-family: Nohemi;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px; /* 91.667% */
  width: 30px;
  text-align: center;
  & .dark {
    color: #fff;
  }
  & .light {
    color: #161717;
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccountInfo = styled.div`
  & .dark {
    color: #fff;
  }
  & .light {
    color: #161717;
  }
`;

const filterAll = (ranking: Player) => ranking !== null;

const filterGames = (ranking: Player) =>
  ranking !== null &&
  collections
    .map((el) => el.applicationID)
    .some((id) => id === ranking.collectionId);

const RankingsTable: React.FC<Props> = ({ rankings, selectedOption }) => {
  const navigate = useNavigate();
  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const filter = () => {
    switch (selectedOption) {
      case "all":
        return filterAll;
      case "games":
        return filterGames;
      default:
        return filterAll;
    }
  };
  const filteredRankings = useMemo(() => {
    return rankings.filter(filter());
  }, [rankings, filter]);
  return (
    <Grid container spacing={5}>
      <Grid item xs={12} lg={6}>
        <Grid container gap={1}>
          <StyledGrid2 item xs={12} className={isDarkTheme ? "dark" : "light"}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <VolumeContainer>
                <AccountMetricMaintext
                  className={isDarkTheme ? "dark" : "light"}
                >
                  Volume
                </AccountMetricMaintext>
              </VolumeContainer>
            </Stack>
          </StyledGrid2>
          {[0, 1, 2, 3, 4].map((index) =>
            filteredRankings[index] ? (
              <StyledGrid
                item
                xs={12}
                key={filteredRankings[index].collectionId}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(
                    `/collection/${filteredRankings[index].collectionId}`
                  );
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <RankText>
                    <span className={isDarkTheme ? "dark" : "light"}>
                      {index + 1}
                    </span>
                  </RankText>
                  <AccountContainer>
                    <AccountAvatar
                      style={{
                        background: `url(${
                          filteredRankings[index]?.image
                            ? filteredRankings[index].image
                            : "/android-chrome-192x192.png"
                        })`,
                        backgroundSize: "contain",
                      }}
                    />
                    <AccountInfo>
                      <Link
                        style={{ textDecoration: "none" }}
                        to={`/collection/${filteredRankings[index]?.collectionId}`}
                      >
                        <AccountName className={isDarkTheme ? "dark" : "light"}>
                          {filteredRankings[index]?.name
                            ? filteredRankings[index].name
                            : "Collection Name"}
                        </AccountName>
                      </Link>
                      {filteredRankings[index]?.floorPrice > 0 ? (
                        <AccountMetric
                          sx={{
                            display: { xs: "none", sm: "flex" },
                            gap: "6px",
                          }}
                        >
                          <AccountMetricSubtext>Floor</AccountMetricSubtext>
                          <AccountMetricMaintext
                            className={isDarkTheme ? "dark" : "light"}
                          >
                            {filteredRankings[index]?.floorPrice
                              ? filteredRankings[index].floorPrice !== 0
                                ? Math.round(
                                    filteredRankings[index].floorPrice / 1e6
                                  ).toLocaleString()
                                : "-"
                              : "-"}
                          </AccountMetricMaintext>
                          <AccountMetricSubtext>
                            {filteredRankings[index]?.scoreUnit
                              ? filteredRankings[index].scoreUnit
                              : "Score Unit"}
                          </AccountMetricSubtext>
                        </AccountMetric>
                      ) : null}
                    </AccountInfo>
                  </AccountContainer>
                </Stack>
                <VolumeContainer>
                  <AccountMetricMaintext>
                    <span className={isDarkTheme ? "dark" : "light"}>
                      {filteredRankings[index]?.score
                        ? filteredRankings[index].score
                        : 0}
                    </span>
                  </AccountMetricMaintext>
                  <AccountMetricSubtext>VOI</AccountMetricSubtext>
                </VolumeContainer>
              </StyledGrid>
            ) : null
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} lg={6} sx={{ display: { xs: "none", lg: "block" } }}>
        <Grid container spacing={1}>
          <StyledGrid2 item xs={12}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <VolumeContainer>
                <AccountMetricMaintext
                  className={isDarkTheme ? "dark" : "light"}
                >
                  Volume
                </AccountMetricMaintext>
              </VolumeContainer>
            </Stack>
          </StyledGrid2>
          {[5, 6, 7, 8, 9].map((index) =>
            filteredRankings[index] ? (
              <StyledGrid
                item
                xs={12}
                key={filteredRankings[index].collectionId}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(
                    `/collection/${filteredRankings[index]?.collectionId}`
                  );
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <RankText>
                    <span className={isDarkTheme ? "dark" : "light"}>
                      {index + 1}
                    </span>
                  </RankText>
                  <AccountContainer>
                    <AccountAvatar
                      style={{
                        background: `url(${
                          filteredRankings[index]?.image
                            ? filteredRankings[index].image
                            : "/android-chrome-192x192.png"
                        })`,
                        backgroundSize: "contain",
                      }}
                    />
                    <AccountInfo>
                      <AccountName className={isDarkTheme ? "dark" : "light"}>
                        {filteredRankings[index]?.name
                          ? filteredRankings[index].name
                          : "Collection Name"}
                      </AccountName>
                      {filteredRankings[index]?.floorPrice > 0 ? (
                        <AccountMetric>
                          <AccountMetricSubtext>Floor</AccountMetricSubtext>
                          <AccountMetricMaintext>
                            <span className={isDarkTheme ? "dark" : "light"}>
                              {filteredRankings[index]?.floorPrice
                                ? filteredRankings[index].floorPrice !== 0
                                  ? Math.round(
                                      filteredRankings[index].floorPrice / 1e6
                                    ).toLocaleString()
                                  : "-"
                                : "-"}
                            </span>
                          </AccountMetricMaintext>
                          <AccountMetricSubtext>
                            {filteredRankings[index]?.scoreUnit
                              ? filteredRankings[index].scoreUnit
                              : "Score Unit"}
                          </AccountMetricSubtext>
                        </AccountMetric>
                      ) : null}
                    </AccountInfo>
                  </AccountContainer>
                </Stack>
                <VolumeContainer>
                  <AccountMetricMaintext>
                    <span className={isDarkTheme ? "dark" : "light"}>
                      {filteredRankings[index]?.score
                        ? filteredRankings[index].score
                        : 0}
                    </span>
                  </AccountMetricMaintext>
                  <AccountMetricSubtext>VOI</AccountMetricSubtext>
                </VolumeContainer>
              </StyledGrid>
            ) : null
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RankingsTable;
