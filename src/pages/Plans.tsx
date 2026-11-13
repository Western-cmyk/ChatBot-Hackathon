import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import WizardMascot from '../components/WizardMascot';
import { STUDENT_PRICE_MXN, usePlan, type PlanId } from '../PlanContext';
import { useT } from '../i18n/I18nContext';

const FREE_FEATURES = ['dailyClass', 'instantCorrection', 'map', 'games', 'pronBasic'];
const STUDENT_FEATURES = ['unlimited', 'instantCorrection', 'report', 'simulations', 'cert', 'pronAll', 'noAds'];

export default function Plans() {
  const navigate = useNavigate();
  const { plan, setPlan } = usePlan();
  const { t } = useT();
  const [justStarted, setJustStarted] = useState(false);

  const choose = (next: PlanId) => {
    setPlan(next);
    setJustStarted(next === 'student');
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1.5 text-sm font-bold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft size={16} />
          {t('plans.back')}
        </button>

        <div className="flex flex-col items-center text-center">
          <WizardMascot size={88} state={plan === 'student' ? 'celebrate' : 'idle'} />
          <h1 className="mt-2 max-w-xl text-2xl font-extrabold text-ink-950 sm:text-3xl">{t('plans.heading')}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-500">{t('plans.subheading')}</p>
        </div>

        {justStarted && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl bg-mint-500/10 px-4 py-3 text-center text-sm font-bold text-mint-500">
            {t('plans.trialStarted')}
          </p>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <PlanCard
            name={t('plans.free')}
            tagline={t('plans.freeTagline')}
            price="MXN 0"
            features={FREE_FEATURES.map((f) => t(`plans.f.${f}`))}
            current={plan === 'free'}
            cta={plan === 'free' ? t('plans.current') : t('plans.backToFree')}
            onChoose={() => choose('free')}
          />
          <PlanCard
            highlight
            name={t('plans.student')}
            tagline={t('plans.studentTagline')}
            price={`MXN ${STUDENT_PRICE_MXN}`}
            per={t('plans.perMonth')}
            badge={t('plans.popular')}
            note={t('plans.studentNote')}
            features={STUDENT_FEATURES.map((f) => t(`plans.f.${f}`))}
            current={plan === 'student'}
            cta={plan === 'student' ? t('plans.current') : t('plans.studentCta')}
            onChoose={() => choose('student')}
          />
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-700">{t('plans.compare')}</p>
        <p className="mx-auto mt-3 max-w-xl text-center text-xs text-ink-300">{t('plans.demoNotice')}</p>
      </main>
    </div>
  );
}

interface PlanCardProps {
  name: string;
  tagline: string;
  price: string;
  per?: string;
  badge?: string;
  note?: string;
  features: string[];
  current: boolean;
  cta: string;
  highlight?: boolean;
  onChoose: () => void;
}

function PlanCard({ name, tagline, price, per, badge, note, features, current, cta, highlight, onChoose }: PlanCardProps) {
  return (
    <section
      className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 ${
        highlight ? 'border-violet-500 shadow-xl shadow-violet-500/10' : 'border-ink-100'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-extrabold text-white">
          <Sparkles size={12} />
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        {highlight && <Crown size={18} className="text-violet-500" />}
        <h2 className="text-lg font-extrabold text-ink-950">{name}</h2>
      </div>
      <p className="text-sm text-ink-500">{tagline}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-ink-950">{price}</span>
        {per && <span className="text-sm font-bold text-ink-500">{per}</span>}
      </p>
      {note && <p className="mt-1 text-xs text-ink-500">{note}</p>}

      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
            <Check size={16} className={`mt-0.5 shrink-0 ${highlight ? 'text-violet-500' : 'text-mint-500'}`} />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={current}
        onClick={onChoose}
        style={{ ['--duo-shadow' as string]: highlight ? 'color-mix(in srgb, var(--color-violet-500) 70%, black)' : 'var(--color-ink-100)' }}
        className={`duo-btn mt-6 w-full rounded-2xl py-3 text-sm font-extrabold uppercase tracking-wide transition disabled:cursor-default ${
          highlight
            ? 'bg-violet-500 text-white hover:bg-violet-500/90 disabled:opacity-70'
            : 'border-2 border-ink-100 bg-white text-ink-700 hover:bg-ink-50 disabled:text-ink-300'
        }`}
      >
        {cta}
      </button>
    </section>
  );
}
