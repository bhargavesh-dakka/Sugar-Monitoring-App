import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IntroOverlay } from './IntroOverlay';
import { WebIntroScene } from './WebIntroScene';

export function IntroScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.canvasWrap}>
        <WebIntroScene />
      </View>

      <IntroOverlay />
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
