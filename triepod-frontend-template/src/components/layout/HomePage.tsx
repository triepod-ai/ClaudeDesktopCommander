import React from 'react';
import { Grid, Paper, Box, useTheme } from '@mui/material';
import ChatInterface from '../chat/ChatInterface';
import ToolsPanel from '../tools/ToolsPanel';
import ModelControlPanel from '../models/ModelControlPanel';

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ height: 'calc(100vh - 88px)' }}>
      {/* Left Panel - Tools */}
      <Grid item xs={12} md={3} lg={2} sx={{ height: '100%' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <ToolsPanel />
        </Paper>
      </Grid>

      {/* Middle Panel - Chat */}
      <Grid item xs={12} md={6} lg={8} sx={{ height: '100%' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <ChatInterface />
        </Paper>
      </Grid>

      {/* Right Panel - Model Control */}
      <Grid item xs={12} md={3} lg={2} sx={{ height: '100%' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <ModelControlPanel />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomePage;
