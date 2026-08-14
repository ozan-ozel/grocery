/// <reference types="vite/client" />

declare module "snowball-stemmers" {
  export interface SnowballStemmer {
    stem(word: string): string;
  }
  export function newStemmer(algorithm: string): SnowballStemmer;
  export function algorithms(): string[];
  const _default: {
    newStemmer: typeof newStemmer;
    algorithms: typeof algorithms;
  };
  export default _default;
}
