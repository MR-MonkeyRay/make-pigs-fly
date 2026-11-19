import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n';
import { App } from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

if (typeof console !== 'undefined') {
  console.log(
    `%c
   makepigs.fly — Yes, pigs actually fly now.
         _,,_
       ,'    \`.      ___
      /  ^  ^  \\____/   \\  < Oink. Your move. >
     (  ( oo )       ___/
      \\  \`--'      /
       \`--u----u--'
`,
    'color: #E05383; font-weight: 600; font-family: monospace; font-size: 12px;'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
