import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Button, 
  TextField, 
  CircularProgress,
  Paper,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Terminal as TerminalIcon,
  Code as CodeIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { useToolsContext } from '../../contexts/ToolsContext';

const ToolsPanel: React.FC = () => {
  const theme = useTheme();
  const { tools, executeCommand, commandResults, loading, error } = useToolsContext();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, Record<string, any>>>({});
  
  // Group tools by category
  const toolsByCategory = tools.reduce((acc: Record<string, any[]>, tool) => {
    const category = tool.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {});
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'terminal':
        return <TerminalIcon />;
      case 'filesystem':
        return <FolderIcon />;
      case 'edit':
        return <CodeIcon />;
      case 'search':
        return <SearchIcon />;
      default:
        return <BuildIcon />;
    }
  };
  
  const handleExecute = (toolName: string) => {
    executeCommand(toolName, toolParams[toolName] || {});
  };
  
  const handleParamChange = (toolName: string, paramName: string, value: any) => {
    setToolParams(prev => ({
      ...prev,
      [toolName]: {
        ...(prev[toolName] || {}),
        [paramName]: value
      }
    }));
  };
  
  const formatResult = (result: any) => {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return result;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Tools
      </Typography>
      
      {Object.keys(toolsByCategory).length === 0 ? (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Loading available tools...
          </Typography>
        </Box>
      ) : (
        Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <Accordion 
            key={category}
            expanded={expandedCategory === category}
            onChange={() => setExpandedCategory(expandedCategory === category ? null : category)}
            disableGutters
            sx={{ mb: 1 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: theme.palette.background.paper,
                '&:hover': { bgcolor: theme.palette.action.hover }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, color: theme.palette.primary.main }}>
                  {getCategoryIcon(category)}
                </Box>
                <Typography variant="subtitle1">{category}</Typography>
                <Chip 
                  label={categoryTools.length} 
                  size="small" 
                  sx={{ ml: 1 }} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Divider />
              {categoryTools.map(tool => (
                <Paper
                  key={tool.name}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 1,
                    '&:hover': { bgcolor: `${theme.palette.primary.main}08` }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tool.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tool.description}
                  </Typography>
                  
                  {/* Parameter inputs */}
                  {tool.parameters && Object.entries(tool.parameters).map(([paramName, paramDetails]) => {
                    // Type assertion for paramDetails
                    const typedParamDetails = paramDetails as { 
                      description?: string; 
                      required?: boolean; 
                      type?: string;
                    };
                    
                    return (
                      <TextField
                        key={paramName}
                        label={paramName}
                        size="small"
                        fullWidth
                        margin="dense"
                        value={(toolParams[tool.name]?.[paramName] || '')}
                        onChange={(e) => handleParamChange(tool.name, paramName, e.target.value)}
                        helperText={typedParamDetails.description}
                        required={typedParamDetails.required}
                      />
                    );
                  })}
                  
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="small"
                      onClick={() => handleExecute(tool.name)}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Execute'}
                    </Button>
                  </Box>
                  
                  {/* Results display if available */}
                  {commandResults[tool.name] && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 1, 
                      bgcolor: theme.palette.background.default, 
                      borderRadius: 1,
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <Typography variant="caption" color="text.secondary">Result:</Typography>
                      <Box 
                        component="pre" 
                        sx={{ 
                          m: 0, 
                          p: 1, 
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto'
                        }}
                      >
                        {formatResult(commandResults[tool.name])}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
      
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

export default ToolsPanel;
