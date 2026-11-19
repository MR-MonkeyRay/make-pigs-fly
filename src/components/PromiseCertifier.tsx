import React, { useState } from 'react';
import { Award, Check, Copy, Download, Rocket } from 'lucide-react';
import { useI18n } from '../i18n';
import { soundEngine } from '../audio/soundEngine';
import { downloadCertificatePng } from '../utils/certificateCanvas';
import { buildPromiseShareUrl } from '../utils/urlPromise';

interface PromiseCertifierProps {
  promiseText: string;
  onPromiseTextChange: (val: string) => void;
  flightNo: string;
  peakAltitude: number;
  onCertified: () => void;
  onLaunchToProve: () => void;
}

export const PromiseCertifier: React.FC<PromiseCertifierProps> = ({
  promiseText,
  onPromiseTextChange,
  flightNo,
  peakAltitude,
  onCertified,
  onLaunchToProve,
}) => {
  const { locale, t } = useI18n();
  const [fromName, setFromName] = useState('');
  const [stampKey, setStampKey] = useState(0);
  const [isStamped, setIsStamped] = useState(false);
  const [copied, setCopied] = useState(false);

  const effectiveAlt = Math.max(peakAltitude, isStamped ? 14280 : 0);
  const displayPromise = promiseText.trim() || t.certifier.certDefaultPromise;

  const handleStamp = () => {
    setIsStamped(true);
    setStampKey((k) => k + 1);
    soundEngine.playStamp();
    setTimeout(() => soundEngine.playChime([587.33, 880]), 110);
    onCertified();
  };

  const handleDownload = () => {
    if (!isStamped) {
      setIsStamped(true);
      setStampKey((k) => k + 1);
      onCertified();
    }
    soundEngine.playStamp();
    downloadCertificatePng({
      promise: displayPromise,
      from: fromName,
      altitude: Math.max(peakAltitude, 14280),
      flightNo,
      t,
    });
  };

  const handleCopyLink = async () => {
    if (!isStamped) {
      setIsStamped(true);
      setStampKey((k) => k + 1);
      onCertified();
    }
    const url = buildPromiseShareUrl(
      {
        promise: displayPromise,
        from: fromName,
        altitude: Math.max(peakAltitude, 14280),
        flightNo,
      },
      locale
    );

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
    soundEngine.playChime([659.25, 987.77]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section id="certifier" className="section">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">{t.certifier.eyebrow}</div>
          <h2 className="section-title">{t.certifier.title}</h2>
          <p className="section-subtitle">{t.certifier.subtitle}</p>
        </div>

        <div className="certifier-grid">
          {/* Left: Form Controls */}
          <div className="cert-form-card">
            <div className="field-group">
              <label className="field-label" htmlFor="promise-input">
                {t.certifier.inputLabel}
              </label>
              <textarea
                id="promise-input"
                className="field-textarea"
                placeholder={t.certifier.inputPlaceholder}
                value={promiseText}
                maxLength={140}
                onChange={(e) => onPromiseTextChange(e.target.value)}
              />
            </div>

            <div className="presets-wrap">
              <span className="presets-label">{t.certifier.presetsLabel}</span>
              <div className="presets-chips">
                {t.certifier.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="preset-chip"
                    onClick={() => onPromiseTextChange(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="from-input">
                {t.certifier.fromLabel}
              </label>
              <input
                id="from-input"
                type="text"
                className="field-input"
                placeholder={t.certifier.fromPlaceholder}
                value={fromName}
                maxLength={36}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>

            <div className="cert-btn-row">
              <button type="button" className="btn btn-primary" onClick={handleStamp}>
                <Award size={16} />
                {t.certifier.certifyBtn}
              </button>
              <button type="button" className="btn btn-cobalt" onClick={handleDownload}>
                <Download size={16} />
                {t.certifier.downloadBtn}
              </button>
              <button type="button" className="btn btn-gold" onClick={handleCopyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.certifier.copiedBtn : t.certifier.copyLinkBtn}
              </button>
            </div>

            <div className="cert-btn-row">
              <button type="button" className="btn btn-sm" onClick={onLaunchToProve}>
                <Rocket size={14} />
                {t.certifier.launchFromCertBtn}
              </button>
            </div>

            {peakAltitude < 500 && <p className="cert-tip">💡 {t.certifier.needLiftoffNote}</p>}
          </div>

          {/* Right: Live Vintage Boarding Pass Preview */}
          <div className="boarding-pass" aria-label={t.certifier.certSubheader}>
            <div className="bp-header">
              <div>
                <div className="bp-agency">{t.certifier.certHeader}</div>
                <div className="bp-sub">{t.certifier.certSubheader}</div>
              </div>
              <div className="bp-flight">{flightNo}</div>
            </div>

            <div className="bp-body">
              <div className="bp-meta-row">
                <div>
                  <div className="bp-meta-label">{t.certifier.certPassenger}</div>
                  <div className="bp-meta-val">{t.certifier.certPassengerName}</div>
                </div>
                <div>
                  <div className="bp-meta-label">{t.certifier.certAltLabel}</div>
                  <div className="bp-meta-val blue">
                    {effectiveAlt > 0 ? `${effectiveAlt.toLocaleString()} m` : '0 m'}
                  </div>
                </div>
                <div>
                  <div className="bp-meta-label">{t.certifier.certStatusLabel}</div>
                  <div className="bp-meta-val orange">
                    {isStamped || peakAltitude > 20
                      ? t.certifier.certStatusVerified
                      : t.certifier.stampPending}
                  </div>
                </div>
              </div>

              <div className="bp-clause-box">
                <div className="bp-meta-label">{t.certifier.certClauseLabel}</div>
                <p className="bp-clause-text">“{displayPromise}”</p>

                <div
                  key={stampKey}
                  className={`bp-stamp ${isStamped || peakAltitude > 20 ? 'stamped' : 'pending'}`}
                >
                  {isStamped || peakAltitude > 20
                    ? `✓ ${t.certifier.stampApproved}`
                    : t.certifier.stampPending}
                </div>
              </div>

              <div className="bp-footer">
                <div>
                  <div className="bp-meta-label">{t.certifier.certIssuedBy}</div>
                  <div className="bp-meta-val" style={{ fontSize: '0.86rem' }}>
                    {fromName.trim() || t.certifier.certSignature}
                  </div>
                  <p className="bp-disclaimer">{t.certifier.certDisclaimer}</p>
                </div>
                <div>
                  <div className="bp-barcode" aria-hidden="true" />
                  <div
                    className="bp-meta-label"
                    style={{ textAlign: 'center', marginTop: '4px', color: 'var(--ink-primary)' }}
                  >
                    {t.certifier.certFooterUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
