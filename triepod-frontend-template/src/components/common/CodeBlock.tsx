import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Paper, Typography, useTheme } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  showLineNumbers = true,
  maxHeight = '400px'
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        my: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Language label and copy button header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {language}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy code"}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Code content */}
      <Box
        sx={{
          maxHeight,
          overflow: 'auto',
        }}
      >
        <SyntaxHighlighter
          language={language || 'text'}
          style={tomorrow}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
            borderRadius: 0,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Paper>
  );
};

export default CodeBlock;
