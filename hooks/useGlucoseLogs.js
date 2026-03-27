import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sugar_monitoring_glucose_logs';

export function useGlucoseLogs() {
  const [logsByProfile, setLogsByProfile] = useState({});
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (storedValue) {
          const parsed = JSON.parse(storedValue);

          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setLogsByProfile(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load local glucose logs', error);
      } finally {
        if (isMounted) {
          hasHydrated.current = true;
          setIsReady(true);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logsByProfile)).catch((error) => {
      console.warn('Failed to persist local glucose logs', error);
    });
  }, [logsByProfile]);

  const addLog = ({ profileId, value, mealTag, takenAt }) => {
    setLogsByProfile((current) => {
      const currentLogs = current[profileId] || [];

      return {
        ...current,
        [profileId]: [
          ...currentLogs,
          {
            id: `gl-${Date.now()}-${Math.round(Math.random() * 100000)}`,
            value,
            mealTag,
            takenAt,
          },
        ],
      };
    });
  };

  const getProfileLogs = (profileId) => logsByProfile[profileId] || [];

  const removeProfileLogs = (profileId) => {
    setLogsByProfile((current) => {
      if (!Object.prototype.hasOwnProperty.call(current, profileId)) {
        return current;
      }

      const next = { ...current };
      delete next[profileId];
      return next;
    });
  };

  return {
    isReady,
    addLog,
    getProfileLogs,
    removeProfileLogs,
  };
}
