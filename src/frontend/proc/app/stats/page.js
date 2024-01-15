"use client"
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
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
        if (result) {
          const apidata = result.map((vehicle) => {
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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setProcData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sortingOption]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
          <p>{`Brand: ${payload[0].payload.brand_name}`}</p>
          <p>{`Country: ${payload[0].payload.country_name}`}</p>
          <p>{`Percentage: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

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

            <Box mt={4}>
              <BarChart width={800} height={400} data={procData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand_name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />}/>
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8">
                  {procData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#8884d"/>
                  ))}
                </Bar>
              </BarChart>
              
            </Box>
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