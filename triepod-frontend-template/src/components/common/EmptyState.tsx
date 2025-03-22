import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon,
  actionText,
  onAction
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        my: 2,
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.default,
      }}
    >
      {icon && (
        <Box 
          sx={{ 
            mb: 2,
            color: theme.palette.text.secondary,
            '& svg': {
              width: 48,
              height: 48,
            }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
        {description}
      </Typography>
      
      {actionText && onAction && (
        <Button 
          variant="contained" 
          color="primary"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
