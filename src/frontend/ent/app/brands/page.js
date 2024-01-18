"use client"
import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import useApi from "../Hooks/useAPI";

export default function BrandsPage() {
  const api = useApi();
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchCountry, setSearchCountry] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);

  const fetchBrands = async () => {
    try {
      let endpoint = "/brands";

      if (searchCountry) {
        endpoint = `/brands/country/${encodeURIComponent(searchCountry)}`;
      }

      const response = await api.GET(endpoint);
      setBrands(response);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [searchCountry]);

  useEffect(() => {
    const filtered = searchCountry
      ? brands.filter((brand) =>
          brand.countryName.toLowerCase().includes(searchCountry.toLowerCase())
        )
      : brands;

    setFilteredBrands(filtered);
  }, [brands, searchCountry]);

  const renderBrandRows = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredBrands.slice(startIndex, endIndex).map((brand) => (
      <TableRow key={brand.id}>
        <TableCell component="td" scope="row">
          {brand.name}
        </TableCell>
        <TableCell component="td">
          {brand.countryName}
        </TableCell>
      </TableRow>
    ));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchCountry(event.target.value);
  };

  return (
    <main>
      <h1>Brand's Page</h1>

      <TextField
        label="Search by Country"
        variant="outlined"
        value={searchCountry}
        onChange={handleSearchChange}
        style={{ marginBottom: 16 }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "lightgray" }}>
              <TableCell component="th" width={"1px"} align="center">
                Name
              </TableCell>
              <TableCell>
                Country
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.length > 0 ? (
              renderBrandRows()
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ display: 'flex', marginTop: 8 }}>
        <Pagination
          style={{ marginRight: 16 }}
          variant="outlined"
          shape="rounded"
          color="primary"
          onChange={handlePageChange}
          page={page}
          count={Math.ceil(filteredBrands.length / itemsPerPage)}
        />

        <div style={{ textAlign: 'center' }}>
          <label>
            Items per page:{' '}
            <select onChange={handleItemsPerPageChange} value={itemsPerPage}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
      </div>
    </main>
  );
}
