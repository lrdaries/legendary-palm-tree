import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SSRProvider } from './components/SSRProvider'
import './index.css'

// Get SSR data from window if available
const getInitialData = () => {
  if (typeof window !== 'undefined') {
    return (window as any).__INITIAL_DATA__ || null;
  }
  return null;
};

const getInitialError = () => {
  if (typeof window !== 'undefined') {
    return (window as any).__INITIAL_ERROR__ || null;
  }
  return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SSRProvider initialData={getInitialData()} initialError={getInitialError()}>
      <App />
    </SSRProvider>
  </React.StrictMode>,
)
