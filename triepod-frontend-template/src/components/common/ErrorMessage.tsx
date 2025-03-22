import React from 'react';
import { Box, Alert, AlertTitle, Button, Typography, useTheme } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  details,
  onRetry
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ my: 2 }}>
      <Alert 
        severity="error" 
        variant="outlined"
        sx={{
          borderWidth: '1px',
          '& .MuiAlert-icon': {
            alignItems: 'center'
          }
        }}
        action={
          onRetry && (
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{message}</AlertTitle>
        
        {details && (
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              mt: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            {details}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
