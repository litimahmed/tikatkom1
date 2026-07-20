import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Wait until the browser fully creates the shortcode [tikatkom_app] DOM element
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(<App />);
  } else {
    console.error("React could not locate the root element on the page skeleton.");
  }
});

