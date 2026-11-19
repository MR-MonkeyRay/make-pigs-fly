import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';
import type { DepartureItem } from '../i18n/types';

interface DepartureBoardProps {
  onSelectFlight: (item: DepartureItem) => void;
}

export const DepartureBoard: React.FC<DepartureBoardProps> = ({ onSelectFlight }) => {
  const { t } = useI18n();

  return (
    <section id="departures" className="section">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">{t.board.eyebrow}</div>
          <h2 className="section-title">{t.board.title}</h2>
          <p className="section-subtitle">{t.board.subtitle}</p>
        </div>

        <div className="board-frame" role="region" aria-label={t.board.title}>
          <div className="board-head" aria-hidden="true">
            <span>{t.board.colFlight}</span>
            <span>{t.board.colPromise}</span>
            <span className="col-gate" style={{ textAlign: 'center' }}>
              {t.board.colGate}
            </span>
            <span style={{ textAlign: 'center' }}>{t.board.colStatus}</span>
          </div>

          {t.board.items.map((item) => (
            <button
              key={item.flight}
              type="button"
              className="board-row"
              onClick={() => onSelectFlight(item)}
            >
              <span className="flap-code">{item.flight}</span>
              <span className="board-dest">
                <span>{item.destination}</span>
                <span className="board-tip">
                  {t.board.clickTip} <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
                </span>
              </span>
              <span className="board-gate">{item.gate}</span>
              <span className={`status-pill ${item.status}`}>{item.statusLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
