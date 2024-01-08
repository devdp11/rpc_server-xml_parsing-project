"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import useAPI from "../Hooks/useAPI";

function VehicleCountPage() {
  const { GET } = useAPI();

  const [procData, setProcData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    GET(`/vehiclesCountByCountry`)
        .then((result) => {
            if (result) {
                const apidata = result.map((vehicle) => {
                    return {
                      country_name: vehicle[0],
                      num_brands: vehicle[1],
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
  }, []);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Vehicle's By Country Page
        </Typography>
  
        {procData && procData.length > 0 ? (
          <>
            <Typography variant="h5" gutterBottom>
              Results from search:
            </Typography>
            {procData.map((item, index) => (
              <Paper key={index} elevation={3} sx={{ padding: "1rem", margin: "1rem" }}>
                <ListItem>
                  <ListItemText 
                    primary={`Country: ${item.country_name}, Vehicle Count: ${item.num_brands} `}
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
              <Typography variant="h5" gutterBottom>
                No vehicles found
              </Typography>
            )}
          </div>
        )}
      </Box>
    </Container>
  );
}

export default VehicleCountPage;