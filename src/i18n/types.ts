export type Locale = 'en' | 'zh' | 'ja' | 'es';

export type SkyMood = 'morning' | 'sunset' | 'aurora';

export interface TranslationSchema {
  meta: {
    title: string;
    localeName: string;
    shortCode: string;
  };
  header: {
    soundOn: string;
    soundOff: string;
    sendProofNav: string;
  };
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineAccent: string;
    subtitle: string;
    soarBtn: string;
    soaringBtn: string;
    sendProofBtn: string;
    moodLabels: Record<SkyMood, string>;
    moodCaptions: Record<SkyMood, string>;
    pigQuips: string[];
    tapPigHint: string;
    incomingBadge: string;
    incomingPrefix: string;
    incomingFrom: string;
    incomingDismiss: string;
  };
  theories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: [
      {
        num: string;
        tag: string;
        title: string;
        body: string;
        compliments: string[];
      },
      {
        num: string;
        tag: string;
        title: string;
        body: string;
        keywords: string[];
      },
      {
        num: string;
        tag: string;
        title: string;
        body: string;
        stamp: string;
      },
    ];
  };
  proof: {
    eyebrow: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    fromLabel: string;
    fromPlaceholder: string;
    presetsLabel: string;
    presets: string[];
    copyLinkBtn: string;
    copiedBtn: string;
    downloadBtn: string;
    cardHeader: string;
    cardDateLabel: string;
    cardClauseLabel: string;
    cardDefaultPromise: string;
    cardWitnessLabel: string;
    cardDefaultWitness: string;
    cardSeal: string;
    cardVerdict: string;
    cardDisclaimer: string;
  };
  footer: {
    line: string;
    subline: string;
    easterEgg: string;
  };
}
