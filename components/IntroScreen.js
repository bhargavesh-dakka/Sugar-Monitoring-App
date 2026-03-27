import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { IntroOverlay } from './IntroOverlay';
import { NativeIntroFallback } from './NativeIntroFallback';
import { WebIntroScene } from './WebIntroScene';

export function IntroScreen() {
  return (
    <View style={styles.screen}>
      {Platform.OS === 'web' ? (
        <View style={styles.canvasWrap}>
          <WebIntroScene />
        </View>
      ) : (
        <NativeIntroFallback />
      )}

      <IntroOverlay />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#081018',
  },
  canvasWrap: {
    ...StyleSheet.absoluteFillObject,
  },
});
