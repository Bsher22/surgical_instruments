// useQuizTimer Hook - Stage 6D
import { useEffect, useRef, useCallback } from 'react';
import { useMultipleChoiceQuizStore } from '../stores/multipleChoiceQuizStore';

interface UseQuizTimerOptions {
  onTimeUp?: () => void;
  warningThreshold?: number; // Seconds before time up to trigger warning
  onWarning?: () => void;
}

interface UseQuizTimerReturn {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  formattedTime: string;
  percentageRemaining: number;
  isWarning: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useQuizTimer(options: UseQuizTimerOptions = {}): UseQuizTimerReturn {
  const { onTimeUp, warningThreshold = 10, onWarning } = options;
  
  const {
    timer,
    session,
    setTimerSeconds,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useMultipleChoiceQuizStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningFiredRef = useRef(false);

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate percentage remaining
  const percentageRemaining = session?.config.timerEnabled
    ? (timer.remainingSeconds / session.config.timerSeconds) * 100
    : 100;

  // Check if in warning zone
  const isWarning = timer.remainingSeconds <= warningThreshold && timer.remainingSeconds > 0;

  // Timer countdown effect
  useEffect(() => {
    if (timer.isRunning && timer.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        const newSeconds = timer.remainingSeconds - 1;
        
        if (newSeconds <= 0) {
          setTimerSeconds(0);
          pauseTimer();
          onTimeUp?.();
        } else {
          setTimerSeconds(newSeconds);
          
          // Trigger warning callback once when entering warning zone
          if (newSeconds === warningThreshold && !warningFiredRef.current) {
            warningFiredRef.current = true;
            onWarning?.();
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timer.remainingSeconds, setTimerSeconds, pauseTimer, onTimeUp, onWarning, warningThreshold]);

  // Reset warning flag when timer resets
  useEffect(() => {
    if (timer.remainingSeconds > warningThreshold) {
      warningFiredRef.current = false;
    }
  }, [timer.remainingSeconds, warningThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    remainingSeconds: timer.remainingSeconds,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    formattedTime: formatTime(timer.remainingSeconds),
    percentageRemaining,
    isWarning,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
  };
}
