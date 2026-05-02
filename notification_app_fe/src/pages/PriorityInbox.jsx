import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Chip, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { API_URL, JWT_AUTH } from '../config';
import { fetchReadStatus, rankItemsDesc } from '../utils';
import { Log } from 'logging_middleware';

export default function PriorityInbox() {
  const [rankedItems, setRankedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [seenIds] = useState(fetchReadStatus());

  const gatherTopPriorityItems = async () => {
    setIsLoading(true);
    try {
      // using the exact limit the user requested and enforcing page=1 so the API doesn't throw a 400 error
      let fetchUrl = `${API_URL}?page=1&limit=${maxCount}`; 
      
      if (categoryFilter !== 'All') {
        fetchUrl += `&notification_type=${categoryFilter}`;
      }
      
      const apiResponse = await fetch(fetchUrl, {
        headers: { "Authorization": `Bearer ${JWT_AUTH}` }
      });
      
      if (!apiResponse.ok) throw new Error("API hit failed");
      const resultData = await apiResponse.json();
      
      let rawList = resultData.notifications || [];
      // execute the business logic: sort heavily by weight and slice off the requested count
      rawList = rawList.sort(rankItemsDesc).slice(0, maxCount);
      
      setRankedItems(rawList);
      Log("frontend", "info", "api", `Processed top ${maxCount} high-priority records`);
    } catch (err) {
      Log("frontend", "error", "api", "Priority fetch completely failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    gatherTopPriorityItems();
  }, [maxCount, categoryFilter]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
        Urgent & Priority
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Show Top</InputLabel>
          <Select
            value={maxCount}
            label='Show Top'
            onChange={(e) => {
              setMaxCount(e.target.value);
              Log("frontend", "info", "component", `Adjusted priority view limit to ${e.target.value}`);
            }}
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={categoryFilter}
            label="Type"
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              Log("frontend", "info", "component", `Set priority type filter to ${e.target.value}`);
            }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rankedItems.map((item, index) => {
            const hasBeenRead = seenIds.includes(item.ID);
            
            return (
              <Card 
                key={item.ID} 
                variant="outlined" 
                sx={{ 
                  backgroundColor: hasBeenRead ? '#fafafa' : '#fffbeb', // slight yellow tint for unread urgent stuff
                  borderLeft: '4px solid #f59e0b',
                  position: 'relative',
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <CardContent>
                  <Typography variant="caption" sx={{ position: 'absolute', top: 8, right: 12, fontWeight: 'bold', color: '#f59e0b' }}>
                    Rank #{index + 1}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={item.Type} 
                      size="small" 
                      color={item.Type === 'Placement' ? 'success' : item.Type === 'Result' ? 'warning' : 'primary'} 
                    />
                    {!hasBeenRead && <Chip label="New" size="small" color="error" variant="outlined" />}
                  </Box>
                  
                  <Typography variant="body1" fontWeight="bold">
                    {item.Message}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.Timestamp).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
          
          {rankedItems.length === 0 && <Typography>Zero high-priority items matched your filters.</Typography>}
        </Box>
      )}
    </Box>
  );
}
