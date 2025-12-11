import React, { createContext, ReactNode, useContext, useState } from 'react';

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  remainingSeconds: number;
  setRemainingSeconds: (value: number) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  currentSessionId: number | null;
  setCurrentSessionId: (value: number | null) => void;
  endTime: number | null;
  setEndTime: (value: number | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        setIsRunning,
        remainingSeconds,
        setRemainingSeconds,
        durationMinutes,
        setDurationMinutes,
        currentSessionId,
        setCurrentSessionId,
        endTime,
        setEndTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
