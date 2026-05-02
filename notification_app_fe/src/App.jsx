import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';
import { configureLoggerAuth, Log } from 'logging_middleware';
import { JWT_AUTH } from './config';

// lock in the auth token globally BEFORE any React components render
configureLoggerAuth(JWT_AUTH);

// setting up a clean layout theme
const customTheme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, // a nice subtle blue
    secondary: { main: '#e11d48' },
    background: { default: '#f8fafc' } // slightly off-white for better readability
  },
});

function TopNavbar() {
  const currentPath = useLocation();
  
  useEffect(() => {
    // tracking page movements without spamming the local console
    Log("frontend", "info", "page", `User jumped to ${currentPath.pathname}`);
  }, [currentPath]);

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
          Campus Comm
        </Typography>
        <Button color="inherit" component={Link} to="/">Inbox</Button>
        <Button color="inherit" component={Link} to="/priority">High Priority</Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  useEffect(() => {
    Log("frontend", "info", "component", "App root initialized successfully");
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <BrowserRouter>
        <TopNavbar />
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
          <Routes>
            <Route path="/" element={<AllNotifications />} />
            <Route path="/priority" element={<PriorityInbox />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
