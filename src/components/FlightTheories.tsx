import React from 'react';
import { useI18n } from '../i18n';

export const FlightTheories: React.FC = () => {
  const { t } = useI18n();
  const [card1, card2, card3] = t.theories.cards;

  return (
    <section id="theories" className="section theories-section">
      <div className="container">
        <div className="section-head centered">
          <span className="section-eyebrow">{t.theories.eyebrow}</span>
          <h2 className="section-title">{t.theories.title}</h2>
          <p className="section-subtitle">{t.theories.subtitle}</p>
        </div>

        <div className="theories-grid">
          {/* Card 1: Aerodynamic Compliments */}
          <article className="theory-card theory-flattery">
            <div className="theory-meta">
              <span className="theory-num">{card1.num}</span>
              <span className="theory-tag">{card1.tag}</span>
            </div>
            <div className="theory-visual flattery-visual" aria-hidden="true">
              {card1.compliments.map((word, idx) => (
                <span key={word} className={`float-pill p-${idx + 1}`}>
                  {word}
                </span>
              ))}
            </div>
            <h3 className="theory-title">{card1.title}</h3>
            <p className="theory-body">{card1.body}</p>
          </article>

          {/* Card 2: The Startup Updraft */}
          <article className="theory-card theory-wind">
            <div className="theory-meta">
              <span className="theory-num">{card2.num}</span>
              <span className="theory-tag">{card2.tag}</span>
            </div>
            <div className="theory-visual wind-visual" aria-hidden="true">
              <div className="wind-stream s-1" />
              <div className="wind-stream s-2" />
              <div className="wind-stream s-3" />
              <div className="wind-tags">
                {card2.keywords.map((kw, idx) => (
                  <span key={kw} className={`wind-chip w-${idx + 1}`}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="theory-title">{card2.title}</h3>
            <p className="theory-body">{card2.body}</p>
          </article>

          {/* Card 3: Pure Spite Against Gravity */}
          <article className="theory-card theory-spite">
            <div className="theory-meta">
              <span className="theory-num">{card3.num}</span>
              <span className="theory-tag">{card3.tag}</span>
            </div>
            <div className="theory-visual spite-visual" aria-hidden="true">
              <div className="mini-seal">
                <span className="mini-seal-inner">★ {card3.stamp} ★</span>
              </div>
            </div>
            <h3 className="theory-title">{card3.title}</h3>
            <p className="theory-body">{card3.body}</p>
          </article>
        </div>
      </div>
    </section>
  );
};
