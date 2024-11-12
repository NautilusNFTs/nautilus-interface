import React from "react";
import { styled as mstyled } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { Box } from "@mui/material";
import { RankingI } from "../../types";
import { Link } from "react-router-dom";

const StyledImage = styled(Box)`
  width: 53px;
  height: 53px;
  flex-shrink: 0;
  border-radius: 8px;
  background-size: cover;
`;

interface Props {
  rankings: RankingI[];
}

const StyledTableCell = mstyled(TableCell)(({ theme }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return {
    borderBottom: "none",
    padding: theme.spacing(1),
    color: isDarkTheme ? "#fff" : "#000",
  };
});

const NFTCollectionTable: React.FC<Props> = ({ rankings }) => {
  return (
    <TableContainer>
      <Table aria-label="rankings table">
        <TableHead>
          <TableRow>
            {[
              "#",
              "",
              "Collection",
              "Floor Price",
              //"Floor Change",
              "Volume",
              //"Volume Change",
              "Items",
              "Owners",
            ].map((header, index) => (
              <StyledTableCell key={index}>{header}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rankings.map((player, index) => (
            <TableRow key={index}>
              <StyledTableCell component="th" scope="row">
                {index + 1}
              </StyledTableCell>
              <StyledTableCell>
                <StyledImage sx={{ backgroundImage: `url(${player.image})` }} />
              </StyledTableCell>
              <StyledTableCell>
                <Link
                  style={{ textDecoration: "none", color: "inherit" }}
                  to={`/collection/${player.collectionId}`}
                >
                  {player.name}
                </Link>
              </StyledTableCell>
              <StyledTableCell>
                {player.floorPrice === 0
                  ? "-"
                  : (Number(player.floorPrice) / 1e6).toLocaleString() + " VOI"}
              </StyledTableCell>
              <StyledTableCell>
                {player.volume === 0
                  ? "-"
                  : (Number(player.volume) / 1e6).toLocaleString() + " VOI"}
              </StyledTableCell>
              <StyledTableCell>
                {player.items === 0 ? "-" : player.items}
              </StyledTableCell>
              <StyledTableCell>
                {player.owners === 0 ? "-" : player.owners}
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NFTCollectionTable;
