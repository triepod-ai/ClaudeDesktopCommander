import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { AppSettings } from '../../types';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    apiEndpoints: {
      llm: 'http://localhost:8000/v1',
      mcp: 'http://localhost:3000',
      rag: 'http://localhost:8080',
    },
    theme: 'light',
    defaultModel: 'meta-llama-3-8b-instruct',
    defaultParameters: {
      temperature: 0.7,
      topP: 1.0,
      maxTokens: 1000,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
  });
  
  const [isSaved, setIsSaved] = useState(false);
  
  const handleEndpointChange = (key: keyof AppSettings['apiEndpoints'], value: string) => {
    setSettings({
      ...settings,
      apiEndpoints: {
        ...settings.apiEndpoints,
        [key]: value,
      },
    });
    setIsSaved(false);
  };
  
  const handleThemeChange = (event: any) => {
    setSettings({
      ...settings,
      theme: event.target.value,
    });
    setIsSaved(false);
  };
  
  const handleSaveSettings = () => {
    // TODO: Save settings to local storage or API
    console.log('Saving settings:', settings);
    
    // Show saved notification
    setIsSaved(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      {isSaved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* API Endpoints */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Endpoints
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="LLM Framework API"
                value={settings.apiEndpoints.llm}
                onChange={(e) => handleEndpointChange('llm', e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                helperText="Custom LLM framework OpenAI-compatible API endpoint"
              />
              
              <TextField
                label="MCP Server API"
                value={settings.apiEndpoints.mcp}
                onChange={(e) => handleEndpointChange('mcp', e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                helperText="MCP server API endpoint for tools and file operations"
              />
              
              <TextField
                label="RAG Agent API"
                value={settings.apiEndpoints.rag}
                onChange={(e) => handleEndpointChange('rag', e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                helperText="RAG agent API endpoint for knowledge retrieval"
              />
            </Stack>
          </Paper>
        </Grid>
        
        {/* UI Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              UI Settings
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="theme-select-label">Theme</InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                value={settings.theme}
                label="Theme"
                onChange={handleThemeChange}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Interface Options
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={true} 
                  onChange={() => {}} 
                  color="primary"
                />
              }
              label="Show tools panel by default"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={true} 
                  onChange={() => {}} 
                  color="primary"
                />
              }
              label="Show model settings panel by default"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={true} 
                  onChange={() => {}} 
                  color="primary"
                />
              }
              label="Enable code syntax highlighting"
            />
          </Paper>
        </Grid>
        
        {/* Default Parameters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Default Model Parameters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Default Model"
                  value={settings.defaultModel}
                  onChange={(e) => setSettings({...settings, defaultModel: e.target.value})}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Temperature"
                  type="number"
                  value={settings.defaultParameters.temperature}
                  onChange={(e) => setSettings({
                    ...settings, 
                    defaultParameters: {
                      ...settings.defaultParameters,
                      temperature: parseFloat(e.target.value)
                    }
                  })}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  inputProps={{ step: 0.1, min: 0, max: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Top P"
                  type="number"
                  value={settings.defaultParameters.topP}
                  onChange={(e) => setSettings({
                    ...settings, 
                    defaultParameters: {
                      ...settings.defaultParameters,
                      topP: parseFloat(e.target.value)
                    }
                  })}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  inputProps={{ step: 0.1, min: 0, max: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Max Tokens"
                  type="number"
                  value={settings.defaultParameters.maxTokens}
                  onChange={(e) => setSettings({
                    ...settings, 
                    defaultParameters: {
                      ...settings.defaultParameters,
                      maxTokens: parseInt(e.target.value)
                    }
                  })}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
