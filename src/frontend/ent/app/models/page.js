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

export default function ModelsPage() {
  const api = useApi();
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchBrand, setSearchBrand] = useState("");
  const [totalModels, setTotalModels] = useState(0);

  const fetchModels = async () => {
    try {
      const response = await api.GET(`/models?page=${page}&itemsPerPage=${itemsPerPage}`);
      setModels(response.data);
      setTotalModels(response.total);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [page, itemsPerPage]);

  useEffect(() => {
    const filtered = searchBrand
      ? models.filter((model) =>
          model.brandName.toLowerCase().includes(searchBrand.toLowerCase())
        )
      : models;

    setFilteredModels(filtered);
  }, [models, searchBrand]);

  const renderModelsRows = () => {
    return filteredModels.map((model) => (
      <TableRow key={model.id}>
        <TableCell component="td" scope="row">
          {model.name}
        </TableCell>
        <TableCell component="td">{model.brandName}</TableCell>
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
      <h1>Model's Page</h1>

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
                Name
              </TableCell>
              <TableCell>Brand</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModels.length > 0 ? (
              renderModelsRows()
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
          count={Math.ceil(totalModels / itemsPerPage)}
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
