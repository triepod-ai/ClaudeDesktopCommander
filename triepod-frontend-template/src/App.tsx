import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './components/layout/HomePage';
import SettingsPage from './components/settings/SettingsPage';

// Context Providers
import { ModelProvider } from './contexts/ModelContext';
import { ChatProvider } from './contexts/ChatContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { RagProvider } from './contexts/RagContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ModelProvider>
        <ToolsProvider>
          <ChatProvider>
            <RagProvider>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </AppLayout>
            </RagProvider>
          </ChatProvider>
        </ToolsProvider>
      </ModelProvider>
    </BrowserRouter>
  );
};

export default App;
