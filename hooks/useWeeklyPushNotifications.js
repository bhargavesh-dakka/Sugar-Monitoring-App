import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'sugar_monitoring_weekly_push_notification_id';
const CHANNEL_ID = 'weekly-glucose-reminders';

let hasNotificationHandler = false;

function ensureNotificationHandler() {
  if (hasNotificationHandler) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  hasNotificationHandler = true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Weekly Glucose Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#22c55e',
    sound: 'default',
  });
}

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function isStoredScheduleActive(identifier) {
  if (!identifier) {
    return false;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((item) => item.identifier === identifier);
}

async function scheduleWeeklyReminder() {
  const existingIdentifier = await AsyncStorage.getItem(STORAGE_KEY);
  if (await isStoredScheduleActive(existingIdentifier)) {
    return;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly glucose check',
      body: 'Time to check and log your glucose level this week.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 9,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });

  await AsyncStorage.setItem(STORAGE_KEY, notificationId);
}

async function setupWeeklyPushNotifications() {
  ensureNotificationHandler();
  const hasPermission = await ensurePermission();
  if (!hasPermission) {
    return;
  }

  await ensureAndroidChannel();
  await scheduleWeeklyReminder();
}

export function useWeeklyPushNotifications(enabled) {
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') {
      return;
    }

    setupWeeklyPushNotifications().catch((error) => {
      console.warn('Failed to setup weekly push reminder', error);
    });
  }, [enabled]);
}
