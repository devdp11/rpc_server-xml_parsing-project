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

export default function StylesPage() {
  const api = useApi();
  const [styles, setStyles] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalStyles, setTotalStyles] = useState(0);

  const fetchStyles = async () => {
    try {
      const response = await api.GET(`/styles?page=${page}&itemsPerPage=${itemsPerPage}`);
      setStyles(response.data);
      setTotalStyles(response.total);
    } catch (error) {
      console.error("Error fetching styles:", error);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, [page, itemsPerPage]);

  const renderStylesRows = () => {
    return styles.map((style) => (
      <TableRow key={style.id}>
        <TableCell component="td" scope="row">
          {style.name}
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
      <h1>Style's Page</h1>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "lightgray" }}>
              <TableCell component="th" width={"1px"} align="center">
                Name
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {styles.length > 0 ? (
              renderStylesRows()
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
          count={Math.ceil(totalStyles / itemsPerPage)}
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