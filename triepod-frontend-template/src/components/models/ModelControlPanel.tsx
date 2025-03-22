import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  TextField, 
  Paper, 
  Divider,
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useModelContext } from '../../contexts/ModelContext';

const ModelControlPanel: React.FC = () => {
  const theme = useTheme();
  const { 
    models, 
    selectedModel, 
    setSelectedModel, 
    modelParams, 
    setModelParams,
    loading,
    error
  } = useModelContext();
  
  const handleModelChange = (event: any) => {
    const modelId = event.target.value;
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };
  
  const formatSliderValue = (value: number) => {
    return value.toFixed(2);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Loading models...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Model Settings
      </Typography>
      
      {/* Model Selection */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="subtitle2" gutterBottom>Model Selection</Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="model-select-label">Selected Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel?.id || ''}
            label="Selected Model"
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name || model.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedModel && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Provider: {selectedModel.provider || 'Unknown'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Backend:
              </Typography>
              <Chip 
                label={selectedModel.backend || 'default'} 
                size="small" 
                sx={{ ml: 1 }} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Context Length: {selectedModel.contextLength.toLocaleString()} tokens
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Generation Parameters */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="subtitle2" gutterBottom>Generation Parameters</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Temperature: {modelParams.temperature.toFixed(2)}
          </Typography>
          <Slider
            size="small"
            value={modelParams.temperature}
            min={0}
            max={2}
            step={0.01}
            onChange={(_, value) => setModelParams({ temperature: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderValue}
          />
          <Typography variant="caption" color="text.secondary">
            Higher values make output more random, lower values more deterministic
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Top P: {modelParams.topP.toFixed(2)}
          </Typography>
          <Slider
            size="small"
            value={modelParams.topP}
            min={0}
            max={1}
            step={0.01}
            onChange={(_, value) => setModelParams({ topP: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderValue}
          />
          <Typography variant="caption" color="text.secondary">
            Controls diversity via nucleus sampling
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" gutterBottom>
            Max Tokens
          </Typography>
          <TextField
            type="number"
            size="small"
            fullWidth
            value={modelParams.maxTokens}
            onChange={(e) => setModelParams({ maxTokens: parseInt(e.target.value) || 0 })}
            InputProps={{ inputProps: { min: 1, max: selectedModel?.contextLength || 4096 } }}
          />
          <Typography variant="caption" color="text.secondary">
            Maximum number of tokens to generate
          </Typography>
        </Box>
      </Paper>
      
      {/* Additional Parameters */}
      <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="subtitle2" gutterBottom>Advanced Settings</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Presence Penalty: {modelParams.presencePenalty?.toFixed(2) || 0}
          </Typography>
          <Slider
            size="small"
            value={modelParams.presencePenalty || 0}
            min={-2}
            max={2}
            step={0.01}
            onChange={(_, value) => setModelParams({ presencePenalty: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderValue}
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" gutterBottom>
            Frequency Penalty: {modelParams.frequencyPenalty?.toFixed(2) || 0}
          </Typography>
          <Slider
            size="small"
            value={modelParams.frequencyPenalty || 0}
            min={-2}
            max={2}
            step={0.01}
            onChange={(_, value) => setModelParams({ frequencyPenalty: value as number })}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderValue}
          />
        </Box>
      </Paper>
      
      {error && (
        <Box sx={{ 
          p: 2, 
          mt: 2, 
          bgcolor: '#FFEBEE', 
          borderRadius: 1,
          border: '1px solid #FFCDD2'
        }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ModelControlPanel;
