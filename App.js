import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { IntroScreen } from './components/IntroScreen';
import { ProfileDashboardScreen } from './components/ProfileDashboardScreen';
import { ProfilesScreen } from './components/ProfilesScreen';
import { useGlucoseLogs } from './hooks/useGlucoseLogs';
import { useIntroState } from './hooks/useIntroState';
import { useProfiles } from './hooks/useProfiles';
import { useWeeklyPushNotifications } from './hooks/useWeeklyPushNotifications';

export default function App() {
  const { showIntro } = useIntroState();
  const { profiles, addProfile, updateProfile, removeProfile, isReady } = useProfiles();
  const { isReady: isLogsReady, addLog, getProfileLogs, removeProfileLogs } = useGlucoseLogs();
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const shouldEnablePush = isReady && profiles.length > 0;

  useWeeklyPushNotifications(shouldEnablePush);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) || null,
    [profiles, selectedProfileId]
  );
  const appBackground = selectedProfile ? '#dcefe6' : '#0b0d12';

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    const { body, documentElement } = document;
    const root = document.getElementById('root');

    const previous = {
      bodyBackground: body.style.backgroundColor,
      bodyMargin: body.style.margin,
      bodyMinHeight: body.style.minHeight,
      htmlBackground: documentElement.style.backgroundColor,
      htmlMinHeight: documentElement.style.minHeight,
      rootBackground: root?.style.backgroundColor ?? '',
      rootMinHeight: root?.style.minHeight ?? '',
      rootWidth: root?.style.width ?? '',
    };

    body.style.backgroundColor = appBackground;
    body.style.margin = '0';
    body.style.minHeight = '100vh';
    documentElement.style.backgroundColor = appBackground;
    documentElement.style.minHeight = '100vh';

    if (root) {
      root.style.backgroundColor = appBackground;
      root.style.minHeight = '100vh';
      root.style.width = '100%';
    }

    return () => {
      body.style.backgroundColor = previous.bodyBackground;
      body.style.margin = previous.bodyMargin;
      body.style.minHeight = previous.bodyMinHeight;
      documentElement.style.backgroundColor = previous.htmlBackground;
      documentElement.style.minHeight = previous.htmlMinHeight;

      if (root) {
        root.style.backgroundColor = previous.rootBackground;
        root.style.minHeight = previous.rootMinHeight;
        root.style.width = previous.rootWidth;
      }
    };
  }, [appBackground]);

  useEffect(() => {
    if (!selectedProfileId) {
      return;
    }

    const stillExists = profiles.some((profile) => profile.id === selectedProfileId);
    if (!stillExists) {
      setSelectedProfileId(null);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showIntro) {
        return true;
      }

      if (selectedProfileId) {
        setSelectedProfileId(null);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [selectedProfileId, showIntro]);

  return (
    <View style={[styles.appShell, { backgroundColor: appBackground }]}>
      <StatusBar
        style={selectedProfile ? 'dark' : 'light'}
        translucent={false}
        backgroundColor={appBackground}
      />
      {showIntro || !isReady || !isLogsReady ? (
        <IntroScreen />
      ) : selectedProfile ? (
        <ProfileDashboardScreen
          profile={selectedProfile}
          logs={getProfileLogs(selectedProfile.id)}
          onUpdateProfile={updateProfile}
          onLogGlucose={(payload) =>
            addLog({
              profileId: selectedProfile.id,
              ...payload,
            })
          }
          onBack={() => setSelectedProfileId(null)}
        />
      ) : (
        <ProfilesScreen
          profiles={profiles}
          onAddProfile={addProfile}
          onRemoveProfile={(profileId) => {
            removeProfile(profileId);
            removeProfileLogs(profileId);
          }}
          onSelectProfile={(profile) => setSelectedProfileId(profile.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#0b0d12',
    width: '100%',
  },
});
