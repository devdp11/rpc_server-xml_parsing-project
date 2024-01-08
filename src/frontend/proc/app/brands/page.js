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
  Autocomplete,
  TextField,
} from "@mui/material";
import useAPI from "../Hooks/useAPI";

function BrandsPage() {
  const { GET } = useAPI();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [procData, setProcData] = useState(null);
  const [countries, setCountries] = useState([]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
  };

  useEffect(() => {
    GET("/countries")
      .then((result) => {
        if (result) {
          setCountries(result);
        } else {
          setCountries([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
        setCountries([]);
      });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      GET(`/brandsByCountry?country_name=${selectedCountry}`)
        .then((result) => {
          if (result) {
            const apidata = result.map((brand) => {
              return { brand: brand };
            });
            setProcData(apidata);
          } else {
            setProcData([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setProcData([]);
        });
    }
  }, [selectedCountry]);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Brand's Page
        </Typography>

        <Autocomplete
          id="country-selector"
          options={countries}
          getOptionLabel={(option) => option.toString()}
          value={selectedCountry}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField {...params} label="Select or enter a country" variant="outlined" />
          )}
        />

        {procData ? (
          <>
            <Typography variant="h5" gutterBottom>
              {procData.length > 0
                ? `Results from search: "${selectedCountry}"`
                : `No brand found from country "${selectedCountry}"`}
            </Typography>
            {procData.map((item, index) => (
              <Paper key={index} elevation={3} sx={{ padding: "1rem", margin: "1rem" }}>
                <ListItem>
                  <ListItemText primary={item.brand} />
                </ListItem>
              </Paper>
            ))}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <CircularProgress />
          </div>
        )}
      </Box>
    </Container>
  );
}

export default BrandsPage;