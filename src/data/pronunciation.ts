import type { Gloss } from './flashcards/types';

/**
 * Mini-lecciones de pronunciación ("videos" de ~1 minuto): los sonidos del
 * inglés que más cuestan a quien habla español. Sabio narra en el idioma de
 * la app, pronuncia las palabras con voz en inglés y al final el alumno las
 * repite frente al micrófono.
 */
export interface PronunciationLesson {
  id: string;
  /** Símbolo fonético que se ve en la portada. */
  symbol: string;
  emoji: string;
  title: Gloss;
  /** Por qué cuesta este sonido (lo narra Sabio). */
  intro: Gloss;
  /** Cómo poner la boca. */
  mouth: Gloss;
  /** Palabras para escuchar y luego repetir (en inglés). */
  words: string[];
  /** Par mínimo: dos palabras que solo cambian en este sonido. */
  pair?: { target: string; contrast: string; note: Gloss };
  sentence: string;
  /** Recordatorio corto cuando el alumno no lo logra. */
  retryTip: Gloss;
  /** Color de la portada. */
  color: string;
}

export const PRONUNCIATION_LESSONS: PronunciationLesson[] = [
  {
    id: 'th-think',
    symbol: '/θ/',
    emoji: '🦷',
    color: 'var(--color-brand-600)',
    title: { es: 'La TH suave de think', en: 'The soft TH in think' },
    intro: {
      es: 'Este sonido no existe en español. Muchos dicen tink o sink, y eso cambia el significado.',
      en: "This sound doesn't exist in Spanish. Many people say tink or sink, and that changes the meaning.",
    },
    mouth: {
      es: 'Saca un poquito la punta de la lengua entre los dientes y sopla aire, sin usar la voz.',
      en: 'Put the tip of your tongue slightly between your teeth and blow air out, without using your voice.',
    },
    words: ['think', 'three', 'mouth'],
    pair: {
      target: 'think',
      contrast: 'sink',
      note: { es: 'Think es pensar. Sink es hundirse, o el lavabo.', en: 'Think is to use your mind. Sink is to go under water, or a basin.' },
    },
    sentence: 'I think three is enough.',
    retryTip: { es: 'lengua entre los dientes y sopla.', en: 'tongue between your teeth and blow.' },
  },
  {
    id: 'th-this',
    symbol: '/ð/',
    emoji: '👅',
    color: 'var(--color-violet-500)',
    title: { es: 'La TH con voz de this', en: 'The voiced TH in this' },
    intro: {
      es: 'Es la misma posición de la TH, pero ahora la garganta vibra. Se parece a la d suave de la palabra nada.',
      en: 'Same position as the other TH, but now your throat vibrates. It sounds like a very soft d.',
    },
    mouth: {
      es: 'Lengua entre los dientes y deja que vibre la voz. Toca tu garganta: debe vibrar.',
      en: 'Tongue between your teeth and let your voice vibrate. Touch your throat: it should buzz.',
    },
    words: ['this', 'mother', 'brother'],
    pair: {
      target: 'they',
      contrast: 'day',
      note: { es: 'They es ellos. Day es día.', en: 'They is a pronoun. Day is a day of the week.' },
    },
    sentence: 'This is my mother and my brother.',
    retryTip: { es: 'lengua entre los dientes y que vibre la voz.', en: 'tongue between your teeth and let it buzz.' },
  },
  {
    id: 'ship-sheep',
    symbol: '/ɪ/ /iː/',
    emoji: '🚢',
    color: 'var(--color-mint-500)',
    title: { es: 'Ship o sheep: la i corta y la larga', en: 'Ship or sheep: short and long i' },
    intro: {
      es: 'El inglés tiene dos íes. Si las confundes, en lugar de barco dices oveja.',
      en: 'English has two different i sounds. Mix them up and a ship becomes a sheep.',
    },
    mouth: {
      es: 'La i larga de sheep se estira, sonriendo. La i corta de ship es breve y relajada, casi entre i y e.',
      en: 'The long i in sheep is stretched, with a smile. The short i in ship is quick and relaxed, almost between i and e.',
    },
    words: ['ship', 'sheep', 'sit'],
    pair: {
      target: 'ship',
      contrast: 'sheep',
      note: { es: 'Ship es barco. Sheep es oveja.', en: 'A ship sails. A sheep says baa.' },
    },
    sentence: 'Please sit in this seat.',
    retryTip: { es: 'estira la i larga y acorta la corta.', en: 'stretch the long i, keep the short one quick.' },
  },
  {
    id: 'v-b',
    symbol: '/v/',
    emoji: '🎤',
    color: 'var(--color-coral-500)',
    title: { es: 'La V de very no es B', en: "The V in very isn't a B" },
    intro: {
      es: 'En español la b y la v suenan igual. En inglés no: vote y boat son palabras distintas.',
      en: 'In Spanish, b and v sound the same. In English they are different: vote and boat are different words.',
    },
    mouth: {
      es: 'Para la v, los dientes de arriba tocan el labio de abajo y la voz vibra. Para la b, juntas los dos labios.',
      en: 'For v, your top teeth touch your bottom lip and your voice buzzes. For b, both lips close together.',
    },
    words: ['very', 'voice', 'have'],
    pair: {
      target: 'vote',
      contrast: 'boat',
      note: { es: 'Vote es votar. Boat es bote.', en: 'You vote in an election. You sail a boat.' },
    },
    sentence: 'I have a very good voice.',
    retryTip: { es: 'dientes de arriba sobre el labio de abajo.', en: 'top teeth on your bottom lip.' },
  },
  {
    id: 'ed-endings',
    symbol: '-ed',
    emoji: '⏪',
    color: 'var(--color-amber-500)',
    title: { es: 'El pasado con -ed', en: 'Past tense -ed endings' },
    intro: {
      es: 'La terminación e d casi nunca suena ed. Tiene tres sonidos: t, d, e id.',
      en: 'The e d ending is almost never pronounced ed. It has three sounds: t, d, and id.',
    },
    mouth: {
      es: 'Solo agregas una sílaba si el verbo termina en t o d, como wanted. En los demás es un sonido corto: worked suena workt.',
      en: 'You only add a syllable when the verb ends in t or d, like wanted. Otherwise it is a short sound: worked sounds like workt.',
    },
    words: ['worked', 'played', 'wanted'],
    pair: {
      target: 'worked',
      contrast: 'wanted',
      note: { es: 'Worked tiene una sílaba. Wanted tiene dos.', en: 'Worked has one syllable. Wanted has two.' },
    },
    sentence: 'I worked, I played, and I wanted more.',
    retryTip: { es: 'no agregues una sílaba extra.', en: "don't add an extra syllable." },
  },
  {
    id: 's-school',
    symbol: '/sk/',
    emoji: '🐍',
    color: 'var(--color-brand-700)',
    title: { es: 'School sin la e de "eschool"', en: 'School without the extra e' },
    intro: {
      es: 'En español ninguna palabra empieza con s y otra consonante, por eso decimos eschool. En inglés la s va sola.',
      en: 'No Spanish word starts with s plus a consonant, so Spanish speakers say eschool. In English, the s comes alone.',
    },
    mouth: {
      es: 'Empieza con una s larga, como serpiente, y pasa directo a la siguiente letra. Sin e al principio.',
      en: 'Start with a long s, like a snake, and go straight to the next letter. No e at the start.',
    },
    words: ['school', 'study', 'street'],
    sentence: 'I study English at school.',
    retryTip: { es: 'empieza con sss, sin e.', en: 'start with sss, no e.' },
  },
  {
    id: 'h-hello',
    symbol: '/h/',
    emoji: '😮‍💨',
    color: 'var(--color-mint-500)',
    title: { es: 'La H de hello', en: 'The H in hello' },
    intro: {
      es: 'La h en inglés sí suena, pero es aire suave. No es la j fuerte del español.',
      en: 'The English h is pronounced, but it is just soft air. It is not the strong Spanish j.',
    },
    mouth: {
      es: 'Abre la boca y suelta aire, como cuando empañas un espejo.',
      en: 'Open your mouth and breathe out, like fogging up a mirror.',
    },
    words: ['hello', 'happy', 'house'],
    pair: {
      target: 'hear',
      contrast: 'ear',
      note: { es: 'Hear es oír. Ear es oreja.', en: 'You hear with your ear.' },
    },
    sentence: 'Hello! Are you happy at home?',
    retryTip: { es: 'aire suave, como empañar un espejo.', en: 'soft air, like fogging a mirror.' },
  },
  {
    id: 'sh-ch',
    symbol: '/ʃ/',
    emoji: '🤫',
    color: 'var(--color-violet-500)',
    title: { es: 'SH y CH: share y chair', en: 'SH and CH: share and chair' },
    intro: {
      es: 'Muchos hispanohablantes dicen chair cuando quieren decir share. Son dos sonidos diferentes.',
      en: 'Many Spanish speakers say chair when they mean share. They are two different sounds.',
    },
    mouth: {
      es: 'La sh es larga y suave, como cuando pides silencio. La ch es un golpe corto.',
      en: 'SH is long and soft, like asking for silence. CH is a short burst.',
    },
    words: ['she', 'shoes', 'wash'],
    pair: {
      target: 'share',
      contrast: 'chair',
      note: { es: 'Share es compartir. Chair es silla.', en: 'You share a pizza. You sit on a chair.' },
    },
    sentence: 'She washes her shoes.',
    retryTip: { es: 'sh larga, como pedir silencio.', en: 'long sh, like asking for silence.' },
  },
];

const DONE_KEY = 'fluenta-pronunciation-done';

export function loadWatched(): string[] {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveWatched(ids: string[]) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento: solo no se recuerda qué lecciones ya viste.
  }
}
