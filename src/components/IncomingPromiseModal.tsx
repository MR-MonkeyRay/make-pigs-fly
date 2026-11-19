import React, { useEffect } from 'react';
import { Rocket, X } from 'lucide-react';
import { useI18n } from '../i18n';
import type { SharedPromisePayload } from '../utils/urlPromise';

interface IncomingPromiseModalProps {
  payload: SharedPromisePayload;
  onWitness: () => void;
  onDismiss: () => void;
}

export const IncomingPromiseModal: React.FC<IncomingPromiseModalProps> = ({
  payload,
  onWitness,
  onDismiss,
}) => {
  const { t } = useI18n();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="incoming-modal-title">
      <div className="modal-card">
        <div className="modal-head">
          <span>✈ {t.incomingModal.badge} • {payload.flightNo}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              padding: 2,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h2 id="incoming-modal-title" className="modal-title">
            {t.incomingModal.title}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
            {t.incomingModal.clausePrefix}
          </p>

          <div className="modal-quote">“{payload.promise}”</div>

          <div className="modal-meta">
            <span>
              {t.incomingModal.verifiedAlt}: <strong>{payload.altitude.toLocaleString()} m</strong>
            </span>
            {payload.from && (
              <span>
                {t.incomingModal.fromPrefix}: <strong>{payload.from}</strong>
              </span>
            )}
            <span className="modal-verdict">{t.incomingModal.verdict}</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={onWitness}>
              <Rocket size={16} />
              {t.incomingModal.ctaWitness}
            </button>
            <button type="button" className="btn" onClick={onDismiss}>
              {t.incomingModal.ctaDismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
