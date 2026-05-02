import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Chip, Box, Select, MenuItem, FormControl, InputLabel, Button, CircularProgress } from '@mui/material';
import { API_URL, JWT_AUTH } from '../config';
import { fetchReadStatus, flagAsRead } from '../utils';
import { Log } from 'logging_middleware';

export default function AllNotifications() {
  const [msgList, setMsgList] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // pull initial read state from local storage so it survives a refresh
  const [readIds, setReadIds] = useState(fetchReadStatus());

  const pullNotifs = async () => {
    setIsFetching(true);
    try {
      let targetUrl = `${API_URL}?page=${currentPage}&limit=10`;
      
      // append the category filter if the user isn't just looking at everything
      if (activeCategory !== 'All') {
        targetUrl += `&notification_type=${activeCategory}`;
      }
      
      const response = await fetch(targetUrl, {
        headers: { "Authorization": `Bearer ${JWT_AUTH}` }
      });
      
      if (!response.ok) throw new Error("Network hiccup during fetch");
      
      const parsed = await response.json();
      setMsgList(parsed.notifications || []);
      
      Log("frontend", "info", "api", `Pulled standard notifs for page ${currentPage}`);
    } catch (error) {
      Log("frontend", "error", "api", "Failed pulling standard notifs");
    } finally {
      setIsFetching(false);
    }
  };

  // re-run the fetch whenever the user flips a page or changes the dropdown
  useEffect(() => {
    pullNotifs();
  }, [currentPage, activeCategory]);

  const triggerReadState = (uid) => {
    flagAsRead(uid);
    setReadIds(fetchReadStatus());
    Log("frontend", "info", "component", "Marked item as viewed");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
        General Inbox
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter Category</InputLabel>
          <Select
            value={activeCategory}
            label="Filter Category"
            onChange={(e) => {
              setActiveCategory(e.target.value);
              setCurrentPage(1); // gotta reset to page 1 to prevent getting stuck on empty pages
              Log("frontend", "info", "component", `Switched category to ${e.target.value}`);
            }}
          >
            <MenuItem value="All">View Everything</MenuItem>
            <MenuItem value="Event">Events</MenuItem>
            <MenuItem value="Result">Results</MenuItem>
            <MenuItem value="Placement">Placements</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {msgList.map((item) => {
            const alreadySeen = readIds.includes(item.ID);
            
            return (
              <Card 
                key={item.ID} 
                variant="outlined" 
                sx={{ 
                  backgroundColor: alreadySeen ? '#fafafa' : '#ffffff',
                  borderLeft: alreadySeen ? '4px solid #d4d4d8' : '4px solid #2563eb',
                  transition: '0.2s',
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={item.Type} 
                        size="small" 
                        color={item.Type === 'Placement' ? 'success' : item.Type === 'Result' ? 'warning' : 'primary'} 
                      />
                      {!alreadySeen && <Chip label="New" size="small" color="error" variant="outlined" />}
                    </Box>
                    <Typography variant="body1" fontWeight={alreadySeen ? "normal" : "bold"}>
                      {item.Message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.Timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {!alreadySeen && (
                    <Button variant="outlined" size="small" onClick={() => triggerReadState(item.ID)}>
                      Mark Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {msgList.length === 0 && <Typography>Looks like there's nothing here.</Typography>}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} variant="contained" disableElevation>Prev</Button>
        <Typography sx={{ alignSelf: 'center' }}>Page {currentPage}</Typography>
        <Button disabled={msgList.length === 0 || msgList.length < 10} onClick={() => setCurrentPage(c => c + 1)} variant="contained" disableElevation>Next</Button>
      </Box>
    </Box>
  );
}
