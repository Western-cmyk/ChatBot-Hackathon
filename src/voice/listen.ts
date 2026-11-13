/**
 * Reconocimiento de voz del navegador (Web Speech API) para las
 * mini-lecciones de pronunciación. Es gratis y no gasta créditos de
 * AssemblyAI: solo hace falta saber si se entendió la palabra.
 * Funciona en Chrome, Edge y Safari; Firefox no lo trae.
 */

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return recognitionCtor() !== null;
}

export interface Listening {
  /** Las transcripciones posibles (la más probable primero); vacío si no se oyó nada. */
  result: Promise<string[]>;
  cancel: () => void;
}

/** Escucha una sola frase y devuelve lo que el navegador entendió. */
export function listenOnce(lang: string, timeoutMs = 8000): Listening {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error('unsupported')), cancel: () => {} };

  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 5;

  let timer = 0;
  const result = new Promise<string[]>((resolve, reject) => {
    let heard: string[] = [];
    rec.onresult = (event) => {
      const first = event.results[0];
      heard = first ? Array.from(first, (alt) => alt.transcript) : [];
    };
    rec.onerror = (event) => {
      // "no-speech" y "aborted" no son fallas: simplemente no hubo palabra.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      window.clearTimeout(timer);
      reject(new Error(event.error));
    };
    rec.onend = () => {
      window.clearTimeout(timer);
      resolve(heard);
    };
    timer = window.setTimeout(() => rec.abort(), timeoutMs);
    rec.start();
  });

  return {
    result,
    cancel: () => {
      window.clearTimeout(timer);
      rec.abort();
    },
  };
}

function plain(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim()} `;
}

/** ¿Alguna de las transcripciones contiene la palabra completa? */
export function heardWord(alternatives: string[], word: string): boolean {
  const target = plain(word);
  return alternatives.some((alt) => plain(alt).includes(target));
}
