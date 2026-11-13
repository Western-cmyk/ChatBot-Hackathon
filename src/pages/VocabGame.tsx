import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Timer, Trophy, Volume2, X, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import WizardMascot from '../components/WizardMascot';
import { getDeck, gloss, THEMES, type Flashcard, type Theme } from '../data/flashcards';
import { useProfile } from '../ProfileContext';
import { useProgress } from '../ProgressContext';
import { useT } from '../i18n/I18nContext';
import { speak } from '../voice/speak';

/**
 * Juego de parejas: el alumno une cada palabra con su significado contra
 * reloj. Usa los mismos mazos que las flashcards, así repasa lo que ve en clase.
 */

const PAIRS_PER_ROUND = 6;
type Choice = Theme | 'mix';

interface Pair {
  id: number;
  card: Flashcard;
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function dealRound(cards: Record<Theme, Flashcard[]>, choice: Choice): Pair[] {
  const pool = choice === 'mix' ? THEMES.flatMap((th) => cards[th] ?? []) : (cards[choice] ?? []);
  return shuffle(pool)
    .slice(0, PAIRS_PER_ROUND)
    .map((card, id) => ({ id, card }));
}

/** XP: 1 por pareja, +5 si no hubo errores, +5 si fue en menos de 40 s. */
function xpFor(pairs: number, mistakes: number, seconds: number): number {
  return pairs + (mistakes === 0 ? 5 : 0) + (seconds < 40 ? 5 : 0);
}

export default function VocabGame() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const { courses } = useProfile();
  const { t } = useT();
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const deck = course ? getDeck(course.id) : null;
  const [choice, setChoice] = useState<Choice>('mix');
  // Cambiar `round` monta un tablero nuevo (mano nueva, reloj en cero).
  const [round, setRound] = useState(0);

  const restart = (next: Choice = choice) => {
    setChoice(next);
    setRound((r) => r + 1);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1.5 text-sm font-bold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft size={16} />
          {t('game.back')}
        </button>

        <h1 className="text-2xl font-extrabold text-ink-950">🎮 {t('game.title')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('game.subtitle')}</p>

        {courses.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink-500">{t('game.course')}</span>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  navigate(`/games/${c.id}`);
                  restart('mix');
                }}
                className={`rounded-full border-2 px-3 py-1 text-sm font-bold transition ${
                  c.id === course?.id ? 'border-brand-500 bg-brand-100 text-brand-700' : 'border-ink-100 bg-white text-ink-500'
                }`}
              >
                {c.flag} {c.language}
              </button>
            ))}
          </div>
        )}

        {!deck || !course ? (
          <p className="mt-10 text-center text-sm text-ink-500">{t('game.noDeck')}</p>
        ) : (
          <>
            <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {(['mix', ...THEMES] as Choice[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => restart(id)}
                  className={`shrink-0 rounded-full border-2 px-3 py-1 text-xs font-extrabold transition ${
                    id === choice ? 'border-violet-500 bg-violet-500/10 text-violet-500' : 'border-ink-100 bg-white text-ink-500'
                  }`}
                >
                  {id === 'mix' ? `🎲 ${t('game.mix')}` : t(`flashcards.theme.${id}`)}
                </button>
              ))}
            </div>
            <Board
              key={`${course.id}-${choice}-${round}`}
              cards={deck.cards}
              choice={choice}
              languageId={course.id}
              onPlayAgain={() => restart()}
            />
          </>
        )}
      </main>
    </div>
  );
}

interface BoardProps {
  cards: Record<Theme, Flashcard[]>;
  choice: Choice;
  languageId: string;
  onPlayAgain: () => void;
}

function Board({ cards, choice, languageId, onPlayAgain }: BoardProps) {
  const { completePractice } = useProgress();
  const { t, lang } = useT();
  const [pairs] = useState(() => dealRound(cards, choice));
  const [left] = useState(() => shuffle(pairs));
  const [right] = useState(() => shuffle(pairs));

  const [matched, setMatched] = useState<number[]>([]);
  const [pickedLeft, setPickedLeft] = useState<number | null>(null);
  const [pickedRight, setPickedRight] = useState<number | null>(null);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ seconds: number; xp: number } | null>(null);

  // Reloj: corre desde el primer toque hasta la última pareja.
  useEffect(() => {
    if (startedAt === null || result) return;
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [startedAt, result]);

  const tryMatch = (l: number, r: number, now: number) => {
    if (l === r) {
      const nextMatched = [...matched, l];
      setMatched(nextMatched);
      setPickedLeft(null);
      setPickedRight(null);
      speak(pairs[l].card.term, languageId);
      if (nextMatched.length === pairs.length) {
        const secs = Math.max(1, Math.round((now - (startedAt ?? now)) / 1000));
        const xp = completePractice({ minutes: secs / 60, xp: xpFor(pairs.length, mistakes, secs) });
        setElapsed(secs);
        setResult({ seconds: secs, xp });
      }
    } else {
      setMistakes((m) => m + 1);
      setWrong([l, r]);
      window.setTimeout(() => {
        setWrong(null);
        setPickedLeft(null);
        setPickedRight(null);
      }, 650);
    }
  };

  const pick = (side: 'left' | 'right', id: number) => {
    if (wrong || matched.includes(id)) return;
    const now = Date.now();
    if (startedAt === null) setStartedAt(now);
    if (side === 'left') {
      setPickedLeft(id);
      if (pickedRight !== null) tryMatch(id, pickedRight, now);
    } else {
      setPickedRight(id);
      if (pickedLeft !== null) tryMatch(pickedLeft, id, now);
    }
  };

  const tileClass = (side: 'left' | 'right', id: number) => {
    const picked = side === 'left' ? pickedLeft === id : pickedRight === id;
    const isWrong = wrong && (side === 'left' ? wrong[0] === id : wrong[1] === id);
    if (matched.includes(id)) return 'border-mint-500/30 bg-mint-500/10 text-mint-500 opacity-60';
    if (isWrong) return 'animate-shake border-coral-500 bg-coral-500/10 text-coral-500';
    if (picked) return 'border-brand-500 bg-brand-100 text-brand-700';
    return 'border-ink-100 bg-white text-ink-900 hover:border-brand-400';
  };

  return (
    <>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-extrabold">
        <span className="text-ink-700">{t('game.pairs', { done: matched.length, total: pairs.length })}</span>
        <span className="flex items-center gap-1 text-coral-500">
          <X size={15} />
          {t('game.mistakes', { n: mistakes })}
        </span>
        <span className="flex items-center gap-1 text-brand-600">
          <Timer size={15} />
          {t('game.time', { s: elapsed })}
        </span>
      </div>

      {result ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-white p-8 text-center">
          <WizardMascot size={110} state="celebrate" />
          <p className="mt-2 flex items-center gap-2 text-xl font-extrabold text-ink-950">
            <Trophy size={20} className="text-amber-500" />
            {t('game.wellDone')}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {t('game.result', { total: pairs.length, s: result.seconds, mistakes })}
          </p>
          <p className="mt-3 flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm font-extrabold text-brand-700">
            <Zap size={14} fill="currentColor" />
            {t('game.xp', { xp: result.xp })}
          </p>
          <button
            type="button"
            onClick={onPlayAgain}
            className="duo-btn mt-6 flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white"
          >
            <RotateCcw size={16} />
            {t('game.playAgain')}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-3">
            {left.map(({ id, card }) => (
              <button
                key={`l-${id}`}
                type="button"
                disabled={matched.includes(id)}
                onClick={() => pick('left', id)}
                className={`flex min-h-16 w-full items-center justify-between gap-2 rounded-2xl border-2 px-3 py-3 text-left text-sm font-extrabold transition ${tileClass('left', id)}`}
              >
                <span>{card.term}</span>
                <Volume2 size={14} className="shrink-0 opacity-40" />
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {right.map(({ id, card }) => (
              <button
                key={`r-${id}`}
                type="button"
                disabled={matched.includes(id)}
                onClick={() => pick('right', id)}
                className={`flex min-h-16 w-full items-center rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ${tileClass('right', id)}`}
              >
                {gloss(card.meaning, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
