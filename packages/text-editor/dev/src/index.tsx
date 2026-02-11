import { createRoot } from 'react-dom/client';
import Page from './pages/code';
import './index.css';

createRoot(document.getElementById('app')!).render(<Page />);
