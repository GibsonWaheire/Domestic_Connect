import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/globalErrorHandler' // Initialize global error handling

const rootElement = document.getElementById("root")!;
// Use hydrateRoot when pre-rendered HTML exists (from react-snap), createRoot otherwise
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
