import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n';
import { App } from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

// Playful DevTools Console Easter Egg for curious engineers
if (typeof console !== 'undefined') {
  console.log(
    `%c
   ✈ PORCINE AVIATION ADMINISTRATION (P.A.A.) — MAKEPIGS.FLY
         _,,_
       ,'    \`.      ___
      /  o  o  \\____/   \\  < OINK! CLEARED FOR TAKEOFF! >
     (  ( oo )       ___/
      \\  \`--'      /
       \`--u----u--'
   Secret Clearance: Try the Konami Code (↑↑↓↓←→←→BA) or click the P.A.A. logo 5×!
`,
    'color: #FF4D1C; font-weight: bold; font-family: monospace; font-size: 12px;'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
