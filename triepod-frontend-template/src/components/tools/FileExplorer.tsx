import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Divider,
  Paper,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  ArrowUpward as UpIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  CreateNewFolder as NewFolderIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { mcpService } from '../../services/mcp/mcpService';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

interface FileExplorerProps {
  initialPath?: string;
  onSelectFile?: (path: string) => void;
}

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  initialPath = 'C:\\', 
  onSelectFile 
}) => {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<FileItem[]>([]);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    item: FileItem | null;
  } | null>(null);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contents = await mcpService.listDirectory(path);
      
      // Parse directory listing format [FILE] or [DIR] prefix
      const parsedItems: FileItem[] = contents.map(item => {
        const isDir = item.startsWith('[DIR]');
        const name = isDir 
          ? item.substring(5).trim() 
          : item.startsWith('[FILE]') 
            ? item.substring(6).trim() 
            : item;
            
        return {
          name,
          path: `${path}\\${name}`.replace(/\\\\/g, '\\'),
          isDirectory: isDir
        };
      });
      
      // Sort directories first, then files
      parsedItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setItems(parsedItems);
      setFilteredItems(parsedItems);
    } catch (err) {
      setError((err as Error).message);
      // For development, create some mock items
      const mockItems: FileItem[] = [
        { name: 'Documents', path: `${path}\\Documents`, isDirectory: true },
        { name: 'Images', path: `${path}\\Images`, isDirectory: true },
        { name: 'readme.txt', path: `${path}\\readme.txt`, isDirectory: false },
        { name: 'config.json', path: `${path}\\config.json`, isDirectory: false },
      ];
      setItems(mockItems);
      setFilteredItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  // Load directory contents on path change
  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  // Filter items when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query)
    );
    
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const navigateToParent = () => {
    const lastBackslash = currentPath.lastIndexOf('\\');
    if (lastBackslash > 0) {
      // Get the parent directory
      const parentPath = currentPath.substring(0, lastBackslash);
      setCurrentPath(parentPath);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else if (onSelectFile) {
      onSelectFile(item.path);
    }
  };

  const handleRefresh = () => {
    loadDirectory(currentPath);
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    item: FileItem
  ) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      item,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!contextMenu?.item) return;
    
    // TODO: Implement file/directory deletion
    alert(`Delete ${contextMenu.item.name} not implemented yet`);
    
    handleCloseContextMenu();
    handleRefresh();
  };

  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split('\\').filter(Boolean);
    
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Typography 
          component="span" 
          variant="body2" 
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setCurrentPath(initialPath)}
        >
          Root
        </Typography>
        
        {pathParts.map((part, index) => {
          const path = pathParts.slice(0, index + 1).join('\\');
          const isLast = index === pathParts.length - 1;
          
          return isLast ? (
            <Typography key={path} color="text.primary" variant="body2">
              {part}
            </Typography>
          ) : (
            <Typography 
              key={path} 
              component="span" 
              variant="body2"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setCurrentPath(`${initialPath}\\${path}`)}
            >
              {part}
            </Typography>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with path and controls */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mr: 'auto' }}>
            File Explorer
          </Typography>
          
          <IconButton size="small" onClick={navigateToParent} title="Up">
            <UpIcon fontSize="small" />
          </IconButton>
          
          <IconButton size="small" onClick={handleRefresh} title="Refresh">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {renderBreadcrumbs()}
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      </Box>
      
      {/* File listing */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <LoadingIndicator message="Loading files..." />
        ) : error ? (
          <ErrorMessage 
            message="Error loading files" 
            details={error}
            onRetry={handleRefresh}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState 
            title="No files found"
            description={searchQuery ? "Try a different search term" : "This directory is empty"}
            icon={<FolderIcon />}
          />
        ) : (
          <List disablePadding>
            {filteredItems.map((item) => (
              <ListItem 
                key={item.path} 
                disablePadding
                onContextMenu={(e) => handleContextMenu(e, item)}
              >
                <ListItemButton onClick={() => handleItemClick(item)}>
                  <ListItemIcon>
                    {item.isDirectory ? (
                      <FolderIcon color="primary" />
                    ) : (
                      <FileIcon color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem 
          onClick={() => {
            if (contextMenu?.item && !contextMenu.item.isDirectory && onSelectFile) {
              onSelectFile(contextMenu.item.path);
            }
            handleCloseContextMenu();
          }}
          disabled={!contextMenu?.item || contextMenu.item.isDirectory}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Path</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default FileExplorer;
