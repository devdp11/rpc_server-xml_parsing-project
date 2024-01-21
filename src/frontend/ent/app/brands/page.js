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
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchCountry, setSearchCountry] = useState("");
  const [totalBrands, setTotalBrands] = useState(0);

  const fetchBrands = async () => {
    try {
      const response = await api.GET(`/brands?page=${page}&itemsPerPage=${itemsPerPage}`);

      setBrands(response.data);
      setTotalBrands(response.total);

      const filtered = searchCountry
        ? response.data.filter((brand) =>
            brand.countryName.toLowerCase().includes(searchCountry.toLowerCase())
          )
        : response.data;
      
      setFilteredBrands(filtered);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page, itemsPerPage]);

  useEffect(() => {
    const filtered = searchCountry
      ? brands.filter((brand) =>
          brand.countryName.toLowerCase().includes(searchCountry.toLowerCase())
        )
      : brands;

    setFilteredBrands(filtered);
  }, [brands, searchCountry]);

  const renderBrandRows = () => {
    return filteredBrands.map((brand) => (
      <TableRow key={brand.id}>
        <TableCell component="td" scope="row">
          {brand.name}
        </TableCell>
        <TableCell component="td">{brand.countryName}</TableCell>
      </TableRow>
    ));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    setSearchCountry("");
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setPage(1);
  };

  const handleSearchCountryChange = (event) => {
    setSearchCountry(event.target.value);
    setPage(1);
  };

  return (
    <main>
      <h1>Brand's Page</h1>

      <TextField
        label="Search by Country"
        variant="outlined"
        value={searchCountry}
        onChange={handleSearchCountryChange}
        style={{ marginBottom: 16 }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "lightgray" }}>
              <TableCell component="th" width={"1px"} align="center">
                Name
              </TableCell>
              <TableCell>Country</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBrands.length > 0 ? (
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

      <div style={{ display: "flex", marginTop: 8 }}>
        <Pagination
          style={{ marginRight: 16 }}
          variant="outlined"
          shape="rounded"
          color="primary"
          onChange={handlePageChange}
          page={page}
          count={Math.ceil(totalBrands / itemsPerPage)}
        />

        <div style={{ textAlign: "center" }}>
          <label>
            Items per page:{" "}
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