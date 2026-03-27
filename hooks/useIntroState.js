import { useEffect, useState } from 'react';

export function useIntroState(initialValue = true, delayMs = 2600) {
  const [showIntro, setShowIntro] = useState(initialValue);

  const replayIntro = () => setShowIntro(true);

  useEffect(() => {
    if (!showIntro) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      setShowIntro(false);
    }, delayMs);

    return () => clearTimeout(timerId);
  }, [delayMs, showIntro]);

  return {
    showIntro,
    replayIntro,
  };
}
