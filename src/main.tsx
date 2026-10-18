import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for instant offline launch and restart
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.location.reload();
    },
    onOfflineReady() {
      console.log('Comfort Hub is 100% offline ready.');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
