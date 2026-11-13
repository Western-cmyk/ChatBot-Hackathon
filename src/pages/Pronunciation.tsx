import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock, Mic, Pause, Play, RotateCcw, Volume2, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import WizardMascot, { type MascotState } from '../components/WizardMascot';
import { gloss } from '../data/flashcards';
import { loadWatched, PRONUNCIATION_LESSONS, saveWatched, type PronunciationLesson } from '../data/pronunciation';
import { FREE_PRONUNCIATION_LESSONS, usePlan } from '../PlanContext';
import { useProgress } from '../ProgressContext';
import { useT } from '../i18n/I18nContext';
import { canListen, heardWord, listenOnce, type Listening } from '../voice/listen';

export default function Pronunciation() {
  const navigate = useNavigate();
  const { isStudent } = usePlan();
  const { t, lang } = useT();
  const [watched, setWatched] = useState<string[]>(loadWatched);
  const [open, setOpen] = useState<PronunciationLesson | null>(null);

  const markWatched = (id: string) => {
    setWatched((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveWatched(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1.5 text-sm font-bold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft size={16} />
          {t('pron.back')}
        </button>
        <h1 className="text-2xl font-extrabold text-ink-950">🔊 {t('pron.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">{t('pron.subtitle')}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRONUNCIATION_LESSONS.map((lesson, i) => {
            const locked = !isStudent && i >= FREE_PRONUNCIATION_LESSONS;
            const seen = watched.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => (locked ? navigate('/plans') : setOpen(lesson))}
                className="group overflow-hidden rounded-3xl border-2 border-ink-100 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className="relative flex aspect-video items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${lesson.color}, color-mix(in srgb, ${lesson.color} 55%, black))` }}
                >
                  <span className="absolute left-4 top-3 text-2xl">{lesson.emoji}</span>
                  <span className="text-4xl font-extrabold text-white drop-shadow">{lesson.symbol}</span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white">
                    {t('pron.minute')}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/15">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-lg transition group-hover:opacity-100">
                      {locked ? <Lock size={20} /> : <Play size={22} fill="currentColor" />}
                    </span>
                  </span>
                  {locked && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-violet-500">
                      <Lock size={11} />
                      {t('pron.locked')}
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2 p-4">
                  <p className="text-sm font-extrabold leading-snug text-ink-950">{gloss(lesson.title, lang)}</p>
                  {seen && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-mint-500/10 px-2 py-0.5 text-[11px] font-extrabold text-mint-500">
                      <Check size={11} />
                      {t('pron.done')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {open && <LessonPlayer key={open.id} lesson={open} onClose={() => setOpen(null)} onWatched={() => markWatched(open.id)} />}
    </div>
  );
}

// ------------------------------------------------------------ voz

type Speaker = 'ui' | 'en';

interface Step {
  text: string;
  speaker: Speaker;
  rate?: number;
}

type SceneKind = 'intro' | 'mouth' | 'word' | 'pair' | 'sentence' | 'turn';

interface Scene {
  kind: SceneKind;
  word?: string;
  steps: Step[];
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.replace('_', '-').startsWith(`${base}-`) && v.localService) ??
    voices.find((v) => v.lang.startsWith(base))
  );
}

/** Dice un texto y espera a que termine (o un tiempo estimado si no hay voz). */
function say(text: string, lang: string, rate = 0.95): Promise<void> {
  const estimate = 900 + (text.length * 70) / rate;
  return new Promise((resolve) => {
    if (typeof window.speechSynthesis === 'undefined') {
      setTimeout(resolve, estimate);
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(safety);
      resolve();
    };
    // Algunos navegadores no avisan cuando termina: no dejamos que se trabe.
    const safety = window.setTimeout(finish, estimate + 4000);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function buildScenes(lesson: PronunciationLesson, lang: string, yourTurn: string): Scene[] {
  const ui = (g: { es: string; en: string }) => gloss(g, lang);
  const scenes: Scene[] = [
    { kind: 'intro', steps: [{ text: ui(lesson.title), speaker: 'ui' }, { text: ui(lesson.intro), speaker: 'ui' }] },
    { kind: 'mouth', steps: [{ text: ui(lesson.mouth), speaker: 'ui' }] },
    ...lesson.words.map<Scene>((word) => ({
      kind: 'word',
      word,
      steps: [
        { text: word, speaker: 'en', rate: 0.85 },
        { text: word, speaker: 'en', rate: 0.5 },
      ],
    })),
  ];
  if (lesson.pair) {
    const { target, contrast, note } = lesson.pair;
    scenes.push({
      kind: 'pair',
      steps: [
        { text: target, speaker: 'en', rate: 0.75 },
        { text: contrast, speaker: 'en', rate: 0.75 },
        { text: target, speaker: 'en', rate: 0.75 },
        { text: ui(note), speaker: 'ui' },
      ],
    });
  }
  scenes.push({ kind: 'sentence', steps: [{ text: lesson.sentence, speaker: 'en', rate: 0.85 }] });
  scenes.push({ kind: 'turn', steps: [{ text: yourTurn, speaker: 'ui' }] });
  return scenes;
}

// ------------------------------------------------------------ reproductor

interface PlayerProps {
  lesson: PronunciationLesson;
  onClose: () => void;
  onWatched: () => void;
}

function LessonPlayer({ lesson, onClose, onWatched }: PlayerProps) {
  const { t, lang } = useT();
  const { completePractice } = useProgress();
  const narratorLang = lang === 'es' ? 'es-MX' : 'en-US';
  const scenes = useMemo(() => buildScenes(lesson, lang, t('pron.yourTurnHint')), [lesson, lang, t]);

  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [talking, setTalking] = useState(false);

  const scene = scenes[index];
  const current = scene.steps[Math.min(step, scene.steps.length - 1)];

  // Corre las escenas una tras otra mientras está en "play".
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const run = async () => {
      for (let s = 0; s < scene.steps.length; s++) {
        if (cancelled) return;
        const st = scene.steps[s];
        setStep(s);
        setTalking(true);
        await say(st.text, st.speaker === 'ui' ? narratorLang : 'en-US', st.rate);
        setTalking(false);
        await wait(st.speaker === 'en' ? 450 : 250);
      }
      if (cancelled) return;
      if (scene.kind === 'turn') {
        setPlaying(false);
        return;
      }
      await wait(400);
      if (cancelled) return;
      setStep(0);
      setIndex((i) => Math.min(i + 1, scenes.length - 1));
    };
    void run();
    return () => {
      cancelled = true;
      setTalking(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [playing, scene, scenes.length, narratorLang]);

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const replay = () => {
    setIndex(0);
    setStep(0);
    setPlaying(true);
  };

  const goTo = (i: number) => {
    setIndex(i);
    setStep(0);
    setPlaying(true);
  };

  const mascot: MascotState = scene.kind === 'turn' ? 'idle' : talking ? 'thinking' : 'idle';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm font-extrabold text-ink-950">
            {lesson.emoji} {gloss(lesson.title, lang)}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pron.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pantalla del "video" */}
        <div
          className="relative mx-4 flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-8 text-center text-white sm:aspect-video sm:min-h-0"
          style={{ background: `linear-gradient(135deg, ${lesson.color}, color-mix(in srgb, ${lesson.color} 50%, black))` }}
        >
          <div className={`absolute bottom-2 left-3 ${talking ? 'animate-talk' : ''}`}>
            <WizardMascot size={72} state={mascot} />
          </div>

          {scene.kind === 'intro' && (
            <div key="intro" className="animate-word-in">
              <p className="text-6xl font-extrabold drop-shadow sm:text-7xl">{lesson.symbol}</p>
              <p className="mt-3 text-lg font-extrabold">{gloss(lesson.title, lang)}</p>
            </div>
          )}

          {scene.kind === 'mouth' && (
            <div key="mouth" className="animate-word-in max-w-md">
              <p className="text-5xl">👄</p>
              <p className="mt-3 text-base font-bold leading-relaxed">{gloss(lesson.mouth, lang)}</p>
            </div>
          )}

          {scene.kind === 'word' && scene.word && (
            <div key={scene.word} className="animate-word-in">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">
                {step === 0 ? t('pron.listen') : t('pron.slow')}
              </p>
              <p className="mt-2 text-6xl font-extrabold drop-shadow sm:text-7xl">{scene.word}</p>
            </div>
          )}

          {scene.kind === 'pair' && lesson.pair && (
            <div key="pair" className="animate-word-in">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">{t('pron.compare')}</p>
              <div className="mt-3 flex items-center justify-center gap-4">
                {[lesson.pair.target, lesson.pair.contrast].map((w, i) => {
                  const active = step < 3 && (step === 1 ? i === 1 : i === 0);
                  return (
                    <span
                      key={w}
                      className={`rounded-2xl px-5 py-3 text-3xl font-extrabold transition sm:text-4xl ${
                        active ? 'scale-110 bg-white text-ink-950' : 'bg-white/15 text-white'
                      }`}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
              {step >= 3 && <p className="mt-4 text-sm font-bold">{gloss(lesson.pair.note, lang)}</p>}
            </div>
          )}

          {scene.kind === 'sentence' && (
            <p key="sentence" className="animate-word-in max-w-md text-3xl font-extrabold leading-snug drop-shadow sm:text-4xl">
              {lesson.sentence.split(' ').map((w, i) => {
                const hit = lesson.words.some((target) => w.toLowerCase().replace(/[^a-z]/g, '').startsWith(target.slice(0, 4)));
                return (
                  <span key={i} className={hit ? 'text-amber-500' : ''}>
                    {w}{' '}
                  </span>
                );
              })}
            </p>
          )}

          {scene.kind === 'turn' && (
            <YourTurn
              lesson={lesson}
              onSay={(text) => say(text, 'en-US', 0.8)}
              onFinish={(ok) => {
                onWatched();
                return completePractice({ minutes: 1, xp: 5 + ok * 2 });
              }}
              onReplay={replay}
            />
          )}
        </div>

        {/* Subtítulos */}
        <p className="mx-4 mt-3 min-h-10 text-center text-sm font-semibold text-ink-700">
          {scene.kind !== 'turn' && current.speaker === 'ui' ? current.text : ' '}
        </p>

        {/* Controles */}
        <div className="flex items-center gap-3 px-5 pb-5 pt-1">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={scene.kind === 'turn'}
            aria-label={playing ? t('pron.pause') : t('pron.play')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white transition hover:bg-ink-900 disabled:opacity-30"
          >
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <div className="flex flex-1 gap-1">
            {scenes.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}`}
                className={`h-2 flex-1 rounded-full transition ${i < index ? 'bg-ink-700' : i === index ? 'bg-brand-500' : 'bg-ink-100'}`}
                title={s.kind}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={replay}
            aria-label={t('pron.replay')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ tu turno

type TurnStatus = 'idle' | 'listening' | 'ok' | 'wrong' | 'blocked';

interface TurnProps {
  lesson: PronunciationLesson;
  onSay: (text: string) => Promise<void>;
  /** Registra la lección y devuelve el XP ganado. */
  onFinish: (ok: number) => number;
  onReplay: () => void;
}

function YourTurn({ lesson, onSay, onFinish, onReplay }: TurnProps) {
  const { t, lang } = useT();
  const words = lesson.words;
  const [wordIdx, setWordIdx] = useState(0);
  const [status, setStatus] = useState<TurnStatus>('idle');
  const [heard, setHeard] = useState('');
  const [okWords, setOkWords] = useState<string[]>([]);
  const [xp, setXp] = useState<number | null>(null);
  const listening = useRef<Listening | null>(null);
  const supported = canListen();
  const word = words[wordIdx];

  useEffect(() => () => listening.current?.cancel(), []);

  const record = async () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setStatus('listening');
    setHeard('');
    const l = listenOnce('en-US');
    listening.current = l;
    try {
      const alternatives = await l.result;
      setHeard(alternatives[0] ?? '');
      if (heardWord(alternatives, word)) {
        setStatus('ok');
        setOkWords((prev) => (prev.includes(word) ? prev : [...prev, word]));
      } else {
        setStatus('wrong');
      }
    } catch (err) {
      setStatus((err as Error).message === 'not-allowed' ? 'blocked' : 'wrong');
    }
  };

  const finish = () => setXp(onFinish(okWords.length));

  const next = () => {
    if (wordIdx + 1 >= words.length || !supported) {
      finish();
      return;
    }
    setWordIdx((i) => i + 1);
    setStatus('idle');
    setHeard('');
  };

  if (xp !== null) {
    return (
      <div className="animate-word-in flex flex-col items-center">
        <WizardMascot size={96} state="celebrate" />
        <p className="mt-2 text-lg font-extrabold">{t('pron.score', { ok: okWords.length, total: words.length })}</p>
        <p className="mt-2 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">
          <Zap size={14} fill="currentColor" />+{xp} XP
        </p>
        <button
          type="button"
          onClick={onReplay}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-ink-950"
        >
          <RotateCcw size={16} />
          {t('pron.replay')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-word-in flex w-full max-w-sm flex-col items-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">
        {t('pron.yourTurn')} · {wordIdx + 1}/{words.length}
      </p>
      <p className="mt-1 text-5xl font-extrabold drop-shadow">{word}</p>

      {!supported ? (
        <p className="mt-4 rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold">{t('pron.noMic')}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void onSay(word)}
            aria-label={t('pron.listen')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <Volume2 size={20} />
          </button>
          <button
            type="button"
            onClick={() => void record()}
            disabled={status === 'listening'}
            aria-label={t('pron.yourTurn')}
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-950 shadow-lg transition ${
              status === 'listening' ? 'animate-pulse ring-4 ring-white/50' : 'hover:scale-105'
            }`}
          >
            <Mic size={26} />
          </button>
        </div>
      )}

      <p className="mt-3 min-h-10 text-sm font-bold">
        {status === 'listening' && t('pron.listening')}
        {status === 'ok' && `✅ ${t('pron.correct', { word })}`}
        {status === 'wrong' &&
          `${heard ? `${t('pron.heard', { text: heard })} · ` : ''}${t('pron.tryAgain', { tip: gloss(lesson.retryTip, lang) })}`}
        {status === 'blocked' && t('pron.micBlocked')}
      </p>

      {(status === 'ok' || status === 'wrong' || !supported || status === 'blocked') && (
        <button
          type="button"
          onClick={next}
          className="mt-1 rounded-2xl bg-white px-5 py-2 text-sm font-extrabold text-ink-950"
        >
          {wordIdx + 1 >= words.length || !supported ? t('pron.finish') : t('pron.next')}
        </button>
      )}
    </div>
  );
}
