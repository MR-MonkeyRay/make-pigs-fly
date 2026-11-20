import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/print.css';
import { I18nProvider } from './i18n';
import { App } from './App';

try {
  window.history.scrollRestoration = 'manual';
} catch {
  /* ignore */
}

console.log(
  `%c
        ,-.                 makepigs.fly
   _   /   \\__              ─────────────
  ( \\_/  o o  \\___          You scrolled the wrong way into the console.
   \\    (  oo )    >        Respect.
    \\    \`--'   _/
     |  |    |  |           We're hiring pigs with wings.
     ^^^^    ^^^^           Apply: type "oink" on the page.
`,
  'color:#ff48b0;font-family:monospace;font-weight:700'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
