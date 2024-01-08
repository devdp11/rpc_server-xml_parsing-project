"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import useAPI from "../Hooks/useAPI";
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

function VehiclesPage() {
  const { GET } = useAPI();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const defaultYear = "";

  const [procData, setProcData] = useState(null);
  const [sortingOption, setSortingOption] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleBrandChange = (event, newValue) => {
    setSelectedBrand(newValue);
    setProcData(null);
  
    if (newValue === "List All") {
      handleListAll();
    }
  };

  const handleSortingChange = (event) => {
    setSortingOption(event.target.value);
  
    if (selectedBrand === "List All") {
      handleListAll(event.target.value);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setProcData(null);
  
    if (selectedBrand === "List All") {
      handleListAll(sortingOption, year);
    } else if (selectedBrand) {
      handleBrandChange(null, selectedBrand);
    }
  };

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

  useEffect(() => {
    setLoading(true);
    GET("/brands")
      .then((result) => {
        if (result) {
          setBrands(["List All", ...result]);
          setSelectedBrand("List All");
          handleListAll();
        } else {
          setBrands([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
        setBrands([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    GET("/years")
      .then((result) => {
        if (result) {
          setYears([...result]);
        } else {
          setYears([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching years:", error);
        setYears([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleListAll = (sortOption = "asc", year = "All") => {
    setLoading(true);
    const yearParam = year && year !== "All" ? `&year=${year}` : `&year=${defaultYear}`;
    GET(`/vehicles?sort=${sortOption}${yearParam}`)
      .then((result) => {
        if (result) {
          const apidata = result.map((vehicle) => {
            return {
              brand_name: vehicle[0],
              model_name: vehicle[1],
              year: vehicle[2],
              engine_hp: vehicle[3],
              msrp: vehicle[4],
            };
          });
          setProcData(apidata);
          setSelectedBrand("List All");
        } else {
          setProcData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching all vehicles:", error);
        setProcData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedBrand && selectedBrand !== "List All") {
      setLoading(true);
      const yearParam = selectedYear && selectedYear !== "All" ? `&year=${selectedYear}` : `&year=${defaultYear}`;
      GET(`/vehiclesByBrand?brand_name=${selectedBrand}&sort=${sortingOption}${yearParam}`)
        .then((result) => {
          if (result) {
            const apidata = result.map((vehicle) => {
              return {
                brand_name: vehicle[0],
                model_name: vehicle[1],
                year: vehicle[2],
                engine_hp: vehicle[3],
                msrp: vehicle[4],
              };
            });
            setProcData(apidata);
          } else {
            setProcData([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setProcData([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedBrand, sortingOption, selectedYear]);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Vehicle's Page
        </Typography>
  
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Autocomplete
              id="brand-selector"
              options={brands}
              getOptionLabel={(option) => option.toString()}
              value={selectedBrand}
              onChange={handleBrandChange}
              renderInput={(params) => (
                <TextField {...params} label="Select a brand" variant="outlined" />
              )}
            />
          </Grid>
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
          <Grid item xs={3}>
            <Box>
              <Select
                value={selectedYear}
                onChange={(event) => handleYearChange(event.target.value)}
                variant="outlined"
                style={{ minWidth: 120 }}
              >
                <MenuItem value="All">All</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>
        </Grid>

        {procData ? (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Brand</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Engine HP</TableCell>
                  <TableCell>MSRP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.brand_name}</TableCell>
                    <TableCell>{item.model_name}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.engine_hp}</TableCell>
                    <TableCell>{item.msrp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
                  <MenuItem value={100}>100 per page</MenuItem>
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

export default VehiclesPage;