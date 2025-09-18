import { createRoot } from 'react-dom/client';
import Page from './pages/prefix';
import './index.css';

createRoot(document.getElementById('app')!).render(<Page />);
