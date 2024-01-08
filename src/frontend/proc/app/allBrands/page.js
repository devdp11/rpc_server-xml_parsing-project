// ./app/pages/models/page.js
// @ts-nocheck
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

function AllBrandsPage() {
  const { GET } = useAPI();

  const [procData, setProcData] = useState(null);

  useEffect(() => {
    GET(`/brands`)
      .then((result) => {
        if (result) {
          setProcData(result);
        } else {
          setProcData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setProcData([]);
      });
  }, []);
  
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h2" gutterBottom>
          All Brand's Page
        </Typography>

        {procData ? (
          <>
            <Typography variant="h5" gutterBottom>
              {procData.length > 0
                ? `Results from search`
                : `No brands found on database`}
            </Typography>

            {procData.map((item, index) => (
              index % 3 === 0 && (
                <Box key={index} display="flex" justifyContent="space-between" marginBottom="1rem">
                  {procData.slice(index, index + 3).map((brand, innerIndex) => (
                    <Paper key={innerIndex} elevation={3} sx={{ padding: "1rem", width: "30%" }}>
                      <ListItem>
                        <ListItemText primary={brand} />
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

export default AllBrandsPage;