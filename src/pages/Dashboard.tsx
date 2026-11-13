import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Target, ArrowRight, Crown, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import WeeklyActivity from '../components/WeeklyActivity';
import WizardMascot from '../components/WizardMascot';
import { DAILY_GOAL_MINUTES, minutesToday, useProgress } from '../ProgressContext';
import { STUDENT_PRICE_MXN, usePlan } from '../PlanContext';
import { useProfile } from '../ProfileContext';
import { useT } from '../i18n/I18nContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, courses } = useProfile();
  const { t } = useT();
  const { progress } = useProgress();
  const { isStudent } = usePlan();
  const today = minutesToday(progress);
  const goalPct = Math.min(Math.round((today / DAILY_GOAL_MINUTES) * 100), 100);
  // Pronunciación y certificación están pensadas para el curso de inglés.
  const mainCourse = courses.find((c) => c.id === 'en') ?? courses[0];

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-extrabold text-ink-950">
          {t('dashboard.greeting', { name: profile?.name ?? '' })}
        </h1>
        <p className="mt-1 text-sm text-ink-500">{t('dashboard.subtitle')}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-ink-950">{progress.xp.toLocaleString()} XP</p>
              <p className="text-xs text-ink-500">{t('dashboard.totalPoints')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500/10 text-mint-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-ink-950">
                {t('dashboard.todayMinutes', { done: today, goal: DAILY_GOAL_MINUTES })}
              </p>
              <p className="text-xs text-ink-500">{t('dashboard.dailyGoal', { percent: goalPct })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Target size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-ink-950">
                {t('dashboard.languagesCount', { count: courses.length })}
              </p>
              <p className="text-xs text-ink-500">{t('dashboard.inProgress')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400 p-6 text-white sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <WizardMascot size={72} className="-my-2 shrink-0 drop-shadow" />
            <div>
              <h2 className="font-extrabold">{t('dashboard.tutorCalloutTitle')}</h2>
              <p className="text-sm text-white/80">{t('dashboard.tutorCalloutBody')}</p>
            </div>
          </div>
          {courses[0] && (
            <button
              onClick={() => navigate(`/class/${courses[0].id}/syllabus`)}
              style={{ ['--duo-shadow' as string]: 'var(--color-ink-100)' }}
              className="duo-btn flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand-600 transition hover:bg-white/90"
            >
              {t('dashboard.startClassNow')}
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {mainCourse && (
          <section className="mt-8" aria-labelledby="practice-heading">
            <h2 id="practice-heading" className="mb-3 text-sm font-bold text-ink-950">
              {t('dashboard.practiceHeading')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <PracticeCard
                emoji="🎮"
                color="var(--color-mint-500)"
                title={t('dashboard.gameTitle')}
                body={t('dashboard.gameBody')}
                onClick={() => navigate(`/games/${mainCourse.id}`)}
              />
              <PracticeCard
                emoji="🔊"
                color="var(--color-brand-600)"
                title={t('dashboard.pronTitle')}
                body={t('dashboard.pronBody')}
                onClick={() => navigate('/pronunciation')}
              />
              <PracticeCard
                emoji="🏆"
                color="var(--color-amber-500)"
                title={t('dashboard.certTitle')}
                body={t('dashboard.certBody')}
                onClick={() => navigate(`/class/${mainCourse.id}/syllabus`, { state: { focus: 'cert' } })}
              />
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => navigate('/plans')}
          className={`mt-6 flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
            isStudent
              ? 'border-violet-500/30 bg-violet-500/5'
              : 'border-mint-500/40 bg-mint-500/5 hover:border-mint-500'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isStudent ? 'bg-violet-500/10 text-violet-500' : 'bg-mint-500/10 text-mint-500'
            }`}
          >
            <Crown size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-ink-950">
              {isStudent ? t('dashboard.planStudentTitle') : t('dashboard.planTitle')}
            </p>
            <p className="text-xs text-ink-500">
              {isStudent ? t('dashboard.planStudentBody') : t('dashboard.planBody', { price: STUDENT_PRICE_MXN })}
            </p>
          </div>
          <span className="hidden items-center gap-1 text-sm font-extrabold text-brand-600 sm:flex">
            {t('dashboard.planCta')}
            <ChevronRight size={16} />
          </span>
        </button>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-bold text-ink-950">{t('dashboard.yourCourses')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-ink-950">{t('dashboard.statistics')}</h2>
            <WeeklyActivity />
          </div>
        </div>
      </main>
    </div>
  );
}

interface PracticeCardProps {
  emoji: string;
  color: string;
  title: string;
  body: string;
  onClick: () => void;
}

function PracticeCard({ emoji, color, title, body, onClick }: PracticeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ['--duo-shadow' as string]: 'var(--color-ink-100)' }}
      className="duo-btn group flex flex-col items-start rounded-2xl border-2 border-ink-100 bg-white p-4 text-left transition hover:border-ink-300"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
        style={{ background: `color-mix(in srgb, ${color} 14%, white)` }}
      >
        {emoji}
      </span>
      <span className="mt-3 text-sm font-extrabold text-ink-950">{title}</span>
      <span className="mt-1 text-xs leading-relaxed text-ink-500">{body}</span>
    </button>
  );
}
