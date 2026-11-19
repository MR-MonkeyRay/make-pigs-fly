import React from 'react';
import { useI18n } from '../i18n';

interface FooterProps {
  stardust: boolean;
  onToggleStardust: () => void;
}

export const Footer: React.FC<FooterProps> = ({ stardust, onToggleStardust }) => {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <button
          type="button"
          className={`footer-pig-egg ${stardust ? 'active' : ''}`}
          onClick={onToggleStardust}
          title="✨"
          aria-label="Toggle secret stardust mode"
        >
          🐷✨
        </button>

        <p className="footer-line">{t.footer.line}</p>
        {stardust && <p className="footer-easter">{t.footer.easterEgg}</p>}
        <p className="footer-subline">{t.footer.subline}</p>
      </div>
    </footer>
  );
};
