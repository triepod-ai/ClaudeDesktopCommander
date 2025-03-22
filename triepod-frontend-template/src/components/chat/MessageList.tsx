import React from 'react';
import { Box, Typography, Avatar, Paper, useTheme } from '@mui/material';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Person as PersonIcon,
  Android as AssistantIcon 
} from '@mui/icons-material';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const theme = useTheme();
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Custom components for markdown
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        opacity: 0.6
      }}>
        <Typography variant="body1" color="textSecondary" align="center">
          No messages yet. Start a conversation!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            mb: 2,
            alignItems: 'flex-start',
          }}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              bgcolor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
              mr: 1,
            }}
          >
            {message.role === 'assistant' ? <AssistantIcon /> : <PersonIcon />}
          </Avatar>
          
          {/* Message Content */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              maxWidth: '85%',
              backgroundColor: message.role === 'assistant' 
                ? theme.palette.background.paper
                : `${theme.palette.primary.main}15`,
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" component="span" fontWeight="bold">
                {message.role === 'assistant' ? 'Assistant' : 'You'}
              </Typography>
              <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                {formatTimestamp(message.timestamp)}
              </Typography>
            </Box>
            
            <Box className="markdown-content">
              <ReactMarkdown components={components}>
                {message.content}
              </ReactMarkdown>
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default MessageList;
