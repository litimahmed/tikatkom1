import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const renderApp = () => {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(<App />);
  } else {
    console.error("React could not locate the root element on the page skeleton.");
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}


