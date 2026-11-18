import type en from './locales/en';

export type Messages = typeof en;

export type StringKey = {
  [K in keyof Messages]: Messages[K] extends string ? K : never;
}[keyof Messages];

export type ListKey = {
  [K in keyof Messages]: Messages[K] extends string[] ? K : never;
}[keyof Messages];
