import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: () => void, interval: number) => {
  // FIX: Initialize useRef with the callback to satisfy the requirement of providing an initial value.
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      // The ref is now guaranteed to have a function, so the check is not needed.
      savedCallback.current();
    };
    if (interval !== null) {
      const id = setInterval(tick, interval);
      return () => clearInterval(id);
    }
  }, [interval]);
};
