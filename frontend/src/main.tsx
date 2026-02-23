import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/globalErrorHandler' // Initialize global error handling

createRoot(document.getElementById("root")!).render(<App />);
