import type { en } from './locales/en';

export type Locale = 'en' | 'zh' | 'zhTW' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ru';

/** The English messages object defines the schema every locale must match. */
export type Messages = typeof en;
