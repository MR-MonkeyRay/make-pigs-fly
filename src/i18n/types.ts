export type Locale = 'en' | 'zh' | 'ja' | 'es';

export type AchievementId =
  | 'first_liftoff'
  | 'vc_hype'
  | 'sweet_talker'
  | 'sonic_oink'
  | 'flappy_bacon'
  | 'orbital_swine'
  | 'gravity_denier'
  | 'promise_certified';

export interface DepartureItem {
  flight: string;
  destination: string;
  gate: string;
  status: 'BOARDING' | 'ON_TIME' | 'DEPARTED' | 'DELAYED';
  statusLabel: string;
  promiseText: string;
}

export interface TranslationSchema {
  meta: {
    title: string;
    localeName: string;
    shortCode: string;
  };
  header: {
    agencyCode: string;
    agencyName: string;
    tagline: string;
    navLab: string;
    navBoard: string;
    navCertifier: string;
    navPassport: string;
    bestAlt: string;
    soundOn: string;
    soundOff: string;
    hyperdriveActive: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    hintInteract: string;
    dragHint: string;
    pokeHint: string;
    fullSend: string;
    resetGround: string;
    rainbowBanner: string;
  };
  hud: {
    altitude: string;
    velocity: string;
    skepticism: string;
    zone: string;
    mach: string;
    grounded: string;
    shattered: string;
    impossible: string;
    zones: {
      tarmac: string;
      clouds: string;
      airspace: string;
      stratosphere: string;
      space: string;
      transcendence: string;
    };
  };
  cockpit: {
    deckTitle: string;
    statusReady: string;
    statusAirborne: string;
    statusSpace: string;
    windTitle: string;
    windDesc: string;
    windMax: string;
    windOff: string;
    balloonTitle: string;
    balloonDesc: string;
    balloonAdd: string;
    balloonPop: string;
    balloonCount: string;
    rocketTitle: string;
    rocketDesc: string;
    rocketIgnite: string;
    rocketCutoff: string;
    wingsTitle: string;
    wingsDesc: string;
    wingsFlap: string;
    wingsKeyHint: string;
  };
  pigDialogue: {
    idle: string[];
    poked: string[];
    windHigh: string[];
    balloons: string[];
    rocket: string[];
    flapping: string[];
    space: string[];
    flung: string[];
    rainbow: string[];
    compliments: string[];
    buzzwords: string[];
  };
  atc: {
    prefix: string;
    ready: string;
    liftoff: string;
    windVent: string;
    balloonOverload: string;
    supersonic: string;
    airspace: string;
    stratosphere: string;
    space: string;
    transcendence: string;
    rainbow: string;
    popped: string;
  };
  board: {
    eyebrow: string;
    title: string;
    subtitle: string;
    colFlight: string;
    colPromise: string;
    colGate: string;
    colStatus: string;
    clickTip: string;
    items: DepartureItem[];
  };
  certifier: {
    eyebrow: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    fromLabel: string;
    fromPlaceholder: string;
    presetsLabel: string;
    presets: string[];
    certifyBtn: string;
    downloadBtn: string;
    copyLinkBtn: string;
    copiedBtn: string;
    launchFromCertBtn: string;
    stampApproved: string;
    stampPending: string;
    certHeader: string;
    certSubheader: string;
    certFlightNo: string;
    certPassenger: string;
    certPassengerName: string;
    certClauseLabel: string;
    certDefaultPromise: string;
    certAltLabel: string;
    certStatusLabel: string;
    certStatusVerified: string;
    certIssuedBy: string;
    certSignature: string;
    certDisclaimer: string;
    certFooterUrl: string;
    needLiftoffNote: string;
  };
  incomingModal: {
    badge: string;
    title: string;
    fromPrefix: string;
    clausePrefix: string;
    verdict: string;
    verifiedAlt: string;
    ctaWitness: string;
    ctaDismiss: string;
  };
  passport: {
    eyebrow: string;
    title: string;
    subtitle: string;
    unlockedCount: string;
    locked: string;
    unlocked: string;
    achievements: Record<
      AchievementId,
      {
        title: string;
        desc: string;
      }
    >;
  };
  footer: {
    mission: string;
    secretHint: string;
    madeWith: string;
    openSource: string;
  };
}
