import { createRoot } from 'react-dom/client';
import Page from './pages/prompt';
import './index.css';

createRoot(document.getElementById('app')!).render(
  <Page />
)
