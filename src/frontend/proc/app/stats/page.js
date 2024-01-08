"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  ListItem,
  ListItemText,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import useAPI from "../Hooks/useAPI";

function ModelsStatsPage() {
  const { GET } = useAPI();

  const [procData, setProcData] = useState(null);
  const [sortingOption, setSortingOption] = useState("asc");
  const [loading, setLoading] = useState(false);

  const handleSortingChange = (event) => {
    setSortingOption(event.target.value);
  };

  useEffect(() => {
    setLoading(true);
    GET(`/modelsStats?sort=${sortingOption}`)
        .then((result) => {
          console.log("API Result:", result);
          if (result) {
              const apidata = result.map((vehicle) => {
                  console.log("Vehicle Data:", vehicle);
                  return {
                      brand_name: vehicle.brand_name,
                      country_name: vehicle.country_name,
                      percentage: vehicle.percentage,
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

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Brand's Count Page
        </Typography>

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

        {procData ? (
          <>
            <Typography variant="h5" gutterBottom>
              {procData.length > 0
                ? `Results from search: Brands Count` : `No data found`}
            </Typography>
            {procData.map((item, index) => (
              <Paper key={index} elevation={3} sx={{ padding: "1rem", margin: "1rem" }}>
                <ListItem>
                  <ListItemText 
                    primary={`Brand: ${item.brand_name}, Country: ${item.country_name}, Percentage: ${item.percentage} `} 
                  />
                </ListItem>
              </Paper>
            ))}
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

export default ModelsStatsPage;