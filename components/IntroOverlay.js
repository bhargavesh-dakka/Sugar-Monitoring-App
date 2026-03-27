import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export function IntroOverlay() {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Sugar Monitoring App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: 'rgba(8, 16, 24, 0.18)',
  },
  logoWrap: {
    width: 124,
    height: 124,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 16, 12, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.25)',
    marginBottom: 18,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 44,
    maxWidth: 420,
    textAlign: 'center',
    marginBottom: 100,
  },
});
