"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import useAPI from "../Hooks/useAPI";
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

function ModelsCountPage() {
  const { GET } = useAPI();

  const [procData, setProcData] = useState(null);
  const [sortingOption, setSortingOption] = useState("asc");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleSortingChange = (event) => {
    setSortingOption(event.target.value);
  };

  useEffect(() => {
    setLoading(true);
    GET(`/modelsCount?sort=${sortingOption}`)
        .then((result) => {
            if (result) {
                const apidata = result.map((vehicle) => {
                    return {
                        brand_name: vehicle[0],
                        model_name: vehicle[1],
                        country_name: vehicle[2],
                        num_models: vehicle[3],
                    };
                });
                setProcData(apidata);
            } else {
                setProcData([]);
            }
        }) .catch((error) => {
            console.error("Error fetching data:", error);
            setProcData([]);
        }) .finally(() => {
            setLoading(false);
        });
  }, [sortingOption]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = procData ? procData.slice(indexOfFirstItem, indexOfLastItem) : [];

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Model's Count Page
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Box>
              <Select
                value={sortingOption}
                onChange={handleSortingChange}
                variant="outlined"
                style={{ minWidth: 80 }}
              >
                <MenuItem value="asc">ASC</MenuItem>
                <MenuItem value="desc">DESC</MenuItem>
              </Select>
            </Box>
          </Grid>
        </Grid>

        {procData ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.brand_name}</TableCell>
                      <TableCell>{item.model_name}</TableCell>
                      <TableCell>{item.country_name}</TableCell>
                      <TableCell>{item.num_models}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="body2">
                  Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, procData.length)} of {procData.length} results
                </Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                  <FirstPage />
                </IconButton>
                <IconButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton onClick={() => handlePageChange(currentPage + 1)} disabled={indexOfLastItem >= procData.length}>
                  <KeyboardArrowRight />
                </IconButton>
                <IconButton onClick={() => handlePageChange(Math.ceil(procData.length / itemsPerPage))} disabled={currentPage === Math.ceil(procData.length / itemsPerPage)}>
                  <LastPage />
                </IconButton>
              </Grid>
              <Grid item>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  variant="outlined"
                  style={{ minWidth: 80 }}
                >
                  <MenuItem value={25}>25 per page</MenuItem>
                  <MenuItem value={50}>50 per page</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <CircularProgress />
            )}
          </div>
        )}
      </Box>
    </Container>
  );
}

export default ModelsCountPage;