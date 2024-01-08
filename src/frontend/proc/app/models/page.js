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

function ModelsPage() {
  const { GET } = useAPI();

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [procData, setProcData] = useState(null);
  const [brands, setBrands] = useState([]);

  const handleBrandChange = (event, newValue) => {
    setSelectedBrand(newValue);
  };

  useEffect(() => {
    GET("/brands")
      .then((result) => {
        if (result) {
          setBrands(result);
        } else {
          setBrands([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
        setBrands([]);
      });
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      GET(`/modelsByBrand?brand_name=${selectedBrand}`)
        .then((result) => {
          if (result) {
            const apidata = result.map((model) => {
              return { model: model };
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
  }, [selectedBrand]);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          Model's Page
        </Typography>

        <Autocomplete
          id="brand-selector"
          options={brands}
          getOptionLabel={(option) => option.toString()}
          value={selectedBrand}
          onChange={handleBrandChange}
          renderInput={(params) => (
            <TextField {...params} label="Select or Enter Brand" variant="outlined" />
          )}
        />

        {procData ? (
          <>
            <Typography variant="h5" gutterBottom>
              {procData.length > 0
                ? `Results from search: "${selectedBrand}"`
                : `No results from search: "${selectedBrand}"`}
            </Typography>

            {procData.map((item, index) => (
              index % 3 === 0 && (
                <Box key={index} display="flex" justifyContent="space-between" marginTop="2rem" marginBottom="1rem">
                  {procData.slice(index, index + 3).map((model, innerIndex) => (
                    <Paper key={innerIndex} elevation={3} sx={{ padding: "1rem", width: "30%" }}>
                      <ListItem>
                        <ListItemText primary={model.model} />
                      </ListItem>
                    </Paper>
                  ))}
                </Box>
              )
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

export default ModelsPage;