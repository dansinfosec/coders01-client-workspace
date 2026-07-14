import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationFormDefaults,
  applicationFormSchema,
  type ApplicationFormValues,
} from "./applicationFormSchema";
import { applicationSteps } from "./applicationFormConfig";
import type { StepDefinition } from "./applicationFormTypes";

const SESSION_KEY = "semenco:application-draft";

function loadDraft(): ApplicationFormValues {
  if (typeof window === "undefined") return applicationFormDefaults;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return applicationFormDefaults;
    const parsed = JSON.parse(raw) as Partial<ApplicationFormValues>;
    // Merge over defaults so any new/renamed fields keep valid types.
    return { ...applicationFormDefaults, ...parsed };
  } catch {
    return applicationFormDefaults;
  }
}

interface StepContextValue {
  steps: StepDefinition[];
  currentIndex: number;
  current: StepDefinition;
  isFirst: boolean;
  isLast: boolean;
  /** True when the last "next" attempt failed validation (drives the error summary). */
  showErrors: boolean;
  goNext: () => Promise<void>;
  goPrev: () => void;
  goToStep: (index: number) => void;
  clearDraft: () => void;
  /** Whether a restorable draft was present on load. */
  hadDraft: boolean;
}

const StepContext = createContext<StepContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated by design
export function useApplicationSteps(): StepContextValue {
  const ctx = useContext(StepContext);
  if (!ctx) throw new Error("useApplicationSteps must be used within ApplicationFormProvider");
  return ctx;
}

interface ApplicationFormProviderProps {
  children: ReactNode;
}

/**
 * Single react-hook-form instance shared across all steps + step navigation.
 * Draft values are persisted to sessionStorage (not localStorage) so an
 * accidental refresh does not lose progress. `shouldUnregister: false` keeps
 * values when a step unmounts.
 */
export function ApplicationFormProvider({ children }: ApplicationFormProviderProps) {
  const initialRef = useRef<ApplicationFormValues>(loadDraft());
  const hadDraftRef = useRef<boolean>(
    typeof window !== "undefined" && !!window.sessionStorage.getItem(SESSION_KEY),
  );

  const methods = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: initialRef.current,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  // Persist every change to sessionStorage. When the form matches the blank
  // defaults (untouched or freshly cleared), remove the key entirely so no
  // empty draft lingers.
  useEffect(() => {
    const defaultsJson = JSON.stringify(applicationFormDefaults);
    const subscription = methods.watch((values) => {
      try {
        const json = JSON.stringify(values);
        if (json === defaultsJson) window.sessionStorage.removeItem(SESSION_KEY);
        else window.sessionStorage.setItem(SESSION_KEY, json);
      } catch {
        /* storage unavailable — ignore */
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const clearDraft = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    methods.reset(applicationFormDefaults);
    setCurrentIndex(0);
    setShowErrors(false);
  }, [methods]);

  const value = useMemo<StepContextValue>(() => {
    const current = applicationSteps[currentIndex];
    if (!current) throw new Error(`Invalid step index: ${currentIndex}`);
    return {
      steps: applicationSteps,
      currentIndex,
      current,
      isFirst: currentIndex === 0,
      isLast: currentIndex === applicationSteps.length - 1,
      showErrors,
      goNext: async () => {
        const valid = await methods.trigger(current.fields, { shouldFocus: true });
        if (valid) {
          setShowErrors(false);
          setCurrentIndex((i) => Math.min(i + 1, applicationSteps.length - 1));
        } else {
          setShowErrors(true);
        }
      },
      goPrev: () => {
        setShowErrors(false);
        setCurrentIndex((i) => Math.max(i - 1, 0));
      },
      goToStep: (index: number) => {
        setShowErrors(false);
        setCurrentIndex(Math.min(Math.max(index, 0), applicationSteps.length - 1));
      },
      clearDraft,
      hadDraft: hadDraftRef.current,
    };
  }, [currentIndex, showErrors, methods, clearDraft]);

  return (
    <FormProvider {...methods}>
      <StepContext.Provider value={value}>{children}</StepContext.Provider>
    </FormProvider>
  );
}
