import React from 'react';
import { useI18n } from '../i18n';
import type { AchievementId } from '../i18n/types';

interface AchievementPassportProps {
  unlockedIds: AchievementId[];
}

const ACHIEVEMENT_META: Array<{ id: AchievementId; emoji: string }> = [
  { id: 'first_liftoff', emoji: '🛫' },
  { id: 'vc_hype', emoji: '💨' },
  { id: 'sweet_talker', emoji: '🎈' },
  { id: 'sonic_oink', emoji: '🚀' },
  { id: 'flappy_bacon', emoji: '🪽' },
  { id: 'orbital_swine', emoji: '🪐' },
  { id: 'gravity_denier', emoji: '🙌' },
  { id: 'promise_certified', emoji: '📜' },
];

export const AchievementPassport: React.FC<AchievementPassportProps> = ({ unlockedIds }) => {
  const { t } = useI18n();
  const unlockedSet = new Set(unlockedIds);

  return (
    <section id="passport" className="section">
      <div className="container">
        <div className="passport-top">
          <div>
            <div className="eyebrow">{t.passport.eyebrow}</div>
            <h2 className="section-title">{t.passport.title}</h2>
            <p className="section-subtitle">{t.passport.subtitle}</p>
          </div>

          <div className="passport-counter">
            {t.passport.unlockedCount}: {unlockedIds.length} / {ACHIEVEMENT_META.length}
          </div>
        </div>

        <div className="passport-grid">
          {ACHIEVEMENT_META.map(({ id, emoji }) => {
            const isUnlocked = unlockedSet.has(id);
            const copy = t.passport.achievements[id];
            return (
              <article
                key={id}
                className={`stamp-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                aria-label={`${copy.title} - ${isUnlocked ? t.passport.unlocked : t.passport.locked}`}
              >
                <div className="stamp-top">
                  <span className="stamp-emoji" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className={`stamp-badge ${isUnlocked ? 'ok' : 'no'}`}>
                    {isUnlocked ? `✓ ${t.passport.unlocked}` : t.passport.locked}
                  </span>
                </div>
                <h3 className="stamp-title">{copy.title}</h3>
                <p className="stamp-desc">{copy.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
