import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IntroOverlay } from './IntroOverlay';
import { NativeIntroFallback } from './NativeIntroFallback';

export function IntroScreen() {
  return (
    <View style={styles.screen}>
      <NativeIntroFallback />
      <IntroOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#081018',
  },
});
