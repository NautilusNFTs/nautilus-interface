import React, { useEffect, useState } from "react";
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
import { Avatar, Box, Chip, Typography } from "@mui/material";
import { RankingI } from "../../types";
import { Link } from "react-router-dom";
import { useEnvoiResolver } from "@/hooks/useEnvoiResolver";
import { compactAddress } from "@/utils/mp";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const formatter = Intl.NumberFormat("en", { notation: "compact" });

const StyledImage = styled(Box)`
  width: 53px;
  height: 53px;
  flex-shrink: 0;
  border-radius: 8px;
  background-size: cover;
`;

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

interface Props {
  rankings: RankingI[];
  collectionInfo: any[];
}

interface Collection {
  contractId: number;
  totalSupply: number;
  uniqueOwners: number;
  creator: string;
  price: number;
  maxSupply: number;
  launchStart: number;
  launchEnd: number;
  image: string;
  name: string;
  description: string;
  activeListings: number;
  floorPrice: number | null;
}

interface Props {
  collections: Collection[];
}

type SortField =
  | "price"
  | "floorPrice"
  | "totalSupply"
  | "uniqueOwners"
  | "activeListings"
  | "launchStart";
type SortDirection = "asc" | "desc";

const NFTCollectionTable: React.FC<Props> = ({ collections = [] }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const resolver = useEnvoiResolver();

  // Add sort state
  const [sortField, setSortField] = useState<SortField>("activeListings");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Add state for creator names and profiles
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, any>>(
    {}
  );

  // Add effect to resolve creator names and profiles
  useEffect(() => {
    collections.forEach((collection) => {
      if (collection.creator) {
        resolver.http
          .getNameFromAddress(collection.creator)
          .then((res: string) => {
            if (!!res) {
              setCreatorNames((prev) => ({
                ...prev,
                [collection.creator]: res,
              }));
              resolver.http.search(res).then((searchRes: any) => {
                if (searchRes.length === 1) {
                  setCreatorProfiles((prev) => ({
                    ...prev,
                    [collection.creator]: searchRes[0],
                  }));
                }
              });
            } else {
              setCreatorNames((prev) => ({
                ...prev,
                [collection.creator]: compactAddress(collection.creator),
              }));
            }
          });
      }
    });
  }, [collections]);

  // Helper function for avatar background color
  const getColorFromAddress = (address: string) => {
    const hash = address.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  // Add sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Add sorted collections
  const sortedCollections = [...collections].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Update the table headers to be clickable
  const headers = [
    { label: "#", sortable: false },
    { label: "", sortable: false },
    { label: "Collection", sortable: false },
    { label: "Price", field: "price" as SortField, sortable: true },
    { label: "Floor", field: "floorPrice" as SortField, sortable: true },
    { label: "Supply", field: "totalSupply" as SortField, sortable: true },
    { label: "Owners", field: "uniqueOwners" as SortField, sortable: true },
    { label: "Listings", field: "activeListings" as SortField, sortable: true },
    { label: "Launch Date", field: "launchStart" as SortField, sortable: true },
    { label: "Creator", sortable: false },
  ];

  return (
    <TableContainer>
      <Table aria-label="collections table">
        <TableHead className="border-b">
          <TableRow>
            {headers.map((header, index) => (
              <StyledTableCell
                key={index}
                onClick={() => header.sortable && handleSort(header.field)}
                sx={{
                  cursor: header.sortable ? "pointer" : "default",
                  "&:hover": header.sortable
                    ? {
                        backgroundColor: isDarkTheme
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                      }
                    : {},
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2">{header.label}</Typography>
                  {header.sortable && header.field === sortField && (
                    sortDirection === "asc" ? (
                      <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                    )
                  )}
                </Box>
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCollections.map((collection, index) => (
            <TableRow key={collection.contractId}>
              <StyledTableCell component="th" scope="row">
                {index + 1}
              </StyledTableCell>
              <StyledTableCell>
                <StyledImage
                  sx={{
                    backgroundImage: `url(${
                      collection.image || "/placeholder.png"
                    })`,
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <Link
                  style={{ textDecoration: "none", color: "inherit" }}
                  to={`/collection/${collection.contractId}`}
                >
                  {collection.name || `Collection #${collection.contractId}`}
                </Link>
              </StyledTableCell>
              <StyledTableCell>
                {collection.price === 0
                  ? "-"
                  : collection.price.toLocaleString() + " VOI"}
              </StyledTableCell>
              <StyledTableCell>
                {collection.floorPrice === null
                  ? "-"
                  : collection.floorPrice.toLocaleString() + " VOI"}
              </StyledTableCell>
              <StyledTableCell>
                {`${collection.totalSupply}/${collection.maxSupply || "∞"}`}
              </StyledTableCell>
              <StyledTableCell>
                {collection.uniqueOwners || "-"}
              </StyledTableCell>
              <StyledTableCell>
                {collection.activeListings || "-"}
              </StyledTableCell>
              <StyledTableCell>
                {collection.launchStart
                  ? new Date(collection.launchStart * 1000).toLocaleDateString()
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {collection.creator && (
                  <Link
                    to={`/account/${collection.creator}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Chip
                      avatar={
                        <Avatar
                          src={
                            creatorProfiles[collection.creator]?.metadata
                              ?.avatar || undefined
                          }
                          alt={creatorNames[collection.creator] || ""}
                          sx={{
                            bgcolor: !creatorProfiles[collection.creator]
                              ?.metadata?.avatar
                              ? compactAddress(collection.creator) ===
                                creatorNames[collection.creator]
                                ? "silver"
                                : getColorFromAddress(collection.creator)
                              : undefined,
                          }}
                        >
                          {!creatorProfiles[collection.creator]?.metadata
                            ?.avatar &&
                            (creatorNames[collection.creator] ||
                              "")[0]?.toUpperCase()}
                        </Avatar>
                      }
                      label={creatorNames[collection.creator] || "-"}
                      variant="outlined"
                      sx={{
                        color: isDarkTheme ? "#fff" : "inherit",
                        borderColor: isDarkTheme
                          ? "rgba(255, 255, 255, 0.23)"
                          : "rgba(0, 0, 0, 0.23)",
                        "& .MuiChip-label": {
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />
                  </Link>
                )}
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NFTCollectionTable;
