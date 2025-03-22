import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Send as SendIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useChatContext } from '../../contexts/ChatContext';
import { useModelContext } from '../../contexts/ModelContext';
import MessageList from './MessageList';

const ChatInterface: React.FC = () => {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error, 
    currentConversation,
    conversations,
    createNewConversation,
    loadConversation,
    deleteConversation
  } = useChatContext();
  const { selectedModel, modelParams } = useModelContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input field after loading
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation]);
  
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      bgcolor: theme.palette.background.default
    }}>
      {/* Conversation Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentConversation?.title || 'New Conversation'}
          </Typography>
        </Box>
        <Box>
          <IconButton 
            color="primary"
            onClick={createNewConversation}
            title="New Conversation"
          >
            <AddIcon />
          </IconButton>
          {currentConversation && (
            <IconButton 
              color="error"
              onClick={() => deleteConversation(currentConversation.id)}
              title="Delete Conversation"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
      
      {/* Messages List */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
        
        {/* Show loading indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* Show error if any */}
        {error && (
          <Box sx={{ 
            p: 2, 
            mt: 2, 
            bgcolor: '#FFEBEE', 
            borderRadius: 1,
            border: '1px solid #FFCDD2'
          }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </Box>
      
      {/* Input Box */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          m: 2, 
          display: 'flex', 
          alignItems: 'flex-end',
          bgcolor: theme.palette.background.paper
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          variant="outlined"
          inputRef={inputRef}
          disabled={isLoading}
          sx={{ mr: 1 }}
        />
        <Button 
          variant="contained" 
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
