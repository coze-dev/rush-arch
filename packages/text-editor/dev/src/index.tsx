import { createRoot } from 'react-dom/client';
import Page from './pages/chat';
import './index.css';

createRoot(document.getElementById('app')!).render(<Page />);
