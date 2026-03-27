import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sugar_monitoring_weekly_reminder_by_profile';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isReminderDue(lastReminderAt) {
  if (!lastReminderAt) {
    return true;
  }

  const lastTimestamp = new Date(lastReminderAt).getTime();
  if (Number.isNaN(lastTimestamp)) {
    return true;
  }

  return Date.now() - lastTimestamp >= WEEK_MS;
}

export function useWeeklyReminder(profileId) {
  const [isReminderVisible, setIsReminderVisible] = useState(false);

  const markReminderShown = useCallback(async () => {
    if (!profileId) {
      return;
    }

    try {
      const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = storedValue ? JSON.parse(storedValue) : {};
      const nextMap = parsed && typeof parsed === 'object' ? parsed : {};

      nextMap[profileId] = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap));
    } catch (error) {
      console.warn('Failed to persist weekly reminder timestamp', error);
    }
  }, [profileId]);

  const dismissReminder = useCallback(async () => {
    setIsReminderVisible(false);
    await markReminderShown();
  }, [markReminderShown]);

  useEffect(() => {
    let isMounted = true;

    async function evaluateReminder() {
      if (!profileId) {
        if (isMounted) {
          setIsReminderVisible(false);
        }
        return;
      }

      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = storedValue ? JSON.parse(storedValue) : {};
        const reminderMap = parsed && typeof parsed === 'object' ? parsed : {};
        const lastReminderAt = reminderMap[profileId];

        if (isMounted) {
          setIsReminderVisible(isReminderDue(lastReminderAt));
        }
      } catch (error) {
        console.warn('Failed to evaluate weekly reminder', error);
        if (isMounted) {
          setIsReminderVisible(true);
        }
      }
    }

    evaluateReminder();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  return {
    isReminderVisible,
    dismissReminder,
    markReminderShown,
  };
}
