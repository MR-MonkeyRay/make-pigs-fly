import React from 'react';
import { useI18n } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-mission">🐷 {t.footer.mission}</p>
        <p className="footer-secret">🔑 {t.footer.secretHint}</p>
        <p className="footer-meta">
          {t.footer.madeWith} • {t.footer.openSource}
        </p>
      </div>
    </footer>
  );
};
