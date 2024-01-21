"use client";
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

export default function VehiclesPage() {
  const api = useApi();
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchBrand, setSearchBrand] = useState("");
  const [totalVehicles, setTotalVehicles] = useState(0);

  const fetchVehicles = async () => {
    try {
      const response = await api.GET(`/vehicles?page=${page}&itemsPerPage=${itemsPerPage}`);
      setVehicles(response.data);
      setTotalVehicles(response.total);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, itemsPerPage]);

  const renderVehiclesRows = () => {
    return vehicles.map((vehicle) => (
      <TableRow key={vehicle.id}>
        <TableCell component="td" scope="row">
          {vehicle.brandName}
        </TableCell>
        <TableCell component="td">{vehicle.modelName}</TableCell>
        <TableCell component="td">{vehicle.year}</TableCell>
        <TableCell component="td">{vehicle.horsepower}</TableCell>
        <TableCell component="td">{vehicle.cylinders}</TableCell>
        <TableCell component="td">{vehicle.doors}</TableCell>
        <TableCell component="td">{vehicle.styleName}</TableCell>
        <TableCell component="td">{vehicle.highway_mpg}</TableCell>
        <TableCell component="td">{vehicle.city_mpg}</TableCell>
        <TableCell component="td">{vehicle.popularity}</TableCell>
        <TableCell component="td">{vehicle.msrp}</TableCell>
      </TableRow>
    ));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setPage(1);
  };

  const handleSearchBrandChange = (event) => {
    setSearchBrand(event.target.value);
    setPage(1);
  };

  return (
    <main>
      <h1>Vehicle's Page</h1>

      <TextField
        label="Search by Brand"
        variant="outlined"
        value={searchBrand}
        onChange={handleSearchBrandChange}
        style={{ marginBottom: 16 }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "lightgray" }}>
              <TableCell component="th" width={"1px"} align="center">
                Brand
              </TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Horsepower</TableCell>
              <TableCell>Cylinders</TableCell>
              <TableCell>Nº Doors</TableCell>
              <TableCell>Style</TableCell>
              <TableCell>MPG Highway</TableCell>
              <TableCell>MPG City</TableCell>
              <TableCell>Popularity</TableCell>
              <TableCell>Based MSRP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.length > 0 ? (
              renderVehiclesRows()
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
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
          count={Math.ceil(totalVehicles / itemsPerPage)}
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