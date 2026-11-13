import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Plan del usuario: Gratis o Estudiante (MXN 99 al mes).
 *
 * Es un prototipo: no hay cobro. "Probar 7 días gratis" solo cambia el plan
 * guardado en este navegador, para poder enseñar en la demo qué desbloquea.
 */
export type PlanId = 'free' | 'student';

export const STUDENT_PRICE_MXN = 99;
/** Mini-lecciones de pronunciación incluidas en el plan Gratis. */
export const FREE_PRONUNCIATION_LESSONS = 3;

const STORAGE_KEY = 'fluenta-plan';

function loadPlan(): PlanId {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'student' ? 'student' : 'free';
  } catch {
    return 'free';
  }
}

interface PlanContextValue {
  plan: PlanId;
  isStudent: boolean;
  setPlan: (plan: PlanId) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<PlanId>(loadPlan);

  const setPlan = (next: PlanId) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sin almacenamiento: el plan vive solo en memoria.
    }
    setPlanState(next);
  };

  return (
    <PlanContext.Provider value={{ plan, isStudent: plan === 'student', setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
