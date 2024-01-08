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
} from "@mui/material";
import useApi from "../Hooks/useAPI";

export default function BrandsPage() {
  const api = useApi();
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchModels = async () => {
    try {
      const response = await api.GET(`/models`);
      setModels(response);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.GET(`/brands`);
      setBrands(response);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const renderModelsRows = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return models.slice(startIndex, endIndex).map((model) => (
      <TableRow key={model.id}>
        <TableCell component="td" scope="row">
          {model.name}
        </TableCell>
        <TableCell component="td">
          {model.brandName}
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

  return (
    <main>
      <h1>Model's Page</h1>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "lightgray" }}>
              <TableCell component="th" width={"1px"} align="center">
                Name
              </TableCell>
              <TableCell>
                Brand
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.length > 0 ? (
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

      <div style={{ display: 'flex', marginTop: 8 }}>
            <Pagination
            style={{ marginRight: 16 }}
            variant="outlined"
            shape="rounded"
            color="primary"
            onChange={handlePageChange}
            page={page}
            count={Math.ceil(models.length / itemsPerPage)}
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