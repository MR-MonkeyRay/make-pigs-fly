import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { useI18n } from '../i18n';
import { soundEngine } from '../audio/soundEngine';
import { downloadPostcardPng } from '../utils/certificateCanvas';
import { buildPromiseShareUrl } from '../utils/urlPromise';

interface ProofPostcardProps {
  initialPromise?: string;
  initialFrom?: string;
}

export const ProofPostcard: React.FC<ProofPostcardProps> = ({
  initialPromise = '',
  initialFrom = '',
}) => {
  const { locale, t } = useI18n();
  const [promise, setPromise] = useState(initialPromise);
  const [from, setFrom] = useState(initialFrom);
  const [copied, setCopied] = useState(false);
  const [stampPulse, setStampPulse] = useState(0);

  const displayPromise = promise.trim() || t.proof.cardDefaultPromise;
  const today = new Date().toISOString().slice(0, 10);

  const handleSelectPreset = (preset: string) => {
    setPromise(preset);
    setStampPulse((n) => n + 1);
    soundEngine.playStamp();
  };

  const handleCopyLink = async () => {
    const url = buildPromiseShareUrl({ promise: displayPromise, from }, locale);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setStampPulse((n) => n + 1);
    soundEngine.playStamp();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  const handleDownload = () => {
    setStampPulse((n) => n + 1);
    soundEngine.playStamp();
    downloadPostcardPng({ promise: displayPromise, from, t });
  };

  return (
    <section id="proof" className="section proof-section">
      <div className="container">
        <div className="section-head centered">
          <span className="section-eyebrow">{t.proof.eyebrow}</span>
          <h2 className="section-title">{t.proof.title}</h2>
          <p className="section-subtitle">{t.proof.subtitle}</p>
        </div>

        <div className="proof-layout">
          {/* Left: Clean Minimal Input Card */}
          <div className="proof-editor">
            <div className="input-block">
              <label htmlFor="proof-promise" className="input-label">
                {t.proof.inputLabel}
              </label>
              <textarea
                id="proof-promise"
                className="editor-textarea"
                placeholder={t.proof.inputPlaceholder}
                value={promise}
                maxLength={140}
                onChange={(e) => setPromise(e.target.value)}
              />
            </div>

            <div className="preset-block">
              <span className="preset-caption">{t.proof.presetsLabel}</span>
              <div className="preset-list">
                {t.proof.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="preset-pill"
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-block">
              <label htmlFor="proof-from" className="input-label">
                {t.proof.fromLabel}
              </label>
              <input
                id="proof-from"
                type="text"
                className="editor-input"
                placeholder={t.proof.fromPlaceholder}
                value={from}
                maxLength={36}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="editor-actions">
              <button type="button" className="pill-btn primary" onClick={handleCopyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? t.proof.copiedBtn : t.proof.copyLinkBtn}</span>
              </button>
              <button type="button" className="pill-btn outline" onClick={handleDownload}>
                <Download size={16} />
                <span>{t.proof.downloadBtn}</span>
              </button>
            </div>
          </div>

          {/* Right: Live Gallery Postcard Preview */}
          <div className="postcard-preview" aria-label={t.proof.cardHeader}>
            <div className="postcard-inner">
              <div className="postcard-top">
                <span className="postcard-kicker">{t.proof.cardHeader}</span>
                <span className="postcard-date">
                  {t.proof.cardDateLabel} {today}
                </span>
              </div>

              <div className="postcard-main">
                <span className="postcard-clause-label">{t.proof.cardClauseLabel}</span>
                <p className="postcard-quote">“{displayPromise}”</p>

                <div className="postcard-seal-row">
                  <span className="postcard-verdict">✓ {t.proof.cardVerdict}</span>
                  <span key={stampPulse} className="postcard-seal">
                    ★ {t.proof.cardSeal} ★
                  </span>
                </div>
              </div>

              <div className="postcard-foot">
                <div>
                  <div className="postcard-witness">
                    {t.proof.cardWitnessLabel}:{' '}
                    <strong>{from.trim() || t.proof.cardDefaultWitness}</strong>
                  </div>
                  <p className="postcard-disclaimer">{t.proof.cardDisclaimer}</p>
                </div>
                <span className="postcard-domain">makepigs.fly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
