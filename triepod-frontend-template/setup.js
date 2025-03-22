const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Triepod Frontend setup process...');

try {
  // Create .npmrc file
  console.log('Creating .npmrc file...');
  fs.writeFileSync('.npmrc', `legacy-peer-deps=true
engine-strict=false
fund=false
`);

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Create sample src directory if it doesn't exist
  if (!fs.existsSync('src')) {
    console.log('Creating sample src directory...');
    fs.mkdirSync('src', { recursive: true });
    
    // Create App.tsx
    fs.writeFileSync('src/App.tsx', `import React from 'react';
import { Typography, Container, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Triepod Frontend Template
        </Typography>
        <Typography variant="body1">
          Welcome to the Triepod Frontend Template. This is a starting point for your React application.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
`);

    // Create index.tsx
    fs.writeFileSync('src/index.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);
  }

  console.log('Setup completed successfully!');
  console.log('You can now run "npm start" to start the development server.');
} catch (error) {
  console.error('Error during setup:', error.message);
}
