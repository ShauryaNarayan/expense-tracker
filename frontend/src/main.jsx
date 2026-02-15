import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // This import is crucial!

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  {/* This is the bubble that makes context work! */}
      <App />
    </AuthProvider>
  </StrictMode>,
);