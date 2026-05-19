import { useEffect, useRef } from 'react';
import { useActiveWorkoutStore } from '../../../store/activeWorkoutStore';

export function useWorkoutTimer(): void {
  const status = useActiveWorkoutStore((s) => s.status);
  const tickSecond = useActiveWorkoutStore((s) => s.tickSecond);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        tickSecond();
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tickSecond]);
}
